/**
 * Las preferencias de accesibilidad del visitante del sitio público.
 *
 * Las elige en el panel «Accesibilidad» (el botón pegado al borde derecho) y se guardan
 * en su navegador, como el tema del panel (`CLAVE_TEMA`): un visitante no tiene cuenta,
 * y quien comparte un equipo de la biblioteca no quiere heredarlas en otro.
 *
 * Casi todas se aplican solo con CSS: cada una pone un atributo `data-a11y-*` en el
 * `<html>` y `globals.css` (sección «Accesibilidad del sitio público») hace el resto. Así
 * el script de antes de pintar (`SCRIPT_ACCESIBILIDAD_ANTES_DE_PINTAR`) las deja puestas
 * antes del primer pintado, sin React, y quien pidió letra grande no la ve crecer de golpe.
 * Las dos que necesitan JavaScript, el lector en voz alta y la guía de lectura, no tienen
 * atributo: las monta `Accesibilidad` mientras están encendidas.
 *
 * Solo valen en el sitio público: los atributos se quitan al salir de `(paginas)/layout.tsx`
 * hacia el panel o el editor (9-accesibilidad.md §0, el alcance es sitio-web).
 */

/** Dónde se guardan, como JSON. */
export const CLAVE_ACCESIBILIDAD = 'olo-accesibilidad';

/** Prefijo de los atributos del `<html>`: `data-a11y-contraste`, `data-a11y-texto="2"`… */
const PREFIJO_ATRIBUTO = 'data-a11y-';

/** Las que se encienden o se apagan. */
export const INTERRUPTORES = [
  'lector',
  'contraste',
  'pausarAnimaciones',
  'dislexia',
  'titulos',
  'enlaces',
  'negrita',
  'guia',
  'cursor',
] as const;

/**
 * Las que tienen varios niveles; `0` es «como viene el sitio». El número es el nivel más alto.
 * `daltonismo` no es una escala sino el tipo (ver `TIPOS_DE_DALTONISMO`), pero se guarda y
 * se aplica igual: un número en su atributo, y `0` es apagado.
 */
export const NIVELES = {
  texto: 3,
  saturacion: 3,
  interlineado: 3,
  interletrado: 3,
  daltonismo: 3,
} as const;

/** El valor de `daltonismo` para cada tipo; el filtro SVG de cada uno está en `FiltroDaltonismo`. */
export const TIPOS_DE_DALTONISMO = [
  { valor: 1, nombre: 'Protanopia', ayuda: 'dificultad para ver el rojo' },
  { valor: 2, nombre: 'Deuteranopia', ayuda: 'dificultad para ver el verde' },
  { valor: 3, nombre: 'Tritanopia', ayuda: 'dificultad para ver el azul' },
] as const;

/** Al encender el interruptor: la deuteranopía es la más frecuente. */
export const DALTONISMO_AL_ENCENDER = 2;

export type Interruptor = (typeof INTERRUPTORES)[number];
export type ConNiveles = keyof typeof NIVELES;

export type PreferenciasAccesibilidad = Record<Interruptor, boolean> & Record<ConNiveles, number>;

export const PREFERENCIAS_PREDETERMINADAS: PreferenciasAccesibilidad = {
  lector: false,
  contraste: false,
  pausarAnimaciones: false,
  dislexia: false,
  titulos: false,
  enlaces: false,
  negrita: false,
  guia: false,
  cursor: false,
  texto: 0,
  saturacion: 0,
  interlineado: 0,
  interletrado: 0,
  daltonismo: 0,
};

/** Las que no se resuelven con CSS y por eso no ponen atributo. */
const SOLO_CON_JAVASCRIPT: ReadonlySet<Interruptor> = new Set(['lector', 'guia']);

/** El nombre del atributo: `pausarAnimaciones` → `data-a11y-pausar-animaciones`. */
const atributoDe = (clave: string) =>
  PREFIJO_ATRIBUTO + clave.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);

/** Lo que va en el `<html>`: atributo → valor (`''` para los interruptores). */
function atributosDe(preferencias: PreferenciasAccesibilidad): Record<string, string> {
  const atributos: Record<string, string> = {};
  for (const clave of INTERRUPTORES) {
    if (preferencias[clave] && !SOLO_CON_JAVASCRIPT.has(clave)) atributos[atributoDe(clave)] = '';
  }
  for (const clave of Object.keys(NIVELES) as ConNiveles[]) {
    if (preferencias[clave] > 0) atributos[atributoDe(clave)] = String(preferencias[clave]);
  }
  return atributos;
}

/**
 * Lo guardado puede venir de una versión anterior o tocado a mano: se queda solo con
 * las claves conocidas y con niveles dentro de su rango.
 */
export function normalizarPreferencias(valor: unknown): PreferenciasAccesibilidad {
  const crudo = (valor && typeof valor === 'object' ? valor : {}) as Record<string, unknown>;
  const resultado = { ...PREFERENCIAS_PREDETERMINADAS };
  for (const clave of INTERRUPTORES) resultado[clave] = crudo[clave] === true;
  for (const [clave, maximo] of Object.entries(NIVELES) as [ConNiveles, number][]) {
    const nivel = crudo[clave];
    resultado[clave] =
      typeof nivel === 'number' && Number.isInteger(nivel) && nivel >= 0 && nivel <= maximo ? nivel : 0;
  }
  return resultado;
}

export const sonLasPredeterminadas = (preferencias: PreferenciasAccesibilidad) =>
  [...INTERRUPTORES, ...(Object.keys(NIVELES) as ConNiveles[])].every(
    (clave) => preferencias[clave] === PREFERENCIAS_PREDETERMINADAS[clave],
  );

/** Pone en el `<html>` los atributos de estas preferencias y quita los que sobran. */
export function aplicarAlDocumento(preferencias: PreferenciasAccesibilidad) {
  const raiz = document.documentElement;
  const atributos = atributosDe(preferencias);
  for (const { name } of [...raiz.attributes]) {
    if (name.startsWith(PREFIJO_ATRIBUTO) && !(name in atributos)) raiz.removeAttribute(name);
  }
  for (const [nombre, valor] of Object.entries(atributos)) raiz.setAttribute(nombre, valor);
}

/** Al salir del sitio público: el panel y el editor no llevan estas preferencias. */
export const quitarDelDocumento = () => aplicarAlDocumento(PREFERENCIAS_PREDETERMINADAS);

// --- Almacén ---------------------------------------------------------------------------
// Lo leen el panel, el lector y la guía con `useSyncExternalStore`; la copia en memoria
// evita parsear el JSON en cada render y devuelve siempre el mismo objeto si nada cambió.

let enMemoria: PreferenciasAccesibilidad | null = null;
const suscriptores = new Set<() => void>();

export function leerPreferencias(): PreferenciasAccesibilidad {
  if (enMemoria) return enMemoria;
  try {
    enMemoria = normalizarPreferencias(JSON.parse(localStorage.getItem(CLAVE_ACCESIBILIDAD) ?? '{}'));
  } catch {
    // Sin almacenamiento (navegación privada, bloqueado) o JSON roto: el sitio tal cual.
    enMemoria = PREFERENCIAS_PREDETERMINADAS;
  }
  return enMemoria;
}

export function guardarPreferencias(preferencias: PreferenciasAccesibilidad) {
  enMemoria = preferencias;
  try {
    if (sonLasPredeterminadas(preferencias)) localStorage.removeItem(CLAVE_ACCESIBILIDAD);
    else localStorage.setItem(CLAVE_ACCESIBILIDAD, JSON.stringify(preferencias));
  } catch {
    // Sin almacenamiento valen mientras dure la visita.
  }
  suscriptores.forEach((avisar) => avisar());
}

/** Las demás pestañas se enteran por el evento `storage`. */
export function suscribirPreferencias(avisar: () => void) {
  const alCambiarEnOtraPestana = (evento: StorageEvent) => {
    if (evento.key !== CLAVE_ACCESIBILIDAD) return;
    enMemoria = null;
    avisar();
  };
  suscriptores.add(avisar);
  window.addEventListener('storage', alCambiarEnOtraPestana);
  return () => {
    suscriptores.delete(avisar);
    window.removeEventListener('storage', alCambiarEnOtraPestana);
  };
}

/**
 * Corre antes de pintar (lo inyecta `Accesibilidad` con `useServerInsertedHTML`, como
 * `SincronizarTema`). Repite en pequeño `normalizarPreferencias` + `aplicarAlDocumento`:
 * es texto porque va dentro de `dangerouslySetInnerHTML` y tiene que funcionar sin React
 * ni módulos. Las listas salen de las de arriba, así que no se desalinean.
 */
export const SCRIPT_ACCESIBILIDAD_ANTES_DE_PINTAR = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  CLAVE_ACCESIBILIDAD,
)})||'{}');var r=document.documentElement;var s=${JSON.stringify(
  Object.fromEntries(INTERRUPTORES.filter((c) => !SOLO_CON_JAVASCRIPT.has(c)).map((c) => [c, atributoDe(c)])),
)};var n=${JSON.stringify(
  Object.fromEntries(Object.entries(NIVELES).map(([c, max]) => [c, [atributoDe(c), max]])),
)};for(var k in s){if(p[k]===true)r.setAttribute(s[k],'');}for(var k in n){var v=p[k];if(typeof v==='number'&&v%1===0&&v>0&&v<=n[k][1])r.setAttribute(n[k][0],String(v));}}catch(e){}})();`;
