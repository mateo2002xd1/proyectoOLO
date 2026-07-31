import React from 'react';
import { notFound } from 'next/navigation';
import { EditButton, ClientPuckRender, obtenerPaginaPublicada } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/sesion';

export const metadata = {
  title: 'Tasa de Vinculación y Empleabilidad',
  description: 'Estadísticas de Tasa de Vinculación y Empleabilidad del SENA',
};

const SLUG = 'tasa';

/**
 * Página de Tasa, servida desde la base de datos.
 *
 * Antes era un componente fijo (`TasaView`) y cualquier cambio —el enlace de un
 * tablero de Power BI, la presentación, un texto— pasaba por tocar código y
 * desplegar. Ahora el contenido son bloques guardados en `paginas`, editables
 * desde `/editor/tasa` y con su ciclo de revisión y aprobación.
 *
 * El contenido inicial lo sembró `sembrar-pagina-tasa.ts` copiando la página tal
 * como estaba, así que la primera versión publicada es idéntica a la anterior.
 */
export default async function TasaPage() {
  const [pagina, hasPermission] = await Promise.all([
    obtenerPaginaPublicada(SLUG),
    puedeEditarPaginas(),
  ]);

  if (!pagina) notFound();

  // Sin `items-stretch` el contenido se encogería a su ancho natural: los bloques
  // de Puck no traen `w-full` propio como lo traía el `<main>` del componente fijo,
  // y un `items-center` los dejaría centrados en una columna estrecha.
  return (
    <div className="w-full bg-white flex flex-col items-stretch min-h-screen">
      <EditButton slug={SLUG} hasPermission={hasPermission} />
      <ClientPuckRender data={pagina.contenido} />
    </div>
  );
}
