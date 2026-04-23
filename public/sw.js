const CACHE_NAME = 'repetico-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Icon.png',
  '/song.mp3',
  '/song.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Bypass Service Worker for Vite development assets and HMR
  if (url.pathname.startsWith('/@vite') || url.pathname.includes('hot-update')) {
    return;
  }

  e.respondWith(
    caches.match(e.request)
      .then(response => {
        return response || fetch(e.request).catch(err => {
          console.error('SW fetch failed for:', e.request.url, err);
          // Return a failure response instead of rejecting, to avoid net::ERR_FAILED
          return new Response('Network error', { status: 408, statusText: 'Network error' });
        });
      })
  );
});
