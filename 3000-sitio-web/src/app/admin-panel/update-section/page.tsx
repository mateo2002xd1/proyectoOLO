import { Metadata } from 'next';
import { ActualizacionesView } from '@/features/admin-panel/update-section';
import { getAuthSessionSnapshot } from '@/shared/lib/session';

export const metadata: Metadata = {
  title: 'Actualizaciones',
  description: 'Carga de archivos que actualizan datos públicos del sitio',
};

const ROLES_QUE_ACTUALIZAN = ['superadmin', 'administrador'];

export default async function ActualizacionesPage() {
  const { role } = await getAuthSessionSnapshot();
  const puedeActualizar = ROLES_QUE_ACTUALIZAN.includes((role ?? '').trim().toLowerCase());

  return <ActualizacionesView puedeActualizar={puedeActualizar} />;
}
