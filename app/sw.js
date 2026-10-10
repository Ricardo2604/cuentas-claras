// Cuentas Claras: guarda la app en el teléfono para que abra rápido y sin conexión.
// Sube CACHE cada vez que publiques una versión nueva.
const CACHE = 'cc-v53';
const FONTS = 'cc-fonts'; // las letras de Google se guardan aparte y sobreviven a las versiones nuevas
const PREF = 'cc-pref';   // aquí se recuerda la mascota elegida para el ícono
const OCR = 'cc-ocr';     // lector de capturas (Tesseract): se baja una vez y queda para usar sin internet
const PETS = ['cerdito', 'gato', 'perro', 'guacamaya', 'caiman', 'tigre', 'aguila', 'mosca', 'zancudo'];
const SHELL = ['./', './index.html', './manifest.webmanifest', ...PETS.map(p => `./manifest-${p}.webmanifest`), './icons/app-192.png', './icons/app-512.png', './icons/app-maskable.png',
  ...PETS.flatMap(p => ['192', '512', 'maskable', '180'].map(s => `./icons/${p}-${s}.png`))];
const NET_WAIT = 2500; // si la red no contesta en este tiempo, abre con lo guardado

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  const keep = [CACHE, FONTS, PREF, OCR];
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => !keep.includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// La página avisa qué mascota eligió el usuario.
self.addEventListener('message', e => {
  const pet = e.data && e.data.pet;
  if (PETS.includes(pet)) e.waitUntil(caches.open(PREF).then(c => c.put('./__pet', new Response(pet))));
});
const chosenPet = () => caches.open(PREF).then(c => c.match('./__pet')).then(r => r ? r.text() : 'cerdito').catch(() => 'cerdito');

const save = (cache, req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(cache).then(c => c.put(req, copy)); } return res; };
const fromNet = (req, cache) => fetch(req).then(res => save(cache, req, res));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Letras de Google: lo guardado primero, y se refresca en segundo plano.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(hit => { const net = fromNet(req, FONTS).catch(() => hit); return hit || net; }));
    return;
  }
  // Lector de capturas: lo guardado primero (los archivos no cambian dentro de una versión).
  if ((url.hostname === 'cdn.jsdelivr.net' && /\/(tesseract\.js|tesseract\.js-core)@/.test(url.pathname)) || url.hostname === 'tessdata.projectnaptha.com') {
    e.respondWith(caches.match(req).then(hit => hit || fromNet(req, OCR)));
    return;
  }
  if (url.origin !== location.origin) return; // tasas, formularios, etc. van directo

  // Ícono de la app instalada: siempre la mascota elegida.
  const ic = url.pathname.match(/\/icons\/app-(192|512|maskable)\.png$/);
  if (ic) {
    e.respondWith(chosenPet().then(p => caches.match(`./icons/${p}-${ic[1]}.png`, { ignoreSearch: true })).then(r => r || fetch(req)));
    return;
  }

  // La página: se intenta la red un momento (para recibir versiones nuevas); si tarda o no hay, abre lo guardado.
  if (req.mode === 'navigate') {
    const net = fromNet(req, CACHE);
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fallback = () => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')).then(r => { if (r && !done) { done = true; resolve(r); } return r; });
      const timer = setTimeout(fallback, NET_WAIT);
      net.then(res => { clearTimeout(timer); if (!done) { done = true; resolve(res); } })
        .catch(() => { clearTimeout(timer); fallback().then(r => { if (!r && !done) { done = true; resolve(Response.error()); } }); });
    }));
    e.waitUntil(net.catch(() => {}));
    return;
  }

  // Lo demás (íconos, manifiestos): lo guardado primero, y se refresca en segundo plano.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fromNet(req, CACHE);
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
