import { ResetSuccessView } from '@/features/login';

// El aviso final del cambio obligatorio de contraseña: la misma vista que cierra la
// recuperación (`/login/recovery/reset-success`), con la dirección de este flujo.
export const metadata = {
  title: 'Contraseña actualizada | Intranet',
  description: 'Confirmación de actualización de contraseña de la Intranet del Observatorio Laboral y Ocupacional SENA',
};

export default function ChangeSuccessPage() {
  return <ResetSuccessView />;
}
