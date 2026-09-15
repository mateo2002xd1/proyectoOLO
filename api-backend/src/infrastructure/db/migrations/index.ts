import { QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../../../config/database';

import * as esquemaBase from './001-esquema-base';
import * as tablasNuevas from './002-tablas-nuevas';
import * as restricciones from './003-restricciones-e-indices';
import * as contenidos from './004-contenidos-secciones-archivos';
import * as identidad from './005-identidad';
import * as auditoria from './006-auditoria-unificada';
import * as paginasAmbito from './007-paginas-ambito';
import * as paginasSlugUnicoPorAmbito from './008-paginas-slug-unico-por-ambito';
import * as limpiarRestriccionesDuplicadas from './009-limpiar-restricciones-duplicadas';
import * as agregarApellidosUsuarios from './010-agregar-apellidos-usuarios';
import * as politicaPasswords from './011-politica-passwords';
import * as catalogoPermisos from './012-catalogo-permisos';
import * as eliminarUsuariosSitio from './013-eliminar-usuarios-sitio';
import * as renombrarSlugMenuYPie from './014-renombrar-slug-menu-y-pie';
import * as inicioTextoEnriquecido from './015-inicio-texto-enriquecido';
import * as permisoCrearSecciones from './016-permiso-crear-secciones';
import * as tituloMenuYPie from './017-titulo-menu-y-pie';
import * as revertirTitulosIntranet from './018-revertir-titulos-intranet';
import * as permisoEliminarSecciones from './019-permiso-eliminar-secciones';
import * as depuracionYOptimizacionEsquema from './020-depuracion-y-optimizacion-esquema';
import * as bloqueosEdicion from './021-bloqueos-edicion';
import * as auditoriaGuardarBorrador from './022-auditoria-guardar-borrador';
import * as permisoPoliticaPrivacidadSitio from './023-permiso-politica-privacidad-sitio';
import * as subidasPendientes from './024-subidas-pendientes';
import * as visitasPaginas from './025-visitas-paginas';

export interface Migracion {
  nombre: string;
  up: (queryInterface: QueryInterface) => Promise<void>;
  down: (queryInterface: QueryInterface) => Promise<void>;
}

// El orden es explícito a propósito: el runner NO lee el directorio.
// Un archivo suelto en la carpeta no se aplica solo — entra en esta lista
// o no existe para la base de datos.
const migraciones: Migracion[] = [
  esquemaBase,
  tablasNuevas,
  restricciones,
  contenidos,
  identidad,
  auditoria,
  paginasAmbito,
  paginasSlugUnicoPorAmbito,
  limpiarRestriccionesDuplicadas,
  agregarApellidosUsuarios,
  politicaPasswords,
  catalogoPermisos,
  eliminarUsuariosSitio,
  renombrarSlugMenuYPie,
  inicioTextoEnriquecido,
  permisoCrearSecciones,
  tituloMenuYPie,
  revertirTitulosIntranet,
  permisoEliminarSecciones,
  depuracionYOptimizacionEsquema,
  bloqueosEdicion,
  auditoriaGuardarBorrador,
  permisoPoliticaPrivacidadSitio,
  subidasPendientes,
  visitasPaginas,
];

const TABLA_CONTROL = 'migraciones_aplicadas';

const asegurarTablaControl = async (): Promise<void> => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ${TABLA_CONTROL} (
      nombre      TEXT PRIMARY KEY,
      aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

// Según la conexión, este driver devuelve las filas como objeto o como array
// posicional. Si se lee de una sola forma, la lista de aplicadas sale vacía y el
// runner reintenta migraciones que ya corrieron.
const obtenerAplicadas = async (): Promise<Set<string>> => {
  const filas = await sequelize.query(`SELECT nombre FROM ${TABLA_CONTROL}`, {
    type: QueryTypes.SELECT,
    logging: false,
  });

  return new Set(
    filas.map((fila) => {
      const [nombre] = Array.isArray(fila)
        ? fila
        : Object.values(fila as Record<string, unknown>);
      return String(nombre);
    })
  );
};

export const listarPendientes = async (): Promise<string[]> => {
  await asegurarTablaControl();
  const aplicadas = await obtenerAplicadas();
  return migraciones.filter((m) => !aplicadas.has(m.nombre)).map((m) => m.nombre);
};

/**
 * Aplica en orden las migraciones que aún no se han ejecutado.
 * Cada una corre dentro de su propia transacción: si falla, no deja la base a
 * medias y no se marca como aplicada.
 */
export const aplicarPendientes = async (): Promise<string[]> => {
  await asegurarTablaControl();
  const aplicadas = await obtenerAplicadas();
  const ejecutadas: string[] = [];

  for (const migracion of migraciones) {
    if (aplicadas.has(migracion.nombre)) continue;

    const transaccion = await sequelize.transaction();
    try {
      await migracion.up(sequelize.getQueryInterface());
      await sequelize.query(`INSERT INTO ${TABLA_CONTROL} (nombre) VALUES (:nombre)`, {
        replacements: { nombre: migracion.nombre },
        transaction: transaccion,
      });
      await transaccion.commit();
      ejecutadas.push(migracion.nombre);
      console.log(`[migraciones] aplicada: ${migracion.nombre}`);
    } catch (error) {
      await transaccion.rollback();
      throw new Error(
        `[migraciones] falló ${migracion.nombre}: ${(error as Error).message}. ` +
        'La base quedó en el estado previo a esta migración.'
      );
    }
  }

  return ejecutadas;
};

/** Revierte la última migración aplicada. Solo para desarrollo. */
export const revertirUltima = async (): Promise<string | null> => {
  await asegurarTablaControl();
  const aplicadas = await obtenerAplicadas();
  const ultima = [...migraciones].reverse().find((m) => aplicadas.has(m.nombre));
  if (!ultima) return null;

  const transaccion = await sequelize.transaction();
  try {
    await ultima.down(sequelize.getQueryInterface());
    await sequelize.query(`DELETE FROM ${TABLA_CONTROL} WHERE nombre = :nombre`, {
      replacements: { nombre: ultima.nombre },
      transaction: transaccion,
    });
    await transaccion.commit();
    return ultima.nombre;
  } catch (error) {
    await transaccion.rollback();
    throw error;
  }
};
