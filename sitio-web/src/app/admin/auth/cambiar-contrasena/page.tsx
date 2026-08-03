'use client';

import { FirstLoginFlow } from '@/features/administracion/components/first-login-flow';
import { AuthPageShell } from '@/features/administracion/components/auth-ui';

export default function CambiarContrasenaPage() {
  return (
    <AuthPageShell>
      <FirstLoginFlow />
    </AuthPageShell>
  );
}
