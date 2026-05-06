import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import OnboardingModal from '../components/OnboardingModal';
import GuidedTour from '../components/GuidedTour';
import { useLanguage } from '../contexts/LanguageContext';

export default function DashboardLayout() {
  const location = useLocation();
  const { t } = useLanguage();

  const PAGE_TITLES = {
    '/':                    { title: t('page_dashboard'),   subtitle: t('page_dashboard_sub') },
    '/courses':             { title: t('page_courses'),     subtitle: t('page_courses_sub') },
    '/labs':                { title: t('page_labs'),        subtitle: t('page_labs_sub') },
    '/leaderboard':         { title: t('page_leaderboard'), subtitle: t('page_leaderboard_sub') },
    '/profile':             { title: t('page_profile'),     subtitle: t('page_profile_sub') },
    '/admin/users':         { title: t('page_users'),       subtitle: t('page_users_sub') },
    '/admin/courses':       { title: t('page_builder'),     subtitle: t('page_builder_sub') },
    '/admin/analytics':     { title: t('page_analytics'),   subtitle: t('page_analytics_sub') },
    '/admin/subscriptions': { title: t('page_subs'),        subtitle: t('page_subs_sub') },
  };

  const meta = PAGE_TITLES[location.pathname] || { title: 'VibeLearn', subtitle: '' };

  return (
    <div className="app-layout">
      <OnboardingModal />
      <GuidedTour />
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
