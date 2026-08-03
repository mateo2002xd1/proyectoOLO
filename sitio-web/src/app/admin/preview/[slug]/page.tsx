import { notFound } from 'next/navigation';
import { ClientPuckRender } from '@/features/paginas';
import { getAuthSessionSnapshot } from '@/shared/lib/session';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';
import { cookies } from 'next/headers';

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sesion = await getAuthSessionSnapshot();

  if (!ROLES_CON_ACCESO.includes((sesion.role ?? '').trim().toLowerCase())) {
    notFound();
  }

  // La última versión, sea cual sea su estado: es la que está a revisión y todavía
  // no aparece en la página publicada.
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const res = await fetch(`${BACKEND_URL}/api/paginas/${slug}/editable`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Ambito': 'sitio' },
    cache: 'no-store',
  });

  if (!res.ok) notFound();

  const version = await res.json();
  const contenido = version?.contenido?.content ? version.contenido : CONTENIDO_VACIO;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-[200] flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-100 px-4 py-2.5 text-sm text-amber-900 lg:px-8">
        <span className="rounded-full bg-amber-900 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-100">
          Vista previa
        </span>
        <span>
          /{slug} · versión sin publicar
          {version?.estado ? ` · ${String(version.estado).replace('_', ' ')}` : ''}
        </span>
        <span className="ml-auto opacity-85">
          Así quedará la página. Para publicarla, vuelve a la cola de revisión.
        </span>
      </div>

      <ClientPuckRender data={contenido} />
    </div>
  );
}
