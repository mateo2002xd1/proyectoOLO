import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import { ClientPuckRender, obtenerPagina, SLUG_PLANTILLA } from '@/features/paginas';

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // `menu-y-pie` es una fila real de `paginas`, pero guarda la cabecera y el pie que el
  // layout pinta alrededor de todo el sitio, no una página. Sin esto este comodín la
  // encontraría en la base y la serviría en `/menu-y-pie`, con una cabecera y un pie
  // duplicados dentro del `<main>`. Va antes de consultar la API: no hay nada que
  // buscar. Para verla antes de publicar está `/preview/menu-y-pie`. Es el mismo
  // corte que hace el comodín de la intranet.
  if (slug === SLUG_PLANTILLA) notFound();

  const pagina = await obtenerPagina(slug);

  if (!pagina || !pagina.contenido) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Página no encontrada</h1>
        <p>No se ha publicado contenido para la ruta: /{slug}</p>
      </div>
    );
  }

  // El contenido legado se guardaba como Bloque[] plano; Puck espera { content, root }
  const data: Data = Array.isArray(pagina.contenido)
    ? { content: pagina.contenido, root: {} }
    : pagina.contenido;

  return <ClientPuckRender data={data} />;
}
