// Service Worker para Neblina Stereo 105.5 FM PWA
const CACHE_NAME = 'neblina-cache-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.svg',
  '/favicon.png',
  '/favicon.ico',
  '/logo-tight.svg',
  '/icon-tight.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
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

self.addEventListener('fetch', (event) => {
  // No cachear llamadas a streaming de audio, API de WordPress ni metadatos de Éxtasis
  const url = event.request.url;
  if (
    url.includes(':7018') || 
    url.includes('zeno.fm') || 
    url.includes('wp-json') || 
    url.includes('api.php') ||
    url.includes('open-meteo.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Manejo de eventos de clic en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const clickUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la ventana ya está abierta, enfocarla
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Si no está abierta, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(clickUrl);
      }
    })
  );
});

// Manejo de notificaciones Push enviadas desde el servidor
self.addEventListener('push', (event) => {
  let data = {
    title: 'Neblina Stereo 105.5 FM',
    body: 'Nueva actualización en la estación.',
    icon: '/icon-192.png'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Neblina Stereo 105.5 FM', {
      body: data.body || '',
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      image: data.image || null,
      vibrate: [200, 100, 200],
      data: data.data || { url: '/' }
    })
  );
});
