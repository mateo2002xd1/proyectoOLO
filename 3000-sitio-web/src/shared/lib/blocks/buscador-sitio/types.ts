/**
 * La forma del índice de búsqueda tal como la necesita el bloque.
 *
 * Se declara aquí y no se importa de `features/editor`: `shared/` no depende de las
 * features (`2-convenciones-del-proyecto.md` §5). Los tipos de la feature
 * (`PaginaIndiceBusqueda`, `ResultadoBusqueda`) cumplen estas formas de manera
 * estructural, así que `puck.config.tsx` —que sí puede importar de `features/`— le pasa
 * al bloque su servicio sin ninguna conversión.
 */
export interface ItemDelIndice {
  type: string;
  text: string;
  blockId?: string;
}

export interface PaginaDelIndice {
  href: string;
  slug?: string;
  titulo?: string;
  items: ItemDelIndice[];
}

export interface ResultadoDeBusqueda {
  href: string;
  type: string;
  text: string;
  context: string;
  blockId?: string;
}

/** Quién pide el índice. El bloque no sabe de dónde sale: lo inyecta `puck.config.tsx`. */
export type CargarIndice = () => Promise<PaginaDelIndice[]>;
