import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  EditButton,
  ClientPuckRender,
  obtenerPaginaPublicada,
  SLUG_PLANTILLA,
} from '@/features/gestor-secciones';
import { puedeEditarPaginas } from '@/shared/lib/sesion';

/**
 * Páginas de la intranet creadas desde el editor visual.
 *
 * Antes solo cubría rutas sin página propia: `/inicio`, `/tasa`, `/matriz` y las
 * dos encuestas tenían cada una su `page.tsx`, y en Next.js un segmento concreto
 * gana al comodín. Esos cinco archivos eran ~30 líneas idénticas salvo el slug y
 * la metadata — la única diferencia real era la metadata (título/descripción) y
 * la clase del envoltorio, ahora resueltas abajo con un mapa por slug. Añadir una
 * sección ya no toca `app/`: se crea publicando una página nueva desde el editor.
 *
 * **El slug nunca lleva barra**, aunque la URL sí: la API expone
 * `/paginas/publica/:slug` y un parámetro de Express no cruza una barra. Por eso
 * el slug se arma uniendo los segmentos con `-`, no con `/` — así
 * `/encuestas/calidad-de-formacion` da `encuestas-calidad-de-formacion`, que es
 * el slug real guardado en BD, y `/matriz` da `matriz` igual que antes.
 *
 * El contenido sale de la API, de la misma tabla `paginas` que usa el sitio pero
 * bajo `ambito='intranet'` — el cliente HTTP manda esa cabecera.
 */

/** Una sola llamada por request aunque la pidan `generateMetadata` y la página. */
const obtenerPaginaCacheada = cache(obtenerPaginaPublicada);

function slugDesdeParams(puckPath: string[]): string {
  return puckPath.join('-');
}

/**
 * Metadata SEO por slug, migrada tal cual de los cinco `page.tsx` que existían.
 * Un slug fuera de este mapa (sección nueva, creada sin tocar código) cae al
 * título real de la página guardado en BD.
 */
const METADATA_POR_SLUG: Record<string, Metadata> = {
  inicio: {
    title: 'Inicio | Intranet',
    description: 'Inicio de la Intranet del Observatorio Laboral y Ocupacional SENA',
  },
  tasa: {
    title: 'Tasa de Vinculación y Empleabilidad',
    description: 'Estadísticas de Tasa de Vinculación y Empleabilidad del SENA',
  },
  matriz: {
    title: 'Matriz de Pertinencia',
    description: 'Matriz de Pertinencia - Herramienta estratégica del SENA',
  },
  'encuestas-calidad-de-formacion': {
    title: 'Calidad de la Formación | Intranet',
    description: 'Resultados de la encuesta de Calidad de la Formación',
  },
  'encuestas-seguimiento-laboral': {
    title: 'Seguimiento Laboral | Intranet',
    description: 'Resultados de la encuesta de Seguimiento Laboral',
  },
};

/**
 * Envoltorio por slug, migrado tal cual de los cinco `page.tsx`: cada sección
 * traía su propia etiqueta y clase (fondo, `overflow-x-hidden` en matriz para
 * la tabla ancha). Un slug fuera del mapa usa el genérico `.pagina-slug`, que ya
 * cubría cualquier página creada desde el comodín antes de esta sesión.
 */
const ENVOLTORIO_POR_SLUG: Record<string, { tag: 'div' | 'main'; className: string }> = {
  inicio: { tag: 'div', className: 'w-full bg-white flex flex-col items-stretch' },
  tasa: { tag: 'div', className: 'w-full bg-white flex flex-col items-stretch' },
  matriz: { tag: 'div', className: 'bg-[#F8F9FA] flex flex-col items-stretch overflow-x-hidden' },
  'encuestas-calidad-de-formacion': {
    tag: 'main',
    className: 'flex flex-col items-stretch bg-white font-sans text-gray-800',
  },
  'encuestas-seguimiento-laboral': {
    tag: 'main',
    className: 'flex flex-col items-stretch bg-white font-sans text-gray-800',
  },
};

const ENVOLTORIO_POR_DEFECTO = { tag: 'div' as const, className: 'pagina-slug' };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath } = await params;
  const slug = slugDesdeParams(puckPath);

  if (slug === SLUG_PLANTILLA) return {};

  const conocida = METADATA_POR_SLUG[slug];
  if (conocida) return conocida;

  const pagina = await obtenerPaginaCacheada(slug);
  return { title: pagina ? `${pagina.titulo} | Intranet` : 'Intranet' };
}

export default async function PaginaDinamica({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath } = await params;
  const slug = slugDesdeParams(puckPath);

  // La plantilla es contenido, pero no una página que se visite: son el menú y el
  // pie que el layout ya está pintando alrededor de esto mismo. Sin este corte,
  // `/plantilla` los mostraría otra vez, duplicados dentro del marco.
  if (slug === SLUG_PLANTILLA) notFound();

  const [pagina, hasPermission] = await Promise.all([
    obtenerPaginaCacheada(slug),
    puedeEditarPaginas(),
  ]);

  // Sin versión aprobada no hay nada que mostrar, pero quien puede editar sí debe
  // poder entrar a crearla.
  if (!pagina) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Página no encontrada</h1>
        <p>No se ha publicado contenido para la ruta: /{puckPath.join('/')}</p>
        <EditButton slug={slug} hasPermission={hasPermission} />
      </div>
    );
  }

  const { tag: Tag, className } = ENVOLTORIO_POR_SLUG[slug] ?? ENVOLTORIO_POR_DEFECTO;

  return (
    <Tag className={className}>
      <EditButton slug={slug} hasPermission={hasPermission} />
      <ClientPuckRender data={pagina.contenido} />
    </Tag>
  );
}
