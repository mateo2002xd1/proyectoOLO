import { Transaction } from 'sequelize';
import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';
import { errorDeComentario, normalizarComentario } from '../../shared/comentario-cambios';
import { validarAccesibilidad, mensajeDeViolacion, type ViolacionAccesibilidad } from '@olo/accessibility-policy';
import { limpiarSubidasPendientes } from './limpiar-subidas-pendientes.usecase';
import { uuidONulo } from '../../shared/uuid';

/**
 * "Enviar a revisión" es el punto de la Fase 5 de `9-accesibilidad.md`: un
 * borrador puede guardarse incompleto (no se pierde trabajo a medio hacer),
 * pero no puede pasar a `en_revision` sin los campos obligatorios de
 * accesibilidad (alt de imagen, título de iframe). El controller mapea esto a
 * 400 con el detalle — no es un error genérico.
 */
export class ErrorValidacionAccesibilidad extends Error {
  violaciones: ViolacionAccesibilidad[];

  constructor(violaciones: ViolacionAccesibilidad[]) {
    super(violaciones.map(mensajeDeViolacion).join(' '));
    this.name = 'ErrorValidacionAccesibilidad';
    this.violaciones = violaciones;
  }
}

/**
 * `comentario` es el «commit» del envío: qué cambió, en palabras de quien edita.
 *
 * Se comprueba aquí aunque la ruta ya lo valide con Zod, porque los scripts de siembra
 * llaman a este caso de uso directamente, sin pasar por HTTP. Va antes que nada: sin
 * comentario no hay envío, y no tiene sentido leer la página para acabar en un 400.
 */
export const enviarARevision = async (
  slug: string,
  userId: string,
  ambito: Ambito,
  comentario: string,
  tx?: Transaction
) => {
  const comentarioCambios = normalizarComentario(comentario);
  const errorComentario = errorDeComentario(comentarioCambios);
  if (errorComentario) throw Object.assign(new Error(errorComentario), { status: 400 });

  const pagina = await PaginaRepository.findBySlug(slug, ambito, tx);
  if (!pagina) throw new Error('Página no encontrada');
  const paginaAnterior = pagina.toJSON();

  const ultimaVersion = await PaginaRepository.findVersionPorEstado(pagina.id, 'borrador', tx);
  if (!ultimaVersion) throw new Error('No hay borrador para enviar a revisión');
  const versionAnterior = ultimaVersion.toJSON();

  // `Ambito` de la API ('sitio' | 'intranet') coincide 1:1 con el de
  // `@olo/accessibility-policy` — son el mismo concepto en las dos apps.
  const violaciones = validarAccesibilidad(ultimaVersion.contenido, ambito);
  if (violaciones.length > 0) throw new ErrorValidacionAccesibilidad(violaciones);

  // El comentario de lo que está publicado ahora es el «antes» de la bitácora: contra
  // eso se compara lo que se propone.
  const versionPublicada = await PaginaRepository.findVersionPorEstado(pagina.id, 'publicado', tx);

  const datosActualizacion: any = { estado: 'en_revision', comentarioCambios };
  const autorId = uuidONulo(userId);
  if (autorId && !ultimaVersion.creadoPor) {
    datosActualizacion.creadoPor = autorId;
  }
  await PaginaRepository.actualizarVersion(ultimaVersion, datosActualizacion, tx);

  // Limpiar huérfanos de la sesión antes de salir de la edición
  limpiarSubidasPendientes({
    paginaId: pagina.id,
    slug,
    ambito,
    usuarioId: autorId || userId,
  }).catch((err) => console.error('[Limpieza Enviar Revisión] Error limpiando subidas pendientes:', err));

  return {
    pagina,
    version: ultimaVersion,
    paginaAnterior,
    versionAnterior,
    comentarioAnterior: versionPublicada?.comentarioCambios ?? null,
  };
};
