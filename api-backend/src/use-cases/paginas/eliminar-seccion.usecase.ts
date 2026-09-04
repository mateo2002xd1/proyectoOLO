/**
 * Eliminar una sección creada desde el editor.
 *
 * Es la operación inversa de `crear-seccion.usecase.ts` y deshace exactamente lo que
 * aquella creó: la fila de `paginas`, sus versiones, la clave `editar.{ambito}.{slug}`
 * y las concesiones de esa clave. Dos de esas cuatro se van solas —`paginas_versiones`
 * cae en cascada desde `paginas`, y `roles_permisos` desde `permisos`—, así que aquí
 * solo hay que borrar dos filas y la base queda sin restos.
 *
 * ## Lo que NO se borra
 *
 * La bitácora. `auditoria_cambios.entidad_id` guarda el id de la página pero **no tiene
 * clave foránea** contra `paginas`, así que el historial sobrevive al borrado. Es
 * deliberado y es la razón de que se pueda borrar sin miedo: lo que pasó sigue
 * registrado (RF-07, Ley 1581) aunque la página ya no exista. Encima de eso, el borrado
 * añade su propio registro.
 *
 * ## Las tres guardas, y por qué cada una
 *
 * 1. **Nunca una sección de fábrica.** `inicio`, `tasa`, `matriz`, las encuestas y
 *    `menu-y-pie` las pinta código que da por hecho que existen; borrar `inicio` tumba
 *    el portal. Solo se pueden borrar las que alguien creó, que son justamente las que
 *    nadie más da por supuestas.
 *
 * 2. **Nada puede estar enlazando a la ruta.** Si el menú —o cualquier otra página—
 *    apunta ahí, el borrado se rechaza y se dice dónde están los enlaces. Es lo que
 *    convierte «borrar» en una operación que no deja el portal peor de lo que estaba.
 *    Se comprueba contra el contenido **publicado**, que es el que ve la gente.
 *
 * 3. **Hay que escribir el nombre.** El borrado no se deshace. Teclear el título es la
 *    diferencia entre decidirlo y que se te vaya el clic.
 */
import { Op } from 'sequelize';
import sequelize from '../../config/database';
import { Pagina, PaginaVersion, Permission } from '../../infrastructure/db/models';
import { claveDeSeccion, esSeccionDeFabrica } from '../../shared/catalogo-permisos';
import { buscarEnlacesA, type EnlaceEncontrado } from '../../shared/enlaces-en-contenido';
import { invalidarPermisosDeRol } from '../../middlewares/require-permission.middleware';
import type { Ambito } from '../../shared/ambito';

const fallo = (mensaje: string, status: number) =>
  Object.assign(new Error(mensaje), { status });

/** Un sitio del portal que enlaza a la sección. */
export interface ReferenciaAEnlace {
  /** Slug de la página donde está el enlace. */
  slug: string;
  /** Su título, que es como se llama en las pantallas. */
  titulo: string;
  /** El texto visible del enlace, si lo tiene. */
  texto: string | null;
}

/** Lo que hace falta saber para decidir si se borra, y para pintar el diálogo. */
export interface AnalisisDeEliminacion {
  /** El id de la fila. Se lleva desde el análisis porque después de borrar ya no existe
   *  y la bitácora lo necesita como `entidad_id`. */
  id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  /** `false` cuando alguna guarda lo impide; `motivo` dice cuál. */
  puedeEliminarse: boolean;
  motivo: 'de-fabrica' | 'tiene-enlaces' | null;
  /** Cuántas versiones se van a destruir. */
  versiones: number;
  /** Si hay una versión publicada, es decir, si la ruta está viva ahora mismo. */
  publicada: boolean;
  /** Dónde hay que quitar enlaces antes de poder borrar. Vacío si no hay ninguno. */
  referencias: ReferenciaAEnlace[];
}

/**
 * Reúne todo lo que la decisión necesita, sin tocar nada.
 *
 * Lo usa el diálogo antes de pedir confirmación **y** el propio borrado justo antes de
 * ejecutar. Que sea la misma función es lo que evita que la pantalla diga una cosa y el
 * servidor haga otra si el contenido cambió entre que se abrió el diálogo y se confirmó.
 */
export const analizarEliminacion = async (
  slug: string,
  ambito: Ambito
): Promise<AnalisisDeEliminacion> => {
  const pagina = await Pagina.findOne({ where: { slug, ambito } });
  if (!pagina) throw fallo('La sección no existe.', 404);

  const versiones = await PaginaVersion.count({ where: { paginaId: pagina.id } });

  const base = {
    id: pagina.id,
    slug,
    titulo: pagina.titulo,
    ambito,
    versiones,
    publicada: Boolean(pagina.versionPublicadaId),
  };

  if (esSeccionDeFabrica(ambito, slug)) {
    return {
      ...base,
      puedeEliminarse: false,
      motivo: 'de-fabrica' as const,
      referencias: [],
    };
  }

  const referencias = await buscarReferencias(slug, ambito, pagina.id);

  return {
    ...base,
    puedeEliminarse: referencias.length === 0,
    motivo: referencias.length > 0 ? ('tiene-enlaces' as const) : null,
    referencias,
  };
};

/**
 * Dónde enlaza el portal a esta ruta.
 *
 * Mira el contenido **publicado** de las demás páginas del mismo ámbito, incluida
 * `menu-y-pie` —que es donde estarán casi siempre, porque es el menú—. Se excluye la
 * propia página: un enlace de una sección a sí misma no impide nada, se va con ella.
 *
 * Solo el ámbito propio: el menú del sitio y el de la intranet son independientes, y
 * una ruta `/bolsa-de-empleo` de intranet no la rompe un enlace del sitio público, que
 * apunta a otro dominio.
 */
async function buscarReferencias(
  slug: string,
  ambito: Ambito,
  idPropio: string
): Promise<ReferenciaAEnlace[]> {
  const otras = await Pagina.findAll({
    where: { ambito, id: { [Op.ne]: idPropio }, versionPublicadaId: { [Op.ne]: null } },
  });

  const referencias: ReferenciaAEnlace[] = [];

  for (const otra of otras) {
    const version = await PaginaVersion.findByPk(otra.versionPublicadaId as string);
    if (!version) continue;

    const enlaces: EnlaceEncontrado[] = buscarEnlacesA(version.contenido, `/${slug}`);
    for (const enlace of enlaces) {
      referencias.push({ slug: otra.slug, titulo: otra.titulo, texto: enlace.texto });
    }
  }

  return referencias;
}

export interface SeccionEliminada {
  /** El id que tenía la página. La bitácora lo necesita para poder encadenar su historia. */
  id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  versionesEliminadas: number;
  /** La clave de permiso que se retiró, y a cuántos roles se les quitó con ella. */
  clavePermiso: string;
  rolesAfectados: string[];
}

/**
 * Borra la sección. Irreversible.
 *
 * `confirmacion` debe ser el título exacto. Se compara sin distinguir mayúsculas ni
 * espacios de los extremos —quien lo teclea no está haciendo un dictado— pero por lo
 * demás tiene que coincidir: es una decisión, no un trámite.
 */
import { Transaction } from 'sequelize';

export const eliminarSeccion = async (
  slug: string,
  ambito: Ambito,
  confirmacion: string,
  tx?: Transaction
): Promise<SeccionEliminada> => {
  // Se vuelve a analizar aquí, ya con la intención de borrar: entre que el diálogo se
  // pintó y se pulsó el botón alguien pudo publicar un menú que enlaza a esta ruta.
  const analisis = await analizarEliminacion(slug, ambito);

  if (analisis.motivo === 'de-fabrica') {
    throw fallo(
      `«${analisis.titulo}» es una sección del sistema y no se puede eliminar.`,
      409
    );
  }

  if (analisis.motivo === 'tiene-enlaces') {
    const donde = analisis.referencias
      .map((r) => `${r.titulo}${r.texto ? ` → «${r.texto}»` : ''}`)
      .join('; ');
    throw fallo(
      `Todavía hay ${analisis.referencias.length} enlace(s) apuntando a /${slug} (${donde}). ` +
        'Quítalos antes de eliminar la sección.',
      409
    );
  }

  const esperado = analisis.titulo.trim().toLowerCase();
  if ((confirmacion ?? '').trim().toLowerCase() !== esperado) {
    throw fallo(
      `Para confirmar hay que escribir el nombre de la sección: «${analisis.titulo}».`,
      400
    );
  }

  const clavePermiso = claveDeSeccion(ambito, slug);

  const execute = async (transaction: Transaction) => {
    // Se leen ANTES de borrar: después, la cascada de `roles_permisos` ya se los llevó
    // y no habría a quién invalidarle la caché ni qué registrar en la bitácora.
    const [filas] = await sequelize.query(
      `SELECT r.nombre FROM roles_permisos rp
         JOIN roles r ON r.id = rp.rol_id
         JOIN permisos p ON p.id = rp.permiso_id
        WHERE p.clave = :clave`,
      { replacements: { clave: clavePermiso }, transaction }
    );
    const roles = (filas as { nombre: string }[]).map((f) => f.nombre);

    // `paginas_versiones` cae en cascada con la página, y `roles_permisos` con el
    // permiso: por eso aquí solo hay dos borrados y no cuatro.
    await Pagina.destroy({ where: { slug, ambito }, transaction });
    await Permission.destroy({ where: { name: clavePermiso }, transaction });

    return roles;
  };

  const rolesAfectados = tx ? await execute(tx) : await sequelize.transaction(execute);

  // Fuera de la transacción: la caché solo debe olvidar lo confirmado. Si no, un rol
  // seguiría creyendo hasta 30 s que puede editar una sección que ya no existe.
  rolesAfectados.forEach(invalidarPermisosDeRol);

  return {
    id: analisis.id,
    slug,
    titulo: analisis.titulo,
    ambito,
    versionesEliminadas: analisis.versiones,
    clavePermiso,
    rolesAfectados,
  };
};
