import { redirect } from 'next/navigation';
import { AvisoSeccionNueva, rutaPublicaDeSlug } from '@/features/paginas';
import { getAuthSessionSnapshot, puedeEditarPaginas } from '@/shared/lib/session';
import { EditorClient } from './editor-client';

/**
 * El editor visual de una página.
 *
 * Los dos filtros van en el servidor, antes de mandar nada al navegador: hasta
 * ahora toda esta pantalla era `'use client'` y sin ninguna comprobación, así que
 * cualquiera que escribiera la URL se descargaba el editor entero y solo se
 * enteraba de que no podía al intentar guardar.
 */
export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ nueva?: string }>;
}) {
  const [{ slug }, { nueva }] = await Promise.all([params, searchParams]);

  const { hasSession } = await getAuthSessionSnapshot();
  if (!hasSession) {
    redirect(`/admin/login?redirect=${encodeURIComponent(`/admin/editor/${slug}`)}`);
  }

  // Con sesión pero sin permiso no se manda al login: ya está identificado, y
  // volver a pedirle credenciales sugiere que se equivocó de usuario. Se le
  // devuelve a la página que quería editar.
  if (!(await puedeEditarPaginas())) {
    redirect(rutaPublicaDeSlug(slug));
  }

  return (
    <>
      {/* Solo al venir de «Nueva página»: es donde se entrega el enlace de la ruta
          recién creada, que es lo que hay que pegar en el menú para poder llegar. */}
      {nueva === '1' && <AvisoSeccionNueva slug={slug} />}
      <EditorClient slug={slug} />
    </>
  );
}
