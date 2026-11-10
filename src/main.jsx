import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Phones forced into a ~980px "desktop site" viewport: scale the page so it lays out at the real screen width.
// Security: after sign-out the browser must never restore a protected page from the back/forward cache.
window.addEventListener('pageshow', (e) => {
  try {
    const p = window.location.pathname;
    const isPublic = p === '/' || p === '/login' || p === '/logout' || p.startsWith('/verify/') || p === '/lark-callback';
    if (e.persisted && !isPublic && !localStorage.getItem('vl_token')) window.location.replace('/login');
  } catch { /* noop */ }
});

function fixDesktopViewport() {
  try {
    const sw = window.screen.width;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const root = document.documentElement;
    if (coarse && sw <= 820 && window.innerWidth > sw * 1.25) {
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) meta.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover');
      root.style.zoom = String(window.innerWidth / sw);
    } else {
      root.style.zoom = '';
    }
  } catch { /* noop */ }
}
fixDesktopViewport();
window.addEventListener('load', () => setTimeout(fixDesktopViewport, 150));
window.addEventListener('resize', fixDesktopViewport);
window.addEventListener('orientationchange', () => setTimeout(fixDesktopViewport, 200));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/pwa-sw.js', { scope: '/' }).catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
