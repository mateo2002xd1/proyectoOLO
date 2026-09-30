'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCardTitle, AuthSuccessBadge, authNavyActionClass, authSolidCardClass } from './auth-ui';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';

/**
 * Recuperación de contraseña (RF-05), paso 4 de 4: la confirmación.
 *
 * Solo se pinta si la contraseña se acaba de cambiar. Abierta a mano diría que se
 * actualizó algo que nadie tocó, así que en ese caso devuelve al principio.
 */
export function ResetSuccessView() {
  const router = useRouter();
  const { recuperacion } = useFlujoDeRecuperacion();
  const terminada = recuperacion?.etapa === 'terminada';

  useEffect(() => {
    if (!terminada) router.replace('/recovery');
  }, [terminada, router]);

  if (!terminada) return null;

  return (
    <div className={`${authSolidCardClass} text-center`}>
      <AuthSuccessBadge />
      <AuthCardTitle
        className="mb-6"
        title="Tu contraseña se actualizó"
        description="Ya puedes entrar al panel con tu nueva contraseña."
      />
      <Link href="/login" className={authNavyActionClass}>
        Ir a iniciar sesión
      </Link>
    </div>
  );
}
