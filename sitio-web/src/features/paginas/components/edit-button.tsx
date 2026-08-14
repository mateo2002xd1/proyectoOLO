/**
 * Botón para editar el contenido de la página que se está mirando.
 *
 * Es un componente de servidor: el permiso llega ya resuelto desde la página que
 * lo monta. Antes leía la cookie `role` en el navegador con `useSyncExternalStore`
 * pero **descartaba el resultado y se pintaba siempre**, así que cualquier
 * visitante veía un botón de editar que le llevaba a un login. Sin estado de
 * cliente ese fallo no puede volver: sin permiso no se pinta nada.
 *
 * La comprobación de verdad la hace el backend al guardar; esto solo decide si el
 * botón aparece.
 */
import Link from 'next/link';
import { enlaceAlEditor } from '../lib/ruta-de-vuelta';

interface EditButtonProps {
  /** Slug de la página a editar. La portada usa `inicio`, aunque viva en `/`. */
  slug: string;
  hasPermission: boolean;
  /** A dónde vuelve el editor al salir. */
  volverA: string;
}

export function EditButton({ slug, hasPermission, volverA }: EditButtonProps) {
  if (!hasPermission) return null;

  return (
    <Link
      href={enlaceAlEditor(slug, volverA)}
      className="edit-button"
      title="Editar esta página"
      aria-label="Editar esta página"
    >
      {/* Ícono de lápiz: se edita lo que hay debajo */}
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 25 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.474 3.607L21.389 7.522a.5.5 0 0 1 0 .707L11.91 17.6l-4.028.447a.5.5 0 0 1-.552-.552l.447-4.028L16.875 3.607a.5.5 0 0 1 .6 0ZM24.505 2.613L22.387.494a2.083 2.083 0 0 0-2.396 0L18.455 2.03a.5.5 0 0 0 0 .708l3.915 3.915a.5.5 0 0 0 .707 0l1.429-1.429a2.083 2.083 0 0 0 0-2.61ZM16.667 15.022V19.44H2.778V5.551h9.974a.5.5 0 0 0 .355-.148l1.736-1.736c.33-.33.096-.89-.442-.89H2.083A2.083 2.083 0 0 0 0 4.857v15.277c0 1.15.933 2.083 2.083 2.083h15.278c1.15 0 2.083-.933 2.083-2.083v-6.849c0-.464-.56-.694-.889-.364l-1.736 1.736a.5.5 0 0 0-.152.365Z"
          fill="currentColor"
        />
      </svg>
      <span>Editar</span>
    </Link>
  );
}

export default EditButton;
