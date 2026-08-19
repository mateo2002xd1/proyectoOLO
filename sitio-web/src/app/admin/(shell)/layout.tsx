import { PanelGeneralLayout } from '@/features/administracion/auth/components/panel-general';
import { getAuthUserProfile } from '@/shared/lib/session';
import { VigilanteSesion } from '@/shared/lib/inactividad';
import { poppins } from '@/shared/lib/fonts';

/**
 * El vigilante se monta aquí para cubrir de una vez dashboard, usuarios, revisión,
 * auditoría y mi-perfil. El editor y la vista previa cuelgan fuera de este grupo de
 * rutas (`app/admin/editor/`, `app/admin/preview/`) y montan el suyo.
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
