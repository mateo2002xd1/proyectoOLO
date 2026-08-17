import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';
import { sanitizarContenidoPuck } from '../../shared/sanitizar-contenido';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const guardarBorrador = async (
  slug: string,
  contenido: any,
  userId: string,
  ambito: Ambito
) => {
  let pagina = await PaginaRepository.findBySlug(slug, ambito);

  if (!pagina) {
    // Sin `ambito` explícito la columna caía en su default ('sitio') y la intranet
    // terminaba creando sus páginas dentro del sitio público.
    pagina = await PaginaRepository.crear({
      slug,
      ambito,
      titulo: slug,
      creadoPor: toUUID(userId),
    });
  }

  const ultimaVersion = await PaginaRepository.findUltimaVersion(pagina.id);
  const numeroVersion = ultimaVersion ? ultimaVersion.numeroVersion + 1 : 1;

  // Sanitizar el contenido antes de persistirlo: elimina scripts, event handlers
  // y URIs peligrosas de todos los campos HTML de los bloques Puck.
  // @see 3-seguridad-del-proyecto.md §S2 — XSS del contenido (CRÍTICO)
  const contenidoSanitizado = sanitizarContenidoPuck(contenido);

  // `creadoPor` se quedaba sin escribir aunque la columna existe y el `userId` ya
  // estaba en la firma: el historial de RF-07 sabía quién revisó y quién publicó cada
  // versión, pero no quién la escribió. Con la edición colaborativa esto no restringe
  // nada —cualquier Editor sigue pudiendo retomar el borrador de otro—; es el dato sin
  // el cual la bitácora no puede responder de quién era el trabajo.
  const version = await PaginaRepository.crearVersion({
    paginaId: pagina.id,
    contenido: contenidoSanitizado,
    numeroVersion,
    estado: 'borrador',
    creadoPor: toUUID(userId),
  });

  return { pagina, version };
};

