const CACHE_NAME = 'bookish-v1';
const BASE_PATH = '/Bookish';

const STATIC_CACHE_URLS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/static/js/bundle.js`,
  `${BASE_PATH}/static/css/main.css`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icons/icon-192x192.png`,
  `${BASE_PATH}/icons/icon-512x512.png`
];

const API_CACHE_URLS = [
  'https://www.googleapis.com/books/v1/volumes'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.hostname === 'www.googleapis.com') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response to cache it
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle app resources with cache-first strategy
  if (url.pathname.startsWith(BASE_PATH)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(request)
            .then((fetchResponse) => {
              // Cache successful responses
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return fetchResponse;
            })
            .catch(() => {
              // Return offline page for navigation requests
              if (request.mode === 'navigate') {
                return caches.match(`${BASE_PATH}/`);
              }
              throw new Error('Network request failed and no cache available');
            });
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync logic here
      console.log('Background sync triggered')
    );
  }
});

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: `${BASE_PATH}/icons/icon-192x192.png`,
      badge: `${BASE_PATH}/icons/icon-72x72.png`,
      data: data.url
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || BASE_PATH)
  );
});
