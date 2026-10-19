/**
 * Estado de foco de los controles del panel del editor (acordeones y selector
 * de color).
 *
 * Los controles pintan su aspecto con estilos en línea, pero el foco necesita
 * `:focus`, que un estilo en línea no tiene. Esta hoja corta lo añade; React 19
 * la sube al `<head>` y la deja una sola vez por su `href`, aunque cada campo la
 * pinte. El `!important` hace falta para ganarle al `border` en línea.
 */

export const COLOR_FOCO_CAMPO = '#001631';

/** Inputs y selects: borde azul al seleccionarlos. */
export const CLASE_CONTROL = 'olo-campo-control';
/** Botones de una opción segmentada y cabeceras de acordeón: anillo al llegar con el teclado. */
export const CLASE_ENFOCABLE = 'olo-campo-enfocable';

const CSS = `
.${CLASE_CONTROL}{transition:border-color 150ms ease,box-shadow 150ms ease}
.${CLASE_CONTROL}:focus,.${CLASE_CONTROL}:focus-visible{outline:none;border-color:${COLOR_FOCO_CAMPO}!important;box-shadow:0 0 0 3px rgba(0,22,49,.14)}
.${CLASE_ENFOCABLE}:focus-visible{outline:2px solid ${COLOR_FOCO_CAMPO};outline-offset:-2px}
`;

export function EstilosDeCampos() {
  return (
    <style href="olo-estilos-de-campos" precedence="default">
      {CSS}
    </style>
  );
}
