import { FirstLoginFlow } from '@/features/administracion/auth';

export const metadata = {
  title: 'Configurar tu acceso | Observatorio Laboral y Ocupacional',
};

// Hasta el 2026-10-09 saludaba por el nombre de la cookie de sesión («Hola <nombre>,
// actualiza tu seguridad»); el diseño nuevo titula el paso sin saludo.
export default function FirstLoginPage() {
  return <FirstLoginFlow />;
}
