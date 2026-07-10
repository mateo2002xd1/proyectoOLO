import { randomUUID } from 'crypto';
import { PostRepository } from '../../repositories/paginas.repository';
import { SectionRepository } from '../../repositories/secciones.repository';
import { AuditRepository } from '../../repositories/auditoria.repository';

export const getAllPosts = (filters: any = {}) => PostRepository.findAll(filters);

export const getPostById = async (id: string) => {
  const post = await PostRepository.findById(id);
  if (!post) throw Object.assign(new Error('Post no encontrado'), { status: 404 });
  return post;
};

export const createPost = async (data: any, authorId?: string) => {
  const existing = await PostRepository.findBySlug(data.slug);
  if (existing) throw Object.assign(new Error('Ya existe un post con ese slug'), { status: 409 });

  const section = await SectionRepository.findById(data.sectionId);
  if (!section) throw Object.assign(new Error('Sección no encontrada'), { status: 404 });

  const id = randomUUID();
  const post = await PostRepository.create({ id, ...data, authorId });

  await AuditRepository.create({
    content_id: id,
    content_type: 'post',
    user_id: authorId || null,
    action_type: 'create',
    modified_fields: Object.keys(data).map((k) => ({ field: k, old: null, new: data[k] })),
  });

  return post;
};

export const updatePost = async (id: string, data: any) => {
  const post = await PostRepository.findById(id);
  if (!post) throw Object.assign(new Error('Post no encontrado'), { status: 404 });

  if (data.slug && data.slug !== post.slug) {
    const duplicate = await PostRepository.findBySlug(data.slug);
    if (duplicate) throw Object.assign(new Error('Ya existe un post con ese slug'), { status: 409 });
  }

  const [, updated] = await PostRepository.update(id, data);
  return updated?.[0] || post;
};

export const globalLookup = async (term: string) => {
  if (!term || term.trim().length === 0) return { posts: [] };
  return { posts: await PostRepository.globalLookup(term.trim()) };
};

export const deletePost = async (id: string) => {
  const post = await PostRepository.findById(id);
  if (!post) throw Object.assign(new Error('Post no encontrado'), { status: 404 });
  await PostRepository.delete(id);
  return { message: 'Post eliminado' };
};
