const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'vibelearn_super_secret_jwt_2026';

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, plan: user.plan }, jwtSecret, { expiresIn: '24h' });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });
    // Log login activity
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type) VALUES ($1, $2, $3)', [user.id, 'login', 'auth']);
    await pool.query('UPDATE users SET last_activity = NOW() WHERE id = $1', [user.id]);
    const token = generateToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, avatar: user.avatar }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register (public self-registration — free plan)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, plan) VALUES ($1, $2, $3, 'participant', 'free') RETURNING id, name, email, role, plan`,
      [name, email, hashed]
    );
    const user = result.rows[0];
    // Auto-enroll in free courses
    await pool.query(`INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, 'free', 'active')`, [user.id]);
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/activity
router.post('/activity', require('../middleware/auth'), async (req, res) => {
  try {
    await pool.query('UPDATE users SET last_activity = NOW() WHERE id = $1', [req.user.id]);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/lark/config
router.get('/lark/config', (req, res) => {
  const appId = process.env.LARK_APP_ID;
  const redirectUri = req.query.redirect_uri;
  if (!appId || appId === 'YOUR_APP_ID') {
    return res.status(500).json({ error: 'Lark SSO is not configured on the server. Please set LARK_APP_ID in .env' });
  }
  if (!redirectUri) {
    return res.status(400).json({ error: 'redirect_uri query parameter is required' });
  }
  const baseUrl = process.env.LARK_API_BASE_URL || 'https://open.larksuite.com';
  const authUrl = `${baseUrl}/open-apis/authen/v1/index?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=lark_sso`;
  res.json({ authUrl });
});

// POST /api/auth/lark/callback
router.post('/lark/callback', async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code) return res.status(400).json({ error: 'Authorization code is required' });

  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;
  const baseUrl = process.env.LARK_API_BASE_URL || 'https://open.larksuite.com';

  if (!appId || !appSecret || appId === 'YOUR_APP_ID' || appSecret === 'YOUR_APP_SECRET') {
    return res.status(500).json({ error: 'Lark SSO is not configured on the server.' });
  }

  try {
    // 1. Get app_access_token
    const appTokenRes = await fetch(`${baseUrl}/open-apis/auth/v3/app_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    });
    const appTokenData = await appTokenRes.json();
    if (!appTokenRes.ok || appTokenData.code !== 0) {
      console.error('Lark app_access_token error:', appTokenData);
      return res.status(500).json({ error: appTokenData.msg || 'Failed to fetch Lark app access token.' });
    }
    const appAccessToken = appTokenData.app_access_token;

    // 2. Exchange code for user_access_token and user info
    const userTokenRes = await fetch(`${baseUrl}/open-apis/authen/v1/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${appAccessToken}`
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code
      }),
    });
    const userTokenData = await userTokenRes.json();
    if (!userTokenRes.ok || userTokenData.code !== 0) {
      console.error('Lark user access token error:', userTokenData);
      return res.status(400).json({ error: userTokenData.msg || 'Failed to authorize with Lark.' });
    }

    const { name, email: larkEmail, avatar_url, open_id } = userTokenData.data;

    // Safeguard: Fallback email if email is not shared or empty
    const email = larkEmail || `${open_id}@lark.vibelearn.id`;

    // 3. Check if user already exists
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userResult.rows.length === 0) {
      // Register new user
      const randPassword = require('crypto').randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randPassword, 10);
      
      const insertResult = await pool.query(
        `INSERT INTO users (name, email, password, role, plan, avatar) 
         VALUES ($1, $2, $3, 'participant', 'free', $4) 
         RETURNING *`,
        [name, email, hashedPassword, avatar_url || null]
      );
      user = insertResult.rows[0];

      // Auto-enroll in free subscription
      await pool.query(
        `INSERT INTO subscriptions (user_id, plan, status) 
         VALUES ($1, 'free', 'active') 
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      ).catch(() => {});
    } else {
      user = userResult.rows[0];
      // Update avatar if changed
      if (avatar_url && user.avatar !== avatar_url) {
        await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatar_url, user.id]).catch(() => {});
        user.avatar = avatar_url;
      }
    }

    // Log login activity
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type) VALUES ($1, $2, $3)', [user.id, 'lark_login', 'auth']).catch(() => {});
    await pool.query('UPDATE users SET last_activity = NOW() WHERE id = $1', [user.id]).catch(() => {});

    // 4. Generate JWT
    const token = generateToken(user);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        avatar: user.avatar
      },
      token
    });

  } catch (err) {
    console.error('Lark SSO callback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
