import type { API, BlockAPI, BlockTune } from '@editorjs/editorjs';
import type { BlockTuneData } from '@editorjs/editorjs/types/block-tunes/block-tune-data';
import type { MenuConfig } from '@editorjs/editorjs/types/tools/menu-config';

/**
 * Ajuste de bloque de Editor.js para alinear el texto: izquierda, centro, derecha y justificado.
 *
 * Sale en el menú del bloque (el «⠿» de cada bloque). Guarda la elección en el propio bloque,
 * `tunes: { alineacion: { alineacion: 'center' } }`, y no en el HTML del texto; con la alineación
 * a la izquierda no guarda nada. Quien pinta el bloque la lee con `alineacionDe`
 * (`shared/lib/buscador-ocupaciones/lib/textos-del-buscador.ts`).
 */
export const ALINEACIONES = ['left', 'center', 'right', 'justify'] as const;
export type Alineacion = (typeof ALINEACIONES)[number];

const ETIQUETAS: Record<Alineacion, string> = {
  left: 'Alinear a la izquierda',
  center: 'Centrar',
  right: 'Alinear a la derecha',
  justify: 'Justificar',
};

/** Rayas de distinto largo, como el icono de alineación de cualquier procesador de texto. */
const trazos = (lineas: Array<[number, number]>) =>
  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">${lineas
    .map(([x1, x2], indice) => `<path d="M${x1} ${3.5 + indice * 3.7}H${x2}"/>`)
    .join('')}</svg>`;

const ICONOS: Record<Alineacion, string> = {
  left: trazos([[3, 15], [3, 10], [3, 15], [3, 8]]),
  center: trazos([[3, 15], [5.5, 12.5], [3, 15], [6.5, 11.5]]),
  right: trazos([[3, 15], [8, 15], [3, 15], [10, 15]]),
  justify: trazos([[3, 15], [3, 15], [3, 15], [3, 15]]),
};

export function esAlineacion(valor: unknown): valor is Alineacion {
  return typeof valor === 'string' && (ALINEACIONES as readonly string[]).includes(valor);
}

export class AlineacionDeBloque implements BlockTune {
  static isTune = true;

  private readonly bloque: BlockAPI;
  private alineacion: Alineacion;
  private envoltorio: HTMLElement | null = null;

  constructor({ block, data }: { api: API; block: BlockAPI; data?: BlockTuneData }) {
    this.bloque = block;
    this.alineacion = esAlineacion(data?.alineacion) ? data.alineacion : 'left';
  }

  render(): MenuConfig {
    return ALINEACIONES.map((valor) => ({
      icon: ICONOS[valor],
      title: ETIQUETAS[valor],
      name: `alineacion-${valor}`,
      toggle: 'alineacion',
      isActive: this.alineacion === valor,
      closeOnActivate: true,
      onActivate: () => {
        this.alineacion = valor;
        this.aplicar();
        this.bloque.dispatchChange();
      },
    }));
  }

  /** El texto del bloque hereda la alineación de este envoltorio. */
  wrap(contenido: HTMLElement): HTMLElement {
    this.envoltorio = document.createElement('div');
    this.envoltorio.appendChild(contenido);
    this.aplicar();
    return this.envoltorio;
  }

  save(): BlockTuneData {
    return this.alineacion === 'left' ? {} : { alineacion: this.alineacion };
  }

  private aplicar() {
    if (this.envoltorio) this.envoltorio.style.textAlign = this.alineacion;
  }
}
