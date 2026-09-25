/**
 * Segunda puerta del módulo, para el catálogo de bloques de Puck.
 *
 * La barra de navegación (`shared/lib/blocks/plantilla/intranet-topbar.tsx`) es un
 * bloque de `config/puck.config.tsx` y necesita el índice del buscador. No puede
 * pedirlo a `index.ts`, porque cerraría un ciclo: `index.ts` exporta
 * `ClientPuckRender`, que importa `puck.config`, que importa la barra, que volvería
 * a `index.ts`. Esta puerta solo trae lo que ese árbol necesita y nada que dependa
 * de `puck.config`. Es el mismo arreglo que `client.ts` en sitio-web.
 */

export { obtenerIndiceBusqueda } from './publicacion/services/publicacion.service';
export type { ItemTextoBusqueda, PaginaIndiceBusqueda } from './model/pagina.types';
