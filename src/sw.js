/**
 * sw.js — Service Worker custom PolisRoad
 *
 * Strategia: injectManifest (vite-plugin-pwa).
 * Workbox al build sostituisce self.__WB_MANIFEST con la lista dei file
 * da precachare e aggiunge gli import workbox necessari automaticamente
 * quando si usa importScripts o le injected workbox globals.
 *
 * Per semplicità e compatibilità con l'ambiente di build (nessun workbox-*
 * come dipendenza diretta), usiamo il precaching tramite Cache API nativo
 * e lasciamo che vite-plugin-pwa inietti __WB_MANIFEST.
 *
 * ⚠️ NON importare da react/vite qui — questo file gira nel SW context.
 */

// Vite-plugin-pwa inietta qui la lista dei file da precachare al build.
// In development è un array vuoto.
const PRECACHE_ASSETS = self.__WB_MANIFEST || [];

// Cache versioned: usa il timestamp di build (sostituito da vite.config.js)
// così ogni nuovo deploy usa una cache diversa e activate() fa pulizia corretta.
const CACHE_VERSION = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev';
const CACHE_NAME = `polisroad-${CACHE_VERSION}`;

// ─── Install: precache assets ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = PRECACHE_ASSETS.map(entry =>
        typeof entry === 'string' ? entry : entry.url
      );
      return cache.addAll(urls).catch(() => {
        // Fallisce silenziosamente se qualche asset non è raggiungibile
      });
    })
  );
});

// ─── Activate: rimuovi cache vecchie ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: cache-first per asset precachati, network-first per il resto ─────
self.addEventListener('fetch', (event) => {
  // Solo GET, solo stesso origin o CDN noti
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});

// ─── Prompt mode: skipWaiting su richiesta esplicita ─────────────────────────
// Chiamato da updateServiceWorker(true) in PwaUpdater quando l'utente
// clicca "Riavvia & Aggiorna"
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Push ─────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'PolisRoad', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'PolisRoad';
  const options = {
    body:     data.body  || '',
    icon:     data.icon  || '/icons/icon-192.png',
    badge:    data.badge || '/icons/icon-192.png',
    tag:      data.tag   || 'polisroad-push',
    // renotify: mostra la notifica anche se esiste già una con lo stesso tag
    renotify: true,
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── Click sulla notifica ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se l'app è già aperta: portala in primo piano e naviga all'URL
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // Altrimenti apri una nuova finestra
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});


// ─── Install: precache assets ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = PRECACHE_ASSETS.map(entry =>
        typeof entry === 'string' ? entry : entry.url
      );
      return cache.addAll(urls).catch(() => {
        // Fallisce silenziosamente se qualche asset non è raggiungibile
      });
    })
  );
});

// ─── Activate: rimuovi cache vecchie ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

// ─── Fetch: cache-first per asset precachati, network-first per il resto ─────
self.addEventListener('fetch', (event) => {
  // Solo GET, solo stesso origin o CDN noti
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});

// ─── Prompt mode: skipWaiting su richiesta esplicita ─────────────────────────
// Chiamato da updateServiceWorker(true) in PwaUpdater quando l'utente
// clicca "Riavvia & Aggiorna"
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Push ─────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'PolisRoad', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'PolisRoad';
  const options = {
    body:     data.body  || '',
    icon:     data.icon  || '/icons/icon-192.png',
    badge:    data.badge || '/icons/icon-192.png',
    tag:      data.tag   || 'polisroad-push',
    // renotify: mostra la notifica anche se esiste già una con lo stesso tag
    renotify: true,
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── Click sulla notifica ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se l'app è già aperta: portala in primo piano e naviga all'URL
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // Altrimenti apri una nuova finestra
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
