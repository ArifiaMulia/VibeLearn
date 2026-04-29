import { useState, useEffect } from 'react';
import { Bell, Search, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TopBar({ title, subtitle }) {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('vl_xp');
    if (saved) setXp(parseInt(saved));
  }, []);

  const level = Math.floor(xp / 500) + 1;
  const xpToNext = 500 - (xp % 500);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0,
      height: 'var(--topbar-height)', background: 'rgba(7,7,26,0.85)',
      backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-light)',
      display: 'flex', alignItems: 'center', padding: '0 1.5rem',
      justifyContent: 'space-between', zIndex: 99, gap: '1rem',
    }}>
      {/* Title */}
      <div>
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

      {/* Notifications */}
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
          border: '2px solid var(--bg-base)',
        }} />
      </button>
    </header>
  );
}
