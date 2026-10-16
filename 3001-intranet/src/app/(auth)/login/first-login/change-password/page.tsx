import { ResetPasswordView } from '@/features/login';

// El cambio obligatorio de la contraseña temporal cuando la cuenta ya tiene sus preguntas
// (un administrador la restableció). Es la vista de la recuperación en otro modo;
// cada flujo lleva su propia dirección (pedido del usuario, 2026-10-15).
export const metadata = {
  title: 'Cambia tu contraseña | Intranet',
  description: 'Cambio de la contraseña temporal de la Intranet del Observatorio Laboral y Ocupacional SENA',
};

export default function ChangePasswordPage() {
  return <ResetPasswordView modo="cambio-obligatorio" />;
}
