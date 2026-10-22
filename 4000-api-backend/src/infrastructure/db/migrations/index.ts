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
import * as observatorioProgramasSobresalientes from './026-observatorio-programas-sobresalientes';
import * as cargasDatos from './027-cargas-datos';
import * as cargasDatosProgreso from './028-cargas-datos-progreso';
import * as comentarioCambiosVersiones from './029-comentario-cambios-versiones';
import * as accionesSeguridadAuditoria from './030-acciones-seguridad-auditoria';
import * as bloqueoYPreguntasAuditoria from './031-bloqueo-y-preguntas-auditoria';
import * as departamentosCatalogoUnico from './032-departamentos-catalogo-unico';
import * as tendenciaOcupacional from './033-tendencia-ocupacional';
import * as cortesHuellaRepetible from './034-cortes-ocupacionales-huella-repetible';
import * as tendenciaAnioLibre from './035-tendencia-anio-libre';
import * as eliminarCmsTradicional from './036-eliminar-cms-tradicional';
import * as tendenciaClavesUuid from './037-tendencia-ocupacional-claves-uuid';
import * as alertasInversionCatalogos from './038-alertas-inversion-catalogos';
import * as alertasInversionProyectos from './039-alertas-inversion-proyectos';
import * as auditoriaAutoguardado from './040-auditoria-autoguardado';
import * as integridadEIndices from './041-integridad-e-indices';
import * as catalogosSinDuplicados from './042-catalogos-sin-duplicados';
import * as passwordTemporalVence from './043-password-temporal-vence';
import * as identidadDelPanel from './044-identidad-del-panel';
import * as passwordAnterior from './045-password-anterior';
import * as paginasDelSitioEnBd from './046-paginas-del-sitio-en-bd';
import * as permisoCambiarDireccionSecciones from './047-permiso-cambiar-direccion-secciones';

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
  observatorioProgramasSobresalientes,
  cargasDatos,
  cargasDatosProgreso,
  comentarioCambiosVersiones,
  accionesSeguridadAuditoria,
  bloqueoYPreguntasAuditoria,
  departamentosCatalogoUnico,
  tendenciaOcupacional,
  cortesHuellaRepetible,
  tendenciaAnioLibre,
  eliminarCmsTradicional,
  tendenciaClavesUuid,
  alertasInversionCatalogos,
  alertasInversionProyectos,
  auditoriaAutoguardado,
  integridadEIndices,
  catalogosSinDuplicados,
  passwordTemporalVence,
  identidadDelPanel,
  passwordAnterior,
  paginasDelSitioEnBd,
  permisoCambiarDireccionSecciones,
];

const TABLA_CONTROL = 'migraciones_aplicadas';

/** Crea, si no existe, la tabla que anota qué migraciones ya se aplicaron. */
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

/** Los nombres de las migraciones que aún no se aplicaron en esta base, en orden. */
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
