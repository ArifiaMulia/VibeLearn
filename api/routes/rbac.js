/**
 * Zero-Trust RBAC & User Access Control Routes (modeled after secure.virtuenet.space/api/rbac/*)
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { getAccessMode, invalidate: invalidateAccessPolicy } = require('../services/accessPolicy');
const {
  initSecurityTables,
  recordAuditLog,
  listAuditLogs,
  beginUserEnrollment,
  confirmUserEnrollment,
  revokeUserEnrollment,
  extractClientIp,
} = require('../services/securityGovernance');

const requireSuperAdmin = (req, res, next) =>
  req.user && req.user.role === 'super_admin'
    ? next()
    : res.status(403).json({ error: 'Hanya Super Admin yang memiliki akses ke modul User & Access Control.' });

const ALL_MODULES = [
  'dashboard',
  'courses',
  'labs',
  'news',
  'leaderboard',
  'profile',
  'users',
  'analytics',
  'subscriptions',
  'course_builder',
  'certificates',
  'ai_settings',
];

// GET /api/rbac/stats
router.get('/stats', auth, async (req, res) => {
  try {
    await initSecurityTables();
    const totalRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM users');
    const activeRes = await pool.query("SELECT COUNT(*)::int AS cnt FROM users WHERE COALESCE(status, 'active') = 'active'");
    const pendingRes = await pool.query("SELECT COUNT(*)::int AS cnt FROM access_requests WHERE status = 'pending'");
    const totpRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM users WHERE totp_enabled = TRUE');
    const accessMode = await getAccessMode();

    res.json({
      success: true,
      stats: {
        totalUsers: totalRes.rows[0]?.cnt || 0,
        activeUsers: activeRes.rows[0]?.cnt || 0,
        pendingRequests: pendingRes.rows[0]?.cnt || 0,
        enrolled2faUsers: totpRes.rows[0]?.cnt || 0,
        breakGlassStatus: 'ENFORCED',
        accessMode,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rbac/access-mode (Quick toggle Closed-Loop Prasetia Lark vs Public from User & Access Control)
router.post('/access-mode', auth, requireSuperAdmin, async (req, res) => {
  try {
    const mode = req.body?.access_mode === 'closed' ? 'closed' : 'public';
    await pool.query(
      `INSERT INTO system_settings (key, value) VALUES ('access_mode', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [mode]
    );
    invalidateAccessPolicy();
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'UPDATE_ACCESS_POLICY',
      module: 'RBAC',
      details: `Changed platform access mode to ${mode.toUpperCase()}`,
      ip: extractClientIp(req),
    });
    res.json({ success: true, access_mode: mode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rbac/users
router.get('/users', auth, requireSuperAdmin, async (req, res) => {
  try {
    await initSecurityTables();
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.plan,
        u.avatar,
        COALESCE(u.status, 'active') AS status,
        COALESCE(u.allowed_modules, '["courses","labs","news","leaderboard","profile"]'::jsonb) AS allowed_modules,
        u.lark_open_id,
        COALESCE(u.totp_enabled, FALSE) AS totp_enabled,
        u.totp_enrolled_at,
        u.last_activity,
        u.created_at,
        s.status AS sub_status,
        s.expires_at AS sub_expires_at
      FROM users u
      LEFT JOIN subscriptions s ON s.user_id = u.id
      ORDER BY
        CASE WHEN u.role = 'super_admin' THEN 0 WHEN u.role = 'master' THEN 1 ELSE 2 END,
        u.id ASC
    `);
    res.json({ success: true, users: result.rows, availableModules: ALL_MODULES });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rbac/users (Authorize Lark User / Add User)
router.post('/users', auth, requireSuperAdmin, async (req, res) => {
  try {
    await initSecurityTables();
    const {
      name,
      email,
      password,
      role = 'participant',
      plan = 'pro',
      status = 'active',
      allowed_modules,
    } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: 'Nama dan Email wajib diisi.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const rawPass = password && String(password).trim().length >= 6
      ? String(password).trim()
      : crypto.randomBytes(16).toString('hex');
    const hashed = await bcrypt.hash(rawPass, 10);

    const defaultModules =
      role === 'super_admin'
        ? ALL_MODULES
        : Array.isArray(allowed_modules) && allowed_modules.length > 0
        ? allowed_modules
        : ['dashboard', 'courses', 'labs', 'news', 'leaderboard', 'profile'];

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, plan, status, allowed_modules)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id, name, email, role, plan, status, allowed_modules, totp_enabled, last_activity, created_at`,
      [name.trim(), cleanEmail, hashed, role, plan, status, JSON.stringify(defaultModules)]
    );

    const newUser = result.rows[0];
    await pool
      .query(
        `INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, 'active') ON CONFLICT (user_id) DO NOTHING`,
        [newUser.id, plan]
      )
      .catch(() => {});

    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'AUTHORIZE_USER',
      module: 'RBAC',
      details: `Authorized ${newUser.email} (${newUser.role}, plan=${newUser.plan}, status=${newUser.status})`,
      ip: extractClientIp(req),
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email sudah terdaftar.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/rbac/users/:id (Update Role, Plan, Status, Allowed Modules)
router.put('/users/:id', auth, requireSuperAdmin, async (req, res) => {
  try {
    await initSecurityTables();
    const userId = parseInt(req.params.id, 10);
    const { name, email, role, plan, status, allowed_modules } = req.body || {};

    if (userId === req.user.id && role && role !== 'super_admin') {
      return res.status(400).json({ error: 'Tidak dapat menurunkan role akun Anda sendiri.' });
    }
    if (userId === req.user.id && status === 'suspended') {
      return res.status(400).json({ error: 'Tidak dapat menangguhkan akun Anda sendiri.' });
    }

    const setClauses = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) { setClauses.push(`name = $${idx++}`); params.push(name.trim()); }
    if (email !== undefined) { setClauses.push(`email = $${idx++}`); params.push(email.trim().toLowerCase()); }
    if (role !== undefined) { setClauses.push(`role = $${idx++}`); params.push(role); }
    if (plan !== undefined) { setClauses.push(`plan = $${idx++}`); params.push(plan); }
    if (status !== undefined) { setClauses.push(`status = $${idx++}`); params.push(status); }
    if (Array.isArray(allowed_modules)) {
      setClauses.push(`allowed_modules = $${idx++}::jsonb`);
      params.push(JSON.stringify(allowed_modules));
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Tidak ada perubahan yang dikirim.' });
    }

    params.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role, plan, status, allowed_modules, totp_enabled, totp_enrolled_at, last_activity`,
      params
    );

    if (!result.rows.length) return res.status(404).json({ error: 'User tidak ditemukan.' });
    const updated = result.rows[0];

    if (plan !== undefined) {
      await pool.query('UPDATE subscriptions SET plan = $1 WHERE user_id = $2', [plan, userId]).catch(() => {});
    }

    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'UPDATE_USER_PERMISSIONS',
      module: 'RBAC',
      details: `Updated ${updated.email} -> role=${updated.role}, plan=${updated.plan}, status=${updated.status}, modules=${(updated.allowed_modules || []).length}`,
      ip: extractClientIp(req),
    });

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rbac/users/:id
router.delete('/users/:id', auth, requireSuperAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Tidak dapat menghapus akun Anda sendiri.' });
    }
    const delRes = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [userId]);
    if (!delRes.rows.length) return res.status(404).json({ error: 'User tidak ditemukan.' });

    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'DELETE_USER',
      module: 'RBAC',
      details: `Deleted user ${delRes.rows[0].name} (${delRes.rows[0].email})`,
      ip: extractClientIp(req),
    });

    res.json({ success: true, deleted: delRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PER-USER GOOGLE AUTHENTICATOR 2FA ENROLLMENT ────────────────────────────

// POST /api/rbac/users/:id/authenticator/enroll
router.post('/users/:id/authenticator/enroll', auth, requireSuperAdmin, async (req, res) => {
  try {
    const enrollment = await beginUserEnrollment(parseInt(req.params.id, 10));
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'BEGIN_USER_2FA_ENROLLMENT',
      module: '2FA_AUTH',
      details: `Generated new Google Authenticator TOTP secret for ${enrollment.email}`,
      ip: extractClientIp(req),
    });
    res.json({ success: true, ...enrollment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/rbac/users/:id/authenticator/confirm
router.post('/users/:id/authenticator/confirm', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { code } = req.body || {};
    const out = await confirmUserEnrollment(parseInt(req.params.id, 10), code);
    if (!out.success) {
      return res.status(400).json({ error: out.error });
    }
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'CONFIRM_USER_2FA_ENROLLMENT',
      module: '2FA_AUTH',
      details: `Activated Google Authenticator 2FA & generated 8 recovery keys for ${out.email}`,
      ip: extractClientIp(req),
    });
    res.json(out);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/rbac/users/:id/authenticator
router.delete('/users/:id/authenticator', auth, requireSuperAdmin, async (req, res) => {
  try {
    const out = await revokeUserEnrollment(parseInt(req.params.id, 10));
    if (!out.success) return res.status(404).json({ error: out.error });
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'REVOKE_USER_2FA',
      module: '2FA_AUTH',
      details: `Reset/revoked Google Authenticator 2FA for ${out.user.email}`,
      ip: extractClientIp(req),
    });
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ACCESS REQUESTS QUEUE ───────────────────────────────────────────────────

// GET /api/rbac/requests
router.get('/requests', auth, requireSuperAdmin, async (req, res) => {
  try {
    await initSecurityTables();
    const result = await pool.query(
      `SELECT * FROM access_requests ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 100`
    );
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rbac/requests (Any authenticated user can submit a module access request)
router.post('/requests', auth, async (req, res) => {
  try {
    await initSecurityTables();
    const { module: modName, reason } = req.body || {};
    if (!modName) return res.status(400).json({ error: 'Modul wajib dipilih.' });
    const result = await pool.query(
      `INSERT INTO access_requests (user_id, user_name, user_email, module, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.user.id, req.user.name, req.user.email, modName, reason || 'Permintaan akses modul tambahan']
    );
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'REQUEST_MODULE_ACCESS',
      module: 'RBAC',
      details: `Requested access to module "${modName}": ${reason || '-'}`,
      ip: extractClientIp(req),
    });
    res.status(201).json({ success: true, request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rbac/requests/:id/approve
router.post('/requests/:id/approve', auth, requireSuperAdmin, async (req, res) => {
  try {
    await initSecurityTables();
    const reqId = parseInt(req.params.id, 10);
    const rRes = await pool.query('SELECT * FROM access_requests WHERE id = $1', [reqId]);
    if (!rRes.rows.length) return res.status(404).json({ error: 'Permintaan tidak ditemukan.' });
    const reqRow = rRes.rows[0];

    await pool.query(
      `UPDATE access_requests SET status = 'approved', reviewed_by = $1, updated_at = NOW() WHERE id = $2`,
      [req.user.email, reqId]
    );

    if (reqRow.user_id) {
      const uRes = await pool.query('SELECT allowed_modules FROM users WHERE id = $1', [reqRow.user_id]);
      if (uRes.rows.length) {
        const mods = Array.isArray(uRes.rows[0].allowed_modules) ? uRes.rows[0].allowed_modules : [];
        if (!mods.includes(reqRow.module)) {
          mods.push(reqRow.module);
          await pool.query('UPDATE users SET allowed_modules = $1::jsonb WHERE id = $2', [JSON.stringify(mods), reqRow.user_id]);
        }
      }
    }

    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'APPROVE_ACCESS_REQUEST',
      module: 'RBAC',
      details: `Approved access to "${reqRow.module}" for ${reqRow.user_email}`,
      ip: extractClientIp(req),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rbac/requests/:id/reject
router.post('/requests/:id/reject', auth, requireSuperAdmin, async (req, res) => {
  try {
    await initSecurityTables();
    const reqId = parseInt(req.params.id, 10);
    const rRes = await pool.query('SELECT * FROM access_requests WHERE id = $1', [reqId]);
    if (!rRes.rows.length) return res.status(404).json({ error: 'Permintaan tidak ditemukan.' });
    const reqRow = rRes.rows[0];

    await pool.query(
      `UPDATE access_requests SET status = 'rejected', reviewed_by = $1, updated_at = NOW() WHERE id = $2`,
      [req.user.email, reqId]
    );

    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'REJECT_ACCESS_REQUEST',
      module: 'RBAC',
      details: `Rejected access to "${reqRow.module}" for ${reqRow.user_email}`,
      ip: extractClientIp(req),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GLOBAL USER HISTORY & SECURITY AUDIT TRAIL ──────────────────────────────

// GET /api/rbac/audit-logs
router.get('/audit-logs', auth, requireSuperAdmin, async (req, res) => {
  try {
    const logs = await listAuditLogs({
      limit: req.query.limit || 150,
      moduleFilter: req.query.module || '',
      search: req.query.search || '',
    });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
