/**
 * Zero-Trust Enterprise Security Governance Module (modeled after secure.virtuenet.space)
 * Covers:
 *   1. User & Access Control (Zero-Trust RBAC, Lark identity, allowed_modules, status)
 *   2. 2FA Authenticator (RFC 6238 TOTP & per-user Google Authenticator enrollment)
 *   3. Global User History & Security Audit Trail (security_audit_logs)
 *   4. Break-Glass Emergency Access Vault (Independent of Lark Suite + single-use SECURE-XXXX recovery keys)
 *   5. Session Governance & Idle Auto-Logout (5m, 10m, 30m, 1h, 6h, 12h)
 *   6. Device Management (user_sessions with UA parser, IP geolocation, active/idle durations, remote logout)
 *   7. Agent Access Token (Asisten AI — ssagt_ prefix, SHA-256 hashed, live 2FA re-auth required)
 */

const crypto = require('crypto');
const pool = require('../db');
const { generateQrDataUrl } = require('./qrSvg');

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const LOCKOUT_MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ISSUER_NAME = 'Promptara';
const PRIMARY_OWNER_EMAIL = (process.env.PRIMARY_OWNER_EMAIL || 'ubai@prasetia.co.id').toLowerCase().trim();
const SECONDARY_OWNER_EMAIL = 'arifia.mulia@prasetia.co.id';

const TOKEN_PREFIX = 'ssagt_';
const DEFAULT_AGENT_TTL_MS = 30 * 60 * 1000;
const MAX_AGENT_TTL_MS = 4 * 60 * 60 * 1000; // 240 mins
const MIN_AGENT_TTL_MS = 5 * 60 * 1000;

const SESSION_TIMEOUT_MS_MAP = {
  '5m': 5 * 60 * 1000,
  '10m': 10 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
};

// Anti-replay map for TOTP codes: subjectKey -> lastAcceptedStep
const usedTotpSteps = new Map();
// IP Geolocation cache
const ipGeoCache = new Map();

let initialized = false;

// ─── 1. RFC 4648 BASE32 & RFC 6238 TOTP ──────────────────────────────────────

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(str) {
  const cleaned = String(str || '').replace(/[^A-Z2-7]/gi, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const output = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function generateTOTPSecret() {
  return base32Encode(crypto.randomBytes(20));
}

function generateTOTP(base32Secret, timeStepOffset = 0) {
  const key = base32Decode(base32Secret);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30) + timeStepOffset;

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(Math.floor(timeStep / 0x100000000), 0);
  timeBuffer.writeUInt32BE(timeStep & 0xffffffff, 4);

  const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 1000000).toString().padStart(6, '0');
}

function verifyTOTPWithStep(base32Secret, userToken, window = 2, subjectKey = null) {
  if (!userToken || !base32Secret) return { ok: false };
  const cleanedToken = String(userToken).replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanedToken)) return { ok: false };

  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let offset = -window; offset <= window; offset++) {
    const expected = generateTOTP(base32Secret, offset);
    if (
      cleanedToken.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(cleanedToken), Buffer.from(expected))
    ) {
      const matchedStep = currentStep + offset;
      if (subjectKey) {
        const prevStep = usedTotpSteps.get(subjectKey);
        if (typeof prevStep === 'number' && matchedStep <= prevStep) {
          return { ok: false, replayed: true };
        }
        usedTotpSteps.set(subjectKey, matchedStep);
      }
      return { ok: true, step: matchedStep };
    }
  }
  return { ok: false };
}

function generateRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    codes.push(`SECURE-${part1}-${part2}-${part3}`);
  }
  return codes;
}

function hashCode(code) {
  return crypto
    .createHash('sha256')
    .update(String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .digest('hex');
}

function buildOtpAuthUri(accountLabel, secret) {
  return `otpauth://totp/${encodeURIComponent(ISSUER_NAME)}:${encodeURIComponent(accountLabel)}?secret=${secret}&issuer=${encodeURIComponent(ISSUER_NAME)}&algorithm=SHA1&digits=6&period=30`;
}

// ─── 2. DATABASE SCHEMA INITIALIZATION ───────────────────────────────────────

async function initSecurityTables() {
  if (initialized) return;
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_modules JSONB DEFAULT '["courses","labs","news","leaderboard","profile"]'::jsonb;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS lark_open_id VARCHAR(120);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_pending_secret TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enrolled_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_recovery_codes JSONB DEFAULT '[]'::jsonb;

      CREATE TABLE IF NOT EXISTS break_glass_vault (
        id INTEGER PRIMARY KEY DEFAULT 1,
        totp_secret TEXT NOT NULL,
        recovery_codes JSONB DEFAULT '[]'::jsonb,
        initial_plain_codes JSONB DEFAULT '[]'::jsonb,
        failed_attempts INTEGER DEFAULT 0,
        locked_until BIGINT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(80),
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        action VARCHAR(120) NOT NULL,
        module VARCHAR(80) NOT NULL DEFAULT 'AUTH',
        details TEXT,
        ip VARCHAR(80),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(80) PRIMARY KEY,
        user_id INTEGER,
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        device_name VARCHAR(120),
        os VARCHAR(120),
        browser VARCHAR(120),
        ip VARCHAR(80),
        location VARCHAR(180),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        revoked_at TIMESTAMP WITH TIME ZONE,
        revoked_by VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS access_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        module VARCHAR(100) NOT NULL,
        reason TEXT,
        status VARCHAR(30) DEFAULT 'pending',
        reviewed_by VARCHAR(255),
        review_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS agent_tokens (
        id VARCHAR(60) PRIMARY KEY,
        token_hash VARCHAR(128) UNIQUE NOT NULL,
        created_by VARCHAR(255),
        scope VARCHAR(120) DEFAULT 'readonly-assistant',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        last_used_at TIMESTAMP WITH TIME ZONE,
        revoked_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // Ensure super_admin accounts have full allowed_modules
    await pool.query(`
      UPDATE users
      SET allowed_modules = '["dashboard","courses","labs","news","leaderboard","profile","users","analytics","subscriptions","course_builder","certificates","ai_settings"]'::jsonb
      WHERE role = 'super_admin' AND (allowed_modules IS NULL OR allowed_modules = '["courses","labs","news","leaderboard","profile"]'::jsonb);
    `).catch(() => {});

    // Ensure Break-Glass Vault row exists
    const vaultRes = await pool.query('SELECT * FROM break_glass_vault WHERE id = 1');
    if (vaultRes.rows.length === 0) {
      const secret = process.env.BREAK_GLASS_TOTP_SECRET || generateTOTPSecret();
      const plainCodes = generateRecoveryCodes(8);
      const hashedCodes = plainCodes.map(c => ({
        hash: hashCode(c),
        hint: `${c.slice(0, 11)}-****-****`,
        used: false,
        usedAt: null,
      }));
      await pool.query(
        `INSERT INTO break_glass_vault (id, totp_secret, recovery_codes, initial_plain_codes, failed_attempts, locked_until)
         VALUES (1, $1, $2::jsonb, $3::jsonb, 0, NULL)
         ON CONFLICT (id) DO NOTHING`,
        [secret, JSON.stringify(hashedCodes), JSON.stringify(plainCodes)]
      );
    }

    // Ensure session_idle_timeout exists in system_settings (default 30m)
    await pool.query(
      `INSERT INTO system_settings (key, value) VALUES ('session_idle_timeout', '30m') ON CONFLICT (key) DO NOTHING`
    ).catch(() => {});

    initialized = true;
  } catch (err) {
    console.warn('[securityGovernance] initSecurityTables warning:', err.message);
  }
}

// ─── 3. GLOBAL AUDIT TRAIL ───────────────────────────────────────────────────

async function recordAuditLog({ userId = null, userEmail = 'system', userName = 'System', action, module = 'AUTH', details = '', ip = 'unknown' }) {
  try {
    await initSecurityTables();
    await pool.query(
      `INSERT INTO security_audit_logs (user_id, user_email, user_name, action, module, details, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId ? String(userId) : null,
        String(userEmail || 'unknown'),
        String(userName || userEmail || 'Unknown'),
        String(action || 'EVENT'),
        String(module || 'SYSTEM'),
        typeof details === 'string' ? details : JSON.stringify(details),
        String(ip || 'unknown'),
      ]
    );
  } catch (err) {
    console.warn('[securityGovernance] recordAuditLog error:', err.message);
  }
}

async function listAuditLogs({ limit = 150, moduleFilter = '', search = '' } = {}) {
  await initSecurityTables();
  const clauses = [];
  const params = [];
  let idx = 1;

  if (moduleFilter && moduleFilter !== 'ALL') {
    clauses.push(`UPPER(module) = UPPER($${idx++})`);
    params.push(moduleFilter);
  }
  if (search && search.trim()) {
    clauses.push(`(LOWER(COALESCE(user_email,'')) LIKE $${idx} OR LOWER(COALESCE(user_name,'')) LIKE $${idx} OR LOWER(COALESCE(action,'')) LIKE $${idx} OR LOWER(COALESCE(details,'')) LIKE $${idx} OR LOWER(COALESCE(ip,'')) LIKE $${idx})`);
    params.push(`%${search.trim().toLowerCase()}%`);
    idx++;
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(Math.min(Math.max(Number(limit) || 100, 10), 500));

  const res = await pool.query(
    `SELECT id, user_id, user_email, user_name, action, module, details, ip, created_at
     FROM security_audit_logs
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${idx}`,
    params
  );

  return res.rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    userEmail: r.user_email,
    userName: r.user_name,
    action: r.action,
    module: r.module,
    details: r.details,
    ip: r.ip,
    timestamp: r.created_at,
  }));
}

// ─── 4. BREAK-GLASS EMERGENCY ACCESS VAULT & PER-USER 2FA ───────────────────

async function getBreakGlassSetupDetails(regenerate = false) {
  await initSecurityTables();
  let vaultRes = await pool.query('SELECT * FROM break_glass_vault WHERE id = 1');
  let vault = vaultRes.rows[0];
  let plainRecoveryCodes = null;

  if (regenerate || !vault) {
    const newSecret = generateTOTPSecret();
    const newPlain = generateRecoveryCodes(8);
    const newHashed = newPlain.map(c => ({
      hash: hashCode(c),
      hint: `${c.slice(0, 11)}-****-****`,
      used: false,
      usedAt: null,
    }));
    const upRes = await pool.query(
      `INSERT INTO break_glass_vault (id, totp_secret, recovery_codes, initial_plain_codes, failed_attempts, locked_until, updated_at)
       VALUES (1, $1, $2::jsonb, $3::jsonb, 0, NULL, NOW())
       ON CONFLICT (id) DO UPDATE SET
         totp_secret = EXCLUDED.totp_secret,
         recovery_codes = EXCLUDED.recovery_codes,
         initial_plain_codes = EXCLUDED.initial_plain_codes,
         failed_attempts = 0,
         locked_until = NULL,
         updated_at = NOW()
       RETURNING *`,
      [newSecret, JSON.stringify(newHashed), JSON.stringify(newPlain)]
    );
    vault = upRes.rows[0];
    plainRecoveryCodes = newPlain;
  } else if (Array.isArray(vault.initial_plain_codes) && vault.initial_plain_codes.length > 0) {
    plainRecoveryCodes = vault.initial_plain_codes;
  }

  const secret = vault.totp_secret;
  const otpAuthUri = buildOtpAuthUri(`Emergency-Admin (${PRIMARY_OWNER_EMAIL})`, secret);
  const qrCodeDataUrl = generateQrDataUrl(otpAuthUri, 240);
  const codesList = Array.isArray(vault.recovery_codes) ? vault.recovery_codes : [];
  const unusedCount = codesList.filter(c => !c.used).length;
  const maskedSecret =
    secret && secret.length > 8
      ? `${secret.slice(0, 4)}${'•'.repeat(Math.max(4, secret.length - 8))}${secret.slice(-4)}`
      : '••••••••';

  return {
    totpSecret: secret,
    maskedTotpSecret: maskedSecret,
    otpAuthUri,
    qrCodeDataUrl,
    recoveryCodes: plainRecoveryCodes,
    recoveryCodeHints: codesList.map(c => ({ hint: c.hint || 'SECURE-****-****', used: Boolean(c.used), usedAt: c.usedAt })),
    recoveryCodesAvailable: unusedCount,
    regenerated: Boolean(regenerate),
  };
}

async function beginUserEnrollment(userId) {
  await initSecurityTables();
  const uRes = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
  if (!uRes.rows.length) throw new Error('User tidak ditemukan');
  const user = uRes.rows[0];

  const secret = generateTOTPSecret();
  await pool.query(
    'UPDATE users SET totp_pending_secret = $1 WHERE id = $2',
    [secret, user.id]
  );

  const label = user.email || user.name || `user-${user.id}`;
  const otpAuthUri = buildOtpAuthUri(label, secret);
  const qrCodeDataUrl = generateQrDataUrl(otpAuthUri, 240);

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    secret,
    otpAuthUri,
    qrCodeDataUrl,
  };
}

async function confirmUserEnrollment(userId, totpCode) {
  await initSecurityTables();
  const uRes = await pool.query('SELECT id, name, email, totp_pending_secret FROM users WHERE id = $1', [userId]);
  if (!uRes.rows.length) return { success: false, error: 'User tidak ditemukan' };
  const user = uRes.rows[0];

  if (!user.totp_pending_secret) {
    return { success: false, error: 'Tidak ada proses pendaftaran 2FA yang aktif. Klik Daftar 2FA terlebih dahulu.' };
  }

  const check = verifyTOTPWithStep(user.totp_pending_secret, totpCode, 2, `enroll:${user.id}`);
  if (!check.ok) {
    return { success: false, error: 'Kode Google Authenticator 6 digit tidak valid. Pastikan jam HP sinkron.' };
  }

  const plainRecoveryCodes = generateRecoveryCodes(8);
  const hashedCodes = plainRecoveryCodes.map(c => ({
    hash: hashCode(c),
    hint: `${c.slice(0, 11)}-****-****`,
    used: false,
    usedAt: null,
  }));

  await pool.query(
    `UPDATE users SET
       totp_secret = $1,
       totp_pending_secret = NULL,
       totp_enabled = TRUE,
       totp_enrolled_at = NOW(),
       totp_recovery_codes = $2::jsonb
     WHERE id = $3`,
    [user.totp_pending_secret, JSON.stringify(hashedCodes), user.id]
  );

  return {
    success: true,
    userId: user.id,
    email: user.email,
    name: user.name,
    recoveryCodes: plainRecoveryCodes,
  };
}

async function revokeUserEnrollment(userId) {
  await initSecurityTables();
  const uRes = await pool.query(
    `UPDATE users SET
       totp_enabled = FALSE,
       totp_secret = NULL,
       totp_pending_secret = NULL,
       totp_enrolled_at = NULL,
       totp_recovery_codes = '[]'::jsonb
     WHERE id = $1
     RETURNING id, name, email`,
    [userId]
  );
  if (!uRes.rows.length) return { success: false, error: 'User tidak ditemukan' };
  return { success: true, user: uRes.rows[0] };
}

/**
 * Verifies Break-Glass Emergency Access (Ctrl+Shift+M on LoginPage).
 * Checks:
 *  1. Lockout state (5 failed attempts -> 15 minute lockout)
 *  2. Any enrolled user's TOTP secret or single-use recovery code
 *  3. Break-Glass Vault TOTP secret or single-use recovery code (resolves to Super Admin)
 */
async function verifyBreakGlassAccess(inputCode) {
  await initSecurityTables();
  const vaultRes = await pool.query('SELECT * FROM break_glass_vault WHERE id = 1');
  const vault = vaultRes.rows[0];

  if (vault && vault.locked_until && Date.now() < Number(vault.locked_until)) {
    const remainingMin = Math.ceil((Number(vault.locked_until) - Date.now()) / 60000);
    return {
      success: false,
      error: `Break-Glass Vault terkunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${remainingMin} menit.`,
    };
  }

  const cleaned = String(inputCode || '').trim();
  if (!cleaned) {
    return { success: false, error: 'Masukkan kode Google Authenticator 6 digit atau Recovery Key.' };
  }

  // 1. Check enrolled users first (TOTP or per-user recovery code)
  const enrolledUsers = await pool.query(
    `SELECT * FROM users WHERE totp_enabled = TRUE AND totp_secret IS NOT NULL AND COALESCE(status, 'active') = 'active' ORDER BY id ASC`
  );

  for (const u of enrolledUsers.rows) {
    const totpCheck = verifyTOTPWithStep(u.totp_secret, cleaned, 2, `user:${u.id}`);
    if (totpCheck.ok) {
      await pool.query('UPDATE break_glass_vault SET failed_attempts = 0, locked_until = NULL WHERE id = 1');
      return { success: true, method: 'TOTP_2FA_USER', user: u };
    }

    const userCodes = Array.isArray(u.totp_recovery_codes) ? u.totp_recovery_codes : [];
    const candidateHash = hashCode(cleaned);
    const matchIdx = userCodes.findIndex(rc => !rc.used && rc.hash === candidateHash);
    if (matchIdx !== -1) {
      userCodes[matchIdx].used = true;
      userCodes[matchIdx].usedAt = new Date().toISOString();
      await pool.query('UPDATE users SET totp_recovery_codes = $1::jsonb WHERE id = $2', [JSON.stringify(userCodes), u.id]);
      await pool.query('UPDATE break_glass_vault SET failed_attempts = 0, locked_until = NULL WHERE id = 1');
      return {
        success: true,
        method: 'RECOVERY_CODE_USER',
        user: u,
        remainingCodes: userCodes.filter(c => !c.used).length,
      };
    }
  }

  // 2. Check Master Break-Glass Vault (independent of Lark Suite)
  if (vault) {
    const vaultTotp = verifyTOTPWithStep(vault.totp_secret, cleaned, 2, 'vault:master');
    if (vaultTotp.ok) {
      await pool.query('UPDATE break_glass_vault SET failed_attempts = 0, locked_until = NULL WHERE id = 1');
      const ownerUser = await resolvePrimaryOwnerUser();
      return { success: true, method: 'TOTP_2FA_VAULT', user: ownerUser };
    }

    const vaultCodes = Array.isArray(vault.recovery_codes) ? vault.recovery_codes : [];
    const candidateHash = hashCode(cleaned);
    const matchIdx = vaultCodes.findIndex(rc => !rc.used && rc.hash === candidateHash);
    if (matchIdx !== -1) {
      vaultCodes[matchIdx].used = true;
      vaultCodes[matchIdx].usedAt = new Date().toISOString();
      // Also remove used code from initial_plain_codes if still present
      let plainCodes = Array.isArray(vault.initial_plain_codes) ? vault.initial_plain_codes : [];
      plainCodes = plainCodes.filter(pc => hashCode(pc) !== candidateHash);
      await pool.query(
        'UPDATE break_glass_vault SET recovery_codes = $1::jsonb, initial_plain_codes = $2::jsonb, failed_attempts = 0, locked_until = NULL WHERE id = 1',
        [JSON.stringify(vaultCodes), JSON.stringify(plainCodes)]
      );
      const ownerUser = await resolvePrimaryOwnerUser();
      return {
        success: true,
        method: 'RECOVERY_CODE_VAULT',
        user: ownerUser,
        remainingCodes: vaultCodes.filter(c => !c.used).length,
      };
    }
  }

  // Record failed attempt
  const attempts = (vault ? Number(vault.failed_attempts || 0) : 0) + 1;
  let lockedUntil = null;
  if (attempts >= LOCKOUT_MAX_ATTEMPTS) {
    lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  await pool.query(
    'UPDATE break_glass_vault SET failed_attempts = $1, locked_until = $2 WHERE id = 1',
    [attempts, lockedUntil]
  );

  return {
    success: false,
    error: lockedUntil
      ? 'Terlalu banyak percobaan gagal (5x). Break-Glass Vault dikunci selama 15 menit.'
      : `Kode 2FA atau Recovery Key tidak valid. Sisa percobaan: ${Math.max(0, LOCKOUT_MAX_ATTEMPTS - attempts)}.`,
  };
}

async function resolvePrimaryOwnerUser() {
  // Prefer arifia.mulia@prasetia.co.id or ubai@prasetia.co.id or any super_admin
  const res = await pool.query(
    `SELECT * FROM users
     WHERE LOWER(email) IN ($1, $2, 'admin@vibelearn.id') OR role = 'super_admin'
     ORDER BY CASE
       WHEN LOWER(email) = $1 THEN 0
       WHEN LOWER(email) = $2 THEN 1
       WHEN role = 'super_admin' THEN 2
       ELSE 3
     END, id ASC
     LIMIT 1`,
    [SECONDARY_OWNER_EMAIL, PRIMARY_OWNER_EMAIL]
  );
  return res.rows[0] || null;
}

/**
 * Verifies a live 6-digit TOTP code for privileged re-authentication (e.g. issuing an Agent Access Token).
 * Accepts either the user's enrolled 2FA secret OR the Master Break-Glass Vault TOTP secret.
 */
async function verifyUserReauthCode(user, code) {
  await initSecurityTables();
  const cleaned = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleaned)) {
    return { ok: false, error: 'Masukkan kode Google Authenticator 6 digit yang valid.' };
  }

  if (user?.id) {
    const uRes = await pool.query('SELECT id, totp_enabled, totp_secret FROM users WHERE id = $1', [user.id]);
    const dbUser = uRes.rows[0];
    if (dbUser && dbUser.totp_enabled && dbUser.totp_secret) {
      const check = verifyTOTPWithStep(dbUser.totp_secret, cleaned, 1, `reauth:user:${dbUser.id}`);
      if (check.ok) return { ok: true, method: 'USER_TOTP' };
      if (check.replayed) return { ok: false, error: 'Kode 6 digit tersebut baru saja dipakai. Tunggu kode 30 detik berikutnya.' };
    }
  }

  // Also check Master Break-Glass Vault TOTP for Super Admin
  if (user?.role === 'super_admin') {
    const vaultRes = await pool.query('SELECT totp_secret FROM break_glass_vault WHERE id = 1');
    const vaultSecret = vaultRes.rows[0]?.totp_secret;
    if (vaultSecret) {
      const vCheck = verifyTOTPWithStep(vaultSecret, cleaned, 1, `reauth:vault:${user.id || 'owner'}`);
      if (vCheck.ok) return { ok: true, method: 'VAULT_TOTP' };
      if (vCheck.replayed) return { ok: false, error: 'Kode 6 digit tersebut baru saja dipakai. Tunggu kode 30 detik berikutnya.' };
    }
  }

  return {
    ok: false,
    error: 'Kode Google Authenticator 6 digit tidak sesuai. Pastikan menggunakan kode dari profil 2FA Anda atau Break-Glass Vault.',
  };
}

// ─── 5. SESSION GOVERNANCE & IDLE AUTO-LOGOUT ────────────────────────────────

async function getSessionConfig() {
  await initSecurityTables();
  const r = await pool.query("SELECT value FROM system_settings WHERE key = 'session_idle_timeout'");
  const raw = r.rows[0]?.value || '30m';
  const sessionIdleTimeout = SESSION_TIMEOUT_MS_MAP[raw] ? raw : '30m';
  return {
    sessionIdleTimeout,
    timeoutMs: SESSION_TIMEOUT_MS_MAP[sessionIdleTimeout] || 30 * 60 * 1000,
  };
}

async function setSessionConfig(sessionIdleTimeout) {
  await initSecurityTables();
  if (!SESSION_TIMEOUT_MS_MAP[sessionIdleTimeout]) {
    throw new Error('Pilihan durasi idle timeout tidak valid.');
  }
  await pool.query(
    `INSERT INTO system_settings (key, value) VALUES ('session_idle_timeout', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [sessionIdleTimeout]
  );
  return {
    sessionIdleTimeout,
    timeoutMs: SESSION_TIMEOUT_MS_MAP[sessionIdleTimeout],
  };
}

// ─── 6. DEVICE MANAGEMENT & SESSION TRACKING ─────────────────────────────────

function parseUserAgent(ua = '') {
  const s = String(ua || '');
  let os = 'Workstation OS';
  let deviceName = 'Desktop Workstation';

  if (/Windows NT 10\.0/i.test(s)) {
    os = 'Windows 10/11';
    deviceName = 'Windows Workstation';
  } else if (/Windows NT/i.test(s)) {
    os = 'Windows';
    deviceName = 'Windows PC';
  } else if (/Android/i.test(s)) {
    const verMatch = s.match(/Android\s+([0-9.]+)/i);
    const modelMatch = s.match(/;\s*([^;)]+?)\s+Build\//i);
    os = verMatch ? `Android ${verMatch[1]}` : 'Android';
    deviceName = modelMatch ? `Android (${modelMatch[1].trim()})` : 'Android Mobile Device';
  } else if (/iPhone|iPad|iPod/i.test(s)) {
    os = 'iOS / iPadOS';
    deviceName = /iPad/i.test(s) ? 'Apple iPad' : 'Apple iPhone';
  } else if (/Mac OS X/i.test(s)) {
    os = 'macOS';
    deviceName = 'Apple Mac Workstation';
  } else if (/Linux/i.test(s)) {
    os = 'Linux';
    deviceName = 'Linux Workstation';
  }

  let browser = 'Web Browser';
  if (/Edg\/([0-9.]+)/i.test(s)) {
    browser = `Microsoft Edge (${RegExp.$1.split('.')[0]})`;
  } else if (/OPR\/([0-9.]+)/i.test(s)) {
    browser = `Opera (${RegExp.$1.split('.')[0]})`;
  } else if (/Chrome\/([0-9.]+)/i.test(s)) {
    browser = `Google Chrome (${RegExp.$1.split('.')[0]})`;
  } else if (/Firefox\/([0-9.]+)/i.test(s)) {
    browser = `Mozilla Firefox (${RegExp.$1.split('.')[0]})`;
  } else if (/Version\/([0-9.]+).*Safari/i.test(s)) {
    browser = `Apple Safari (${RegExp.$1.split('.')[0]})`;
  }

  return { deviceName, os, browser };
}

function extractClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  const xff = req.headers['x-forwarded-for'];
  const raw = cfIp || (xff ? String(xff).split(',')[0].trim() : '') || req.ip || '127.0.0.1';
  return String(raw).replace(/^::ffff:/, '');
}

async function resolveDeviceLocation(ip, req = null) {
  if (req) {
    const cfCity = req.headers['cf-ipcity'];
    const cfCountry = req.headers['cf-ipcountry'];
    if (cfCity || cfCountry) {
      return [cfCity, cfCountry].filter(Boolean).join(', ');
    }
  }
  const cleanIp = String(ip || '').replace(/^::ffff:/, '').trim();
  if (
    !cleanIp ||
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(cleanIp)
  ) {
    return 'Jakarta, Indonesia (Internal Network)';
  }
  if (ipGeoCache.has(cleanIp)) return ipGeoCache.get(cleanIp);
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(cleanIp)}?fields=status,city,country`, {
      signal: AbortSignal.timeout(2200),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.status === 'success' && (data.city || data.country)) {
        const loc = [data.city, data.country].filter(Boolean).join(', ');
        ipGeoCache.set(cleanIp, loc);
        return loc;
      }
    }
  } catch { /* fallback below */ }
  const fallback = 'Jakarta, Indonesia';
  ipGeoCache.set(cleanIp, fallback);
  return fallback;
}

function formatDurationHuman(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin > 0 ? `${hr}h ${remMin}m` : `${hr}h`;
}

async function createOrUpdateDeviceSession(req, user, existingSessionId = null) {
  await initSecurityTables();
  const ua = req.headers['user-agent'] || '';
  const { deviceName, os, browser } = parseUserAgent(ua);
  const ip = extractClientIp(req);
  const location = await resolveDeviceLocation(ip, req);
  const sessionId = existingSessionId || `sess_${crypto.randomBytes(12).toString('hex')}`;

  await pool.query(
    `INSERT INTO user_sessions (id, user_id, user_email, user_name, device_name, os, browser, ip, location, user_agent, created_at, last_active_at, revoked_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NULL)
     ON CONFLICT (id) DO UPDATE SET
       last_active_at = NOW(),
       ip = EXCLUDED.ip,
       location = EXCLUDED.location`,
    [sessionId, user.id, user.email, user.name, deviceName, os, browser, ip, location, ua]
  );

  return { sessionId, deviceName, os, browser, ip, location };
}

async function touchDeviceSession(sessionId, userId = null) {
  if (!sessionId) return;
  try {
    await initSecurityTables();
    await pool.query(
      'UPDATE user_sessions SET last_active_at = NOW() WHERE id = $1 AND revoked_at IS NULL',
      [sessionId]
    );
  } catch {}
}

async function isSessionRevoked(sessionId) {
  if (!sessionId) return false;
  try {
    await initSecurityTables();
    const res = await pool.query('SELECT revoked_at FROM user_sessions WHERE id = $1', [sessionId]);
    if (res.rows.length > 0 && res.rows[0].revoked_at) return true;
  } catch {}
  return false;
}

async function listDeviceSessions(currentUser, currentSessionId = null) {
  await initSecurityTables();
  const isSuper = currentUser?.role === 'super_admin';
  const res = isSuper
    ? await pool.query(
        `SELECT * FROM user_sessions WHERE revoked_at IS NULL ORDER BY last_active_at DESC LIMIT 100`
      )
    : await pool.query(
        `SELECT * FROM user_sessions WHERE revoked_at IS NULL AND user_id = $1 ORDER BY last_active_at DESC LIMIT 50`,
        [currentUser.id]
      );

  const now = Date.now();
  const seenKeys = new Set();
  const devices = [];

  for (const r of res.rows) {
    const isCurrent = Boolean(currentSessionId && r.id === currentSessionId);
    const dedupKey = `${r.user_email}|${r.os}|${r.browser}|${r.ip}`;
    if (!isCurrent && seenKeys.has(dedupKey)) continue;
    seenKeys.add(dedupKey);

    const createdMs = new Date(r.created_at).getTime();
    const lastActiveMs = new Date(r.last_active_at || r.created_at).getTime();
    const activeMs = Math.max(0, now - createdMs);
    const idleMs = Math.max(0, now - lastActiveMs);

    devices.push({
      sessionId: r.id,
      userId: r.user_id,
      userEmail: r.user_email,
      userName: r.user_name,
      deviceName: r.device_name || 'Workstation',
      os: r.os || 'OS',
      browser: r.browser || 'Browser',
      ip: r.ip || '127.0.0.1',
      location: r.location || 'Jakarta, Indonesia',
      loginTime: r.created_at,
      lastActive: r.last_active_at || r.created_at,
      activeDuration: formatDurationHuman(activeMs),
      idleDuration: formatDurationHuman(idleMs),
      isIdleOver1h: idleMs >= 3600000,
      isCurrent,
    });
  }

  return devices;
}

async function revokeDeviceSession(sessionId, actorEmail) {
  await initSecurityTables();
  const res = await pool.query(
    `UPDATE user_sessions SET revoked_at = NOW(), revoked_by = $2 WHERE id = $1 RETURNING *`,
    [sessionId, actorEmail]
  );
  return res.rows[0] || null;
}

async function revokeAllOtherDeviceSessions(userId, currentSessionId, actorEmail, allUsers = false) {
  await initSecurityTables();
  let res;
  if (allUsers) {
    res = await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW(), revoked_by = $2
       WHERE revoked_at IS NULL AND ($1::varchar IS NULL OR id <> $1)
       RETURNING id`,
      [currentSessionId || null, actorEmail]
    );
  } else {
    res = await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW(), revoked_by = $3
       WHERE revoked_at IS NULL AND user_id = $1 AND ($2::varchar IS NULL OR id <> $2)
       RETURNING id`,
      [userId, currentSessionId || null, actorEmail]
    );
  }
  return res.rows.length;
}

// ─── 7. AGENT ACCESS TOKEN (ASISTEN AI — ssagt_...) ──────────────────────────

function hashAgentToken(raw) {
  return crypto.createHash('sha256').update(String(raw || '')).digest('hex');
}

async function issueAgentToken({ createdBy, ttlMinutes = 30 }) {
  await initSecurityTables();
  const ttlMs = Math.min(
    Math.max((Number(ttlMinutes) || 30) * 60 * 1000, MIN_AGENT_TTL_MS),
    MAX_AGENT_TTL_MS
  );
  const rawRandom = crypto.randomBytes(32).toString('base64url');
  const plaintext = `${TOKEN_PREFIX}${rawRandom}`;
  const tokenHash = hashAgentToken(plaintext);
  const id = `agt-${crypto.randomBytes(6).toString('hex')}`;
  const expiresAt = new Date(Date.now() + ttlMs);

  await pool.query(
    `INSERT INTO agent_tokens (id, token_hash, created_by, scope, created_at, expires_at)
     VALUES ($1, $2, $3, 'readonly-assistant', NOW(), $4)`,
    [id, tokenHash, createdBy, expiresAt.toISOString()]
  );

  return {
    id,
    token: plaintext,
    createdBy,
    scope: 'readonly-assistant',
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    ttlMinutes: Math.round(ttlMs / 60000),
  };
}

async function listAgentTokens() {
  await initSecurityTables();
  const res = await pool.query(
    `SELECT id, created_by, scope, created_at, expires_at, last_used_at, revoked_at
     FROM agent_tokens
     ORDER BY created_at DESC
     LIMIT 30`
  );
  const now = Date.now();
  return res.rows.map(t => ({
    id: t.id,
    createdBy: t.created_by,
    scope: t.scope,
    createdAt: t.created_at,
    expiresAt: t.expires_at,
    lastUsedAt: t.last_used_at,
    revokedAt: t.revoked_at,
    active: !t.revoked_at && new Date(t.expires_at).getTime() > now,
  }));
}

async function revokeAllAgentTokens(revokedBy = 'owner') {
  await initSecurityTables();
  const res = await pool.query(
    `UPDATE agent_tokens SET revoked_at = NOW() WHERE revoked_at IS NULL RETURNING id`
  );
  return { revoked: res.rows.length, revokedBy };
}

async function verifyAgentToken(rawHeader) {
  if (!rawHeader || typeof rawHeader !== 'string') return { valid: false };
  const trimmed = rawHeader.replace(/^Bearer\s+/i, '').trim();
  if (!trimmed.startsWith(TOKEN_PREFIX)) return { valid: false };
  await initSecurityTables();

  const h = hashAgentToken(trimmed);
  const res = await pool.query('SELECT * FROM agent_tokens WHERE token_hash = $1 LIMIT 1', [h]);
  if (!res.rows.length) return { valid: false, reason: 'unknown_token' };
  const record = res.rows[0];
  if (record.revoked_at) return { valid: false, reason: 'revoked', id: record.id };
  if (new Date(record.expires_at).getTime() <= Date.now()) {
    return { valid: false, reason: 'expired', id: record.id };
  }
  await pool.query('UPDATE agent_tokens SET last_used_at = NOW() WHERE id = $1', [record.id]).catch(() => {});
  return { valid: true, record };
}

module.exports = {
  initSecurityTables,
  generateTOTPSecret,
  generateTOTP,
  verifyTOTPWithStep,
  generateRecoveryCodes,
  recordAuditLog,
  listAuditLogs,
  getBreakGlassSetupDetails,
  beginUserEnrollment,
  confirmUserEnrollment,
  revokeUserEnrollment,
  verifyBreakGlassAccess,
  verifyUserReauthCode,
  getSessionConfig,
  setSessionConfig,
  parseUserAgent,
  extractClientIp,
  resolveDeviceLocation,
  createOrUpdateDeviceSession,
  touchDeviceSession,
  isSessionRevoked,
  listDeviceSessions,
  revokeDeviceSession,
  revokeAllOtherDeviceSessions,
  issueAgentToken,
  listAgentTokens,
  revokeAllAgentTokens,
  verifyAgentToken,
  TOKEN_PREFIX,
};
