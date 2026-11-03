import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

export const ROLES = { SUPER_ADMIN: 'super_admin', MASTER: 'master', PARTICIPANT: 'participant' };

const API = import.meta.env.VITE_API_URL || '/api';
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vl_token'));
  const [loading, setLoading] = useState(true);
  const lastActiveRef = useRef(Date.now());

  const clearSsoCookieClientSide = () => {
    if (typeof document === 'undefined') return;
    document.cookie = 'virtuenet_sso_jwt=; Max-Age=0; path=/;';
    document.cookie = 'virtuenet_sso_jwt=; Max-Age=0; path=/; domain=.virtuenet.space;';
  };

  const logout = useCallback((reason = 'manual') => {
    localStorage.removeItem('vl_token');
    localStorage.removeItem('vl_user');
    localStorage.removeItem('vl_last_active');
    localStorage.setItem('vl_explicit_logout', '1');
    if (reason === 'idle' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('vl_logout_reason', 'idle');
    }
    clearSsoCookieClientSide();
    fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      // Check if session already exceeded 30-min idle window while tab was closed
      const savedLastActive = Number(localStorage.getItem('vl_last_active') || 0);
      if (savedLastActive > 0 && Date.now() - savedLastActive >= IDLE_TIMEOUT_MS) {
        logout('idle');
        setLoading(false);
        return;
      }
      const now = Date.now();
      lastActiveRef.current = savedLastActive > 0 ? savedLastActive : now;
      if (!savedLastActive) {
        localStorage.setItem('vl_last_active', String(now));
      }
      const saved = localStorage.getItem('vl_user');
      if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
      setLoading(false);
    } else {
      // Check Virtuenet SSO session ONLY if user did not explicitly log out (unless returning with ?sso_token=)
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const ssoToken = params ? params.get('sso_token') : null;
      const explicitLogout = localStorage.getItem('vl_explicit_logout') === '1';

      if (explicitLogout && !ssoToken) {
        setLoading(false);
        return;
      }

      const ssoUrl = ssoToken ? `${API}/auth/me?sso_token=${encodeURIComponent(ssoToken)}` : `${API}/auth/me`;
      fetch(ssoUrl, { credentials: 'include' })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data && data.user && data.token) {
            const now = Date.now();
            localStorage.removeItem('vl_explicit_logout');
            localStorage.setItem('vl_last_active', String(now));
            lastActiveRef.current = now;
            localStorage.setItem('vl_token', data.token);
            localStorage.setItem('vl_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            if (ssoToken && window.history?.replaceState) {
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [token, logout]);

  // Track user activity & enforce 30-minute idle auto-logout
  useEffect(() => {
    if (!token) return;

    const recordActivity = () => {
      const now = Date.now();
      const prev = Number(localStorage.getItem('vl_last_active') || lastActiveRef.current || now);
      // If the user came back after > 30 mins of inactivity (e.g., laptop woke from sleep), log out immediately
      if (now - prev >= IDLE_TIMEOUT_MS) {
        logout('idle');
        return;
      }
      lastActiveRef.current = now;
      // Throttle localStorage writes to once every 10 seconds
      if (now - prev >= 10000) {
        localStorage.setItem('vl_last_active', String(now));
      }
    };

    const checkIdle = () => {
      const lastActive = Number(localStorage.getItem('vl_last_active') || lastActiveRef.current || Date.now());
      if (Date.now() - lastActive >= IDLE_TIMEOUT_MS) {
        logout('idle');
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkIdle();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, recordActivity, { passive: true }));
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const idleCheckTimer = setInterval(checkIdle, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, recordActivity));
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(idleCheckTimer);
    };
  }, [token, logout]);

  // Heartbeat every 3 min — only send if user was actually active in the last 3 minutes
  useEffect(() => {
    if (!token) return;
    const ping = () => {
      const lastActive = Number(localStorage.getItem('vl_last_active') || lastActiveRef.current || 0);
      if (Date.now() - lastActive < 180000) {
        fetch(`${API}/auth/activity`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
    };
    ping();
    const id = setInterval(ping, 180000);
    return () => clearInterval(id);
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    const now = Date.now();
    localStorage.removeItem('vl_explicit_logout');
    localStorage.setItem('vl_last_active', String(now));
    lastActiveRef.current = now;
    localStorage.setItem('vl_token', data.token);
    localStorage.setItem('vl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    const now = Date.now();
    localStorage.removeItem('vl_explicit_logout');
    localStorage.setItem('vl_last_active', String(now));
    lastActiveRef.current = now;
    localStorage.setItem('vl_token', data.token);
    localStorage.setItem('vl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const larkLogin = async (code, redirectUri) => {
    const res = await fetch(`${API}/auth/lark/callback`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ code, redirectUri }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lark Login failed');
    const now = Date.now();
    localStorage.removeItem('vl_explicit_logout');
    localStorage.setItem('vl_last_active', String(now));
    lastActiveRef.current = now;
    localStorage.setItem('vl_token', data.token);
    localStorage.setItem('vl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const authFetch = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    });
    if (res.status === 401) { logout(); throw new Error('Session expired'); }
    if (res.status === 403) { throw new Error('Insufficient permissions'); }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }, [token]);

  const [previewRole, setPreviewRole] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);

  const previewAs = (role) => {
    if (user?.role !== 'super_admin') return;
    setPreviewRole(role);
    if (!role) setPreviewPlan(null); // Reset plan preview when exiting preview mode
  };

  const upgradePlanClientSide = (newPlan) => {
    if (!user) return;
    const updatedUser = { ...user, plan: newPlan };
    localStorage.setItem('vl_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Merge both role and plan previewing into the effective user
  const effectiveUser = (previewRole || previewPlan)
    ? {
        ...user,
        ...(previewRole ? { role: previewRole } : {}),
        ...(previewPlan ? { plan: previewPlan } : {}),
        _isPreview: true
      }
    : user;

  const isRole = (...roles) => roles.includes(effectiveUser?.role);

  return (
    <AuthContext.Provider value={{ user: effectiveUser, realUser: user, token, loading, login, register, larkLogin, logout, authFetch, isRole, ROLES, previewRole, previewPlan, previewAs, setPreviewPlan, upgradePlanClientSide }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
