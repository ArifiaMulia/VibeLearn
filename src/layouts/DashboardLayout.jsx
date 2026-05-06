import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import OnboardingModal from '../components/OnboardingModal';
import GuidedTour from '../components/GuidedTour';
import { useLanguage } from '../contexts/LanguageContext';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';

// Inner layout reads sidebar state
function InnerLayout() {
  const location = useLocation();
  const { t } = useLanguage();
  const { collapsed } = useSidebar();

  const PAGE_TITLES = {
    '/dashboard':           { title: t('page_dashboard'),   subtitle: t('page_dashboard_sub') },
    '/courses':             { title: t('page_courses'),     subtitle: t('page_courses_sub') },
    '/labs':                { title: t('page_labs'),        subtitle: t('page_labs_sub') },
    '/leaderboard':         { title: t('page_leaderboard'), subtitle: t('page_leaderboard_sub') },
    '/profile':             { title: t('page_profile'),     subtitle: t('page_profile_sub') },
    '/admin/users':         { title: t('page_users'),       subtitle: t('page_users_sub') },
    '/admin/courses':       { title: t('page_builder'),     subtitle: t('page_builder_sub') },
    '/admin/analytics':     { title: t('page_analytics'),   subtitle: t('page_analytics_sub') },
    '/admin/subscriptions': { title: t('page_subs'),        subtitle: t('page_subs_sub') },
  };

  const meta = PAGE_TITLES[location.pathname] || { title: 'Promptara', subtitle: '' };
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <div className="app-layout">
      <OnboardingModal />
      <GuidedTour />
      <Sidebar />
      <div
        className="main-content"
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <InnerLayout />
    </SidebarProvider>
  );
}
