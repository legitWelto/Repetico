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
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});
