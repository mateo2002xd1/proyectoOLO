/**
 * Mantiene a la vista los menús flotantes de Editor.js (el «⠿» de cada bloque con «Convert to» y
 * la alineación, el «H ▾» de la barra al seleccionar texto, el «+»).
 *
 * Editor.js los dibuja dentro de su propia caja, que a su vez está en la columna del editor de
 * Puck (se desplaza) y dentro de un acordeón. Dos cosas los cortaban:
 *
 * - Un menú de 200 px más su lista anidada («Convert to») suman 400 px, y la columna mide unos
 *   350: la lista se abría hacia la izquierda y se salía de la pantalla. Aquí se corre en
 *   horizontal lo justo para que quepa en la columna; si no cabe del todo, se superpone al menú.
 * - Un menú abierto quedaba por debajo de lo que viene después. Mientras haya uno abierto, la
 *   caja del editor sube de capa.
 *
 * No toca lo que Editor.js calcula (variables CSS y clases): corre el menú con `translate`, que
 * no choca con la animación de entrada (`transform`), y lo recalcula cada vez que se abre o se
 * cierra un menú.
 */

const MARGEN = 8;
const CAPA_SUPERIOR = '50';

/** El rectángulo en que debe caber un menú: la pantalla, recortada por la columna que se desplaza. */
function areaVisible(contenedor: HTMLElement) {
  let izquierda = 0;
  let derecha = window.innerWidth;
  for (let el = contenedor.parentElement; el; el = el.parentElement) {
    const { overflowX } = getComputedStyle(el);
    if (overflowX === 'auto' || overflowX === 'scroll') {
      const caja = el.getBoundingClientRect();
      izquierda = Math.max(izquierda, caja.left);
      derecha = Math.min(derecha, caja.right);
      break;
    }
  }
  return { izquierda, derecha };
}

/** Devuelve la función que lo deshace. */
export function mantenerMenusVisibles(contenedor: HTMLElement): () => void {
  let pendiente = 0;

  const ajustar = () => {
    pendiente = 0;
    const { izquierda, derecha } = areaVisible(contenedor);
    const abiertos = contenedor.querySelectorAll<HTMLElement>('.ce-popover--opened > .ce-popover__container');

    contenedor.style.position = abiertos.length > 0 ? 'relative' : '';
    contenedor.style.zIndex = abiertos.length > 0 ? CAPA_SUPERIOR : '';

    abiertos.forEach((menu) => {
      menu.style.translate = '';
      const caja = menu.getBoundingClientRect();
      // La animación de entrada lo escala desde el centro: se mide su ancho real, no el de ese momento.
      const centro = caja.left + caja.width / 2;
      const ancho = menu.offsetWidth;
      const desdeLaIzquierda = centro - ancho / 2;
      let desplazamiento = 0;
      if (desdeLaIzquierda + ancho > derecha - MARGEN) desplazamiento = derecha - MARGEN - (desdeLaIzquierda + ancho);
      if (desdeLaIzquierda + desplazamiento < izquierda + MARGEN) desplazamiento = izquierda + MARGEN - desdeLaIzquierda;
      if (desplazamiento !== 0) menu.style.translate = `${desplazamiento}px 0`;
    });
  };

  const observador = new MutationObserver(() => {
    if (!pendiente) pendiente = requestAnimationFrame(ajustar);
  });
  // Solo `class` (así se abre y se cierra cada menú) y altas/bajas de nodos; el `translate` es un
  // `style`, que no se observa, y no provoca otra vuelta.
  observador.observe(contenedor, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });

  return () => {
    observador.disconnect();
    if (pendiente) cancelAnimationFrame(pendiente);
    contenedor.style.position = '';
    contenedor.style.zIndex = '';
  };
}
