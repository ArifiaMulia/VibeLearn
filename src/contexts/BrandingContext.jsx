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

  // Dynamically update favicon and page title based on branding
  useEffect(() => {
    if (branding.app_logo_url) {
      const rawUrl = branding.app_logo_url;
      const isAbsolute = rawUrl.startsWith('http') || rawUrl.startsWith('data:');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const finalUrl = isAbsolute ? rawUrl : `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
      
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = finalUrl;
    }
    
    if (branding.app_name) {
      document.title = branding.app_name;
    }
  }, [branding.app_logo_url, branding.app_name]);

  return (
    <BrandingContext.Provider value={{ ...branding, refreshBranding: fetchBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
