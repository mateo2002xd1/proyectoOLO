import { ResetPasswordView } from '@/features/login';

export const metadata = {
  title: 'Restablecer contraseña | Intranet',
  description: 'Restablecimiento de contraseña de la Intranet del Observatorio Laboral y Ocupacional SENA',
};

export default function ResetPasswordPage() {
  return <ResetPasswordView modo="recuperacion" />;
}
