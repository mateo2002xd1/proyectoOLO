/**
 * Años que admite una carga de tendencia ocupacional: cualquiera de cuatro cifras. No hay
 * regla de rango —se cargan años anteriores a la serie y proyecciones hacia adelante—; la
 * API (`cargaTendenciaSchema`) y el CHECK de la base (migración 035) piden lo mismo.
 */
export const RANGO_ANIOS_TENDENCIA = { min: 1000, max: 9999 } as const;
