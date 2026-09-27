import { notFound } from 'next/navigation';
import { ClientPuckRender } from '@/features/paginas';
import { getAuthSessionSnapshot } from '@/shared/lib/session';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';
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

  if (!ROLES_CON_ACCESO.includes((sesion.role ?? '').trim().toLowerCase())) {
    notFound();
  }

  // Si viene versionId, busca esa versión específica (por ej. respaldo archivado);
  // de lo contrario, busca la última versión editable para la cola de revisión.
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const url = versionId
    ? `${BACKEND_URL}/api/paginas/${slug}/editable?versionId=${encodeURIComponent(versionId)}`
    : `${BACKEND_URL}/api/paginas/${slug}/editable`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-Ambito': 'sitio' },
    cache: 'no-store',
  });

  if (!res.ok) notFound();

  const version = await res.json();
  const contenido = version?.contenido?.content ? version.contenido : CONTENIDO_VACIO;

  return (
    <div className="min-h-dvh bg-white">
      <div className="sticky top-0 z-[200] flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-100 px-4 py-2.5 text-sm text-amber-900 lg:px-8">
        <span className="rounded-full bg-amber-900 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-100">
          Vista previa
        </span>
        <span>
          /{slug} · {version?.numeroVersion ? `versión ${version.numeroVersion}` : 'versión sin publicar'}
          {version?.estado ? ` · ${String(version.estado).replace('_', ' ')}` : ''}
        </span>
        <span className="ml-auto opacity-85">
          {version?.estado === 'archivado'
            ? 'Esta es una versión archivada (respaldo). Puedes restaurarla desde la sección de respaldos.'
            : 'Así quedará la página. Para publicarla, vuelve a la cola de revisión.'}
        </span>
      </div>

      <ClientPuckRender data={contenido} />

      {/* La vista previa cuelga fuera de `app/admin/`, así que no hereda su vigilante.
          Sin `alExpirar`: aquí no hay nada que guardar, solo se mira. */}
      <VigilanteSesion />
    </div>
  );
}
