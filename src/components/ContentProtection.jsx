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
    <div 
      style={{ 
        position: 'relative', 
        transition: 'all 0.2s ease',
        filter: blurred ? 'blur(12px)' : 'none',
        userSelect: blurred ? 'none' : 'auto',
        pointerEvents: blurred ? 'none' : 'auto',
      }}
    >
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

      {/* Invisible Watermark Overlay (Inline Pure CSS for 100% Human Invisibility) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          pointerEvents: 'none',
          overflow: 'hidden',
          opacity: 0.005, // 0.5% opacity: Completely invisible to the naked human eye
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          alignItems: 'center',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        aria-hidden="true"
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div 
            key={i} 
            style={{
              padding: '2rem',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transform: 'rotate(-12deg)',
              color: 'var(--text-muted)',
            }}
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
