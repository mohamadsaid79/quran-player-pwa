const CACHE_NAME = 'quran-player-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.svg'
];

// Install Service Worker and cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
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

// Fetch handler: Stale-While-Revalidate for app shell, cache-first for audios
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // If requesting audio (ends in mp3, or is from mp3quran/download.quranicaudio, etc.)
  if (url.pathname.endsWith('.mp3') || url.hostname.includes('mp3quran') || url.hostname.includes('quranicaudio')) {
    e.respondWith(
      caches.open('quran-audio-cache').then((cache) => {
        return cache.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to network if not cached
          return fetch(e.request);
        });
      })
    );
    return;
  }

  // Standard static assets: Stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, networkResponse);
            });
          }
        }).catch(() => {
          // Ignore background fetch errors (e.g. offline)
        });
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
