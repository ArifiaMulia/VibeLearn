import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSidebar } from '../contexts/SidebarContext';
import {
  LayoutDashboard, BookOpen, FlaskConical, Users, BarChart3,
  CreditCard, Settings, LogOut, Shield, ChevronLeft, ChevronRight,
} from 'lucide-react';
import pkg from '../../package.json';

const PLAN_COLORS = { free: 'var(--text-muted)', pro: 'var(--warning)', enterprise: 'var(--accent)' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { collapsed, toggle } = useSidebar();
  const navigate = useNavigate();

  const NAV_ITEMS = {
    super_admin: [
      { icon: LayoutDashboard, key: 'nav_dashboard',      to: '/dashboard' },
      { icon: BookOpen,         key: 'nav_courses',        to: '/courses' },
      { icon: FlaskConical,     key: 'nav_labs',           to: '/labs' },
      { icon: Users,            key: 'nav_users',          to: '/admin/users' },
      { icon: BarChart3,        key: 'nav_analytics',      to: '/admin/analytics' },
      { icon: CreditCard,       key: 'nav_subscriptions',  to: '/admin/subscriptions' },
      { icon: Settings,         key: 'nav_course_builder', to: '/admin/courses' },
    ],
    master: [
      { icon: LayoutDashboard, key: 'nav_dashboard',      to: '/dashboard' },
      { icon: BookOpen,         key: 'nav_courses',        to: '/courses' },
      { icon: FlaskConical,     key: 'nav_labs',           to: '/labs' },
      { icon: Users,            key: 'nav_students',       to: '/admin/users' },
      { icon: BarChart3,        key: 'nav_analytics',      to: '/admin/analytics' },
      { icon: Settings,         key: 'nav_course_builder', to: '/admin/courses' },
    ],
    participant: [
      { icon: LayoutDashboard, key: 'nav_dashboard',      to: '/dashboard' },
      { icon: BookOpen,         key: 'nav_my_courses',     to: '/courses' },
      { icon: FlaskConical,     key: 'nav_labs',           to: '/labs' },
      { icon: BarChart3,        key: 'nav_leaderboard',    to: '/leaderboard' },
      { icon: Settings,         key: 'nav_profile',        to: '/profile' },
    ],
  };

  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS.participant;
  const handleLogout = () => { logout(); navigate('/login'); };

  // Sub-label map for each nav item (beginner-friendly context)
  const NAV_SUBS = {
    nav_dashboard:      t('nav_dashboard_sub'),
    nav_courses:        t('nav_courses_sub'),
    nav_my_courses:     t('nav_courses_sub'),
    nav_labs:           t('nav_labs_sub'),
    nav_leaderboard:    t('nav_leaderboard_sub'),
    nav_profile:        t('nav_profile_sub'),
    nav_users:          null,
    nav_students:       null,
    nav_analytics:      null,
    nav_subscriptions:  null,
    nav_course_builder: null,
  };

  const W = collapsed ? 72 : 260;

  return (
    <>
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: W,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100, overflowY: 'auto', overflowX: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '1.5rem 0' : '1.5rem 1.25rem 1rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '0.75rem', overflow: 'hidden',
          transition: 'padding 0.25s',
        }}>
          <img
            src="/logo.png"
            alt="Promptara"
            style={{
              width: 40, height: 40, borderRadius: 10,
              objectFit: 'cover', flexShrink: 0,
              boxShadow: '0 0 16px var(--primary-glow)',
            }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, display: 'none', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px var(--primary-glow)', fontWeight: 800, color: 'white', fontSize: '1.1rem',
          }}>P</div>
          {!collapsed && (
            <div style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>Promptara</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>AI Coding Academy</div>
            </div>
          )}
        </div>

        {/* User info */}
        {!collapsed && (
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.95rem',
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
        )}
        {/* Avatar icon when collapsed */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{
          flex: 1, padding: collapsed ? '1rem 0.5rem' : '1rem 0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.2rem',
          transition: 'padding 0.25s',
        }}>
          {user?.role === 'super_admin' && !collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={12} color="var(--accent)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('nav_admin_panel')}</span>
            </div>
          )}
          {navItems.map(({ icon: Icon, key, to }) => (
            <NavLink key={to} to={to} end={to === '/'}
              title={collapsed ? t(key) : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : '0.75rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '0.7rem' : '0.65rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600, fontSize: '0.875rem',
                transition: 'var(--transition)',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : 'transparent',
                boxShadow: isActive ? '0 2px 12px var(--primary-glow)' : 'none',
                overflow: 'hidden',
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(key)}</div>
                  {NAV_SUBS[key] && (
                    <div style={{ fontSize: '0.65rem', color: 'inherit', opacity: 0.6, marginTop: '0.1rem', fontWeight: 400 }}>
                      {NAV_SUBS[key]}
                    </div>
                  )}
                </div>
              )}
              {!collapsed && <ChevronRight size={14} style={{ opacity: 0.4, flexShrink: 0 }} />}
            </NavLink>
          ))}
        </nav>

        {/* Logout + Version */}
        <div style={{
          padding: collapsed ? '0.75rem 0.5rem' : '0.75rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
          transition: 'padding 0.25s',
        }}>
          <button
            onClick={handleLogout}
            title={collapsed ? t('nav_sign_out') : undefined}
            className="btn btn-ghost w-full"
            style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0.6rem' : undefined }}
          >
            <LogOut size={16} />
            {!collapsed && <span style={{ marginLeft: '0.5rem' }}>{t('nav_sign_out')}</span>}
          </button>
          {!collapsed && (
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>v{pkg.version}</div>
          )}
        </div>
      </aside>

      {/* Floating collapse toggle tab */}
      <button
        onClick={toggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'fixed',
          top: '50%',
          left: W,
          transform: 'translateY(-50%)',
          zIndex: 101,
          width: 20,
          height: 48,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderLeft: 'none',
          borderRadius: '0 6px 6px 0',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
          transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1), background 0.2s, color 0.2s',
          padding: 0,
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </>
  );
}
