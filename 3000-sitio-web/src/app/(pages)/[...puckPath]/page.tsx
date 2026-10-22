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
  obtenerPlantilla,
  enlaceAlEditor,
  rutaPublicaDeSlug,
  slugsDeRutaPublica,
} from '@/features/editor';
import { mapaDelMenu } from '@/shared/lib/rutas-del-menu';
import { puedeEditarPaginas, puedeEditarSeccion } from '@/shared/lib/session/session';

/**
 * Todas las páginas del sitio público. Es la única ruta de `app/(pages)/`.
 *
 * Antes había una carpeta por cada página que no cabía en el comodín `[slug]`: las
 * vistas escritas en código (buscador, alertas, programas sobresalientes), las que
 * querían metadata propia (inicio, política de privacidad) y las de URL con dos
 * segmentos (`/clasificacion/cno`). Desde la migración 046 todas son filas de `paginas`
 * y las vistas son bloques de Puck, así que publicar, mover o borrar una página ya no
 * toca `app/`. Es el mismo modelo de la intranet (`app/(pages)/[...puckPath]`).
 *
 * **El slug nunca lleva barra**, aunque la URL sí: la API expone
 * `/paginas/publica/:slug` y un parámetro de Express no cruza una barra. La URL la arma el
 * menú de «Menú y pie» (`shared/lib/rutas-del-menu`): una hija de un desplegable cuelga de
 * su tramo, `/clasificacion-de-las-ocupaciones/clasificacion-cuoc`, y el slug es el último
 * tramo. Una página que no está en el menú vive en `/{slug}`. Nada de esto está escrito en
 * el código: crear la página en el editor y ponerla en el menú basta.
 *
 * Las URLs viejas de dos tramos (`/clasificacion/cuoc`, que antes salían de una lista de
 * carpetas) siguen llegando: si el último tramo no es una página, se prueba con todos unidos
 * por guion (`clasificacion-cuoc`) y se redirige a la ruta buena.
 */

/** Una sola llamada por request aunque la pidan `generateMetadata` y la página. */
const obtenerPaginaCacheada = cache(obtenerPaginaPublicadaCacheada);

/**
 * Si un candidato puede ser el slug de una página.
 *
 * Que no cambie al pasar por `slugificar` descarta lo que nunca fue una página
 * (`/.well-known/...`, mayúsculas, espacios) sin gastar una petición a la API. Que sea
 * válido descarta los reservados, entre ellos `menu-y-pie`: es una fila real de
 * `paginas`, pero guarda la cabecera y el pie que el layout pinta alrededor de todo, y
 * servida aquí los mostraría duplicados dentro del `<main>`.
 */
const esSlugPosible = (slug: string) => slug === slugificar(slug) && esSlugValido(slug);

/**
 * La página que nombra la URL: el slug y su versión publicada.
 *
 * Se prueban los candidatos de `slugsDeRutaPublica` en orden y gana el primero que existe.
 * Si ninguno existe, el slug es el primero (el último tramo) y `pagina` es `null`: quien
 * llama decide entre el 404 y la invitación a crearla. La portada no se consulta aquí, la
 * lee `obtenerPaginaInicio`, que tiene su respaldo.
 *
 * Con `cache` de React para que `generateMetadata` y la página no pidan dos veces lo mismo.
 * La clave es el texto, no el arreglo: dos arreglos iguales no son la misma entrada.
 */
const resolverPagina = cache(async (ruta: string) => {
  const candidatos = slugsDeRutaPublica(ruta.split('/')).filter(esSlugPosible);
  for (const slug of candidatos) {
    if (slug === 'inicio') return { slug, pagina: null };
    const pagina = await obtenerPaginaCacheada(slug);
    if (pagina) return { slug, pagina };
  }
  return { slug: candidatos[0] ?? null, pagina: null };
});

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
  const { slug, pagina } = await resolverPagina(puckPath.join('/'));
  if (!slug) return {};

  const conocida = METADATA_POR_SLUG[slug];
  if (conocida) return conocida;

  // Un título igual al slug es de una fila creada sin nombre (`tendencias`,
  // `publicaciones`): en la pestaña se vería peor que el título por defecto del sitio.
  return pagina?.titulo && pagina.titulo !== slug ? { title: `${pagina.titulo} | SENA OLO` } : {};
}

export default async function PaginaPublica({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath } = await params;
  const { slug, pagina } = await resolverPagina(puckPath.join('/'));
  if (!slug) notFound();

  // Cada página tiene una sola URL: la que le da el menú. `/clasificacion-cuoc`, la forma
  // vieja `/clasificacion/cuoc` y un tramo de más darían la misma página; se manda a la
  // buena para no tener contenido duplicado. Solo si la página existe: redirigir una
  // dirección inventada a otra que tampoco existe sería un salto para acabar en el 404.
  const plantilla = await obtenerPlantilla();
  const ruta = rutaPublicaDeSlug(slug, mapaDelMenu(plantilla.cabecera?.navLinks ?? []));
  if ((pagina || slug === 'inicio') && `/${puckPath.join('/')}` !== ruta) redirect(ruta);

  // La portada nunca se queda en blanco: si la API no responde, `obtenerPaginaInicio`
  // devuelve la identidad visual de respaldo (`homeFallbackData`).
  if (slug === 'inicio') return <ClientPuckRender data={await obtenerPaginaInicio()} />;

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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            Termina de editar la página
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
