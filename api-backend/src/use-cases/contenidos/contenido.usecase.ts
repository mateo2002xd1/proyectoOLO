import { randomUUID } from 'crypto';
import { ContenidoRepository } from '../../repositories/contenido.repository';
import { SectionRepository } from '../../repositories/secciones.repository';

export const obtenerContenidos = (filters: any = {}) => ContenidoRepository.findAll(filters);

export const obtenerContenidoPorId = async (id: string) => {
  const contenido = await ContenidoRepository.findById(id);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
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

export const eliminarContenido = async (id: string) => {
  const contenido = await ContenidoRepository.findById(id);
  if (!contenido) throw Object.assign(new Error('Contenido no encontrado'), { status: 404 });
  await ContenidoRepository.delete(id);
  return { message: 'Contenido eliminado' };
};
