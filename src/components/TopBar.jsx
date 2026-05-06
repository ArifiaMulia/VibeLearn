import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Zap, Sun, Moon, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

function NotificationPanel({ onClose, t }) {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    authFetch('/progress/recent').catch(() => []).then(data => {
      if (Array.isArray(data)) setLogs(data.slice(0, 10));
    });
    const handleClick = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const timeAgo = d => {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340,
      background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', zIndex: 200,
      overflow: 'hidden', animation: 'fadeInUp 0.2s ease',
    }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('notif_title')}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('notif_subtitle')}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {t('notif_empty')}
          </div>
        ) : logs.map((log, i) => (
          <div key={i} style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              ✅
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t('notif_completed')}: {log.lesson_title || 'a lesson'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>+{log.xp_earned || 0} XP</span>
                <span>·</span>
                <span>{timeAgo(log.completed_at || log.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '0.6rem 1.25rem', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('notif_footer')}</span>
      </div>
    </div>
  );
}

export default function TopBar({ title, subtitle }) {
  const { user, realUser, previewRole, previewAs } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [xp, setXp] = useState(0);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('vl_theme') || 'dark');
  const [showNotifications, setShowNotifications] = useState(false);

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
      zIndex: 99, gap: '1rem',
    }}>
      {previewRole && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--warning), var(--primary))' }} />
      )}

      {/* Title */}
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title || t('page_dashboard')}</h2>
        {subtitle && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          style={{
            width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem 0.5rem 2.25rem',
            color: 'var(--text-primary)', fontSize: '0.85rem',
          }} />
      </div>

      {/* XP (participants only) */}
      {user?.role === 'participant' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'var(--bg-card)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)', padding: '0.4rem 0.9rem', flexShrink: 0,
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={14} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>{t('xp_level')} {level}</div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent)' }}>{xp.toLocaleString()} XP</div>
          </div>
          <div style={{ width: 60 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginBottom: 3 }}>{xpToNext} {t('xp_to_next')}</div>
            <div className="progress-track" style={{ height: 5 }}>
              <div className="progress-fill" style={{ width: `${((xp % 500) / 500) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Preview */}
      {realUser?.role === 'super_admin' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {previewRole && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--warning)', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, padding: '0.25rem 0.6rem' }}>
              👁 {previewRole?.replace('_', ' ')}
            </span>
          )}
          <select value={previewRole || ''} onChange={e => previewAs(e.target.value || null)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.7rem', color: 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer' }}>
            <option value="">{t('preview_admin')}</option>
            <option value="master">{t('preview_master')}</option>
            <option value="participant">{t('preview_participant')}</option>
          </select>
        </div>
      )}

      {/* Right Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0, alignItems: 'center' }}>
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          title={lang === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
          style={{
            height: 38, borderRadius: 'var(--radius-sm)', padding: '0 0.7rem',
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
            color: 'var(--text-primary)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        >
          <span style={{ fontSize: '1rem' }}>{lang === 'en' ? '🇬🇧' : '🇮🇩'}</span>
          <span>{lang === 'en' ? 'EN' : 'ID'}</span>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          width: 38, height: 38, borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)', border: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
        }}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifications(v => !v)} style={{
            width: 38, height: 38, borderRadius: 'var(--radius-sm)',
            background: showNotifications ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            border: `1px solid ${showNotifications ? 'var(--primary)' : 'var(--border-light)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
          }}>
            <Bell size={17} color={showNotifications ? 'var(--primary)' : 'var(--text-muted)'} />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--bg-card)' }} />
          </button>
          {showNotifications && <NotificationPanel t={t} onClose={() => setShowNotifications(false)} />}
        </div>
      </div>
    </header>
  );
}
