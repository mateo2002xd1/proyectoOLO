'use client';

import { FirstLoginFlow } from '@/features/administracion/auth/components/first-login-flow';
import { AuthPageShell } from '@/features/administracion/auth/components/auth-ui';

export default function CambiarContrasenaPage() {
  return (
    <AuthPageShell>
      <FirstLoginFlow />
    </AuthPageShell>
  );
}
