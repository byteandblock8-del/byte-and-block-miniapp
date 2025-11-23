// Byte & Block Snack – placeholder service worker
self.addEventListener("install", (event) => {
  // skip waiting so updates take effect quickly
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // claim clients immediately
  event.waitUntil(self.clients.claim());
});

// Optional: simple passthrough fetch handler
self.addEventListener("fetch", () => {
  // Let the network handle everything for now
});
