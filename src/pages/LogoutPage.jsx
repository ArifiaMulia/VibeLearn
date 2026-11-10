import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Fallback for environments where the edge gateway does not intercept /logout:
// wipe the session locally and go straight to the login page.
export default function LogoutPage() {
  const { logout } = useAuth();
  useEffect(() => { logout('manual', { navigateTo: '/login?logged_out=1' }); }, [logout]);
  return null;
}
