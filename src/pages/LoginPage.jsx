import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import {
  Eye, EyeOff, ArrowRight, BookOpen, FlaskConical, Trophy,
  Lock, Smartphone, ShieldAlert, KeyRound, X,
} from 'lucide-react';
import MobileInstallModal from '../components/MobileInstallModal';
import { useBranding } from '../contexts/BrandingContext';

export default function LoginPage() {
  const { login, breakGlassLogin, register, user, sessionIdleLabel } = useAuth();
  const { error: showError, success } = useAlert();
  const branding = useBranding();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [mobileModalPlatform, setMobileModalPlatform] = useState(null);

  // Break-Glass Emergency 2FA Access Modal (Ctrl+Shift+M or 5x logo click)
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [breakGlassCode, setBreakGlassCode] = useState('');
  const [breakGlassError, setBreakGlassError] = useState('');
  const [breakGlassLoading, setBreakGlassLoading] = useState(false);
  const breakGlassInputRef = useRef(null);
  const logoClickRef = useRef({ count: 0, timer: null });

  // Closed-loop mode (set by super admin): only Prasetia Lark accounts may sign in.
  // No password recovery form is exposed in closed-loop mode — emergency access is strictly via Break-Glass 2FA (Ctrl+Shift+M).
  const closedLoop = branding.access_mode === 'closed' || branding.loading === true;

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token && !closedLoop) setResetToken(token);
    if (params.get('logged_out') === '1' && window.history?.replaceState) {
      window.history.replaceState({}, document.title, '/login');
    }

    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('vl_logout_reason') === 'idle') {
      sessionStorage.removeItem('vl_logout_reason');
      showError(`Sesi Anda telah berakhir otomatis karena tidak ada aktivitas (${sessionIdleLabel || '30m'}) demi keamanan akun.`);
    }
  }, [closedLoop, sessionIdleLabel, showError]);

  // Global Hotkey: Ctrl+Shift+M or Ctrl+Alt+M opens Break-Glass 2FA Emergency Access Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setBreakGlassCode('');
        setBreakGlassError('');
        setShowBreakGlassModal(true);
        setTimeout(() => breakGlassInputRef.current?.focus(), 80);
      } else if (e.key === 'Escape' && showBreakGlassModal) {
        setShowBreakGlassModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBreakGlassModal]);

  const handleLogoSecretTrigger = () => {
    logoClickRef.current.count += 1;
    if (logoClickRef.current.timer) clearTimeout(logoClickRef.current.timer);
    if (logoClickRef.current.count >= 5) {
      logoClickRef.current.count = 0;
      setBreakGlassCode('');
      setBreakGlassError('');
      setShowBreakGlassModal(true);
      setTimeout(() => breakGlassInputRef.current?.focus(), 80);
      return;
    }
    logoClickRef.current.timer = setTimeout(() => {
      logoClickRef.current.count = 0;
    }, 3000);
  };

  const handleBreakGlassSubmit = async (e) => {
    e.preventDefault();
    if (!breakGlassCode.trim()) {
      setBreakGlassError('Masukkan kode 6 digit Google Authenticator atau Recovery Key.');
      return;
    }
    setBreakGlassLoading(true);
    setBreakGlassError('');
    try {
      const res = await breakGlassLogin(breakGlassCode.trim());
      setShowBreakGlassModal(false);
      success(`Emergency 2FA terverifikasi (${res.method}). Membuka konsol Admin...`);
      navigate(res.user?.role === 'super_admin' ? '/admin/users' : '/dashboard');
    } catch (err) {
      setBreakGlassError(err.message || 'Kode Authenticator / Recovery Key tidak valid.');
    } finally {
      setBreakGlassLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
      success(data.message || 'Reset instructions sent to your email.');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return showError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_URL}/auth/reset-password-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      success(data.message);
      setResetToken(null);
      navigate('/login');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        success('Welcome back! 🎉');
      } else {
        if (!form.name) { showError('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
        success('Account created! Welcome to Promptara 🚀');
      }
      navigate('/dashboard');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLarkLogin = () => {
    setLoading(true);
    try {
      localStorage.removeItem('vl_explicit_logout');
      localStorage.setItem('vl_lark_pending', '1');
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('vl_lark_pending', '1');
      document.cookie = 'vl_logged_out=; Max-Age=0; path=/;';
      document.cookie = 'vl_logged_out=; Max-Age=0; path=/; domain=.virtuenet.space;';
      document.cookie = 'vl_lark_pending=1; Max-Age=600; path=/; SameSite=Lax';
      const returnTo = `${window.location.origin}/dashboard`;
      window.location.href = `https://assistant.virtuenet.space/api/auth/lark/login?return_to=${encodeURIComponent(returnTo)}`;
    } catch (err) {
      showError(err.message);
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, text: '5 Interactive Courses & Cyber News', color: 'var(--primary)' },
    { icon: FlaskConical, text: 'Hands-on AI Labs', color: 'var(--accent)' },
    { icon: Trophy, text: 'XP & Leaderboard', color: 'var(--warning)' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: 'var(--bg-base)' }}>
      <MobileInstallModal
        open={Boolean(mobileModalPlatform)}
        initialPlatform={mobileModalPlatform === 'ios' ? 'ios' : 'android'}
        onClose={() => setMobileModalPlatform(null)}
      />

      {/* Left Panel */}
      <div className="login-left" style={{
        flex: '1 1 380px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '2.5rem', background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 440 }}>
          {/* Logo (5x rapid click or Ctrl+Shift+M triggers Break-Glass 2FA modal) */}
          <div
            onClick={handleLogoSecretTrigger}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', cursor: 'pointer', userSelect: 'none' }}
            title="Promptara Zero-Trust Identity"
          >
            <img
              src={(branding.app_logo_url || '/icons/icon-512.png').startsWith('http') || (branding.app_logo_url || '/icons/icon-512.png').startsWith('data:') ? (branding.app_logo_url || '/icons/icon-512.png') : `${import.meta.env.VITE_API_URL || ''}${(branding.app_logo_url || '/icons/icon-512.png').startsWith('/') ? '' : '/'}${branding.app_logo_url || '/icons/icon-512.png'}`}
              alt={branding.app_name || 'Promptara'}
              onError={e => { if (!e.target.src.endsWith('/icons/icon-512.png')) e.target.src = '/icons/icon-512.png'; }}
              style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'contain', boxShadow: '0 0 30px var(--primary-glow)' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{branding.app_name || 'Promptara'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{branding.app_tagline || 'AI Coding Academy'}</div>
            </div>
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1rem' }}>
            Master Vibe Coding.<br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ship Anything.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
            The interactive LMS that teaches you to build real apps with AI — fast, fun, and effective.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {features.map(({ icon: Icon, text, color }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Mobile App Installer Box on Login Left Panel */}
          <div style={{
            padding: '1rem 1.15rem',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(124, 58, 237, 0.12))',
            border: '1px solid rgba(16, 185, 129, 0.35)',
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Smartphone size={15} color="#10b981" /> Download Aplikasi Mobile (Android & iOS)
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setMobileModalPlatform('android')}
                style={{
                  flex: 1,
                  padding: '0.48rem 0.75rem',
                  borderRadius: 8,
                  border: '1px solid rgba(16,185,129,0.45)',
                  background: 'rgba(16,185,129,0.16)',
                  color: '#10b981',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🤖 Installer Android
              </button>
              <button
                type="button"
                onClick={() => setMobileModalPlatform('ios')}
                style={{
                  flex: 1,
                  padding: '0.48rem 0.75rem',
                  borderRadius: 8,
                  border: '1px solid rgba(124,58,237,0.45)',
                  background: 'rgba(124,58,237,0.18)',
                  color: '#a78bfa',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🍎 Installer iOS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right" style={{ flex: '1 1 380px', maxWidth: 520, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {closedLoop ? (
            <div data-testid="closed-loop-panel">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.28rem 0.75rem', borderRadius: 20, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', fontSize: '0.72rem', fontWeight: 800, marginBottom: '1.1rem' }}>
                <Lock size={13} /> CLOSED-LOOP · PRASETIA GROUP
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>Masuk dengan akun Lark</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Aplikasi ini khusus untuk pengguna Lark Prasetia. Gunakan akun Lark perusahaan Anda untuk melanjutkan.
              </p>
              <button
                type="button"
                onClick={handleLarkLogin}
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem' }}
              >
                <img src="/icons/lark-logo.png" alt="Lark" width={24} height={24} style={{ borderRadius: 6 }} />
                Login with Lark
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="tab-bar" style={{ marginBottom: '1.75rem' }}>
                <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
                <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Sign Up</button>
              </div>

              <h2 style={{ marginBottom: '0.5rem' }}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                {mode === 'login' ? 'Sign in to continue your learning journey' : 'Join Promptara and start building with AI'}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {mode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" type="text" placeholder="Your name" value={form.name} onChange={set('name')} required />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={set('password')}
                      required
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
                  {loading ? (
                    <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                  ) : (
                    <>{mode === 'login' ? 'Sign In' : 'Get Started'} <ArrowRight size={18} /></>
                  )}
                </button>

                {mode === 'login' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or continue with</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                    </div>

                    <button
                      type="button"
                      onClick={handleLarkLogin}
                      className="btn btn-secondary btn-lg w-full"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        background: 'rgba(59,130,246,0.1)',
                        borderColor: 'rgba(59,130,246,0.3)',
                        color: '#3b82f6',
                        transition: 'all 0.2s',
                      }}
                    >
                      <img src="/icons/lark-logo.png" alt="Lark" width={22} height={22} style={{ borderRadius: 5 }} />
                      Sign In with Lark
                    </button>
                  </>
                )}
              </form>

              {mode === 'register' && (
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Free plan includes 1 course and 2 labs. <Link to="/" style={{ color: 'var(--accent)' }}>See all plans →</Link>
                </p>
              )}
            </>
          )}

          {/* Powered-by footer */}
          <div style={{
            marginTop: '2rem', paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
          }}>
            <a
              href="https://virtuenet.id"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.73rem', color: 'var(--text-muted)',
                textDecoration: 'none', lineHeight: 1.6,
              }}
            >
              <span style={{ display: 'block', fontWeight: 600 }}>
                🌐 Virtuenet.id
              </span>
              <span style={{ opacity: 0.7 }}>powered by Prasetia Dwidharma</span>
            </a>
          </div>
        </div>
      </div>

      {/* Break-Glass Emergency 2FA Access Modal (Ctrl+Shift+M) */}
      {showBreakGlassModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.82)',
            backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '1rem',
          }}
          onClick={() => setShowBreakGlassModal(false)}
        >
          <div
            className="card"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 430, padding: '2rem',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 40px rgba(245, 158, 11, 0.12)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setShowBreakGlassModal(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.28rem 0.7rem', borderRadius: 999,
              background: 'rgba(245, 158, 11, 0.14)', border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#f59e0b', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.9rem',
            }}>
              <ShieldAlert size={13} /> BREAK-GLASS EMERGENCY 2FA VAULT
            </div>

            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', fontWeight: 800 }}>
              Google Authenticator (2FA)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.55, marginBottom: '1.25rem' }}>
              Jalur darurat independen dari Lark Suite (<code style={{ color: '#f59e0b' }}>Ctrl+Shift+M</code>). Masukkan <strong>kode 6 digit Google Authenticator</strong> atau <strong>Single-Use Recovery Key</strong> (<code style={{ fontSize: '0.75rem' }}>SECURE-XXXX-XXXX-XXXX</code>).
            </p>

            {breakGlassError && (
              <div style={{
                padding: '0.7rem 0.85rem', borderRadius: 8, marginBottom: '1rem',
                background: 'rgba(239, 68, 68, 0.14)', border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171', fontSize: '0.8rem', fontWeight: 600,
              }}>
                ⚠️ {breakGlassError}
              </div>
            )}

            <form onSubmit={handleBreakGlassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                  Kode Authenticator 6 Digit / Recovery Key
                </label>
                <input
                  ref={breakGlassInputRef}
                  className="form-input"
                  type="text"
                  autoComplete="one-time-code"
                  placeholder="Contoh: 482910 atau SECURE-XXXX-XXXX-XXXX"
                  value={breakGlassCode}
                  onChange={e => setBreakGlassCode(e.target.value)}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.05rem',
                    letterSpacing: '0.12em',
                    textAlign: 'center',
                    fontWeight: 700,
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowBreakGlassModal(false)}
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={breakGlassLoading}
                  className="btn btn-primary"
                  style={{
                    flex: 1.5,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none',
                    color: '#0f172a',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <KeyRound size={16} />
                  {breakGlassLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                </button>
              </div>
            </form>

            <div style={{
              marginTop: '1.1rem', paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-light)',
              fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center',
            }}>
              🔒 Anti-Brute-Force: Maksimal 5x percobaan gagal (kunci otomatis 15 menit). Setiap aktivitas tercatat di Global Security Audit Trail.
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && !closedLoop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Forgot Password</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" required placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForgotModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Token Modal */}
      {resetToken && !closedLoop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Reset Your Password</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Please enter your new password below.
            </p>
            <form onSubmit={handleResetConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" required placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setResetToken(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
