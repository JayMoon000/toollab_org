const CACHE_NAME = 'toollab-arcade-v3';
const APP_SHELL_URLS = [
  '/arcade',
  '/arcade/manifest.webmanifest',
  '/arcade/icons/icon-192.png',
  '/arcade/icons/icon-512.png',
  '/arcade/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          APP_SHELL_URLS.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('toollab-arcade-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests under /arcade
  if (url.origin !== self.location.origin) return;
  if (url.pathname !== '/arcade' && !url.pathname.startsWith('/arcade/')) return;
  if (url.pathname === '/arcade/sw.js') return;

  // Navigation requests (/arcade, /arcade/games/*): Network-first with cached shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/arcade', copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/arcade');
          if (cached) return cached;
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets (/arcade/assets/*, /arcade/icons/*, manifest): Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkPromise = fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            cache.put(request, response.clone()).catch(() => undefined);
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkPromise;
    })
  );
});
