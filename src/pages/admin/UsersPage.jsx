import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useBranding } from '../../contexts/BrandingContext';
import {
  Search, Trash2, Mail, UserPlus, X, Shield, Crown, User,
  KeyRound, ShieldCheck, ShieldAlert, Clock, Laptop, Smartphone,
  RefreshCw, Check, Ban, QrCode, Copy, LogOut, Activity, Lock, Globe,
} from 'lucide-react';

const ROLE_ICONS = { super_admin: Shield, master: Crown, participant: User };
const PLAN_COLORS = { free: 'var(--text-muted)', pro: 'var(--warning)', enterprise: 'var(--accent)' };

const MODULE_LABELS = {
  dashboard: 'Dashboard',
  courses: 'Courses',
  labs: 'AI Labs',
  news: 'Cyber News',
  leaderboard: 'Leaderboard',
  profile: 'Profile',
  users: 'User & Access Control',
  analytics: 'Analytics',
  subscriptions: 'Subscriptions',
  course_builder: 'Course Builder',
  certificates: 'Certificates',
  ai_settings: 'AI Connector',
};

const ALL_MODULE_KEYS = Object.keys(MODULE_LABELS);

// ─── MODAL 1: AUTHORIZE / EDIT USER & MODULE PERMISSIONS ─────────────────────
function UserPermissionModal({ initialUser, onClose, onSaved, authFetch }) {
  const { error: showError, success } = useAlert();
  const isEdit = Boolean(initialUser);
  const [form, setForm] = useState({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    password: '',
    role: initialUser?.role || 'participant',
    plan: initialUser?.plan || 'pro',
    status: initialUser?.status || 'active',
    allowed_modules: Array.isArray(initialUser?.allowed_modules)
      ? initialUser.allowed_modules
      : ['dashboard', 'courses', 'labs', 'news', 'leaderboard', 'profile'],
  });
  const [loading, setLoading] = useState(false);

  const toggleModule = (modKey) => {
    setForm(f => {
      const has = f.allowed_modules.includes(modKey);
      return {
        ...f,
        allowed_modules: has
          ? f.allowed_modules.filter(m => m !== modKey)
          : [...f.allowed_modules, modKey],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await authFetch(`/rbac/users/${initialUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
            plan: form.plan,
            status: form.status,
            allowed_modules: form.allowed_modules,
          }),
        });
        success(`Hak akses & profil ${form.name} berhasil diperbarui.`);
      } else {
        await authFetch('/rbac/users', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        success(`User Lark "${form.name}" berhasil diotorisasi.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.78)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
    }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 540, padding: '1.75rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
        <h3 style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={19} color="var(--primary)" />
          {isEdit ? 'Edit User & Module Permissions' : '+ Authorize Lark User'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          Atur identitas Lark, role Zero-Trust, status akun, dan izin modul aplikasi.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" required placeholder="Nama Lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Lark Email / Identity</label>
              <input className="form-input" type="email" required placeholder="nama@prasetia.co.id" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={e => {
                const newRole = e.target.value;
                setForm(f => ({
                  ...f,
                  role: newRole,
                  allowed_modules: newRole === 'super_admin' ? ALL_MODULE_KEYS : f.allowed_modules,
                }));
              }}>
                <option value="participant">Participant</option>
                <option value="master">Master / Instructor</option>
                <option value="super_admin">Super Admin (Owner)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Plan Tier</label>
              <select className="form-input" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active (Authorized)</option>
                <option value="suspended">Suspended (Blocked)</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Allowed Modules ({form.allowed_modules.length}/{ALL_MODULE_KEYS.length})</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setForm(f => ({ ...f, allowed_modules: ALL_MODULE_KEYS }))} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 700 }}>Pilih Semua</button>
                <button type="button" onClick={() => setForm(f => ({ ...f, allowed_modules: ['dashboard', 'courses', 'labs', 'news', 'leaderboard', 'profile'] }))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', cursor: 'pointer' }}>Default Peserta</button>
              </div>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.45rem',
              padding: '0.75rem', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
            }}>
              {ALL_MODULE_KEYS.map(key => {
                const checked = form.allowed_modules.includes(key);
                return (
                  <label key={key} style={{
                    display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem',
                    padding: '0.35rem 0.5rem', borderRadius: 6, cursor: 'pointer',
                    background: checked ? 'rgba(59,130,246,0.14)' : 'transparent',
                    border: checked ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                    color: checked ? '#60a5fa' : 'var(--text-secondary)',
                    fontWeight: checked ? 700 : 500,
                  }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleModule(key)} style={{ accentColor: '#3b82f6' }} />
                    {MODULE_LABELS[key]}
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1.5 }}>
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : '+ Otorisasi User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MODAL 2: PER-USER GOOGLE AUTHENTICATOR 2FA ENROLLMENT ───────────────────
function User2FAEnrollModal({ targetUser, onClose, onEnrolled, authFetch }) {
  const { error: showError, success } = useAlert();
  const [step, setStep] = useState('loading'); // loading | scan | done
  const [enrollData, setEnrollData] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    authFetch(`/rbac/users/${targetUser.id}/authenticator/enroll`, { method: 'POST' })
      .then(data => {
        if (!mounted) return;
        setEnrollData(data);
        setStep('scan');
      })
      .catch(err => {
        showError(err.message);
        onClose();
      });
    return () => { mounted = false; };
  }, [targetUser.id]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!totpCode.trim()) return showError('Masukkan 6 digit kode dari Google Authenticator.');
    setSubmitting(true);
    try {
      const res = await authFetch(`/rbac/users/${targetUser.id}/authenticator/confirm`, {
        method: 'POST',
        body: JSON.stringify({ code: totpCode.trim() }),
      });
      setRecoveryCodes(res.recoveryCodes || []);
      setStep('done');
      success(`Google Authenticator 2FA aktif untuk ${targetUser.email}!`);
      onEnrolled();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.82)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
    }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, padding: '1.75rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <h3 style={{ margin: '0 0 0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <QrCode size={20} color="#10b981" /> Pendaftaran Google Authenticator (2FA)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          User: <strong>{targetUser.name}</strong> ({targetUser.email})
        </p>

        {step === 'loading' && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Membuat kunci rahasia TOTP...</div>
        )}

        {step === 'scan' && enrollData && (
          <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: '#ffffff', borderRadius: 12, width: 'fit-content', margin: '0 auto' }}>
              <img src={enrollData.qrCodeDataUrl} alt="2FA QR Code" width={200} height={200} style={{ display: 'block' }} />
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-light)', fontSize: '0.76rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Manual Secret Key (Base32):</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <code style={{ color: '#f59e0b', fontWeight: 700, wordBreak: 'break-all' }}>{enrollData.secret}</code>
                <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }} onClick={() => { navigator.clipboard.writeText(enrollData.secret); success('Secret key disalin!'); }}>
                  <Copy size={13} /> Salin
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Masukkan Kode 6 Digit dari Google Authenticator</label>
              <input
                className="form-input"
                placeholder="Contoh: 123456"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value)}
                style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.18em', fontWeight: 800 }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1.5 }}>
                {submitting ? 'Memverifikasi...' : 'Verifikasi & Aktifkan 2FA'}
              </button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontSize: '0.82rem', fontWeight: 700 }}>
              ✅ Google Authenticator 2FA aktif! Simpan 8 kode pemulihan sekali pakai berikut:
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem',
              padding: '0.85rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
              fontFamily: 'monospace', fontSize: '0.76rem', color: '#f59e0b', fontWeight: 700,
            }}>
              {recoveryCodes.map(c => <div key={c}>{c}</div>)}
            </div>
            <button type="button" className="btn btn-primary" onClick={onClose}>Selesai</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL 3: BREAK-GLASS 2FA SECRET & RECOVERY VAULT MODAL ──────────────────
function BreakGlassVaultModal({ onClose, authFetch }) {
  const { error: showError, success } = useAlert();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const loadVault = async (regenerate = false) => {
    if (regenerate) setRegenerating(true);
    else setLoading(true);
    try {
      const data = await authFetch('/auth/break-glass/setup', {
        method: regenerate ? 'POST' : 'GET',
        ...(regenerate ? { body: JSON.stringify({ regenerate: true }) } : {}),
      });
      setVault(data);
      if (regenerate) success('Break-Glass 2FA Secret & 8 Recovery Keys berhasil di-regenerate!');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => { loadVault(false); }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.84)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
    }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 520, padding: '1.85rem', position: 'relative',
        border: '1px solid rgba(245,158,11,0.45)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.65rem' }}>
          <ShieldAlert size={13} /> INDEPENDENT OF LARK SUITE · RFC 6238 TOTP
        </div>
        <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem' }}>Break-Glass Emergency 2FA Vault</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Scan QR Code ini menggunakan <strong>Google Authenticator</strong>. Saat darurat di halaman login, tekan <code>Ctrl+Shift+M</code> untuk masuk tanpa Lark SSO.
        </p>

        {loading || !vault ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat Break-Glass Vault...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: 12 }}>
                <img src={vault.qrCodeDataUrl} alt="Break-Glass QR" width={185} height={185} style={{ display: 'block' }} />
              </div>
              <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ padding: '0.65rem 0.8rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTP Base32 Secret Key:</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <code style={{ color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700, wordBreak: 'break-all' }}>{vault.totpSecret}</code>
                    <button type="button" className="btn btn-ghost" style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }} onClick={() => { navigator.clipboard.writeText(vault.totpSecret); success('TOTP Secret disalin!'); }}>
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div style={{ padding: '0.65rem 0.8rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', fontSize: '0.76rem' }}>
                  Sisa Recovery Key Aktif: <strong style={{ color: '#10b981' }}>{vault.recoveryCodesAvailable} / 8</strong>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Single-Use Recovery Keys (Burn-on-Use):
              </div>
              {Array.isArray(vault.recoveryCodes) && vault.recoveryCodes.length > 0 ? (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem',
                  padding: '0.85rem', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)',
                  fontFamily: 'monospace', fontSize: '0.76rem', color: '#fbbf24', fontWeight: 700,
                }}>
                  {vault.recoveryCodes.map(c => <div key={c}>{c}</div>)}
                </div>
              ) : (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem',
                  padding: '0.75rem', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                  fontFamily: 'monospace', fontSize: '0.74rem', color: 'var(--text-muted)',
                }}>
                  {(vault.recoveryCodeHints || []).map((h, i) => (
                    <div key={i} style={{ textDecoration: h.used ? 'line-through' : 'none', color: h.used ? '#ef4444' : 'var(--text-secondary)' }}>
                      {h.hint} {h.used ? '(TERPAKAI)' : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.35rem' }}>
              <button
                type="button"
                disabled={regenerating}
                onClick={() => {
                  if (window.confirm('Regenerate 2FA Secret & 8 Recovery Keys baru? Kunci lama tidak akan berlaku lagi.')) {
                    loadVault(true);
                  }
                }}
                className="btn btn-ghost"
                style={{ color: '#f59e0b', border: '1px solid rgba(245,158,11,0.35)', fontSize: '0.78rem' }}
              >
                <RefreshCw size={14} /> {regenerating ? 'Regenerating...' : 'Regenerate 2FA & Recovery Keys'}
              </button>
              <button type="button" className="btn btn-primary" onClick={onClose}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE: USER & ACCESS CONTROL (ZERO-TRUST RBAC & SECURITY GOVERNANCE) ─
export default function UsersPage() {
  const { authFetch, user: currentUser, refreshSessionConfig } = useAuth();
  const { success, error: showError } = useAlert();
  const branding = useBranding();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    enrolled2faUsers: 0,
    breakGlassStatus: 'ENFORCED',
    accessMode: 'closed',
  });
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [agentTokens, setAgentTokens] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');

  // Modals
  const [permissionModalUser, setPermissionModalUser] = useState(undefined); // undefined = closed, null = new, object = edit
  const [enroll2faUser, setEnroll2faUser] = useState(null);
  const [showBreakGlassVaultModal, setShowBreakGlassVaultModal] = useState(false);
  const [showAllDevicesModal, setShowAllDevicesModal] = useState(false);

  // Session Governance state
  const [sessionTimeoutValue, setSessionTimeoutValue] = useState('30m');
  const [savingSessionGov, setSavingSessionGov] = useState(false);

  // Agent Access Token (Asisten AI) state — matches Screenshot 2
  const [agentTtlMinutes, setAgentTtlMinutes] = useState('30');
  const [agentReauthCode, setAgentReauthCode] = useState('');
  const [agentIssuing, setAgentIssuing] = useState(false);
  const [issuedAgentToken, setIssuedAgentToken] = useState(null);
  const [agentStatusMsg, setAgentStatusMsg] = useState('');
  const [agentStatusColor, setAgentStatusColor] = useState('#10b981');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const loadAllGovernanceData = useCallback(async () => {
    try {
      if (!isSuperAdmin) {
        const list = await authFetch('/users');
        setUsers(Array.isArray(list) ? list : []);
        setLoading(false);
        return;
      }

      const [statsRes, usersRes, reqsRes, logsRes, devRes, sessRes, agtRes] = await Promise.all([
        authFetch('/rbac/stats').catch(() => ({ stats: {} })),
        authFetch('/rbac/users').catch(() => ({ users: [] })),
        authFetch('/rbac/requests').catch(() => ({ requests: [] })),
        authFetch('/rbac/audit-logs?limit=150').catch(() => ({ logs: [] })),
        authFetch('/auth/devices').catch(() => ({ devices: [] })),
        authFetch('/auth/session-config').catch(() => ({ sessionIdleTimeout: '30m' })),
        authFetch('/auth/agent-tokens').catch(() => ({ tokens: [] })),
      ]);

      if (statsRes?.stats) setStats(prev => ({ ...prev, ...statsRes.stats }));
      if (Array.isArray(usersRes?.users)) setUsers(usersRes.users);
      if (Array.isArray(reqsRes?.requests)) setRequests(reqsRes.requests);
      if (Array.isArray(logsRes?.logs)) setAuditLogs(logsRes.logs);
      if (Array.isArray(devRes?.devices)) setDevices(devRes.devices);
      if (sessRes?.sessionIdleTimeout) setSessionTimeoutValue(sessRes.sessionIdleTimeout);
      if (Array.isArray(agtRes?.tokens)) setAgentTokens(agtRes.tokens);
    } catch (err) {
      showError('Gagal memuat data keamanan & akses kontrol.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, isSuperAdmin, showError]);

  useEffect(() => {
    loadAllGovernanceData();
  }, [loadAllGovernanceData]);

  // ── Handlers ──
  const handleToggleAccessMode = async (newMode) => {
    if (newMode === stats.accessMode) return;
    try {
      await authFetch('/rbac/access-mode', {
        method: 'POST',
        body: JSON.stringify({ access_mode: newMode }),
      });
      setStats(prev => ({ ...prev, accessMode: newMode }));
      if (branding?.refreshBranding) branding.refreshBranding();
      success(
        newMode === 'closed'
          ? 'Mode CLOSED-LOOP aktif: hanya login Lark Prasetia & Break-Glass 2FA (Ctrl+Shift+M).'
          : 'Mode PUBLIK aktif: semua perusahaan/pengguna dapat mengakses.'
      );
      loadAllGovernanceData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Hapus akses dan akun "${u.name}" (${u.email})?`)) return;
    try {
      await authFetch(`/rbac/users/${u.id}`, { method: 'DELETE' });
      success(`Akun ${u.email} telah dihapus.`);
      loadAllGovernanceData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRevoke2FA = async (u) => {
    if (!window.confirm(`Reset / cabut pendaftaran Google Authenticator 2FA untuk ${u.name} (${u.email})?`)) return;
    try {
      await authFetch(`/rbac/users/${u.id}/authenticator`, { method: 'DELETE' });
      success(`Google Authenticator 2FA untuk ${u.email} berhasil di-reset.`);
      loadAllGovernanceData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRequestDecision = async (reqId, decision) => {
    try {
      await authFetch(`/rbac/requests/${reqId}/${decision}`, { method: 'POST' });
      success(decision === 'approve' ? 'Permintaan akses disetujui!' : 'Permintaan akses ditolak.');
      loadAllGovernanceData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleSaveSessionGovernance = async () => {
    setSavingSessionGov(true);
    try {
      await authFetch('/auth/session-config', {
        method: 'POST',
        body: JSON.stringify({ sessionIdleTimeout: sessionTimeoutValue }),
      });
      if (refreshSessionConfig) refreshSessionConfig();
      success(`Session Governance diperbarui: Idle Auto-Logout = ${sessionTimeoutValue}.`);
      loadAllGovernanceData();
    } catch (err) {
      showError(err.message);
    } finally {
      setSavingSessionGov(false);
    }
  };

  const handleLogoutSingleDevice = async (sessionId) => {
    try {
      await authFetch(`/auth/devices/${encodeURIComponent(sessionId)}/logout`, { method: 'POST' });
      success('Perangkat berhasil di-logout.');
      loadAllGovernanceData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleLogoutAllOtherDevices = async () => {
    if (!window.confirm('Log out semua perangkat lain selain perangkat yang sedang Anda gunakan sekarang?')) return;
    try {
      const res = await authFetch('/auth/devices/logout-all-others', {
        method: 'POST',
        body: JSON.stringify({ allUsers: true }),
      });
      success(`${res.terminatedCount || 0} sesi perangkat lain berhasil dihentikan.`);
      loadAllGovernanceData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleIssueAgentToken = async () => {
    const code = agentReauthCode.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(code)) {
      setAgentStatusColor('#f87171');
      setAgentStatusMsg('Masukkan kode 6 digit Google Authenticator terlebih dahulu.');
      return;
    }
    setAgentIssuing(true);
    setAgentStatusMsg('Memverifikasi kode 2FA & menerbitkan token...');
    setAgentStatusColor('#94a3b8');
    try {
      const data = await authFetch('/auth/agent-token', {
        method: 'POST',
        body: JSON.stringify({
          ttlMinutes: Number(agentTtlMinutes) || 30,
          reauth: code,
        }),
      });
      setAgentReauthCode('');
      setIssuedAgentToken(data);
      setAgentStatusColor('#10b981');
      setAgentStatusMsg('Token diterbitkan.');
      loadAllGovernanceData();
    } catch (err) {
      setAgentStatusColor('#f87171');
      setAgentStatusMsg(err.message || 'Gagal menerbitkan token.');
    } finally {
      setAgentIssuing(false);
    }
  };

  const handleRevokeAllAgentTokens = async () => {
    try {
      const data = await authFetch('/auth/agent-tokens', { method: 'DELETE' });
      setIssuedAgentToken(null);
      setAgentStatusColor('#10b981');
      setAgentStatusMsg(`Dicabut (${data.revoked || 0} token aktif dihentikan).`);
      loadAllGovernanceData();
    } catch (err) {
      setAgentStatusColor('#f87171');
      setAgentStatusMsg(err.message || 'Gagal mencabut token.');
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(l => {
    const matchMod = auditModuleFilter === 'ALL' || String(l.module || '').toUpperCase() === auditModuleFilter;
    if (!matchMod) return false;
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      String(l.userEmail || '').toLowerCase().includes(q) ||
      String(l.userName || '').toLowerCase().includes(q) ||
      String(l.action || '').toLowerCase().includes(q) ||
      String(l.details || '').toLowerCase().includes(q) ||
      String(l.ip || '').toLowerCase().includes(q)
    );
  });

  const pendingRequestsList = requests.filter(r => r.status === 'pending');

  const formatIdDateTime = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    } catch {
      return String(iso);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Modals */}
      {permissionModalUser !== undefined && (
        <UserPermissionModal
          initialUser={permissionModalUser}
          onClose={() => setPermissionModalUser(undefined)}
          onSaved={loadAllGovernanceData}
          authFetch={authFetch}
        />
      )}
      {enroll2faUser && (
        <User2FAEnrollModal
          targetUser={enroll2faUser}
          onClose={() => setEnroll2faUser(null)}
          onEnrolled={loadAllGovernanceData}
          authFetch={authFetch}
        />
      )}
      {showBreakGlassVaultModal && (
        <BreakGlassVaultModal
          onClose={() => setShowBreakGlassVaultModal(false)}
          authFetch={authFetch}
        />
      )}

      {/* ── SECTION 1: KPI METRICS GRID (Matches secure.virtuenet.space) ── */}
      {isSuperAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.15rem 1.35rem', borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Lark Users
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, marginTop: '0.25rem' }}>{stats.totalUsers || users.length}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Registered Zero-Trust identities
            </div>
          </div>

          <div className="card" style={{ padding: '1.15rem 1.35rem', borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Users
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#10b981', marginTop: '0.25rem' }}>{stats.activeUsers || users.length}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {stats.enrolled2faUsers || 0} user dengan 2FA Google Authenticator
            </div>
          </div>

          <div className="card" style={{ padding: '1.15rem 1.35rem', borderLeft: '3px solid #f59e0b' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Approvals
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.25rem' }}>{pendingRequestsList.length}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Antrean permintaan akses modul
            </div>
          </div>

          <div className="card" style={{ padding: '1.15rem 1.35rem', borderLeft: '3px solid #a855f7' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Break-Glass 2FA Vault
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={20} /> {stats.breakGlassStatus || 'ENFORCED'}
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Hotkey darurat: <code style={{ color: '#f59e0b' }}>Ctrl+Shift+M</code>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: PLATFORM ACCESS POLICY (CLOSED-LOOP vs PUBLIC) ── */}
      {isSuperAdmin && (
        <div className="card" style={{
          padding: '1.15rem 1.35rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          background: stats.accessMode === 'closed'
            ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(15,23,42,0.9))'
            : 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(15,23,42,0.9))',
          border: stats.accessMode === 'closed' ? '1px solid rgba(16,185,129,0.35)' : '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: stats.accessMode === 'closed' ? 'rgba(16,185,129,0.16)' : 'rgba(59,130,246,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stats.accessMode === 'closed' ? '#10b981' : '#3b82f6',
            }}>
              {stats.accessMode === 'closed' ? <Lock size={20} /> : <Globe size={20} />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Zero-Trust Access Gate
                <span style={{
                  fontSize: '0.68rem', padding: '0.15rem 0.55rem', borderRadius: 999, fontWeight: 800,
                  background: stats.accessMode === 'closed' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                  color: stats.accessMode === 'closed' ? '#10b981' : '#60a5fa',
                }}>
                  {stats.accessMode === 'closed' ? 'CLOSED-LOOP (ONLY PRASETIA LARK)' : 'PUBLIC (ALL COMPANIES)'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Saat Closed-Loop aktif, form login password ditutup sepenuhnya. Hanya <strong>Login with Lark</strong> dan <strong>Break-Glass 2FA (Ctrl+Shift+M)</strong> yang diizinkan.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleToggleAccessMode('closed')}
              className="btn"
              style={{
                padding: '0.45rem 0.9rem', fontSize: '0.78rem', fontWeight: 800,
                background: stats.accessMode === 'closed' ? '#10b981' : 'var(--bg-surface)',
                color: stats.accessMode === 'closed' ? '#052e16' : 'var(--text-secondary)',
                border: '1px solid rgba(16,185,129,0.4)',
              }}
            >
              🔒 Closed-Loop (Prasetia Lark)
            </button>
            <button
              type="button"
              onClick={() => handleToggleAccessMode('public')}
              className="btn"
              style={{
                padding: '0.45rem 0.9rem', fontSize: '0.78rem', fontWeight: 800,
                background: stats.accessMode === 'public' ? '#3b82f6' : 'var(--bg-surface)',
                color: stats.accessMode === 'public' ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid rgba(59,130,246,0.4)',
              }}
            >
              🌐 Published (Public)
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION 3: PENDING ACCESS REQUESTS QUEUE ── */}
      {isSuperAdmin && pendingRequestsList.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', border: '1px solid rgba(245,158,11,0.4)' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
            ⏳ Pending Module Access Requests ({pendingRequestsList.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {pendingRequestsList.map(r => (
              <div key={r.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                    {r.user_name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({r.user_email})</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Meminta modul: <strong style={{ color: '#60a5fa' }}>{MODULE_LABELS[r.module] || r.module}</strong> · Alasan: {r.reason || '-'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <button type="button" onClick={() => handleRequestDecision(r.id, 'approve')} className="btn" style={{ background: '#10b981', color: '#052e16', fontWeight: 800, fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                    <Check size={14} /> Setujui
                  </button>
                  <button type="button" onClick={() => handleRequestDecision(r.id, 'reject')} className="btn" style={{ background: 'rgba(239,68,68,0.16)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)', fontWeight: 700, fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                    <Ban size={14} /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 4: USER CREDENTIAL & MODULE PERMISSION DIRECTORY ── */}
      <div className="card" style={{ padding: '1.35rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              👥 User Credential & Module Permission Directory
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Kelola otorisasi akun Lark, hak akses modul Zero-Trust, dan Google Authenticator 2FA per pengguna.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 250 }}>
              <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                placeholder="Cari nama, email, role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.82rem' }}
              />
            </div>
            {isSuperAdmin && (
              <button className="btn btn-primary" onClick={() => setPermissionModalUser(null)} style={{ fontSize: '0.82rem' }}>
                <UserPlus size={15} /> + Authorize Lark User
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.83rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>User Profile</th>
                <th style={{ padding: '0.75rem 1rem' }}>Lark Email / Identity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role & Plan</th>
                <th style={{ padding: '0.75rem 1rem' }}>Allowed Modules</th>
                <th style={{ padding: '0.75rem 1rem' }}>2FA Authenticator</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Last Activity</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const RoleIcon = ROLE_ICONS[u.role] || User;
                const mods = Array.isArray(u.allowed_modules) ? u.allowed_modules : ['courses', 'labs', 'news'];
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.84rem', color: 'white',
                        }}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {u.name}
                            {u.id === currentUser.id && (
                              <span className="badge badge-accent" style={{ marginLeft: 6, fontSize: '0.63rem' }}>You</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID #{u.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        <Mail size={12} color="var(--text-muted)" /> {u.email}
                      </div>
                      {u.lark_open_id && (
                        <div style={{ fontSize: '0.68rem', color: '#10b981', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                          Lark SSO Verified
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, textTransform: 'capitalize' }}>
                        <RoleIcon size={13} color={u.role === 'super_admin' ? '#f59e0b' : 'var(--primary)'} />
                        {u.role?.replace('_', ' ')}
                      </div>
                      <span style={{
                        display: 'inline-block', marginTop: '0.2rem', fontSize: '0.67rem', fontWeight: 800,
                        textTransform: 'uppercase', color: PLAN_COLORS[u.plan] || 'var(--text-muted)',
                      }}>
                        {u.plan} plan
                      </span>
                    </td>

                    <td style={{ padding: '0.8rem 1rem', maxWidth: 240 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {u.role === 'super_admin' ? (
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 6, background: 'rgba(168,85,247,0.16)', color: '#c084fc', fontWeight: 700 }}>
                            ALL MODULES (12/12)
                          </span>
                        ) : (
                          <>
                            {mods.slice(0, 4).map(m => (
                              <span key={m} style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem', borderRadius: 5, background: 'rgba(59,130,246,0.13)', color: '#60a5fa', fontWeight: 600 }}>
                                {MODULE_LABELS[m] || m}
                              </span>
                            ))}
                            {mods.length > 4 && (
                              <span style={{ fontSize: '0.68rem', padding: '0.12rem 0.4rem', borderRadius: 5, background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                                +{mods.length - 4}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '0.8rem 1rem' }}>
                      {u.totp_enabled ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem', width: 'fit-content',
                            padding: '0.18rem 0.55rem', borderRadius: 999,
                            background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem', fontWeight: 800,
                          }}>
                            <ShieldCheck size={12} /> 2FA Aktif
                          </span>
                          {isSuperAdmin && (
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => setEnroll2faUser(u)}
                                style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.68rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                              >
                                Atur Ulang QR
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRevoke2FA(u)}
                                style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.68rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                              >
                                Cabut
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Belum Terdaftar</span>
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => setEnroll2faUser(u)}
                              style={{
                                width: 'fit-content', padding: '0.22rem 0.55rem', borderRadius: 6,
                                background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.38)',
                                color: '#10b981', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                              }}
                            >
                              <QrCode size={11} /> Daftar 2FA
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem', borderRadius: 999, fontSize: '0.69rem', fontWeight: 800, textTransform: 'uppercase',
                        background: u.status === 'suspended' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: u.status === 'suspended' ? '#f87171' : '#10b981',
                      }}>
                        {u.status || 'active'}
                      </span>
                    </td>

                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {u.last_activity ? formatIdDateTime(u.last_activity) : 'Belum tercatat'}
                    </td>

                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                      {isSuperAdmin && (
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ padding: '0.32rem 0.6rem', fontSize: '0.74rem', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}
                            onClick={() => setPermissionModalUser(u)}
                          >
                            Edit Access
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            disabled={u.id === currentUser.id}
                            style={{ padding: '0.32rem', color: 'var(--danger)' }}
                            title="Delete User"
                            onClick={() => handleDeleteUser(u)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 5: GLOBAL USER HISTORY & SECURITY AUDIT TRAIL (#3) ── */}
      {isSuperAdmin && (
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="#38bdf8" /> Global User History & Security Audit Trail
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Rekam jejak real-time seluruh aktivitas login Lark, percobaan Break-Glass 2FA, perubahan RBAC, pencabutan sesi perangkat, dan penggunaan Agent Token.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="form-input"
                value={auditModuleFilter}
                onChange={e => setAuditModuleFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.78rem', padding: '0.4rem 0.7rem' }}
              >
                <option value="ALL">Semua Modul</option>
                <option value="AUTH">AUTH</option>
                <option value="BREAK_GLASS">BREAK_GLASS</option>
                <option value="2FA_AUTH">2FA_AUTH</option>
                <option value="RBAC">RBAC</option>
                <option value="DEVICE_MGMT">DEVICE_MGMT</option>
                <option value="SESSION_GOV">SESSION_GOV</option>
                <option value="AGENT_TOKEN">AGENT_TOKEN</option>
              </select>
              <input
                className="form-input"
                placeholder="Filter email, aksi, IP..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                style={{ width: 210, fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              />
              <button type="button" className="btn btn-ghost" onClick={loadAllGovernanceData} style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: 340, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.79rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem 0.9rem' }}>Timestamp</th>
                  <th style={{ padding: '0.65rem 0.9rem' }}>Actor / User</th>
                  <th style={{ padding: '0.65rem 0.9rem' }}>Action</th>
                  <th style={{ padding: '0.65rem 0.9rem' }}>Module</th>
                  <th style={{ padding: '0.65rem 0.9rem' }}>IP Address</th>
                  <th style={{ padding: '0.65rem 0.9rem' }}>Audit Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.map(log => {
                  const isAlert = /FAILED|DENIED|BLOCKED|REVOKE/i.test(log.action || '');
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.6rem 0.9rem', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {formatIdDateTime(log.timestamp)}
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem', fontWeight: 600 }}>
                        <div>{log.userName || '-'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.userEmail}</div>
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem' }}>
                        <span style={{
                          padding: '0.16rem 0.5rem', borderRadius: 6, fontFamily: 'monospace', fontSize: '0.71rem', fontWeight: 800,
                          background: isAlert ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.14)',
                          color: isAlert ? '#f87171' : '#34d399',
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.14rem 0.45rem', borderRadius: 5, background: 'var(--bg-surface)', color: '#93c5fd', fontWeight: 700 }}>
                          {log.module}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem', fontFamily: 'monospace', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {log.ip || '-'}
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem', color: 'var(--text-secondary)', maxWidth: 380 }}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
                {filteredAuditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Belum ada log audit yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SECTION 6 & 7: BREAK-GLASS VAULT (#4) + SESSION GOVERNANCE (#5) ── */}
      {isSuperAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {/* #4 Break-Glass Emergency Access Vault */}
          <div className="card" style={{
            padding: '1.35rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.92))',
            border: '1px solid rgba(245, 158, 11, 0.35)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  🛡️ Break-Glass Emergency Access Vault — Independent of Lark Suite
                </h3>
                <p style={{ margin: '0.45rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  Jika Lark Suite mengalami gangguan global, Super Admin tetap dapat masuk ke konsol menggunakan <strong>Google Authenticator (RFC 6238 TOTP)</strong> atau <strong>8 Single-Use Recovery Keys</strong> dengan menekan <code style={{ color: '#fbbf24', fontWeight: 800 }}>Ctrl+Shift+M</code> di halaman Login.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBreakGlassVaultModal(true)}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <KeyRound size={15} /> View 2FA Secret & Recovery Codes
              </button>
            </div>
          </div>

          {/* #5 Session Governance & Idle Auto-Logout */}
          <div className="card" style={{
            padding: '1.35rem',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(15, 23, 42, 0.92))',
            border: '1px solid rgba(59, 130, 246, 0.35)',
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={18} /> Session Governance & Idle Auto-Logout
            </h3>
            <p style={{ margin: '0.45rem 0 0.9rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Konfigurasi batas waktu tanpa aktivitas (inactivity timeout) sebelum sesi otomatis di-logout dan token dicabut. Sesi yang pasif lebih dari 1 jam akan diberi penanda peringatan.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-input"
                value={sessionTimeoutValue}
                onChange={e => setSessionTimeoutValue(e.target.value)}
                style={{ flex: '1 1 200px', fontSize: '0.84rem', fontWeight: 700 }}
              >
                <option value="5m">5 Menit (Ultra Strict)</option>
                <option value="10m">10 Menit (High Security)</option>
                <option value="30m">30 Menit (Recommended Default)</option>
                <option value="1h">1 Jam (Standard)</option>
                <option value="6h">6 Jam (Workday Shift)</option>
                <option value="12h">12 Jam (Extended)</option>
              </select>
              <button
                type="button"
                onClick={handleSaveSessionGovernance}
                disabled={savingSessionGov}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem' }}
              >
                {savingSessionGov ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 8: DEVICE MANAGEMENT (#6 — Matches secure.virtuenet.space) ── */}
      {isSuperAdmin && (
        <div className="card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Device management</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                You are currently logged in on these devices ({devices.length} active):
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowAllDevicesModal(true)}
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', color: '#60a5fa' }}
              >
                View All Devices ({devices.length}) &gt;
              </button>
              {devices.length > 1 && (
                <button
                  type="button"
                  onClick={handleLogoutAllOtherDevices}
                  className="btn"
                  style={{
                    fontSize: '0.78rem',
                    background: 'rgba(239,68,68,0.14)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.35)',
                    fontWeight: 700,
                  }}
                >
                  <LogOut size={14} /> Log Out All Other Devices
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {devices.slice(0, 5).map(d => {
              const isMobileDev = /Android|iPhone|iPad|iOS/i.test(`${d.deviceName} ${d.os}`);
              const DevIcon = isMobileDev ? Smartphone : Laptop;
              return (
                <div
                  key={d.sessionId}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem',
                    padding: '0.9rem 1.1rem', borderRadius: 10,
                    background: d.isCurrent ? 'rgba(59,130,246,0.08)' : 'var(--bg-surface)',
                    border: d.isCurrent ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: d.isCurrent ? 'rgba(59,130,246,0.18)' : 'rgba(148,163,184,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: d.isCurrent ? '#60a5fa' : 'var(--text-secondary)',
                    }}>
                      <DevIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {d.deviceName}
                        {d.isCurrent && (
                          <span style={{ fontSize: '0.66rem', padding: '0.12rem 0.5rem', borderRadius: 999, background: 'rgba(59,130,246,0.22)', color: '#60a5fa', fontWeight: 800 }}>
                            Current Device
                          </span>
                        )}
                        {d.isIdleOver1h && (
                          <span style={{ fontSize: '0.66rem', padding: '0.12rem 0.5rem', borderRadius: 999, background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontWeight: 800 }}>
                            ⚠️ IDLE &gt; 1H
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        {d.os} · {d.browser} · <span style={{ color: '#93c5fd' }}>{d.userEmail}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        📍 {d.location} ({d.ip}) · Active: <strong>{d.activeDuration}</strong> · Idle: <strong>{d.idleDuration}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!d.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleLogoutSingleDevice(d.sessionId)}
                        className="btn"
                        style={{
                          padding: '0.38rem 0.8rem', fontSize: '0.76rem', fontWeight: 700,
                          background: 'rgba(239,68,68,0.14)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)',
                        }}
                      >
                        Log Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: View All Devices */}
      {showAllDevicesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.82)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }} onClick={() => setShowAllDevicesModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, padding: '1.75rem', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowAllDevicesModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 0.35rem' }}>Active Device Sessions ({devices.length})</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Daftar seluruh perangkat yang memiliki sesi aktif di Promptara.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {devices.map(d => (
                <div key={d.sessionId} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
                  padding: '0.8rem 1rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {d.deviceName} {d.isCurrent && <span style={{ color: '#60a5fa', fontSize: '0.72rem' }}>(Current)</span>}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {d.userEmail} · {d.os} · {d.browser} · {d.ip} ({d.location})
                    </div>
                  </div>
                  {!d.isCurrent && (
                    <button type="button" onClick={() => handleLogoutSingleDevice(d.sessionId)} className="btn" style={{ padding: '0.3rem 0.7rem', fontSize: '0.74rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' }}>
                      Log Out
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 9: AGENT ACCESS TOKEN (ASISTEN AI) (#7 — Exact Match to Screenshot 2) ── */}
      {isSuperAdmin && (
        <div
          className="card"
          style={{
            padding: '1.35rem 1.5rem',
            background: 'rgba(15, 23, 42, 0.78)',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            borderRadius: 12,
          }}
        >
          <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.96rem', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.05rem' }}>🔑</span> Agent Access Token (asisten AI)
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.9rem 0', lineHeight: 1.55 }}>
            Token singkat yang hanya Anda yang bisa menerbitkan (wajib kode Google Authenticator). Hanya untuk{' '}
            <code>GET /api/health</code>, <code>GET /api/config</code>, <code>GET /api/news</code>, <code>GET /api/courses</code>, dan <code>GET /api/rbac/stats</code>. Tidak bisa ubah RBAC/pengaturan, atau menerbitkan token. Otomatis kedaluwarsa dan bisa dicabut kapan saja.
          </p>

          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={agentTtlMinutes}
              onChange={e => setAgentTtlMinutes(e.target.value)}
              style={{
                padding: '0.48rem 0.7rem',
                borderRadius: 6,
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
                fontSize: '0.8rem',
              }}
            >
              <option value="15">15 menit</option>
              <option value="30">30 menit</option>
              <option value="60">60 menit</option>
              <option value="120">120 menit</option>
              <option value="240">240 menit (maks)</option>
            </select>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="Kode Authenticator 6 digit"
              value={agentReauthCode}
              onChange={e => setAgentReauthCode(e.target.value)}
              style={{
                padding: '0.48rem 0.75rem',
                borderRadius: 6,
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
                fontSize: '0.8rem',
                width: 190,
                letterSpacing: '0.08em',
              }}
            />

            <button
              type="button"
              onClick={handleIssueAgentToken}
              disabled={agentIssuing}
              style={{
                padding: '0.48rem 0.9rem',
                borderRadius: 6,
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {agentIssuing ? 'Menerbitkan...' : 'Terbitkan token'}
            </button>

            <button
              type="button"
              onClick={handleRevokeAllAgentTokens}
              style={{
                padding: '0.48rem 0.8rem',
                borderRadius: 6,
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Cabut semua
            </button>
          </div>

          {issuedAgentToken && (
            <div
              style={{
                marginTop: '0.85rem',
                padding: '0.75rem 0.95rem',
                borderRadius: 6,
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#fef08a',
                wordBreak: 'break-all',
              }}
            >
              <div style={{ fontFamily: 'sans-serif', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Salin sekarang, token hanya ditampilkan sekali:</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(issuedAgentToken.token);
                    success('Agent Access Token disalin ke clipboard!');
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', borderRadius: 5, padding: '0.18rem 0.55rem', fontSize: '0.7rem', cursor: 'pointer',
                  }}
                >
                  Salin Token
                </button>
              </div>
              <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>{issuedAgentToken.token}</div>
              <div style={{ marginTop: '0.35rem', color: '#94a3b8', fontSize: '0.72rem' }}>
                ID {issuedAgentToken.id} · berlaku sampai {formatIdDateTime(issuedAgentToken.expiresAt)}
              </div>
            </div>
          )}

          {agentStatusMsg && (
            <div style={{ marginTop: '0.55rem', fontSize: '0.76rem', color: agentStatusColor, fontWeight: 600 }}>
              {agentStatusMsg}
            </div>
          )}

          <div style={{ marginTop: '0.6rem', fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.65 }}>
            {agentTokens.length === 0 ? (
              <span>Belum ada token yang pernah diterbitkan.</span>
            ) : (
              agentTokens.slice(0, 6).map(t => {
                const status = t.revokedAt ? 'dicabut' : t.active ? 'AKTIF' : 'kedaluwarsa';
                const exp = formatIdDateTime(t.expiresAt);
                const used = t.lastUsedAt ? `, terakhir dipakai ${formatIdDateTime(t.lastUsedAt)}` : '';
                return (
                  <div key={t.id}>
                    <code>{t.id}</code> ·{' '}
                    <span style={{ color: t.active ? '#34d399' : '#94a3b8', fontWeight: t.active ? 700 : 400 }}>
                      {status}
                    </span>{' '}
                    · berakhir {exp}
                    {used}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
