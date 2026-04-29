import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { Zap, Eye, EyeOff, ArrowRight, BookOpen, FlaskConical, Trophy } from 'lucide-react';

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const { error: showError, success } = useAlert();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user]);

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
        success('Account created! Welcome to VibeLearn 🚀');
      }
      navigate('/');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, text: '5 Interactive Courses', color: 'var(--primary)' },
    { icon: FlaskConical, text: 'Hands-on AI Labs', color: 'var(--accent)' },
    { icon: Trophy, text: 'XP & Leaderboard', color: 'var(--warning)' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem', background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--primary-glow)' }}>
              <Zap size={26} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>VibeLearn</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>AI Coding Academy</div>
            </div>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1rem' }}>
            Master Vibe Coding.<br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ship Anything.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            The interactive LMS that teaches you to build real apps with AI — fast, fun, and effective.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {features.map(({ icon: Icon, text, color }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>🔑 DEMO CREDENTIALS</p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', lineHeight: 2 }}>
              admin@vibelearn.id / Admin@2026!<br />
              master@vibelearn.id / Master@2026!
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Toggle */}
          <div className="tab-bar" style={{ marginBottom: '2rem' }}>
            <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
            <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Sign Up</button>
          </div>

          <h2 style={{ marginBottom: '0.5rem' }}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Sign in to continue your learning journey' : 'Join VibeLearn and start building with AI'}
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
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={set('password')} required style={{ paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                : <>{mode === 'login' ? 'Sign In' : 'Get Started'} <ArrowRight size={18} /></>}
            </button>
          </form>

          {mode === 'register' && (
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Free plan includes 1 course and 2 labs. <Link to="/landing" style={{ color: 'var(--accent)' }}>See all plans →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
