import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrandingProvider } from './contexts/BrandingContext';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Eagerly loaded core routes
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// Lazy-loaded routes for code-splitting & optimal bundle performance
const CoursesPage = lazy(() => import('./pages/learn/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/learn/CourseDetailPage'));
const LessonPage = lazy(() => import('./pages/learn/LessonPage'));
const LabsPage = lazy(() => import('./pages/labs/LabsPage'));
const LabSession = lazy(() => import('./pages/labs/LabSession'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Admin pages (lazy-loaded)
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const CoursesManager = lazy(() => import('./pages/admin/CoursesManager'));
const CourseEditor = lazy(() => import('./pages/admin/CourseEditor'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'));
const CertificateBuilderPage = lazy(() => import('./pages/admin/CertificateBuilderPage'));
const SubscriptionsPage = lazy(() => import('./pages/admin/SubscriptionsPage'));
const LarkCallbackPage = lazy(() => import('./pages/LarkCallbackPage'));

// Public Verification Page (lazy-loaded)
const VerifyCertificatePage = lazy(() => import('./pages/VerifyCertificatePage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );
}

export default function App() {
  return (
    <BrandingProvider>
      <LanguageProvider>
        <AlertProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/lark-callback" element={<LarkCallbackPage />} />
                  <Route path="/verify/:cert_id" element={<VerifyCertificatePage />} />

                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/courses" element={<CoursesPage />} />
                      <Route path="/courses/:id" element={<CourseDetailPage />} />
                      <Route path="/lessons/:id" element={<LessonPage />} />
                      <Route path="/labs" element={<LabsPage />} />
                      <Route path="/labs/:id" element={<LabSession />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      <Route path="/profile" element={<ProfilePage />} />

                      <Route element={<ProtectedRoute allowedRoles={['super_admin', 'master']} />}>
                        <Route path="/admin/users" element={<UsersPage />} />
                        <Route path="/admin/courses" element={<CoursesManager />} />
                        <Route path="/admin/courses/edit/:id" element={<CourseEditor />} />
                        <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
                        <Route path="/admin/certificates" element={<CertificateBuilderPage />} />
                      </Route>

                      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                        <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </AlertProvider>
      </LanguageProvider>
    </BrandingProvider>
  );
}
