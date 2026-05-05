import { useState, useEffect } from 'react';
import { Bell, Search, Zap, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TopBar({ title, subtitle }) {
  const { user, realUser, previewRole, previewAs } = useAuth();
  const [xp, setXp] = useState(0);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('vl_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vl_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const saved = localStorage.getItem('vl_xp');
    if (saved) setXp(parseInt(saved));
  }, []);

  const level = Math.floor(xp / 500) + 1;
  const xpToNext = 500 - (xp % 500);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0,
      height: 'var(--topbar-height)', background: 'var(--bg-topbar)',
      backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-light)',
      display: 'flex', alignItems: 'center', padding: '0 1.5rem',
      justifyContent: 'space-between', zIndex: 99, gap: '1rem',
      flexDirection: 'column',
    }}>
      {/* Preview Mode Banner */}
      {previewRole && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, var(--warning), var(--primary))',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '1rem' }}>
        {/* Title */}
        <div style={{ flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title || 'Dashboard'}</h2>
          {subtitle && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses, labs..."
            style={{
              width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem 0.5rem 2.25rem',
              color: 'var(--text-primary)', fontSize: '0.85rem',
            }} />
        </div>

        {/* XP display (participants only) */}
        {user?.role === 'participant' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)', padding: '0.4rem 0.9rem',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Zap size={14} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>Level {level}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent)' }}>{xp.toLocaleString()} XP</div>
            </div>
            <div style={{ width: 60 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginBottom: 3 }}>{xpToNext} to next</div>
              <div className="progress-track" style={{ height: 5 }}>
                <div className="progress-fill" style={{ width: `${((xp % 500) / 500) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Super Admin Preview Mode Selector */}
        {realUser?.role === 'super_admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {previewRole && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, color: 'var(--warning)',
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 6, padding: '0.25rem 0.6rem',
              }}>
                👁 Preview: {previewRole?.replace('_', ' ')}
              </span>
            )}
            <select
              value={previewRole || ''}
              onChange={e => previewAs(e.target.value || null)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.7rem',
                color: 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              <option value="">👤 My View (Admin)</option>
              <option value="master">📋 Preview as Master</option>
              <option value="participant">🎓 Preview as Participant</option>
            </select>
          </div>
        )}

        {/* Right Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>
          <button onClick={toggleTheme} style={{
            width: 38, height: 38, borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: 'var(--text-muted)'
          }}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button style={{
            width: 38, height: 38, borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            position: 'relative',
          }}>
            <Bell size={17} color="var(--text-muted)" />
            <span style={{
              position: 'absolute', top: 6, right: 6, width: 8, height: 8,
              background: 'var(--primary)', borderRadius: '50%',
              border: '2px solid var(--bg-card)',
            }} />
          </button>
        </div>
      </div>
    </header>
  );
}
