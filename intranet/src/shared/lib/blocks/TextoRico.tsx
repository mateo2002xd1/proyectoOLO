import type { ReactNode } from 'react';
import { resaltar } from './resaltar';

/**
 * Un titular y un cuerpo de texto con formato.
 *
 * El cuerpo es un campo `richtext` de Puck, así que quien edita pone negritas y
 * listas desde una barra de formato en vez de escribir marcas. Hacía falta
 * porque los párrafos de las encuestas llevan negritas a mitad de frase
 * («evaluar la percepción de los empresarios sobre **la contribución de los
 * aprendices**»), y el truco de Tasa de partir el texto en dos campos solo
 * aguanta una negrita por título.
 *
 * Por eso `contenido` es `ReactNode` y no `string`: Puck ya entrega el campo
 * convertido en nodos antes de llamar al render.
 */
export interface TextoRicoProps {
  titulo?: string;
  contenido?: ReactNode;
  fondo?: 'blanco' | 'gris';
  ancho?: 'estrecho' | 'ancho';
}

export function TextoRico({
  titulo,
  contenido,
  fondo = 'gris',
  ancho = 'estrecho',
}: TextoRicoProps) {
  return (
    <div
      className={`${fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white'} pt-12 md:pt-20 pb-8`}
    >
      <div
        className={`${ancho === 'ancho' ? 'matriz-content-container-wide max-w-[1200px]' : 'matriz-content-container'} text-left`}
      >
        {titulo && (
          <h2 className="tasa-concept-title !text-left mb-8" style={{ border: 'none' }}>
            {resaltar(titulo)}
          </h2>
        )}
        <div className="matriz-section-intro !text-left">{contenido}</div>
      </div>
    </div>
  );
}
