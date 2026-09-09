const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

// GET /api/settings — super_admin only, all settings
router.get('/', auth, requireRole('super_admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM system_settings ORDER BY key');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    console.error('GET settings error:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// PUT /api/settings — super_admin only, upsert multiple settings
router.put('/', auth, requireRole('super_admin'), async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'settings object is required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        `INSERT INTO system_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, String(value)]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Settings saved successfully', count: Object.keys(settings).length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT settings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  } finally {
    client.release();
  }
});

// GET /api/settings/ai — super_admin only, AI-related settings (masked key)
router.get('/ai', auth, requireRole('super_admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT key, value FROM system_settings WHERE key LIKE 'ai_%' ORDER BY key`
    );
    const settings = {};
    result.rows.forEach(r => {
      if (r.key === 'ai_byteplus_api_key' && r.value && r.value.length > 12) {
        settings[r.key] = r.value.substring(0, 8) + '...' + r.value.substring(r.value.length - 4);
        settings['ai_byteplus_api_key_set'] = 'true';
      } else {
        settings[r.key] = r.value;
      }
    });
    res.json(settings);
  } catch (err) {
    console.error('GET AI settings error:', err);
    res.status(500).json({ error: 'Failed to load AI settings' });
  }
});

// PUT /api/settings/ai/test — super_admin only, test API connection
router.put('/ai/test', auth, requireRole('super_admin'), async (req, res) => {
  const { api_key, endpoint, model } = req.body;

  // If no key provided, try to load from DB
  let key = api_key;
  let ep = endpoint || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  if (!key) {
    try {
      const dbKey = await pool.query(`SELECT value FROM system_settings WHERE key = 'ai_byteplus_api_key'`);
      if (dbKey.rows.length) key = dbKey.rows[0].value;
    } catch {}
  }

  if (!key || key.length < 10) {
    return res.status(400).json({ success: false, error: 'No API key provided or configured.' });
  }

  try {
    const testRes = await fetch(ep, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || 'doubao-pro-32k',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Connection OK" in exactly 2 words.' }
        ],
        temperature: 0,
        max_tokens: 20
      })
    });

    const data = await testRes.json();

    if (data.choices && data.choices[0]?.message?.content) {
      res.json({
        success: true,
        message: 'Connection successful!',
        response: data.choices[0].message.content,
        model: model || 'doubao-pro-32k',
        latency_hint: 'Real-time'
      });
    } else {
      res.json({
        success: false,
        error: data.error?.message || data.msg || 'Unexpected response from API',
        raw: data
      });
    }
  } catch (err) {
    res.json({
      success: false,
      error: `Connection failed: ${err.message}`
    });
  }
});

module.exports = router;
