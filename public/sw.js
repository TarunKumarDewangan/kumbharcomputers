// Minimal service worker: only makes the app installable and keeps static
// assets (JS/CSS/icons) fast on repeat visits. It deliberately does NOT
// cache pages or API/Supabase responses — this app shows live invoice,
// customer and stock data, and silently serving stale data would be worse
// than just failing offline.

const CACHE_NAME = "kc-static-v1";
const STATIC_DESTINATIONS = new Set(["style", "script", "font", "image"]);

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Cache-first for static, hashed build assets and icons.
  if (STATIC_DESTINATIONS.has(request.destination)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // Everything else (pages, data) always goes to the network — only
  // step in with a plain offline message if the network is unreachable.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            "<!doctype html><title>Offline</title><body style='font-family:sans-serif;padding:2rem'><h1>You're offline</h1><p>Reconnect to load invoices, customers and stock.</p></body>",
            { headers: { "Content-Type": "text/html" } }
          )
      )
    );
  }
});
