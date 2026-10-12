'use client';

import { useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { Button } from '@/shared/ui/atoms/button';
import { SeccionAcordeon } from '@/shared/ui/molecules/seccion-acordeon';
import {
  CONTRASTE_MINIMO,
  contraste,
  letraLegible,
  type ColoresDeAccion,
  type IdentidadPanel,
} from '@/shared/lib/identidad-panel';

/** Lo que tienen en común una etiqueta de acción (`acciones.ts`) y un tipo de botón (`botones.ts`). */
export interface ElementoConColor {
  id: string;
  nombre: string;
  dondeAparece: string;
  grupo: string;
  /** Colores de fábrica. */
  fondo: string;
  texto: string;
}

type Colores = Record<string, ColoresDeAccion>;

const iguales = (a: ColoresDeAccion, b: ColoresDeAccion) => a.fondo === b.fondo && a.texto === b.texto;

/**
 * Cómo se pinta la muestra de cada elemento: `etiqueta`, la forma de `TOOLTIP_ENCIMA`;
 * `boton`, la de `Button` fuera de un modal.
 */
const MUESTRA = {
  etiqueta: 'rounded-md px-2.5 py-1 text-xs shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
  boton: 'rounded-[16px] px-4 py-2 text-sm',
};

/**
 * Un bloque de colores de la identidad visual: los elementos de un catálogo, cada grupo en
 * un acordeón («En el panel», «En el editor»…), y en cada elemento su muestra, un selector
 * para el fondo y otro para la letra, y si se lee bien. Los cambios no se aplican hasta
 * «Guardar». Lo usan las etiquetas de acción y los botones (`identidad-visual-panel.tsx`).
 */
export function ColoresConfigurables({
  titulo,
  descripcion,
  catalogo,
  grupos,
  guardados,
  muestra,
  textoGuardar,
  puedeEditar,
  onGuardar,
  onGuardado,
  onError,
}: {
  titulo: string;
  descripcion: string;
  catalogo: readonly ElementoConColor[];
  /** El orden y el nombre de cada acordeón. */
  grupos: { grupo: string; titulo: string }[];
  /** Los colores con que sale hoy cada elemento (guardados o de fábrica), por id. */
  guardados: Colores;
  muestra: keyof typeof MUESTRA;
  textoGuardar: string;
  puedeEditar: boolean;
  /** Recibe solo los que difieren de fábrica. */
  onGuardar: (propios: Colores) => Promise<IdentidadPanel>;
  onGuardado: (nueva: IdentidadPanel) => void;
  onError: (error: unknown) => void;
}) {
  const [colores, setColores] = useState<Colores>(guardados);
  const [guardando, setGuardando] = useState(false);

  const deFabrica = (elemento: ElementoConColor) => ({ fondo: elemento.fondo, texto: elemento.texto });
  const sinGuardar = (elemento: ElementoConColor) => !iguales(colores[elemento.id], guardados[elemento.id]);
  const propio = (elemento: ElementoConColor) => !iguales(colores[elemento.id], deFabrica(elemento));

  const hayCambios = catalogo.some(sinGuardar);
  const sonLosDeFabrica = !catalogo.some(propio);

  const cambiar = (id: string, campo: keyof ColoresDeAccion, valor: string) =>
    setColores((previos) => ({ ...previos, [id]: { ...previos[id], [campo]: valor.toLowerCase() } }));

  const guardar = async () => {
    setGuardando(true);
    try {
      // Solo los que difieren de fábrica: así, si un día cambia el de fábrica, le llega a
      // quien nunca tocó el suyo.
      onGuardado(await onGuardar(Object.fromEntries(catalogo.filter(propio).map(({ id }) => [id, colores[id]]))));
    } catch (error) {
      onError(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg border border-gray-200 p-4 dark:border-[#2d3649]">
      <h3 className="text-base font-semibold text-[#001631] dark:text-[#f6f6f6]">{titulo}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-[#94a3b8]">
        {descripcion} Para que se lea bien, la letra debe contrastar al menos{' '}
        {String(CONTRASTE_MINIMO).replace('.', ',')}:1 con el fondo.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {grupos.map(({ grupo, titulo: tituloDelGrupo }) => {
          const elementos = catalogo.filter((elemento) => elemento.grupo === grupo);
          const pendientes = elementos.filter(sinGuardar).length;
          const propios = elementos.filter(propio).length;
          return (
            <SeccionAcordeon
              key={grupo}
              titulo={tituloDelGrupo}
              variante="anidada"
              nivel="h4"
              detalle={
                // Visible con el acordeón plegado: que no se olvide un cambio sin guardar.
                pendientes > 0 ? (
                  <span className="text-xs font-medium text-[#2a7d00] dark:text-[#9ad14a]">
                    {pendientes} sin guardar
                  </span>
                ) : propios > 0 ? (
                  <span className="text-xs text-gray-500 dark:text-[#94a3b8]">
                    {propios} de {elementos.length} con color propio
                  </span>
                ) : null
              }
            >
              <ul className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
                {elementos.map((elemento) => (
                  <FilaDeColor
                    key={elemento.id}
                    elemento={elemento}
                    colores={colores[elemento.id]}
                    muestra={muestra}
                    cambiada={sinGuardar(elemento)}
                    puedeEditar={puedeEditar && !guardando}
                    onCambiar={(campo, valor) => cambiar(elemento.id, campo, valor)}
                  />
                ))}
              </ul>
            </SeccionAcordeon>
          );
        })}
      </div>

      {puedeEditar && (
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            plain
            className="min-h-11"
            disabled={guardando || sonLosDeFabrica}
            onClick={() => setColores(Object.fromEntries(catalogo.map((elemento) => [elemento.id, deFabrica(elemento)])))}
          >
            Volver a los de fábrica
          </Button>
          <Button type="button" plain className="min-h-11" disabled={guardando || !hayCambios} onClick={() => setColores(guardados)}>
            Descartar cambios
          </Button>
          <Button type="button" className="min-h-11" disabled={guardando || !hayCambios} onClick={() => void guardar()}>
            {guardando ? 'Guardando…' : textoGuardar}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Un elemento: su muestra, los dos selectores y si se lee bien. */
function FilaDeColor({
  elemento,
  colores,
  muestra,
  cambiada,
  puedeEditar,
  onCambiar,
}: {
  elemento: ElementoConColor;
  colores: ColoresDeAccion;
  muestra: keyof typeof MUESTRA;
  cambiada: boolean;
  puedeEditar: boolean;
  onCambiar: (campo: keyof ColoresDeAccion, valor: string) => void;
}) {
  const { nombre, dondeAparece, id } = elemento;
  const relacion = contraste(colores.fondo, colores.texto);
  const legible = relacion >= CONTRASTE_MINIMO;
  const sugerida = letraLegible(colores.fondo);
  // Con borde los que lo llevan en el panel: «Rechazar» (del color de la letra) y los
  // botones secundarios (gris), que sin él se perderían sobre el fondo blanco.
  const borde =
    muestra === 'etiqueta' && id === 'rechazar'
      ? 'border border-current'
      : muestra === 'boton' && id.startsWith('secundario')
        ? 'border border-[#d0d5dd]'
        : '';

  return (
    <li
      className={`flex flex-col gap-3 rounded-lg border p-3 ${
        cambiada ? 'border-[#7db728] dark:border-[#7db828]' : 'border-gray-200 dark:border-[#2d3649]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#001631] dark:text-[#f6f6f6]">
            {nombre}
            {cambiada && <span className="ml-2 text-xs font-medium text-[#2a7d00] dark:text-[#9ad14a]">Sin guardar</span>}
          </p>
          <p className="text-xs text-gray-500 dark:text-[#94a3b8]">{dondeAparece}</p>
        </div>
        <span
          aria-hidden="true"
          className={`shrink-0 font-semibold whitespace-nowrap ${MUESTRA[muestra]} ${borde}`}
          style={{ backgroundColor: colores.fondo, color: colores.texto }}
        >
          {nombre}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <SelectorDeColor
          etiqueta="Fondo"
          nombreAccesible={`Color de fondo de «${nombre}»`}
          valor={colores.fondo}
          disabled={!puedeEditar}
          onCambiar={(valor) => onCambiar('fondo', valor)}
        />
        <SelectorDeColor
          etiqueta="Letra"
          nombreAccesible={`Color de la letra de «${nombre}»`}
          valor={colores.texto}
          disabled={!puedeEditar}
          onCambiar={(valor) => onCambiar('texto', valor)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {legible ? (
          <span className="inline-flex items-center gap-1 font-medium text-[#2a7d00] dark:text-[#9ad14a]">
            <CheckCircleIcon aria-hidden="true" className="size-4" />
            Se lee bien ({relacion.toFixed(1).replace('.', ',')}:1)
          </span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1 font-medium text-[#a15c00] dark:text-[#fbbf24]">
              <ExclamationTriangleIcon aria-hidden="true" className="size-4" />
              Poco contraste ({relacion.toFixed(1).replace('.', ',')}:1)
            </span>
            {puedeEditar && sugerida !== colores.texto && (
              <button
                type="button"
                onClick={() => onCambiar('texto', sugerida)}
                className="min-h-6 rounded font-semibold text-[#001631] underline underline-offset-2 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus dark:text-[#f6f6f6]"
              >
                Usar letra {sugerida === '#ffffff' ? 'blanca' : 'azul oscuro'}
              </button>
            )}
          </>
        )}
      </div>
    </li>
  );
}

/**
 * El selector nativo del navegador (`<input type="color">`): en el móvil abre el de
 * sistema y con teclado se usa como cualquier campo. 44 px, la medida táctil del panel.
 */
function SelectorDeColor({
  etiqueta,
  nombreAccesible,
  valor,
  disabled,
  onCambiar,
}: {
  etiqueta: string;
  nombreAccesible: string;
  valor: string;
  disabled: boolean;
  onCambiar: (valor: string) => void;
}) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <input
        type="color"
        value={valor}
        disabled={disabled}
        aria-label={nombreAccesible}
        onChange={(evento) => onCambiar(evento.target.value)}
        className="size-11 shrink-0 cursor-pointer appearance-none rounded-full border border-gray-300 bg-transparent p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus disabled:cursor-not-allowed dark:border-[#2d3649] [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
      />
      <span className="flex flex-col leading-tight">
        <span className="font-medium text-[#001631] dark:text-[#f6f6f6]">{etiqueta}</span>
        <code className="text-xs text-gray-500 uppercase dark:text-[#94a3b8]">{valor}</code>
      </span>
    </label>
  );
}
