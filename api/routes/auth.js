const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../config/jwtSecret');
const tokenRevocation = require('../services/tokenRevocation');
const { getAccessMode, isAllowedClosedLoopEmail } = require('../services/accessPolicy');
const {
  initSecurityTables,
  recordAuditLog,
  getBreakGlassSetupDetails,
  verifyBreakGlassAccess,
  verifyUserReauthCode,
  getSessionConfig,
  setSessionConfig,
  extractClientIp,
  createOrUpdateDeviceSession,
  isSessionRevoked,
  listDeviceSessions,
  revokeDeviceSession,
  revokeAllOtherDeviceSessions,
  issueAgentToken,
  listAgentTokens,
  revokeAllAgentTokens,
} = require('../services/securityGovernance');

const auth = require('../middleware/auth');
const requireSuperAdmin = (req, res, next) =>
  req.user && req.user.role === 'super_admin'
    ? next()
    : res.status(403).json({ error: 'Hanya Super Admin yang memiliki akses ke fitur ini.' });

const CLOSED_LOOP_MSG =
  'Mode Closed-Loop aktif: login password ditutup demi keamanan. Silakan masuk dengan akun Lark Prasetia atau gunakan Break-Glass 2FA (Ctrl+Shift+M).';

const generateToken = (user, sid = null) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      plan: user.plan,
      ...(sid ? { sid } : {}),
    },
    jwtSecret,
    { expiresIn: '24h' }
  );

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = extractClientIp(req);
  try {
    await initSecurityTables();
    // HARDENING (#1): Block ALL password logins (including super_admin) when Closed-Loop is active!
    if ((await getAccessMode()) === 'closed') {
      await recordAuditLog({
        userEmail: email || 'unknown',
        userName: email || 'Unknown',
        action: 'BLOCKED_PASSWORD_LOGIN_CLOSED_LOOP',
        module: 'AUTH',
        details: 'Password login blocked because Closed-Loop mode is active (use Lark SSO or Break-Glass 2FA Ctrl+Shift+M)',
        ip,
      });
      return res.status(403).json({ error: CLOSED_LOOP_MSG, code: 'CLOSED_LOOP' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const user = result.rows[0];
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Akun Anda sedang ditangguhkan oleh Administrator.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await recordAuditLog({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'LOGIN_FAILED_PASSWORD',
        module: 'AUTH',
        details: 'Invalid password attempt',
        ip,
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const dev = await createOrUpdateDeviceSession(req, user);
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type) VALUES ($1, $2, $3)', [user.id, 'login', 'auth']).catch(() => {});
    await pool.query('UPDATE users SET last_activity = NOW() WHERE id = $1', [user.id]).catch(() => {});
    await recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action: 'LOGIN_PASSWORD_SUCCESS',
      module: 'AUTH',
      details: `${dev.deviceName} · ${dev.os} · ${dev.browser} (${dev.location})`,
      ip,
    });

    const token = generateToken(user, dev.sessionId);
    res.clearCookie('vl_logged_out', { path: '/' });
    res.clearCookie('vl_logged_out', { path: '/', domain: '.virtuenet.space' });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        avatar: user.avatar,
        allowed_modules: user.allowed_modules,
        totp_enabled: Boolean(user.totp_enabled),
      },
      token,
      sessionId: dev.sessionId,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register (public self-registration — free plan)
router.post('/register', async (req, res) => {
  if ((await getAccessMode()) === 'closed') {
    return res.status(403).json({ error: CLOSED_LOOP_MSG, code: 'CLOSED_LOOP' });
  }
  let { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

  name = name.trim();
  email = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    await initSecurityTables();
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, plan) VALUES ($1, $2, $3, 'participant', 'free') RETURNING id, name, email, role, plan`,
      [name, email, hashed]
    );
    const user = result.rows[0];
    await pool.query(`INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, 'free', 'active')`, [user.id]);
    const dev = await createOrUpdateDeviceSession(req, user);
    const token = generateToken(user, dev.sessionId);

    await recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action: 'USER_REGISTERED',
      module: 'AUTH',
      details: `${dev.deviceName} · ${dev.os}`,
      ip: extractClientIp(req),
    });

    const { sendWelcomeEmail } = require('../services/emailService');
    sendWelcomeEmail(user.email, user.name).catch(() => {});

    res.clearCookie('vl_logged_out', { path: '/' });
    res.clearCookie('vl_logged_out', { path: '/', domain: '.virtuenet.space' });
    res.status(201).json({ user, token, sessionId: dev.sessionId });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/activity
router.post('/activity', auth, async (req, res) => {
  try {
    await pool.query('UPDATE users SET last_activity = NOW() WHERE id = $1', [req.user.id]);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper to parse cookies from header
function parseCookieHeader(header = '') {
  const out = {};
  for (const part of String(header).split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

// GET /api/auth/me
router.get('/me', async (req, res) => {
  await initSecurityTables();
  const cookies = parseCookieHeader(req.headers.cookie);
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];
  const explicitSsoToken = req.query.sso_token || req.query.token;
  const larkPending = req.query.lark_pending === '1' || cookies['vl_lark_pending'] === '1';
  const isLoggedOut = cookies['vl_logged_out'] === '1' && !explicitSsoToken && !larkPending;
  const ssoJwt = explicitSsoToken || (!isLoggedOut ? (cookies['virtuenet_sso_jwt'] || cookies['token']) : null);

  if (explicitSsoToken || larkPending) {
    res.clearCookie('vl_logged_out', { path: '/' });
    res.clearCookie('vl_logged_out', { path: '/', domain: '.virtuenet.space' });
    res.clearCookie('vl_lark_pending', { path: '/' });
  }

  // 1. Try existing local Bearer token
  if (bearerToken && !tokenRevocation.isRevoked(bearerToken)) {
    try {
      const decoded = jwt.verify(bearerToken, jwtSecret, { algorithms: ['HS256'] });
      if (decoded.sid && (await isSessionRevoked(decoded.sid))) {
        return res.status(401).json({ error: 'Session revoked' });
      }
      const userRes = await pool.query(
        'SELECT id, name, email, role, plan, avatar, status, allowed_modules, totp_enabled FROM users WHERE id = $1',
        [decoded.id]
      );
      if (userRes.rows.length > 0 && userRes.rows[0].status !== 'suspended') {
        const u = userRes.rows[0];
        let sid = decoded.sid;
        if (!sid) {
          const dev = await createOrUpdateDeviceSession(req, u);
          sid = dev.sessionId;
        }
        return res.json({ user: u, token: bearerToken, sessionId: sid });
      }
    } catch {}
  }

  // 2. Try Virtuenet SSO JWT or trusted Edge SSO headers
  const edgeEmail = (req.headers['x-user-email'] || '').trim();
  const edgeOpenId = (req.headers['x-user-open-id'] || '').trim();
  if (ssoJwt || (!isLoggedOut && (edgeEmail || edgeOpenId))) {
    try {
      let ssoUser = null;

      if (edgeEmail || edgeOpenId) {
        ssoUser = {
          email: edgeEmail,
          name: req.headers['x-user-name'] || 'Lark User',
          role: req.headers['x-user-role'] || 'user',
          open_id: edgeOpenId,
        };
      }

      if (!ssoUser && ssoJwt) {
        const ssoVerifyUrl = process.env.SSO_VERIFY_URL || 'https://assistant.virtuenet.space/api/auth/sso/verify';
        try {
          const verifyRes = await fetch(`${ssoVerifyUrl}?token=${encodeURIComponent(ssoJwt)}`, {
            headers: { Accept: 'application/json', Authorization: `Bearer ${ssoJwt}` },
            signal: AbortSignal.timeout(4000),
          });
          if (verifyRes.ok) {
            const data = await verifyRes.json();
            if (data?.valid && data?.user) {
              ssoUser = data.user;
            } else if (data?.email || data?.open_id) {
              ssoUser = data;
            }
          }
        } catch (verifyErr) {
          console.warn('SSO verify endpoint unreachable, attempting JWT decode fallback:', verifyErr.message);
        }
      }

      if (!ssoUser && ssoJwt) {
        const decodedSso = jwt.decode(ssoJwt);
        const notExpired = !decodedSso?.exp || decodedSso.exp * 1000 > Date.now();
        if (decodedSso && notExpired && (decodedSso.email || decodedSso.open_id)) {
          ssoUser = decodedSso;
        }
      }

      if (ssoUser) {
        let email = (ssoUser.email || '').toLowerCase().trim();
        if (!email && ssoUser.open_id === 'ou_5978bc3e371ea20b33ddf24dc99acc95') {
          email = 'ubai@prasetia.co.id';
        }
        if (!email && ssoUser.open_id) {
          email = `${ssoUser.open_id}@lark.vibelearn.id`;
        }
        const hasValidLarkOpenId = Boolean(ssoUser.open_id && String(ssoUser.open_id).startsWith('ou_'));
        if (email && (await getAccessMode()) === 'closed' && !hasValidLarkOpenId && !isAllowedClosedLoopEmail(email)) {
          return res.status(403).json({ error: CLOSED_LOOP_MSG, code: 'CLOSED_LOOP' });
        }
        if (email) {
          res.clearCookie('vl_logged_out', { path: '/' });
          res.clearCookie('vl_logged_out', { path: '/', domain: '.virtuenet.space' });
          let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          let user;
          const isSuper =
            email === 'ubai@prasetia.co.id' ||
            email === 'arifia.mulia@prasetia.co.id' ||
            ssoUser.role === 'administrator';
          const targetRole = isSuper ? 'super_admin' : 'participant';

          if (userResult.rows.length === 0) {
            const randPassword = require('crypto').randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randPassword, 10);
            const insertResult = await pool.query(
              `INSERT INTO users (name, email, password, role, plan, avatar, lark_open_id)
               VALUES ($1, $2, $3, $4, 'pro', $5, $6)
               RETURNING *`,
              [ssoUser.name || 'Lark User', email, hashedPassword, targetRole, ssoUser.avatar_url || null, ssoUser.open_id || null]
            );
            user = insertResult.rows[0];
            await pool
              .query(
                `INSERT INTO subscriptions (user_id, plan, status)
                 VALUES ($1, 'pro', 'active')
                 ON CONFLICT (user_id) DO NOTHING`,
                [user.id]
              )
              .catch(() => {});
          } else {
            user = userResult.rows[0];
            if (user.status === 'suspended') {
              return res.status(403).json({ error: 'Akun Anda sedang ditangguhkan oleh Administrator.' });
            }
            if (isSuper && user.role !== 'super_admin') {
              await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['super_admin', user.id]);
              user.role = 'super_admin';
            }
            if (ssoUser.avatar_url && user.avatar !== ssoUser.avatar_url) {
              await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [ssoUser.avatar_url, user.id]).catch(() => {});
              user.avatar = ssoUser.avatar_url;
            }
            if (ssoUser.open_id && user.lark_open_id !== ssoUser.open_id) {
              await pool.query('UPDATE users SET lark_open_id = $1 WHERE id = $2', [ssoUser.open_id, user.id]).catch(() => {});
            }
          }

          await pool.query('UPDATE users SET last_activity = NOW() WHERE id = $1', [user.id]).catch(() => {});
          const dev = await createOrUpdateDeviceSession(req, user);
          if (explicitSsoToken || larkPending) {
            await recordAuditLog({
              userId: user.id,
              userEmail: user.email,
              userName: user.name,
              action: 'LARK_SSO_LOGIN',
              module: 'AUTH',
              details: `Lark SSO (${dev.deviceName} · ${dev.os} · ${dev.browser})`,
              ip: dev.ip,
            });
          }
          const token = generateToken(user, dev.sessionId);
          return res.json({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              plan: user.plan,
              avatar: user.avatar,
              allowed_modules: user.allowed_modules,
              totp_enabled: Boolean(user.totp_enabled),
            },
            token,
            sessionId: dev.sessionId,
          });
        }
      }
    } catch (err) {
      console.error('SSO verify error in VibeLearn:', err);
    }
  }

  return res.status(401).json({ error: 'Unauthenticated' });
});

// POST /api/auth/logout & /api/auth/session-clear
const handleLogout = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const bearer = authHeader && authHeader.split(' ')[1];
  if (bearer) {
    try {
      const decoded = jwt.decode(bearer);
      if (decoded?.sid) {
        await revokeDeviceSession(decoded.sid, decoded.email || 'self').catch(() => {});
      }
      if (decoded?.email) {
        await recordAuditLog({
          userId: decoded.id,
          userEmail: decoded.email,
          userName: decoded.name || decoded.email,
          action: 'USER_LOGOUT',
          module: 'AUTH',
          details: 'Explicit user sign-out & token revocation',
          ip: extractClientIp(req),
        });
      }
    } catch {}
    await tokenRevocation.revoke(bearer);
  }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Clear-Site-Data', '"cache", "storage"');
  res.clearCookie('virtuenet_sso_jwt', { path: '/' });
  res.clearCookie('virtuenet_sso_jwt', { path: '/', domain: '.virtuenet.space' });
  res.clearCookie('token', { path: '/' });
  res.clearCookie('token', { path: '/', domain: '.virtuenet.space' });
  res.cookie('vl_logged_out', '1', { path: '/', maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
  return res.json({ message: 'Logged out successfully' });
};
router.post('/logout', handleLogout);
router.post('/session-clear', handleLogout);

// ─── BREAK-GLASS EMERGENCY ACCESS (Ctrl+Shift+M) ─────────────────────────────

// POST /api/auth/break-glass/login
router.post('/break-glass/login', async (req, res) => {
  const { code } = req.body || {};
  const ip = extractClientIp(req);
  try {
    const result = await verifyBreakGlassAccess(code);
    if (!result.success || !result.user) {
      await recordAuditLog({
        userEmail: 'break-glass',
        userName: 'Break-Glass Attempt',
        action: 'BREAK_GLASS_FAILED',
        module: 'BREAK_GLASS',
        details: result.error || 'Invalid 2FA / Recovery code',
        ip,
      });
      return res.status(401).json({ error: result.error || 'Kode 2FA tidak valid.' });
    }

    const user = result.user;
    await pool.query('UPDATE users SET last_activity = NOW() WHERE id = $1', [user.id]).catch(() => {});
    const dev = await createOrUpdateDeviceSession(req, user);
    const token = generateToken(user, dev.sessionId);

    await recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action: `BREAK_GLASS_SUCCESS (${result.method})`,
      module: 'BREAK_GLASS',
      details: `Emergency 2FA login via ${result.method} on ${dev.deviceName} (${dev.ip})`,
      ip,
    });

    res.clearCookie('vl_logged_out', { path: '/' });
    res.clearCookie('vl_logged_out', { path: '/', domain: '.virtuenet.space' });
    return res.json({
      success: true,
      method: result.method,
      remainingCodes: result.remainingCodes,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        avatar: user.avatar,
        allowed_modules: user.allowed_modules,
        totp_enabled: Boolean(user.totp_enabled),
      },
      token,
      sessionId: dev.sessionId,
    });
  } catch (err) {
    console.error('Break-glass login error:', err);
    res.status(500).json({ error: 'Gagal memverifikasi Break-Glass 2FA.' });
  }
});

// GET & POST /api/auth/break-glass/setup (Super Admin only)
router.get('/break-glass/setup', auth, requireSuperAdmin, async (req, res) => {
  try {
    const details = await getBreakGlassSetupDetails(false);
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'VIEW_BREAK_GLASS_VAULT',
      module: 'BREAK_GLASS',
      details: 'Viewed Break-Glass 2FA QR & Recovery Vault',
      ip: extractClientIp(req),
    });
    res.json({ success: true, ...details });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/break-glass/setup', auth, requireSuperAdmin, async (req, res) => {
  try {
    const regenerate = Boolean(req.body?.regenerate);
    const details = await getBreakGlassSetupDetails(regenerate);
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: regenerate ? 'REGENERATE_BREAK_GLASS_VAULT' : 'VIEW_BREAK_GLASS_VAULT',
      module: 'BREAK_GLASS',
      details: regenerate
        ? 'Regenerated Break-Glass TOTP secret and 8 single-use recovery keys'
        : 'Viewed Break-Glass 2FA QR & Recovery Vault',
      ip: extractClientIp(req),
    });
    res.json({ success: true, ...details });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SESSION GOVERNANCE & IDLE AUTO-LOGOUT ───────────────────────────────────

router.get('/session-config', async (req, res) => {
  try {
    const cfg = await getSessionConfig();
    res.json({ success: true, ...cfg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/session-config', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { sessionIdleTimeout } = req.body || {};
    const cfg = await setSessionConfig(sessionIdleTimeout);
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'UPDATE_SESSION_GOVERNANCE',
      module: 'SESSION_GOV',
      details: `Idle auto-logout timeout set to ${cfg.sessionIdleTimeout}`,
      ip: extractClientIp(req),
    });
    res.json({ success: true, ...cfg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DEVICE MANAGEMENT ───────────────────────────────────────────────────────

router.get('/devices', auth, async (req, res) => {
  try {
    // Ensure current request's session is registered so list is never empty
    let currentSid = req.user.sid;
    if (!currentSid) {
      const dev = await createOrUpdateDeviceSession(req, req.user);
      currentSid = dev.sessionId;
    }
    const devices = await listDeviceSessions(req.user, currentSid);
    res.json({ success: true, devices, currentSessionId: currentSid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/devices/:id/logout', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const revoked = await revokeDeviceSession(sessionId, req.user.email);
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'DEVICE_REMOTE_LOGOUT',
      module: 'DEVICE_MGMT',
      details: revoked
        ? `Terminated device session ${sessionId} (${revoked.device_name} · ${revoked.ip} · ${revoked.user_email})`
        : `Terminated device session ${sessionId}`,
      ip: extractClientIp(req),
    });
    res.json({ success: true, sessionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/devices/logout-all-others', auth, async (req, res) => {
  try {
    const allUsers = Boolean(req.body?.allUsers && req.user.role === 'super_admin');
    const count = await revokeAllOtherDeviceSessions(req.user.id, req.user.sid, req.user.email, allUsers);
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'DEVICE_LOGOUT_ALL_OTHERS',
      module: 'DEVICE_MGMT',
      details: `Terminated ${count} other active device session(s)`,
      ip: extractClientIp(req),
    });
    res.json({ success: true, terminatedCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AGENT ACCESS TOKEN (ASISTEN AI) ─────────────────────────────────────────

router.get('/agent-tokens', auth, requireSuperAdmin, async (req, res) => {
  try {
    const tokens = await listAgentTokens();
    res.json({ success: true, tokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/agent-token', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { ttlMinutes, reauth } = req.body || {};
    const check = await verifyUserReauthCode(req.user, reauth);
    if (!check.ok) {
      await recordAuditLog({
        userId: req.user.id,
        userEmail: req.user.email,
        userName: req.user.name,
        action: 'AGENT_TOKEN_ISSUE_DENIED',
        module: 'AGENT_TOKEN',
        details: check.error || 'Invalid 2FA code while issuing Agent Token',
        ip: extractClientIp(req),
      });
      return res.status(401).json({ error: check.error });
    }

    const issued = await issueAgentToken({
      createdBy: req.user.email,
      ttlMinutes: Number(ttlMinutes) || 30,
    });

    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'AGENT_TOKEN_ISSUED',
      module: 'AGENT_TOKEN',
      details: `Issued ${issued.id} (TTL ${issued.ttlMinutes}m, expires ${issued.expiresAt}) via ${check.method}`,
      ip: extractClientIp(req),
    });

    res.json({ success: true, ...issued });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/agent-tokens', auth, requireSuperAdmin, async (req, res) => {
  try {
    const out = await revokeAllAgentTokens(req.user.email);
    await recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      action: 'AGENT_TOKENS_REVOKED_ALL',
      module: 'AGENT_TOKEN',
      details: `Revoked ${out.revoked} active agent token(s)`,
      ip: extractClientIp(req),
    });
    res.json({ success: true, ...out });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LARK OAUTH CONFIG & CALLBACK ────────────────────────────────────────────

// GET /api/auth/lark/config
router.get('/lark/config', (req, res) => {
  const appId = process.env.LARK_APP_ID;
  const redirectUri = req.query.redirect_uri || 'https://vibe.virtuenet.space/login';
  if (!appId || appId === 'YOUR_APP_ID') {
    const gatewayUrl = `https://assistant.virtuenet.space/api/auth/lark/login?return_to=${encodeURIComponent(redirectUri)}`;
    return res.json({ authUrl: gatewayUrl });
  }
  const baseUrl = process.env.LARK_API_BASE_URL || 'https://open.larksuite.com';
  const authUrl = `${baseUrl}/open-apis/authen/v1/index?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=lark_sso`;
  res.json({ authUrl });
});

// POST /api/auth/lark/callback
router.post('/lark/callback', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Authorization code is required' });

  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;
  const baseUrl = process.env.LARK_API_BASE_URL || 'https://open.larksuite.com';

  if (!appId || !appSecret || appId === 'YOUR_APP_ID' || appSecret === 'YOUR_APP_SECRET') {
    return res.status(500).json({ error: 'Lark SSO is not configured on the server.' });
  }

  try {
    await initSecurityTables();
    const appTokenRes = await fetch(`${baseUrl}/open-apis/auth/v3/app_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    });
    const appTokenData = await appTokenRes.json();
    if (!appTokenRes.ok || appTokenData.code !== 0) {
      return res.status(500).json({ error: appTokenData.msg || 'Failed to fetch Lark app access token.' });
    }
    const appAccessToken = appTokenData.app_access_token;

    const userTokenRes = await fetch(`${baseUrl}/open-apis/authen/v1/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${appAccessToken}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
      }),
    });
    const userTokenData = await userTokenRes.json();
    if (!userTokenRes.ok || userTokenData.code !== 0) {
      return res.status(400).json({ error: userTokenData.msg || 'Failed to authorize with Lark.' });
    }

    const { name, email: larkEmail, avatar_url, open_id } = userTokenData.data;

    if ((await getAccessMode()) === 'closed' && !isAllowedClosedLoopEmail(larkEmail)) {
      return res.status(403).json({ error: CLOSED_LOOP_MSG, code: 'CLOSED_LOOP' });
    }

    const email = larkEmail || `${open_id}@lark.vibelearn.id`;
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userResult.rows.length === 0) {
      const randPassword = require('crypto').randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randPassword, 10);

      const insertResult = await pool.query(
        `INSERT INTO users (name, email, password, role, plan, avatar, lark_open_id) 
         VALUES ($1, $2, $3, 'participant', 'free', $4, $5) 
         RETURNING *`,
        [name, email, hashedPassword, avatar_url || null, open_id || null]
      );
      user = insertResult.rows[0];

      await pool
        .query(
          `INSERT INTO subscriptions (user_id, plan, status) 
           VALUES ($1, 'free', 'active') 
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id]
        )
        .catch(() => {});
    } else {
      user = userResult.rows[0];
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'Akun Anda sedang ditangguhkan oleh Administrator.' });
      }
      if (avatar_url && user.avatar !== avatar_url) {
        await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatar_url, user.id]).catch(() => {});
        user.avatar = avatar_url;
      }
    }

    const dev = await createOrUpdateDeviceSession(req, user);
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type) VALUES ($1, $2, $3)', [user.id, 'lark_login', 'auth']).catch(() => {});
    await pool.query('UPDATE users SET last_activity = NOW() WHERE id = $1', [user.id]).catch(() => {});
    await recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action: 'LARK_OAUTH_LOGIN',
      module: 'AUTH',
      details: `${dev.deviceName} · ${dev.os} · ${dev.browser}`,
      ip: dev.ip,
    });

    const token = generateToken(user, dev.sessionId);
    res.clearCookie('vl_logged_out', { path: '/' });
    res.clearCookie('vl_logged_out', { path: '/', domain: '.virtuenet.space' });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        avatar: user.avatar,
        allowed_modules: user.allowed_modules,
        totp_enabled: Boolean(user.totp_enabled),
      },
      token,
      sessionId: dev.sessionId,
    });
  } catch (err) {
    console.error('Lark SSO callback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  if ((await getAccessMode()) === 'closed') {
    return res.status(403).json({ error: CLOSED_LOOP_MSG, code: 'CLOSED_LOOP' });
  }
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const userRes = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (!userRes.rows.length) {
      return res.json({ message: 'If that email exists in our system, a password reset link has been sent.' });
    }

    const user = userRes.rows[0];
    const resetToken = jwt.sign({ id: user.id, email: user.email, type: 'reset' }, jwtSecret, { expiresIn: '1h' });

    const { sendPasswordResetEmail } = require('../services/emailService');
    await sendPasswordResetEmail(user.email, resetToken).catch(() => {});

    res.json({ message: 'If that email exists in our system, a password reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password-confirm
router.post('/reset-password-confirm', async (req, res) => {
  if ((await getAccessMode()) === 'closed') {
    return res.status(403).json({ error: CLOSED_LOOP_MSG, code: 'CLOSED_LOOP' });
  }
  const { reset_token, new_password } = req.body;
  if (!reset_token || !new_password) return res.status(400).json({ error: 'Token and new password are required' });
  if (new_password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });

  try {
    const decoded = jwt.verify(reset_token, jwtSecret, { algorithms: ['HS256'] });
    if (decoded.type !== 'reset') return res.status(400).json({ error: 'Invalid reset token' });

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, decoded.id]);

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (err) {
    res.status(400).json({ error: 'Expired or invalid password reset token' });
  }
});

module.exports = router;
