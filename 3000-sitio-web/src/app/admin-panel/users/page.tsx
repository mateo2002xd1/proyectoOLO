import { Metadata } from 'next';
import UsuariosView from '@/features/admin-panel/auth/components/usuarios-view';

export const metadata: Metadata = {
  title: 'Usuarios | Panel Administrativo',
  description: 'Gestión de usuarios del panel administrativo',
};

export default function UsuariosPage() {
  return <UsuariosView />;
}
