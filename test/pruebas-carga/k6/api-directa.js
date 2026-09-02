/**
 * Escenario 2 — La API por su ruta pública, sin Next delante.
 *
 * Qué mide: cuántas peticiones por segundo sostiene el proceso de Express, y a partir
 * de qué punto se degrada.
 *
 * Hay que leer este número sabiendo QUÉ hay detrás, porque el camino público está
 * cacheado dos veces y eso cambia por completo la conclusión:
 *
 *   navegador -> Next (caché de datos, revalidate 60 s)
 *               -> API `/api/paginas/publica/:slug` (cacheInterceptor 300 s en Redis)
 *                  -> Postgres
 *
 * Con las dos cachés templadas, Postgres ve del orden de UNA consulta cada 5 minutos
 * por página, sin importar si arriba hay 10 o 2.000 visitantes. Medido en frío:
 * 15 ms por respuesta desde Redis.
 *
 * Consecuencia para el dimensionamiento: el tráfico público NO justifica CPU de base
 * de datos. Lo que este escenario acota es el techo de Express + Redis, que es donde
 * el tráfico público sí consume. Para el consumo real de Postgres, ver
 * `autenticado.js` -- ese camino no se cachea nunca.
 *
 * `X-Ambito` es obligatorio en esta ruta (api-backend/src/shared/ambito.ts:44) y además
 * entra en la clave de caché: pedir el mismo slug con ámbito distinto es una entrada
 * distinta.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { API } from './comun.js';

const duracionApi = new Trend('duracion_api', true);

/** Slugs publicados del ámbito `sitio`. Un 404 se resuelve barato y falsearía al alza. */
const SLUGS = (__ENV.SLUGS || 'inicio,monitoreo,menu-y-pie').split(',');

export const options = {
  scenarios: {
    api: {
      // `constant-arrival-rate` y no `ramping-vus`: aquí interesa fijar la TASA de
      // peticiones -- que es la unidad en la que se dimensiona un servidor -- y ver a
      // qué tasa se rompe, no cuántos usuarios virtuales caben. Con VUs, si el servidor
      // se pone lento la carga ofrecida baja sola y el punto de quiebre se difumina.
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 2000,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '1m', target: 300 },
        { duration: '1m', target: 600 },
        { duration: '1m', target: 1000 },
        { duration: '1m', target: 2000 },
        { duration: '30s', target: 0 },
      ],
      tags: { escenario: 'api' },
    },
  },
  thresholds: {
    'http_req_duration{escenario:api}': ['p(95)<1500'],
    'http_req_failed{escenario:api}': ['rate<0.005'],
  },
};

export default function () {
  const slug = SLUGS[Math.floor(Math.random() * SLUGS.length)];

  const res = http.get(`${API}/api/paginas/publica/${slug}`, {
    headers: { 'X-Ambito': 'sitio' },
    tags: { escenario: 'api', slug },
  });

  duracionApi.add(res.timings.duration);
  check(res, {
    'api 200': (r) => r.status === 200,
    'no es 429': (r) => r.status !== 429,
    'no es 5xx': (r) => r.status < 500,
  });
}
