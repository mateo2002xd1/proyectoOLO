/**
 * Configuración compartida por todos los escenarios de carga.
 *
 * Dos decisiones que condicionan todo lo demás y conviene tener presentes al leer
 * cualquier escenario:
 *
 * 1. **Las pruebas van directo a los puertos, no a través de nginx.** La plantilla de
 *    nginx aplica `limit_req zone=api_general rate=20r/s` por IP, y la API aplica
 *    `limitadorGlobal` de 300 peticiones/minuto -- 5 r/s -- también por IP. Un
 *    generador de carga vive en una sola IP: atravesando nginx mediríamos el
 *    limitador, no el servidor. Se prueba contra `docker-compose.yml` (el de
 *    desarrollo), que publica 3000, 3001 y 4000 en localhost.
 *
 * 2. **No se envía `X-Forwarded-For`.** `limitadorGlobal` exime a propósito el tráfico
 *    sin esa cabecera, porque es la señal de que la petición nace dentro de la red
 *    interna (nginx la escribe siempre para lo que viene de internet). Aprovechamos esa
 *    exención: es la única forma de medir el techo real de la API sin desactivar código
 *    de producción para la prueba.
 *
 *    Los limitadores que NO dependen de la IP siguen aplicando -- login (10 intentos
 *    por correo cada 15 min) y escritura por usuario. Por eso `autenticado.js` inicia
 *    sesión una sola vez en `setup()` y comparte la cookie.
 */

/** Sitio público (Next, ISR). */
export const SITIO = __ENV.SITIO_URL || 'http://localhost:3000';
/** Intranet (Next, todo protegido). */
export const INTRANET = __ENV.INTRANET_URL || 'http://localhost:3001';
/** API (Express). La única puerta a los datos. */
export const API = __ENV.API_URL || 'http://localhost:4000';

/**
 * Umbrales de corte. Son el criterio objetivo de "aquí se rompió": el escalón en el
 * que se incumplen es el punto de saturación que se reporta.
 *
 * No los fija ninguna norma -- la Resolución 1519 regula accesibilidad, no latencia.
 * Salen de lo que un portal público necesita para no perder al visitante: por debajo
 * de 1 s la navegación se percibe fluida, por encima de 3 s la gente abandona.
 */
export const UMBRALES = {
  // Páginas públicas: servidas desde la caché de Next, deben ser rápidas.
  publico: {
    'http_req_duration{escenario:publico}': ['p(95)<800'],
    'http_req_failed{escenario:publico}': ['rate<0.005'],
  },
  // API: hay consulta a Postgres de por medio, se admite más.
  api: {
    'http_req_duration{escenario:api}': ['p(95)<1500'],
    'http_req_failed{escenario:api}': ['rate<0.005'],
  },
};

/**
 * Pausa entre peticiones de un mismo usuario virtual.
 *
 * Sin esto un VU de k6 dispara en bucle cerrado y 100 VUs equivalen a miles de
 * usuarios reales: el número de VUs dejaría de significar nada. Con 3-8 s de lectura
 * entre páginas, 1 VU ≈ 1 persona navegando, que es lo que hace falta para traducir el
 * resultado a "cuántos usuarios concurrentes aguanta".
 */
export function pausaDeLectura() {
  return 3 + Math.random() * 5;
}

/**
 * Rutas públicas que se recorren. Se leen del entorno para poder apuntar a los slugs
 * que existan de verdad en la base sembrada -- un 404 se sirve desde memoria y falsea
 * la medición hacia arriba.
 */
export const RUTAS_PUBLICAS = (__ENV.RUTAS || '/inicio,/monitoreo').split(',');
