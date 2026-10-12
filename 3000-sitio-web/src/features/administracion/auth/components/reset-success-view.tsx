'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authPasosCardClass, authPasosPrimaryClass } from './auth-ui';
import { MarcoDePasos } from './marco-de-pasos';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';

/**
 * Recuperación de contraseña (RF-05), paso 4 de 4: la confirmación.
 *
 * Solo se pinta si la contraseña se acaba de cambiar. Abierta a mano diría que se
 * actualizó algo que nadie tocó, así que en ese caso devuelve al principio.
 *
 * El botón va en el mismo formulario que el resto de pantallas, con sus medidas: en el
 * móvil, suelto bajo el texto como en el mockup; desde `md`, en la tarjeta, como el último
 * paso del primer ingreso (sin la marca de hecho, el check, desde el 2026-10-11). Hasta el 2026-10-09 medía 272 px en
 * el móvil y la tablet, distinto de los campos de las otras pantallas.
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
      titulo="¡Genial, tu clave ha sido actualizada con éxito!"
      descripcion={['Ya puedes ingresar a tu cuenta con tu nueva contraseña.', '¡Tu seguridad es nuestra prioridad!']}
    >
      <div className={`${authPasosCardClass} text-center`}>
        <Link href="/login" className={authPasosPrimaryClass}>
          Iniciar sesión
        </Link>
      </div>
    </MarcoDePasos>
  );
}
