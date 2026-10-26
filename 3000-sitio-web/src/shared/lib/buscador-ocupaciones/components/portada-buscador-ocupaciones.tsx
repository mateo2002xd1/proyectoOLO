'use client';

import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { TituloRico } from '@/shared/lib/blocks/titulo-rico';

/** Azul del recuadro y del titular en el diseño de la portada. */
export const AZUL_PORTADA = '#001145';

function IconoLupa() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="m17.5 17.5-3.6-3.6m1.6-4.4a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface PortadaBuscadorOcupacionesProps {
  /** Titular de la sección («¿Sabes qué es una ocupación?»). */
  tituloSeccion?: ReactNode;
  /** Párrafo bajo el titular. */
  descripcion?: ReactNode;
  /** Texto del recuadro, sobre el buscador. */
  textoRecuadro?: ReactNode;
  placeholder?: string;
  /** Imagen de fondo de toda la sección. Decorativa: va como fondo CSS, sin `alt`. */
  imagenFondo?: string;
  /** Transparencia de la imagen de fondo, de 0 (opaca) a 100 (invisible). Vacío = 0. */
  transparenciaFondo?: number | '';
  /** Color del recuadro y del botón de buscar. Vacío = azul del diseño. */
  colorRecuadro?: string;
  onSearch?: (valor: string) => void;
}

/**
 * La sección «¿Sabes qué es una ocupación?» de la portada: titular, descripción y un
 * recuadro con el buscador, sobre una imagen de fondo.
 *
 * Solo presentación; la búsqueda y el modal los pone `HeroBuscadorOcupaciones`. No
 * reemplaza a `OcupacionSearchBanner`, que sigue en /clasificacion con su diseño.
 */
export function PortadaBuscadorOcupaciones({
  tituloSeccion,
  descripcion,
  textoRecuadro,
  placeholder = 'Buscar ocupación, código o denominación',
  imagenFondo,
  transparenciaFondo,
  colorRecuadro,
  onSearch,
}: PortadaBuscadorOcupacionesProps) {
  const idCampo = useId();
  const [valor, setValor] = useState('');
  const azul = colorRecuadro || AZUL_PORTADA;
  const transparencia = Math.min(100, Math.max(0, Number(transparenciaFondo) || 0));

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    onSearch?.(valor);
  }

  return (
    <section className="relative isolate w-full overflow-hidden bg-white">
      {/* La imagen va en su propia capa: la opacidad de un fondo CSS no se puede bajar
          sin bajar también el texto que lleva encima. */}
      {imagenFondo && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          // `JSON.stringify` deja la ruta entre comillas y con las comillas internas
          // escapadas, que es lo que pide `url()` de CSS.
          style={{
            backgroundImage: `url(${JSON.stringify(imagenFondo)})`,
            opacity: 1 - transparencia / 100,
          }}
        />
      )}
      <div className="mx-auto w-full max-w-[852px] px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        {tituloSeccion && (
          // `TituloRico` y no `<h2>`: el titular puede traer un H1–H6 de la barra de formato.
          <TituloRico
            className="text-[28px] leading-[1.2] font-normal sm:text-[36px] lg:text-[40px] [&_p]:m-0 [&_strong]:font-bold [&_b]:font-bold"
            style={{ color: AZUL_PORTADA }}
          >
            {tituloSeccion}
          </TituloRico>
        )}
        {descripcion && (
          <div className="mt-5 text-[17px] leading-[1.35] text-[#111111] sm:mt-8 sm:text-[20px] lg:text-[22px] [&_p]:m-0 [&_p+p]:mt-3 [&_ul+p]:mt-3 [&_ol+p]:mt-3">
            {descripcion}
          </div>
        )}

        <div
          className="mt-8 rounded-[16px] px-5 py-7 sm:mt-12 sm:px-10 sm:py-10 lg:px-[54px] lg:pt-12 lg:pb-11"
          style={{ backgroundColor: azul }}
        >
          {textoRecuadro && (
            <div className="text-[17px] leading-[1.3] text-white sm:text-[20px] lg:text-[22px] [&_em]:font-light [&_i]:font-light [&_p]:m-0 [&_p+p]:mt-2 [&_strong]:font-bold [&_b]:font-bold">
              {textoRecuadro}
            </div>
          )}

          <form onSubmit={enviar} className={`relative ${textoRecuadro ? 'mt-5 sm:mt-6' : ''}`}>
            <label htmlFor={idCampo} className="sr-only">
              {placeholder}
            </label>
            <input
              id={idCampo}
              type="search"
              value={valor}
              onChange={(evento) => setValor(evento.target.value)}
              placeholder={placeholder}
              className="olo-sin-boton-limpiar h-12 w-full rounded-[12px] bg-white pr-14 pl-4 text-sm text-[#111111] outline-none placeholder:text-[#4b5563] focus-visible:ring-2 focus-visible:ring-[#7DB828] sm:h-[50px] sm:text-[15px]"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7DB828] focus-visible:outline-none sm:size-[38px]"
              style={{ backgroundColor: azul }}
            >
              <IconoLupa />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
