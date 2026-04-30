import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, TrendingUp, Users, BookOpen, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AnalyticsDashboard() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/analytics/overview').then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  const chartData = stats.dau.map(d => ({
    name: new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    users: d.count
  }));

  const kpis = [
    { label: 'Total Users', value: stats.users.total, icon: Users, color: 'var(--primary)' },
    { label: 'Active Today', value: stats.users.active_today, icon: TrendingUp, color: 'var(--success)', trend: stats.dau_trend },
    { label: 'Retention Risk', value: stats.users.retention_risk, icon: AlertTriangle, color: 'var(--danger)', sub: 'Inactive > 7d' },
    { label: 'Labs Completed', value: stats.labs.sessions, icon: Clock, color: 'var(--warning)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <BarChart3 color="var(--primary)" /> Platform Analytics
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Real-time insights and predictive usage metrics.</p>
      </div>

      <div className="grid-4">
        {kpis.map(({ label, value, icon: Icon, color, trend, sub }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}><Icon size={20} color={color} /></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <div className="stat-value">{value}</div>
              {trend !== undefined && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: trend >= 0 ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center' }}>
                  {trend >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {Math.abs(trend)}%
                </span>
              )}
            </div>
            <div className="stat-label">{label} {sub && <span style={{ opacity: 0.6 }}>• {sub}</span>}</div>
          </div>
        ))}
      </div>
      
      <div className="grid-2">
        <div className="card">
          <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--success)" /> User Activity (DAU)
          </h4>
          <div style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="var(--accent)" /> Enrollment Trends
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.top_courses.map(c => (
              <div key={c.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span>{c.title}</span>
                  <span style={{ fontWeight: 700 }}>{c.enrollments}</span>
                </div>
                <div className="progress-track" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${(c.enrollments / stats.enrollments.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
