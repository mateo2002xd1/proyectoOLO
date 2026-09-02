/**
 * Prueba de humo. No dimensiona nada: solo confirma que los tres servicios responden
 * y que los escenarios apuntan a rutas que existen, antes de gastar 20 minutos en una
 * corrida larga contra una URL equivocada.
 */
import http from 'k6/http';
import { check } from 'k6';
import { SITIO, API, RUTAS_PUBLICAS } from './comun.js';

export const options = { vus: 5, duration: '20s' };

export default function () {
  const html = http.get(`${SITIO}${RUTAS_PUBLICAS[0]}`, { tags: { escenario: 'publico' } });
  check(html, { 'sitio 200': (r) => r.status === 200 });

  const api = http.get(`${API}/api/paginas/publica/inicio`, {
    headers: { 'X-Ambito': 'sitio' },
    tags: { escenario: 'api' },
  });
  check(api, { 'api 200': (r) => r.status === 200 });
}
