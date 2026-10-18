'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ALargeSmall,
  AudioLines,
  Bold,
  Circle,
  CircleDot,
  CirclePause,
  Contrast,
  Droplet,
  Eye,
  Heading,
  Link,
  MousePointer2,
  MoveHorizontal,
  RotateCcw,
  Ruler,
  Type,
  UnfoldVertical,
  X,
  type LucideIcon,
} from 'lucide-react';
import { poppins } from '@/shared/lib/fonts';
import { Switch } from '@/shared/ui/atoms/switch';
import { useCierreAnimado } from '@/shared/lib/use-cierre-animado';
import { FiguraAccesibilidad } from './icono-accesibilidad';
import {
  DALTONISMO_AL_ENCENDER,
  NIVELES,
  TIPOS_DE_DALTONISMO,
  type ConNiveles,
  type Interruptor,
  type PreferenciasAccesibilidad,
} from './preferencias';
import { leerEnVozAlta, vozAltaDisponible } from './use-lector-en-voz-alta';

export const ID_PANEL_ACCESIBILIDAD = 'olo-panel-accesibilidad';

/** Cómo se llama cada nivel; el `0` es el del sitio sin tocar. */
const NOMBRES_DE_NIVEL: Record<ConNiveles, readonly string[]> = {
  texto: ['Normal', 'Grande', 'Más grande', 'Máximo'],
  saturacion: ['Saturación', 'Saturación baja', 'Saturación alta', 'Sin color'],
  interlineado: ['Interlineado', 'Interlineado amplio', 'Interlineado más amplio', 'Interlineado máximo'],
  interletrado: ['Interletrado', 'Interletrado amplio', 'Interletrado más amplio', 'Interletrado máximo'],
  daltonismo: ['Sin corrección', ...TIPOS_DE_DALTONISMO.map((tipo) => tipo.nombre)],
};

/** Lo que se anuncia (y se lee en voz alta si el lector está encendido) al cambiar un nivel. */
const QUE_ES: Record<ConNiveles, string> = {
  texto: 'Tamaño del texto',
  saturacion: 'Color',
  interlineado: 'Espacio entre líneas',
  interletrado: 'Espacio entre letras',
  daltonismo: 'Daltonismo',
};

interface PanelAccesibilidadProps {
  abierto: boolean;
  preferencias: PreferenciasAccesibilidad;
  cambiar: (cambios: Partial<PreferenciasAccesibilidad>) => void;
  restablecer: () => void;
  alCerrar: () => void;
}

/**
 * El panel de accesibilidad del sitio público.
 *
 * No es un modal: no lleva el fondo borroso de los demás (`Alert`) ni atrapa el foco,
 * porque quien cambia el tamaño de la letra o el contraste necesita ver la página
 * cambiar detrás mientras elige. Se cierra con la X, con Escape o tocando fuera.
 */
export function PanelAccesibilidad({ abierto, preferencias, cambiar, restablecer, alCerrar }: PanelAccesibilidadProps) {
  const { montado, cerrando } = useCierreAnimado(abierto);
  const caja = useRef<HTMLElement>(null);
  const [anuncio, setAnuncio] = useState('');
  const conVoz = vozAltaDisponible();

  // Al abrir, el foco entra al panel para que el teclado siga desde aquí.
  useEffect(() => {
    if (abierto) caja.current?.focus();
  }, [abierto]);

  /** Lo dice el lector de pantalla del visitante (región viva) y, si lo encendió, el nuestro. */
  const anunciar = (texto: string, conLector = preferencias.lector) => {
    setAnuncio(texto);
    if (conLector) leerEnVozAlta(texto);
  };

  const alternar = (clave: Interruptor, nombre: string) => {
    const encendido = !preferencias[clave];
    cambiar({ [clave]: encendido });
    anunciar(`${nombre} ${encendido ? 'activado' : 'desactivado'}`, clave === 'lector' ? encendido : undefined);
  };

  const siguienteNivel = (clave: ConNiveles) => {
    const nivel = (preferencias[clave] + 1) % (NIVELES[clave] + 1);
    cambiar({ [clave]: nivel });
    anunciar(`${QUE_ES[clave]}: ${NOMBRES_DE_NIVEL[clave][nivel].toLowerCase()}`);
  };

  if (!montado) return null;

  const tarjetaNivel = (clave: ConNiveles, Icono: LucideIcon, barras: number = NIVELES[clave]) => {
    const nivel = preferencias[clave];
    // El tamaño del texto tiene cuatro barras y la primera es «Normal»; los demás, tres y
    // vacías mientras no se toquen (como en el diseño).
    const llenas = barras > NIVELES[clave] ? nivel + 1 : nivel;
    return (
      <Tarjeta
        activa={nivel > 0}
        etiqueta={NOMBRES_DE_NIVEL[clave][nivel]}
        descripcion={`${QUE_ES[clave]}: ${NOMBRES_DE_NIVEL[clave][nivel].toLowerCase()}. Pulsa para cambiar.`}
        Icono={Icono}
        onClick={() => siguienteNivel(clave)}
      >
        <span className="mt-1 flex w-full gap-1.5 px-2" aria-hidden="true">
          {Array.from({ length: barras }, (_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i < llenas ? 'bg-[#001631]' : 'bg-[#d6dae1]'}`} />
          ))}
        </span>
      </Tarjeta>
    );
  };

  const tarjetaInterruptor = (clave: Interruptor, nombre: string, Icono: LucideIcon, deshabilitada = false) => (
    <Tarjeta
      activa={preferencias[clave]}
      presionada={preferencias[clave]}
      etiqueta={nombre}
      descripcion={deshabilitada ? `${nombre}: tu navegador no puede leer en voz alta.` : undefined}
      Icono={Icono}
      deshabilitada={deshabilitada}
      onClick={() => alternar(clave, nombre)}
    />
  );

  const filaConInterruptor = (nombre: string, Icono: LucideIcon, encendido: boolean, alCambiar: () => void) => (
    // Toda la fila responde al clic para que el blanco no sea solo el interruptor, que es
    // pequeño; con teclado se usa el interruptor, que es el que tiene el rol y el nombre.
    <div
      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-[#d6dae1] p-1.5 pr-3 transition-colors hover:bg-[#f4f5f7]"
      onClick={alCambiar}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e4e7ec]" aria-hidden="true">
        <Icono size={18} strokeWidth={1.75} />
      </span>
      <span className="flex-1 text-sm">{nombre}</span>
      <span onClick={(evento) => evento.stopPropagation()}>
        <Switch checked={encendido} onChange={alCambiar} aria-label={nombre} />
      </span>
    </div>
  );

  const fila = (clave: Interruptor, nombre: string, Icono: LucideIcon) =>
    filaConInterruptor(nombre, Icono, preferencias[clave], () => alternar(clave, nombre));

  const daltonismo = preferencias.daltonismo;

  const alternarDaltonismo = () => {
    const tipo = daltonismo > 0 ? 0 : DALTONISMO_AL_ENCENDER;
    cambiar({ daltonismo: tipo });
    anunciar(tipo ? `Daltonismo activado: ${NOMBRES_DE_NIVEL.daltonismo[tipo].toLowerCase()}` : 'Daltonismo desactivado');
  };

  const elegirDaltonismo = (tipo: number) => {
    cambiar({ daltonismo: tipo });
    anunciar(`Daltonismo: ${NOMBRES_DE_NIVEL.daltonismo[tipo].toLowerCase()}`);
  };

  return (
    <div data-a11y-panel className="olo-a11y-capa">
      <section
        ref={caja}
        id={ID_PANEL_ACCESIBILIDAD}
        role="dialog"
        aria-labelledby="olo-panel-accesibilidad-titulo"
        tabIndex={-1}
        data-cerrando={cerrando || undefined}
        className={`olo-a11y-panel ${poppins.className}`}
      >
        <header className="mb-4 flex items-center gap-3 border-b border-[#e3e6eb] pb-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#001631] text-[#f1f1f1]">
            <FiguraAccesibilidad className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="olo-panel-accesibilidad-titulo" className="text-base font-semibold leading-tight">
              Accesibilidad
            </h2>
            <p className="text-sm text-[#3b4a5e]">Personaliza tu experiencia</p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar opciones de accesibilidad"
            className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#f1f3f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-2.5">
          {tarjetaInterruptor('lector', 'Lector de pantalla', AudioLines, !conVoz)}
          {tarjetaNivel('texto', ALargeSmall, NIVELES.texto + 1)}
          {tarjetaInterruptor('contraste', 'Alto contraste', Contrast)}
          {tarjetaNivel('saturacion', Droplet)}
          {tarjetaInterruptor('pausarAnimaciones', 'Pausar animación', CirclePause)}
          {tarjetaInterruptor('dislexia', 'Fuente dislexia', Type)}
          {tarjetaNivel('interlineado', UnfoldVertical)}
          {tarjetaNivel('interletrado', MoveHorizontal)}
        </div>

        <div className="mt-2.5">
          {filaConInterruptor('Daltonismo', Eye, daltonismo > 0, alternarDaltonismo)}

          {/* Los tipos se despliegan al encender el interruptor. Siempre montados, para que la
              altura se anime (`grid-template-rows` de 0fr a 1fr); `inert` los saca del
              teclado y del lector mientras están plegados. Son radios nativos: las flechas
              cambian de tipo sin código propio. */}
          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-out ${daltonismo > 0 ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            inert={daltonismo === 0}
          >
            <div className="overflow-hidden">
              {/* `p-1`: el contorno de foco y el anillo del elegido salen 4 px de la tarjeta y
                  el `overflow-hidden` de arriba los cortaría. */}
              <fieldset className="grid grid-cols-3 gap-2 p-1 pt-2">
                <legend className="sr-only">Tipo de daltonismo</legend>
                {TIPOS_DE_DALTONISMO.map(({ valor, nombre, ayuda }) => {
                  const elegido = daltonismo === valor;
                  const Marca = elegido ? CircleDot : Circle;
                  return (
                    <label
                      key={valor}
                      className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border px-1 py-3 text-center text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-focus ${
                        elegido
                          ? 'border-[#001631] bg-[#e4e7ec] font-semibold ring-1 ring-[#001631]'
                          : 'border-[#d6dae1] bg-white hover:bg-[#f4f5f7]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="olo-tipo-daltonismo"
                        value={valor}
                        checked={elegido}
                        onChange={() => elegirDaltonismo(valor)}
                        className="sr-only"
                      />
                      <span
                        className={`grid size-9 place-items-center rounded-xl ${elegido ? 'bg-[#001631] text-white' : 'bg-[#e4e7ec]'}`}
                        aria-hidden="true"
                      >
                        <Marca size={18} strokeWidth={2} />
                      </span>
                      <span className="leading-tight">{nombre}</span>
                      <span className="sr-only">, {ayuda}</span>
                    </label>
                  );
                })}
              </fieldset>
            </div>
          </div>
        </div>

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-[#5b6675]">Opciones avanzadas</h3>
        <div className="flex flex-col gap-2">
          {fila('titulos', 'Resaltar títulos', Heading)}
          {fila('enlaces', 'Resaltar enlaces', Link)}
          {fila('negrita', 'Texto en negrita', Bold)}
          {fila('guia', 'Guía de lectura', Ruler)}
          {fila('cursor', 'Cursor grande', MousePointer2)}
        </div>

        <button
          type="button"
          onClick={() => {
            restablecer();
            anunciar('Configuración de accesibilidad restablecida', false);
          }}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#001631] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0a2547] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus"
        >
          <RotateCcw size={18} aria-hidden="true" />
          Restablecer configuración
        </button>

        <p className="sr-only" aria-live="polite">
          {anuncio}
        </p>
      </section>
    </div>
  );
}

interface TarjetaProps {
  activa: boolean;
  /** Solo las que se encienden y se apagan: las de niveles dicen su estado en el nombre. */
  presionada?: boolean;
  etiqueta: string;
  /** Nombre accesible cuando la etiqueta visible no basta. */
  descripcion?: string;
  Icono: LucideIcon;
  deshabilitada?: boolean;
  onClick: () => void;
  children?: ReactNode;
}

function Tarjeta({ activa, presionada, etiqueta, descripcion, Icono, deshabilitada, onClick, children }: TarjetaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitada}
      aria-pressed={presionada}
      aria-label={descripcion}
      className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus disabled:cursor-not-allowed disabled:opacity-50 ${
        activa
          ? 'border-[#001631] bg-[#e4e7ec] font-semibold ring-1 ring-[#001631]'
          : 'border-[#d6dae1] bg-white hover:bg-[#f4f5f7]'
      }`}
    >
      <Icono size={20} strokeWidth={1.75} aria-hidden="true" />
      <span className="leading-tight">{etiqueta}</span>
      {children}
    </button>
  );
}
