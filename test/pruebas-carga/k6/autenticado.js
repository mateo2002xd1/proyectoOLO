/**
 * Escenario 3 — Tráfico autenticado (editores, administradores, directores).
 *
 * Qué mide: el camino que NUNCA se cachea. Cada pantalla del panel y de la intranet
 * dispara varias peticiones a la API, todas con sesión, todas contra Postgres.
 *
 * Por qué es el escenario que más pesa en el dimensionamiento pese a ser el menor
 * volumen: 20 editores trabajando generan más consultas a la base que 2.000 visitantes
 * leyendo páginas cacheadas. Los recursos que se piden para la base y para la API se
 * justifican con este número, no con el del sitio público.
 *
 * Restricción que obliga a la forma de este script: `limitadorDeLogin` permite 10
 * intentos por correo cada 15 minutos, contados POR CORREO y no por IP
 * (api-backend/src/middlewares/rate-limit.middleware.ts:189). Con un login por
 * iteración la prueba se autobloquearía en segundos. Se inicia sesión una vez en
 * `setup()` y todos los VUs comparten la cookie -- que además es lo realista: una
 * persona inicia sesión una vez y navega una hora.
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { API } from './comun.js';

const CORREO = __ENV.AUTH_EMAIL;
const CLAVE = __ENV.AUTH_PASSWORD;

export const options = {
  scenarios: {
    autenticado: {
      executor: 'ramping-vus',
      startVUs: 0,
      // Techos realistas para el personal del OLO. 100 VUs aquí ya es un escenario
      // pesimista: supone todo el equipo editorial y la dirección trabajando a la vez.
      stages: [
        { duration: '30s', target: 10 },
        { duration: '2m', target: 10 },
        { duration: '30s', target: 30 },
        { duration: '2m', target: 30 },
        { duration: '30s', target: 60 },
        { duration: '2m', target: 60 },
        { duration: '30s', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '30s', target: 0 },
      ],
      tags: { escenario: 'autenticado' },
    },
  },
  thresholds: {
    'http_req_duration{escenario:autenticado}': ['p(95)<1500'],
    'http_req_failed{escenario:autenticado}': ['rate<0.01'],
  },
};

export function setup() {
  if (!CORREO || !CLAVE) {
    throw new Error(
      'Faltan AUTH_EMAIL y AUTH_PASSWORD. Pásalos por entorno con los valores de ' +
        'LOCAL_AUTH_EMAIL / LOCAL_AUTH_PASSWORD del .env -- no se escriben en este archivo ' +
        'porque el repositorio es compartido.'
    );
  }

  const res = http.post(
    `${API}/api/auth/login`,
    JSON.stringify({ email: CORREO, password: CLAVE }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (res.status !== 200) {
    throw new Error(`Login falló (${res.status}): ${res.body}`);
  }

  // La sesión viaja en cookie httpOnly. Se extrae para reinyectarla en cada VU: k6 no
  // comparte el frasco de cookies entre usuarios virtuales.
  const cookies = res.cookies;
  const nombre = Object.keys(cookies)[0];
  return { cookie: `${nombre}=${cookies[nombre][0].value}` };
}

export default function (datos) {
  const params = {
    headers: { Cookie: datos.cookie },
    tags: { escenario: 'autenticado' },
  };

  // Una sesión de trabajo real: se comprueba quién soy, se listan contenidos, se abre
  // el listado de páginas. Es la secuencia que dispara cualquier pantalla del panel.
  group('sesion de panel', () => {
    const yo = http.get(`${API}/api/auth/me`, params);
    check(yo, { 'me 200': (r) => r.status === 200 });

    const contenidos = http.get(`${API}/api/contenidos?limite=20`, params);
    check(contenidos, { 'contenidos 200': (r) => r.status === 200 });

    const paginas = http.get(`${API}/api/paginas`, params);
    check(paginas, { 'paginas 200': (r) => r.status === 200 });
  });

  // Pausa corta: quien edita encadena pantallas más rápido que quien lee el portal.
  sleep(2 + Math.random() * 3);
}
