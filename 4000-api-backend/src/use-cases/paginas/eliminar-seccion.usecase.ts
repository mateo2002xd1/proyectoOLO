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
 * ## Las dos guardas, y por qué cada una
 *
 * 1. **Nada puede estar enlazando a la ruta.** Si el menú —o cualquier otra página—
 *    apunta ahí, el borrado se rechaza y se dice dónde están los enlaces. Es lo que
 *    convierte «borrar» en una operación que no deja el portal peor de lo que estaba.
 *    Se comprueba contra el contenido **publicado**, que es el que ve la gente.
 *
 * 2. **Hay que escribir el nombre.** El borrado no se deshace. Teclear el título es la
 *    diferencia entre decidirlo y que se te vaya el clic.
 *
 * ## Ya no hay guarda de «sección de fábrica»
 *
 * Hasta el 2026-09-04 esto rechazaba borrar `inicio`, `tasa`, `matriz`, las encuestas y
 * `menu-y-pie` porque código en otros puntos da por hecho que existen. Se quitó a pedido
 * explícito: quien borre una de estas páginas se queda sin ella, con lo que eso implica
 * en cada caso —`inicio` y `menu-y-pie` caen al *fallback* de código
 * (`homeFallbackData` / la identidad visual sola, ver `obtenerPaginaInicio` y
 * `obtenerPlantilla`) en vez de romper el portal, pero las demás páginas de fábrica no
 * tienen ese colchón y su ruta simplemente deja de servir contenido hasta que alguien la
 * vuelva a crear.
 */
import sequelize from '../../config/database';
import { Pagina, PaginaVersion, Permission } from '../../infrastructure/db/models';
import { claveDeSeccion } from '../../shared/catalogo-permisos';
import { buscarReferencias, type ReferenciaAEnlace } from './referencias-a-pagina';
import { invalidarPermisosDeRol } from '../../middlewares/require-permission.middleware';
import { borrarClavesPorPatron } from '../../infrastructure/redis';
import type { Ambito } from '../../shared/ambito';
import { eliminarDirectorioBackupCompleto } from '../../infrastructure/storage/backup-uploads.service';
import { extraerRutasUploads } from '../../shared/rutas-uploads-en-contenido';
import { borrarArchivosHuerfanos } from './borrar-archivos-huerfanos.usecase';

/** Un `Error` con el `status` HTTP que traduce `error.middleware.ts`. */
const fallo = (mensaje: string, status: number) =>
  Object.assign(new Error(mensaje), { status });


/** Lo que hace falta saber para decidir si se borra, y para pintar el diálogo. */
export type { ReferenciaAEnlace };

export interface AnalisisDeEliminacion {
  /** El id de la fila. Se lleva desde el análisis porque después de borrar ya no existe
   *  y la bitácora lo necesita como `entidad_id`. */
  id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  /** `false` cuando alguna guarda lo impide; `motivo` dice cuál. */
  puedeEliminarse: boolean;
  motivo: 'tiene-enlaces' | null;
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
  if (!pagina) throw fallo('La página no existe.', 404);

  const versiones = await PaginaVersion.count({ where: { paginaId: pagina.id } });

  const base = {
    id: pagina.id,
    slug,
    titulo: pagina.titulo,
    ambito,
    versiones,
    publicada: Boolean(pagina.versionPublicadaId),
  };

  // Solo lo publicado, que es lo que ve la gente, y sin la propia página: un enlace de una
  // sección a sí misma no impide nada, se va con ella.
  const referencias = await buscarReferencias(slug, ambito, { excluirPaginaId: pagina.id });

  return {
    ...base,
    puedeEliminarse: referencias.length === 0,
    motivo: referencias.length > 0 ? ('tiene-enlaces' as const) : null,
    referencias,
  };
};

/**
 * Quita del disco lo que dejó una sección ya eliminada: su carpeta de backup y, de sus
 * archivos, los que ninguna otra página usa (`borrarArchivosHuerfanos`).
 *
 * Corre en el `afterCommit` de la baja. Primero comprueba contra la base que la página ya
 * no existe, porque Sequelize 6 ejecuta esos ganchos en un `finally` —también cuando el
 * COMMIT falla—, y lo que se borra aquí no se recupera. Nunca lanza: un error en el
 * gancho haría fallar la petición de una baja que sí se confirmó.
 */
async function limpiarArchivosDeSeccionEliminada(paginaId: string, ambito: Ambito, rutas: string[]) {
  try {
    if ((await Pagina.count({ where: { id: paginaId } })) > 0) return;
    eliminarDirectorioBackupCompleto(paginaId, ambito);
    await borrarArchivosHuerfanos(rutas, ambito);
  } catch (error) {
    console.error(`[paginas] No se pudieron limpiar los archivos de la página ${paginaId}:`, error);
  }
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

/**
 * Borra una sección con todas sus versiones y retira su permiso de edición de los roles.
 * Vuelve a comprobar que nada la enlace y exige escribir su nombre como confirmación.
 * @throws {Error} 409 si algún menú o página la enlaza; 400 si la confirmación no coincide.
 */
export const eliminarSeccion = async (
  slug: string,
  ambito: Ambito,
  confirmacion: string,
  tx?: Transaction
): Promise<SeccionEliminada> => {
  // Se vuelve a analizar aquí, ya con la intención de borrar: entre que el diálogo se
  // pintó y se pulsó el botón alguien pudo publicar un menú que enlaza a esta ruta.
  const analisis = await analizarEliminacion(slug, ambito);

  if (analisis.motivo === 'tiene-enlaces') {
    const donde = analisis.referencias
      .map((r) => `${r.titulo}${r.texto ? ` → «${r.texto}»` : ''}`)
      .join('; ');
    throw fallo(
      `Todavía hay ${analisis.referencias.length} enlace(s) apuntando a /${slug} (${donde}). ` +
        'Quítalos antes de eliminar la página.',
      409
    );
  }

  const esperado = analisis.titulo.trim().toLowerCase();
  if ((confirmacion ?? '').trim().toLowerCase() !== esperado) {
    throw fallo(
      `Para confirmar hay que escribir el nombre de la página: «${analisis.titulo}».`,
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

    // Los archivos se leen aquí, mientras las versiones existen, pero se borran solo
    // cuando la baja quede confirmada: quien llama suele seguir escribiendo en esta
    // transacción (la bitácora), y si algo falla la página vuelve y sus archivos tienen
    // que seguir ahí.
    const versiones = await PaginaVersion.findAll({ where: { paginaId: analisis.id }, transaction });
    const rutasUploads = versiones.flatMap((v) => extraerRutasUploads(v.contenido));
    transaction.afterCommit(() => limpiarArchivosDeSeccionEliminada(analisis.id, ambito, rutasUploads));

    await Pagina.destroy({ where: { slug, ambito }, transaction });
    const permiso = await Permission.findOne({ where: { name: clavePermiso }, transaction });
    if (permiso) {
      const { RolePermission } = require('../../infrastructure/db/models');
      await RolePermission.destroy({ where: { permission_id: permiso.id }, transaction });
      await permiso.destroy({ transaction });
    }

    return roles;
  };

  const rolesAfectados = tx ? await execute(tx) : await sequelize.transaction(execute);

  // Fuera de la transacción: la caché solo debe olvidar lo confirmado. Si no, un rol
  // seguiría creyendo hasta 30 s que puede editar una sección que ya no existe.
  rolesAfectados.forEach(invalidarPermisosDeRol);
  void Promise.all([
    borrarClavesPorPatron(`cache:/api/paginas/publica/${slug}|*`),
    borrarClavesPorPatron('cache:/api/paginas/indice-busqueda|*'),
  ]).catch(() => {});

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
