const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwtSecret');
const tokenRevocation = require('../services/tokenRevocation');
const {
  verifyAgentToken,
  isSessionRevoked,
  touchDeviceSession,
  recordAuditLog,
  extractClientIp,
  TOKEN_PREFIX,
} = require('../services/securityGovernance');

const AGENT_ALLOWED_ROUTES = [
  { method: 'GET', pattern: /^\/api\/health\/?$/ },
  { method: 'GET', pattern: /^\/api\/config\/?$/ },
  { method: 'GET', pattern: /^\/api\/news(\/.*)?$/ },
  { method: 'GET', pattern: /^\/api\/courses(\/.*)?$/ },
  { method: 'GET', pattern: /^\/api\/labs(\/.*)?$/ },
  { method: 'GET', pattern: /^\/api\/analytics(\/.*)?$/ },
  { method: 'GET', pattern: /^\/api\/rbac\/stats\/?$/ },
];

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-agent-token'];
  if (!authHeader) return res.sendStatus(401);

  const token = String(authHeader).startsWith('Bearer ')
    ? String(authHeader).slice(7).trim()
    : String(authHeader).trim();
  if (!token) return res.sendStatus(401);

  // 1. Check if token is a scoped Agent Access Token (ssagt_...)
  if (token.startsWith(TOKEN_PREFIX)) {
    const check = await verifyAgentToken(token);
    if (!check.valid) {
      return res.status(401).json({
        error: `Agent token ditolak (${check.reason || 'invalid'}). Minta Super Admin menerbitkan token baru.`,
      });
    }
    const cleanPath = (req.originalUrl || req.url || '').split('?')[0];
    const allowed = AGENT_ALLOWED_ROUTES.some(
      r => r.method === req.method && r.pattern.test(cleanPath)
    );
    if (!allowed) {
      await recordAuditLog({
        userId: check.record.id,
        userEmail: `agent:${check.record.id}`,
        userName: `AI Agent (${check.record.id})`,
        action: 'AGENT_SCOPE_DENIED',
        module: 'AGENT_TOKEN',
        details: `${req.method} ${cleanPath} (issued by ${check.record.created_by})`,
        ip: extractClientIp(req),
      });
      return res.status(403).json({
        error: 'Endpoint ini di luar cakupan Agent Token (hanya read-only verifikasi yang diizinkan).',
      });
    }
    req.user = {
      id: 0,
      email: `agent:${check.record.id}`,
      name: `AI Assistant (${check.record.id})`,
      role: 'agent',
      plan: 'enterprise',
      isAgent: true,
      agentTokenId: check.record.id,
    };
    await recordAuditLog({
      userId: check.record.id,
      userEmail: `agent:${check.record.id}`,
      userName: `AI Agent (${check.record.id})`,
      action: 'AGENT_API_CALL',
      module: 'AGENT_TOKEN',
      details: `${req.method} ${cleanPath}`,
      ip: extractClientIp(req),
    });
    res.setHeader('Cache-Control', 'no-store');
    return next();
  }

  // 2. Standard JWT verification + revocation + session governance check
  if (tokenRevocation.isRevoked(token)) return res.sendStatus(401);
  jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }, async (err, user) => {
    if (err) return res.sendStatus(401);
    if (user.sid) {
      const revoked = await isSessionRevoked(user.sid);
      if (revoked) return res.sendStatus(401);
      touchDeviceSession(user.sid, user.id).catch(() => {});
    }
    req.user = user;
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
};

module.exports = authenticateToken;
