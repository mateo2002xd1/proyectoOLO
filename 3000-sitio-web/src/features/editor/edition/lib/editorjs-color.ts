import type { API, InlineTool, InlineToolConstructorOptions } from '@editorjs/editorjs';
import type { MenuConfig } from '@editorjs/editorjs/types/tools/menu-config';
import type { PopoverItemParams } from '@editorjs/editorjs/types/utils/popover/popover-item';
import {
  crearPanelDeColor,
  hexAHsv,
  hsvAHex,
  normalizarHex,
  rgbAHex,
  type Hsv,
  type PanelDeColor,
} from '@olo/blocks-renderer';

/**
 * Herramienta en línea de Editor.js para pintar de color las palabras elegidas.
 *
 * Sale en la barra que aparece al seleccionar texto, junto a negrita y cursiva. El botón es
 * solo un cuadro liso con el color que tiene el texto seleccionado; al pulsarlo se abre el
 * panel de color del OLO (`panel-de-color.ts` de `@olo/blocks-renderer`, el mismo del campo de
 * color de Puck): área de saturación y brillo, matiz, cuentagotas, hex o RGB y, abajo, los
 * colores que ya se usaron en este mismo texto. No hay lista de colores fijos: el color de una
 * palabra es el que se elija. Envuelve la selección en `<span style="color:#rrggbb">`; con
 * «Quitar color», quita el `span`.
 *
 * El API solo deja pasar ese `style` en un `span` y solo con un `#hex` (`COLOR_PERMITIDO` en
 * `sanitizar-contenido.ts`); cualquier otro `style` se borra al guardar. Por eso no hay
 * opacidad: sería un color con transparencia y esa regla no la admite. Si se cambia el formato
 * de aquí, hay que cambiar también esa regla.
 *
 * El `style` se escribe con `setAttribute`, no con `element.style.color`: lo segundo se
 * guarda como `rgb(170, 0, 0)` y el API solo acepta el hexadecimal.
 */

const COLOR_EN_STYLE = /^\s*color:\s*(#[0-9a-f]{3}|#[0-9a-f]{6})\s*;?\s*$/i;

/**
 * Lo que hay que ajustar de Editor.js para que el panel quepa y el botón sea un cuadro: el
 * menú anidado mide 200 × 270 px y recorta lo que sobra, y el botón lleva una flechita que aquí
 * sobra. El resto del aspecto está en el propio panel.
 */
const ID_ESTILOS = 'olo-color-texto-estilos';
const CSS = `
.ce-popover--inline [data-item-name="color"]{padding:1px}
.ce-popover--inline [data-item-name="color"] .ce-popover-item__icon{width:24px;height:24px}
.ce-popover--inline [data-item-name="color"] .ce-popover-item__icon--chevron-right{display:none}
.ce-popover--nested:has(.olo-pc-panel){--width:240px;--max-height:none;--padding:0;--border-radius:14px}
.ce-popover--nested:has(.olo-pc-panel[data-tema="oscuro"]) .ce-popover__container{background:#2c2c2c;border-color:#2c2c2c;color:#fff}
`;

/**
 * El cuadro del botón: el color del texto, liso y con un filo fino para que se vea también el
 * blanco. Sin letras a la vista; el nombre para lector de pantalla va en el propio dibujo.
 */
const cuadro = (hex: string) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="${ColorEnLinea.title}, ${hex}"><rect x="0.5" y="0.5" width="23" height="23" rx="5" fill="${hex}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/></svg>`;

/** El `span` de color que contiene este nodo, si lo hay (sin salir del bloque que se edita). */
function spanDeColor(nodo: Node | null): HTMLElement | null {
  let actual: Node | null = nodo;
  while (actual && !(actual instanceof HTMLElement && actual.isContentEditable && actual.getAttribute('contenteditable') === 'true')) {
    if (actual instanceof HTMLElement && actual.tagName === 'SPAN' && COLOR_EN_STYLE.test(actual.getAttribute('style') ?? '')) {
      return actual;
    }
    actual = actual.parentNode;
  }
  return null;
}

/** Saca el contenido de un `span` y lo borra. */
function desenvolver(span: Element) {
  const padre = span.parentNode;
  if (!padre) return;
  while (span.firstChild) padre.insertBefore(span.firstChild, span);
  padre.removeChild(span);
}

/** El color con que se ve el texto seleccionado: el del `span` de color o, sin él, el que hereda. */
function colorDelTextoSeleccionado(): string {
  const nodo = window.getSelection()?.anchorNode ?? null;
  const span = spanDeColor(nodo);
  const enSpan = span ? normalizarHex(COLOR_EN_STYLE.exec(span.getAttribute('style') ?? '')?.[1] ?? '') : null;
  if (enSpan) return enSpan;
  const elemento = nodo instanceof Element ? nodo : (nodo?.parentElement ?? null);
  return (elemento && rgbAHex(getComputedStyle(elemento).color)) ?? '#111111';
}

/** Los colores que ya tienen palabras en este mismo editor, sin repetir. */
function coloresEnUso(): string[] {
  const nodo = window.getSelection()?.anchorNode ?? null;
  const elemento = nodo instanceof Element ? nodo : (nodo?.parentElement ?? null);
  const editor = elemento?.closest('.codex-editor');
  if (!editor) return [];
  const vistos = new Set<string>();
  editor.querySelectorAll('span[style]').forEach((span) => {
    const hex = normalizarHex(COLOR_EN_STYLE.exec(span.getAttribute('style') ?? '')?.[1] ?? '');
    if (hex) vistos.add(hex);
  });
  return [...vistos];
}

function inyectarEstilos() {
  if (typeof document === 'undefined' || document.getElementById(ID_ESTILOS)) return;
  const estilos = document.createElement('style');
  estilos.id = ID_ESTILOS;
  estilos.textContent = CSS;
  document.head.appendChild(estilos);
}

export class ColorEnLinea implements InlineTool {
  static isInline = true;

  static get title() {
    return 'Color del texto';
  }

  /** Deja el `style` del `span` en lo que guarda Editor.js; el API lo vuelve a filtrar. */
  static get sanitize() {
    return { span: { style: true } };
  }

  /**
   * Pintar por primera vez envuelve el texto en un `span` y mueve la selección: Editor.js
   * reconstruye entonces la barra (y esta herramienta) y el selector se cerraba. Estos dos
   * datos pasan de la instancia vieja a la nueva para que vuelva a abrirse con el mismo color.
   * La señal dura un rato y no se apaga en la primera reconstrucción: Editor.js hace una al
   * soltar el ratón y otra unos 180 ms después (el `selectionchange` va con anti-rebote).
   */
  private static reabrirHasta = 0;
  private static ultimoHsv: Hsv | null = null;

  private readonly api: API;
  /** La selección de cuando se abrió el selector: escribir en un campo la quita del texto. */
  private rango: Range | null = null;
  private panel!: PanelDeColor;

  constructor({ api }: InlineToolConstructorOptions) {
    this.api = api;
  }

  render(): MenuConfig {
    inyectarEstilos();
    const reabrir = Date.now() < ColorEnLinea.reabrirHasta && ColorEnLinea.ultimoHsv !== null;
    const hex = colorDelTextoSeleccionado();

    this.panel = crearPanelDeColor({
      coloresEnUso: coloresEnUso(),
      alElegir: (elegido, hsv) => this.aplicarColor(elegido, hsv),
      alQuitar: () => this.quitarYCerrar(),
    });
    this.panel.fijar(reabrir ? ColorEnLinea.ultimoHsv! : hexAHsv(hex));

    const contenido = { type: 'html', element: this.panel.elemento } as unknown as PopoverItemParams;
    return {
      name: 'color',
      icon: cuadro(reabrir ? hsvAHex(this.panel.leer()) : hex),
      children: {
        isOpen: reabrir,
        isFlippable: false,
        items: [contenido],
        onOpen: () => this.guardarSeleccion(),
        onClose: () => {
          this.rango = null;
        },
      },
    };
  }

  // ───────────────────────────── el texto ─────────────────────────────

  private guardarSeleccion() {
    const seleccion = window.getSelection();
    this.rango = seleccion && seleccion.rangeCount > 0 ? seleccion.getRangeAt(0).cloneRange() : null;
  }

  /** Solo si la selección se movió (p. ej. al escribir en un campo): tocarla de más cierra el selector. */
  private restaurarSeleccion() {
    const seleccion = window.getSelection();
    if (!seleccion || !this.rango) return;
    const actual = seleccion.rangeCount > 0 ? seleccion.getRangeAt(0) : null;
    const igual =
      actual !== null &&
      !actual.collapsed &&
      actual.compareBoundaryPoints(Range.START_TO_START, this.rango) === 0 &&
      actual.compareBoundaryPoints(Range.END_TO_END, this.rango) === 0;
    if (igual) return;
    seleccion.removeAllRanges();
    seleccion.addRange(this.rango);
  }

  /** Pinta la selección con el color elegido y deja el cuadro del botón de ese color. */
  private aplicarColor(hex: string, hsv: Hsv) {
    ColorEnLinea.ultimoHsv = hsv;

    // El texto ya tiene color: basta cambiar el del `span`. No se toca la selección (con el foco
    // en un campo, devolverla al texto reconstruiría la barra y el campo perdería el foco).
    const dentro = this.rango ? spanDeColor(this.rango.commonAncestorContainer) : null;
    if (dentro) {
      dentro.setAttribute('style', `color:${hex}`);
      this.pintarCuadro(hex);
      return;
    }

    ColorEnLinea.reabrirHasta = Date.now() + 700;
    this.restaurarSeleccion();
    this.aplicar(hex);
    this.guardarSeleccion();
    this.pintarCuadro(hex);
  }

  private quitarYCerrar() {
    this.restaurarSeleccion();
    this.quitar();
    this.pintarCuadro(colorDelTextoSeleccionado());
    this.api.inlineToolbar.close();
  }

  /** El botón ya está dibujado por Editor.js: se cambia solo el cuadro, sin cerrar el selector. */
  private pintarCuadro(hex: string) {
    const icono = document.querySelector<HTMLElement>(
      '.ce-popover--inline [data-item-name="color"] .ce-popover-item__icon:not(.ce-popover-item__icon--chevron-right)'
    );
    if (icono) icono.innerHTML = cuadro(hex);
  }

  private aplicar(color: string) {
    const seleccion = window.getSelection();
    if (!seleccion || seleccion.rangeCount === 0 || seleccion.isCollapsed) return;
    const rango = seleccion.getRangeAt(0);

    // Una selección que cruza elementos de bloque (varios ítems de una lista) no se pinta:
    // partirla rompería la estructura del bloque.
    if (rango.cloneContents().querySelector('li, ul, ol, div, p, h1, h2, h3, h4, h5, h6')) return;

    // Toda la selección dentro de un mismo `span` de color: solo se cambia ese color.
    const dentro = spanDeColor(rango.commonAncestorContainer);
    if (dentro) {
      dentro.setAttribute('style', `color:${color}`);
      return;
    }

    const contenido = rango.extractContents();
    contenido.querySelectorAll('span').forEach((span) => {
      if (COLOR_EN_STYLE.test(span.getAttribute('style') ?? '')) desenvolver(span);
    });
    const span = document.createElement('span');
    span.setAttribute('style', `color:${color}`);
    span.appendChild(contenido);
    rango.insertNode(span);

    seleccion.removeAllRanges();
    const nuevo = document.createRange();
    nuevo.selectNodeContents(span);
    seleccion.addRange(nuevo);
  }

  private quitar() {
    const seleccion = window.getSelection();
    if (!seleccion || seleccion.rangeCount === 0) return;
    const rango = seleccion.getRangeAt(0);

    const dentro = spanDeColor(rango.commonAncestorContainer);
    if (dentro) {
      desenvolver(dentro);
      return;
    }
    // Selección que abarca varios `span` de color: se desenvuelven los que toca.
    const raiz = rango.commonAncestorContainer instanceof Element ? rango.commonAncestorContainer : rango.commonAncestorContainer.parentElement;
    raiz?.querySelectorAll('span').forEach((span) => {
      if (rango.intersectsNode(span) && COLOR_EN_STYLE.test(span.getAttribute('style') ?? '')) desenvolver(span);
    });
  }
}
