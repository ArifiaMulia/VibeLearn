import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

export const ROLES = { SUPER_ADMIN: 'super_admin', MASTER: 'master', PARTICIPANT: 'participant' };

const API = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes default

export function clearAuthLogoutCookies() {
  if (typeof document === 'undefined') return;
  const expired = 'Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
  for (const name of ['vl_logged_out', 'virtuenet_sso_logged_out', 'vl_lark_pending']) {
    document.cookie = `${name}=; ${expired}`;
    document.cookie = `${name}=; ${expired} domain=.virtuenet.space;`;
  }
}

function getCookieValue(name) {
  if (typeof document === 'undefined') return '';
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      try {
        return decodeURIComponent(trimmed.slice(prefix.length));
      } catch {
        return trimmed.slice(prefix.length);
      }
    }
  }
  return '';
}

function clearLocalAuthStorage() {
  try {
    const KEEP = new Set(['vl_theme', 'vl_lang']);
    Object.keys(localStorage).forEach((k) => { if (k.startsWith('vl_') && !KEEP.has(k)) localStorage.removeItem(k); });
    ['token', 'jwt', 'auth_token', 'user'].forEach((k) => localStorage.removeItem(k));
  } catch { /* noop */ }
}

function stripAuthQueryParamsFromUrl() {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  try {
    const currentUrl = new URL(window.location.href);
    let changed = false;
    for (const key of ['sso_token', 'token', 'session_token']) {
      if (currentUrl.searchParams.has(key)) {
        currentUrl.searchParams.delete(key);
        changed = true;
      }
    }
    if (changed) {
      const cleanSearch = currentUrl.searchParams.toString();
      const cleanUrl = `${currentUrl.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${currentUrl.hash || ''}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch { /* noop */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vl_token'));
  const [loading, setLoading] = useState(true);
  const [idleTimeoutMs, setIdleTimeoutMs] = useState(DEFAULT_IDLE_TIMEOUT_MS);
  const [sessionIdleLabel, setSessionIdleLabel] = useState('30m');
  const lastActiveRef = useRef(Date.now());
  const idleTimeoutRef = useRef(DEFAULT_IDLE_TIMEOUT_MS);
  const verifiedTokenRef = useRef(null);
  const skipNextNullFetchRef = useRef(false);

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
      fetch(`${API}/auth/session-clear`, {
        method: 'POST', credentials: 'include', keepalive: true,
        headers: oldToken ? { Authorization: `Bearer ${oldToken}` } : {},
      }).catch(() => {});
    } catch { /* noop */ }

    clearLocalAuthStorage();
    verifiedTokenRef.current = null;
    try {
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
    let cancelled = false;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlSsoToken = params ? (params.get('sso_token') || params.get('token')) : null;
    const larkPending = localStorage.getItem('vl_lark_pending') === '1' ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('vl_lark_pending') === '1');

    if (urlSsoToken || larkPending) {
      localStorage.removeItem('vl_explicit_logout');
      clearAuthLogoutCookies();
    }

    const persistSession = (data) => {
      const now = Date.now();
      localStorage.removeItem('vl_explicit_logout');
      localStorage.removeItem('vl_lark_pending');
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('vl_lark_pending');
      clearAuthLogoutCookies();
      localStorage.setItem('vl_last_active', String(now));
      lastActiveRef.current = now;
      localStorage.setItem('vl_token', data.token);
      localStorage.setItem('vl_user', JSON.stringify(data.user));
      verifiedTokenRef.current = data.token;
      stripAuthQueryParamsFromUrl();
      setToken(data.token);
      setUser(data.user);
    };

    // 1. Prioritize fresh SSO token in URL even if an older vl_token exists in localStorage
    if (urlSsoToken) {
      const now = Date.now();
      localStorage.setItem('vl_last_active', String(now));
      lastActiveRef.current = now;
      setLoading(true);
      const qs = new URLSearchParams({ sso_token: urlSsoToken, lark_pending: '1' });
      fetch(`${API}/auth/me?${qs.toString()}`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled) return;
          if (data?.user && data?.token) {
            persistSession(data);
          } else {
            stripAuthQueryParamsFromUrl();
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => { cancelled = true; };
    }

    // 2. Existing local token in state / localStorage
    if (token) {
      if (verifiedTokenRef.current && verifiedTokenRef.current === token) {
        const saved = localStorage.getItem('vl_user');
        if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
        setLoading(false);
        return;
      }

      const savedLastActive = Number(localStorage.getItem('vl_last_active') || 0);
      const isIdleStale = savedLastActive > 0 && Date.now() - savedLastActive >= idleTimeoutRef.current;

      if (isIdleStale) {
        // Clear stale local token & last_active without calling destructive /logout; fall through to /api/auth/me
        clearLocalAuthStorage();
        lastActiveRef.current = Date.now();
        verifiedTokenRef.current = null;
        setLoading(true);
        fetch(`${API}/auth/me`, { credentials: 'include' })
          .then((res) => (res.ok ? res.json() : { _unauth: res.status === 401 || res.status === 403 }))
          .then((data) => {
            if (cancelled) return;
            if (data?.user && data?.token) {
              persistSession(data);
            } else {
              skipNextNullFetchRef.current = true;
              setToken(null);
              setUser(null);
            }
          })
          .catch(() => {
            if (!cancelled) {
              skipNextNullFetchRef.current = true;
              setToken(null);
              setUser(null);
            }
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
        return () => { cancelled = true; };
      }

      const now = Date.now();
      lastActiveRef.current = savedLastActive > 0 ? savedLastActive : now;
      if (!savedLastActive) {
        localStorage.setItem('vl_last_active', String(now));
      }
      let hydratedFromCache = false;
      const saved = localStorage.getItem('vl_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
          hydratedFromCache = true;
          setLoading(false);
        } catch {}
      }

      // Verify stored token in background (and seamlessly refresh from SSO cookie if local JWT expired)
      fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
        .then(async (res) => {
          if (res.ok) return res.json();
          if (res.status === 401 || res.status === 403) return { _unauth: true };
          return null;
        })
        .then((data) => {
          if (cancelled) return;
          if (data?.user && data?.token) {
            persistSession(data);
          } else if (data?._unauth) {
            clearLocalAuthStorage();
            verifiedTokenRef.current = null;
            skipNextNullFetchRef.current = true;
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          if (!cancelled && !hydratedFromCache) setLoading(false);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => { cancelled = true; };
    }

    // 3. No local token — try cookie / Edge SSO unless user explicitly logged out and has no active SSO cookie
    if (skipNextNullFetchRef.current) {
      skipNextNullFetchRef.current = false;
      setLoading(false);
      return;
    }

    let explicitLogout = localStorage.getItem('vl_explicit_logout') === '1';
    const hasActiveSsoCookie = Boolean(getCookieValue('virtuenet_sso_jwt'));
    const hasLoggedOutSsoCookie = getCookieValue('virtuenet_sso_logged_out') === '1';
    if (explicitLogout && hasActiveSsoCookie && !hasLoggedOutSsoCookie) {
      localStorage.removeItem('vl_explicit_logout');
      explicitLogout = false;
    }

    if (explicitLogout && !larkPending) {
      setLoading(false);
      return;
    }

    const qs = new URLSearchParams();
    if (larkPending) qs.set('lark_pending', '1');
    const ssoUrl = qs.toString() ? `${API}/auth/me?${qs.toString()}` : `${API}/auth/me`;
    fetch(ssoUrl, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.user && data?.token) {
          persistSession(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  // Track user activity & enforce dynamic idle auto-logout (Session Governance)
  useEffect(() => {
    if (!token || loading) return;

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
  }, [token, loading, logout, idleTimeoutMs]);

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
    localStorage.removeItem('vl_lark_pending');
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('vl_lark_pending');
    clearAuthLogoutCookies();
    localStorage.setItem('vl_last_active', String(now));
    lastActiveRef.current = now;
    localStorage.setItem('vl_token', data.token);
    localStorage.setItem('vl_user', JSON.stringify(data.user));
    verifiedTokenRef.current = data.token;
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
