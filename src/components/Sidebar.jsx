import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, FlaskConical, Users, BarChart3,
  CreditCard, Settings, LogOut, Zap, ChevronRight, Shield
} from 'lucide-react';

const ROLE_NAVS = {
  super_admin: [
    { icon: LayoutDashboard, label: 'Dashboard',     to: '/' },
    { icon: BookOpen,         label: 'Courses',       to: '/courses' },
    { icon: FlaskConical,     label: 'Labs',          to: '/labs' },
    { icon: Users,            label: 'Users',         to: '/admin/users' },
    { icon: BarChart3,        label: 'Analytics',     to: '/admin/analytics' },
    { icon: CreditCard,       label: 'Subscriptions', to: '/admin/subscriptions' },
    { icon: Settings,         label: 'Course Builder',to: '/admin/courses' },
  ],
  master: [
    { icon: LayoutDashboard, label: 'Dashboard',     to: '/' },
    { icon: BookOpen,         label: 'Courses',       to: '/courses' },
    { icon: FlaskConical,     label: 'Labs',          to: '/labs' },
    { icon: Users,            label: 'Students',      to: '/admin/users' },
    { icon: BarChart3,        label: 'Analytics',     to: '/admin/analytics' },
    { icon: Settings,         label: 'Course Builder',to: '/admin/courses' },
  ],
  participant: [
    { icon: LayoutDashboard, label: 'Dashboard',     to: '/' },
    { icon: BookOpen,         label: 'My Courses',    to: '/courses' },
    { icon: FlaskConical,     label: 'Labs',          to: '/labs' },
    { icon: BarChart3,        label: 'Leaderboard',   to: '/leaderboard' },
    { icon: Settings,         label: 'Profile',       to: '/profile' },
  ],
};

const PLAN_COLORS = { free: 'var(--text-muted)', pro: 'var(--warning)', enterprise: 'var(--accent)' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = ROLE_NAVS[user?.role] || ROLE_NAVS.participant;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-width)', background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-light)', display: 'flex',
      flexDirection: 'column', zIndex: 100, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
          }}>
            <Zap size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>VibeLearn</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>AI Coding Academy</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.95rem', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{user?.role?.replace('_', ' ')}</span>
              <span style={{ color: PLAN_COLORS[user?.plan], fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>{user?.plan}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {user?.role === 'super_admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={12} color="var(--accent)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Panel</span>
          </div>
        )}
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)',
              fontWeight: 600, fontSize: '0.875rem', transition: 'var(--transition)',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-muted)',
              background: isActive ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : 'transparent',
              boxShadow: isActive ? '0 2px 12px var(--primary-glow)' : 'none',
            })}>
            <Icon size={18} />
            <span style={{ flex: 1 }}>{label}</span>
            <ChevronRight size={14} style={{ opacity: 0.4 }} />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
        <button onClick={handleLogout} className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
