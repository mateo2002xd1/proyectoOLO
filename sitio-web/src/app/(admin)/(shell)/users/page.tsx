import { Metadata } from 'next';
import UsuariosView from '@/features/administracion/components/usuarios-view';
import { getAuthUserProfile } from '@/shared/lib/session';

export const metadata: Metadata = {
  title: 'Usuarios | Panel Administrativo',
  description: 'Gestión de usuarios del panel administrativo',
};

export default async function UsuariosPage() {
  const userProfile = await getAuthUserProfile();

  return <UsuariosView />;
}
