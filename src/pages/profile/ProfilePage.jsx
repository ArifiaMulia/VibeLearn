import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { User, Mail, CreditCard, Shield, Settings, Zap } from 'lucide-react';
import BadgesGrid from '../../components/BadgesGrid';
import { XPLevel } from '../../components/XPBadge';

export default function ProfilePage() {
  const { user, authFetch, logout } = useAuth();
  const { success, error } = useAlert();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (user.role === 'participant') {
      authFetch('/progress/me').then(setProgress).catch(console.error);
    }
  }, []);

  const mappedBadges = [
    { name: 'First Lab', type: 'completion', earned: progress?.achievements.some(a => a.badge_name === 'first_lab') },
    { name: 'On Fire', type: 'streak', earned: (progress?.streak || 0) >= 3 },
    { name: 'Code Master', type: 'mastery', earned: (progress?.completed_lessons || 0) >= 10 },
    { name: 'Secure Coder', type: 'security', earned: false },
    { name: 'Lightning Fast', type: 'speed', earned: false },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem' }}>My Profile</h1>

      {/* Main Info */}
      <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ 
          width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800,
          boxShadow: '0 0 30px var(--primary-glow)'
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Mail size={14} /> {user.email}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary"><Shield size={12} style={{ marginRight: 4 }}/> {user.role.replace('_', ' ')}</span>
            <span className="badge badge-accent"><CreditCard size={12} style={{ marginRight: 4 }}/> {user.plan.toUpperCase()} PLAN</span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={logout}>Sign Out</button>
      </div>

      {/* Progress & Gamification */}
      {user.role === 'participant' && progress && (
        <>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--warning)" /> Level & Experience
            </h3>
            <XPLevel xp={progress.total_xp} />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Achievements</h3>
            <BadgesGrid badges={mappedBadges} />
          </div>
        </>
      )}

      {/* Preferences Placeholder */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={20} color="var(--primary)" /> Preferences
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email notifications, theme settings, and API keys can be configured here.</p>
        <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => success('Preferences updated!')}>
          Save Preferences
        </button>
      </div>
    </div>
  );
}
