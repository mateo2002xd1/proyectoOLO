import { Fragment, type ReactNode } from 'react';
import { puckConfig } from '@/config/puck.config';
import type { ReferenciaAEnlace } from '../services/secciones.service';

/**
 * Cómo se nombra, en un diálogo, dónde está un enlace del portal.
 *
 * Lo comparten «Eliminar página» (los enlaces que hay que quitar antes de borrar) y «Editar
 * dirección» (los que se van a actualizar): los dos reciben de la API las mismas
 * `ReferenciaAEnlace` y las traducen a lo que se lee en el editor, con las etiquetas de
 * `puckConfig`, para que el texto no se desfase si cambia el nombre de un bloque o de un campo.
 */

/** «A», «A y B», «A, B y C»: para nombrar páginas y botones dentro de una frase. */
export function unirConY(partes: ReactNode[]) {
  return partes.map((parte, indice) => (
    <Fragment key={indice}>
      {indice > 0 && (indice === partes.length - 1 ? ' y ' : ', ')}
      {parte}
    </Fragment>
  ));
}

/** Cómo se nombra en la advertencia cada bloque de «Menú y pie». */
const LUGAR_EN_MENU_Y_PIE: Record<string, string> = {
  Header: 'el menú de navegación',
  Footer: 'el pie de página',
};

export interface UbicacionEnElEditor {
  /** Título de la página donde está el enlace. */
  pagina: string;
  /** Etiqueta del bloque en el editor («Pie de página»), o `null` si no se sabe. */
  bloque: string | null;
  /** Etiqueta del campo en el panel del bloque («Enlaces inferiores · fila 3»). */
  campo: string | null;
  /** Textos visibles de los enlaces de ese campo («Mapa del sitio»). */
  textos: string[];
  /** En qué parte del portal se ve: «el pie de página», «el menú de navegación», «la página «Inicio»». */
  lugar: string;
  /** Si alguno de esos enlaces está en un borrador o en lo que espera aprobación, no en lo publicado. */
  enBorrador: boolean;
}

/** Dónde se ve un enlace, para nombrarlo en una frase. */
export const lugarDe = (referencia: ReferenciaAEnlace): string =>
  referencia.slug === 'menu-y-pie'
    ? (LUGAR_EN_MENU_Y_PIE[referencia.bloque ?? ''] ?? 'el menú y pie')
    : `la página «${referencia.titulo}»`;

/**
 * Traduce el bloque y la prop que manda la API a lo que se lee en el editor, con las
 * etiquetas de `puckConfig`.
 */
function ubicacionEnElEditor(referencia: ReferenciaAEnlace): UbicacionEnElEditor {
  const bloque = referencia.bloque ? puckConfig.components[referencia.bloque] : undefined;
  const campo = bloque && referencia.campo ? bloque.fields?.[referencia.campo] : undefined;
  return {
    pagina: referencia.titulo,
    bloque: bloque?.label ?? null,
    campo: campo?.label ?? null,
    textos: referencia.texto ? [referencia.texto] : [],
    lugar: lugarDe(referencia),
    enBorrador: (referencia.estado ?? 'publicado') !== 'publicado',
  };
}

/**
 * Dónde está cada enlace con los nombres que se ven en el editor, sin repetir los que están
 * en la misma lista (dos enlaces en «fila 3» se buscan en un solo sitio).
 */
export function agruparUbicaciones(referencias: ReferenciaAEnlace[]): UbicacionEnElEditor[] {
  const ubicaciones: UbicacionEnElEditor[] = [];
  for (const referencia of referencias) {
    const ubicacion = ubicacionEnElEditor(referencia);
    const misma = ubicaciones.find(
      (otra) =>
        otra.pagina === ubicacion.pagina && otra.bloque === ubicacion.bloque && otra.campo === ubicacion.campo
    );
    if (!misma) {
      ubicaciones.push(ubicacion);
      continue;
    }
    for (const texto of ubicacion.textos) if (!misma.textos.includes(texto)) misma.textos.push(texto);
    misma.enBorrador ||= ubicacion.enBorrador;
  }
  return ubicaciones;
}
