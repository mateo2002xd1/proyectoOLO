import React from 'react';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import { PlantillaEditButton, obtenerPlantilla } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/sesion';

/**
 * Marco común de las secciones de la intranet: menú arriba, pie abajo.
 *
 * Hasta ahora no existía. Cada sección llevaba su propia copia de los bloques
 * `IntranetTopbar` e `IntranetFooter` dentro de su contenido, así que editar el
 * menú en `/inicio` no tocaba el de `/tasa` y los cinco menús acabaron
 * divergiendo. Ahora se pintan una sola vez, aquí, con lo que guarda la página
 * `plantilla` (ver `features/paginas/lib/plantilla.ts`).
 *
 * El login y el editor quedan fuera a propósito: viven en `app/auth/` y
 * `app/editor/`, fuera de este grupo de rutas, y no deben llevar navegación.
 */
export default async function SeccionesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [plantilla, puedeEditar] = await Promise.all([obtenerPlantilla(), puedeEditarPaginas()]);

  return (
    <>
      {plantilla.topbar && <IntranetTopbarWrapper {...plantilla.topbar} />}

      {/* Crece para ocupar el hueco sobrante y dejar el pie abajo del todo. Antes
          lo resolvía cada página con `min-h-screen`, pero con el pie ya fuera del
          contenido eso obligaba a desplazarse siempre. */}
      <div className="intranet-contenido">{children}</div>

      {plantilla.conPie && <IntranetFooter />}

      <PlantillaEditButton hasPermission={puedeEditar} />
    </>
  );
}
