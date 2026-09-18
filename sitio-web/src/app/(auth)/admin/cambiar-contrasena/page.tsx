import { AuthSplitShell } from '@/features/administracion/auth/components/auth-ui';
import { FirstLoginFlow } from '@/features/administracion/auth/components/first-login-flow';

export const metadata = {
  title: 'Configurar tu acceso | Observatorio Laboral y Ocupacional',
};

export default function CambiarContrasenaPage() {
  return (
    <AuthSplitShell>
      <FirstLoginFlow />
    </AuthSplitShell>
  );
}
