/**
 * sw.js — Service Worker custom PolisRoad
 *
 * Strategia: injectManifest (vite-plugin-pwa).
 * Workbox al build sostituisce self.__WB_MANIFEST con la lista dei file
 * da precachare e aggiunge gli import workbox necessari automaticamente.
 */

const PRECACHE_ASSETS = self.__WB_MANIFEST || [];

const CACHE_VERSION = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev';
const CACHE_NAME = `polisroad-${CACHE_VERSION}`;

// ─── Install: precache assets ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = PRECACHE_ASSETS.map(entry =>
        typeof entry === 'string' ? entry : entry.url
      );
      return cache.addAll(urls).catch(() => {});
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

// ─── Fetch: bypass cache per API Supabase, cache-first per asset statici ─────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Bypass totale per le chiamate API Supabase e PostHog:
  // questi devono sempre andare in rete, mai da cache.
  if (
    url.includes('supabase.co') ||
    url.includes('supabase.io') ||
    url.includes('posthog.com') ||
    url.includes('/functions/v1/')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Richieste di NAVIGAZIONE (apertura o reload della pagina): il browser
  // richiede sempre l'URL esatto digitato/aperto (es. "/", "/?page=prontuario",
  // un deep-link da notifica push...), ma l'unica risorsa precachata è
  // "index.html" — chiavi diverse, "cache.match(event.request)" non trova
  // mai una corrispondenza. Prima di questo fix: online funzionava (la rete
  // rispondeva comunque), ma un cold-start (app chiusa/refresh) mentre offline
  // falliva sempre con "nessuna connessione", senza mostrare nulla — esattamente
  // il caso di un'app SPA che deve sempre servire la stessa index.html per
  // qualunque path, gestito qui esplicitamente invece di affidarsi al match
  // esatto sull'URL richiesto.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('index.html').then((cached) => cached || caches.match('/'))
      )
    );
    return;
  }

  // Cache-first per tutti gli altri asset (JS, CSS, icone, HTML).
  // Caso raro ma possibile: un asset non precachato (es. un chunk nuovo non
  // ancora nella cache di questo Service Worker) richiesto mentre offline —
  // senza rete e senza voce in cache, "cached" è undefined: rispondere con
  // undefined è un errore per il Fetch API (TypeError silenzioso in console).
  // Meglio un 504 esplicito, gestibile normalmente dal codice che ha fatto la richiesta.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached || new Response('', { status: 504, statusText: 'Offline' }));
    })
  );
});

// ─── Message: skipWaiting su richiesta esplicita ──────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Push ─────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data;
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
    renotify: true,
    data: {
      url:  data.url  || '/',
      page: data.page || 'home',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── Click sulla notifica ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  const targetPage = notifData.page || 'home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE_TO', page: targetPage });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
