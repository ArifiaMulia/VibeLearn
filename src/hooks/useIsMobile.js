import { useState, useEffect } from 'react';

// True on real phones even when the browser is forced into a wide "desktop site" viewport.
function detect(breakpoint) {
  if (window.innerWidth < breakpoint) return true;
  try {
    return window.matchMedia('(pointer: coarse)').matches && window.screen.width < breakpoint;
  } catch { return false; }
}

/**
 * Returns true when the viewport width is below the given breakpoint (default 768px).
 * Updates reactively on window resize.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => detect(breakpoint));

  useEffect(() => {
    const handler = () => setIsMobile(detect(breakpoint));
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);

  return isMobile;
}
