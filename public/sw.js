/* ─────────────────────────────────────────────────────────────────────────
   Promptara Service Worker (PWABuilder & WebAPK Compliant — iOS & Android)
   - Network-First with Offline Cache Fallback for /api/news & /api/courses
   - Cache-First for static assets, icons & lesson illustrations
   ───────────────────────────────────────────────────────────────────────── */

const CACHE_NAME = 'promptara-v7';

// App shell assets to cache on install
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-192x192.png',
];

// Helper to safely cache put without throwing errors for unsupported schemes
function safeCachePut(request, response) {
  if (!request) return;
  const reqUrl = typeof request === 'string' ? request : request.url;
  if (!reqUrl) return;
  if (!reqUrl.startsWith('http://') && !reqUrl.startsWith('https://')) return;
  if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
    try {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
    } catch (e) {
      // Ignore cache put errors
    }
  }
}

// ── Install: pre-cache shell ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!request.url || (!request.url.startsWith('http://') && !request.url.startsWith('https://'))) return;

  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // For mobile offline reading: Network-First with Cache Fallback for News & Courses GET APIs
  if (
    url.pathname === '/api/news' ||
    url.pathname === '/api/courses' ||
    url.pathname === '/api/settings/branding'
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          safeCachePut(request, response);
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Always network for all other /api endpoints
  if (url.pathname.startsWith('/api')) return;

  // For navigation requests (HTML pages) — Network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          safeCachePut(request, response);
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For images and icons — Cache first
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          safeCachePut(request, response);
          return response;
        });
      })
    );
    return;
  }

  // For JS/CSS/fonts — Cache first, then network
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/assets/') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          safeCachePut(request, response);
          return response;
        });
      })
    );
    return;
  }
});
