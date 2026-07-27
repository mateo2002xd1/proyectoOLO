/**
 * Punto de entrada público del módulo de inicio (portada interna).
 *
 * Nada fuera de `features/inicio/` importa rutas internas de este módulo.
 * `RecursosVisuales` queda deliberadamente sin exportar: solo lo consume
 * `InicioView`, así que es un detalle de implementación del módulo.
 *
 * @see 4-reglas.md regla 6
 * @see 8-ciclo-editorial.md §3.1
 */

export { InicioView } from './ui/InicioView';
