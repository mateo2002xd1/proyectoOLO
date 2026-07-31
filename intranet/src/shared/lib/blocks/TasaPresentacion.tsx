'use client';

import { PptxViewer } from '@/features/tasa/ui/PptxViewer';

/**
 * Texto a la izquierda y visor de la presentación a la derecha.
 *
 * Cambiar la presentación es cambiar `archivoUrl`; el visor la descarga y la pinta
 * en el navegador. Es cliente por obligación: el renderizador de PPTX trabaja sobre
 * el DOM.
 */
export interface TasaPresentacionProps {
  tituloInicio?: string;
  tituloDestacado?: string;
  archivoUrl?: string;
}

export function TasaPresentacion({
  tituloInicio = 'Aquí podrás visualizar nuestra',
  tituloDestacado = 'presentación de Tasa de Vinculación y Empleabilidad',
  archivoUrl = '/uploads/documents/tasa.pptx',
}: TasaPresentacionProps) {
  return (
    <section className="tasa-ppt-section">
      <div className="tasa-ppt-container">
        <div className="tasa-ppt-text">
          <h2 className="tasa-ppt-title">
            {tituloInicio} <br />
            <strong>{tituloDestacado}</strong>
          </h2>
        </div>
        <div className="tasa-ppt-viewer-wrapper">
          {archivoUrl && <PptxViewer fileUrl={archivoUrl} />}
        </div>
      </div>
    </section>
  );
}
