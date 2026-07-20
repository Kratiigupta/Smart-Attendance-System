const CACHE_NAME = 'smartedu-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/student_avatar.png'
];

// Install event - caching base assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - cleaning up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network-first fallback to cache strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip API routes, socket.io and hot-reloads
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/socket.io') ||
    event.request.url.includes('/_next/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the newly retrieved asset
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Try serving from cache if offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If a page route is requested offline, return home page or a simple offline indicator if desired
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
