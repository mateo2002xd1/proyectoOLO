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
  mostrarSubtitulo?: boolean;
  columnas?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
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
  mostrarSubtitulo = true,
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
      : columnas === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : columnas === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : columnas === 5
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      : columnas === 6
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
      : columnas === 7
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
      : columnas === 8
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const claseAlineacionTitulo =
    alineacionTitulo === 'izquierda'
      ? 'text-left items-start'
      : alineacionTitulo === 'derecha'
      ? 'text-right items-end'
      : 'text-center items-center';

  const gapGrid = columnas >= 6 ? '10px 12px' : columnas >= 4 ? '12px 16px' : '16px 20px';
  const estiloGrid: React.CSSProperties = {
    ['--olo-grid-cols' as string]: String(columnas ?? 3),
    display: 'grid',
    gridTemplateColumns: `repeat(${columnas ?? 3}, minmax(0, 1fr))`,
    gap: gapGrid,
    width: '100%',
    alignItems: 'stretch',
  };

  const anchoMaximo = columnas >= 6 ? 'max-w-7xl' : 'max-w-6xl';
  const tieneBotonesArray = Array.isArray(botones) && botones.length > 0;

  return (
    <section className={`olo-seccion-botones w-full py-5 sm:py-6 px-4 sm:px-6 lg:px-8 ${className}`} style={style}>
      <div className={`${anchoMaximo} mx-auto flex flex-col ${claseAlineacionTitulo} w-full`}>
        {mostrarTitulo && titulo ? (
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002237] mb-2 tracking-tight w-full">
            {titulo}
          </h2>
        ) : null}
        {mostrarSubtitulo && subtitulo ? (
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
