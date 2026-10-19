/**
 * Punto de entrada público del módulo "Alertas de inversión" (regla de oro §0.3:
 * un módulo de dominio no importa archivos internos de otro). Hoy el único
 * consumidor externo es `config/puck.config.tsx`, que monta la vista completa como
 * el bloque `AlertasInversion`.
 */

export { AlertasInversionView } from './components/alertas-inversion-view';
