'use client';

import type { MouseEvent, ReactNode } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { BackToSiteLink } from './auth-ui';

/**
 * Marco de todas las pantallas de acceso: login, primer ingreso y recuperación de
 * contraseña (mockups del usuario, 2026-10-09).
 *
 * - **Móvil y tablet**: una sola columna sobre blanco, con el texto en `#001631`: título,
 *   qué se pide, paginador si lo hay, el formulario y el enlace de regreso. Sin logo,
 *   salvo en el login (`conLogo`). El corte es `xl`: la tablet grande en vertical
 *   (1032 px) va en una columna.
 * - **Escritorio (`xl`)**: dos mitades. A la izquierda, sobre blanco como en el móvil, el
 *   logo, el título, el texto y el paginador, en `#001631`. A la derecha, sobre `#001a39` y
 *   con las esquinas izquierdas redondeadas, la tarjeta y el enlace de regreso.
 *
 * Hasta el 2026-10-09 el primer ingreso iba sobre azul también en el móvil (`tema`
 * oscuro) y la recuperación sobre blanco. El usuario pidió el mismo estilo para todas, y
 * después la mitad izquierda del escritorio en blanco, donde va el logo (antes `#001631`
 * con el texto en blanco).
 *
 * ## Tamaños de letra
 *
 * Los de la escala tipográfica del usuario, en Poppins (`LetraDelPanel`):
 *
 * | Qué | Escala | Tamaño |
 * |---|---|---|
 * | Título (`h1`) | Heading 5 → Heading 4, Semibold | 20-24 px en el móvil, 30 desde `md` |
 * | Texto bajo el título | Body Large, Regular | 14-16 px en el móvil, 18 desde `md` |
 * | Encabezado del formulario | Headline, Medium | 18 px en el móvil, 20 desde `md` (`authPasosCardHeadingClass`) |
 * | Etiquetas, enlaces | Body | 14 px en el móvil, 16 desde `md` |
 * | Campos y botones | Body | 16 px |
 * | Errores y avisos | Footnote | 14 px |
 *
 * ## Sin scroll en el móvil (2026-10-10)
 *
 * El usuario pidió que en el teléfono todo quepa en el alto de la pantalla. Por debajo de
 * `md`, los rellenos, los huecos, el logo, el título y el texto se encogen con el alto visible
 * (`clamp()` con `dvh`): el máximo es el valor de antes, que es lo que se ve en un teléfono
 * alto; el mínimo, lo que deja caber el login y cada paso en 360 × 640 en reposo. Con el
 * teclado abierto el navegador hace scroll de todos modos. Los huecos del formulario son
 * `authPasosHuecoClass` y `authPasosHuecoArribaClass` (`auth-ui.tsx`).
 *
 * El título es el `h1` de la página en los dos diseños: es el mismo elemento, que solo
 * cambia de sitio.
 */
export function MarcoDePasos({
  titulo,
  descripcion,
  pasos,
  conLogo = false,
  cerrarSesionAlSalir = false,
  children,
}: {
  titulo: ReactNode;
  /** Uno o varios párrafos. */
  descripcion?: string | string[];
  /** El paginador del primer ingreso. */
  pasos?: PasosDelMarco;
  /**
   * El logo también por debajo de `xl`, encima del título. Solo el login: es la puerta de
   * entrada y la única pantalla del flujo que en el mockup de móvil lo lleva.
   */
  conLogo?: boolean;
  /**
   * «Regresar al sitio web» cierra antes la sesión. Para el primer ingreso: esa sesión
   * solo sirve para terminar la configuración (la API le niega lo demás), y si se
   * quedaba abierta el portal seguía mostrando la cuenta como conectada, con los
   * botones de edición a la vista y fallando al usarlos. Al volver a entrar con la
   * contraseña temporal, el primer ingreso aparece otra vez.
   */
  cerrarSesionAlSalir?: boolean;
  /** El formulario (`authPasosCardClass`), o lo que haga sus veces. */
  children: ReactNode;
}) {
  const parrafos = descripcion === undefined ? [] : Array.isArray(descripcion) ? descripcion : [descripcion];

  return (
    <div className="flex min-h-dvh w-full flex-col justify-center bg-white py-[clamp(0.75rem,3dvh,3rem)] md:py-12 xl:flex-row xl:py-0">
      <section className="flex flex-col items-center px-4 text-center text-[#001631] sm:px-6 xl:w-1/2 xl:shrink-0 xl:justify-center xl:py-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logos/olo-logo-none.svg"
          alt="OLO Logo"
          className={`mb-[clamp(0.75rem,2.5dvh,1.5rem)] w-[clamp(4rem,12dvh,7rem)] md:mb-6 md:w-32 xl:mb-8 xl:block xl:w-[200px] ${conLogo ? 'block' : 'hidden'}`}
        />
        {/* `text-balance` reparte las líneas parejas («Recupera el acceso / a tu cuenta»). */}
        <h1 className="max-w-[330px] text-[clamp(1.25rem,3.6dvh,1.5rem)] font-semibold leading-tight text-balance md:max-w-[480px] md:text-3xl">
          {titulo}
        </h1>
        {parrafos.length > 0 && (
          <div className="mt-[clamp(0.5rem,2dvh,1.5rem)] max-w-[330px] space-y-2 text-[clamp(0.875rem,2.35dvh,1rem)] leading-[1.45] text-pretty md:mt-8 md:max-w-[440px] md:space-y-6 md:text-lg md:leading-7 xl:max-w-[400px]">
            {parrafos.map((texto) => (
              <p key={texto}>{texto}</p>
            ))}
          </div>
        )}
        {pasos && (
          <div className="@container mt-[clamp(0.75rem,3dvh,2.5rem)] w-full md:mt-[72px]">
            <PaginadorDePasos {...pasos} />
          </div>
        )}
      </section>

      <div className="mt-[clamp(1rem,3.5dvh,2.5rem)] flex flex-col items-center px-4 sm:px-6 md:mt-11 xl:mt-0 xl:flex-1 xl:justify-center xl:rounded-l-[32px] xl:bg-[#001a39] xl:py-12">
        {children}
        {/* `contents`: la envoltura no existe para la maqueta, solo para el clic. Se
            captura antes que el del `Link`, que no navega si ya se le impidió. */}
        <div className="contents" onClickCapture={cerrarSesionAlSalir ? salirCerrandoSesion : undefined}>
          <BackToSiteLink label="Regresar al sitio web del Observatorio" className="mt-[clamp(0.5rem,2.5dvh,2rem)] md:mt-8 xl:mt-4" />
        </div>
      </div>
    </div>
  );
}

/** El enlace de regreso, pero cerrando antes la sesión. */
async function salirCerrandoSesion(evento: MouseEvent<HTMLDivElement>) {
  const enlace = (evento.target as HTMLElement).closest('a');
  if (!enlace) return;
  evento.preventDefault();
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // Sin conexión no se puede cerrar: se sale igual y el proxy volverá a pedir el
    // primer ingreso en cuanto se pida algo del panel.
  }
  window.location.href = enlace.href;
}

export interface PasosDelMarco {
  /** Nombre de cada paso, para el lector de pantalla («Paso 1 de 3: Contraseña»). */
  nombres: string[];
  /** Índice del paso en que se está, desde 0. */
  actual: number;
  /**
   * Volver a un paso anterior. Sin él, «Anterior» y los números de atrás no hacen nada:
   * es lo que pasa al terminar, cuando ya no hay nada que corregir.
   */
  volverA?: (indice: number) => void;
  /**
   * `id` del formulario del paso. «Siguiente» lo envía, así que hace lo mismo que el
   * botón principal de la tarjeta, con sus validaciones. Sin él, «Siguiente» se apaga.
   */
  formulario?: string;
}

/**
 * «← Anterior 1 2 3 Siguiente →», como en el mockup.
 *
 * - Hacia atrás se puede ir: el paso de la contraseña no se envía hasta el final, así
 *   que se puede corregir desde las preguntas.
 * - Hacia adelante, solo pasando por el formulario. Los números de los pasos que faltan
 *   no son botones: saltar un paso dejaría la cuenta a medias.
 * - En `#001631` sobre blanco, en todos los anchos.
 * - Por debajo de 384 px de ancho disponible (`@sm` del contenedor), «Anterior» y
 *   «Siguiente» se quedan en la flecha; el nombre lo da su `aria-label` en todos los
 *   anchos. Con las palabras en español, la fila no cabía a 360 px. Se mide el
 *   contenedor y no la pantalla, como pide `2-convenciones` §10.1.
 *
 *   No se usa `sr-only` + `@sm:not-sr-only`: `globals.css` define un `.sr-only` fuera
 *   de las capas de Tailwind, y una regla sin capa gana a cualquier utilidad, así que
 *   `not-sr-only` no hace nada en este sitio.
 */
function PaginadorDePasos({ nombres, actual, volverA, formulario }: PasosDelMarco) {
  const total = nombres.length;
  const puedeVolver = !!volverA && actual > 0;
  const flecha =
    'inline-flex h-8 items-center gap-2 rounded-full px-3 text-base text-[#001631] transition-colors hover:bg-[#001631]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001631] disabled:cursor-default disabled:text-[#001631]/40 disabled:hover:bg-transparent';
  const numero = 'flex size-8 items-center justify-center rounded-full text-base';

  return (
    <nav aria-label="Pasos para configurar tu cuenta" className="flex items-center justify-center gap-3 @sm:gap-5">
      <button type="button" aria-label="Anterior" className={flecha} disabled={!puedeVolver} onClick={() => volverA?.(actual - 1)}>
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        <span aria-hidden="true" className="hidden @sm:inline">Anterior</span>
      </button>

      <ol className="flex items-center gap-2.5">
        {nombres.map((nombre, i) => {
          const etiqueta = `Paso ${i + 1} de ${total}: ${nombre}`;
          return (
            <li key={nombre}>
              {i === actual ? (
                <span aria-current="step" className={`${numero} bg-[#001631] text-white`}>
                  <span aria-hidden="true">{i + 1}</span>
                  <span className="sr-only">{etiqueta}</span>
                </span>
              ) : i < actual && volverA ? (
                <button
                  type="button"
                  onClick={() => volverA(i)}
                  aria-label={`Volver al ${etiqueta.charAt(0).toLowerCase()}${etiqueta.slice(1)}`}
                  className={`${numero} text-[#001631] transition-colors hover:bg-[#001631]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001631]`}
                >
                  {i + 1}
                </button>
              ) : (
                <span className={`${numero} text-[#001631]`}>
                  <span aria-hidden="true">{i + 1}</span>
                  <span className="sr-only">{etiqueta}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <button type="submit" form={formulario} aria-label="Siguiente" className={flecha} disabled={!formulario}>
        <span aria-hidden="true" className="hidden @sm:inline">Siguiente</span>
        <ArrowRightIcon aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}
