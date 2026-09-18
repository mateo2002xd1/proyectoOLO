import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import Link from 'next/link';
import { ClientPuckRender, obtenerPagina, enlaceAlEditor, SLUG_PLANTILLA } from '@/features/paginas';
import { puedeEditarPaginas, puedeEditarSeccion } from '@/shared/lib/session';

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

  const [pagina, puedeEditar] = await Promise.all([
    obtenerPagina(slug),
    puedeEditarPaginas(),
  ]);

  // Sin versión aprobada no hay nada que enseñar. A quien visita el sitio eso es un
  // 404 y punto; a quien puede editar se le da la entrada al editor, porque el caso
  // normal es una sección recién creada que todavía está vacía —y mandarla a un 404
  // duro justo después de crearla es la peor manera de contarlo. Es el mismo trato
  // que ya da el comodín de la intranet.
  //
  // Pero solo si la sección existe y es de quien mira: con el rol a secas, una URL
  // inventada le enseñaba a cualquier editor «Editar sección», y editar ahí crea la
  // página al guardar. La segunda comprobación va después de la barata (el rol de la
  // cookie) para que un visitante no le cueste al sitio una petición más.
  if (!pagina || !pagina.contenido) {
    if (!puedeEditar || !(await puedeEditarSeccion(slug))) notFound();

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
