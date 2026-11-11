import { useState, useEffect } from 'react';

// True on real phones & tablets even when the browser or WebAPK uses a wider CSS viewport.
function detect(breakpoint) {
  if (typeof window === 'undefined') return false;
  if (window.innerWidth < breakpoint) return true;
  try {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
    const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent || '');
    if (uaMobile && window.innerWidth <= 1024) return true;
    if (isCoarse && Math.min(window.screen.width, window.innerWidth) <= Math.max(breakpoint, 900)) return true;
    return false;
  } catch { return false; }
}

function syncMobileRootClass() {
  if (typeof document === 'undefined') return;
  const mobile = detect(768);
  document.documentElement.classList.toggle('is-mobile-device', mobile);
}

// Run immediately on module load
syncMobileRootClass();

/**
 * Returns true when the viewport width is below the given breakpoint (default 768px)
 * OR when running on a mobile touch device.
 * Updates reactively on window resize and orientation change.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => detect(breakpoint));

  useEffect(() => {
    syncMobileRootClass();
    const handler = () => {
      syncMobileRootClass();
      setIsMobile(detect(breakpoint));
    };
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
