'use client';

import type { ReactNode } from 'react';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';
import {
  accesoDescripcionClass,
  accesoEncabezadoClass,
  accesoTarjetaClass,
  accesoTextoMarcoClass,
  accesoTituloMarcoClass,
} from './acceso-ui';

/**
 * Marco de las pantallas de la recuperación de contraseña y de los avisos de éxito.
 *
 * Copia el comportamiento del acceso al panel del sitio web (`MarcoDePasos`), pedido por el
 * usuario el 2026-10-11:
 *
 * - **Desde `xl`** (dos columnas), el título y el texto de cada paso van a la izquierda,
 *   bajo el logo, y la tarjeta queda solo con el formulario. Antes la izquierda decía
 *   «INTRANET» en todos los pasos.
 * - **Por debajo de `xl`** (móvil y tablet), como estaba: logo e «INTRANET» arriba, y el
 *   título y el texto dentro de la tarjeta.
 *
 * Los dos títulos están siempre en el HTML y cada corte oculta uno con `display: none`, así
 * que el lector de pantalla solo encuentra el que se ve. Colores y fondo, los de la intranet.
 *
 * En el móvil el logo, «INTRANET» y los huecos se encogen con el alto de la pantalla (`dvh`),
 * como en el sitio, para que cada paso quepa sin scroll en 360 × 640.
 */
export function MarcoAcceso({
  titulo,
  descripcion,
  cerrarSesionAlSalir = false,
  claveTarjeta,
  claseTarjeta = '',
  antesDelTitulo,
  children,
}: {
  titulo: string;
  /** Uno o varios párrafos. */
  descripcion?: string | string[];
  /** «Regresar al sitio web» cierra antes la sesión (pantallas con sesión a medias). */
  cerrarSesionAlSalir?: boolean;
  /** `key` de la tarjeta: cambiarla la monta de nuevo (cada pregunta de seguridad). */
  claveTarjeta?: string | number;
  claseTarjeta?: string;
  /** Lo que va en la tarjeta encima del título (la insignia de los avisos de éxito). */
  antesDelTitulo?: ReactNode;
  children: ReactNode;
}) {
  const parrafos = descripcion === undefined ? [] : Array.isArray(descripcion) ? descripcion : [descripcion];

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/svg/olo-logo-blanco.svg"
            alt="Logo intranet"
            className="mx-auto w-[clamp(4rem,11dvh,6rem)] sm:w-[150px] xl:mb-8 xl:w-[200px]"
          />
          <h1 className="mt-[clamp(0.5rem,2dvh,1.5rem)] text-[clamp(1.25rem,3.6dvh,1.5rem)] font-bold text-white sm:mt-6 sm:text-3xl xl:hidden">
            INTRANET
          </h1>
          <div className="hidden xl:block">
            <h1 className={accesoTituloMarcoClass}>{titulo}</h1>
            {parrafos.length > 0 && (
              <div className={accesoTextoMarcoClass}>
                {parrafos.map((texto) => (
                  <p key={texto}>{texto}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div key={claveTarjeta} className={`${accesoTarjetaClass} ${claseTarjeta}`}>
          {antesDelTitulo}
          <div className="mb-[clamp(0.75rem,2.2dvh,1.5rem)] md:mb-6 xl:hidden">
            <h2 className={accesoEncabezadoClass}>{titulo}</h2>
            {parrafos.map((texto) => (
              <p key={texto} className={accesoDescripcionClass}>
                {texto}
              </p>
            ))}
          </div>
          {children}
        </div>

        <ReturnToSiteLink classPrefix="login" cerrarSesion={cerrarSesionAlSalir} />
      </div>
    </div>
  );
}
