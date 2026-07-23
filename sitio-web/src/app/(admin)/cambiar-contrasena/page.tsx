'use client';

import { FirstLoginFlow } from '@/features/administracion/components/first-login-flow';

export default function CambiarContrasenaPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F3F3F3',
        padding: 24,
      }}
    >
      <FirstLoginFlow />
    </div>
  );
}
