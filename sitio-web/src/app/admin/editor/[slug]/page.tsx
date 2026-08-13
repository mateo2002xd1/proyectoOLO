import { redirect } from 'next/navigation';
import { rutaPublicaDeSlug } from '@/features/paginas';
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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

  return <EditorClient slug={slug} />;
}
