import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Mail, CreditCard, Shield, Settings, Zap } from 'lucide-react';
import UpgradeModal from '../../components/UpgradeModal';
import BadgesGrid from '../../components/BadgesGrid';
import { XPLevel } from '../../components/XPBadge';

export default function ProfilePage() {
  const { user, authFetch, logout } = useAuth();
  const { success, error } = useAlert();
  const { t, lang } = useLanguage();
  const [progress, setProgress] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (user.role === 'participant') {
      authFetch('/progress/me').then(setProgress).catch(console.error);
    }
  }, []);

  const mappedBadges = progress ? [
    {
      name: lang === 'id' ? 'Lab Pertama' : 'First Lab',
      icon: '🧪',
      color: 'var(--accent)',
      earned: progress.completed_labs >= 1 || progress.achievements.some(a => a.badge_name === 'first_lab'),
      condition: t('badge_condition_first_lab')
    },
    {
      name: lang === 'id' ? 'Lulusan I' : 'Graduate I',
      icon: '🎓',
      color: 'var(--success)',
      earned: progress.completed_courses >= 1 || progress.achievements.some(a => a.badge_name === 'course_complete_1'),
      condition: t('badge_condition_graduate_1')
    },
    {
      name: lang === 'id' ? 'Lulusan II' : 'Graduate II',
      icon: '🎓',
      color: 'var(--success)',
      earned: progress.completed_courses >= 2 || progress.achievements.some(a => a.badge_name === 'course_complete_2'),
      condition: t('badge_condition_graduate_2')
    },
    {
      name: lang === 'id' ? 'Pembangun' : 'Builder',
      icon: '🏅',
      color: 'var(--warning)',
      earned: progress.completed_courses >= 3 || progress.achievements.some(a => a.badge_name === 'course_complete_3'),
      condition: t('badge_condition_graduate_3')
    },
    {
      name: lang === 'id' ? 'Pencari Kutu' : 'Debugger',
      icon: '🔍',
      color: 'var(--primary)',
      earned: progress.completed_courses >= 4 || progress.achievements.some(a => a.badge_name === 'course_complete_4'),
      condition: t('badge_condition_graduate_4')
    },
    {
      name: lang === 'id' ? 'Pemrogram Aman' : 'Secure Coder',
      icon: '🛡️',
      color: 'var(--danger)',
      earned: progress.completed_courses >= 5 || progress.achievements.some(a => a.badge_name === 'course_complete_5'),
      condition: t('badge_condition_graduate_5')
    },
    {
      name: lang === 'id' ? 'Iblis Kecepatan' : 'Speed Demon',
      icon: '⚡',
      color: 'var(--warning)',
      earned: progress.completed_lessons_today >= 3 || progress.achievements.some(a => a.badge_name === 'speed_demon'),
      condition: t('badge_condition_speed_demon')
    },
    {
      name: lang === 'id' ? 'Perfeksionis' : 'Perfectionist',
      icon: '💯',
      color: 'var(--accent)',
      earned: progress.completed_lessons > 0 || progress.achievements.some(a => a.badge_name === 'perfectionist'),
      condition: t('badge_condition_perfectionist')
    }
  ] : [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem' }}>{t('nav_profile')}</h1>

      {/* Main Info */}
      <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ 
          width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800,
          boxShadow: '0 0 30px var(--primary-glow)', flexShrink: 0
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
            {user.plan === 'free' && (
              <button className="badge badge-success" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', border: 'none', background: 'var(--success)' }}
                onClick={() => setUpgradeOpen(true)}>
                <Zap size={10} /> Upgrade
              </button>
            )}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={logout}>{t('nav_sign_out')}</button>

        {upgradeOpen && (
          <UpgradeModal 
            planId="pro" 
            plansData={[{ id: 'pro', label: 'Pro', price: 'Rp 450.000' }]} 
            onClose={() => setUpgradeOpen(false)} 
          />
        )}
      </div>

      {/* Progress & Gamification */}
      {user.role === 'participant' && progress && (
        <>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--warning)" /> {lang === 'id' ? 'Level & Pengalaman' : 'Level & Experience'}
            </h3>
            <XPLevel xp={progress.total_xp} />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>{t('badge_locked_title')}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('badge_locked_subtitle')}</p>
            <BadgesGrid badges={mappedBadges} />
          </div>
        </>
      )}

      {/* Preferences Placeholder */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={20} color="var(--primary)" /> {lang === 'id' ? 'Pengaturan' : 'Preferences'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {lang === 'id' ? 'Notifikasi email, pengaturan tema, dan kunci API dapat dikonfigurasi di sini.' : 'Email notifications, theme settings, and API keys can be configured here.'}
        </p>
        <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => success(lang === 'id' ? 'Pengaturan disimpan!' : 'Preferences updated!')}>
          {lang === 'id' ? 'Simpan Pengaturan' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

