/**
 * Punto de entrada público del módulo inicio.
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/inicio/` se exporta desde aquí.
 */

// Components
export { InicioView } from './components/inicio-view';
