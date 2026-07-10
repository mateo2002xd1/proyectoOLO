/**
 * Página de panel administrativo de la intranet.
 *
 * IMPORTANTE: Este panel NO duplica la UI de administración.
 * Solo muestra un enlace hacia el panel real en sitio-web-olo:3000/admin/panel.
 * La gestión de usuarios/roles/auditoría vive exclusivamente en el sitio-web-olo.
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §9.3 (panel/page.tsx — SOLO enlace hacia sitio-web-olo)
 * @see ARQUITECTURA_MAESTRA_OLO.md §14 (El panel interno vive solo en sitio-web-olo)
 */

// TODO: Fase 4-5 — Verificar que el usuario tiene rol Administrador antes de mostrar el enlace
const PANEL_ADMIN_URL =
  process.env.NEXT_PUBLIC_SITIO_WEB_URL ?? "http://localhost:3000";

export default function PanelAdminPage() {
  return (
    <div>
      <h1>Panel de Administración</h1>
      <p>
        La gestión de usuarios, roles, auditoría y revisión editorial se
        realiza desde el sitio web principal.
      </p>
      <a
        href={`${PANEL_ADMIN_URL}/admin/panel`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir panel de administración →
      </a>
    </div>
  );
}
