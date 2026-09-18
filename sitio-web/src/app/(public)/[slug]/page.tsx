import type { Data } from '@puckeditor/core';
import { ClientPuckRender, obtenerPagina } from '@/features/paginas';

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
