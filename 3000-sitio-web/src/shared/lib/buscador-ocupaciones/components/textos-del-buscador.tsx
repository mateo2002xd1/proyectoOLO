import type { ReactNode } from 'react';
import type { OutputBlockData, OutputData } from '@editorjs/editorjs';
import { repartirTextos } from '../lib/textos-del-buscador';

/** Un elemento de lista de Editor.js: texto suelto (lista v1) u objeto con sublista (v2). */
type ItemDeLista = string | { content?: string; items?: ItemDeLista[] };

function ItemsDeLista({ items, ordenada }: { items: ItemDeLista[]; ordenada: boolean }) {
  const Lista = ordenada ? 'ol' : 'ul';
  return (
    <Lista className={`mt-3 space-y-1 pl-6 first:mt-0 ${ordenada ? 'list-decimal' : 'list-disc'}`}>
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
 * Las tres zonas de la sección como nodos, a partir del campo único de Editor.js
 * (`repartirTextos`). Una zona sin texto es `false`: la sección no la pinta ni le pone el
 * texto del diseño, que solo se usa cuando la portada no trae el campo.
 *
 * El `text` de cada bloque es HTML con `<b>`, `<i>`, `<a>` y `<br>`; llega saneado de la API al
 * guardar (`sanitizar-contenido.ts`), igual que el bloque «Texto enriquecido». El nivel que se
 * elige en el encabezado no cambia el titular: su tamaño y su nivel de encabezado son los del
 * diseño (`TituloRico`).
 */
export function nodosDeTextos(contenido: OutputData): {
  titular: ReactNode;
  descripcion: ReactNode;
  recuadro: ReactNode;
} {
  const { titular, descripcion, recuadro } = repartirTextos(contenido);
  return {
    titular:
      titular.length > 0 &&
      titular.map((bloque, indice) => (
        <span key={clave(bloque, indice)} className="block" dangerouslySetInnerHTML={{ __html: bloque.data.text }} />
      )),
    descripcion:
      descripcion.length > 0 &&
      descripcion.map((bloque, indice) =>
        bloque.type === 'list' ? (
          <ItemsDeLista
            key={clave(bloque, indice)}
            items={bloque.data.items ?? []}
            ordenada={bloque.data.style === 'ordered'}
          />
        ) : (
          <p key={clave(bloque, indice)} dangerouslySetInnerHTML={{ __html: bloque.data.text }} />
        )
      ),
    recuadro:
      recuadro.length > 0 &&
      recuadro.map((bloque, indice) => (
        <p key={clave(bloque, indice)} dangerouslySetInnerHTML={{ __html: bloque.data.text }} />
      )),
  };
}
