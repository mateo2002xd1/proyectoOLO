import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ClientPuckRender, obtenerPaginaPublicadaCacheada, enlaceAlEditor } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/session';

/**
 * Política de Seguridad, Privacidad y Tratamiento de Datos.
 *
 * Sección de fábrica editable con Puck (ver `SECCIONES_POR_AMBITO.sitio` en
 * `catalogo-permisos.ts`), con el mismo patrón que `inicio/page.tsx` y el
 * comodín `[slug]/page.tsx`: ámbos leen `obtenerPaginaPublicadaCacheada` (no
 * la versión sin caché) para no pegarle al backend en cada visita. Sigue
 * siendo un segmento estático (no pasa por el comodín) para poder conservar
 * su propia metadata, más específica que la que daría el comodín (que no
 * define ninguna).
 */
export const metadata: Metadata = {
  title: 'Política de Seguridad y Privacidad de la Información | SENA OLO',
  description:
    'Consulte los lineamientos de seguridad, privacidad de la información, tratamiento y protección de datos personales (Ley 1581 de 2012) y el mapa de procesos institucional del Observatorio Laboral y Ocupacional del SENA.',
};

const SLUG = 'politica-de-privacidad';

export default async function PoliticaPrivacidadPage() {
  const [pagina, puedeEditar] = await Promise.all([
    obtenerPaginaPublicadaCacheada(SLUG),
    puedeEditarPaginas(),
  ]);

  if (!pagina || !pagina.contenido) {
    if (!puedeEditar) notFound();

    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1>Esta página todavía no tiene contenido</h1>
        <p>
          No se ha publicado nada en <code>/{SLUG}</code>. Cuando la llenes y se apruebe,
          se verá aquí.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Link
            href={enlaceAlEditor(SLUG, `/${SLUG}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#002c46] rounded-full hover:bg-[#001a2a]"
          >
            Editar sección
          </Link>
        </p>
      </div>
    );
  }

  const data: Data = Array.isArray(pagina.contenido)
    ? { content: pagina.contenido, root: {} }
    : pagina.contenido;

  return <ClientPuckRender data={data} />;
}
