import { SecurityQuestionsView } from '@/features/login';

// Paso 2 de la recuperación: responder las preguntas que ya tiene la cuenta. La misma
// vista elige las preguntas en el primer ingreso (`/login/first-login/security-questions`);
// cada flujo lleva su propia dirección (pedido del usuario, 2026-10-15).
export const metadata = {
  title: 'Verifica tu identidad | Intranet',
  description: 'Verificación con preguntas de seguridad para recuperar la contraseña de la Intranet del Observatorio Laboral y Ocupacional SENA',
};

export default function RecoverySecurityQuestionsPage() {
  return <SecurityQuestionsView modo="responder" />;
}
