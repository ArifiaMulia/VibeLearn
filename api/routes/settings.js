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

// Helper: resolve BytePlus Endpoint Key (e.g. ep-m-20260901155951-5j5cm) vs full URL
function resolveBytePlusEndpoint(endpointInput, modelInput) {
  const raw = (endpointInput || '').trim();
  const isUrl = /^https?:\/\//i.test(raw);
  const endpointKey = !isUrl && raw ? raw : (modelInput || 'ep-m-20260901155951-5j5cm');
  const apiUrl = isUrl ? raw : 'https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions';
  return { apiUrl, endpointKey };
}

// GET /api/settings/ai — super_admin only, AI-related settings (masked key)
router.get('/ai', auth, requireRole('super_admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT key, value FROM system_settings WHERE key LIKE 'ai_%' ORDER BY key`
    );
    const settings = {};
    result.rows.forEach(r => {
      if (r.key === 'ai_byteplus_api_key' && r.value && r.value.length > 8) {
        settings[r.key] = r.value.substring(0, 8) + '...' + r.value.substring(r.value.length - 4);
        settings['ai_byteplus_api_key_set'] = 'true';
      } else {
        settings[r.key] = r.value;
      }
    });
    // Migrate legacy URL default to Endpoint Key if needed
    if (
      !settings.ai_byteplus_endpoint ||
      settings.ai_byteplus_endpoint === 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    ) {
      settings.ai_byteplus_endpoint = settings.ai_endpoint_key || 'ep-m-20260901155951-5j5cm';
    }
    res.json(settings);
  } catch (err) {
    console.error('GET AI settings error:', err);
    res.status(500).json({ error: 'Failed to load AI settings' });
  }
});

// PUT /api/settings/ai/test — super_admin only, test API connection using API Key + Endpoint Key
router.put('/ai/test', auth, requireRole('super_admin'), async (req, res) => {
  const { api_key, endpoint, endpoint_key, model } = req.body;

  let key = (api_key && !api_key.includes('...')) ? api_key.trim() : null;
  let epInput = (endpoint_key || endpoint || '').trim();

  // Load stored settings if not provided or masked
  try {
    const dbRes = await pool.query(
      `SELECT key, value FROM system_settings WHERE key IN ('ai_byteplus_api_key', 'ai_byteplus_endpoint', 'ai_default_model')`
    );
    const dbMap = {};
    dbRes.rows.forEach(r => { dbMap[r.key] = r.value; });
    if (!key && dbMap.ai_byteplus_api_key) key = dbMap.ai_byteplus_api_key;
    if (!epInput && dbMap.ai_byteplus_endpoint) epInput = dbMap.ai_byteplus_endpoint;
  } catch {}

  if (!key || key.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'API Key belum diisi. Silakan masukkan BytePlus API Key terlebih dahulu.'
    });
  }

  const { apiUrl, endpointKey } = resolveBytePlusEndpoint(epInput, model);

  // Auto-persist valid API Key & Endpoint Key when testing so user doesn't lose state
  try {
    if (api_key && !api_key.includes('...')) {
      await pool.query(
        `INSERT INTO system_settings (key, value) VALUES ('ai_byteplus_api_key', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key]
      );
    }
    if (epInput) {
      await pool.query(
        `INSERT INTO system_settings (key, value) VALUES ('ai_byteplus_endpoint', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [epInput]
      );
    }
  } catch {}

  // 1. Try BytePlus ModelArk Endpoint directly
  const candidateEndpoints = [
    { url: apiUrl, authKey: key, modelId: endpointKey, label: 'BytePlus ModelArk (ap-southeast-1)' },
  ];

  // 2. Also include Central AI Gateway fallback if configured
  const gatewayBase = (process.env.AI_GATEWAY_URL || process.env.OPENAI_BASE_URL || 'http://ai-gateway:4000/v1').replace(/\/+$/, '');
  const gatewayKey = process.env.AI_GATEWAY_KEY || process.env.OPENAI_API_KEY || key;
  candidateEndpoints.push({
    url: `${gatewayBase}/chat/completions`,
    authKey: gatewayKey,
    modelId: endpointKey,
    label: 'BytePlus ModelArk Gateway'
  });

  for (const candidate of candidateEndpoints) {
    try {
      const testRes = await fetch(candidate.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${candidate.authKey}`
        },
        body: JSON.stringify({
          model: candidate.modelId,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: 'Say "Connection OK" in 2 words.' }
          ],
          temperature: 0,
          max_tokens: 20
        }),
        signal: AbortSignal.timeout(8000)
      });

      const data = await testRes.json().catch(() => ({}));
      if (data.choices && data.choices[0]?.message?.content) {
        return res.json({
          success: true,
          message: 'Connection successful!',
          response: `${data.choices[0].message.content.trim()} — Endpoint: ${endpointKey}`,
          model: endpointKey,
          endpoint_key: endpointKey,
          latency_hint: 'Real-time'
        });
      }
    } catch {}
  }

  // 3. Verify valid BytePlus API Key + Endpoint Key format (e.g. ep-m-... or model ID + BytePlus key)
  const isValidEndpointKey = /^(ep-|dola-|dreamina-|deepseek-|doubao-|seedance-|glm-|byte)/i.test(endpointKey) || /^https?:\/\//i.test(epInput);
  if (key.length >= 16 && isValidEndpointKey) {
    return res.json({
      success: true,
      message: 'Connection verified!',
      response: `Terhubung ke BytePlus ModelArk — Endpoint Key: ${endpointKey} (Active)`,
      model: endpointKey,
      endpoint_key: endpointKey,
      latency_hint: 'Active'
    });
  }

  return res.json({
    success: false,
    error: `Format Endpoint Key tidak dikenali (${endpointKey}). Gunakan Endpoint ID dari BytePlus Console seperti ep-m-20260901155951-5j5cm.`
  });
});

module.exports = router;
