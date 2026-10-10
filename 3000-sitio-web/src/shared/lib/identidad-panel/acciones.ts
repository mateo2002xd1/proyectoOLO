/**
 * Las etiquetas de acción del panel y del editor: los tooltips de color que aparecen al
 * pasar por un botón («Aprobar», «Eliminar», «Guardar borrador»…). Desde el 2026-10-10 su
 * color se puede cambiar en Configuración → Identidad visual; aquí está el catálogo y el
 * color de fábrica de cada una, que es el que tenían escrito en cada pantalla.
 *
 * Cada etiqueta pinta su fondo y su letra con dos variables CSS
 * (`--olo-accion-{id}-fondo` y `-texto`) que escribe `EstilosDeIdentidad` en el panel y en
 * el editor. La API solo guarda las que alguien cambió; las demás salen de aquí.
 *
 * Un id nuevo: añadirlo a `ACCIONES_DEL_PANEL` y a `COLOR_DE_ACCION`. El id viaja a la API
 * y la bitácora lo muestra tal cual: minúsculas y guiones (`configuracion.validators.ts`).
 */

export type IdDeAccion =
  | 'visualizar'
  | 'ver-detalle'
  | 'aprobar'
  | 'rechazar'
  | 'editar'
  | 'eliminar'
  | 'activar'
  | 'desactivar'
  | 'salir-del-editor'
  | 'guardar-borrador'
  | 'enviar-a-revision';

export interface AccionDelPanel {
  id: IdDeAccion;
  /** Lo que dice la etiqueta, o el nombre con el que se reconoce. */
  nombre: string;
  /** Para que quien elige el color sepa qué está cambiando. */
  dondeAparece: string;
  grupo: 'panel' | 'editor';
  /** Colores de fábrica, `#rrggbb`. */
  fondo: string;
  texto: string;
}

export const ACCIONES_DEL_PANEL: readonly AccionDelPanel[] = [
  { id: 'visualizar', nombre: 'Visualizar', dondeAparece: 'Páginas en revisión', grupo: 'panel', fondo: '#1face3', texto: '#ffffff' },
  { id: 'ver-detalle', nombre: 'Ver detalle', dondeAparece: 'El ojo de Auditoría y Respaldos', grupo: 'panel', fondo: '#7db728', texto: '#ffffff' },
  // El id sigue siendo `aprobar` (es la clave guardada); el botón se llama «Publicar» desde 230a930d.
  { id: 'aprobar', nombre: 'Publicar', dondeAparece: 'Páginas en revisión', grupo: 'panel', fondo: '#7db728', texto: '#ffffff' },
  // La única con fondo claro y borde: así se distingue de «Eliminar», que también es roja.
  { id: 'rechazar', nombre: 'Rechazar', dondeAparece: 'Páginas en revisión', grupo: 'panel', fondo: '#ffe9e9', texto: '#d11a1a' },
  { id: 'editar', nombre: 'Editar', dondeAparece: 'Usuarios y Roles', grupo: 'panel', fondo: '#7db728', texto: '#ffffff' },
  { id: 'eliminar', nombre: 'Eliminar', dondeAparece: 'Páginas en revisión, Usuarios y Roles', grupo: 'panel', fondo: '#ef4444', texto: '#ffffff' },
  { id: 'activar', nombre: 'Activar', dondeAparece: 'Interruptor de estado en Usuarios', grupo: 'panel', fondo: '#7db728', texto: '#ffffff' },
  { id: 'desactivar', nombre: 'Desactivar', dondeAparece: 'Interruptor de estado en Usuarios', grupo: 'panel', fondo: '#52525b', texto: '#ffffff' },
  // Las tres del editor tienen además su color de fábrica de respaldo en `globals.css`
  // (`.olo-editor-btn--*`): si se cambia aquí, cambiarlo también allí.
  { id: 'salir-del-editor', nombre: 'Salir', dondeAparece: 'Cabecera del editor', grupo: 'editor', fondo: '#dc2626', texto: '#ffffff' },
  { id: 'guardar-borrador', nombre: 'Guardar borrador', dondeAparece: 'Cabecera del editor', grupo: 'editor', fondo: '#3b82f6', texto: '#ffffff' },
  // Azul marino sobre el verde, como el botón: 7.6:1; blanco quedaría en 2.4:1.
  { id: 'enviar-a-revision', nombre: 'Enviar a revisión', dondeAparece: 'Cabecera del editor', grupo: 'editor', fondo: '#7db728', texto: '#001631' },
];

/**
 * Las clases de cada etiqueta. Escritas enteras porque Tailwind solo genera lo que
 * encuentra literal en el código. Van con `TOOLTIP_ENCIMA` (`shared/ui/atoms/tooltip.ts`).
 * Las del editor no están: sus etiquetas son CSS propio (`.olo-editor-tooltip`, en
 * `globals.css`) y leen las mismas variables.
 */
export const COLOR_DE_ACCION = {
  visualizar: 'bg-(--olo-accion-visualizar-fondo) text-(color:--olo-accion-visualizar-texto)',
  'ver-detalle': 'bg-(--olo-accion-ver-detalle-fondo) text-(color:--olo-accion-ver-detalle-texto)',
  aprobar: 'bg-(--olo-accion-aprobar-fondo) text-(color:--olo-accion-aprobar-texto)',
  rechazar: 'border border-current bg-(--olo-accion-rechazar-fondo) text-(color:--olo-accion-rechazar-texto)',
  editar: 'bg-(--olo-accion-editar-fondo) text-(color:--olo-accion-editar-texto)',
  eliminar: 'bg-(--olo-accion-eliminar-fondo) text-(color:--olo-accion-eliminar-texto)',
  activar: 'bg-(--olo-accion-activar-fondo) text-(color:--olo-accion-activar-texto)',
  desactivar: 'bg-(--olo-accion-desactivar-fondo) text-(color:--olo-accion-desactivar-texto)',
} as const satisfies Partial<Record<IdDeAccion, string>>;
