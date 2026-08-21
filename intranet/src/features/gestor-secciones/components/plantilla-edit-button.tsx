/**
 * Botón para editar la plantilla (la barra de navegación y el pie comunes).
 *
 * Va aparte del botón de editar la sección porque edita otra cosa: lo que se
 * cambie aquí se ve en las cinco secciones, no solo en la que se está mirando.
 * Se apila encima del de la sección y con un tono más apagado, para que se lea
 * como la acción secundaria que es.
 *
 * Es cliente solo para saber desde qué ruta se abrió y poder volver a ella al
 * salir del editor: `/menu-y-pie` no es una página que se pueda visitar.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { enlaceAlEditor } from '../lib/ruta-de-vuelta';
import { SLUG_PLANTILLA } from '../lib/plantilla';

export function PlantillaEditButton({ hasPermission }: { hasPermission: boolean }) {
  const rutaActual = usePathname();

  // Regla §0.11 — sin permiso no se pinta. La comprobación real es del servidor.
  if (!hasPermission) return null;

  return (
    <Link
      href={enlaceAlEditor(SLUG_PLANTILLA, rutaActual || '/inicio')}
      className="edit-button edit-button--plantilla"
      aria-label="Editar el menú y el pie de página de toda la intranet"
      title="Se aplica a todas las secciones"
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
      <span>Editar menú y pie</span>
    </Link>
  );
}
