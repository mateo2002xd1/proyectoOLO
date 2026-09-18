/**
 * Punto de entrada público del módulo programas-sobresalientes.
 *
 * Regla de oro §0.3: un módulo de dominio no importa archivos internos de
 * otro módulo. Todo lo que otros módulos necesiten de aquí se exporta desde
 * este archivo — y solo eso: lo que se exporta sin que nadie lo consuma
 * invita al acoplamiento que esta regla existe para evitar.
 *
 * Hoy los únicos consumidores externos son `config/puck.config.tsx` y
 * `app/(public)/programas-sobresalientes/page.tsx`, y ambos montan la vista
 * completa. El mapa, los filtros, la tabla y el hook son piezas internas de esa
 * vista: si otro módulo llega a necesitar una, se agrega aquí. (El paginador ya no
 * es propio: es `Paginacion`, de `shared/ui`, el mismo de todas las tablas.)
 */

export {
  ProgramasSobresalientesView,
  type ProgramasSobresalientesViewProps,
} from './components/programas-sobresalientes-view';
