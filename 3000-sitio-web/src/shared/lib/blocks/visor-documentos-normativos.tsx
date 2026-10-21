'use client';

import { useState, type ReactNode } from 'react';
import { TituloRico } from './titulo-rico';
import { VisorDocumento } from '@/shared/ui/molecules/visor-documento';
import { poppins } from '@/shared/lib/typography/fonts';

export interface DocumentoNormativo {
  etiquetaTab?: ReactNode;
  titulo?: ReactNode;
  descripcion?: ReactNode;
  /** ID del documento en CompromISO SENA (ej. "6701"). De ahí salen las dos URLs. */
  documentoId?: string;
  /** Nombre sugerido para la descarga del archivo */
  nombreArchivo?: string;
}

interface VisorDocumentosNormativosProps {
  block: { id: string };
  titulo?: ReactNode;
  colorTitulo?: string;
  documentos?: DocumentoNormativo[];
}

/**
 * Selector de pestañas + visor de PDF para los documentos normativos oficiales.
 *
 * Las URLs no son un campo editable: se calculan a partir del `documentoId`
 * (`url` = proxy interno, `urlExterna` = CompromISO SENA) para que nadie tenga
 * que teclear ninguna de las dos a mano ni pueda escribirlas mal.
 */
export function VisorDocumentosNormativos({
  block,
  titulo,
  colorTitulo,
  documentos = [],
}: VisorDocumentosNormativosProps) {
  const [tabActiva, setTabActiva] = useState(0);
  const activo = documentos[tabActiva] ?? documentos[0];

  return (
    <div className={`${poppins.className} bg-white dark:bg-[#0b1121] text-gray-800 dark:text-[#f6f6f6]`} data-block-id={block.id}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-[#1e293b] pb-3">
            {titulo && (
              <TituloRico
                className="text-lg text-gray-900 dark:text-[#f6f6f6]"
                style={colorTitulo ? { color: colorTitulo } : undefined}
              >
                {titulo}
              </TituloRico>
            )}

            {documentos.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-gray-200/80 dark:bg-[#1e293b] p-1 text-xs">
                {documentos.map((documento, indice) => (
                  <button
                    key={indice}
                    type="button"
                    onClick={() => setTabActiva(indice)}
                    className={`rounded-lg px-3.5 py-1.5 transition ${
                      indice === tabActiva
                        ? 'bg-white dark:bg-[#00324D] text-[#00324D] dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {documento.etiquetaTab || documento.titulo || `Documento ${indice + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activo?.documentoId && (
            <VisorDocumento
              titulo={activo.titulo || ''}
              descripcion={activo.descripcion}
              url={`/api/docs/pdf?id=${encodeURIComponent(activo.documentoId)}`}
              urlExterna={`https://compromiso.sena.edu.co/mapa/descarga.php?id=${encodeURIComponent(activo.documentoId)}`}
              nombreArchivo={activo.nombreArchivo}
            />
          )}
        </section>
      </div>
    </div>
  );
}
