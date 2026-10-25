'use client';

import { enlaceSeguro } from '@olo/url-policy';
import React, { useState, type ReactNode } from 'react';
import { partirMedida } from '../primitives/campos-en-acordeon';
import { IconoRenderer } from '../primitives/icon-selector-field';
import type { DestinoBotonConfig } from '../primitives/selector-destino-boton-field';

export type TamanoBoton = 'pequeno' | 'mediano' | 'grande' | 'extraGrande';
export type PosicionIcono = 'ninguno' | 'izquierda' | 'derecha';
export type AlineacionBoton = 'izquierda' | 'centro' | 'derecha';
export type AnchoBoton = 'auto' | 'compacto' | 'mediano' | 'grande' | 'completo';

export interface BotonPersonalizadoProps {
  id?: string;
  texto?: ReactNode;
  colorFondo?: string;
  colorTexto?: string;
  colorBorde?: string;
  /** Alto del botón en px («48px»), o una de las medidas fijas de antes (`mediano`…). */
  tamano?: TamanoBoton | string | number;
  ancho?: AnchoBoton | string;
  /**
   * Campo suelto de antes: la posición ahora sale de «Espaciado y Ancho» (`caja.alineacion`).
   * Se sigue leyendo solo en páginas guardadas antes del cambio (ver `alineacionDelBoton`).
   */
  alineacion?: AlineacionBoton;
  /** Lo que `conCaja` pasa a todo bloque; aquí solo importa su «Posición». */
  caja?: { alineacion?: AlineacionBoton | string };
  icono?: string;
  posicionIcono?: PosicionIcono;
  destino?: DestinoBotonConfig;
  resaltado?: boolean;
  /** Color del borde y el halo cuando está resaltado; sin él, el verde SENA de siempre. */
  colorResaltado?: string;
  varianteEstilo?: string; // Mantenido para retrocompatibilidad
  className?: string;
  style?: React.CSSProperties;
}

const TAMANOS_CLASES: Record<TamanoBoton, { paddingY: string; paddingX: string; fontSize: string; iconSize: number }> = {
  pequeno: { paddingY: '6px', paddingX: '14px', fontSize: '14px', iconSize: 16 },
  mediano: { paddingY: '8px', paddingX: '18px', fontSize: '15px', iconSize: 18 }, // Basado fielmente en .olo-gov-btn
  grande: { paddingY: '12px', paddingX: '24px', fontSize: '16px', iconSize: 22 },
  extraGrande: { paddingY: '16px', paddingX: '32px', fontSize: '18px', iconSize: 24 },
};

/**
 * Alto en px de cada medida fija de antes, para enseñarla como número en el editor. Se
 * eligieron redondos y cerca de lo que esas medidas daban (casi todas topaban con el alto
 * mínimo de 42 px).
 */
const ALTO_DE_LAS_FIJAS: Record<TamanoBoton, number> = { pequeno: 40, mediano: 42, grande: 46, extraGrande: 56 };

/** El tamaño guardado como medida en px («48px»); `''` si no hay ninguno válido. */
export function tamanoDelBotonEnPx(tamano: unknown): string {
  if (typeof tamano === 'string' && Object.hasOwn(ALTO_DE_LAS_FIJAS, tamano)) {
    return `${ALTO_DE_LAS_FIJAS[tamano as TamanoBoton]}px`;
  }
  const medida = typeof tamano === 'number' ? { numero: tamano, unidad: 'px' } : partirMedida(tamano);
  return medida && medida.unidad === 'px' && medida.numero > 0 ? `${medida.numero}px` : '';
}

/** Letra, relleno y ícono de un botón de alto libre, en la misma proporción que el «mediano» (42 → 15 / 18). */
function medidasDeAlto(alto: number) {
  const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
  return {
    paddingY: '4px',
    paddingX: `${Math.round(alto * 0.43)}px`,
    fontSize: `${limitar(Math.round(alto * 0.36), 10, 48)}px`,
    iconSize: limitar(Math.round(alto * 0.43), 12, 48),
  };
}

/** Verde SENA: el resaltado de siempre. */
const COLOR_RESALTADO = '#7db828';

const ANCHOS_MAP: Record<string, string> = {
  auto: 'auto',
  compacto: '240px',
  pequeno: '240px',
  mediano: '320px',
  grande: '480px',
  amplio: '480px',
  completo: '100%',
};

/**
 * Dónde va el botón dentro de su fila: la «Posición» de «Espaciado y Ancho».
 *
 * La caja sola no basta para esto: su posición mueve el envoltorio y solo se nota si
 * se le fijó un ancho máximo, mientras que el botón es más angosto que su fila
 * aunque no haya ancho (por eso el botón la lee él mismo). La izquierda y la derecha
 * de la caja mandan; con la caja en «Centrado» (su valor por defecto) se respeta el
 * campo suelto de una página guardada antes del cambio, para que no se mueva sola.
 */
export function alineacionDelBoton(
  caja: BotonPersonalizadoProps['caja'],
  heredada?: string
): AlineacionBoton {
  const deCaja = caja?.alineacion;
  if (deCaja === 'izquierda' || deCaja === 'derecha') return deCaja;
  return heredada === 'izquierda' || heredada === 'derecha' ? heredada : 'centro';
}

/**
 * `resolveData` del bloque suelto: al abrirlo en el editor limpia lo que ya no se configura ahí.
 *
 * - El campo suelto `alineacion` pasa a `caja.alineacion` y desaparece, así «Espaciado y
 *   Ancho» es la única fuente (y se puede volver a «Centrado» aunque la página viniera
 *   alineada a un lado).
 * - `icono` y `posicionIcono` se borran: el botón suelto ya no lleva ícono. Un botón guardado
 *   con uno lo sigue mostrando hasta que se abra y se guarde la página. Los botones de
 *   «Sección de botones con íconos» tienen sus propios campos y no pasan por aquí.
 */
export function migrarBoton({ props }: { props: Record<string, any> }) {
  if (!('alineacion' in props) && !('icono' in props) && !('posicionIcono' in props)) return { props };
  const { alineacion, icono: _icono, posicionIcono: _posicionIcono, ...resto } = props;
  if (alineacion === undefined) return { props: resto };
  const caja = resto.caja ?? {};
  return { props: { ...resto, caja: { ...caja, alineacion: alineacionDelBoton(caja, alineacion) } } };
}

export function BotonPersonalizado({
  texto = 'Nuevo botón',
  colorFondo = '#ffffff',
  colorTexto = '#002237', // Color exacto del título y encabezados del proyecto
  colorBorde,
  tamano = 'mediano',
  ancho = 'mediano',
  alineacion: alineacionHeredada,
  caja,
  icono = '',
  posicionIcono = 'izquierda',
  destino = { tipo: 'enlace', urlEnlace: '' },
  resaltado = false,
  colorResaltado,
  className = '',
  style = {},
}: BotonPersonalizadoProps) {
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);
  const alineacion = alineacionDelBoton(caja, alineacionHeredada);

  const altoLibre =
    typeof tamano === 'string' && Object.hasOwn(TAMANOS_CLASES, tamano) ? null : Number.parseFloat(tamanoDelBotonEnPx(tamano)) || null;
  const configTamano =
    altoLibre !== null
      ? medidasDeAlto(altoLibre)
      : TAMANOS_CLASES[tamano as TamanoBoton] || TAMANOS_CLASES.mediano;
  const colorTextoFinal = colorTexto || '#002237';
  const colorFondoFinal = colorFondo || '#ffffff';

  // Lo elige el editor con el selector de color (#rrggbb); cualquier otra cosa vuelve al verde.
  const colorResaltadoFinal =
    colorResaltado && /^#[0-9a-f]{3,8}$/i.test(colorResaltado.trim()) ? colorResaltado.trim() : COLOR_RESALTADO;

  const anchoFinal = ANCHOS_MAP[ancho] || (ancho === 'completo' ? '100%' : 'auto');

  // `enlaceSeguro`: la API ya vació los `javascript:`, pero el botón también se pinta con lo que
  // hay en el editor sin guardar y con contenido que llegó por otros caminos (XSS-01).
  const urlDestino =
    destino?.tipo === 'archivo'
      ? enlaceSeguro(destino.urlArchivo) || '#'
      : destino?.tipo === 'enlace'
      ? enlaceSeguro(destino.urlEnlace) || '#'
      : undefined;

  const esEnlace = Boolean(urlDestino && urlDestino !== '#');
  const esArchivo = destino?.tipo === 'archivo';
  const abrirNuevaPestana = destino?.abrirNuevaPestana || esArchivo;

  const tieneIcono = Boolean(icono && posicionIcono !== 'ninguno');
  const iconoIzquierda = tieneIcono && posicionIcono === 'izquierda';
  const iconoDerecha = tieneIcono && posicionIcono === 'derecha';

  const dispararDescarga = () => {
    if (!urlDestino || urlDestino === '#') return;
    const nombre = destino?.nombreArchivo || (urlDestino ? urlDestino.split('/').pop() : '') || 'archivo';
    const textoPeso = destino?.pesoArchivo ? ` (${destino.pesoArchivo})` : '';
    setMensajeToast(`Descargando archivo: ${decodeURIComponent(nombre)}${textoPeso}`);
    setTimeout(() => {
      setMensajeToast(null);
    }, 3500);
  };

  const contenidoBoton = (
    <>
      {iconoIzquierda && (
        <span
          className="olo-btn-icon-wrapper olo-btn-icon-wrapper--left"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <IconoRenderer icono={icono} size={configTamano.iconSize} color={colorTextoFinal} />
        </span>
      )}
      <span
        className="olo-btn-texto"
        style={{
          display: 'inline-block',
          textAlign: 'center',
          lineHeight: '1.3',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {texto}
      </span>
      {iconoDerecha && (
        <span
          className="olo-btn-icon-wrapper olo-btn-icon-wrapper--right"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <IconoRenderer icono={icono} size={configTamano.iconSize} color={colorTextoFinal} />
        </span>
      )}
    </>
  );

  const estilosBoton: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    paddingTop: configTamano.paddingY,
    paddingBottom: configTamano.paddingY,
    paddingLeft: configTamano.paddingX,
    paddingRight: configTamano.paddingX,
    fontSize: configTamano.fontSize,
    fontWeight: 600,
    letterSpacing: '0.01em',
    color: colorTextoFinal,
    backgroundColor: colorFondoFinal,
    border: resaltado
      ? `2px solid ${colorResaltadoFinal}`
      : colorBorde
      ? `1.5px solid ${colorBorde}`
      : '1.5px solid #d1d5db',
    borderRadius: '10px', // Exacto a .olo-gov-btn del portal
    boxShadow: resaltado
      ? `0 0 0 3px color-mix(in srgb, ${colorResaltadoFinal} 28%, transparent), 0 2px 4px rgba(0, 0, 0, 0.06)`
      : '0 1px 3px rgba(0, 0, 0, 0.05)',
    textDecoration: 'none',
    transition: 'all 0.18s ease-in-out',
    width: anchoFinal,
    maxWidth: '100%',
    minHeight: `${altoLibre ?? 42}px`,
    cursor: esEnlace ? 'pointer' : 'default',
    boxSizing: 'border-box',
    // El CSS del resaltado (`.olo-btn-resaltado`, con !important) toma el color de esta variable.
    ...(resaltado ? { ['--olo-btn-resaltado' as string]: colorResaltadoFinal } : {}),
    ...style,
  };

  const justifyContenedor =
    alineacion === 'centro'
      ? 'center'
      : alineacion === 'derecha'
      ? 'flex-end'
      : 'flex-start';

  const estiloContenedor: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    justifyContent: justifyContenedor,
    alignItems: 'center',
    boxSizing: 'border-box',
  };

  const clasesBoton = `olo-btn-dinamico ${resaltado ? 'olo-btn-resaltado' : ''} ${className}`.trim();

  const botonElemento = esEnlace ? (
    <a
      href={urlDestino}
      target={abrirNuevaPestana ? '_blank' : undefined}
      rel={abrirNuevaPestana ? 'noopener noreferrer' : undefined}
      download={esArchivo ? (destino?.nombreArchivo || true) : undefined}
      className={clasesBoton}
      style={estilosBoton}
      onClick={() => {
        if (esArchivo) {
          dispararDescarga();
        }
      }}
    >
      {contenidoBoton}
    </a>
  ) : (
    <button
      type="button"
      className={clasesBoton}
      style={estilosBoton}
      onClick={() => {
        if (esArchivo) {
          dispararDescarga();
          if (urlDestino && urlDestino !== '#') {
            const link = document.createElement('a');
            link.href = urlDestino;
            if (destino?.nombreArchivo) link.download = destino.nombreArchivo;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      }}
    >
      {contenidoBoton}
    </button>
  );

  return (
    <div
      className={`olo-btn-contenedor olo-btn-align-${alineacion}`}
      style={estiloContenedor}
    >
      {botonElemento}

      {/* Notificación Toast flotante al descargar archivo (exacto a elemento pestaña) */}
      {mensajeToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            backgroundColor: '#001A39',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'none',
            maxWidth: 'calc(100vw - 48px)',
          }}
          role="status"
          aria-live="polite"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mensajeToast}
          </span>
        </div>
      )}
    </div>
  );
}
