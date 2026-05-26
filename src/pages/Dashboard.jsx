import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, FlaskConical, Trophy, Zap, TrendingUp, Clock, Star, ArrowRight, Users, BarChart3, Flame, CheckCircle2, Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { XPLevel } from '../components/XPBadge';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, authFetch, isRole } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyChallenge, setWeeklyChallenge] = useState({ target: 3, current: 0, deadline: '', completed: false });

  useEffect(() => {
    if (progress) {
      const now = new Date();
      const nextSunday = new Date();
      const dayOfWeek = now.getDay();
      const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      nextSunday.setDate(now.getDate() + daysToSunday);
      nextSunday.setHours(23, 59, 59, 999);
      
      const deadlineStr = nextSunday.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });

      let startCount = localStorage.getItem('vl_challenge_start_lessons');
      let challengeDeadline = localStorage.getItem('vl_challenge_deadline');
      
      const deadlineTime = new Date(challengeDeadline || nextSunday).getTime();
      const isExpired = Date.now() > deadlineTime;
      
      if (startCount === null || isExpired) {
        startCount = progress.completed_lessons;
        localStorage.setItem('vl_challenge_start_lessons', startCount.toString());
        localStorage.setItem('vl_challenge_deadline', nextSunday.toISOString());
      } else {
        startCount = parseInt(startCount, 10);
      }
      
      const currentProgress = Math.max(0, progress.completed_lessons - startCount);
      const isDone = currentProgress >= 3;
      
      setWeeklyChallenge({
        target: 3,
        current: Math.min(currentProgress, 3),
        deadline: deadlineStr,
        completed: isDone
      });
    }
  }, [progress, lang]);

  useEffect(() => {
    const load = async () => {
      try {
        if (isRole('super_admin', 'master')) {
          const a = await authFetch('/analytics/overview');
          setAdminStats(a);
        } else {
          const [prog, enr] = await Promise.all([
            authFetch('/progress/me'),
            authFetch('/courses/my/enrollments'),
          ]);
          setProgress(prog);
          setEnrollments(enr);
          localStorage.setItem('vl_xp', prog.total_xp);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', gap: '1.25rem', flexDirection: 'column' }}>
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
    </div>
  );

  /* ── ADMIN / MASTER DASHBOARD ── */
  if (isRole('super_admin', 'master') && adminStats) {
    const kpis = [
      { label: 'Total Students', value: adminStats.users.total, icon: Users, color: 'var(--primary)' },
      { label: 'Retention Risk', value: adminStats.users.retention_risk, icon: Zap, color: 'var(--danger)' },
      { label: 'Active Today', value: adminStats.users.active_today, icon: TrendingUp, color: 'var(--success)' },
      { label: 'Enrollments', value: adminStats.enrollments.total, icon: BookOpen, color: 'var(--accent)' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>Master Dashboard 👋</h2>
          <p style={{ color: 'var(--text-muted)' }}>{adminStats.users.retention_risk} users at risk of churning. Consider an engagement blast.</p>
        </div>

        <div className="grid-4">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: `${color}20` }}><Icon size={22} color={color} /></div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '1.5rem' }}>Quick Insights</h4>
          <div style={{ height: 200 }}>
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminStats.dau.map(d => ({ n: '', v: d.count }))}>
                <Area type="monotone" dataKey="v" stroke="var(--primary)" fill="var(--primary-glow)" />
              </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  /* ── PARTICIPANT DASHBOARD ── */
  const continueEnr = enrollments.find(e => e.completed_lessons < e.total_lessons && e.completed_lessons > 0);
  const dailyGoalReached = (progress?.completed_lessons_today || 0) >= 1;
  const isNewUser = enrollments.length === 0;
  const currentXP = progress?.total_xp || 0;
  const currentLevel = Math.floor(currentXP / 500) + 1;

  // XP benefits milestones
  const xpMilestones = [
    { level: 1, xp: 0,    label: t('xp_benefit_1'), icon: '📚' },
    { level: 3, xp: 1000, label: t('xp_benefit_2'), icon: '🔥' },
    { level: 5, xp: 2000, label: t('xp_benefit_3'), icon: '🧪' },
    { level: 8, xp: 3500, label: t('xp_benefit_4'), icon: '🎓' },
    { level: 10,xp: 4500, label: t('xp_benefit_5'), icon: '🚀' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── START HERE BANNER (only if brand new user) ── */}
      {isNewUser && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.12))',
          border: '1.5px solid rgba(124,58,237,0.35)', borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem', display: 'flex', alignItems: 'center',
          gap: '1.5rem', flexWrap: 'wrap', position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow orb */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '3rem', flexShrink: 0 }}>🚀</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.35rem' }}>
              {t('start_here_title')}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              {t('start_here_sub')}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/courses?level=beginner')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} /> {t('start_here_cta')}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/courses')}>
                {lang === 'id' ? 'Lihat semua kursus' : 'Browse all courses'}
              </button>
            </div>
          </div>
          {/* Quick picks */}
          <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0, flexWrap: 'wrap' }}>
            {[
              { emoji: '🤖', label: lang === 'id' ? 'AI Dasar' : 'AI Basics' },
              { emoji: '✍️', label: lang === 'id' ? 'Prompt Pertama' : 'First Prompt' },
              { emoji: '🌐', label: lang === 'id' ? 'Buat Website' : 'Build a Website' },
            ].map(({ emoji, label }) => (
              <div key={label} onClick={() => navigate('/courses')} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
                cursor: 'pointer', textAlign: 'center', minWidth: 90, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{emoji}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero & Daily Goal */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ flex: 1, padding: '2rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ marginBottom: '0.3rem' }}>Hey {user.name.split(' ')[0]}! {progress?.streak > 0 ? '🔥' : '👋'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            {progress?.streak > 0
              ? `${lang === 'id' ? 'Kamu sudah' : "You're on a"} ${progress.streak} ${t('streak_days')}. ${lang === 'id' ? 'Pertahankan!' : 'Keep it up!'}`
              : (lang === 'id' ? 'Selamat datang! Yuk mulai belajar hari ini 😊' : "Welcome! Let's start learning today 😊")}
          </p>
          {progress && <XPLevel xp={progress.total_xp} />}
        </div>
        
        <div className="card" style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className={`goal-circle ${dailyGoalReached ? 'active' : ''}`}>
            {dailyGoalReached ? <CheckCircle2 size={40} color="var(--success)" /> : <Flame size={40} color="var(--text-muted)" />}
          </div>
          <h4 style={{ marginTop: '1rem' }}>{lang === 'id' ? 'Target Harian' : 'Daily Goal'}</h4>
          <p className="text-xs text-muted">{progress?.completed_lessons_today || 0} / 1 {lang === 'id' ? 'Pelajaran selesai' : 'Lessons completed'}</p>
          {!dailyGoalReached && (
            <p style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '0.35rem', fontWeight: 600 }}>
              {lang === 'id' ? '🌟 Selesaikan 1 pelajaran hari ini!' : '🌟 Finish 1 lesson today!'}
            </p>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4">
        {[
          { label: lang === 'id' ? 'Pelajaran Selesai' : 'Lessons Done',    value: progress?.completed_lessons || 0, icon: BookOpen,    color: 'var(--primary)' },
          { label: lang === 'id' ? 'Lab Diselesaikan' : 'Labs Cleared',      value: progress?.completed_labs || 0,    icon: FlaskConical, color: 'var(--accent)' },
          { label: lang === 'id' ? 'Kursus Selesai' : 'Courses Done',       value: progress?.completed_courses || 0, icon: Trophy,       color: 'var(--success)' },
          { label: 'XP Points',                                               value: progress?.total_xp || 0,          icon: Zap,          color: 'var(--warning)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}><Icon size={20} color={color} /></div>
            <div className="stat-value">{value.toLocaleString()}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── VISUAL LEARNING ROADMAP ── */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(6,182,212,0.03))', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} color="var(--primary)" /> {t('roadmap_title')}
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{t('roadmap_sub')}</p>
        </div>

        {/* Roadmap Strip Nodes */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflowX: 'auto', padding: '1rem 0.5rem', gap: '1.5rem'
        }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute', top: '50%', left: '5%', right: '5%', height: 3,
            background: 'var(--border-light)', zIndex: 1, transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }} />

          {[
            { id: 'beginner', title: t('roadmap_tier_beginner'), desc: t('roadmap_tier_desc_beginner'), minLevel: 1, maxLevel: 2, icon: '🌱', levelKey: 'beginner' },
            { id: 'explorer', title: t('roadmap_tier_explorer'), desc: t('roadmap_tier_desc_explorer'), minLevel: 3, maxLevel: 4, icon: '🔥', levelKey: 'beginner' },
            { id: 'vibecoder', title: t('roadmap_tier_vibecoder'), desc: t('roadmap_tier_desc_vibecoder'), minLevel: 5, maxLevel: 7, icon: '🚀', levelKey: 'intermediate' },
            { id: 'advanced', title: t('roadmap_tier_advanced'), desc: t('roadmap_tier_desc_advanced'), minLevel: 8, maxLevel: 99, icon: '💡', levelKey: 'advanced' },
          ].map((tier, idx, arr) => {
            const isActive = currentLevel >= tier.minLevel && currentLevel <= tier.maxLevel;
            const isCompleted = currentLevel > tier.maxLevel;
            const isLocked = currentLevel < tier.minLevel;
            
            let nodeBg = 'var(--bg-card)';
            let nodeBorder = '1px solid var(--border-light)';
            let titleColor = 'var(--text-muted)';
            let shadow = 'none';

            if (isActive) {
              nodeBg = 'rgba(124, 58, 237, 0.15)';
              nodeBorder = '2px solid var(--primary)';
              titleColor = 'var(--text-primary)';
              shadow = '0 0 20px var(--primary-glow)';
            } else if (isCompleted) {
              nodeBg = 'rgba(16, 185, 129, 0.08)';
              nodeBorder = '1.5px solid var(--success)';
              titleColor = 'var(--text-secondary)';
            }

            return (
              <div key={tier.id}
                onClick={() => navigate(`/courses?level=${tier.levelKey}`)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  zIndex: 2, flex: 1, minWidth: 140, cursor: 'pointer', textAlign: 'center',
                  position: 'relative', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Node circle */}
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: nodeBg, border: nodeBorder, boxShadow: shadow,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: '0.6rem', position: 'relative',
                  transition: 'all 0.2s'
                }}>
                  {isLocked ? '🔒' : tier.icon}
                  {isActive && (
                    <span style={{
                      position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--primary)', color: 'white', fontSize: '0.55rem',
                      fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: 10,
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(124,58,237,0.4)'
                    }}>
                      {t('roadmap_here')}
                    </span>
                  )}
                  {isCompleted && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: 'var(--success)', color: 'white', borderRadius: '50%',
                      width: 16, height: 16, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800
                    }}>
                      ✓
                    </span>
                  )}
                </div>
                {/* Node info */}
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: titleColor }}>{tier.title}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{tier.desc}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 600, marginTop: '0.2rem' }}>
                  Lv.{tier.minLevel}{tier.maxLevel < 99 ? `-${tier.maxLevel}` : '+'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Benefits Panel */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.04))', border: '1px solid rgba(124,58,237,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}><Sparkles size={16} color="var(--primary)" style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />{t('xp_benefits_title')}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{t('xp_benefits_sub')}</p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
            {lang === 'id' ? `Level kamu: ${currentLevel}` : `Your level: ${currentLevel}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {xpMilestones.map(({ level, xp, label, icon }) => {
            const unlocked = currentLevel >= level;
            return (
              <div key={level} style={{
                flex: '1 1 140px', padding: '0.85rem', borderRadius: 'var(--radius-md)',
                background: unlocked ? 'rgba(124,58,237,0.1)' : 'var(--bg-card)',
                border: `1px solid ${unlocked ? 'rgba(124,58,237,0.3)' : 'var(--border-light)'}`,
                opacity: unlocked ? 1 : 0.65, transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{unlocked ? icon : '🔒'}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: unlocked ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Lv.{level}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: unlocked ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.4 }}>{label}</div>
                {!unlocked && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent)', marginTop: '0.3rem', fontWeight: 600 }}>
                    {xp - currentXP > 0 ? `+${(xp - currentXP).toLocaleString()} XP ${lang === 'id' ? 'lagi' : 'to go'}` : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WEEKLY PERSONAL CHALLENGE ── */}
      {progress && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.04))',
          border: '1px solid rgba(6,182,212,0.2)',
          display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🏆 {t('weekly_challenge_title')}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                {t('weekly_challenge_sub')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700 }}>
              <span>{t('weekly_challenge_reward')}</span>
              <span>+200 XP 🎁</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 600, color: weeklyChallenge.completed ? 'var(--success)' : 'var(--text-secondary)' }}>
                {weeklyChallenge.completed ? t('weekly_challenge_completed') : t('weekly_challenge_target')}
              </span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {weeklyChallenge.current} / {weeklyChallenge.target} {t('weekly_challenge_progress')}
              </span>
            </div>
            <div className="progress-track" style={{ height: 10 }}>
              <div className="progress-fill" style={{
                width: `${(weeklyChallenge.current / weeklyChallenge.target) * 100}%`,
                background: weeklyChallenge.completed ? 'linear-gradient(90deg, var(--success), #34d399)' : 'linear-gradient(90deg, var(--accent), var(--primary))',
                borderRadius: 'var(--radius-sm)'
              }} />
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>📅 {t('weekly_challenge_deadline')} <strong>{weeklyChallenge.deadline}</strong></span>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Continue Learning */}
        <div className="flex-col gap-2">
          <h3>{lang === 'id' ? 'Fokus Saat Ini' : 'Current Focus'}</h3>
          {continueEnr ? (
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), var(--bg-card))' }}>
              <span className="badge badge-accent mb-2">{lang === 'id' ? '▶ LANJUTKAN' : '▶ RESUME LESSON'}</span>
              <h4>{continueEnr.title}</h4>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                {continueEnr.completed_lessons} / {continueEnr.total_lessons} {lang === 'id' ? 'pelajaran selesai' : 'lessons done'}
              </div>
              <div className="mt-3">
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(continueEnr.completed_lessons / continueEnr.total_lessons) * 100}%` }} /></div>
              </div>
              <button className="btn btn-primary mt-3 w-full" onClick={() => navigate(`/courses/${continueEnr.course_id}`)}>
                {lang === 'id' ? 'Lanjutkan Belajar' : 'Continue Learning'} <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📚</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>{t('no_course_active')}</p>
              <button className="btn btn-primary" onClick={() => navigate('/courses')}>{t('browse_free')}</button>
            </div>
          )}
        </div>

        {/* Activity Mini Chart */}
        <div className="flex-col gap-2">
          <h3>{lang === 'id' ? 'Aktivitas Minggu Ini' : 'This Week\'s Activity'}</h3>
          <div className="card" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress?.activity_history || [{n:'M',v:10},{n:'T',v:25},{n:'W',v:15},{n:'T',v:40},{n:'F',v:30},{n:'S',v:20},{n:'S',v:45}]}>
                <Area type="monotone" dataKey="v" stroke="var(--accent)" fill="var(--accent-glow)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
