import { SecurityQuestionsView } from '@/features/login';

export const metadata = {
  title: 'Preguntas de seguridad | Intranet',
  description: 'Configuración y verificación de preguntas de seguridad de la Intranet del Observatorio Laboral y Ocupacional SENA',
};

export default function SecurityQuestionsPage() {
  return <SecurityQuestionsView modo="elegir" />;
}
