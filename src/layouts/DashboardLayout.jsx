import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import OnboardingModal from '../components/OnboardingModal';
import GuidedTour from '../components/GuidedTour';
import { useLanguage } from '../contexts/LanguageContext';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { useIsMobile } from '../hooks/useIsMobile';

// Inner layout reads sidebar state
function InnerLayout() {
  const location = useLocation();
  const { t } = useLanguage();
  const { collapsed } = useSidebar();
  const isMobile = useIsMobile();

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

  // On desktop: shift content right of sidebar. On mobile: full width.
  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 260);

  return (
    <div className="app-layout">
      <OnboardingModal />
      <GuidedTour />
      <Sidebar />
      <div
        className="main-content"
        style={{
          marginLeft: sidebarWidth,
          transition: isMobile ? 'none' : 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
          // Extra bottom padding on mobile to clear the bottom nav bar
          paddingBottom: isMobile ? '64px' : undefined,
        }}
      >
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <div className="page-container">
          <Outlet />
        </div>
      </div>

      {/* Bottom navigation — only visible on mobile */}
      {isMobile && <BottomNav />}
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
