/**
 * Promptara Enterprise Service Worker (PWA & TWA — modeled after SecureScope)
 * Precaches app shell & icons gracefully so Chrome WebAPK & iOS standalone install never fail.
 */

const CACHE_NAME = 'promptara-shell-v3.6.0-r2';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] Precache skipped for asset: ${asset}`, err.message);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (!request.url || (!request.url.startsWith('http://') && !request.url.startsWith('https://'))) {
    return;
  }

  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // Offline reading support for public/news & courses GET endpoints
  if (url.pathname === '/api/news' || url.pathname === '/api/courses') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Never cache auth or other API calls
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/.well-known/') ||
    url.searchParams.has('token') ||
    url.searchParams.has('session_token') ||
    url.searchParams.has('code')
  ) {
    return;
  }

  // Navigation requests (HTML documents)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((c) => c.put('/index.html', clone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html');
          if (cachedIndex) return cachedIndex;
          const cachedOffline = await cache.match(OFFLINE_URL);
          return cachedOffline || new Response('Aplikasi sedang offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // Static Assets: Stale-While-Revalidate strategy
  if (
    url.origin === self.location.origin &&
    (url.pathname.endsWith('.js') ||
     url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.png') ||
     url.pathname.endsWith('.svg') ||
     url.pathname.endsWith('.woff2') ||
     url.pathname === '/manifest.json')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            }).catch(() => {});
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});
