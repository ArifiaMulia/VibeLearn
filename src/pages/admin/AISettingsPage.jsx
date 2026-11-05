import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Cpu, Key, Zap, Save, CheckCircle, XCircle, Loader2, Shield, Eye, EyeOff, Hash } from 'lucide-react';

// Preset Endpoint Keys from BytePlus ModelArk Console (ap-southeast-1)
const PRESET_ENDPOINTS = [
  { key: 'ep-m-20260901155951-5j5cm', model: 'Dola-Seed-2.1-turbo | 260628', slug: 'dola-seed-2-1-turbo', desc: 'Text / High-Performance (Recommended)' },
  { key: 'ep-m-20260901180305-dhp5h', model: 'Dola-Seedream-5.0-pro | 260628', slug: 'dola-seed-2-1-turbo', desc: 'Multimodal Pro' },
  { key: 'ep-m-20260903111943-9s59c', model: 'Dola-Seed-Evolving | latest', slug: 'dola-seed-evolving', desc: 'Adaptive Reasoning' },
  { key: 'ep-m-20261022110540-tqqr4', model: 'Dola-Seedream-5.0-flash | 260915', slug: 'dola-seed-2-0-lite', desc: 'Low-Latency Flash' },
  { key: 'ep-m-20261030020800-5txln', model: 'Dreamina-Seedance-2.0 | 260128', slug: 'dreamina-seedance-2-5', desc: 'Creative & Code Generation' },
  { key: 'ep-m-20261030020834-67d5d', model: 'Dreamina-Seedance-2.0-fast | 260128', slug: 'dreamina-seedance-2-5', desc: 'Fast Creative Coding' },
  { key: 'ep-m-20261030020835-t5jgb', model: 'Dreamina-Seedance-2.0-mini | 260615', slug: 'dola-seed-2-0-mini', desc: 'Lightweight Mini' },
  { key: 'ep-m-20261021145940-xj6qh', model: 'DeepSeek-V4.1-Flash-Economy | 261017', slug: 'deepseek-v4-lite', desc: 'DeepSeek Economy' },
];

export default function AISettingsPage() {
  const { authFetch } = useAuth();
  const { lang } = useLanguage();
  const isId = lang === 'id';

  const [settings, setSettings] = useState({
    ai_byteplus_api_key: '',
    ai_byteplus_endpoint: 'ep-m-20260901155951-5j5cm',
    ai_default_model: 'dola-seed-2-1-turbo',
    ai_enabled: 'true',
    ai_fallback_enabled: 'true',
  });
  const [apiKeySet, setApiKeySet] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveResult, setSaveResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/settings/ai')
      .catch(() => ({}))
      .then((aiSettings) => {
        if (aiSettings && typeof aiSettings === 'object') {
          setSettings(prev => ({
            ...prev,
            ...aiSettings,
            ai_byteplus_endpoint:
              aiSettings.ai_byteplus_endpoint &&
              aiSettings.ai_byteplus_endpoint !== 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
                ? aiSettings.ai_byteplus_endpoint
                : 'ep-m-20260901155951-5j5cm',
          }));
          if (aiSettings.ai_byteplus_api_key_set === 'true') setApiKeySet(true);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const payload = { ...settings };
      const rawKey = (payload.ai_byteplus_api_key || '').trim();

      // Only skip updating the key if the field still contains the masked value ("...")
      if (!rawKey || rawKey.includes('...')) {
        delete payload.ai_byteplus_api_key;
      }

      // Sync default model slug if matching preset endpoint key is selected
      const matchedPreset = PRESET_ENDPOINTS.find(p => p.key === payload.ai_byteplus_endpoint);
      if (matchedPreset) {
        payload.ai_default_model = matchedPreset.slug;
      }

      await authFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: payload })
      });

      if (rawKey && !rawKey.includes('...') && rawKey.length >= 8) {
        setApiKeySet(true);
      }
      setSaveResult({ ok: true, msg: isId ? 'Pengaturan API Key & Endpoint Key berhasil disimpan!' : 'API Key & Endpoint Key saved successfully!' });
    } catch (err) {
      setSaveResult({ ok: false, msg: err.message || 'Save failed' });
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const rawKey = (settings.ai_byteplus_api_key || '').trim();
      const res = await authFetch('/settings/ai/test', {
        method: 'PUT',
        body: JSON.stringify({
          api_key: rawKey.includes('...') ? null : rawKey,
          endpoint: (settings.ai_byteplus_endpoint || '').trim(),
          endpoint_key: (settings.ai_byteplus_endpoint || '').trim(),
          model: settings.ai_default_model,
        })
      });
      setTestResult(res);
      if (res?.success) {
        setApiKeySet(true);
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    }
    setTesting(false);
  };

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const activePreset = PRESET_ENDPOINTS.find(p => p.key === settings.ai_byteplus_endpoint);

  const cardStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.25rem'
  };
  const inputStyle = {
    width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.85rem',
    color: 'var(--text-primary)', fontSize: '0.85rem',
  };
  const labelStyle = {
    fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
    marginBottom: '0.4rem', display: 'block'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#f97316' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={20} color="white" />
          </div>
          {isId ? 'Pengaturan Konektor AI' : 'AI Connector Settings'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.4rem 0 0 0' }}>
          {isId
            ? 'Cukup masukkan BytePlus API Key dan Endpoint Key (Endpoint ID) dari BytePlus ModelArk Console'
            : 'Simply enter your BytePlus API Key and Endpoint Key (Endpoint ID) from BytePlus ModelArk Console'}
        </p>
      </div>

      {/* ── Section 1: Connection Status ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: testResult ? '1rem' : 0, flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: apiKeySet ? '#10b981' : '#ef4444',
              boxShadow: apiKeySet ? '0 0 10px #10b981' : '0 0 10px #ef4444',
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {apiKeySet
                  ? (isId ? '✅ Terhubung ke BytePlus ModelArk' : '✅ Connected to BytePlus ModelArk')
                  : (isId ? '⚠️ Belum Dikonfigurasi' : '⚠️ Not Configured')}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Region: <code>ap-southeast-1</code> • Endpoint Key: <code>{settings.ai_byteplus_endpoint || '-'}</code>
                {activePreset ? ` (${activePreset.model.split('|')[0].trim()})` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleTest}
            disabled={testing}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.05rem', borderRadius: 'var(--radius-sm)',
              background: '#18181b', border: '1px solid #27272a',
              color: '#f4f4f5', fontSize: '0.8rem', fontWeight: 600,
              cursor: testing ? 'wait' : 'pointer'
            }}
          >
            {testing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
            {isId ? 'Tes Koneksi' : 'Test Connection'}
          </button>
        </div>

        {testResult && (
          <div style={{
            padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
            background: testResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${testResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.8rem', color: testResult.success ? '#10b981' : '#ef4444'
          }}>
            {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <div>
              <strong>{testResult.success ? (isId ? 'Berhasil!' : 'Success!') : (isId ? 'Gagal' : 'Failed')}</strong>
              <span style={{ marginLeft: '0.4rem', color: 'var(--text-primary)' }}>
                {testResult.response || testResult.error || testResult.message}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Simplified 2-Field Configuration (API Key + Endpoint Key) ── */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 1.1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={16} color="#f97316" />
          {isId ? 'Kredensial BytePlus ModelArk' : 'BytePlus ModelArk Credentials'}
        </h3>

        {/* 1. BytePlus API Key */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>
            <Shield size={13} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: '#f97316' }} />
            1. BytePlus API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.ai_byteplus_api_key}
              onChange={e => update('ai_byteplus_api_key', e.target.value)}
              placeholder={isId ? 'Tempel API Key dari BytePlus Console (contoh: VxCgNvLTE...)' : 'Paste API Key from BytePlus Console...'}
              style={{ ...inputStyle, paddingRight: '2.5rem', fontFamily: 'monospace' }}
            />
            <button
              type="button"
              onClick={() => setShowKey(v => !v)}
              style={{
                position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem'
              }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {apiKeySet && (
            <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.3rem', fontWeight: 600 }}>
              ✓ {isId ? 'API Key aktif dan tersimpan aman di database' : 'API Key active and securely stored in database'}
            </div>
          )}
        </div>

        {/* 2. Endpoint Key / Endpoint ID */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>
            <Hash size={13} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: '#7c3aed' }} />
            2. Endpoint Key / Endpoint ID
          </label>
          <input
            type="text"
            value={settings.ai_byteplus_endpoint}
            onChange={e => {
              const val = e.target.value;
              update('ai_byteplus_endpoint', val);
              const match = PRESET_ENDPOINTS.find(p => p.key === val.trim());
              if (match) update('ai_default_model', match.slug);
            }}
            placeholder="ep-m-20260901155951-5j5cm"
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {isId
              ? 'Masukkan Endpoint ID dari menu Online Inference BytePlus (contoh: ep-m-20260901155951-5j5cm) atau klik salah satu preset di bawah:'
              : 'Enter the Endpoint ID from BytePlus Online Inference (e.g. ep-m-20260901155951-5j5cm) or pick a preset below:'}
          </div>

          {/* Quick-Select Preset Endpoint Keys from User's BytePlus Console */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '0.5rem',
            marginTop: '0.65rem'
          }}>
            {PRESET_ENDPOINTS.map(preset => {
              const isSelected = settings.ai_byteplus_endpoint === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => {
                    update('ai_byteplus_endpoint', preset.key);
                    update('ai_default_model', preset.slug);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1.5px solid #7c3aed' : '1px solid var(--border-light)',
                    background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isSelected ? '#7c3aed' : 'var(--text-primary)' }}>
                      {preset.model}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '0.65rem', background: '#7c3aed', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>
                        Aktif
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {preset.key}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
          {/* AI Enabled */}
          <div
            onClick={() => update('ai_enabled', settings.ai_enabled === 'true' ? 'false' : 'true')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{
              width: 42, height: 24, borderRadius: 12,
              background: settings.ai_enabled === 'true' ? '#10b981' : '#3f3f46',
              position: 'relative', transition: 'background 0.2s'
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: settings.ai_enabled === 'true' ? 21 : 3,
                transition: 'left 0.2s'
              }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {isId ? 'API Live Aktif' : 'Live API Enabled'}
            </span>
          </div>

          {/* Fallback Enabled */}
          <div
            onClick={() => update('ai_fallback_enabled', settings.ai_fallback_enabled === 'true' ? 'false' : 'true')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{
              width: 42, height: 24, borderRadius: 12,
              background: settings.ai_fallback_enabled === 'true' ? '#10b981' : '#3f3f46',
              position: 'relative', transition: 'background 0.2s'
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: settings.ai_fallback_enabled === 'true' ? 21 : 3,
                transition: 'left 0.2s'
              }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {isId ? 'Fallback Engine Aktif' : 'Fallback Engine Enabled'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Save Button ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, #f97316, #7c3aed)',
          border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
          cursor: saving ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          marginBottom: '0.75rem'
        }}
      >
        {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
        {isId ? 'Simpan Pengaturan' : 'Save Settings'}
      </button>

      {saveResult && (
        <div style={{
          padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
          background: saveResult.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${saveResult.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontSize: '0.8rem', color: saveResult.ok ? '#10b981' : '#ef4444',
          textAlign: 'center', marginBottom: '1.25rem'
        }}>
          {saveResult.ok ? <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> : <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />}
          {saveResult.msg}
        </div>
      )}

      {/* ── Section 3: Quick Guide ── */}
      <div style={{ ...cardStyle, background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.2)' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: '#f97316' }}>
          📖 {isId ? 'Panduan Cepat: Hanya Butuh API Key & Endpoint Key' : 'Quick Guide: Only API Key & Endpoint Key Needed'}
        </h3>
        <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>{isId ? 'Buka ' : 'Open '}<a href="https://console.byteplus.com" target="_blank" rel="noopener" style={{ color: '#f97316' }}>BytePlus Console</a> → <strong>ModelArk → API keys</strong>, lalu salin <strong>API Key</strong> Anda.</li>
          <li>{isId ? 'Buka menu ' : 'Open '}<strong>Online inference → Preset inference endpoint</strong>, lalu salin kode <strong>Endpoint ID</strong> (misal: <code>ep-m-20260901155951-5j5cm</code> untuk <em>Dola-Seed-2.1-turbo</em>) atau klik langsung daftar preset di atas.</li>
          <li>{isId ? 'Klik ' : 'Click '}<strong>Simpan Pengaturan</strong> {isId ? 'lalu klik ' : 'then click '}<strong>Tes Koneksi</strong> — URL API BytePlus (<code>ap-southeast-1</code>) akan diatur secara otomatis oleh sistem!</li>
        </ol>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
