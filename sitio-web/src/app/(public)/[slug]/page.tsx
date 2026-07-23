import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import { ClientPuckRender, EditButton, obtenerPagina } from '@/features/paginas';

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pagina = await obtenerPagina(slug);

  if (!pagina || !pagina.contenido) notFound();

  // El contenido legado se guardaba como Bloque[] plano; Puck espera { content, root }
  const data: Data = Array.isArray(pagina.contenido)
    ? { content: pagina.contenido, root: {} }
    : pagina.contenido;

  return (
    <>
      {/* Botón flotante para administradores (SSR-safe, valida cookies) */}
      <EditButton slug={slug} />
      <ClientPuckRender data={data} />
    </>
  );
}
