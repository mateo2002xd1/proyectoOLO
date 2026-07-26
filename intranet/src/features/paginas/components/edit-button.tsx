/**
 * EditButton — Botón lápiz para edición en contexto.
 *
 * Solo se renderiza si hasPermission = true.
 * La verificación REAL del permiso ocurre server-side en [slug]/page.tsx
 * antes de pasar la prop — este componente es solo UI (§0.11).
 *
 * Lleva al usuario a /editor/[slug] donde vive el editor Puck + Editor.js.
 *
 * @see 3-seguridad-del-proyecto.md §0.4 (autorización siempre server-side)
 * @see 1-guia-del-proyecto.md §4.3  (edit-button.tsx — botón lápiz)
 */

import Link from "next/link";
import type { EditButtonProps } from "../types/editor.types";

/**
 * Uso en [slug]/page.tsx:
 *
 * ```tsx
 * // 1. Verificar permiso en el Server Component (Fase 4-5)
 * const hasPermission = await verificarPermiso(session, "edit_post");
 *
 * // 2. Pasar la prop al botón — la verificación ya ocurrió en el servidor
 * <EditButton slug={slug} hasPermission={hasPermission} />
 * ```
 */
export function EditButton({ slug, hasPermission }: EditButtonProps) {
  // Regla §0.11 — si no tiene permiso, no renderizar nada
  // La verificación real fue server-side; esto es solo ocultamiento de UI
  if (!hasPermission) return null;

  return (
    <Link
      href={`/editor/${slug}`}
      className="edit-button"
      aria-label={`Editar página ${slug}`}
      title="Editar esta página"
    >
      {/* Ícono lápiz */}
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
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
      </svg>
      <span>Editar</span>
    </Link>
  );
}
