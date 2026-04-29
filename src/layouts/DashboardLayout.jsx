import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Welcome back! Keep learning.' },
  '/courses': { title: 'Courses', subtitle: 'Browse and continue your learning journey' },
  '/labs': { title: 'Labs', subtitle: 'Hands-on simulations and challenges' },
  '/leaderboard': { title: 'Leaderboard', subtitle: 'Top vibe coders this month' },
  '/profile': { title: 'My Profile', subtitle: 'Your learning stats and achievements' },
  '/admin/users': { title: 'User Management', subtitle: 'Manage platform members' },
  '/admin/courses': { title: 'Course Builder', subtitle: 'Create and manage course content' },
  '/admin/analytics': { title: 'Analytics', subtitle: 'Platform usage and insights' },
  '/admin/subscriptions': { title: 'Subscriptions', subtitle: 'Manage SaaS plans and billing' },
};

export default function DashboardLayout() {
  const location = useLocation();
  const meta = PAGE_TITLES[location.pathname] || { title: 'VibeLearn', subtitle: '' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
