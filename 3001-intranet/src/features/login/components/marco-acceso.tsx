'use client';

import type { ReactNode } from 'react';
import { ReturnToSiteLink } from '@/shared/ui/molecules/return-to-site-link';
import { accesoRegresoClass, accesoTarjetaClass } from './acceso-ui';

/**
 * Marco de todas las pantallas de acceso de la intranet: login, primer ingreso, recuperación
 * de contraseña y avisos de éxito.
 *
 * Es `MarcoDePasos` del sitio web (`3000-sitio-web/.../auth/components/marco-de-pasos.tsx`)
 * con los mismos anchos, rellenos y huecos, sobre el azul de la intranet en vez del blanco y
 * sin tarjeta blanca (pedido del usuario, 2026-10-11: «copia el mismo estilo de sitio web…
 * sin el fondo blanco sino el azul», «la misma simetría en sus márgenes y padding»). Hasta
 * entonces cada pantalla tenía su maqueta en `globals.css` (`.login-*`, `.fl-*`) con
 * medidas propias.
 *
 * - **Móvil y tablet**: una sola columna. Título, texto, paginador si lo hay, el formulario y
 *   el enlace de regreso. Sin logo, salvo en el login (`conLogo`).
 * - **Escritorio (`xl`)**: dos mitades. A la izquierda, sobre `#001631` y con las esquinas
 *   derechas redondeadas, el logo, el título, el texto y el paginador; a la derecha, sobre
 *   `#001A39`, el formulario y el enlace de regreso.
 *
 * Por debajo de `md` los huecos, el logo, el título y el texto se encogen con el alto visible
 * (`clamp()` con `dvh`), como en el sitio, para que cada paso quepa en 360 × 640 sin scroll.
 * El título es el `h1` de la página en los dos diseños.
 */
export function MarcoAcceso({
  titulo,
  descripcion,
  pasos,
  conLogo = false,
  claseTitulo = 'font-semibold',
  cerrarSesionAlSalir = false,
  claveTarjeta,
  claseTarjeta = '',
  antesDelFormulario,
  children,
}: {
  titulo: ReactNode;
  /** Uno o varios párrafos. */
  descripcion?: string | string[];
  /** El paginador del primer ingreso. */
  pasos?: ReactNode;
  /** El logo también por debajo de `xl`, encima del título. Solo el login, como en el sitio. */
  conLogo?: boolean;
  /** Peso del título; el login lo compone con dos pesos y pasa el suyo. */
  claseTitulo?: string;
  /** «Regresar al sitio web» cierra antes la sesión (pantallas con sesión a medias). */
  cerrarSesionAlSalir?: boolean;
  /** `key` del formulario: cambiarla lo monta de nuevo (cada pregunta de seguridad). */
  claveTarjeta?: string | number;
  claseTarjeta?: string;
  /** Lo que va encima del formulario (la insignia de los avisos de éxito). */
  antesDelFormulario?: ReactNode;
  children: ReactNode;
}) {
  const parrafos = descripcion === undefined ? [] : Array.isArray(descripcion) ? descripcion : [descripcion];

  return (
    <div className="flex min-h-dvh w-full flex-col justify-center bg-[#001A39] py-[clamp(0.75rem,3dvh,3rem)] md:py-12 xl:flex-row xl:py-0">
      <section className="flex flex-col items-center px-4 text-center text-white sm:px-6 xl:w-1/2 xl:shrink-0 xl:justify-center xl:rounded-r-[30px] xl:bg-[#001631] xl:py-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/svg/olo-logo-blanco.svg"
          alt="Logo intranet"
          className={`mb-[clamp(0.75rem,2.5dvh,1.5rem)] w-[clamp(4rem,12dvh,7rem)] md:mb-6 md:w-32 xl:mb-8 xl:block xl:w-[200px] ${conLogo ? 'block' : 'hidden'}`}
        />
        {/* `text-balance` reparte las líneas parejas. */}
        <h1 className={`max-w-[330px] text-[clamp(1.25rem,3.6dvh,1.5rem)] leading-tight text-balance md:max-w-[480px] md:text-3xl ${claseTitulo}`}>
          {titulo}
        </h1>
        {parrafos.length > 0 && (
          <div className="mt-[clamp(0.5rem,2dvh,1.5rem)] max-w-[330px] space-y-2 text-[clamp(0.875rem,2.35dvh,1rem)] leading-[1.45] text-pretty text-white/85 md:mt-8 md:max-w-[440px] md:space-y-6 md:text-lg md:leading-7 xl:max-w-[400px]">
            {parrafos.map((texto) => (
              <p key={texto}>{texto}</p>
            ))}
          </div>
        )}
        {pasos && <div className="@container mt-[clamp(0.75rem,3dvh,2.5rem)] w-full md:mt-[72px]">{pasos}</div>}
      </section>

      <div className="mt-[clamp(1rem,3.5dvh,2.5rem)] flex flex-col items-center px-4 sm:px-6 md:mt-11 xl:mt-0 xl:flex-1 xl:justify-center xl:py-12">
        <div key={claveTarjeta} className={`${accesoTarjetaClass} ${claseTarjeta}`}>
          {antesDelFormulario}
          {children}
        </div>
        <div className="mt-[clamp(0.5rem,2.5dvh,2rem)] text-center md:mt-8 xl:mt-4">
          <ReturnToSiteLink className={accesoRegresoClass} cerrarSesion={cerrarSesionAlSalir} />
        </div>
      </div>
    </div>
  );
}
