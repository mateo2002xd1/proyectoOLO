import React from 'react';
import {
  MarcoSecciones,
  PaginasFabSpeedDial,
} from '@/features/gestor-secciones';
import {
  puedeCrearSecciones,
  puedeEditarPaginas,
  puedeEliminarSecciones,
} from '@/shared/lib/sesion';
import { VigilanteSesion } from '@/shared/lib/inactividad';

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
  // Las tres van juntas: `permisosDeLaSesion` está cacheada por petición, así que las
  // dos últimas comparten una sola llamada a la API.
  const [puedeEditar, puedeCrear, puedeEliminar] = await Promise.all([
    puedeEditarPaginas(),
    puedeCrearSecciones(),
    puedeEliminarSecciones(),
  ]);

  return (
    <MarcoSecciones>
      {children}
      <PaginasFabSpeedDial
        puedeEditar={puedeEditar}
        puedeCrear={puedeCrear}
        puedeEliminar={puedeEliminar}
      />
      {/* Cubre las cinco secciones de una vez. El editor y la vista previa cuelgan
          fuera de este grupo de rutas y montan el suyo. */}
      <VigilanteSesion />
    </MarcoSecciones>
  );
}
