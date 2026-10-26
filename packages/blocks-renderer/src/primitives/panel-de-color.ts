/**
 * Panel de color compartido: área de saturación y brillo, matiz, cuentagotas, hex o RGB y,
 * si se le pasan, los colores ya usados. Lo usan el campo de color de Puck
 * (`ColorPickerField`) y la herramienta «Color del texto» de Editor.js
 * (`editorjs-color.ts` del sitio web), así que se ve y se comporta igual en los dos.
 *
 * Es JavaScript puro a propósito: Editor.js dibuja su barra con DOM, no con React, y un
 * panel hecho aquí entra en los dos sitios sin puentes. No toca el DOM al importarse.
 *
 * No hay opacidad: el API solo admite colores `#rrggbb` (`COLOR_PERMITIDO` y el sanitizador de
 * campos de color en `sanitizar-contenido.ts`), y este panel nunca entrega otra cosa.
 *
 * Qué entrega: `alElegir(hex, hsv)` cuando se termina de elegir (soltar el ratón o una flecha,
 * Intro o salir de un campo, clic en una muestra, cuentagotas), no a cada movimiento: así el
 * que lo usa guarda una vez y no diez por segundo. Mientras se arrastra solo cambia la vista.
 */

/** Fondo del panel: `'claro'` (blanco) u `'oscuro'`. Todo lo demás sale de este valor. */
export const TEMA_DEL_PANEL_DE_COLOR: TemaDelPanelDeColor = 'claro';

export type TemaDelPanelDeColor = 'oscuro' | 'claro';

export interface Hsv {
  /** 0–360 */
  h: number;
  /** 0–1 */
  s: number;
  /** 0–1 */
  v: number;
}

export interface OpcionesDelPanelDeColor {
  tema?: TemaDelPanelDeColor;
  /** Colores `#rrggbb` que ya se usaron, para elegirlos de nuevo. Sin ellos no hay rejilla. */
  coloresEnUso?: string[];
  textoQuitar?: string;
  alElegir: (hex: string, hsv: Hsv) => void;
  /** Sin esto no hay botón de quitar: para un color que no puede quedar vacío. */
  alQuitar?: () => void;
}

export interface PanelDeColor {
  elemento: HTMLElement;
  /** Pone un color en el panel sin avisar a `alElegir`. */
  fijar: (hsv: Hsv) => void;
  /** El color que muestra ahora. */
  leer: () => Hsv;
}

const HEX_COMPLETO = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;
const ID_ESTILOS = 'olo-panel-de-color-estilos';
const MAX_COLORES_EN_USO = 16;

/** Hex o RGB: se recuerda mientras dure la página. */
let formatoRecordado: 'hex' | 'rgb' = 'hex';

const CSS = `
.olo-pc-popover{position:fixed;z-index:10000;width:240px;box-sizing:border-box;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.28);overflow:hidden}
.olo-pc-popover[data-tema="oscuro"]{background:#2c2c2c;color:#fff}
.olo-pc-popover[data-tema="claro"]{background:#fff;color:#111827;box-shadow:0 8px 30px rgba(0,0,0,.18),0 0 0 1px #e5e7eb}
.olo-pc-panel{--pc-texto:#111827;--pc-suave:#6b7280;--pc-campo:#f3f4f6;--pc-campo-hover:#e5e7eb;--pc-fondo:#fff;--pc-linea:#e5e7eb;--pc-foco:#001631;--pc-anillo:rgba(0,0,0,.14);width:100%;padding:12px;display:flex;flex-direction:column;gap:12px;box-sizing:border-box;font-family:inherit;color:var(--pc-texto)}
.olo-pc-panel[data-tema="oscuro"]{--pc-texto:#fff;--pc-suave:#a8a8a8;--pc-campo:#3b3b3b;--pc-campo-hover:#4a4a4a;--pc-fondo:#2c2c2c;--pc-linea:#434343;--pc-foco:#4da3ff;--pc-anillo:rgba(255,255,255,.2)}
.olo-pc-panel [hidden]{display:none!important}
.olo-pc-area{position:relative;height:148px;border-radius:8px;cursor:crosshair;touch-action:none;outline:none;background-image:linear-gradient(to top,#000,rgba(0,0,0,0)),linear-gradient(to right,#fff,rgba(255,255,255,0))}
.olo-pc-matiz{position:relative;flex:1;min-width:0;height:16px;border-radius:8px;cursor:pointer;touch-action:none;outline:none}
.olo-pc-matiz-pista{position:absolute;left:0;right:0;top:3px;height:10px;border-radius:5px;background:linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)}
.olo-pc-pulgar{position:absolute;box-sizing:border-box;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35),inset 0 0 0 1px rgba(0,0,0,.35);pointer-events:none}
.olo-pc-area .olo-pc-pulgar{transform:translate(-50%,-50%)}
.olo-pc-matiz .olo-pc-pulgar{top:0}
.olo-pc-area:focus-visible,.olo-pc-matiz:focus-visible{box-shadow:0 0 0 2px var(--pc-fondo),0 0 0 4px var(--pc-foco)}
.olo-pc-fila{display:flex;align-items:center;gap:8px}
.olo-pc-icono{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex-shrink:0;padding:0;border:0;border-radius:8px;background:transparent;color:var(--pc-suave);cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.olo-pc-icono:hover{background:var(--pc-campo);color:var(--pc-texto)}
.olo-pc-icono:focus-visible,.olo-pc-quitar:focus-visible,.olo-pc-rejilla button:focus-visible{outline:2px solid var(--pc-foco);outline-offset:1px}
.olo-pc-formato{position:relative;flex-shrink:0;width:68px}
.olo-pc-formato select{appearance:none;-webkit-appearance:none;width:100%;height:32px;padding:0 22px 0 10px;border:0;border-radius:8px;background:var(--pc-campo);color:var(--pc-texto);font:inherit;font-size:12px;cursor:pointer;outline:none}
.olo-pc-formato select:focus-visible{box-shadow:0 0 0 2px var(--pc-foco)}
.olo-pc-formato svg{position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--pc-suave)}
.olo-pc-valor{flex:1;min-width:0}
.olo-pc-rgb{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}
.olo-pc-campo{display:block;width:100%;min-width:0;height:32px;box-sizing:border-box;padding:0 10px;border:0;border-radius:8px;background:var(--pc-campo);color:var(--pc-texto);font:inherit;font-size:12px;text-transform:uppercase;outline:none}
.olo-pc-rgb .olo-pc-campo{padding:0 4px;text-align:center}
.olo-pc-campo:focus{box-shadow:0 0 0 2px var(--pc-foco)}
.olo-pc-campo[aria-invalid="true"]{box-shadow:0 0 0 2px #ef4444}
.olo-pc-linea{height:1px;margin:0 -12px;background:var(--pc-linea)}
.olo-pc-rejilla{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}
.olo-pc-rejilla button{width:100%;aspect-ratio:1/1;padding:0;border:0;border-radius:4px;cursor:pointer;box-shadow:inset 0 0 0 1px var(--pc-anillo);transition:transform 120ms ease}
.olo-pc-rejilla button:hover{transform:scale(1.12)}
.olo-pc-rejilla button[aria-pressed="true"]{box-shadow:0 0 0 2px var(--pc-fondo),0 0 0 4px var(--pc-texto)}
.olo-pc-quitar{display:inline-flex;align-items:center;justify-content:center;width:100%;height:32px;padding:0;border:0;border-radius:8px;background:var(--pc-campo);color:var(--pc-texto);font:inherit;font-size:12px;cursor:pointer;transition:background-color 150ms ease}
.olo-pc-quitar:hover{background:var(--pc-campo-hover)}
@media (prefers-reduced-motion:reduce){.olo-pc-icono,.olo-pc-quitar,.olo-pc-rejilla button{transition:none}.olo-pc-rejilla button:hover{transform:none}}
`;

const ICONO_CUENTAGOTAS =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>';
const ICONO_FLECHA =
  '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="m2 3.5 3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function crear<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  clase?: string,
  atributos: Record<string, string> = {}
): HTMLElementTagNameMap[K] {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  for (const [nombre, valor] of Object.entries(atributos)) nodo.setAttribute(nombre, valor);
  return nodo;
}

// ───────────────────────────── color ─────────────────────────────

export function hexAHsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

export function hsvAHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const canal = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(canal * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

/** `#aabbcc` → `[170, 187, 204]`. */
function hexARgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `#abc` → `#aabbcc`; con o sin almohadilla; `null` si no es un hex. */
export function normalizarHex(texto: string): string | null {
  const t = texto.trim();
  if (!HEX_COMPLETO.test(t)) return null;
  const sin = t.replace('#', '').toLowerCase();
  return `#${sin.length === 3 ? [...sin].map((c) => c + c).join('') : sin}`;
}

/** `rgb(170, 0, 0)` (lo que da `getComputedStyle`) → `#aa0000`. */
export function rgbAHex(rgb: string): string | null {
  const m = rgb.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return null;
  return `#${m
    .slice(0, 3)
    .map((n) => limitar(Math.round(Number(n)), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

// ───────────────────────────── el panel ─────────────────────────────

export function inyectarEstilosDelPanelDeColor() {
  if (typeof document === 'undefined' || document.getElementById(ID_ESTILOS)) return;
  const estilos = document.createElement('style');
  estilos.id = ID_ESTILOS;
  estilos.textContent = CSS;
  document.head.appendChild(estilos);
}

export function crearPanelDeColor(opciones: OpcionesDelPanelDeColor): PanelDeColor {
  inyectarEstilosDelPanelDeColor();
  let hsv: Hsv = { h: 0, s: 0, v: 0 };

  const panel = crear('div', 'olo-pc-panel', { 'data-tema': opciones.tema ?? TEMA_DEL_PANEL_DE_COLOR });
  // Pulsar dentro no debe sacar el foco ni la selección de donde estaban (en Editor.js, el texto
  // seleccionado); solo los campos y el desplegable necesitan el foco.
  panel.addEventListener('mousedown', (e) => {
    if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLSelectElement)) e.preventDefault();
  });
  // Poner o escribir el valor de un campo mueve su cursor y dispara `selectionchange`. Editor.js lo
  // toma por un cambio de selección del texto y reconstruye su barra, que vuelve a poner el valor,
  // y así en bucle (y con el panel abierto el campo se destruiría mientras se escribe).
  panel.addEventListener('selectionchange', (e) => e.stopPropagation());

  const area = crear('div', 'olo-pc-area', {
    tabindex: '0',
    role: 'slider',
    'aria-label': 'Saturación y brillo',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  });
  const pulgarArea = crear('div', 'olo-pc-pulgar');
  area.appendChild(pulgarArea);

  const filaMatiz = crear('div', 'olo-pc-fila');
  const matiz = crear('div', 'olo-pc-matiz', {
    tabindex: '0',
    role: 'slider',
    'aria-label': 'Matiz',
    'aria-valuemin': '0',
    'aria-valuemax': '360',
  });
  const pulgarMatiz = crear('div', 'olo-pc-pulgar');
  matiz.append(crear('div', 'olo-pc-matiz-pista'), pulgarMatiz);

  const filaValor = crear('div', 'olo-pc-fila');
  const envoltorioFormato = crear('div', 'olo-pc-formato');
  const selectorFormato = crear('select', undefined, { 'aria-label': 'Formato del color' });
  selectorFormato.add(new Option('Hex', 'hex'));
  selectorFormato.add(new Option('RGB', 'rgb'));
  const flecha = crear('span');
  flecha.innerHTML = ICONO_FLECHA;
  envoltorioFormato.append(selectorFormato, flecha.firstElementChild!);

  const valorHex = crear('div', 'olo-pc-valor');
  const campoHex = crear('input', 'olo-pc-campo', {
    type: 'text',
    maxlength: '7',
    spellcheck: 'false',
    autocomplete: 'off',
    'aria-label': 'Color en hexadecimal',
  });
  valorHex.appendChild(campoHex);

  const valorRgb = crear('div', 'olo-pc-valor olo-pc-rgb');
  const camposRgb = ['Rojo', 'Verde', 'Azul'].map((nombre) =>
    crear('input', 'olo-pc-campo', { type: 'text', inputmode: 'numeric', maxlength: '3', autocomplete: 'off', 'aria-label': nombre })
  );
  valorRgb.append(...camposRgb);
  filaValor.append(envoltorioFormato, valorHex, valorRgb);

  if ('EyeDropper' in window) {
    const cuentagotas = crear('button', 'olo-pc-icono', {
      type: 'button',
      title: 'Tomar un color de la pantalla',
      'aria-label': 'Tomar un color de la pantalla',
    });
    cuentagotas.innerHTML = ICONO_CUENTAGOTAS;
    cuentagotas.addEventListener('click', async () => {
      try {
        const { sRGBHex } = await new (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } }).EyeDropper().open();
        const hex = normalizarHex(sRGBHex);
        if (!hex) return;
        fijar(hexAHsv(hex));
        elegir();
      } catch {
        // Esc en el cuentagotas: no se elige nada.
      }
    });
    filaMatiz.appendChild(cuentagotas);
  }
  filaMatiz.appendChild(matiz);

  panel.append(area, filaMatiz, filaValor);

  const muestrasEnUso: HTMLButtonElement[] = [];
  const enUso = (opciones.coloresEnUso ?? []).slice(0, MAX_COLORES_EN_USO);
  // La raya separa el selector de lo de abajo; sin colores usados ni botón de quitar no hay nada abajo.
  if (enUso.length > 0 || opciones.alQuitar) panel.appendChild(crear('div', 'olo-pc-linea'));
  if (enUso.length > 0) {
    const rejilla = crear('div', 'olo-pc-rejilla', { role: 'group', 'aria-label': 'Colores ya usados' });
    for (const hex of enUso) {
      const muestra = crear('button', undefined, {
        type: 'button',
        title: hex.toUpperCase(),
        'aria-label': hex.toUpperCase(),
        'aria-pressed': 'false',
        'data-hex': hex,
      });
      muestra.style.backgroundColor = hex;
      muestra.addEventListener('click', () => {
        fijar(hexAHsv(hex));
        elegir();
      });
      muestrasEnUso.push(muestra);
      rejilla.appendChild(muestra);
    }
    panel.appendChild(rejilla);
  }

  const alQuitar = opciones.alQuitar;
  if (alQuitar) {
    const quitar = crear('button', 'olo-pc-quitar', { type: 'button' });
    quitar.textContent = opciones.textoQuitar ?? 'Quitar color';
    quitar.addEventListener('click', () => alQuitar());
    panel.appendChild(quitar);
  }

  // ── estado ──

  function elegir() {
    opciones.alElegir(hsvAHex(hsv), { ...hsv });
  }

  function escribirCampos() {
    const hex = hsvAHex(hsv);
    campoHex.value = hex.toUpperCase();
    campoHex.setAttribute('aria-invalid', 'false');
    hexARgb(hex).forEach((canal, i) => {
      camposRgb[i].value = String(canal);
      camposRgb[i].setAttribute('aria-invalid', 'false');
    });
  }

  /** Pone el color: área, matiz, campos y muestras (salvo los campos mientras se escriben). */
  function fijar(nuevo: Hsv, escribirLosCampos = true) {
    hsv = nuevo;
    const hex = hsvAHex(hsv);
    const colorMatiz = `hsl(${Math.round(hsv.h)}, 100%, 50%)`;
    area.style.backgroundColor = colorMatiz;
    pulgarArea.style.left = `${hsv.s * 100}%`;
    pulgarArea.style.top = `${(1 - hsv.v) * 100}%`;
    // El pulgar del matiz queda dentro de la barra: ni se sale ni se recorta en los extremos.
    pulgarMatiz.style.left = `calc((100% - 16px) * ${hsv.h / 360})`;
    pulgarMatiz.style.backgroundColor = colorMatiz;
    area.setAttribute('aria-valuenow', String(Math.round(hsv.v * 100)));
    area.setAttribute('aria-valuetext', `Saturación ${Math.round(hsv.s * 100)} %, brillo ${Math.round(hsv.v * 100)} %`);
    matiz.setAttribute('aria-valuenow', String(Math.round(hsv.h)));
    for (const muestra of muestrasEnUso) muestra.setAttribute('aria-pressed', String(muestra.dataset.hex === hex));
    if (escribirLosCampos) escribirCampos();
  }

  function mostrarFormato() {
    const rgb = formatoRecordado === 'rgb';
    valorHex.hidden = rgb;
    valorRgb.hidden = !rgb;
    selectorFormato.value = formatoRecordado;
  }

  // ── el área ──

  const moverArea = (e: PointerEvent) => {
    const caja = area.getBoundingClientRect();
    fijar({
      ...hsv,
      s: limitar((e.clientX - caja.left) / caja.width, 0, 1),
      v: 1 - limitar((e.clientY - caja.top) / caja.height, 0, 1),
    });
  };
  area.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    area.setPointerCapture(e.pointerId);
    moverArea(e);
  });
  area.addEventListener('pointermove', (e) => {
    if (area.hasPointerCapture(e.pointerId)) moverArea(e);
  });
  area.addEventListener('pointerup', (e) => {
    if (area.hasPointerCapture(e.pointerId)) {
      area.releasePointerCapture(e.pointerId);
      elegir();
    }
  });
  area.addEventListener('keydown', (e) => {
    const paso = e.shiftKey ? 0.1 : 0.01;
    const { s, v } = hsv;
    const nuevo =
      e.key === 'ArrowLeft' ? { s: s - paso, v }
      : e.key === 'ArrowRight' ? { s: s + paso, v }
      : e.key === 'ArrowUp' ? { s, v: v + paso }
      : e.key === 'ArrowDown' ? { s, v: v - paso }
      : null;
    if (!nuevo) return;
    e.preventDefault();
    e.stopPropagation();
    fijar({ ...hsv, s: limitar(nuevo.s, 0, 1), v: limitar(nuevo.v, 0, 1) });
  });
  area.addEventListener('keyup', (e) => {
    if (e.key.startsWith('Arrow')) elegir();
  });

  // ── el matiz ──

  const moverMatiz = (e: PointerEvent) => {
    // El pulgar mide 16 px y no se sale de la barra: su centro recorre de 8 px a (ancho − 8 px).
    const caja = matiz.getBoundingClientRect();
    fijar({ ...hsv, h: limitar((e.clientX - caja.left - 8) / (caja.width - 16), 0, 1) * 360 });
  };
  matiz.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    matiz.setPointerCapture(e.pointerId);
    moverMatiz(e);
  });
  matiz.addEventListener('pointermove', (e) => {
    if (matiz.hasPointerCapture(e.pointerId)) moverMatiz(e);
  });
  matiz.addEventListener('pointerup', (e) => {
    if (matiz.hasPointerCapture(e.pointerId)) {
      matiz.releasePointerCapture(e.pointerId);
      elegir();
    }
  });
  matiz.addEventListener('keydown', (e) => {
    const paso = e.shiftKey ? 10 : 1;
    const delta = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -paso : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? paso : 0;
    if (!delta) return;
    e.preventDefault();
    e.stopPropagation();
    fijar({ ...hsv, h: limitar(hsv.h + delta, 0, 360) });
  });
  matiz.addEventListener('keyup', (e) => {
    if (e.key.startsWith('Arrow')) elegir();
  });

  // ── hex y RGB ──

  selectorFormato.addEventListener('change', () => {
    formatoRecordado = selectorFormato.value === 'rgb' ? 'rgb' : 'hex';
    mostrarFormato();
    escribirCampos();
  });
  selectorFormato.addEventListener('keydown', (e) => e.stopPropagation());

  // Solo la vista mientras se escribe: el color se entrega al terminar (Intro o salir del campo).
  campoHex.addEventListener('input', () => {
    const hex = normalizarHex(campoHex.value);
    campoHex.setAttribute('aria-invalid', hex || campoHex.value === '' ? 'false' : 'true');
    if (hex) fijar(hexAHsv(hex), false);
  });
  campoHex.addEventListener('change', () => {
    const hex = normalizarHex(campoHex.value);
    fijar(hex ? hexAHsv(hex) : hsv);
    if (hex) elegir();
  });
  campoHex.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      campoHex.dispatchEvent(new Event('change'));
    }
  });

  /** Los tres campos RGB como hex, o `null` si alguno no es un entero de 0 a 255. */
  const hexDeLosCamposRgb = (): string | null => {
    const canales = camposRgb.map((c) => (/^\d{1,3}$/.test(c.value.trim()) ? Number(c.value) : NaN));
    if (canales.some((n) => !(n >= 0 && n <= 255))) return null;
    return `#${canales.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
  };
  // Los tres campos RGB se entregan juntos: al salir del grupo o con Intro, no al pasar de uno a otro.
  const elegirRgb = () => {
    const hex = hexDeLosCamposRgb();
    fijar(hex ? hexAHsv(hex) : hsv);
    if (hex) elegir();
  };
  for (const campo of camposRgb) {
    campo.addEventListener('input', () => {
      const hex = hexDeLosCamposRgb();
      campo.setAttribute('aria-invalid', hex || campo.value === '' ? 'false' : 'true');
      if (hex) fijar(hexAHsv(hex), false);
    });
    campo.addEventListener('focusout', (e) => {
      if (!(e.relatedTarget instanceof Node && valorRgb.contains(e.relatedTarget))) elegirRgb();
    });
    campo.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        elegirRgb();
      }
    });
  }

  mostrarFormato();
  fijar(hsv);
  return { elemento: panel, fijar: (nuevo) => fijar(nuevo), leer: () => ({ ...hsv }) };
}
