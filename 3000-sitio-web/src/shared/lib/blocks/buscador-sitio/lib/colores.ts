/**
 * Colores que escribe quien edita la página (campos `type: 'color'` de Puck).
 *
 * El campo se ve como un selector, pero lo que se guarda es texto libre: el cuadro de
 * al lado deja escribir cualquier cosa y una petición directa a la API puede mandar lo que
 * quiera. Por eso un color nunca se pega tal cual en CSS (XSS-07, `2-convenciones` §11):
 * pasa por `colorSeguro`, y quien lo pinta lo hace como valor de `style` o de una
 * variable CSS, nunca dentro de una plantilla de texto de una etiqueta `<style>`.
 *
 * Es el mismo criterio que aplica el servidor a toda clave `color*` al guardar
 * (`sanitizar-contenido.ts`); si cambia uno, cambia el otro.
 */
const FORMAS_DE_COLOR = [
  '#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})', // #rgb, #rgba, #rrggbb, #rrggbbaa
  '(?:rgb|hsl)a?\\(\\s*[\\d.%\\s,/-]+\\)', // rgb(0 0 0 / 50%), rgba(0, 0, 0, .5)…
  'var\\(--[a-z0-9-]+\\)', // una variable del tema
  '[a-z]{3,30}', // un nombre: red, transparent, currentcolor
];

const COLOR_SEGURO = new RegExp(`^(?:${FORMAS_DE_COLOR.join('|')})$`, 'i');

/** El color si es seguro; si no, el de respaldo. */
export function colorSeguro(valor: unknown, porDefecto: string): string {
  if (typeof valor !== 'string') return porDefecto;
  const limpio = valor.trim();
  return COLOR_SEGURO.test(limpio) ? limpio : porDefecto;
}

/** Los ocho colores de la cápsula de búsqueda, ya validados y con su valor de respaldo. */
export interface ColoresDeLaCapsula {
  fondo: string;
  borde: string;
  bordeHover: string;
  texto: string;
  placeholder: string;
  boton: string;
  iconoBoton: string;
  botonLimpiar: string;
}

/**
 * Los de respaldo cumplen el contraste de `9-accesibilidad.md`: el borde en reposo
 * (`#667085`, 4,97:1) y el texto sugerido (`#4b5563`) pasan los 3:1 y 4,5:1 sobre blanco.
 * El anillo de foco por defecto es el del tema (`--color-brand-focus`).
 */
export function resolverColoresDeLaCapsula(
  elegidos: Partial<Record<keyof ColoresDeLaCapsula, unknown>>
): ColoresDeLaCapsula {
  return {
    fondo: colorSeguro(elegidos.fondo, '#ffffff'),
    borde: colorSeguro(elegidos.borde, '#667085'),
    bordeHover: colorSeguro(elegidos.bordeHover, 'var(--color-brand-focus)'),
    texto: colorSeguro(elegidos.texto, '#111111'),
    placeholder: colorSeguro(elegidos.placeholder, '#4b5563'),
    boton: colorSeguro(elegidos.boton, '#001631'),
    iconoBoton: colorSeguro(elegidos.iconoBoton, '#ffffff'),
    botonLimpiar: colorSeguro(elegidos.botonLimpiar, '#667085'),
  };
}

/** Los colores de la sección de resultados y de su tabla, ya validados y con respaldo. */
export interface ColoresDeLosResultados {
  titulo: string;
  conteo: string;
  bordeTabla: string;
  cabeceraTabla: string;
  textoCabeceraTabla: string;
  filaHover: string;
  badgeFondo: string;
  badgeTexto: string;
  tituloResultado: string;
  rutaResultado: string;
  textoResultado: string;
  resaltado: string;
  textoResaltado: string;
}

/**
 * `rutaResultado` cae en `#667085` (4,97:1 sobre blanco). Era `#98a2b3` (2,58:1), que no
 * llega al 4,5:1 de AA para un texto de 12 px (`9-accesibilidad.md` §0).
 */
export function resolverColoresDeLosResultados(
  elegidos: Partial<Record<keyof ColoresDeLosResultados, unknown>>
): ColoresDeLosResultados {
  return {
    titulo: colorSeguro(elegidos.titulo, '#001631'),
    conteo: colorSeguro(elegidos.conteo, '#667085'),
    bordeTabla: colorSeguro(elegidos.bordeTabla, '#eaecf0'),
    cabeceraTabla: colorSeguro(elegidos.cabeceraTabla, '#f8f9fa'),
    textoCabeceraTabla: colorSeguro(elegidos.textoCabeceraTabla, '#667085'),
    filaHover: colorSeguro(elegidos.filaHover, '#f8f9fa'),
    badgeFondo: colorSeguro(elegidos.badgeFondo, '#001631'),
    badgeTexto: colorSeguro(elegidos.badgeTexto, '#ffffff'),
    tituloResultado: colorSeguro(elegidos.tituloResultado, '#344054'),
    rutaResultado: colorSeguro(elegidos.rutaResultado, '#667085'),
    textoResultado: colorSeguro(elegidos.textoResultado, '#667085'),
    resaltado: colorSeguro(elegidos.resaltado, 'rgba(125, 184, 40, 0.3)'),
    textoResaltado: colorSeguro(elegidos.textoResaltado, '#001631'),
  };
}
