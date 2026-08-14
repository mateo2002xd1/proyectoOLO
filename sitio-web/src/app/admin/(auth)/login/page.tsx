import { LoginView } from '@/features/administracion/auth';

export const metadata = {
  title: 'Iniciar sesión | Observatorio Laboral y Ocupacional',
  description: 'Acceso al panel de administración del Observatorio Laboral y Ocupacional SENA',
};

export default function LoginPage() {
  return <LoginView />;
}
