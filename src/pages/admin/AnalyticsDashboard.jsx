import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, TrendingUp, Users, BookOpen, Clock } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/analytics/overview').then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <BarChart3 color="var(--primary)" /> Platform Analytics
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Real-time insights and usage metrics.</p>
      </div>

      <div className="grid-4">
        {[
          { label: 'Total Users', value: stats.users.total, icon: Users, color: 'var(--primary)' },
          { label: 'Active Today', value: stats.users.active_today, icon: TrendingUp, color: 'var(--success)' },
          { label: 'Total Enrollments', value: stats.enrollments.total, icon: BookOpen, color: 'var(--accent)' },
          { label: 'Total Labs Completed', value: stats.labs.completed, icon: Clock, color: 'var(--warning)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}><Icon size={20} color={color} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      
      {/* Visual Chart Placeholder */}
      <div className="card" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Chart visualizations would be integrated here using Chart.js or Recharts</p>
      </div>
    </div>
  );
}
