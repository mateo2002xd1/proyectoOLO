import { FirstLoginFlow } from '@/features/admin-panel/auth';

export const metadata = {
  title: 'Configurar tu acceso | Observatorio Laboral y Ocupacional',
};

// A la cuenta solo le faltan las preguntas (un administrador las restableció). La misma
// pantalla que `/login/first-login`, que salta directo a las preguntas; cada caso lleva su
// dirección, como en la intranet (pedido del usuario, 2026-10-15).
export default function FirstLoginSecurityQuestionsPage() {
  return <FirstLoginFlow modo="solo-preguntas" />;
}
