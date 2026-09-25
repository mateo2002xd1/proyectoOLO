import { PanelGeneralLayout } from '@/features/administracion/auth/components/panel-general';
import { getAuthUserProfile } from '@/shared/lib/session';
import { VigilanteSesion } from '@/shared/lib/inactividad';
import { poppins } from '@/shared/lib/fonts';

/**
 * El marco del panel: envuelve todo lo que cuelga de `app/admin/`. El vigilante se
 * monta aquí para cubrir de una vez dashboard, usuarios, roles, revisión, auditoría,
 * respaldos, actualizaciones y mi-perfil. Quedan fuera, en otras ramas del árbol:
 * las pantallas de acceso (`app/(auth)/`: `/login`, `/first-login`, `/recovery`...,
 * sin panel), y el editor y la vista previa (`app/editor/`, `app/preview/`), que
 * montan su propio vigilante.
 *
 * Poppins va en el `className` de este mismo wrapper — como `PanelGeneralLayout`
 * pinta la barra lateral, la superior (sesión, correo, cerrar sesión) y el
 * contenido de cada página, basta este único punto para que todo el panel quede
 * en Poppins, igual que el login.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const userProfile = await getAuthUserProfile();
  return (
    <PanelGeneralLayout userProfile={userProfile} className={poppins.className}>
      {children}
      <VigilanteSesion />
    </PanelGeneralLayout>
  );
}
