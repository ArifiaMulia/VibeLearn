import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Cpu, Key, Globe, Zap, Save, RefreshCw, CheckCircle, XCircle, Loader2, Shield, Eye, EyeOff, ChevronDown } from 'lucide-react';

export default function AISettingsPage() {
  const { authFetch } = useAuth();
  const { lang } = useLanguage();
  const isId = lang === 'id';

  const [settings, setSettings] = useState({
    ai_byteplus_api_key: '',
    ai_byteplus_endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    ai_default_model: 'dreamina-seedance-2-5',
    ai_enabled: 'true',
    ai_fallback_enabled: 'true',
  });
  const [apiKeySet, setApiKeySet] = useState(false);
  const [models, setModels] = useState([]);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveResult, setSaveResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/settings/ai').catch(() => ({})),
      authFetch('/ai/models').catch(() => ({ models: [] }))
    ]).then(([aiSettings, modelsData]) => {
      if (aiSettings && typeof aiSettings === 'object') {
        setSettings(prev => ({ ...prev, ...aiSettings }));
        if (aiSettings.ai_byteplus_api_key_set === 'true') setApiKeySet(true);
      }
      if (modelsData?.models) setModels(modelsData.models);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const payload = { ...settings };
      // Don't overwrite key with masked value
      if (apiKeySet && !payload.ai_byteplus_api_key.includes('...') === false) {
        delete payload.ai_byteplus_api_key;
      }
      if (payload.ai_byteplus_api_key && payload.ai_byteplus_api_key.includes('...')) {
        delete payload.ai_byteplus_api_key;
      }
      await authFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: payload })
      });
      setSaveResult({ ok: true, msg: isId ? 'Pengaturan berhasil disimpan!' : 'Settings saved successfully!' });
    } catch (err) {
      setSaveResult({ ok: false, msg: err.message || 'Save failed' });
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await authFetch('/settings/ai/test', {
        method: 'PUT',
        body: JSON.stringify({
          api_key: settings.ai_byteplus_api_key?.includes('...') ? null : settings.ai_byteplus_api_key,
          endpoint: settings.ai_byteplus_endpoint,
          model: settings.ai_default_model,
        })
      });
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    }
    setTesting(false);
  };

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const cardStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.25rem'
  };
  const inputStyle = {
    width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem',
    color: 'var(--text-primary)', fontSize: '0.85rem',
  };
  const labelStyle = {
    fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)',
    marginBottom: '0.35rem', display: 'block'
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
          {isId ? 'Kelola koneksi ke BytePlus ModelArk untuk fitur Instruktur AI' : 'Manage BytePlus ModelArk connection for AI Instructor feature'}
        </p>
      </div>

      {/* ── Section 1: Connection Status ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: apiKeySet ? '#10b981' : '#ef4444',
              boxShadow: apiKeySet ? '0 0 10px #10b981' : '0 0 10px #ef4444',
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {apiKeySet
                  ? (isId ? '✅ Terhubung ke BytePlus ModelArk' : '✅ Connected to BytePlus ModelArk')
                  : (isId ? '⚠️ Belum Dikonfigurasi' : '⚠️ Not Configured')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Region: ap-southeast-1 • {isId ? 'Model Aktif' : 'Active Model'}: {settings.ai_default_model}
              </div>
            </div>
          </div>
          <button
            onClick={handleTest}
            disabled={testing}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
              background: '#18181b', border: '1px solid #27272a',
              color: '#f4f4f5', fontSize: '0.78rem', fontWeight: 600,
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
              <span style={{ marginLeft: '0.4rem', color: 'var(--text-muted)' }}>
                {testResult.response || testResult.error || testResult.message}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: API Configuration ── */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={16} color="#f97316" />
          {isId ? 'Konfigurasi API' : 'API Configuration'}
        </h3>

        {/* API Key */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>
            <Shield size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
            BytePlus API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.ai_byteplus_api_key}
              onChange={e => { update('ai_byteplus_api_key', e.target.value); setApiKeySet(false); }}
              placeholder={isId ? 'Masukkan API Key BytePlus ModelArk Anda...' : 'Enter your BytePlus ModelArk API Key...'}
              style={{ ...inputStyle, paddingRight: '2.5rem', fontFamily: 'monospace' }}
            />
            <button
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
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem' }}>
              ✓ {isId ? 'Key tersimpan di database (ditampilkan tersamar)' : 'Key stored in database (displayed masked)'}
            </div>
          )}
        </div>

        {/* Endpoint */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>
            <Globe size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
            {isId ? 'URL Endpoint' : 'Endpoint URL'}
          </label>
          <input
            type="text"
            value={settings.ai_byteplus_endpoint}
            onChange={e => update('ai_byteplus_endpoint', e.target.value)}
            placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem' }}
          />
        </div>

        {/* Default Model */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>
            <Cpu size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
            {isId ? 'Model Default' : 'Default Model'}
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={settings.ai_default_model}
              onChange={e => update('ai_default_model', e.target.value)}
              style={{
                ...inputStyle,
                appearance: 'none',
                paddingRight: '2rem',
                cursor: 'pointer'
              }}
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.vendor} ({m.category})
                </option>
              ))}
            </select>
            <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
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
          width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
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
          padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)',
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
          📖 {isId ? 'Panduan Cepat: Mendapatkan API Key' : 'Quick Guide: Getting Your API Key'}
        </h3>
        <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>{isId ? 'Login ke ' : 'Login to '}<a href="https://console.byteplus.com" target="_blank" rel="noopener" style={{ color: '#f97316' }}>BytePlus Console</a> → ModelArk</li>
          <li>{isId ? 'Buat Endpoint untuk model yang diinginkan (misal: doubao-pro-32k)' : 'Create an Endpoint for your desired model (e.g., doubao-pro-32k)'}</li>
          <li>{isId ? 'Salin API Key dari halaman API Keys' : 'Copy API Key from the API Keys page'}</li>
          <li>{isId ? 'Tempel di form di atas dan klik Simpan Pengaturan' : 'Paste it in the form above and click Save Settings'}</li>
          <li>{isId ? 'Klik "Tes Koneksi" untuk memverifikasi' : 'Click "Test Connection" to verify'}</li>
        </ol>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
