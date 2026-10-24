'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { CampoBusquedaCapsula } from './components/campo-busqueda-capsula';
import { useNavegacionBusqueda } from './hooks/use-navegacion-busqueda';
import { colorSeguro, resolverColoresDeLaCapsula } from './lib/colores';
import { PARAM_BUSQUEDA_SITIO } from './lib/parametro-busqueda';

export interface BuscadorSitioBloqueProps {
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
 * Bloque «Buscador del Sitio Web»: un campo con lupa que lleva a la página de resultados.
 *
 * No tiene la ruta de resultados escrita en el código: la elige quien edita (y solo se
 * respeta si es una ruta de este mismo sitio, ver `useNavegacionBusqueda`). En el editor
 * no navega, para no perder el borrador. Los colores son del editor y entran ya validados
 * (`lib/colores.ts`).
 */
export function BuscadorSitioBloque({
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
  const campoRef = useRef<HTMLInputElement>(null);
  const idUnico = useId().replace(/:/g, '');
  const idDelCampo = `buscador-sitio-${idUnico}`;
  const idDeLaAyuda = `buscador-sitio-ayuda-${idUnico}`;

  const { ejecutarBusqueda, avisoEdicion } = useNavegacionBusqueda({ paginaResultados, esEdicion });

  const alEnviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (disabled) return;
    ejecutarBusqueda(termino);
  };

  const alBorrar = () => {
    setTermino('');
    campoRef.current?.focus();
  };

  const colores = resolverColoresDeLaCapsula({
    fondo: colorFondo,
    borde: colorBorde,
    bordeHover: colorBordeHover,
    texto: colorTexto,
    placeholder: colorPlaceholder,
    boton: colorBoton,
    iconoBoton: colorIconoBoton,
    botonLimpiar: colorBotonLimpiar,
  });

  return (
    <section aria-label="Búsqueda en el sitio web" className={`relative mx-auto w-full px-4 py-6 sm:px-6 ${anchoMaximo}`}>
      <form role="search" onSubmit={alEnviar} className="relative w-full">
        <CampoBusquedaCapsula
          idDelCampo={idDelCampo}
          valor={termino}
          alCambiar={setTermino}
          alBorrar={alBorrar}
          placeholder={placeholder}
          etiqueta="Buscar en el sitio web"
          etiquetaDelBoton="Buscar en el sitio web"
          etiquetaDeBorrar="Borrar texto de búsqueda"
          colores={colores}
          deshabilitado={disabled}
          idDeLaAyuda={textoAyuda ? idDeLaAyuda : undefined}
          referenciaDelCampo={campoRef}
        />

        {textoAyuda && (
          <p
            id={idDeLaAyuda}
            style={{ color: colorSeguro(colorTextoAyuda, '#667085') }}
            className="mt-2 pl-2 text-sm font-normal"
          >
            {textoAyuda}
          </p>
        )}

        {avisoEdicion && (
          <div
            role="status"
            aria-live="polite"
            className="mt-3 flex items-center space-x-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900 sm:text-sm"
          >
            <svg
              className="size-4 shrink-0 text-[#0943B5]"
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
              <strong>Modo edición:</strong> La navegación está deshabilitada en el editor para proteger tu borrador. La
              búsqueda redirigirá hacia{' '}
              <code className="rounded border border-sky-200 bg-white px-1 py-0.5 font-mono text-[#0943B5]">
                {paginaResultados}?{PARAM_BUSQUEDA_SITIO}=...
              </code>{' '}
              en el portal público.
            </span>
          </div>
        )}
      </form>
    </section>
  );
}
