import { Transaction } from 'sequelize';
import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';
import { sanitizarContenidoPuck } from '../../shared/sanitizar-contenido';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const guardarBorrador = async (
  slug: string,
  contenido: any,
  userId: string,
  ambito: Ambito,
  tx?: Transaction
) => {
  let pagina = await PaginaRepository.findBySlug(slug, ambito, tx);
  const paginaAnterior = pagina ? pagina.toJSON() : null;

  if (!pagina) {
    // Sin `ambito` explícito la columna caía en su default ('sitio') y la intranet
    // terminaba creando sus páginas dentro del sitio público.
    pagina = await PaginaRepository.crear({
      slug,
      ambito,
      titulo: slug,
      creadoPor: toUUID(userId),
    }, tx);
  }

  const ultimaVersion = await PaginaRepository.findUltimaVersion(pagina.id, tx);
  const versionAnterior = ultimaVersion ? ultimaVersion.toJSON() : null;
  
  // Sanitizar el contenido antes de persistirlo: elimina scripts, event handlers
  // y URIs peligrosas de todos los campos HTML de los bloques Puck.
  // @see 3-seguridad-del-proyecto.md §S2 — XSS del contenido (CRÍTICO)
  const contenidoSanitizado = sanitizarContenidoPuck(contenido);

  let version;

  // Si la última versión ya existe y no está publicada, se actualiza en lugar de crear
  // una nueva (para no llenar la base de datos de versiones por cada vez que se guarda
  // en el editor).
  if (ultimaVersion && ultimaVersion.estado !== 'publicado' && ultimaVersion.estado !== 'archivado') {
    version = await PaginaRepository.actualizarVersion(
      ultimaVersion,
      {
        contenido: contenidoSanitizado,
        estado: 'borrador',
        creadoPor: toUUID(userId),
      },
      tx
    );
  } else {
    // Si no había versiones, o si la última ya está publicada/archivada,
    // se arranca una versión nueva para este borrador.
    const numeroVersion = ultimaVersion ? ultimaVersion.numeroVersion + 1 : 1;
    version = await PaginaRepository.crearVersion(
      {
        paginaId: pagina.id,
        contenido: contenidoSanitizado,
        numeroVersion,
        estado: 'borrador',
        creadoPor: toUUID(userId),
      },
      tx
    );
  }

  return { pagina, version, paginaAnterior, versionAnterior };
};

