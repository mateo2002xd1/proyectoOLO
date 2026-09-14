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
  contenido?: ReactNode;
  fondo?: 'blanco' | 'gris';
  ancho?: 'estrecho' | 'ancho';
  /** Vacío conserva el color de marca de `.tasa-concept-title/-desc`. */
  colorTexto?: string;
  colorTitulo?: string;
  colorContenido?: string;
  className?: string;
}

export function TextoRico({
  titulo,
  mostrarTitulo = true,
  contenido,
  fondo = 'gris',
  ancho = 'estrecho',
  colorTexto,
  colorTitulo,
  colorContenido,
  className = '',
}: TextoRicoProps) {
  // El estilo en línea gana siempre a las clases de `.tasa-concept-*`.
  // Si no se define color individual, usa colorTexto como respaldo.
  const colorFinalTitulo = colorTitulo || colorTexto;
  const colorFinalContenido = colorContenido || colorTexto;
  const estiloTitulo = colorFinalTitulo ? { color: colorFinalTitulo } : undefined;
  const estiloContenido = colorFinalContenido ? { color: colorFinalContenido } : undefined;

  return (
    <div
      className={`${fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white'} pt-12 md:pt-20 pb-8 ${className}`.trim()}
    >
      <div
        className="max-w-[1200px] w-full mx-auto px-6"
      >
        {mostrarTitulo && titulo && (
          <h2 className="tasa-concept-title mb-8" style={estiloTitulo}>
            {titulo}
          </h2>
        )}
        <div className="tasa-concept-desc" style={estiloContenido}>{contenido}</div>
      </div>
    </div>
  );
}
