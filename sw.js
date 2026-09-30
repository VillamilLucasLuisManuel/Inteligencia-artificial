/* ==========================================================
   sw.js - Service Worker (funcionamiento sin conexión)
   Sube el número de versión cada vez que cambies contenido
   (v2 -> v3 ...) para que los dispositivos se actualicen.
   ========================================================== */
const CACHE_NAME = 'ia-cbtis260-v2';

// Todo lo que la app necesita para funcionar sin internet
const ASSETS = [
  './',
  './index.html',
  './ramas.html',
  './aplicaciones.html',
  './historia.html',
  './etica.html',
  './glosario.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './imagenes/IA_1.jpg',
  './imagenes/IA_2.png',
  './imagenes/IA_3.jpg',
  './imagenes/IA_4.png',
  './imagenes/LOGO.png',
  './imagenes/aplicaciones_1.jpg',
  './imagenes/etica_1.jpg',
  './imagenes/facebookk.png',
  './imagenes/glosario_1.jpg',
  './imagenes/historia_1.jpg',
  './imagenes/insta.png',
  './imagenes/ramas_1.jpg',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

// INSTALAR: guarda todos los archivos en caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVAR: borra cachés de versiones anteriores y toma el control
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// FETCH: primero caché (rápido y offline); en segundo plano actualiza desde la red
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // YouTube, Facebook, Instagram, etc. se dejan pasar directo a la red
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const red = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const copia = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
          }
          return resp;
        })
        .catch(() => null);

      if (cached) return cached;

      return red.then((resp) => {
        if (resp) return resp;
        // Sin internet y sin ese archivo en caché: si es una página, muestra el inicio
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
