'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authPasosCardClass, authPasosPrimaryClass } from './auth-ui';
import { DescripcionEnTarjeta, MarcoDePasos } from './marco-de-pasos';
import { useFlujoDeRecuperacion } from './flujo-de-recuperacion';

/** Texto del usuario. Desde la tablet va dentro de la tarjeta, encima del botón; en el móvil, bajo el título. */
const AVISO = ['Ya puedes ingresar a tu cuenta con tu nueva contraseña.', '¡Tu seguridad es nuestra prioridad!'];

/**
 * Recuperación de contraseña (RF-05), paso 4 de 4: la confirmación.
 *
 * Solo se pinta si la contraseña se acaba de cambiar. Abierta a mano diría que se
 * actualizó algo que nadie tocó, así que en ese caso devuelve al principio.
 *
 * El botón va en el mismo formulario que el resto de pantallas, con sus medidas: en el
 * móvil, suelto bajo el texto como en el mockup; desde `md`, en la tarjeta, debajo del
 * texto, como la confirmación del primer ingreso. Hasta el 2026-10-13 el texto iba bajo el
 * título también en la tablet y el escritorio, y la tarjeta llevaba encima del botón la
 * marca de hecho (un check); la quitó el usuario. Hasta el 2026-10-09 el botón medía
 * 272 px en el móvil y la tablet, distinto de los campos de las otras pantallas.
 */
export function ResetSuccessView() {
  const router = useRouter();
  const { recuperacion } = useFlujoDeRecuperacion();
  const terminada = recuperacion?.etapa === 'terminada';

  useEffect(() => {
    if (!terminada) router.replace('/login/recovery');
  }, [terminada, router]);

  if (!terminada) return null;

  return (
    <MarcoDePasos
      titulo="¡Genial, tu clave ha sido actualizada con éxito!"
      descripcion={AVISO}
      descripcionEnTarjeta
    >
      <div className={`${authPasosCardClass} text-center`}>
        <DescripcionEnTarjeta descripcion={AVISO} />
        <Link href="/login" className={authPasosPrimaryClass}>
          Iniciar sesión
        </Link>
      </div>
    </MarcoDePasos>
  );
}
