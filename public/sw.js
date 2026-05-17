// Kill-switch service worker.
// Replaces any stale SW left over from a previous deployment.
// Unregisters itself and clears all caches on activation, then reloads clients.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (_) { /* ignore */ }

    try {
      await self.registration.unregister();
    } catch (_) { /* ignore */ }

    const clientsList = await self.clients.matchAll({ type: 'window' });
    for (const client of clientsList) {
      try { client.navigate(client.url); } catch (_) { /* ignore */ }
    }
  })());
});

// Pass through any fetch — never block requests.
self.addEventListener('fetch', () => {});
