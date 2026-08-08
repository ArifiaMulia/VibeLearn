import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ContentProtection({ children, active = true }) {
  const { user } = useAuth();
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    if (!active) return;

    // 1. Prevent Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Prevent Keyboard Shortcuts (Ctrl+S, Ctrl+P, Ctrl+U, F12, Ctrl+Shift+I)
    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Detect Window Blur / Loss of focus (e.g., Snipping Tool, screen capture tools)
    const handleBlur = () => {
      setBlurred(true);
    };

    const handleFocus = () => {
      setBlurred(false);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [active]);

  if (!active) return children;

  const watermarkText = user?.email ? `${user.email} • Promptara Protected` : 'Promptara Protected Content';

  return (
    <div className={`relative transition-all duration-200 ${blurred ? 'blur-md select-none pointer-events-none' : ''}`}>
      {/* CSS Rules to prevent printing & selecting */}
      <style>{`
        @media print {
          body {
            display: none !important;
          }
        }
        .no-select {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>

      {/* Invisible/Subtle Watermark Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-50 overflow-hidden opacity-[0.035] flex flex-wrap justify-between items-center select-none"
        aria-hidden="true"
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i} 
            className="p-8 text-xs font-mono font-semibold tracking-widest uppercase transform -rotate-12 text-slate-400 dark:text-slate-200"
          >
            {watermarkText}
          </div>
        ))}
      </div>

      {/* Content wrapper */}
      <div className="no-select">
        {children}
      </div>
    </div>
  );
}
