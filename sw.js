/* Simple SW: cache-first for assets, stale-while-revalidate */
const CACHE = 'wwp-assets-v1';
const ASSET_PATTERN = /\/(assets|fonts)\//;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (ASSET_PATTERN.test(url.pathname) && req.method === 'GET') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })());
  }
});
