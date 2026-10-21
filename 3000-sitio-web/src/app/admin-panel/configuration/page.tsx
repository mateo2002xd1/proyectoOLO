import { Metadata } from 'next';
import { ConfiguracionView } from '@/features/admin-panel/configuration';
import { obtenerIdentidadPanel } from '@/shared/lib/identidad-panel/servidor';
import { getSessionPermissionsSnapshot } from '@/shared/lib/session/session';

export const metadata: Metadata = {
  title: 'Configuración - Observatorio Laboral y Ocupacional',
};

/**
 * La identidad sale de la misma lectura que ya hizo el layout del panel (`cache` de
 * React). El permiso decide solo qué se pinta: quien guarda es la API, que lo vuelve a
 * comprobar. `/api/me` le da a Superadmin el catálogo entero, así que no hace falta
 * mirar el rol aparte.
 */
export default async function ConfiguracionPage() {
  const [identidad, { permissions }] = await Promise.all([
    obtenerIdentidadPanel(),
    getSessionPermissionsSnapshot(),
  ]);
  return (
    <ConfiguracionView
      identidad={identidad}
      puedeEditarIdentidad={permissions.includes('configuracion.identidad')}
    />
  );
}
