'use client';

import { enlaceSeguro } from '@olo/url-policy';
import React, { useState, type ReactNode } from 'react';
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
  tamano?: TamanoBoton;
  ancho?: AnchoBoton | string;
  alineacion?: AlineacionBoton;
  icono?: string;
  posicionIcono?: PosicionIcono;
  destino?: DestinoBotonConfig;
  resaltado?: boolean;
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

const ANCHOS_MAP: Record<string, string> = {
  auto: 'auto',
  compacto: '240px',
  pequeno: '240px',
  mediano: '320px',
  grande: '480px',
  amplio: '480px',
  completo: '100%',
};

export function BotonPersonalizado({
  texto = 'Nuevo botón',
  colorFondo = '#ffffff',
  colorTexto = '#002237', // Color exacto del título y encabezados del proyecto
  colorBorde,
  tamano = 'mediano',
  ancho = 'mediano',
  alineacion = 'centro',
  icono = '',
  posicionIcono = 'izquierda',
  destino = { tipo: 'enlace', urlEnlace: '' },
  resaltado = false,
  className = '',
  style = {},
}: BotonPersonalizadoProps) {
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);

  const configTamano = TAMANOS_CLASES[tamano] || TAMANOS_CLASES.mediano;
  const colorTextoFinal = colorTexto || '#002237';
  const colorFondoFinal = colorFondo || '#ffffff';

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
      ? '2px solid #7db828'
      : colorBorde
      ? `1.5px solid ${colorBorde}`
      : '1.5px solid #d1d5db',
    borderRadius: '10px', // Exacto a .olo-gov-btn del portal
    boxShadow: resaltado
      ? '0 0 0 3px rgba(125, 184, 40, 0.25), 0 2px 4px rgba(0, 0, 0, 0.06)'
      : '0 1px 3px rgba(0, 0, 0, 0.05)',
    textDecoration: 'none',
    transition: 'all 0.18s ease-in-out',
    width: anchoFinal,
    maxWidth: '100%',
    minHeight: '42px',
    cursor: esEnlace ? 'pointer' : 'default',
    boxSizing: 'border-box',
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
      className={`olo-btn-contenedor olo-btn-align-${alineacion || 'centro'}`}
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
