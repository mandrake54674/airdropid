// Service Worker untuk Airdrop Tracker Pro
const CACHE_NAME = 'airdrop-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch event dengan penanganan error yang tepat
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip caching jika bukan GET request
  if (request.method !== 'GET') {
    return;
  }

  try {
    const url = new URL(request.url);

    // Skip caching untuk:
    // 1. Ekstensi Chrome
    // 2. Skema non-HTTP(S)
    // 3. Google Sheets API (selalu fetch data terbaru)
    // 4. External APIs yang mungkin memiliki CORS issues
    if (
      url.protocol === 'chrome-extension:' ||
      url.protocol === 'chrome:' ||
      !url.protocol.startsWith('http') ||
      url.href.includes('script.google.com') ||
      url.href.includes('sheets.googleapis.com') ||
      url.href.includes('etherscan.io') ||
      url.href.includes('bnb48.club') ||
      url.href.includes('binance.org') ||
      url.href.includes('polygon.technology') ||
      url.href.includes('coingecko.com')
    ) {
      return;
    }

    // Only cache static assets from same origin
    if (url.origin !== location.origin) {
      return;
    }

    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Hanya cache response dengan status 200 dan dari origin yang sama
            if (response && response.status === 200 && response.type !== 'opaque') {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Mengembalikan versi cached jika jaringan gagal
            return caches.match(request);
          });
      })
    );
  } catch (error) {
    console.warn('Service Worker fetch error:', error);
    return;
  }
});
