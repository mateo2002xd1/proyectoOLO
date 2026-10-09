import { PanelGeneralLayout } from '@/features/administracion/auth/components/panel-general';
import { LetraDelPanel } from '@/features/administracion/auth/components/letra-del-panel';
import { getAuthUserProfile } from '@/shared/lib/session';
import { VigilanteSesion } from '@/shared/lib/inactividad';

/**
 * El marco del panel: envuelve todo lo que cuelga de `app/admin/`. El vigilante se
 * monta aquí para cubrir de una vez dashboard, usuarios, roles, revisión, auditoría,
 * respaldos, actualizaciones y mi-perfil. Quedan fuera, en otras ramas del árbol:
 * las pantallas de acceso (`app/(auth)/`: `/login`, `/first-login`, `/recovery`...,
 * sin panel), y el editor y la vista previa (`app/editor/`, `app/preview/`), que
 * montan su propio vigilante.
 *
 * `LetraDelPanel` deja todo el panel en Poppins, igual que las pantallas de acceso: la
 * barra lateral, la superior (sesión, correo, cerrar sesión), el contenido de cada
 * página y también los modales y avisos que salen por portal.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const userProfile = await getAuthUserProfile();
  return (
    <>
      <LetraDelPanel />
      <PanelGeneralLayout userProfile={userProfile}>
        {children}
        <VigilanteSesion />
      </PanelGeneralLayout>
    </>
  );
}
