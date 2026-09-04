import type { ReactNode } from 'react';

interface TituloRicoProps {
  children: ReactNode;
  /** Clase del bloque (`olo-portals-title`, `olo-publicaciones-title`…). */
  className: string;
  /** Nivel del encabezado. Los títulos de sección del cuerpo son de nivel 2; el
   *  único `<h1>` de una página (su encabezado principal) usa nivel 1. */
  nivel?: 1 | 2 | 3 | 4;
}

/**
 * Título de sección cuyo texto viene de un campo `richtext` de Puck.
 *
 * **Por qué no es un `<h2>`.** Puck entrega esos campos envueltos en un
 * `<div class="rich-text">` (lo hace su `RichTextRenderFallback`, y no es
 * configurable). Un `<div>` dentro de un `<h2>` es HTML inválido: el navegador
 * cierra el encabezado antes de tiempo al parsearlo, y el título se parte en
 * dos nodos con el texto fuera del encabezado.
 *
 * **Por qué entonces sigue siendo un encabezado.** Perder el `<h2>` rompería el
 * esquema de encabezados de la página, que es lo que usa un lector de pantalla
 * para navegar por secciones — nivel AA, `9-accesibilidad.md`. `role="heading"`
 * con `aria-level` da exactamente la misma semántica en el árbol de
 * accesibilidad que el `<h2>` que había antes, sin el HTML inválido.
 *
 * Las clases del bloque se conservan tal cual, así que el aspecto no cambia:
 * el estilo de estos títulos siempre vino de la clase, no de la etiqueta.
 */
export function TituloRico({ children, className, nivel = 2 }: TituloRicoProps) {
  return (
    <div className={`olo-titulo-rico ${className}`} role="heading" aria-level={nivel}>
      {children}
    </div>
  );
}
