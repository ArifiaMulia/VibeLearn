/**
 * Server-side token revocation (logout hardening).
 * A logged-out JWT is remembered (sha256 hash only) until it would have expired anyway,
 * so a stolen/copied token cannot be replayed after the user signs out.
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const revoked = new Map(); // hash -> expiresAtMs
let ready = false;

const hash = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        token_hash VARCHAR(64) PRIMARY KEY,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    await pool.query('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
    const rows = await pool.query('SELECT token_hash, expires_at FROM revoked_tokens');
    rows.rows.forEach(r => revoked.set(r.token_hash, new Date(r.expires_at).getTime()));
    ready = true;
  } catch (err) {
    console.warn('tokenRevocation init warning:', err.message);
  }
}

function isRevoked(token) {
  const exp = revoked.get(hash(token));
  if (!exp) return false;
  if (exp < Date.now()) { revoked.delete(hash(token)); return false; }
  return true;
}

async function revoke(token) {
  if (!token) return;
  let expMs = Date.now() + 24 * 60 * 60 * 1000;
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) expMs = decoded.exp * 1000;
  } catch { /* noop */ }
  const h = hash(token);
  revoked.set(h, expMs);
  try {
    await pool.query(
      'INSERT INTO revoked_tokens (token_hash, expires_at) VALUES ($1, to_timestamp($2)) ON CONFLICT (token_hash) DO NOTHING',
      [h, expMs / 1000]
    );
  } catch (err) {
    console.warn('tokenRevocation persist warning:', err.message);
  }
}

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [h, exp] of revoked) if (exp < now) revoked.delete(h);
  if (ready) pool.query('DELETE FROM revoked_tokens WHERE expires_at < NOW()').catch(() => {});
}, 60 * 60 * 1000).unref();

module.exports = { init, isRevoked, revoke };
