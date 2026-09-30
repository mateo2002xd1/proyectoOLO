/**
 * Punto de entrada público del módulo "Alertas de inversión" (regla de oro §0.3:
 * un módulo de dominio no importa archivos internos de otro). Hoy el único
 * consumidor externo es `app/(public)/alertas-inversion/page.tsx`, que monta la
 * vista completa.
 */

export { AlertasInversionView } from './components/alertas-inversion-view';
