import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

export const ROLES = { SUPER_ADMIN: 'super_admin', MASTER: 'master', PARTICIPANT: 'participant' };

const API = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes default

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vl_token'));
  const [loading, setLoading] = useState(true);
  const [idleTimeoutMs, setIdleTimeoutMs] = useState(DEFAULT_IDLE_TIMEOUT_MS);
  const [sessionIdleLabel, setSessionIdleLabel] = useState('30m');
  const lastActiveRef = useRef(Date.now());
  const idleTimeoutRef = useRef(DEFAULT_IDLE_TIMEOUT_MS);

  const clearSsoCookieClientSide = () => {
    if (typeof document === 'undefined') return;
    document.cookie = 'virtuenet_sso_jwt=; Max-Age=0; path=/;';
    document.cookie = 'virtuenet_sso_jwt=; Max-Age=0; path=/; domain=.virtuenet.space;';
  };

  const refreshSessionConfig = useCallback(() => {
    fetch(`${API}/auth/session-config`, { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.timeoutMs) {
          idleTimeoutRef.current = Number(data.timeoutMs);
          setIdleTimeoutMs(Number(data.timeoutMs));
        }
        if (data?.sessionIdleTimeout) {
          setSessionIdleLabel(data.sessionIdleTimeout);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshSessionConfig();
  }, [refreshSessionConfig]);

  /**
   * Hardened sign-out:
   *  1. revoke the JWT & device session on the server,
   *  2. wipe every local trace (tokens, user, cached API responses, Cache Storage),
   *  3. end the platform SSO session and land on the login page.
   */
  const logout = useCallback((reason = 'manual', opts = {}) => {
    const oldToken = localStorage.getItem('vl_token');
    try {
      fetch(`${API}/auth/logout`, {
        method: 'POST', credentials: 'include', keepalive: true,
        headers: oldToken ? { Authorization: `Bearer ${oldToken}` } : {},
      }).catch(() => {});
    } catch { /* noop */ }

    try {
      const KEEP = new Set(['vl_theme', 'vl_lang']);
      Object.keys(localStorage).forEach((k) => { if (k.startsWith('vl_') && !KEEP.has(k)) localStorage.removeItem(k); });
      ['token', 'jwt', 'auth_token', 'user'].forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('vl_explicit_logout', '1');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
        if (reason === 'idle') sessionStorage.setItem('vl_logout_reason', 'idle');
      }
      if (typeof caches !== 'undefined') caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
    } catch { /* noop */ }

    clearSsoCookieClientSide();
    setToken(null);
    setUser(null);

    const target = opts.navigateTo || '/logout';
    setTimeout(() => window.location.replace(target), 120);
  }, []);

  useEffect(() => {
    if (token) {
      const savedLastActive = Number(localStorage.getItem('vl_last_active') || 0);
      if (savedLastActive > 0 && Date.now() - savedLastActive >= idleTimeoutRef.current) {
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
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const ssoToken = params ? (params.get('sso_token') || params.get('token')) : null;
      const larkPending = localStorage.getItem('vl_lark_pending') === '1' || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('vl_lark_pending') === '1');
      if (ssoToken || larkPending) {
        localStorage.removeItem('vl_explicit_logout');
        if (typeof document !== 'undefined') {
          document.cookie = 'vl_logged_out=; Max-Age=0; path=/;';
          document.cookie = 'vl_logged_out=; Max-Age=0; path=/; domain=.virtuenet.space;';
        }
      }
      const explicitLogout = localStorage.getItem('vl_explicit_logout') === '1';

      if (explicitLogout && !ssoToken && !larkPending) {
        setLoading(false);
        return;
      }

      const qs = new URLSearchParams();
      if (ssoToken) qs.set('sso_token', ssoToken);
      if (larkPending) qs.set('lark_pending', '1');
      const ssoUrl = qs.toString() ? `${API}/auth/me?${qs.toString()}` : `${API}/auth/me`;
      fetch(ssoUrl, { credentials: 'include' })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data && data.user && data.token) {
            const now = Date.now();
            localStorage.removeItem('vl_explicit_logout');
            localStorage.removeItem('vl_lark_pending');
            if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('vl_lark_pending');
            localStorage.setItem('vl_last_active', String(now));
            lastActiveRef.current = now;
            localStorage.setItem('vl_token', data.token);
            localStorage.setItem('vl_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            if ((ssoToken || larkPending) && window.history?.replaceState) {
              const cleanUrl = window.location.pathname === '/' || window.location.pathname === '/login'
                ? '/dashboard'
                : window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [token, logout]);

  // Track user activity & enforce dynamic idle auto-logout (Session Governance)
  useEffect(() => {
    if (!token) return;

    const recordActivity = () => {
      const now = Date.now();
      const prev = Number(localStorage.getItem('vl_last_active') || lastActiveRef.current || now);
      if (now - prev >= idleTimeoutRef.current) {
        logout('idle');
        return;
      }
      lastActiveRef.current = now;
      if (now - prev >= 10000) {
        localStorage.setItem('vl_last_active', String(now));
      }
    };

    const checkIdle = () => {
      const lastActive = Number(localStorage.getItem('vl_last_active') || lastActiveRef.current || Date.now());
      if (Date.now() - lastActive >= idleTimeoutRef.current) {
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
  }, [token, logout, idleTimeoutMs]);

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

  const applySessionFromAuthResponse = (data) => {
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

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return applySessionFromAuthResponse(data);
  };

  const breakGlassLogin = async (code) => {
    const res = await fetch(`${API}/auth/break-glass/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Kode Break-Glass 2FA tidak valid');
    return { ...data, user: applySessionFromAuthResponse(data) };
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return applySessionFromAuthResponse(data);
  };

  const larkLogin = async (code, redirectUri) => {
    const res = await fetch(`${API}/auth/lark/callback`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ code, redirectUri }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lark Login failed');
    return applySessionFromAuthResponse(data);
  };

  const authFetch = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    });
    if (res.status === 401) { logout(); throw new Error('Session expired'); }
    if (res.status === 403) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Insufficient permissions');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }, [token, logout]);

  const [previewRole, setPreviewRole] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);

  const previewAs = (role) => {
    if (user?.role !== 'super_admin') return;
    setPreviewRole(role);
    if (!role) setPreviewPlan(null);
  };

  const upgradePlanClientSide = (newPlan) => {
    if (!user) return;
    const updatedUser = { ...user, plan: newPlan };
    localStorage.setItem('vl_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

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
    <AuthContext.Provider value={{
      user: effectiveUser,
      realUser: user,
      token,
      loading,
      login,
      breakGlassLogin,
      register,
      larkLogin,
      logout,
      authFetch,
      isRole,
      ROLES,
      previewRole,
      previewPlan,
      previewAs,
      setPreviewPlan,
      upgradePlanClientSide,
      idleTimeoutMs,
      sessionIdleLabel,
      refreshSessionConfig,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
