'use client';

import React, { type ReactNode } from 'react';
import { BotonPersonalizado, type TamanoBoton } from './boton-personalizado';
import type { DestinoBotonConfig } from '../primitives/selector-destino-boton-field';

export interface ItemBotonSeccion {
  id?: string;
  texto: string;
  icono?: string;
  posicionIcono?: 'ninguno' | 'izquierda' | 'derecha';
  colorFondo?: string;
  colorTexto?: string;
  colorBorde?: string;
  tamano?: TamanoBoton;
  destino?: DestinoBotonConfig;
  resaltado?: boolean;
}

export interface SeccionBotonesIconoProps {
  id?: string;
  titulo?: ReactNode;
  mostrarTitulo?: boolean;
  alineacionTitulo?: 'izquierda' | 'centro' | 'derecha';
  subtitulo?: ReactNode;
  columnas?: 1 | 2 | 3 | 4;
  botones?: ItemBotonSeccion[];
  items?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  className?: string;
  style?: React.CSSProperties;
}

export function SeccionBotonesIcono({
  titulo = '',
  mostrarTitulo = true,
  alineacionTitulo = 'centro',
  subtitulo = '',
  columnas = 3,
  botones = [],
  items: Items,
  className = '',
  style = {},
}: SeccionBotonesIconoProps) {
  const claseColumnas =
    columnas === 1
      ? 'grid-cols-1'
      : columnas === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columnas === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const claseAlineacionTitulo =
    alineacionTitulo === 'izquierda'
      ? 'text-left items-start'
      : alineacionTitulo === 'derecha'
      ? 'text-right items-end'
      : 'text-center items-center';

  const estiloGrid: React.CSSProperties = {
    ['--olo-grid-cols' as string]: String(columnas ?? 3),
    display: 'grid',
    gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
    gap: '16px 20px',
    width: '100%',
    alignItems: 'stretch',
  };

  const tieneBotonesArray = Array.isArray(botones) && botones.length > 0;

  return (
    <section className={`olo-seccion-botones w-full py-8 px-4 sm:px-6 lg:px-8 ${className}`} style={style}>
      <div className={`max-w-6xl mx-auto flex flex-col ${claseAlineacionTitulo} w-full`}>
        {mostrarTitulo && titulo ? (
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002237] mb-2 tracking-tight w-full">
            {titulo}
          </h2>
        ) : null}
        {mostrarTitulo && subtitulo ? (
          <div className="text-sm sm:text-base text-gray-600 mb-6 max-w-2xl w-full">
            {subtitulo}
          </div>
        ) : null}

        {/* 1. Botones configurados desde el array (modo lista tipo pestañas) */}
        {tieneBotonesArray && (
          <div className={`grid ${claseColumnas} gap-4 sm:gap-5 w-full justify-items-stretch mb-4`}>
            {botones.map((btn, idx) => (
              <div key={btn.id || `btn-item-${idx}`} className="flex items-center justify-center w-full">
                <BotonPersonalizado
                  texto={btn.texto}
                  icono={btn.icono}
                  posicionIcono={btn.posicionIcono ?? 'izquierda'}
                  colorFondo={btn.colorFondo || '#ffffff'}
                  colorTexto={btn.colorTexto || '#002237'}
                  colorBorde={btn.colorBorde}
                  tamano={btn.tamano ?? 'mediano'}
                  ancho="completo"
                  destino={btn.destino}
                  resaltado={btn.resaltado}
                />
              </div>
            ))}
          </div>
        )}

        {/* 2. Slot contenedor DropZone (solo admite arrastrar BotonPersonalizado) */}
        {Items ? (
          <div className="w-full">
            <Items className="olo-sectorial-grid w-full" style={estiloGrid} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
