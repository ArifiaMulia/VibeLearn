import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BrandingContext = createContext(null);

const API = import.meta.env.VITE_API_URL || '/api';

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({
    app_name: 'Promptara',
    app_tagline: 'AI Coding Academy',
    app_logo_url: '/logo.png',
  });
  const [loading, setLoading] = useState(true);

  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch(`${API}/config?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setBranding(data);
      }
    } catch (err) {
      console.error('Failed to fetch branding configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return (
    <BrandingContext.Provider value={{ ...branding, refreshBranding: fetchBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
