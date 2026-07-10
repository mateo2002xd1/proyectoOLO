import { PanelGeneralLayout } from '@/features/administracion/panel-general/components/panel-general';
import { getAuthUserProfile } from '@/lib/session';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const userProfile = await getAuthUserProfile();
  return <PanelGeneralLayout userProfile={userProfile}>{children}</PanelGeneralLayout>;
}
