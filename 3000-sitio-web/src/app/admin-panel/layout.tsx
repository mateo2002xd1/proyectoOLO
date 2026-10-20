import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PanelGeneralLayout } from '@/features/admin-panel/auth/components/panel-general';
import { LetraDelPanel } from '@/features/admin-panel/auth/components/letra-del-panel';
import { getAuthUserProfile, tieneConfiguracionPendiente } from '@/shared/lib/session';
import { VigilanteSesion } from '@/shared/lib/inactividad';
import { EstilosDeIdentidad, metadataDeIdentidad, obtenerIdentidadPanel } from '@/shared/lib/identidad-panel/servidor';

/** El icono de la pestaña: el de Configuración → Identidad visual, o el de fábrica. */
export function generateMetadata(): Promise<Metadata> {
  return metadataDeIdentidad();
}

/**
 * El marco del panel: envuelve todo lo que cuelga de `app/admin/`. El vigilante se
 * monta aquí para cubrir de una vez dashboard, usuarios, roles, revisión, auditoría,
 * respaldos, actualizaciones y mi-perfil. Quedan fuera, en otras ramas del árbol:
 * las pantallas de acceso (`app/(auth)/`: `/login`, `/login/first-login`, `/login/recovery`...,
 * sin panel), y el editor y la vista previa (`app/editor/`, `app/preview/`), que
 * montan su propio vigilante.
 *
 * `LetraDelPanel` deja todo el panel en Poppins, igual que las pantallas de acceso: la
 * barra lateral, la superior (sesión, correo, cerrar sesión), el contenido de cada
 * página y también los modales y avisos que salen por portal.
 *
 * La identidad visual (Configuración) se lee aquí una vez por carga: el logo y el icono
 * van a la barra lateral y a la del móvil, y `EstilosDeIdentidad` escribe el color de las
 * etiquetas de acción. Al guardarla, Configuración hace `router.refresh()` y este layout
 * se vuelve a pintar con la nueva.
 *
 * Una cuenta con el primer ingreso pendiente según la base va a terminarlo antes de ver
 * el panel: la API le niega todo, y sin esto cada pantalla salía con «No pudimos
 * cargar…» y un «Reintentar» que no servía (ver `tieneConfiguracionPendiente`).
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const [userProfile, identidad, pendiente] = await Promise.all([
    getAuthUserProfile(),
    obtenerIdentidadPanel(),
    tieneConfiguracionPendiente(),
  ]);
  if (pendiente) redirect('/login/first-login');
  return (
    <>
      <LetraDelPanel />
      <EstilosDeIdentidad identidad={identidad} />
      <PanelGeneralLayout userProfile={userProfile} identidad={identidad}>
        {children}
        <VigilanteSesion />
      </PanelGeneralLayout>
    </>
  );
}
