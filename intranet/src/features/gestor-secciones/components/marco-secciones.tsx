/**
 * El marco de las secciones: el menú arriba y el pie abajo, con el contenido en
 * medio.
 *
 * Lo pinta `app/(secciones)/layout.tsx` alrededor de cada sección, pero también
 * lo necesita la vista previa, que vive fuera de ese grupo de rutas para poder
 * decidir cuándo NO llevarlo (ver `app/preview/[slug]/page.tsx`). Está aquí, y no
 * duplicado en los dos sitios, para que el marco de la previsualización sea el
 * mismo que el de la página real: si divergen, la vista previa deja de servir.
 *
 * Lee la plantilla PUBLICADA. Es lo correcto incluso al previsualizar un
 * borrador de otra sección: el menú que la rodeará cuando se apruebe es el que
 * está publicado hoy, no el del borrador.
 */
import React from 'react';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/plantilla/intranet-topbar-wrapper';
import { IntranetFooter } from '@/shared/lib/blocks/plantilla/intranet-footer';
import { obtenerPlantilla } from '../lib/plantilla';

export async function MarcoSecciones({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const plantilla = await obtenerPlantilla();

  return (
    <>
      {plantilla.topbar && <IntranetTopbarWrapper {...plantilla.topbar} />}

      {/* Crece para ocupar el hueco sobrante y dejar el pie abajo del todo. Antes
          lo resolvía cada página con `min-h-screen`, pero con el pie ya fuera del
          contenido eso obligaba a desplazarse siempre. */}
      <div className="intranet-contenido">{children}</div>

      {plantilla.pie && <IntranetFooter {...plantilla.pie} />}
    </>
  );
}
