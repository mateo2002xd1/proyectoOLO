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
  titulo?: ReactNode;
  contenido?: ReactNode;
  fondo?: 'blanco' | 'gris';
  ancho?: 'estrecho' | 'ancho';
  /** Vacío conserva el color de marca de `.tasa-concept-title/-desc`. */
  colorTexto?: string;
}

export function TextoRico({
  titulo,
  contenido,
  fondo = 'gris',
  ancho = 'estrecho',
  colorTexto,
}: TextoRicoProps) {
  // El estilo en línea gana siempre a las clases de `.tasa-concept-*`, así que
  // basta con ponerlo solo cuando hay un color elegido.
  const estiloColor = colorTexto ? { color: colorTexto } : undefined;

  return (
    <div
      className={`${fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white'} pt-12 md:pt-20 pb-8`}
    >
      <div
        className={`max-w-[1200px] w-full px-6`}
      >
        {titulo && (
          <h2 className="tasa-concept-title mb-8" style={estiloColor}>
            {titulo}
          </h2>
        )}
        <div className="tasa-concept-desc" style={estiloColor}>{contenido}</div>
      </div>
    </div>
  );
}
