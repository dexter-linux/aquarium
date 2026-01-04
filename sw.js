const CACHE_NAME = 'aquarium-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/sketch.js',
  '/song.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js',  // Update to your p5.js version/CDN if different
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js'  // Update if different
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
      .then(response => {
        return response || fetch(event.request);
      })
  );
});