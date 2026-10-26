import React from 'react';
import {
  PaginasFabSpeedDial,
  RastreadorVisitas,
} from '@/features/editor';
import { MarcoSecciones } from '@/features/editor/server';
import {
  obtenerSesion,
  puedeEditarPaginas,
} from '@/shared/lib/session/sesion';
import { VigilanteSesion } from '@/shared/lib/inactividad';
import { BotonSubir } from '@/shared/ui/atoms/boton-subir';

/**
 * Marco común de las secciones de la intranet: menú arriba, pie abajo.
 *
 * Hasta ahora no existía. Cada sección llevaba su propia copia de los bloques
 * `IntranetTopbar` e `IntranetFooter` dentro de su contenido, así que editar el
 * menú en `/inicio` no tocaba el de `/tasa` y los cinco menús acabaron
 * divergiendo. Ahora se pintan una sola vez, en `MarcoSecciones`, con lo que
 * guarda la página `plantilla` (ver `features/editor/navegation/menu-y-pie.ts`).
 *
 * El acceso, el editor y la vista previa quedan fuera a propósito: viven en
 * `app/(auth)/`, `app/edit/` y `app/preview/`, fuera de este grupo de rutas. Los
 * dos primeros no deben llevar navegación; la vista previa sí, pero decide ella
 * cuándo —previsualizar la plantilla dentro del marco mostraría el menú y el pie
 * dos veces, el publicado fuera y el del borrador dentro.
 */
export default async function SeccionesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sesion = await obtenerSesion();
  const rol = (sesion?.rol ?? "").trim().toLowerCase();
  const esSuperadmin = rol === "superadmin";
  const esAprobador = rol === "superadmin" || rol === "administrador";
  // Quien edita (superadmin, administrador, editor y sus roles hijos) cierra sesión
  // desde el botón flotante; dirección y subdirección, que no lo tienen, desde la barra.
  const cerrarSesionEnFlotante = await puedeEditarPaginas();

  return (
    <MarcoSecciones cerrarSesionEnFlotante={cerrarSesionEnFlotante}>
      {children}
      <PaginasFabSpeedDial
        esSuperadmin={esSuperadmin}
        esAprobador={esAprobador}
        conCerrarSesion={cerrarSesionEnFlotante}
      />
      <BotonSubir />
      <RastreadorVisitas ambito="intranet" />
      {/* Cubre las cinco secciones de una vez. El editor y la vista previa cuelgan
          fuera de este grupo de rutas y montan el suyo. */}
      <VigilanteSesion />
    </MarcoSecciones>
  );
}
