import React from 'react';

/**
 * Convierte los tramos entre `**` en negrita.
 *
 * Los títulos de la intranet llevan una parte en negrita casi siempre, pero no
 * siempre en el mismo sitio: «**OLO**tecuenta» la lleva delante, «#dato**OLO**»
 * detrás y «**Recursos** visuales» separada por un espacio. Tasa lo resolvió
 * partiendo cada título en dos campos, que obliga a un campo nuevo por cada
 * negrita y a que quien edita adivine en qué orden se pegan.
 *
 * Con un solo campo de texto y estas marcas, el mismo campo cubre cualquier
 * combinación y quien edita solo tiene que recordar una regla. Para párrafos
 * largos no se usa esto sino el campo `richtext` de Puck, que trae su barra de
 * formato.
 */
export function resaltar(texto: string | undefined): React.ReactNode {
  if (!texto) return null;

  // Las posiciones impares son lo que iba entre marcas. Un `**` sin cerrar deja
  // su tramo en la posición par y se pinta como texto normal, que es lo que se
  // espera mientras alguien está escribiendo.
  return texto.split('**').map((tramo, indice) =>
    indice % 2 === 1 ? <strong key={indice}>{conSaltos(tramo)}</strong> : conSaltos(tramo, indice)
  );
}

/**
 * Los saltos de línea del campo se respetan como `<br>`.
 *
 * Varios títulos se parten en dos renglones a propósito («Matriz de / PERTINENCIA»)
 * y esa decisión es de quien redacta, no del diseño. Sin esto, el salto que se
 * escribe en el editor se perdería al pintar.
 */
function conSaltos(tramo: string, claveBase = 0): React.ReactNode {
  const renglones = tramo.split('\n');
  if (renglones.length === 1) return tramo;

  return renglones.map((renglon, indice) => (
    <React.Fragment key={`${claveBase}-${indice}`}>
      {indice > 0 && <br />}
      {renglon}
    </React.Fragment>
  ));
}
