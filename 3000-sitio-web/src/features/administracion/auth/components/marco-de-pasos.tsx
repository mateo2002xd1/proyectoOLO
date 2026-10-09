'use client';

import type { ReactNode } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { BackToSiteLink, PielAuth } from './auth-ui';

/**
 * Marco del diseño nuevo de las pantallas de acceso (mockups del usuario, 2026-10-09),
 * que estrenó el primer ingreso.
 *
 * - **Escritorio (`xl`)**: dos mitades azules. A la izquierda, sobre `#001631`, el logo,
 *   el título del paso, qué se pide y el paginador. A la derecha, sobre `#001a39` y con
 *   las esquinas izquierdas redondeadas, la tarjeta y el enlace de regreso.
 * - **Tablet y móvil**: una sola columna sobre `#001631`, sin logo: título, texto,
 *   paginador, tarjeta y enlace. El corte es `xl`, como en el resto del acceso
 *   (`AuthSplitShell`): la tablet grande en vertical (1032 px) va en una columna.
 *
 * El título es el `h1` de la página, en los dos diseños: es el mismo elemento, que solo
 * cambia de sitio.
 *
 * Pone la piel `pasos` (`PielAuth`): los campos, botones y el enlace de regreso que
 * haya dentro se pintan con ella sin que la pantalla lo pida.
 *
 * ## Tema claro (la recuperación de contraseña)
 *
 * Los mockups de tablet de la recuperación van sobre **blanco**, con el título, el texto
 * y el enlace de regreso en `#001631`; los del primer ingreso, sobre azul. `tema="claro"`
 * pinta así por debajo de `xl`. En el escritorio no hay mockup de la recuperación, así que
 * usa el mismo que el primer ingreso: las dos mitades azules, con el texto en blanco.
 */
export function MarcoDePasos({
  titulo,
  descripcion,
  pasos,
  tema = 'oscuro',
  children,
}: {
  titulo: ReactNode;
  /** Uno o varios párrafos. */
  descripcion?: string | string[];
  /** El paginador. Solo está diseñado sobre azul: con `tema="claro"` no se usa. */
  pasos?: PasosDelMarco;
  tema?: 'oscuro' | 'claro';
  /** La tarjeta (`authPasosCardClass`), o lo que haga sus veces. */
  children: ReactNode;
}) {
  const claro = tema === 'claro';
  const parrafos = descripcion === undefined ? [] : Array.isArray(descripcion) ? descripcion : [descripcion];

  return (
    <PielAuth.Provider value="pasos">
      <div
        className={`flex min-h-dvh w-full flex-col justify-center py-12 xl:flex-row xl:bg-[#001631] xl:py-0 ${
          claro ? 'bg-white' : 'bg-[#001631]'
        }`}
      >
        <section
          className={`flex flex-col items-center px-6 text-center xl:w-1/2 xl:shrink-0 xl:justify-center xl:py-12 xl:text-white ${
            claro ? 'text-[#001631]' : 'text-white'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logos/olo-logo-none.svg"
            alt="OLO Logo"
            className="mb-8 hidden w-[200px] xl:block"
          />
          {/* En el móvil el título parte en dos líneas, como en el mockup. `text-balance`
              reparte las líneas parejas («Recupera el acceso / a tu cuenta»). */}
          <h1 className="max-w-[300px] text-[32px] font-bold leading-tight text-balance md:max-w-[480px]">
            {titulo}
          </h1>
          {parrafos.length > 0 && (
            <div className="mt-8 max-w-[300px] space-y-6 text-lg leading-6 text-pretty md:max-w-[440px] xl:max-w-[400px]">
              {parrafos.map((texto) => (
                <p key={texto}>{texto}</p>
              ))}
            </div>
          )}
          {pasos && (
            <div className="@container mt-12 w-full md:mt-[72px]">
              <PaginadorDePasos {...pasos} />
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-col items-center px-6 md:mt-11 xl:mt-0 xl:flex-1 xl:justify-center xl:rounded-l-2xl xl:bg-[#001a39] xl:py-12">
          {children}
          <BackToSiteLink label="Regresar al sitio web del Observatorio" sobreBlanco={claro} className="mt-8 xl:mt-2" />
        </div>
      </div>
    </PielAuth.Provider>
  );
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
    'inline-flex h-8 items-center gap-2 rounded-md px-2 text-base text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-default disabled:text-white/50 disabled:hover:bg-transparent';
  const numero = 'flex size-8 items-center justify-center rounded-md text-base';

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
                <span aria-current="step" className={`${numero} bg-white text-[#001631]`}>
                  <span aria-hidden="true">{i + 1}</span>
                  <span className="sr-only">{etiqueta}</span>
                </span>
              ) : i < actual && volverA ? (
                <button
                  type="button"
                  onClick={() => volverA(i)}
                  aria-label={`Volver al ${etiqueta.charAt(0).toLowerCase()}${etiqueta.slice(1)}`}
                  className={`${numero} text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                >
                  {i + 1}
                </button>
              ) : (
                <span className={`${numero} text-white`}>
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
