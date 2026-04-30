import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/learn/CoursesPage';
import CourseDetailPage from './pages/learn/CourseDetailPage';
import LessonPage from './pages/learn/LessonPage';
import LabsPage from './pages/labs/LabsPage';
import LabSession from './pages/labs/LabSession';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import UsersPage from './pages/admin/UsersPage';
import CoursesManager from './pages/admin/CoursesManager';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import CourseEditor from './pages/admin/CourseEditor';

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
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
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                  <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AlertProvider>
  );
}
