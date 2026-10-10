'use client';

import { useMemo, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { Button } from '@/shared/ui/atoms/button';
import {
  ACCIONES_DEL_PANEL,
  CONTRASTE_MINIMO,
  coloresDe,
  contraste,
  letraLegible,
  type AccionDelPanel,
  type ColoresDeAccion,
  type IdDeAccion,
  type IdentidadPanel,
} from '@/shared/lib/identidad-panel';
import { guardarColoresDeAcciones } from '../services/identidad-panel.service';

type Colores = Record<IdDeAccion, ColoresDeAccion>;

const GRUPOS: { grupo: AccionDelPanel['grupo']; titulo: string }[] = [
  { grupo: 'panel', titulo: 'En el panel' },
  { grupo: 'editor', titulo: 'En el editor' },
];

const coloresGuardados = (identidad: IdentidadPanel) =>
  Object.fromEntries(ACCIONES_DEL_PANEL.map(({ id }) => [id, coloresDe(identidad, id)])) as Colores;

const COLORES_DE_FABRICA = Object.fromEntries(
  ACCIONES_DEL_PANEL.map(({ id, fondo, texto }) => [id, { fondo, texto }])
) as Colores;

const iguales = (a: ColoresDeAccion, b: ColoresDeAccion) => a.fondo === b.fondo && a.texto === b.texto;

/**
 * El color de cada etiqueta de acción: un selector para el fondo y otro para la letra, con
 * la etiqueta tal como saldrá y su contraste. Los cambios no se aplican hasta «Guardar».
 */
export function ColoresDeAcciones({
  identidad,
  puedeEditar,
  onGuardado,
  onError,
}: {
  identidad: IdentidadPanel;
  puedeEditar: boolean;
  onGuardado: (nueva: IdentidadPanel) => void;
  onError: (error: unknown) => void;
}) {
  const guardados = useMemo(() => coloresGuardados(identidad), [identidad]);
  const [colores, setColores] = useState<Colores>(guardados);
  const [guardando, setGuardando] = useState(false);

  const hayCambios = ACCIONES_DEL_PANEL.some(({ id }) => !iguales(colores[id], guardados[id]));
  const sonLosDeFabrica = ACCIONES_DEL_PANEL.every(({ id }) => iguales(colores[id], COLORES_DE_FABRICA[id]));

  const cambiar = (id: IdDeAccion, campo: keyof ColoresDeAccion, valor: string) =>
    setColores((previos) => ({ ...previos, [id]: { ...previos[id], [campo]: valor.toLowerCase() } }));

  const guardar = async () => {
    setGuardando(true);
    try {
      // Solo las que difieren de fábrica: así, si un día cambia el color de fábrica, le
      // llega a quien nunca tocó el suyo.
      const propias = Object.fromEntries(
        ACCIONES_DEL_PANEL.filter(({ id }) => !iguales(colores[id], COLORES_DE_FABRICA[id])).map(({ id }) => [
          id,
          colores[id],
        ])
      );
      onGuardado(await guardarColoresDeAcciones(propias));
    } catch (error) {
      onError(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-[#001631] dark:text-[#f6f6f6]">Colores de las etiquetas de acción</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-[#94a3b8]">
        La etiqueta aparece al pasar el puntero o llegar con el teclado a cada botón. Para que se
        lea bien, la letra debe contrastar al menos {String(CONTRASTE_MINIMO).replace('.', ',')}:1
        con el fondo.
      </p>

      {GRUPOS.map(({ grupo, titulo }) => (
        <div key={grupo} className="mt-5">
          <h4 className="text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-[#b7c0d6]">{titulo}</h4>
          <ul className="mt-2 grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
            {ACCIONES_DEL_PANEL.filter((accion) => accion.grupo === grupo).map((accion) => (
              <FilaDeAccion
                key={accion.id}
                accion={accion}
                colores={colores[accion.id]}
                cambiada={!iguales(colores[accion.id], guardados[accion.id])}
                puedeEditar={puedeEditar && !guardando}
                onCambiar={(campo, valor) => cambiar(accion.id, campo, valor)}
              />
            ))}
          </ul>
        </div>
      ))}

      {puedeEditar && (
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            plain
            className="min-h-11"
            disabled={guardando || sonLosDeFabrica}
            onClick={() => setColores(COLORES_DE_FABRICA)}
          >
            Volver a los de fábrica
          </Button>
          <Button type="button" plain className="min-h-11" disabled={guardando || !hayCambios} onClick={() => setColores(guardados)}>
            Descartar cambios
          </Button>
          <Button type="button" className="min-h-11" disabled={guardando || !hayCambios} onClick={() => void guardar()}>
            {guardando ? 'Guardando…' : 'Guardar colores'}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Una acción: su etiqueta de muestra, los dos selectores y si se lee bien. */
function FilaDeAccion({
  accion,
  colores,
  cambiada,
  puedeEditar,
  onCambiar,
}: {
  accion: AccionDelPanel;
  colores: ColoresDeAccion;
  cambiada: boolean;
  puedeEditar: boolean;
  onCambiar: (campo: keyof ColoresDeAccion, valor: string) => void;
}) {
  const { nombre, dondeAparece, id } = accion;
  const relacion = contraste(colores.fondo, colores.texto);
  const legible = relacion >= CONTRASTE_MINIMO;
  const sugerida = letraLegible(colores.fondo);

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
        {/* La etiqueta tal como sale: la forma de `TOOLTIP_ENCIMA`, con estos colores. */}
        <span
          aria-hidden="true"
          className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.25)] ${
            id === 'rechazar' ? 'border border-current' : ''
          }`}
          style={{ backgroundColor: colores.fondo, color: colores.texto }}
        >
          {nombre}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <SelectorDeColor
          etiqueta="Fondo"
          nombreAccesible={`Color de fondo de la etiqueta «${nombre}»`}
          valor={colores.fondo}
          disabled={!puedeEditar}
          onCambiar={(valor) => onCambiar('fondo', valor)}
        />
        <SelectorDeColor
          etiqueta="Letra"
          nombreAccesible={`Color de la letra de la etiqueta «${nombre}»`}
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
