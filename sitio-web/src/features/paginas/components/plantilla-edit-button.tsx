/**
 * Botón para editar la plantilla (la cabecera y el pie comunes).
 *
 * Va aparte del botón de editar la página porque edita otra cosa: lo que se
 * cambie aquí se ve en todo el sitio, no solo en la página que se está mirando.
 * Se apila encima del de la página y con un tono más apagado, para que se lea
 * como la acción secundaria que es.
 *
 * Resuelve el permiso EN EL CLIENTE, y eso es deliberado. Lo monta el layout
 * público, así que si lo resolviera el servidor —leyendo la cookie con
 * `puedeEditarPaginas()`— Next tendría que renderizar bajo demanda todas las
 * páginas del sitio, incluidas las que no cambian nunca: medido, `/clasificacion`
 * y `/publicaciones` pasarían de estáticas con ISR de un minuto a dinámicas.
 * (`/politica-de-privacidad` sí es dinámica desde que pasó a ser una sección Puck
 * editable, igual que `inicio` — `/privacidad` ya no es una página, es un redirect.)
 * La cookie `role` es no-httpOnly justamente
 * para esto. El precio es que el botón aparece al hidratar y no en el HTML
 * inicial, que para un control de administración sobre una página pública es el
 * lado correcto del trato.
 *
 * Esto NO es un control de acceso: quien decide de verdad es el guard de
 * `/admin/editor/[slug]` y, en última instancia, el backend al guardar.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { enlaceAlEditor } from '../lib/ruta-de-vuelta';
import { SLUG_PLANTILLA } from '../lib/plantilla';
import { AUTH_ROLE_COOKIE_NAME } from '@/shared/lib/auth-cookies';

/** Mismos roles que `puedeEditarPaginas()` en `shared/lib/session.ts`. */
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor'];

function leerCookie(nombre: string): string | null {
  if (typeof document === 'undefined') return null;
  const coincidencia = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]*)'));
  return coincidencia ? decodeURIComponent(coincidencia[1]) : null;
}

/* La cookie es un sistema externo a React: se lee con `useSyncExternalStore` en
   vez de copiarla a un `useState` desde un efecto. No hay evento nativo de cambio
   de cookie, así que la suscripción no re-consulta; basta con leerla en cada
   render, que es cuando React pide el snapshot. */
function sinSuscripcion() {
  return () => {};
}

/* El nombre sale de `auth-cookies.ts` y no escrito a mano: cuando las cookies se
   prefijaron con `sitio_` para no compartir sesión con la intranet, esta lectura
   se quedó con el nombre viejo (`role`) y el botón desapareció para todo el
   mundo — sin fallar en ningún sitio, que es lo que lo hizo difícil de ver.
   Importando la constante, un renombrado futuro rompe la compilación en vez de
   apagar el botón en silencio. */
const leerPermiso = () =>
  ROLES_QUE_EDITAN.includes((leerCookie(AUTH_ROLE_COOKIE_NAME) ?? '').trim().toLowerCase());

/** En el servidor no hay `document`: sin botón, para que el HTML inicial coincida. */
const leerPermisoEnServidor = () => false;

export function PlantillaEditButton() {
  const rutaActual = usePathname();
  const puedeEditar = useSyncExternalStore(sinSuscripcion, leerPermiso, leerPermisoEnServidor);

  if (!puedeEditar) return null;

  return (
    <Link
      href={enlaceAlEditor(SLUG_PLANTILLA, rutaActual || '/')}
      className="edit-button edit-button--plantilla"
      aria-label="Editar el menú y el pie de página de todo el sitio"
      title="Se aplica a todas las páginas"
    >
      {/* Ícono de capas: lo que se edita está por encima de la página */}
      <svg
        viewBox="0 0 24 24"
        width={16}
        height={16}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
      <span>Menú y pie</span>
    </Link>
  );
}
