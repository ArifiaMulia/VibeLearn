import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const ROLES = { SUPER_ADMIN: 'super_admin', MASTER: 'master', PARTICIPANT: 'participant' };

const API = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vl_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const saved = localStorage.getItem('vl_user');
      if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
    }
    setLoading(false);
  }, [token]);

  // Heartbeat every 3 min
  useEffect(() => {
    if (!token) return;
    const ping = () => fetch(`${API}/auth/activity`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    ping();
    const id = setInterval(ping, 180000);
    return () => clearInterval(id);
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('vl_token', data.token);
    localStorage.setItem('vl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('vl_token', data.token);
    localStorage.setItem('vl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const larkLogin = async (code, redirectUri) => {
    const res = await fetch(`${API}/auth/lark/callback`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lark Login failed');
    localStorage.setItem('vl_token', data.token);
    localStorage.setItem('vl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('vl_token');
    localStorage.removeItem('vl_user');
    setToken(null);
    setUser(null);
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
