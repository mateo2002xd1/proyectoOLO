import React from 'react';

/**
 * Convierte los tramos entre `**` en negrita.
 *
 * Copiado de `intranet/src/shared/lib/blocks/compartidos/resaltar.tsx`: mismo
 * campo de texto único con marcas, para que `RecursosVisualesBloque` no necesite
 * un campo separado por cada palabra en negrita del título.
 */
export function resaltar(texto: string | undefined): React.ReactNode {
  if (!texto) return null;

  return texto.split('**').map((tramo, indice) =>
    indice % 2 === 1 ? <strong key={indice}>{conSaltos(tramo)}</strong> : conSaltos(tramo, indice)
  );
}

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
