import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import { ClientPuckRender, EditButton, obtenerPagina } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/session';

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pagina, puedeEditar] = await Promise.all([
    obtenerPagina(slug),
    puedeEditarPaginas(),
  ]);

  if (!pagina || !pagina.contenido) notFound();

  // El contenido legado se guardaba como Bloque[] plano; Puck espera { content, root }
  const data: Data = Array.isArray(pagina.contenido)
    ? { content: pagina.contenido, root: {} }
    : pagina.contenido;

  return (
    <>
      <EditButton slug={slug} hasPermission={puedeEditar} volverA={`/${slug}`} />
      <ClientPuckRender data={data} />
    </>
  );
}
