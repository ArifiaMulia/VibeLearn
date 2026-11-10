/**
 * Access policy: "public" (everyone may sign in / register) vs "closed" (closed-loop:
 * only Prasetia Lark accounts). Stored in system_settings.access_mode.
 */
const pool = require('../db');

const DEFAULT_DOMAINS = (process.env.CLOSED_LOOP_DOMAINS || 'prasetia.co.id')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

let cache = { mode: 'public', at: 0 };

async function getAccessMode() {
  if (Date.now() - cache.at < 5000) return cache.mode;
  try {
    const r = await pool.query("SELECT value FROM system_settings WHERE key = 'access_mode'");
    cache = { mode: r.rows[0]?.value === 'closed' ? 'closed' : 'public', at: Date.now() };
  } catch {
    // On DB failure keep last known mode (do not silently open a closed system)
    cache.at = Date.now() - 4000;
  }
  return cache.mode;
}

function invalidate() { cache.at = 0; }

function isAllowedClosedLoopEmail(email) {
  const e = String(email || '').toLowerCase().trim();
  const at = e.lastIndexOf('@');
  if (at < 1) return false;
  const domain = e.slice(at + 1);
  return DEFAULT_DOMAINS.includes(domain);
}

module.exports = { getAccessMode, invalidate, isAllowedClosedLoopEmail, DEFAULT_DOMAINS };
