import { AuthPageShell } from '@/features/administracion/auth/components/auth-ui';
import { RecuperarPasswordFlow } from '@/features/administracion/auth/components/recuperar-password-flow';

export const metadata = {
  title: 'Recuperar acceso | Observatorio Laboral y Ocupacional',
};

export default function RecuperarPasswordPage() {
  return (
    <AuthPageShell>
      <RecuperarPasswordFlow />
    </AuthPageShell>
  );
}
