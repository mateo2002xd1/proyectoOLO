/**
 * Cabeceras que identifican al cliente original al llamar a la API desde el servidor.
 *
 * Esto es la mitad que faltaba de los límites de tasa. La API ya sabe leer
 * `X-Forwarded-For` (`app.set('trust proxy', 1)` en `api-backend/src/app.ts`), pero
 * las peticiones que salen de estos route handlers son **nuevas**: las abre el
 * servidor de Next, no el navegador, así que llegaban todas con la IP del contenedor.
 * Cualquier límite por IP se convertía en un cubo único para todos los visitantes del
 * sitio, y bastaban diez intentos de login fallidos para dejar sin entrar a toda la
 * institución durante quince minutos.
 *
 * Reenviando la cabecera tal cual, la API vuelve a ver la dirección que escribió nginx
 * y el límite cuenta por cliente, que era la intención desde el principio.
 *
 * **Se reenvía sin tocarla, a propósito.** nginx la construye con
 * `$proxy_add_x_forwarded_for`, que añade la IP real *al final* de lo que mandara el
 * cliente. Con `trust proxy = 1` Express se queda con la última, así que lo que un
 * visitante haya intentado inyectar queda a la izquierda y se ignora. Añadir aquí
 * nuestra propia entrada correría esa posición y volvería a romper la cuenta.
 *
 * @see 3-seguridad-del-proyecto.md §4.5
 */

/** Cabeceras de la petición entrante que describen al cliente y deben viajar. */
const CABECERAS_DE_CLIENTE = ['x-forwarded-for', 'x-real-ip', 'x-forwarded-proto'];

/**
 * Copia las cabeceras de identificación del cliente sobre las que ya se vayan a enviar.
 *
 * @param request La petición que recibió el route handler.
 * @param base Cabeceras propias de la llamada (`Content-Type`, `Authorization`…).
 */
export function conCabecerasDeCliente(
  request: Request,
  base: Record<string, string> = {}
): Record<string, string> {
  const cabeceras = { ...base };

  for (const nombre of CABECERAS_DE_CLIENTE) {
    const valor = request.headers.get(nombre);
    if (valor) cabeceras[nombre] = valor;
  }

  return cabeceras;
}
