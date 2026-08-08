/* ─────────────────────────────────────────────────────────────────────────
   Promptara Service Worker  — Cache-First for assets, Network-First for API
   ───────────────────────────────────────────────────────────────────────── */

const CACHE_NAME = 'promptara-v1';

// App shell assets to cache on install
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
];

// ── Install: pre-cache shell ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
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
  
  // Skip unsupported schemes (chrome-extension, moz-extension, etc.) and non-http(s)
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  const url = new URL(request.url);

  // Skip non-GET and cross-origin API/external requests
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api')) return;  // Always network for API


  // For navigation requests (HTML pages) — Network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For images from /images/ — Cache first (lesson illustrations)
  if (url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
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
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        });
      })
    );
    return;
  }
});

