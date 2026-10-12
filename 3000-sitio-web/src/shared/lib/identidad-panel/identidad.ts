import { ACCIONES_DEL_PANEL, type IdDeAccion } from './acciones';
import { BOTONES_DEL_PANEL, type IdDeBoton } from './botones';

export interface ColoresDeAccion {
  fondo: string;
  texto: string;
}

/**
 * La identidad visual del panel tal como la devuelve `GET /api/configuracion/identidad-panel`:
 * solo lo que alguien cambió. Lo que falta es lo de fábrica.
 */
export interface IdentidadPanel {
  /** Nombre del archivo subido (`{uuid}.png`), o `null` para el de fábrica. */
  logo: string | null;
  icono: string | null;
  blancoEnModoOscuro: boolean;
  acciones: Partial<Record<string, ColoresDeAccion>>;
  /** Los tipos de botón con color propio (`botones.ts`). */
  botones: Partial<Record<string, ColoresDeAccion>>;
  actualizadoEn: string | null;
}

export const IDENTIDAD_DE_FABRICA: IdentidadPanel = {
  logo: null,
  icono: null,
  blancoEnModoOscuro: true,
  acciones: {},
  botones: {},
  actualizadoEn: null,
};

export const LOGO_DE_FABRICA = '/assets/logos/olo-logo-horizontal.svg';
export const ICONO_DE_FABRICA = '/assets/logos/olo-logo-none.svg';

/**
 * Dónde pide el navegador un archivo subido: por el mismo origen del panel, que lo
 * reenvía a la API (rewrite `/identidad-panel/:nombre` de `next.config.mjs`).
 */
const rutaDeArchivo = (nombre: string) => `/identidad-panel/${encodeURIComponent(nombre)}`;

export const logoDelPanel = (identidad: IdentidadPanel) =>
  identidad.logo ? rutaDeArchivo(identidad.logo) : LOGO_DE_FABRICA;

export const iconoDelPanel = (identidad: IdentidadPanel) =>
  identidad.icono ? rutaDeArchivo(identidad.icono) : ICONO_DE_FABRICA;

/**
 * Si en modo oscuro se pinta en blanco (`brightness(0) invert(1)`). Lo de fábrica siempre:
 * es azul oscuro sobre transparente y sin el filtro no se vería. Lo subido, según
 * `blancoEnModoOscuro`: a un PNG transparente le sirve, pero uno con fondo propio saldría
 * como un bloque blanco.
 */
export const logoEnBlancoEnOscuro = (identidad: IdentidadPanel) => !identidad.logo || identidad.blancoEnModoOscuro;
export const iconoEnBlancoEnOscuro = (identidad: IdentidadPanel) => !identidad.icono || identidad.blancoEnModoOscuro;

/**
 * `#rrggbb` y nada más. Lo comprueba también la API al guardar, pero estos valores
 * acaban dentro de una etiqueta `<style>`: se vuelve a mirar antes de escribirlos.
 */
export const esColorHex = (valor: unknown): valor is string =>
  typeof valor === 'string' && /^#[0-9a-fA-F]{6}$/.test(valor);

/** Los colores con que sale un elemento: los guardados si son válidos, si no los de fábrica. */
function coloresDeElemento(
  catalogo: readonly { id: string; fondo: string; texto: string }[],
  conjunto: IdentidadPanel['acciones'] | undefined,
  id: string
): ColoresDeAccion {
  const deFabrica = catalogo.find((elemento) => elemento.id === id)!;
  const guardados = conjunto?.[id];
  return {
    fondo: esColorHex(guardados?.fondo) ? guardados.fondo.toLowerCase() : deFabrica.fondo,
    texto: esColorHex(guardados?.texto) ? guardados.texto.toLowerCase() : deFabrica.texto,
  };
}

/** El color de una etiqueta de acción (`acciones.ts`). */
export const coloresDe = (identidad: IdentidadPanel, id: IdDeAccion) =>
  coloresDeElemento(ACCIONES_DEL_PANEL, identidad.acciones, id);

/** El color de un tipo de botón (`botones.ts`). */
export const coloresDeBoton = (identidad: IdentidadPanel, id: IdDeBoton) =>
  coloresDeElemento(BOTONES_DEL_PANEL, identidad.botones, id);

/** Luminancia relativa de WCAG 2.x. */
function luminancia(hex: string): number {
  const canales = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
}

/** Contraste entre dos colores, de 1 a 21. */
export function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * Lo que pide AA para la letra de una etiqueta (12 px en negrita: texto normal). Ver
 * `9-accesibilidad.md` §2.1.
 */
export const CONTRASTE_MINIMO = 4.5;

/** El azul marino del panel: la letra oscura que se propone sobre fondos claros. */
export const LETRA_OSCURA = '#001631';

/** Blanco o azul marino, la que más contraste dé sobre ese fondo. */
export const letraLegible = (fondo: string) =>
  contraste(fondo, '#ffffff') >= contraste(fondo, LETRA_OSCURA) ? '#ffffff' : LETRA_OSCURA;
