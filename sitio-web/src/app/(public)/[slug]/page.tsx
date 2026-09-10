import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import Link from 'next/link';
import { ClientPuckRender, obtenerPagina, enlaceAlEditor } from '@/features/paginas';
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

  // Sin versión aprobada no hay nada que enseñar. A quien visita el sitio eso es un
  // 404 y punto; a quien puede editar se le da la entrada al editor, porque el caso
  // normal es una sección recién creada que todavía está vacía —y mandarla a un 404
  // duro justo después de crearla es la peor manera de contarlo. Es el mismo trato
  // que ya da el comodín de la intranet.
  if (!pagina || !pagina.contenido) {
    if (!puedeEditar) notFound();

    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1>Esta página todavía no tiene contenido</h1>
        <p>
          No se ha publicado nada en <code>/{slug}</code>. Cuando la llenes y se apruebe,
          se verá aquí.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Link
            href={enlaceAlEditor(slug, `/${slug}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#002c46] rounded-full hover:bg-[#001a2a]"
          >
            Editar sección
          </Link>
        </p>
      </div>
    );
  }

  // El contenido legado se guardaba como Bloque[] plano; Puck espera { content, root }
  const data: Data = Array.isArray(pagina.contenido)
    ? { content: pagina.contenido, root: {} }
    : pagina.contenido;

  return <ClientPuckRender data={data} />;
}
