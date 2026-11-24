/**
 * ToolLab Core Utilities Shared Service Worker
 * Path: /sw.js
 *
 * Registered individually per eligible utility scope:
 *   /etf, /rest-area, /market, /party
 * Strictly excludes /noise and /arcade (which manages its own /arcade/sw.js).
 */
const SW_VERSION = 'v1';

const SHARED_SHELL_ASSETS = [
  '/js/pwa-install-button.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
];

const TOOL_SHELLS = {
  '/etf': {
    key: 'etf',
    shellUrl: '/etf',
    assets: [
      '/etf',
      '/etf/manifest.webmanifest',
      '/etf/assets/index-y2dxhShM.js',
      '/etf/assets/index-Bdx3GPb3.css',
      ...SHARED_SHELL_ASSETS,
    ],
  },
  '/rest-area': {
    key: 'rest-area',
    shellUrl: '/rest-area',
    assets: [
      '/rest-area',
      '/rest-area/manifest.webmanifest',
      '/rest-area/src/utils/restAreaEngine.js',
      '/rest-area/src/data/rest_areas.json',
      ...SHARED_SHELL_ASSETS,
    ],
  },
  '/market': {
    key: 'market',
    shellUrl: '/market',
    assets: [
      '/market',
      '/market/manifest.webmanifest',
      '/market/markets_5day.json',
      ...SHARED_SHELL_ASSETS,
    ],
  },
  '/party': {
    key: 'party',
    shellUrl: '/party',
    assets: [
      '/party',
      '/party/manifest.webmanifest',
      '/party/style.css',
      '/party/calculator.js',
      '/party/exporter.js',
      '/party/app.js',
      ...SHARED_SHELL_ASSETS,
    ],
  },
};

function getScopePath() {
  try {
    const pathname = new URL(self.registration.scope).pathname;
    const trimmed = pathname.replace(/\/+$/, '');
    return trimmed || '/';
  } catch {
    return '/';
  }
}

const SCOPE_PATH = getScopePath();
const TOOL_CONFIG = TOOL_SHELLS[SCOPE_PATH] || null;
const CACHE_PREFIX = TOOL_CONFIG ? `toollab-pwa-${TOOL_CONFIG.key}-` : 'toollab-pwa-generic-';
const CACHE_NAME = `${CACHE_PREFIX}${SW_VERSION}`;

self.addEventListener('install', (event) => {
  if (!TOOL_CONFIG) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          TOOL_CONFIG.assets.map((url) =>
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
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isCacheableStaticPath(pathname) {
  if (!TOOL_CONFIG) return false;
  if (pathname === SCOPE_PATH || pathname.startsWith(`${SCOPE_PATH}/`)) return true;
  if (pathname.startsWith('/icons/')) return true;
  if (pathname.startsWith('/js/')) return true;
  if (pathname.startsWith('/css/')) return true;
  if (pathname === '/favicon.svg') return true;
  return false;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!TOOL_CONFIG || request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const { pathname } = url;
  if (
    pathname === '/sw.js' ||
    pathname === '/noise' ||
    pathname.startsWith('/noise/') ||
    pathname === '/arcade' ||
    pathname.startsWith('/arcade/')
  ) {
    return;
  }

  // Navigation requests within this utility scope: Network-first with cached shell fallback
  if (request.mode === 'navigate') {
    if (pathname !== SCOPE_PATH && !pathname.startsWith(`${SCOPE_PATH}/`)) return;

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(TOOL_CONFIG.shellUrl, copy))
              .catch(() => undefined);
          }
          return response;
        })
        .catch(async () => {
          const cachedShell = await caches.match(TOOL_CONFIG.shellUrl);
          if (cachedShell) return cachedShell;
          return caches.match(request);
        })
    );
    return;
  }

  // Same-origin static assets for this utility: Stale-While-Revalidate
  if (!isCacheableStaticPath(pathname)) return;

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
