import { PanelGeneralLayout } from '@/features/administracion/auth/components/panel-general';
import { getAuthUserProfile } from '@/shared/lib/session';
import { VigilanteSesion } from '@/shared/lib/inactividad';

/**
 * El vigilante se monta aquí para cubrir de una vez dashboard, usuarios, revisión,
 * auditoría y mi-perfil. El editor y la vista previa cuelgan fuera de este grupo de
 * rutas (`app/admin/editor/`, `app/admin/preview/`) y montan el suyo.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const userProfile = await getAuthUserProfile();
  return (
    <PanelGeneralLayout userProfile={userProfile}>
      {children}
      <VigilanteSesion />
    </PanelGeneralLayout>
  );
}
