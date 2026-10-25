'use client';

/**
 * Campos de Puck en acordeón: cada opción se pliega en su propia fila, con el
 * valor actual a la vista en la cabecera, y los controles llevan borde.
 *
 * Puck no ofrece acordeones por campo, así que estos se entregan como campos
 * `custom` que pintan sus propios controles. Por eso entienden solo los tipos
 * que hoy se usan en los paneles que los adoptaron —`select`, `radio`, `text`,
 * `textarea`, `number`, `medida` (número libre + unidad, para espaciados y anchos),
 * `color` (el selector de `ColorPickerField`) y `custom`—; un `custom` interior
 * se pinta con su propio `render`, sin etiqueta, porque la etiqueta ya la pone
 * la cabecera del acordeón.
 *
 * Los estilos van en línea, como en `ColorPickerField`: este paquete no tiene
 * hoja de estilos propia y Tailwind de cada app no lo recorre.
 *
 * - `campoEnAcordeon(campo)`: un campo suelto.
 * - `campoGrupoEnAcordeones(label, campos)`: un grupo cuyo valor es un objeto
 *   (como `caja`), con un acordeón por clave.
 * - `campoGrupoEnUnAcordeon(label, campos)`: lo mismo, pero todas las claves
 *   dentro de un solo acordeón (opciones que van juntas, como las de un botón).
 * - `campoListaEnAcordeones(label, campos, opciones)`: una lista de esos grupos,
 *   con un acordeón por elemento, subir/bajar/eliminar y un botón «+ Agregar».
 * - `campoObjetoEnAcordeon(label, objectFields)`: un campo `object` nativo de Puck
 *   —sirve para `richtext`, que estos controles no pintan— dentro del mismo
 *   acordeón. Necesita `ObjetoEnAcordeon` en `overrides.fieldTypes.object` del editor.
 */

import React, {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ColorPickerField } from './color-picker-field';
import { CLASE_CONTROL, CLASE_ENFOCABLE, COLOR_FOCO_CAMPO, EstilosDeCampos } from './estilos-de-campos';

// ─── Definiciones que entiende el acordeón ───────────────────────────────────
interface Opcion {
  label: string;
  value: any;
}

export type CampoDeAcordeon = (
  | {
      type: 'select';
      label: string;
      options: Opcion[];
      /** Valores que ya no se ofrecen; solo aparecen si el campo tiene uno guardado. */
      anteriores?: Opcion[];
    }
  | { type: 'radio'; label: string; options: Opcion[] }
  | { type: 'text'; label: string; placeholder?: string }
  | { type: 'textarea'; label: string; placeholder?: string }
  | {
      type: 'number';
      label: string;
      min?: number;
      max?: number;
      /** Unidad que se ve junto al número y en el resumen: «px». */
      sufijo?: string;
      placeholder?: string;
    }
  | {
      type: 'medida';
      label: string;
      /** Unidades que se pueden elegir; la primera es la de por defecto. */
      unidades: string[];
      /** Admite números negativos (separaciones que se solapan). */
      negativo?: boolean;
      placeholder?: string;
      /** Lo que dice el resumen cuando no hay valor: «Ninguno». */
      vacio?: string;
      /** Convierte un valor guardado con un formato anterior en una medida «2.5rem». */
      normalizar?: (valor: unknown) => string;
    }
  | { type: 'color'; label: string }
  | {
      type: 'custom';
      label: string;
      render: (props: { value: any; onChange: (valor: any) => void; [clave: string]: any }) => any;
    }
) & {
  /** Una línea bajo el control que dice para qué sirve o qué pasa si se deja vacío. */
  ayuda?: string;
};

export interface OpcionesDeAcordeon {
  /** Abre el acordeón al montar. Por defecto, cerrado. */
  abierto?: boolean;
  /** Texto corto de la cabecera; por defecto se deduce del valor. */
  resumen?: (valor: any) => string;
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const COLOR_BORDE = '#d1d5db';
/** El borde claro que enmarca un acordeón abierto en los paneles sin líneas. */
const COLOR_BORDE_ABIERTO = '#d9dde3';
const COLOR_TEXTO = '#333333';
const COLOR_SUAVE = '#6b7280';
const COLOR_ACENTO = COLOR_FOCO_CAMPO;
const FONDO_ACENTO = '#eef3fb';

const estiloControl: React.CSSProperties = {
  width: '100%',
  minHeight: '40px',
  padding: '8px 10px',
  border: `1px solid ${COLOR_BORDE}`,
  borderRadius: '8px',
  background: '#ffffff',
  color: COLOR_TEXTO,
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

/**
 * `true` cuando un acordeón de fuera ya pone el título del grupo (ver `campos-agrupados.tsx`):
 * el grupo no lo repite.
 */
export const TituloYaPuestoContext = createContext(false);

/**
 * `true` en los paneles que pintan sus acordeones sin líneas (el del botón, ver
 * `campos-agrupados.tsx`): sin borde alrededor ni raya entre la cabecera y el contenido.
 * Los controles de dentro conservan su borde.
 */
export const SinLineasContext = createContext(false);

// ─── Medidas libres ──────────────────────────────────────────────────────────
const MEDIDA = /^(-?(?:\d+\.?\d*|\.\d+))(rem|em|vw|vh|ch|px|%)$/;

/**
 * Parte una medida guardada («2.5rem») en número y unidad, o `null` si no es una.
 * Es también la lista blanca de unidades: lo que no encaja aquí no llega nunca a un
 * estilo (`estiloDeCaja` la usa).
 */
export function partirMedida(valor: unknown): { numero: number; unidad: string } | null {
  if (typeof valor !== 'string') return null;
  const m = MEDIDA.exec(valor.trim());
  if (!m) return null;
  const numero = Number(m[1]);
  return Number.isFinite(numero) ? { numero, unidad: m[2] } : null;
}

/** Lo tecleado como número, aceptando la coma decimal; `null` si aún no es un número entero o decimal completo. */
function numeroTecleado(texto: string): number | null {
  const limpio = texto.replace(',', '.');
  if (limpio === '' || limpio === '-' || limpio === '.' || limpio === '-.') return null;
  const numero = Number(limpio);
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Número libre + unidad, sin tope. Guarda la medida como texto («2.5rem»), que es lo
 * que el CSS usa tal cual; rem por defecto porque sigue al tamaño de letra y no se
 * descuadra al cambiar de pantalla. El texto tecleado se guarda aparte para no pisar
 * a medias lo que se escribe («2.» o «-»); si el valor cambia desde fuera (deshacer),
 * se vuelve a leer de él.
 */
function CampoMedida({
  campo,
  valor,
  onChange,
}: {
  campo: Extract<CampoDeAcordeon, { type: 'medida' }>;
  valor: any;
  onChange: (valor: any) => void;
}) {
  const actual = partirMedida(campo.normalizar ? campo.normalizar(valor) : valor);
  const [unidad, setUnidad] = useState(actual?.unidad ?? campo.unidades[0]);
  const [texto, setTexto] = useState(actual ? String(actual.numero) : '');

  useEffect(() => {
    if (!actual) {
      if (!valor) setTexto('');
      return;
    }
    setUnidad(actual.unidad);
    setTexto((t) => (numeroTecleado(t) === actual.numero ? t : String(actual.numero)));
    // Solo cuando cambia el valor guardado, no con cada letra tecleada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  const unidades = campo.unidades.includes(unidad) ? campo.unidades : [...campo.unidades, unidad];
  const guardar = (t: string, u: string) => {
    if (t === '') return onChange('');
    const numero = numeroTecleado(t);
    if (numero !== null) onChange(`${numero}${u}`);
  };
  const numero = numeroTecleado(texto);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={`${campo.label}: valor`}
        className={CLASE_CONTROL}
        value={texto}
        placeholder={campo.placeholder ?? '0'}
        onChange={(e) => {
          const t = e.target.value;
          if (!(campo.negativo ? /^-?\d*[.,]?\d*$/ : /^\d*[.,]?\d*$/).test(t)) return;
          setTexto(t);
          guardar(t, unidad);
        }}
        style={{ ...estiloControl, width: '7rem' }}
      />
      <select
        aria-label={`${campo.label}: unidad`}
        className={CLASE_CONTROL}
        value={unidad}
        onChange={(e) => {
          setUnidad(e.target.value);
          guardar(texto, e.target.value);
        }}
        style={{ ...estiloControl, width: 'auto', cursor: 'pointer' }}
      >
        {unidades.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      {numero !== null && (unidad === 'rem' || unidad === 'em') && (
        <span style={{ color: COLOR_SUAVE, fontSize: '12px' }}>≈ {Math.round(numero * 16 * 10) / 10} px</span>
      )}
    </div>
  );
}

/** La línea de ayuda bajo un control: pequeña y gris, una sola frase. */
export function AyudaDeCampo({ children }: { children: ReactNode }) {
  return <p style={{ margin: '8px 0 0', color: COLOR_SUAVE, fontSize: '12px', lineHeight: 1.45 }}>{children}</p>;
}

// ─── Acordeón ────────────────────────────────────────────────────────────────
export function AcordeonDeCampo({
  etiqueta,
  resumen,
  abiertoAlInicio = false,
  anidado = false,
  fondoCabecera,
  children,
}: {
  etiqueta: string;
  resumen?: ReactNode;
  abiertoAlInicio?: boolean;
  /** Su contenido son otros acordeones: sin relleno propio, para que queden a ras de su cabecera. */
  anidado?: boolean;
  /** Color de fondo de la cabecera (los acordeones padre lo llevan teñido). */
  fondoCabecera?: string;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoAlInicio);
  const idContenido = useId();
  const sinLineas = useContext(SinLineasContext);

  return (
    <div
      style={{
        // Sin líneas, el acordeón solo se enmarca cuando está abierto (borde claro con las esquinas
        // redondeadas, abajo también) para ver qué contiene; cerrado lleva el borde transparente
        // para que no salte al abrir.
        border: sinLineas ? `1px solid ${abierto ? COLOR_BORDE_ABIERTO : 'transparent'}` : `1px solid ${COLOR_BORDE}`,
        borderRadius: sinLineas ? '12px' : '8px',
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <EstilosDeCampos />
      <button
        type="button"
        className={CLASE_ENFOCABLE}
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={idContenido}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          minHeight: '44px',
          padding: '8px 12px',
          border: 0,
          background: fondoCabecera ?? (abierto ? '#f9fafb' : '#ffffff'),
          color: COLOR_TEXTO,
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 500,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{etiqueta}</span>
        {resumen != null && resumen !== '' && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '45%',
              minWidth: 0,
              color: COLOR_SUAVE,
              fontSize: '13px',
              fontWeight: 400,
            }}
          >
            {typeof resumen === 'string' ? (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumen}</span>
            ) : (
              resumen
            )}
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            color: COLOR_SUAVE,
            transform: abierto ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        id={idContenido}
        hidden={!abierto}
        style={{
          padding: anidado ? (sinLineas ? '4px 8px 8px' : '4px 0 0') : '12px',
          borderTop: sinLineas ? 0 : `1px solid ${COLOR_BORDE}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Controles con borde ─────────────────────────────────────────────────────
function OpcionesSegmentadas({
  etiqueta,
  opciones,
  valor,
  onChange,
}: {
  etiqueta: string;
  opciones: Opcion[];
  valor: any;
  onChange: (valor: any) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
    >
      {opciones.map((opcion) => {
        const elegida = opcion.value === valor;
        return (
          <button
            key={String(opcion.value)}
            type="button"
            role="radio"
            aria-checked={elegida}
            className={CLASE_ENFOCABLE}
            onClick={() => onChange(opcion.value)}
            style={{
              flex: '1 1 auto',
              minHeight: '40px',
              padding: '8px 14px',
              // Cada opción es un botón aparte, con su propio borde y esquina redondeada.
              border: `1px solid ${elegida ? COLOR_ACENTO : COLOR_BORDE}`,
              borderRadius: '12px',
              background: elegida ? FONDO_ACENTO : '#ffffff',
              // El borde azul de la elegida se refuerza por dentro, sin mover a las vecinas.
              boxShadow: elegida ? `inset 0 0 0 1px ${COLOR_ACENTO}` : 'none',
              color: elegida ? COLOR_ACENTO : COLOR_TEXTO,
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: elegida ? 500 : 400,
              cursor: 'pointer',
            }}
          >
            {opcion.label}
          </button>
        );
      })}
    </div>
  );
}

function ControlDeCampo({
  campo,
  valor,
  onChange,
  props,
}: {
  campo: CampoDeAcordeon;
  valor: any;
  onChange: (valor: any) => void;
  props?: Record<string, any>;
}) {
  switch (campo.type) {
    case 'select': {
      const anterior = campo.options.some((o) => o.value === valor)
        ? undefined
        : campo.anteriores?.find((o) => o.value === valor);
      const opciones = anterior ? [...campo.options, anterior] : campo.options;
      return (
        <select
          aria-label={campo.label}
          className={CLASE_CONTROL}
          value={valor ?? ''}
          onChange={(e) => {
            const elegida = opciones.find((o) => String(o.value) === e.target.value);
            onChange(elegida ? elegida.value : e.target.value);
          }}
          style={{ ...estiloControl, cursor: 'pointer' }}
        >
          {opciones.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    case 'radio':
      return (
        <OpcionesSegmentadas etiqueta={campo.label} opciones={campo.options} valor={valor} onChange={onChange} />
      );
    case 'text':
      return (
        <input
          type="text"
          aria-label={campo.label}
          className={CLASE_CONTROL}
          value={valor ?? ''}
          placeholder={campo.placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={estiloControl}
        />
      );
    case 'textarea':
      return (
        <textarea
          aria-label={campo.label}
          className={CLASE_CONTROL}
          value={valor ?? ''}
          placeholder={campo.placeholder}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...estiloControl, resize: 'vertical', lineHeight: 1.45 }}
        />
      );
    case 'number':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            inputMode="numeric"
            aria-label={campo.label}
            className={CLASE_CONTROL}
            value={valor ?? ''}
            min={campo.min}
            max={campo.max}
            step={1}
            placeholder={campo.placeholder}
            onChange={(e) => {
              // Vacío se guarda vacío («sin valor»); un número fuera de rango se recorta.
              if (e.target.value === '') return onChange('');
              let numero = Number(e.target.value);
              if (!Number.isFinite(numero)) return;
              if (campo.min !== undefined) numero = Math.max(campo.min, numero);
              if (campo.max !== undefined) numero = Math.min(campo.max, numero);
              onChange(numero);
            }}
            style={{ ...estiloControl, width: '7rem' }}
          />
          {campo.sufijo && <span style={{ color: COLOR_SUAVE, fontSize: '13px' }}>{campo.sufijo}</span>}
        </div>
      );
    case 'medida':
      return <CampoMedida campo={campo} valor={valor} onChange={onChange} />;
    case 'color':
      return <ColorPickerField value={valor} onChange={onChange} />;
    case 'custom':
      return campo.render({ ...props, value: valor, onChange });
  }
}

function resumenPorDefecto(campo: CampoDeAcordeon, valor: any): ReactNode {
  if (campo.type === 'select' || campo.type === 'radio') {
    const anteriores = campo.type === 'select' ? (campo.anteriores ?? []) : [];
    return [...campo.options, ...anteriores].find((o) => o.value === valor)?.label ?? '';
  }
  if (campo.type === 'text' || campo.type === 'textarea') return typeof valor === 'string' ? valor : '';
  if (campo.type === 'number') return typeof valor === 'number' ? `${valor}${campo.sufijo ? ' ' + campo.sufijo : ''}` : '';
  if (campo.type === 'medida') {
    const medida = partirMedida(campo.normalizar ? campo.normalizar(valor) : valor);
    return medida ? `${medida.numero} ${medida.unidad}` : (campo.vacio ?? '');
  }
  if (campo.type === 'color') {
    if (!valor) return 'Por defecto';
    return (
      <>
        <span
          aria-hidden="true"
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '4px',
            border: `1px solid ${COLOR_BORDE}`,
            background: valor,
            flexShrink: 0,
          }}
        />
        {valor}
      </>
    );
  }
  return '';
}

function FilaDeAcordeon({
  campo,
  valor,
  onChange,
  opciones = {},
  props,
}: {
  campo: CampoDeAcordeon;
  valor: any;
  onChange: (valor: any) => void;
  opciones?: OpcionesDeAcordeon;
  props?: Record<string, any>;
}) {
  return (
    <AcordeonDeCampo
      etiqueta={campo.label}
      resumen={opciones.resumen ? opciones.resumen(valor) : resumenPorDefecto(campo, valor)}
      abiertoAlInicio={opciones.abierto}
    >
      <ControlDeCampo campo={campo} valor={valor} onChange={onChange} props={props} />
      {campo.ayuda && <AyudaDeCampo>{campo.ayuda}</AyudaDeCampo>}
    </AcordeonDeCampo>
  );
}

// ─── Fábricas de campos de Puck ──────────────────────────────────────────────
/** Un campo suelto dentro de su acordeón: `imagenAlt: campoEnAcordeon({ type: 'text', label: '…' })`. */
export function campoEnAcordeon(campo: CampoDeAcordeon, opciones: OpcionesDeAcordeon = {}) {
  return {
    type: 'custom' as const,
    /** Ya se pinta como acordeón: `CamposAgrupados` no lo vuelve a envolver. */
    enAcordeon: true,
    label: campo.label,
    render: ({ value, onChange, ...props }: { value: any; onChange: (v: any) => void; [clave: string]: any }) => (
      <FilaDeAcordeon campo={campo} valor={value} onChange={onChange} opciones={opciones} props={props} />
    ),
  };
}

function GrupoEnAcordeones({
  label,
  campos,
  value,
  onChange,
}: {
  label: string;
  campos: Record<string, CampoDeAcordeon>;
  value?: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}) {
  const tituloYaPuesto = useContext(TituloYaPuestoContext);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {!tituloYaPuesto && <span style={{ fontSize: '14px', fontWeight: 600, color: COLOR_TEXTO }}>{label}</span>}
      {Object.entries(campos).map(([clave, campo]) => (
        <FilaDeAcordeon
          key={clave}
          campo={campo}
          valor={value?.[clave]}
          onChange={(v) => onChange({ ...(value ?? {}), [clave]: v })}
        />
      ))}
    </div>
  );
}

/** Un grupo con valor objeto (como `caja`), un acordeón por clave bajo un título. */
export function campoGrupoEnAcordeones(label: string, campos: Record<string, CampoDeAcordeon>) {
  return {
    type: 'custom' as const,
    /** Ya se pinta como acordeón: `CamposAgrupados` no lo vuelve a envolver. */
    enAcordeon: true,
    label,
    campos,
    render: ({ value, onChange }: { value?: Record<string, any>; onChange: (v: Record<string, any>) => void }) => (
      <GrupoEnAcordeones label={label} campos={campos} value={value} onChange={onChange} />
    ),
  };
}

/** Los controles de un grupo, uno debajo de otro con su etiqueta y su ayuda. */
function ControlesDeGrupo({
  campos,
  value,
  onChange,
}: {
  campos: Record<string, CampoDeAcordeon>;
  value?: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {Object.entries(campos).map(([clave, campo]) => (
        <div key={clave}>
          <span style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: COLOR_TEXTO }}>
            {campo.label}
          </span>
          <ControlDeCampo
            campo={campo}
            valor={value?.[clave]}
            onChange={(v) => onChange({ ...(value ?? {}), [clave]: v })}
          />
          {campo.ayuda && (
            <p style={{ margin: '6px 0 0', color: COLOR_SUAVE, fontSize: '12px', lineHeight: 1.45 }}>{campo.ayuda}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Un grupo con valor objeto con todas sus claves dentro de un solo acordeón. */
export function campoGrupoEnUnAcordeon(
  label: string,
  campos: Record<string, CampoDeAcordeon>,
  opciones: { abierto?: boolean; resumen?: (valor: Record<string, any> | undefined) => ReactNode } = {}
) {
  return {
    type: 'custom' as const,
    /** Ya se pinta como acordeón: `CamposAgrupados` no lo vuelve a envolver. */
    enAcordeon: true,
    label,
    campos,
    render: ({ value, onChange }: { value?: Record<string, any>; onChange: (v: Record<string, any>) => void }) => (
      <AcordeonDeCampo etiqueta={label} resumen={opciones.resumen?.(value)} abiertoAlInicio={opciones.abierto}>
        <ControlesDeGrupo campos={campos} value={value} onChange={onChange} />
      </AcordeonDeCampo>
    ),
  };
}

// ─── Lista ───────────────────────────────────────────────────────────────────
export interface OpcionesDeLista {
  /** Nombre de un elemento, para la cabecera y el botón de agregar: «Tarjeta». */
  elemento: string;
  /** Valores de un elemento recién agregado. */
  nuevo: Record<string, any>;
  /** Texto corto de la cabecera de cada elemento. */
  resumen?: (item: Record<string, any>) => ReactNode;
  /** Línea bajo el título de la lista. */
  ayuda?: string;
}

const estiloBotonPequeno: React.CSSProperties = {
  minHeight: '36px',
  padding: '6px 10px',
  border: `1px solid ${COLOR_BORDE}`,
  borderRadius: '8px',
  background: '#ffffff',
  color: COLOR_TEXTO,
  fontFamily: 'inherit',
  fontSize: '13px',
  cursor: 'pointer',
};

/* Un componente de verdad y no la función `render` suelta: necesita estado para
   abrir el elemento recién agregado. Cada elemento lleva un `id` propio para que
   su acordeón no cambie de contenido al borrar o mover otro. */
function ListaEnAcordeones({
  label,
  campos,
  opciones,
  value,
  onChange,
}: {
  label: string;
  campos: Record<string, CampoDeAcordeon>;
  opciones: OpcionesDeLista;
  value?: Record<string, any>[];
  onChange: (v: Record<string, any>[]) => void;
}) {
  const lista = Array.isArray(value) ? value : [];
  const [recienAgregado, setRecienAgregado] = useState<string | null>(null);

  const cambiar = (i: number, item: Record<string, any>) => onChange(lista.map((x, j) => (j === i ? item : x)));
  const mover = (i: number, paso: -1 | 1) => {
    const copia = [...lista];
    [copia[i], copia[i + paso]] = [copia[i + paso], copia[i]];
    onChange(copia);
  };
  const agregar = () => {
    const id = Math.random().toString(36).slice(2, 10);
    setRecienAgregado(id);
    onChange([...lista, { ...opciones.nuevo, id }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '14px', fontWeight: 600, color: COLOR_TEXTO }}>{label}</span>
      {opciones.ayuda && (
        <p style={{ margin: 0, color: COLOR_SUAVE, fontSize: '12px', lineHeight: 1.45 }}>{opciones.ayuda}</p>
      )}
      {lista.length === 0 && (
        <p style={{ margin: 0, color: COLOR_SUAVE, fontSize: '13px' }}>Todavía está vacía.</p>
      )}
      {lista.map((item, i) => (
        <AcordeonDeCampo
          key={item.id ?? i}
          etiqueta={`${opciones.elemento} ${i + 1}`}
          resumen={opciones.resumen?.(item)}
          abiertoAlInicio={item.id != null && item.id === recienAgregado}
        >
          <ControlesDeGrupo campos={campos} value={item} onChange={(v) => cambiar(i, v)} />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: `1px solid ${COLOR_BORDE}`,
            }}
          >
            <button
              type="button"
              className={CLASE_ENFOCABLE}
              style={{ ...estiloBotonPequeno, opacity: i === 0 ? 0.45 : 1 }}
              disabled={i === 0}
              onClick={() => mover(i, -1)}
            >
              ↑ Subir
            </button>
            <button
              type="button"
              className={CLASE_ENFOCABLE}
              style={{ ...estiloBotonPequeno, opacity: i === lista.length - 1 ? 0.45 : 1 }}
              disabled={i === lista.length - 1}
              onClick={() => mover(i, 1)}
            >
              ↓ Bajar
            </button>
            <button
              type="button"
              className={CLASE_ENFOCABLE}
              style={{ ...estiloBotonPequeno, marginLeft: 'auto', borderColor: '#fecaca', color: '#b91c1c' }}
              onClick={() => onChange(lista.filter((_, j) => j !== i))}
            >
              Eliminar
            </button>
          </div>
        </AcordeonDeCampo>
      ))}
      <button
        type="button"
        className={CLASE_ENFOCABLE}
        onClick={agregar}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          minHeight: '44px',
          border: `1px dashed ${COLOR_ACENTO}`,
          borderRadius: '8px',
          background: FONDO_ACENTO,
          color: COLOR_ACENTO,
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
        Agregar {opciones.elemento.toLowerCase()}
      </button>
    </div>
  );
}

/** Una lista de elementos con valor objeto: un acordeón por elemento y un botón «+ Agregar». */
export function campoListaEnAcordeones(label: string, campos: Record<string, CampoDeAcordeon>, opciones: OpcionesDeLista) {
  return {
    type: 'custom' as const,
    /** Ya se pinta como acordeón: `CamposAgrupados` no lo vuelve a envolver. */
    enAcordeon: true,
    label,
    campos,
    render: ({ value, onChange }: { value?: Record<string, any>[]; onChange: (v: Record<string, any>[]) => void }) => (
      <ListaEnAcordeones label={label} campos={campos} opciones={opciones} value={value} onChange={onChange} />
    ),
  };
}

// ─── Campo `object` de Puck en acordeón ───────────────────────────────────────
/** Etiqueta que no pinta nada: el título ya lo pone la cabecera del acordeón. */
function EtiquetaTransparente({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

/**
 * Un campo `object` de Puck con sus subcampos nativos, dentro de un acordeón.
 *
 * Existe por `richtext`: su editor y su edición en el lienzo son de Puck, y un campo
 * `custom` no los puede pintar ni Puck convierte su valor a nodos al pintar el bloque.
 * Un `object` sí (Puck recorre `objectFields`). La marca `metadata.oloAcordeon` la
 * lee `ObjetoEnAcordeon`, que el editor pone en `overrides.fieldTypes.object`; sin
 * ese reemplazo el campo se ve como un `object` normal, sin plegar.
 */
export function campoObjetoEnAcordeon<T extends Record<string, unknown>>(
  label: string,
  objectFields: T,
  opciones: Pick<OpcionesDeAcordeon, 'abierto'> = {}
) {
  return {
    type: 'object' as const,
    label,
    objectFields,
    metadata: { oloAcordeon: { abierto: opciones.abierto ?? false } },
  };
}

/**
 * Reemplazo de `overrides.fieldTypes.object`: los campos marcados por
 * `campoObjetoEnAcordeon` se pliegan en un `AcordeonDeCampo`; los demás `object`
 * se pintan igual que siempre. `children` es el `ObjectField` de Puck: se le cambia
 * solo la etiqueta, para no repetir el título dentro del acordeón.
 */
export function ObjetoEnAcordeon(props: {
  field: { label?: string; metadata?: { oloAcordeon?: { abierto?: boolean } } };
  children: ReactNode;
}) {
  const ajustes = props.field?.metadata?.oloAcordeon;
  if (!ajustes || !isValidElement(props.children)) return <>{props.children}</>;
  return (
    <AcordeonDeCampo etiqueta={props.field.label ?? ''} abiertoAlInicio={ajustes.abierto}>
      {cloneElement(props.children as ReactElement<{ Label?: unknown }>, { Label: EtiquetaTransparente })}
    </AcordeonDeCampo>
  );
}
