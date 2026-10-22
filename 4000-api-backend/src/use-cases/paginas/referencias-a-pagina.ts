/**
 * Dónde enlaza el portal a una página.
 *
 * Lo comparten las dos operaciones que cambian lo que significa una ruta: **eliminar** una
 * página (si algo la enlaza, no se puede borrar) y **cambiarle la dirección** (lo que la
 * enlaza hay que reescribirlo). Que la búsqueda sea una sola evita que cada una entienda
 * «enlazar» a su manera: lo que el diálogo de una enseña es lo que la otra comprueba.
 *
 * Mira el contenido de las versiones del mismo ámbito —el menú del sitio y el de la
 * intranet son independientes—, incluida `menu-y-pie`, que es donde casi siempre están. Qué
 * versiones cuentan lo decide quien llama (`estados`): para borrar basta con lo
 * **publicado**, que es lo que ve la gente; para cambiar la dirección cuentan también los
 * borradores, lo que espera aprobación, lo rechazado (que el editor vuelve a abrir) y lo
 * archivado (que restaurar vuelve a publicar), porque si no, el enlace viejo reaparecería.
 *
 * ## Dos cosas que importan a quien reescribe
 *
 * - **Prefiltro en SQL.** Con el historial incluido hay muchas versiones por página; cargar
 *   todos los contenidos para mirarlos en memoria no escala. La base descarta primero las
 *   que no mencionan ni la última pieza del slug, y el recorrido exacto (el de
 *   `buscarEnlacesA`) decide después. El prefiltro es un superconjunto: nunca esconde un
 *   enlace, solo ahorra leer los que no pueden serlo.
 * - **`bloquear`.** Quien va a reescribir tiene que hacerlo sobre el contenido que hay *ahora*,
 *   no sobre una foto vieja: un guardado entre la lectura y la escritura se perdería
 *   (y con él volvería el enlace viejo). Con `bloquear` y una transacción, las versiones que
 *   enlazan se vuelven a leer con `FOR UPDATE`, y el análisis se rehace sobre esa lectura.
 */
import { Op, cast, col, where as condicion, type Transaction } from 'sequelize';
import { Pagina, PaginaVersion } from '../../infrastructure/db/models';
import { buscarEnlacesA } from '../../shared/enlaces-en-contenido';
import { rutaLlevaAPagina } from '../../shared/extraer-textos-puck';
import type { Ambito } from '../../shared/ambito';

/** Los estados de una versión que todavía pueden acabar a la vista de alguien. */
export type EstadoVigente = 'publicado' | 'en_revision' | 'borrador';

/** Cualquier estado de una versión: los vigentes y la historia que todavía se puede reabrir. */
export type EstadoDeVersion = EstadoVigente | 'rechazado' | 'archivado';

/** Un sitio del portal que enlaza a la página. */
export interface ReferenciaAEnlace {
  /** Slug de la página donde está el enlace. */
  slug: string;
  /** Su título, que es como se llama en las pantallas. */
  titulo: string;
  /** El texto visible del enlace, si lo tiene. */
  texto: string | null;
  /** El tipo del bloque que lo tiene (`Footer`, `Header`…); el diálogo lo traduce a su etiqueta. */
  bloque: string | null;
  /** La prop de ese bloque donde está (`enlacesFila3`, `navLinks`…). */
  campo: string | null;
  /** De qué versión es: lo publicado, un borrador o lo que espera aprobación. */
  estado: EstadoDeVersion;
}

/** Una versión que lleva al menos un enlace a la página buscada. */
export interface VersionQueEnlaza {
  paginaId: string;
  /** Slug y título de la página a la que pertenece la versión. */
  paginaSlug: string;
  paginaTitulo: string;
  versionId: string;
  estado: EstadoDeVersion;
  contenido: unknown;
  referencias: ReferenciaAEnlace[];
}

interface Opciones {
  /** Páginas que no cuentan (la propia, al borrar: un enlace a sí misma se va con ella). */
  excluirPaginaId?: string;
  /** Versiones que se miran. Por defecto solo la publicada. */
  estados?: EstadoDeVersion[];
  /** Transacción en la que leer: sin ella la lectura es una foto suelta. */
  transaction?: Transaction;
  /** Bloquear las versiones encontradas hasta que cierre la transacción (requiere `transaction`). */
  bloquear?: boolean;
}

/**
 * Condición SQL que descarta las versiones que no pueden enlazar a `slug`.
 *
 * Una ruta lleva a la página por su último tramo o por todos los tramos unidos con guion
 * (`rutaLlevaAPagina`), y en los dos casos el texto del enlace acaba con la última pieza del
 * slug: buscar esa pieza (sin distinguir mayúsculas) deja pasar todo lo que puede enlazar.
 */
const mencionaElSlug = (slug: string) => {
  const ultimaPieza = slug.split('-').filter(Boolean).pop() ?? slug;
  const escapada = ultimaPieza.replace(/[\\%_]/g, '\\$&');
  return condicion(cast(col('contenido'), 'text'), Op.iLike, `%${escapada}%`);
};

/** Las versiones de las páginas del ámbito que enlazan a `slug`, con dónde. */
export async function versionesQueEnlazan(
  slug: string,
  ambito: Ambito,
  { excluirPaginaId, estados = ['publicado'], transaction, bloquear = false }: Opciones = {}
): Promise<VersionQueEnlaza[]> {
  const paginas = await Pagina.findAll({
    where: { ambito, ...(excluirPaginaId ? { id: { [Op.ne]: excluirPaginaId } } : {}) },
    order: [['slug', 'ASC']],
    transaction,
  });
  if (paginas.length === 0) return [];
  const porId = new Map(paginas.map((pagina) => [pagina.id, pagina]));

  // Una página puede enlazarse por su ruta de verdad, por `/{slug}` (que redirige ahí) o,
  // en el sitio, por la forma de dos tramos de antes de que el menú definiera las rutas.
  // Todas cuentan como enlace vivo: `rutaLlevaAPagina` las reconoce.
  const llevaAqui = (ruta: string) => rutaLlevaAPagina(ruta, slug, ambito);

  const analizar = (versiones: PaginaVersion[]): VersionQueEnlaza[] => {
    const encontradas: VersionQueEnlaza[] = [];
    for (const version of versiones) {
      const pagina = porId.get(version.paginaId);
      if (!pagina) continue;
      // De lo publicado cuenta solo la versión vigente: las anteriores quedan archivadas,
      // pero por si alguna conservara el estado, la que ve la gente es `versionPublicadaId`.
      if (version.estado === 'publicado' && version.id !== pagina.versionPublicadaId) continue;

      const estado = version.estado as EstadoDeVersion;
      const referencias = buscarEnlacesA(version.contenido, llevaAqui).map((enlace) => ({
        slug: pagina.slug,
        titulo: pagina.titulo,
        texto: enlace.texto,
        bloque: enlace.bloque,
        campo: enlace.campo,
        estado,
      }));
      if (referencias.length === 0) continue;

      encontradas.push({
        paginaId: pagina.id,
        paginaSlug: pagina.slug,
        paginaTitulo: pagina.titulo,
        versionId: version.id,
        estado,
        contenido: version.contenido,
        referencias,
      });
    }
    return encontradas;
  };

  const candidatas = await PaginaVersion.findAll({
    where: {
      [Op.and]: [
        { paginaId: { [Op.in]: [...porId.keys()] }, estado: { [Op.in]: estados } },
        mencionaElSlug(slug),
      ],
    },
    order: [['numeroVersion', 'DESC']],
    transaction,
  });

  const encontradas = analizar(candidatas);
  if (!bloquear || !transaction || encontradas.length === 0) return encontradas;

  // Se bloquean solo las que de verdad enlazan, no todo lo que pasó el prefiltro, y se
  // vuelven a leer: entre la primera lectura y el bloqueo pudo entrar un guardado.
  const frescas = await PaginaVersion.findAll({
    where: { id: { [Op.in]: encontradas.map((version) => version.versionId) } },
    order: [['numeroVersion', 'DESC']],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  return analizar(frescas);
}

/** Los enlaces a `slug`, sin agrupar por versión: lo que enseña un diálogo. */
export async function buscarReferencias(
  slug: string,
  ambito: Ambito,
  opciones: Opciones = {}
): Promise<ReferenciaAEnlace[]> {
  return (await versionesQueEnlazan(slug, ambito, opciones)).flatMap((v) => v.referencias);
}
