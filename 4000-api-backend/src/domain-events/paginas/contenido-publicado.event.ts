// Domain Event - Contenido Publicado

import type { Ambito } from '../../shared/ambito';
import { describirErrorParaLog } from '../../shared/errores';
import { invalidarCacheListener } from './listeners/invalidar-cache.listener';
import { revalidarISRListener } from './listeners/revalidar-isr.listener';

/**
 * Una versión acaba de convertirse en la versión publicada de su página.
 *
 * Los identificadores son UUID en texto, no números: `paginas.id`, `paginas_versiones.id`
 * y `users.id` son todos `DataTypes.UUID`. El stub original los declaraba `number`, que
 * era lo único que decía de este evento y además era falso.
 *
 * `ambito` es obligatorio y no se puede deducir del slug: el sitio y la intranet
 * comparten la tabla `paginas` y ambos tienen su `/inicio`.
 */
export interface ContenidoPublicadoEvent {
  paginaId: string;
  slug: string;
  ambito: Ambito;
  versionId: string;
  publicadoPor: string | null;
  fecha: Date;
}

/**
 * Avisa a quien tenga una copia del contenido viejo de que ya no vale.
 *
 * Se **espera** a que terminen los oyentes en vez de dispararlos y seguir. La razón es
 * el caso de uso que motiva todo esto: quien aprueba recarga la página inmediatamente
 * para comprobar lo que acaba de hacer, y si la respuesta llega antes que la
 * invalidación se encuentra el contenido antiguo y da la publicación por rota. Los
 * oyentes son un DEL sobre Redis y una llamada HTTP con 3 s de tope, así que lo que se
 * añade a la respuesta es despreciable comparado con eso.
 *
 * Y nunca lanza: un fallo aquí significa «la caché tardará lo que diga su TTL», no
 * «la publicación no se hizo». La publicación ya está confirmada en la base de datos
 * cuando esto se ejecuta, así que tumbar la petición mentiría sobre lo que pasó.
 */
export const emitirContenidoPublicado = async (
  evento: ContenidoPublicadoEvent
): Promise<void> => {
  const resultados = await Promise.allSettled([
    invalidarCacheListener(evento),
    revalidarISRListener(evento),
  ]);

  for (const resultado of resultados) {
    if (resultado.status === 'rejected') {
      console.error('[contenido-publicado] un oyente falló:', describirErrorParaLog(resultado.reason));
    }
  }
};
