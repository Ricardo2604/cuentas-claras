// Cuentas Claras: guarda la app en el teléfono para que abra rápido y sin conexión.
// Sube CACHE cada vez que publiques una versión nueva.
const CACHE = 'cc-v33';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/cerdito-192.png', './icons/cerdito-512.png', './icons/cerdito-maskable.png', './icons/cerdito-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // tasas, formularios, etc. van directo
  // Primero la red (para recibir actualizaciones); si no hay conexión, lo guardado.
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
