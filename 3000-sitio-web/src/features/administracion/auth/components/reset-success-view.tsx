'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthSuccessBadge, authPasosPrimaryClass } from './auth-ui';
import { MarcoDePasos } from './marco-de-pasos';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';

/**
 * Recuperación de contraseña (RF-05), paso 4 de 4: la confirmación.
 *
 * Solo se pinta si la contraseña se acaba de cambiar. Abierta a mano diría que se
 * actualizó algo que nadie tocó, así que en ese caso devuelve al principio.
 *
 * Diseño nuevo desde el 2026-10-09 (mockup de tablet): sin tarjeta, el botón suelto
 * bajo el texto. En el escritorio el botón queda sobre el azul de la mitad derecha, y
 * el azul del botón no se distinguiría: ahí vuelve a ir dentro de una tarjeta, con la
 * marca de hecho, como el último paso del primer ingreso.
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
    <MarcoDePasos
      tema="claro"
      titulo="¡Genial, tu clave ha sido actualizada con éxito!"
      descripcion={['Ya puedes ingresar a tu cuenta con tu nueva contraseña.', '¡Tu seguridad es nuestra prioridad!']}
    >
      <div className="w-full max-w-[272px] xl:max-w-[320px] xl:rounded-md xl:border xl:border-[#d9d9d9] xl:bg-white xl:px-6 xl:py-10">
        <div className="hidden xl:block">
          <AuthSuccessBadge />
        </div>
        <Link href="/login" className={authPasosPrimaryClass}>
          Iniciar sesión
        </Link>
      </div>
    </MarcoDePasos>
  );
}
