import type { ReactNode } from 'react';
import type { OutputBlockData, OutputData } from '@editorjs/editorjs';
import { alineacionDe, repartirTextos, tieneTexto } from '../lib/textos-del-buscador';

/** Un elemento de lista de Editor.js: texto suelto (lista v1) u objeto con sublista (v2). */
type ItemDeLista = string | { content?: string; items?: ItemDeLista[] };

function ItemsDeLista({
  items,
  ordenada,
  alineacion,
}: {
  items: ItemDeLista[];
  ordenada: boolean;
  alineacion?: 'center' | 'right' | 'justify';
}) {
  const Lista = ordenada ? 'ol' : 'ul';
  return (
    <Lista
      // Centrada o a la derecha, las viñetas van dentro del texto: fuera se quedarían a la izquierda.
      className={`mt-3 space-y-1 first:mt-0 ${alineacion === 'center' || alineacion === 'right' ? 'list-inside' : 'pl-6'} ${ordenada ? 'list-decimal' : 'list-disc'}`}
      style={{ textAlign: alineacion }}
    >
      {items.map((item, indice) => {
        const texto = typeof item === 'string' ? item : (item?.content ?? '');
        const sublista = typeof item === 'string' ? null : item?.items;
        return (
          <li key={indice}>
            <span dangerouslySetInnerHTML={{ __html: texto }} />
            {Array.isArray(sublista) && sublista.length > 0 && <ItemsDeLista items={sublista} ordenada={ordenada} />}
          </li>
        );
      })}
    </Lista>
  );
}

function clave(bloque: OutputBlockData, indice: number) {
  return bloque.id ?? indice;
}

/**
 * El nivel de un encabezado de Editor.js (H1 a H4) cambia su tamaño y su peso, igual que en el
 * campo del editor (`editorjs-wrapper.tsx`): H1 y H2 en negrita, H3 y H4 en seminegrita. El
 * tamaño es relativo al que trae el diseño en cada pantalla (28, 36 y 40 px en el titular; 17, 20
 * y 22 en el recuadro): el H2, que es el que traen los textos de la portada, no cambia de tamaño.
 * Las clases van escritas enteras: Tailwind solo genera las que ve en el código.
 */
const ESTILO_DEL_TITULAR: Record<number, string> = {
  1: 'text-[1.2em] font-bold',
  2: 'font-bold',
  3: 'text-[0.85em] font-semibold',
  4: 'text-[0.7em] font-semibold',
};
/** El encabezado del recuadro sale siempre en negrita; el nivel solo cambia el tamaño. */
const TAMANO_EN_EL_RECUADRO: Record<number, string> = { 1: 'text-[1.25em]', 3: 'text-[0.9em]', 4: 'text-[0.8em]' };

/** Un párrafo o una lista de Editor.js; el encabezado de «Texto bloque» sale en negrita y con su tamaño. */
function nodoDeBloque(bloque: OutputBlockData, indice: number): ReactNode {
  if (bloque.type === 'list') {
    return (
      <ItemsDeLista
        key={clave(bloque, indice)}
        items={bloque.data.items ?? []}
        ordenada={bloque.data.style === 'ordered'}
        alineacion={alineacionDe(bloque)}
      />
    );
  }
  return (
    <p
      key={clave(bloque, indice)}
      className={bloque.type === 'header' ? `font-bold ${TAMANO_EN_EL_RECUADRO[bloque.data?.level] ?? ''}`.trim() : undefined}
      style={{ textAlign: alineacionDe(bloque) }}
      dangerouslySetInnerHTML={{ __html: bloque.data.text }}
    />
  );
}

/**
 * El titular y la descripción como nodos, a partir de «Textos del buscador»
 * (`repartirTextos`). Una zona sin texto es `false`: la sección no la pinta ni le pone el
 * texto del diseño, que solo se usa cuando la portada no trae el campo.
 *
 * El `text` de cada bloque es HTML con `<b>`, `<i>`, `<a>` y `<br>`; llega saneado de la API al
 * guardar (`sanitizar-contenido.ts`), igual que el bloque «Texto enriquecido». El nivel que se
 * elige en el encabezado (H1 a H4) cambia solo el tamaño y el peso del titular
 * (`ESTILO_DEL_TITULAR`); su nivel semántico sigue siendo el que fija `TituloRico`, porque el
 * orden de los encabezados de la página no depende de lo que se escoja en un campo.
 */
export function nodosDeTextos(contenido: OutputData): { titular: ReactNode; descripcion: ReactNode } {
  const { titular, descripcion } = repartirTextos(contenido);
  return {
    titular:
      titular.length > 0 &&
      titular.map((bloque, indice) => (
        <span
          key={clave(bloque, indice)}
          className={`block ${ESTILO_DEL_TITULAR[bloque.data?.level] ?? ''}`.trim()}
          style={{ textAlign: alineacionDe(bloque) }}
          dangerouslySetInnerHTML={{ __html: bloque.data.text }}
        />
      )),
    descripcion: descripcion.length > 0 && descripcion.map(nodoDeBloque),
  };
}

/**
 * El texto del recuadro azul como nodos, a partir de «Texto bloque» (`textoBloque`): todos
 * sus bloques salen, con el mismo HTML saneado que `nodosDeTextos`. Sin texto, `false`.
 */
export function nodosDelBloque(textoBloque: OutputData): ReactNode {
  const bloques = (Array.isArray(textoBloque?.blocks) ? textoBloque.blocks : []).filter(tieneTexto);
  return bloques.length > 0 && bloques.map(nodoDeBloque);
}
