/**
 * Los cinco tamaños del texto de una sección del menú (`normal` es el de hoy, 15 px).
 *
 * Vive aparte y sin imports a propósito: lo usan `header.tsx` y `puck.config.tsx`, y
 * `header.tsx` importa de `@/features/editor`, que termina cargando `puck.config.tsx`.
 * Exportado desde `header.tsx`, el editor lo leía antes de que ese módulo terminara
 * de cargarse: «Cannot access 'TAMANOS_TEXTO_MENU' before initialization».
 */
export const TAMANOS_TEXTO_MENU: Record<string, { label: string; valor: string }> = {
  pequeno: { label: 'Pequeño (14 px)', valor: '0.875rem' },
  normal: { label: 'Normal (15 px)', valor: '0.9375rem' },
  mediano: { label: 'Mediano (16 px)', valor: '1rem' },
  grande: { label: 'Grande (18 px)', valor: '1.125rem' },
  'muy-grande': { label: 'Muy grande (20 px)', valor: '1.25rem' },
};
