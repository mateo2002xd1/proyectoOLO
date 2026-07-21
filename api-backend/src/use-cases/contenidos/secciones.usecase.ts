import { randomUUID } from 'crypto';
import { SectionRepository } from '../../repositories/secciones.repository';

export const getAllSections = () => SectionRepository.findAll();

export const getSectionById = async (id: string) => {
  const section = await SectionRepository.findById(id);
  if (!section) throw Object.assign(new Error('Sección no encontrada'), { status: 404 });
  return section;
};

export const createSection = async (data: any) => {
  const existing = await SectionRepository.findBySlug(data.slug);
  if (existing) throw Object.assign(new Error('Ya existe una sección con ese slug'), { status: 409 });
  return SectionRepository.create({ id: randomUUID(), ...data });
};

export const updateSection = async (id: string, data: any) => {
  const section = await SectionRepository.findById(id);
  if (!section) throw Object.assign(new Error('Sección no encontrada'), { status: 404 });
  const [, updated] = await SectionRepository.update(id, data);
  return updated?.[0] || section;
};

export const deleteSection = async (id: string) => {
  const section = await SectionRepository.findById(id);
  if (!section) throw Object.assign(new Error('Sección no encontrada'), { status: 404 });
  await SectionRepository.delete(id);
  return { message: 'Sección eliminada' };
};
