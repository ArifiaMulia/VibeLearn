import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FlaskConical, Trophy, Zap, TrendingUp, Clock, Star, ArrowRight, Users, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { XPLevel } from '../components/XPBadge';

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
    const kpis = [
      { label: 'Total Students', value: adminStats.users.total, icon: Users, color: 'var(--primary)' },
      { label: 'Active Today', value: adminStats.users.active_today, icon: TrendingUp, color: 'var(--success)' },
      { label: 'Enrollments', value: adminStats.enrollments.total, icon: BookOpen, color: 'var(--accent)' },
      { label: 'Lab Sessions', value: adminStats.labs.sessions, icon: FlaskConical, color: 'var(--warning)' },
      { label: 'Completions', value: adminStats.enrollments.completed, icon: Trophy, color: 'var(--success)' },
      { label: 'Total XP Earned', value: adminStats.total_xp?.toLocaleString(), icon: Zap, color: 'var(--primary)' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Welcome */}
        <div style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>Welcome back, {user.name.split(' ')[0]} 👋</h2>
          <p style={{ color: 'var(--text-muted)' }}>Here's your platform overview for today</p>
        </div>

        {/* KPIs */}
        <div className="grid-3">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: `${color}20` }}><Icon size={22} color={color} /></div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Top Courses + Recent Activity */}
        <div className="grid-2">
          <div className="card">
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="var(--primary)" /> Top Courses
            </h4>
            {adminStats.top_courses?.map((c, i) => (
              <div key={c.title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < adminStats.top_courses.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: '0.875rem' }}>{c.title}</span>
                <span className="badge badge-primary">{c.enrollments} students</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--accent)" /> Recent Activity
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: 260, overflowY: 'auto' }}>
              {adminStats.recent_activity?.slice(0, 8).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>{a.name}</strong> — {a.action.replace(/_/g, ' ')}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h4 style={{ marginBottom: '1rem' }}>Quick Actions</h4>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/admin/courses')}><BookOpen size={16} /> Create Course</button>
            <button className="btn btn-accent" onClick={() => navigate('/admin/users')}><Users size={16} /> Manage Users</button>
            <button className="btn btn-ghost" onClick={() => navigate('/admin/analytics')}><BarChart3 size={16} /> View Analytics</button>
            {isRole('super_admin') && <button className="btn btn-ghost" onClick={() => navigate('/admin/subscriptions')}><Star size={16} /> Subscriptions</button>}
          </div>
        </div>
      </div>
    );
  }

  /* ── PARTICIPANT DASHBOARD ── */
  const continueEnr = enrollments.find(e => e.completed_lessons < e.total_lessons && e.completed_lessons > 0);
  const completionRate = progress?.completed_courses > 0 ? Math.round((progress.completed_courses / Math.max(enrollments.length, 1)) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero */}
      <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-2rem', top: '-2rem', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)' }} />
        <h2 style={{ marginBottom: '0.3rem' }}>Hey {user.name.split(' ')[0]}! 🔥</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>You're on a roll. Keep the momentum going!</p>
        {progress && <XPLevel xp={progress.total_xp} />}
      </div>

      {/* Stats Row */}
      <div className="grid-4">
        {[
          { label: 'Lessons Done', value: progress?.completed_lessons || 0, icon: BookOpen, color: 'var(--primary)' },
          { label: 'Labs Cleared', value: progress?.completed_labs || 0, icon: FlaskConical, color: 'var(--accent)' },
          { label: 'Courses Done', value: progress?.completed_courses || 0, icon: Trophy, color: 'var(--success)' },
          { label: 'Badges Earned', value: progress?.achievements?.length || 0, icon: Star, color: 'var(--warning)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}><Icon size={20} color={color} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      {continueEnr && (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), var(--bg-card))', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Continue Where You Left Off</span>
              <h3 style={{ marginTop: '0.35rem', marginBottom: '0.5rem' }}>{continueEnr.title}</h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{continueEnr.completed_lessons}/{continueEnr.total_lessons} lessons</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {Math.round((continueEnr.completed_lessons / Math.max(continueEnr.total_lessons, 1)) * 100)}%
                  </span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(continueEnr.completed_lessons / Math.max(continueEnr.total_lessons, 1)) * 100}%` }} /></div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate(`/courses/${continueEnr.course_id}`)}>
                Continue Learning <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              <BookOpen size={32} color="white" />
            </div>
          </div>
        </div>
      )}

      {/* My Courses */}
      {enrollments.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>My Courses</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/courses')}>Browse All <ArrowRight size={14} /></button>
          </div>
          <div className="grid-3">
            {enrollments.slice(0, 3).map((e, i) => (
              <CourseCard key={e.course_id} course={{ ...e, id: e.course_id }} index={i} enrolled progress={e} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {enrollments.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Start Your Journey</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enroll in your first course and begin mastering vibe coding</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/courses')}>Browse Courses <ArrowRight size={18} /></button>
        </div>
      )}
    </div>
  );
}
