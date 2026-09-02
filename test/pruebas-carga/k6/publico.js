/**
 * Escenario 1 — Navegación del sitio público.
 *
 * Qué mide: cuántos visitantes concurrentes sostiene UN proceso de Next sirviendo
 * páginas desde su caché.
 *
 * Por qué importa para el dimensionamiento: este es el 85% del tráfico de un portal
 * público, y es el tramo BARATO. El sitio lee sus páginas con
 * `fetch(..., { next: { revalidate: 60, tags: [...] } })`
 * (sitio-web/src/features/paginas/services/paginas.service.ts:60), así que a 300 r/s
 * sobre la misma página la API recibe ~1 petición por minuto, no 300 por segundo. Si
 * este escenario escala barato, el dimensionamiento lo domina la CPU de Next
 * renderizando HTML, no Postgres.
 *
 * Ojo con el sesgo: la primera petición tras cada ventana de 60 s paga el viaje a la
 * API. Por eso la prueba dura bastante más que 60 s -- una corrida corta mediría solo
 * aciertos de caché y saldría irrealmente buena.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { SITIO, RUTAS_PUBLICAS, pausaDeLectura } from './comun.js';

const duracionHtml = new Trend('duracion_html', true);

export const options = {
  scenarios: {
    publico: {
      executor: 'ramping-vus',
      startVUs: 0,
      // Escalones sostenidos. Cada meseta dura 2 min: lo suficiente para cruzar al
      // menos dos ventanas de revalidación de 60 s y para que `docker stats` recoja
      // una muestra estable de RSS en ese nivel.
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 150 },
        { duration: '2m', target: 150 },
        { duration: '1m', target: 300 },
        { duration: '2m', target: 300 },
        { duration: '1m', target: 600 },
        { duration: '2m', target: 600 },
        { duration: '1m', target: 1000 },
        { duration: '3m', target: 1000 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { escenario: 'publico' },
    },
  },
  thresholds: {
    'http_req_duration{escenario:publico}': ['p(95)<800'],
    'http_req_failed{escenario:publico}': ['rate<0.005'],
  },
  // Sin esto k6 aborta la corrida al primer umbral incumplido y perderíamos justo lo
  // que buscamos: ver CUÁNTO más aguanta después del punto de quiebre.
  noConnectionReuse: false,
};

export default function () {
  const ruta = RUTAS_PUBLICAS[Math.floor(Math.random() * RUTAS_PUBLICAS.length)];
  const res = http.get(`${SITIO}${ruta}`, {
    tags: { escenario: 'publico', ruta },
    // Un navegador real no re-descarga el JS y el CSS en cada vista. Pedir solo el
    // documento es lo que representa la carga de servidor por página vista.
    headers: { Accept: 'text/html' },
  });

  duracionHtml.add(res.timings.duration);
  check(res, {
    'html 200': (r) => r.status === 200,
    'trae contenido': (r) => r.body && r.body.length > 500,
  });

  sleep(pausaDeLectura());
}
