'use client';

import React, { useId, useRef, useState } from 'react';
import { useNavegacionBusqueda } from './hooks/use-navegacion-busqueda';

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

export interface BuscadorSitioBloqueProps {
  /** Identificador único inyectado por Puck para operaciones de estado */
  id?: string;
  /** Ruta relativa hacia la página de resultados creada a mano en el editor (ej. /buscador-general) */
  paginaResultados?: string;
  /** Texto indicativo dentro del campo */
  placeholder?: string;
  /** Texto de instrucción o ayuda visible debajo del campo */
  textoAyuda?: string;
  /** Ancho máximo del contenedor en pantalla */
  anchoMaximo?: 'max-w-xl' | 'max-w-3xl' | 'w-full';
  /** Si se encuentra renderizado en el editor visual de Puck */
  esEdicion?: boolean;
  /** Estado deshabilitado del campo */
  disabled?: boolean;
  // --- Colores personalizables ---
  /** Color de fondo de la cápsula de búsqueda */
  colorFondo?: string;
  /** Color del borde en reposo */
  colorBorde?: string;
  /** Color del borde y anillo activo al enfocar o pasar el cursor */
  colorBordeHover?: string;
  /** Color de la letra o texto escrito por el usuario */
  colorTexto?: string;
  /** Color del texto indicativo cuando el campo está vacío */
  colorPlaceholder?: string;
  /** Color de fondo del botón de búsqueda */
  colorBoton?: string;
  /** Color del icono de la lupa dentro del botón */
  colorIconoBoton?: string;
  /** Color del botón para borrar o limpiar el texto */
  colorBotonLimpiar?: string;
  /** Color del texto de instrucción o ayuda inferior */
  colorTextoAyuda?: string;
}

/**
 * Bloque Modular «Buscador del Sitio Web»
 * Diseñado conforme a las directrices de accesibilidad digital y diseño institucional GOV.CO:
 * - 4 estados visuales: Default, Active (botón "X" de borrado), Focus (anillo de alto contraste) y Disabled.
 * - Soporte 100% accesible para teclado (Enter, Escape, Tab) y lectores de pantalla.
 * - Desacoplado: redirige dinámicamente hacia la página de resultados elegida sin rutas quemadas.
 * - 100% personalizable en colores preservando la accesibilidad y la estructura original.
 */
export function BuscadorSitioBloque({
  id,
  paginaResultados = '/buscador-general',
  placeholder = 'Buscar en el sitio web...',
  textoAyuda = 'Escribe tu búsqueda y presiona Enter para buscar',
  anchoMaximo = 'max-w-3xl',
  esEdicion = false,
  disabled = false,
  colorFondo,
  colorBorde,
  colorBordeHover,
  colorTexto,
  colorPlaceholder,
  colorBoton,
  colorIconoBoton,
  colorBotonLimpiar,
  colorTextoAyuda,
}: BuscadorSitioBloqueProps) {
  const [termino, setTermino] = useState('');
  const [estaEnfocado, setEstaEnfocado] = useState(false);
  const [estaHover, setEstaHover] = useState(false);
  const [hoverBoton, setHoverBoton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();
  const inputId = `buscador-sitio-${uniqueId.replace(/:/g, '')}`;
  const ayudaId = `buscador-sitio-ayuda-${uniqueId.replace(/:/g, '')}`;

  const { ejecutarBusqueda, avisoEdicion } = useNavegacionBusqueda({
    paginaResultados,
    esEdicion,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    ejecutarBusqueda(termino);
  };

  const handleLimpiar = () => {
    setTermino('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleLimpiar();
    }
  };

  const hayTexto = termino.length > 0;

  // Valores de color resueltos con fallbacks seguros institucionales
  const bordeHoverEfectivo = colorBordeHover || '#7DB828';
  const bordeReposoEfectivo = colorBorde || '#d1d5db';
  const fondoEfectivo = colorFondo || '#ffffff';
  const textoEfectivo = colorTexto || '#111111';
  const placeholderEfectivo = colorPlaceholder || '#4b5563';
  const botonFondoEfectivo = colorBoton || '#001631';
  const botonIconoEfectivo = colorIconoBoton || '#ffffff';
  const botonLimpiarEfectivo = colorBotonLimpiar || '#667085';
  const textoAyudaEfectivo = colorTextoAyuda || '#667085';

  return (
    <section
      aria-label="Búsqueda en el sitio web"
      className={`relative w-full mx-auto px-4 sm:px-6 py-6 ${anchoMaximo}`}
    >
      {/* Estilos específicos para el placeholder del input */}
      <style>{`
        #${inputId}::placeholder {
          color: ${placeholderEfectivo} !important;
          opacity: 1;
        }
      `}</style>

      <form
        role="search"
        onSubmit={handleSubmit}
        className="relative w-full"
      >
        <label htmlFor={inputId} className="sr-only">
          Buscar en el sitio web
        </label>

        <div
          onMouseEnter={() => setEstaHover(true)}
          onMouseLeave={() => setEstaHover(false)}
          style={{
            backgroundColor: disabled ? undefined : fondoEfectivo,
            borderColor: disabled
              ? undefined
              : (estaEnfocado || estaHover)
              ? bordeHoverEfectivo
              : bordeReposoEfectivo,
            boxShadow: estaEnfocado
              ? `0 0 0 2px ${bordeHoverEfectivo}, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
              : undefined,
          }}
          className={`group relative flex items-center w-full rounded-[12px] transition-all duration-200 shadow-sm ${
            disabled
              ? 'bg-gray-100 border border-gray-200 cursor-not-allowed opacity-75'
              : estaEnfocado
              ? 'border shadow-md'
              : 'border'
          }`}
        >
          {/* Campo de búsqueda */}
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={termino}
            disabled={disabled}
            onChange={(e) => setTermino(e.target.value)}
            onFocus={() => setEstaEnfocado(true)}
            onBlur={() => setEstaEnfocado(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-describedby={textoAyuda ? ayudaId : undefined}
            autoComplete="off"
            style={{
              color: textoEfectivo,
            }}
            className={`olo-sin-boton-limpiar w-full h-12 sm:h-[50px] pl-5 ${
              hayTexto && !disabled ? 'pr-20 sm:pr-24' : 'pr-14'
            } text-sm sm:text-[15px] bg-transparent rounded-[12px] border-none outline-none focus:outline-none focus:ring-0 ${
              disabled ? 'cursor-not-allowed' : ''
            }`}
          />

          {/* Botón Borrar ("X") - Estado Active */}
          {hayTexto && !disabled && (
            <button
              type="button"
              onClick={handleLimpiar}
              aria-label="Borrar texto de búsqueda"
              title="Borrar texto"
              style={{
                color: botonLimpiarEfectivo,
              }}
              className="absolute right-12 sm:right-13 top-1/2 -translate-y-1/2 flex items-center justify-center size-7 sm:size-8 rounded-full hover:bg-gray-100/70 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB828]"
            >
              <svg
                className="w-4 h-4"
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

          {/* Botón Buscar Circular con Lupa - Estilo idéntico a CNO */}
          <button
            type="submit"
            disabled={disabled}
            aria-label="Buscar en el sitio web"
            title="Buscar"
            onMouseEnter={() => setHoverBoton(true)}
            onMouseLeave={() => setHoverBoton(false)}
            style={{
              backgroundColor: disabled ? undefined : botonFondoEfectivo,
              color: disabled ? undefined : botonIconoEfectivo,
              filter: hoverBoton && !disabled ? 'brightness(1.15)' : undefined,
            }}
            className={`absolute top-1/2 right-1.5 flex size-9 sm:size-[38px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#7DB828] focus-visible:outline-none ${
              disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95 shadow-sm'
            }`}
          >
            <span className="flex items-center justify-center transition-transform duration-200">
              <IconoLupa />
            </span>
          </button>
        </div>

        {/* Texto de instrucción o ayuda accesible */}
        {textoAyuda && (
          <p
            id={ayudaId}
            style={{
              color: textoAyudaEfectivo,
            }}
            className="mt-2 text-xs sm:text-sm pl-2 font-normal"
          >
            {textoAyuda}
          </p>
        )}

        {/* Notificación informativa en modo edición de Puck */}
        {avisoEdicion && (
          <div
            role="status"
            aria-live="polite"
            className="mt-3 p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm flex items-center space-x-2 animate-fadeIn"
          >
            <svg
              className="w-4 h-4 text-[#0943B5] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              <strong>Modo edición:</strong> La navegación está deshabilitada en el editor para proteger tu borrador. La búsqueda redirigirá hacia{' '}
              <code className="px-1 py-0.5 bg-white rounded border border-sky-200 text-[#0943B5] font-mono">
                {paginaResultados}?buscar=...
              </code>{' '}
              en el portal público.
            </span>
          </div>
        )}
      </form>
    </section>
  );
}
