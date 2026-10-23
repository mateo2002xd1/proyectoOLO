import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { ClientPuckRender } from '@/features/editor';
import { getAuthSessionSnapshot } from '@/shared/lib/session/session';
import { AUTH_COOKIE_NAME } from '@/shared/lib/session/auth-cookies';
import { cookies } from 'next/headers';
import { VigilanteSesion } from '@/shared/lib/inactividad';

export const metadata = {
  title: 'Previsualización | OLO',
  description: 'Vista previa de una página antes de publicarla',
};

/** Ver borradores es cosa de quien edita o aprueba. */
const ROLES_CON_ACCESO = ['superadmin', 'administrador', 'editor'];

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const CONTENIDO_VACIO = { content: [], root: { props: {} } };

/**
 * Vista previa de una página del sitio antes de aprobarla.
 *
 * Se abre desde el botón «Ver» de la cola de revisión. La intranet tiene la suya
 * aparte porque cada aplicación dibuja sus propios bloques: esta no sabe pintar un
 * tablero de la intranet ni al revés.
 */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ versionId?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const versionId = query?.versionId;
  const sesion = await getAuthSessionSnapshot();
  // Con `versionId` se llega desde Respaldos (una versión archivada); sin él, desde
  // el ojo de la cola de revisión, que abre en la misma pestaña.
  const volverA = versionId ? '/admin-panel/backup-section' : '/admin-panel/review-section';

  if (!ROLES_CON_ACCESO.includes((sesion.role ?? '').trim().toLowerCase())) {
    notFound();
  }
  // `.` y `..` son segmentos de ruta: `encodeURIComponent` no los toca y `fetch` los resolvería.
  if (slug === '.' || slug === '..') notFound();

  // Si viene versionId, busca esa versión específica (por ej. respaldo archivado);
  // de lo contrario, busca la última versión editable para la cola de revisión.
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const url = versionId
    ? `${BACKEND_URL}/api/paginas/${encodeURIComponent(slug)}/editable?versionId=${encodeURIComponent(versionId)}`
    : `${BACKEND_URL}/api/paginas/${encodeURIComponent(slug)}/editable`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-Ambito': 'sitio' },
    cache: 'no-store',
  });

  if (!res.ok) notFound();

  const version = await res.json();
  const contenido = version?.contenido?.content ? version.contenido : CONTENIDO_VACIO;

  return (
    <div className="min-h-dvh bg-white">
      {/* El fondo es opaco (el azul mezclado con blanco, no `/10`): la barra es fija y la
          página pasa por debajo al bajar. La etiqueta va en azul oscuro y no en blanco:
          sobre `brand-blue` el blanco da 2,6:1 y el `#0d1526`, 7:1 (9-accesibilidad.md §2.1). */}
      <div className="sticky top-0 z-[200] flex items-center border-b border-brand-blue/40 bg-[color-mix(in_srgb,var(--color-brand-blue)_12%,white)] px-4 py-1.5 lg:px-8">
        <span className="rounded-full bg-brand-blue px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0d1526]">
          Vista previa
        </span>
        <Link
          href={volverA}
          className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-[16px] px-3 text-sm font-semibold text-[#0d1526] transition-colors hover:bg-brand-blue/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </div>

      <ClientPuckRender data={contenido} />

      {/* La vista previa cuelga fuera de `app/admin/`, así que no hereda su vigilante.
          Sin `alExpirar`: aquí no hay nada que guardar, solo se mira. */}
      <VigilanteSesion />
    </div>
  );
}
