import { FirstLoginFlow } from '@/features/admin-panel/auth';

export const metadata = {
  title: 'Configurar tu acceso | Observatorio Laboral y Ocupacional',
};

// A la cuenta solo le falta cambiar la temporal: ya tiene sus preguntas y un administrador
// le restableció la contraseña. La misma pantalla que `/login/first-login`, que solo pide la
// contraseña; cada caso lleva su dirección, como en la intranet (pedido del usuario, 2026-10-15).
export default function FirstLoginChangePasswordPage() {
  return <FirstLoginFlow modo="solo-contrasena" />;
}
