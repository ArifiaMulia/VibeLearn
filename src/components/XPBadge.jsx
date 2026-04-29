import { Zap, Trophy, Target, Star } from 'lucide-react';

const BADGES = {
  first_lab:           { icon: '🧪', label: 'First Lab', color: 'var(--accent)' },
  course_complete_1:   { icon: '🎓', label: 'Graduate I', color: 'var(--success)' },
  course_complete_2:   { icon: '🎓', label: 'Graduate II', color: 'var(--success)' },
  course_complete_3:   { icon: '🏅', label: 'Builder', color: 'var(--warning)' },
  course_complete_4:   { icon: '🔍', label: 'Debugger', color: 'var(--primary)' },
  course_complete_5:   { icon: '🛡️', label: 'Secure Coder', color: 'var(--danger)' },
  speed_demon:         { icon: '⚡', label: 'Speed Demon', color: 'var(--warning)' },
  perfectionist:       { icon: '💯', label: 'Perfectionist', color: 'var(--accent)' },
};

export function XPBadge({ badgeName }) {
  const badge = BADGES[badgeName] || { icon: '⭐', label: badgeName, color: 'var(--primary)' };
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
      background: 'var(--bg-card)', border: `1px solid ${badge.color}30`,
      borderRadius: 'var(--radius-md)', padding: '0.75rem 0.5rem', minWidth: 80,
    }}>
      <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: badge.color, textAlign: 'center', lineHeight: 1.2 }}>{badge.label}</span>
    </div>
  );
}

export function XPLevel({ xp = 0, showBar = true }) {
  const level = Math.floor(xp / 500) + 1;
  const pct = ((xp % 500) / 500) * 100;
  const xpToNext = 500 - (xp % 500);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '1.1rem', flexShrink: 0,
        boxShadow: '0 0 20px var(--primary-glow)',
      }}>
        {level}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontWeight: 700 }}>Level {level}</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>{xp.toLocaleString()} XP</span>
        </div>
        {showBar && (
          <>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{xpToNext} XP to Level {level + 1}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function XPPopup({ amount, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', top: '80px', right: '2rem', zIndex: 9999,
      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
      color: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
      fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
      animation: 'slideInRight 0.3s ease, fadeIn 0.3s ease',
      boxShadow: '0 8px 30px var(--primary-glow)',
    }}>
      <Zap size={20} /> +{amount} XP!
    </div>
  );
}
