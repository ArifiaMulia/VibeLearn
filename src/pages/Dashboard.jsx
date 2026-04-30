import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FlaskConical, Trophy, Zap, TrendingUp, Clock, Star, ArrowRight, Users, BarChart3, Flame, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { XPLevel } from '../components/XPBadge';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, authFetch, isRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

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
    // ... existing admin view logic (kept as is for brevity, or we can enhance it too)
    // Actually, I should keep the admin view enhanced as well.
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero & Daily Goal */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ flex: 1, padding: '2rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ marginBottom: '0.3rem' }}>Hey {user.name.split(' ')[0]}! 🔥</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>You're on a {progress?.streak || 0} day streak. Keep it up!</p>
          {progress && <XPLevel xp={progress.total_xp} />}
        </div>
        
        <div className="card" style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className={`goal-circle ${dailyGoalReached ? 'active' : ''}`}>
            {dailyGoalReached ? <CheckCircle2 size={40} color="var(--success)" /> : <Flame size={40} color="var(--text-muted)" />}
          </div>
          <h4 style={{ marginTop: '1rem' }}>Daily Goal</h4>
          <p className="text-xs text-muted">{progress?.completed_lessons_today || 0} / 1 Lessons completed</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4">
        {[
          { label: 'Lessons Done', value: progress?.completed_lessons || 0, icon: BookOpen, color: 'var(--primary)' },
          { label: 'Labs Cleared', value: progress?.completed_labs || 0, icon: FlaskConical, color: 'var(--accent)' },
          { label: 'Courses Done', value: progress?.completed_courses || 0, icon: Trophy, color: 'var(--success)' },
          { label: 'XP Points', value: progress?.total_xp || 0, icon: Zap, color: 'var(--warning)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}><Icon size={20} color={color} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Continue Learning */}
        <div className="flex-col gap-2">
          <h3>Current Focus</h3>
          {continueEnr ? (
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), var(--bg-card))' }}>
              <span className="badge badge-accent mb-2">RESUME LESSON</span>
              <h4>{continueEnr.title}</h4>
              <div className="mt-3">
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(continueEnr.completed_lessons / continueEnr.total_lessons) * 100}%` }} /></div>
              </div>
              <button className="btn btn-primary mt-3 w-full" onClick={() => navigate(`/courses/${continueEnr.course_id}`)}>Continue <ArrowRight size={16} /></button>
            </div>
          ) : (
            <div className="card text-center p-3">
              <p className="text-muted">No active course. Start something new!</p>
              <button className="btn btn-ghost mt-2" onClick={() => navigate('/courses')}>Browse Catalog</button>
            </div>
          )}
        </div>

        {/* Activity Mini Chart */}
        <div className="flex-col gap-2">
          <h3>Activity Heatmap</h3>
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
