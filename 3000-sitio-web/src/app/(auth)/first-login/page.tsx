import { FirstLoginFlow } from '@/features/administracion/auth';
import { getAuthSessionSnapshot } from '@/shared/lib/session';

export const metadata = {
  title: 'Configurar tu acceso | Observatorio Laboral y Ocupacional',
};

export default async function FirstLoginPage() {
  // El nombre sale de la cookie que deja el login, así que el saludo aguanta una
  // recarga. Cuando el login pintaba esta pantalla dentro de la suya se lo pasaba
  // directamente; en `/admin/cambiar-contrasena` no había saludo.
  const { name } = await getAuthSessionSnapshot();
  return <FirstLoginFlow name={name ?? undefined} />;
}
