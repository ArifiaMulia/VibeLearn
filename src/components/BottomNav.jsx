import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LayoutDashboard, BookOpen, FlaskConical, Users, BarChart3,
  CreditCard, Settings, Award,
} from 'lucide-react';

/**
 * BottomNav — Fixed bottom navigation bar for mobile screens.
 * Shown only on screens < 768px (controlled by parent via CSS or JS).
 * Role-aware: renders nav items matching the current user's role.
 */
export default function BottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = {
    super_admin: [
      { icon: LayoutDashboard, key: 'nav_dashboard',     to: '/dashboard' },
      { icon: BookOpen,        key: 'nav_courses',        to: '/courses' },
      { icon: FlaskConical,    key: 'nav_labs',           to: '/labs' },
      { icon: Users,           key: 'nav_users',          to: '/admin/users' },
      { icon: BarChart3,       key: 'nav_analytics',      to: '/admin/analytics' },
      { icon: CreditCard,      key: 'nav_subscriptions',  to: '/admin/subscriptions' },
      { icon: Settings,        key: 'nav_course_builder', to: '/admin/courses' },
      { icon: Award,           key: 'nav_certificate_builder', to: '/admin/certificates' },
    ],
    master: [
      { icon: LayoutDashboard, key: 'nav_dashboard',     to: '/dashboard' },
      { icon: BookOpen,        key: 'nav_courses',        to: '/courses' },
      { icon: FlaskConical,    key: 'nav_labs',           to: '/labs' },
      { icon: Users,           key: 'nav_students',       to: '/admin/users' },
      { icon: BarChart3,       key: 'nav_analytics',      to: '/admin/analytics' },
      { icon: Settings,        key: 'nav_course_builder', to: '/admin/courses' },
      { icon: Award,           key: 'nav_certificate_builder', to: '/admin/certificates' },
    ],
    participant: [
      { icon: LayoutDashboard, key: 'nav_dashboard',   to: '/dashboard' },
      { icon: BookOpen,        key: 'nav_my_courses',  to: '/courses' },
      { icon: FlaskConical,    key: 'nav_labs',        to: '/labs' },
      { icon: BarChart3,       key: 'nav_leaderboard', to: '/leaderboard' },
      { icon: Settings,        key: 'nav_profile',     to: '/profile' },
    ],
  };

  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS.participant;

  // For admin roles with many items, show only the first 5 to fit mobile screen
  const visibleItems = navItems.slice(0, 5);

  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {visibleItems.map(({ icon: Icon, key, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.6rem 0.25rem',
            textDecoration: 'none',
            color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
            background: isActive
              ? 'linear-gradient(180deg, rgba(124,58,237,0.12) 0%, transparent 100%)'
              : 'transparent',
            borderTop: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.18s ease',
            minWidth: 0,
          })}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={20}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px var(--primary-glow))' : 'none',
                  transition: 'filter 0.18s ease',
                }}
              />
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  letterSpacing: '-0.01em',
                }}
              >
                {t(key)}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
