import React from 'react';
import { MarcoSecciones, PlantillaEditButton } from '@/features/gestor-secciones';
import { puedeEditarPaginas } from '@/shared/lib/sesion';

/**
 * Marco común de las secciones de la intranet: menú arriba, pie abajo.
 *
 * Hasta ahora no existía. Cada sección llevaba su propia copia de los bloques
 * `IntranetTopbar` e `IntranetFooter` dentro de su contenido, así que editar el
 * menú en `/inicio` no tocaba el de `/tasa` y los cinco menús acabaron
 * divergiendo. Ahora se pintan una sola vez, en `MarcoSecciones`, con lo que
 * guarda la página `plantilla` (ver `features/gestor-secciones/lib/plantilla.ts`).
 *
 * El login, el editor y la vista previa quedan fuera a propósito: viven en
 * `app/login/`, `app/editor/` y `app/preview/`, fuera de este grupo de rutas. Los
 * dos primeros no deben llevar navegación; la vista previa sí, pero decide ella
 * cuándo —previsualizar la plantilla dentro del marco mostraría el menú y el pie
 * dos veces, el publicado fuera y el del borrador dentro.
 */
export default async function SeccionesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const puedeEditar = await puedeEditarPaginas();

  return (
    <MarcoSecciones>
      {children}
      <PlantillaEditButton hasPermission={puedeEditar} />
    </MarcoSecciones>
  );
}
