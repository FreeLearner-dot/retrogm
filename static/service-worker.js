const CACHE_NAME = 'retrogm-cache-v1';
const urlsToCache = [
  '/',
  '/static/style.css',
  // Add other static assets and game JS files here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});