/* ==========================================================
   script.js - Mejoras sencillas para el sitio de IA
   ========================================================== */
document.addEventListener('DOMContentLoaded', function () {

  // Indica al CSS que JavaScript está activo (para las animaciones)
  document.documentElement.classList.add('js');

  /* 1. MENÚ HAMBURGUESA (celulares) */
  var boton = document.querySelector('.menu-toggle');
  var lista = document.getElementById('lista-menu');
  if (boton && lista) {
    boton.addEventListener('click', function () {
      var abierto = lista.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
  }

  /* 2. RESALTAR LA PÁGINA ACTIVA
     (respaldo por si el servidor no marcó la opción) */
  var actual = window.location.pathname.split('/').pop() || 'index';
  actual = actual.replace(/\.(html|php)$/, '') || 'index';
  document.querySelectorAll('#lista-menu a').forEach(function (enlace) {
    var destino = enlace.getAttribute('href').replace(/\.(html|php)$/, '');
    if (destino === actual) {
      enlace.classList.add('activo');
      enlace.setAttribute('aria-current', 'page');
    }
  });

  /* 3. BOTÓN "VOLVER ARRIBA" */
  var subir = document.createElement('button');
  subir.className = 'subir';
  subir.type = 'button';
  subir.setAttribute('aria-label', 'Volver arriba');
  subir.textContent = '↑';
  document.body.appendChild(subir);

  window.addEventListener('scroll', function () {
    subir.classList.toggle('visible', window.scrollY > 300);
  });
  subir.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* 4. APARICIÓN SUAVE AL HACER SCROLL */
  var secciones = document.querySelectorAll('.seccion');
  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.1 });
    secciones.forEach(function (s) { s.classList.add('aparece'); observador.observe(s); });
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registrado con éxito', reg))
      .catch((err) => console.error('Error al registrar el Service Worker', err));
  });
}


/* ==========================================================
   AVISO DEL VIDEO SIN CONEXIÓN
   El video de YouTube necesita internet. Solo cuando no hay
   conexión se muestra un aviso encima; con conexión no cambia nada.
   ========================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var contenedor = document.querySelector('.video-contenedor');
  if (!contenedor) return;
  var iframe = contenedor.querySelector('iframe');
  var aviso = null;

  function mostrarAviso() {
    if (aviso) return;
    aviso = document.createElement('div');
    aviso.setAttribute('role', 'status');
    aviso.textContent = 'Sin conexión: conéctate a internet para ver el video.';
    aviso.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;' +
      'justify-content:center;text-align:center;padding:16px;background:#f2f2f2;' +
      'color:#333;font-size:1rem;';
    contenedor.style.position = 'relative';
    contenedor.appendChild(aviso);
  }
  function quitarAviso() {
    if (!aviso) return;
    aviso.remove();
    aviso = null;
    if (iframe) { iframe.src = iframe.src; } // recarga el video al volver el internet
  }

  if (!navigator.onLine) mostrarAviso();
  window.addEventListener('offline', mostrarAviso);
  window.addEventListener('online', quitarAviso);
});
