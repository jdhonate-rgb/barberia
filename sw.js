// Service worker mínimo: la app siempre pide lo más nuevo a internet.
// Solo guarda una copia de respaldo de la pantalla principal y los íconos.
const V = 'barberia-v3';
const BASE = ['./', 'index.html', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(BASE).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  // Datos (Supabase), fuentes y todo lo externo: directo a internet, sin guardar.
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  // Mismo sitio: primero internet, y si no hay conexión, la copia guardada.
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
