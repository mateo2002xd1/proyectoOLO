import { cache } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { Data } from '@puckeditor/core';
import { slugificar, esSlugValido } from '@olo/slug-policy';
import {
  ClientPuckRender,
  obtenerPaginaPublicadaCacheada,
  obtenerPaginaInicio,
  enlaceAlEditor,
  rutaPublicaDeSlug,
} from '@/features/paginas';
import { puedeEditarPaginas, puedeEditarSeccion } from '@/shared/lib/session';

/**
 * Todas las páginas del sitio público. Es la única ruta de `app/(paginas)/`.
 *
 * Antes había una carpeta por cada página que no cabía en el comodín `[slug]`: las
 * vistas escritas en código (buscador, alertas, programas sobresalientes), las que
 * querían metadata propia (inicio, política de privacidad) y las de URL con dos
 * segmentos (`/clasificacion/cno`). Desde la migración 046 todas son filas de `paginas`
 * y las vistas son bloques de Puck, así que publicar, mover o borrar una página ya no
 * toca `app/`. Es el mismo modelo de la intranet (`app/(paginas)/[...puckPath]`).
 *
 * **El slug nunca lleva barra**, aunque la URL sí: la API expone
 * `/paginas/publica/:slug` y un parámetro de Express no cruza una barra. Por eso el slug
 * son los segmentos unidos con `-`: `/clasificacion/cno` da `clasificacion-cno`. La vuelta
 * (slug → URL) la decide `rutaPublicaDeSlug` con su lista de carpetas.
 */

/** Una sola llamada por request aunque la pidan `generateMetadata` y la página. */
const obtenerPaginaCacheada = cache(obtenerPaginaPublicadaCacheada);

/**
 * El slug de la URL, o `null` si no puede serlo.
 *
 * Que no cambie al pasar por `slugificar` descarta lo que nunca fue una página
 * (`/.well-known/...`, mayúsculas, espacios) sin gastar una petición a la API. Que sea
 * válido descarta los reservados, entre ellos `menu-y-pie`: es una fila real de
 * `paginas`, pero guarda la cabecera y el pie que el layout pinta alrededor de todo, y
 * servida aquí los mostraría duplicados dentro del `<main>`.
 */
function slugDesdeParams(puckPath: string[]): string | null {
  const slug = puckPath.join('-');
  return slug === slugificar(slug) && esSlugValido(slug) ? slug : null;
}

/**
 * Metadata SEO de las páginas que la tenían en su carpeta propia, migrada tal cual.
 * Un slug fuera de este mapa usa el título guardado en `paginas`.
 */
const METADATA_POR_SLUG: Record<string, Metadata> = {
  inicio: {
    title: 'Observatorio Laboral y Ocupacional',
    description:
      'Observatorio Laboral y Ocupacional del SENA: monitoreo del mercado laboral, orientación y alertas sectoriales.',
    alternates: { canonical: '/inicio' },
  },
  'politica-de-privacidad': {
    title: 'Política de Seguridad y Privacidad de la Información | SENA OLO',
    description:
      'Consulte los lineamientos de seguridad, privacidad de la información, tratamiento y protección de datos personales (Ley 1581 de 2012) y el mapa de procesos institucional del Observatorio Laboral y Ocupacional del SENA.',
  },
  'clasificacion-cno': {
    title: 'Clasificación Nacional de Ocupaciones (CNO) | SENA OLO',
    description:
      'Consulte la Clasificación Nacional de Ocupaciones (CNO) en el Observatorio Laboral y Ocupacional del SENA.',
  },
  'clasificacion-cuoc': {
    title: 'Clasificación Única de Ocupaciones para Colombia (CUOC) | SENA OLO',
    description:
      'Consulte la Clasificación Única de Ocupaciones para Colombia (CUOC) en el Observatorio Laboral y Ocupacional del SENA.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath } = await params;
  const slug = slugDesdeParams(puckPath);
  if (!slug) return {};

  const conocida = METADATA_POR_SLUG[slug];
  if (conocida) return conocida;

  // Un título igual al slug es de una fila creada sin nombre (`tendencias`,
  // `publicaciones`): en la pestaña se vería peor que el título por defecto del sitio.
  const pagina = await obtenerPaginaCacheada(slug);
  return pagina?.titulo && pagina.titulo !== slug ? { title: `${pagina.titulo} | SENA OLO` } : {};
}

export default async function PaginaPublica({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath } = await params;
  const slug = slugDesdeParams(puckPath);
  if (!slug) notFound();

  // Cada página tiene una sola URL. Como el slug no distingue guion de barra,
  // `/clasificacion-cno` y `/clasificacion/cno` darían la misma página; se manda a la
  // buena para no tener contenido duplicado.
  const ruta = rutaPublicaDeSlug(slug);
  if (`/${puckPath.join('/')}` !== ruta) redirect(ruta);

  // La portada nunca se queda en blanco: si la API no responde, `obtenerPaginaInicio`
  // devuelve la identidad visual de respaldo (`homeFallbackData`).
  if (slug === 'inicio') return <ClientPuckRender data={await obtenerPaginaInicio()} />;

  const pagina = await obtenerPaginaCacheada(slug);

  // Sin versión aprobada no hay nada que enseñar. A quien visita el sitio eso es un
  // 404 y punto; a quien puede editar se le da la entrada al editor, porque el caso
  // normal es una sección recién creada que todavía está vacía.
  //
  // Pero solo si la sección existe y es de quien mira: con el rol a secas, una URL
  // inventada le enseñaba a cualquier editor «Editar sección», y editar ahí crea la
  // página al guardar. La segunda comprobación va después de la barata (el rol de la
  // cookie) para que un visitante no le cueste al sitio una petición más.
  if (!pagina || !pagina.contenido) {
    if (!(await puedeEditarPaginas()) || !(await puedeEditarSeccion(slug))) notFound();

    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1>Esta página todavía no tiene contenido</h1>
        <p>
          No se ha publicado nada en <code>{ruta}</code>. Cuando la llenes y se apruebe,
          se verá aquí.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Link
            href={enlaceAlEditor(slug, ruta)}
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
