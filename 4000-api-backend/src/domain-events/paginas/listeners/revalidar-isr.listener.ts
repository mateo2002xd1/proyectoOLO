// Listener - Revalidar ISR

import { config } from '../../../config';
import type { ContenidoPublicadoEvent } from '../contenido-publicado.event';

/**
 * Tope de espera de la llamada al front.
 *
 * Corto a propósito: esto ocurre dentro de la petición de aprobar, y un front lento no
 * puede convertir un «aprobado» en un tiempo de espera agotado. Si no llega a tiempo, la
 * caché caduca sola por TTL — tarde, pero no roto.
 */
const TIMEOUT_MS = 3000;

/** Para no repetir el mismo aviso de configuración en cada publicación. */
let yaAvisadoDelSecreto = false;

/**
 * Le dice al frontal que tire su copia de la página recién publicada.
 *
 * El frontal expone `POST /api/revalidar`, que traduce el slug a su etiqueta de caché y
 * llama a `revalidateTag`. La etiqueta se construye **allí** y no aquí a propósito: si
 * viajara por la red, el formato quedaría duplicado en dos repositorios que se
 * desincronizarían en cuanto uno de los dos lo cambiara. Lo que se manda es el dato
 * (`slug`), no la convención.
 *
 * Un ámbito sin URL configurada simplemente no se llama; ver `config.revalidacion`.
 *
 * La llamada no sale del host: va por la red privada de Docker (`olo-network`), de
 * `api-backend:4000` a `sitio-web:3000`, sin pasar por nginx ni por internet. Nginx solo
 * publica 80/443 y manda todo lo que empieza por `/api/` al backend —el prefijo más
 * largo gana sobre `/`—, así que esta ruta del sitio no es alcanzable desde fuera ni
 * aunque alguien adivine el secreto. Ver `nginx/nginx.conf` y `7-despliegue.md`.
 *
 * LÍMITE CONOCIDO — una sola réplica. `sitio-web` resuelve por DNS de Docker a UNA
 * instancia, así que con varias réplicas solo se enteraría la que atienda esta llamada y
 * las demás seguirían sirviendo lo viejo hasta que caducara su TTL. Hoy no aplica:
 * `docker-compose.servidor.yml` levanta una de cada servicio en un único host. El día que se
 * escale horizontalmente, la solución no es llamarlas a todas —no se sabe cuántas hay—
 * sino darle a Next un `cacheHandler` sobre Redis para que la caché sea común a todas.
 */
export const revalidarISRListener = async (evento: ContenidoPublicadoEvent): Promise<void> => {
  const base = config.revalidacion.urlPorAmbito[evento.ambito];
  if (!base) return;

  const { secreto } = config.revalidacion;
  if (!secreto) {
    if (!yaAvisadoDelSecreto) {
      console.warn(
        '[revalidar-isr] REVALIDAR_SECRET no está definida: el front seguirá sirviendo ' +
          'la página anterior hasta que caduque su caché. Defínela en la API y en el front ' +
          'con el mismo valor.'
      );
      yaAvisadoDelSecreto = true;
    }
    return;
  }

  const respuesta = await fetch(`${base}/api/revalidar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidar-secreto': secreto,
    },
    body: JSON.stringify({ slug: evento.slug }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  // Se lanza para que `emitirContenidoPublicado` lo registre con su contexto. No sube
  // más arriba: ese emisor no deja que un fallo de caché tumbe la publicación.
  if (!respuesta.ok) {
    throw new Error(
      `revalidación de /${evento.slug} (${evento.ambito}) rechazada por el front: ` +
        `${respuesta.status} ${respuesta.statusText}`
    );
  }
};
