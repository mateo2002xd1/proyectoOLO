import { randomUUID } from 'crypto';
import { Op } from 'sequelize';
import { ContenidoRepository } from '../../repositories/contenido.repository';
import { SectionRepository } from '../../repositories/secciones.repository';
import { contenidosPolicies } from '../../policies/contenidos.policies';
import { exigirPropiedad } from '../../shared/autorizacion';

/** Quién pide. Sin actor se asume público: solo lo publicado. */
export type Actor = { id?: string; role?: string | null };

/**
 * Listar contenidos.
 *
 * Quien no puede ver lo no publicado recibe solo lo publicado, pida lo que pida: el
 * filtro se impone **después** de lo que traiga el llamador, para que ningún
 * querystring pueda ensancharlo. Antes, `GET /api/contenidos` devolvía borradores y
 * material rechazado a cualquier sesión.
 */
export const obtenerContenidos = (filters: any = {}, actor?: Actor) => {
  const where = { ...filters };
  if (!contenidosPolicies.puedeVerNoPublicado(actor?.role)) {
    where.publishedAt = { [Op.ne]: null };
  }
  return ContenidoRepository.findAll(where);
};

/**
 * Un contenido por su id.
 *
 * Si no está publicado, solo lo ve su autor o quien tenga permiso para ver borradores.
 * Se responde 404 y no 403 a propósito: un 403 confirmaría que ese id existe, y con
 * ids adivinables eso convierte el endpoint en un índice de lo que está sin publicar
 * (fila S8 de `3-seguridad-del-proyecto.md`).
 */
export const obtenerContenidoPorId = async (id: string, actor?: Actor) => {
  const contenido = await ContenidoRepository.findById(id);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });

  if (!contenido.publishedAt) {
    exigirPropiedad({
      duenoId: contenido.authorId,
      actorId: actor?.id,
      omitir: contenidosPolicies.puedeVerNoPublicado(actor?.role),
      recurso: 'Contenido',
      ocultar: true,
    });
  }

  return contenido;
};

export const crearContenido = async (data: any, authorId?: string) => {
  const existing = await ContenidoRepository.findBySlug(data.slug);
  if (existing) throw Object.assign(new Error('Ya existe un contenido con ese slug'), { status: 409 });

  const section = await SectionRepository.findById(data.sectionId);
  if (!section) throw Object.assign(new Error('Sección no encontrada'), { status: 404 });

  const id = randomUUID();
  const contenido = await ContenidoRepository.create({ id, ...data, authorId });

  // El registro de auditoría lo hace `ContenidoController.create`, no este
  // use-case. Antes se escribía en los dos sitios: aquí con los valores buenos y
  // allí con la acción en inglés, que el CHECK de la migración 006 rechazaba. Al
  // arreglar el controlador, mantener ambos habría duplicado cada alta.
  // Manda el controlador porque es el único que ve la petición, y sin ella no
  // hay IP, user-agent ni nombre del usuario que guardar.
  return contenido;
};

export const actualizarContenido = async (id: string, data: any) => {
  const contenido = await ContenidoRepository.findById(id);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });

  if (data.slug && data.slug !== contenido.slug) {
    const duplicate = await ContenidoRepository.findBySlug(data.slug);
    if (duplicate) throw Object.assign(new Error('Ya existe un contenido con ese slug'), { status: 409 });
  }

  const [, updated] = await ContenidoRepository.update(id, data);
  return updated?.[0] || contenido;
};

export const buscarContenidoGlobal = async (term: string) => {
  if (!term || term.trim().length === 0) return { contenidos: [] };
  return { contenidos: await ContenidoRepository.globalLookup(term.trim()) };
};

/**
 * Borrar un contenido.
 *
 * Aquí sí se mira de quién es, y es el único sitio del dominio editorial donde
 * importa: editar es colaborativo —cualquier Editor trabaja sobre lo de otro— pero
 * destruirlo no. El autor puede con lo suyo; sobre lo ajeno hace falta el permiso de
 * quien aprueba. Es la misma regla que `pagina.routes.ts` aplica a `eliminarVersion`.
 *
 * 403 y no 404: el contenido ya era visible para quien llega hasta aquí, así que
 * ocultarlo no protegería nada y sí confundiría al que se equivoca de botón.
 */
export const eliminarContenido = async (id: string, actor?: Actor) => {
  const contenido = await ContenidoRepository.findById(id);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });

  exigirPropiedad({
    duenoId: contenido.authorId,
    actorId: actor?.id,
    omitir: contenidosPolicies.puedeEliminar(actor?.role),
    recurso: 'contenido',
  });

  await ContenidoRepository.delete(id);
  return { message: 'Contenido eliminado' };
};
