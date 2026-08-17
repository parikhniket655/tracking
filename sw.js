const CACHE_NAME = "wazir-tracker-cache-v1";
const ASSETS = [
  "./index.html",
  "./css/styles.css",
  "./js/mockData.js",
  "./js/store.js",
  "./js/emailService.js",
  "./js/app.js",
  "./manifest.json",
  "./wazir-logo.png"
];

// Install Event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Interceptor for Offline Use
self.addEventListener("fetch", (e) => {
  // Let Supabase requests bypass cache
  if (e.request.url.includes("supabase.co")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache static requests dynamically
        if (networkResponse.status === 200 && e.request.method === "GET") {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Ignore
      });
    })
  );
});
