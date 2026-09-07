import { Metadata } from 'next';
import RolesView from '@/features/administracion/auth/components/roles-view';

export const metadata: Metadata = {
  title: 'Roles y Permisos | Panel Administrativo',
  description: 'Gestion de roles y permisos del panel administrativo',
};

export default function RolesPage() {
  return <RolesView />;
}
