import { PanelGeneralLayout } from '@/features/administracion/auth/components/panel-general';
import { getAuthUserProfile } from '@/shared/lib/session';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const userProfile = await getAuthUserProfile();
  return <PanelGeneralLayout userProfile={userProfile}>{children}</PanelGeneralLayout>;
}
