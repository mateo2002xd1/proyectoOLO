import type { ReactNode } from 'react';

/**
 * Un titular y un cuerpo de texto con formato.
 *
 * El cuerpo es un campo `richtext` de Puck, así que quien edita pone negritas y
 * listas desde una barra de formato en vez de escribir marcas.
 *
 * `contenido` es `ReactNode` y no `string`: Puck ya entrega el campo
 * convertido en nodos antes de llamar al render.
 */
export interface TextoRicoProps {
  id?: string;
  titulo?: ReactNode;
  mostrarTitulo?: boolean;
  subtitulo?: ReactNode;
  mostrarSubtitulo?: boolean;
  contenido?: ReactNode;
  fondo?: 'blanco' | 'gris';
  ancho?: 'estrecho' | 'ancho';
  /** Vacío conserva el color de marca de `.tasa-concept-title/-desc`. */
  colorTexto?: string;
  className?: string;
}

export function TextoRico({
  titulo,
  mostrarTitulo = true,
  subtitulo,
  mostrarSubtitulo = true,
  contenido,
  fondo = 'gris',
  ancho = 'estrecho',
  colorTexto,
  className = '',
}: TextoRicoProps) {
  // El estilo en línea gana siempre a las clases de `.tasa-concept-*`, así que
  // basta con ponerlo solo cuando hay un color elegido.
  const estiloColor = colorTexto ? { color: colorTexto } : undefined;

  return (
    <div
      className={`${fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white'} pt-12 md:pt-20 pb-8 ${className}`.trim()}
    >
      <div
        className="max-w-[1200px] w-full mx-auto px-6"
      >
        {mostrarTitulo && titulo && (
          <h2
            className={`tasa-concept-title ${mostrarSubtitulo && subtitulo ? 'mb-3' : 'mb-8'}`}
            style={estiloColor}
          >
            {titulo}
          </h2>
        )}
        {mostrarSubtitulo && subtitulo && (
          <div className="tasa-concept-subtitle text-base sm:text-lg text-gray-600 font-medium mb-8" style={estiloColor}>
            {subtitulo}
          </div>
        )}
        <div className="tasa-concept-desc" style={estiloColor}>{contenido}</div>
      </div>
    </div>
  );
}
