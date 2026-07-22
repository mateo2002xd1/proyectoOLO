export interface Contenido {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  sectionId: string;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
