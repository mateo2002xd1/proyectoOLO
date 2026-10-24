'use client';

import type { CSSProperties, KeyboardEvent, RefObject } from 'react';
import type { ColoresDeLaCapsula } from '../lib/colores';
import { LARGO_MAXIMO_DE_LA_BUSQUEDA } from '../lib/parametro-busqueda';
import { IconoLupa } from './icono-lupa';

export interface CampoBusquedaCapsulaProps {
  idDelCampo: string;
  valor: string;
  alCambiar: (valor: string) => void;
  /** Borra el texto. Escape también lo llama. */
  alBorrar: () => void;
  placeholder: string;
  /** Nombre del campo para lectores de pantalla (la etiqueta no se ve). */
  etiqueta: string;
  etiquetaDelBoton: string;
  etiquetaDeBorrar: string;
  colores: ColoresDeLaCapsula;
  deshabilitado?: boolean;
  /** `id` del texto de ayuda que describe el campo, si lo hay. */
  idDeLaAyuda?: string;
  referenciaDelCampo?: RefObject<HTMLInputElement | null>;
}

/**
 * La cápsula redonda con el campo, la «X» de borrar y la lupa que envía. La usan el
 * bloque del buscador y la barra de refinamiento de los resultados; el `<form>` que la
 * envuelve es de cada uno.
 *
 * Los colores del editor entran como variables CSS y valores de `style` ya validados
 * (`colorSeguro`), nunca dentro de una etiqueta `<style>`. El borde cambia con `hover:` y
 * `focus-within:`, sin estado de React: el anillo de foco funciona con CSS puro.
 */
export function CampoBusquedaCapsula({
  idDelCampo,
  valor,
  alCambiar,
  alBorrar,
  placeholder,
  etiqueta,
  etiquetaDelBoton,
  etiquetaDeBorrar,
  colores,
  deshabilitado = false,
  idDeLaAyuda,
  referenciaDelCampo,
}: CampoBusquedaCapsulaProps) {
  const hayTexto = valor.length > 0;

  const alPulsarTecla = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key !== 'Escape') return;
    evento.preventDefault();
    alBorrar();
  };

  const estiloDeLaCapsula = deshabilitado
    ? undefined
    : ({
        backgroundColor: colores.fondo,
        '--olo-capsula-borde': colores.borde,
        '--olo-capsula-borde-hover': colores.bordeHover,
        '--olo-capsula-placeholder': colores.placeholder,
      } as CSSProperties);

  return (
    <div
      style={estiloDeLaCapsula}
      className={`relative flex w-full items-center rounded-[12px] border shadow-sm transition-colors duration-200 ${
        deshabilitado
          ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-75'
          : 'border-[color:var(--olo-capsula-borde)] hover:border-[color:var(--olo-capsula-borde-hover)] focus-within:border-[color:var(--olo-capsula-borde-hover)] focus-within:ring-2 focus-within:ring-[color:var(--olo-capsula-borde-hover)]'
      }`}
    >
      <label htmlFor={idDelCampo} className="sr-only">
        {etiqueta}
      </label>
      <input
        ref={referenciaDelCampo}
        id={idDelCampo}
        type="search"
        value={valor}
        disabled={deshabilitado}
        onChange={(evento) => alCambiar(evento.target.value)}
        onKeyDown={alPulsarTecla}
        placeholder={placeholder}
        maxLength={LARGO_MAXIMO_DE_LA_BUSQUEDA}
        aria-describedby={idDeLaAyuda}
        autoComplete="off"
        style={deshabilitado ? undefined : { color: colores.texto }}
        className={`olo-sin-boton-limpiar h-12 w-full rounded-[12px] border-none bg-transparent pl-5 text-sm outline-none placeholder:text-[color:var(--olo-capsula-placeholder)]! placeholder:opacity-100 focus:outline-none focus:ring-0 sm:h-[50px] sm:text-[15px] ${
          hayTexto && !deshabilitado ? 'pr-24' : 'pr-16 sm:pr-14'
        } ${deshabilitado ? 'cursor-not-allowed' : ''}`}
      />

      {hayTexto && !deshabilitado && (
        <button
          type="button"
          onClick={alBorrar}
          aria-label={etiquetaDeBorrar}
          title="Borrar texto"
          style={{ color: colores.botonLimpiar }}
          className="absolute right-14 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:bg-gray-100/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus active:scale-95 sm:right-[3.25rem] sm:size-8"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      <button
        type="submit"
        disabled={deshabilitado}
        aria-label={etiquetaDelBoton}
        title="Buscar"
        style={deshabilitado ? undefined : { backgroundColor: colores.boton, color: colores.iconoBoton }}
        className={`absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus sm:size-[38px] ${
          deshabilitado
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'cursor-pointer shadow-sm hover:scale-105 hover:brightness-110 active:scale-95'
        }`}
      >
        <IconoLupa />
      </button>
    </div>
  );
}
