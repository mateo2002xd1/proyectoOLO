'use client';

/**
 * Re-exportación para compatibilidad hacia atrás.
 * La implementación real ahora vive en `@olo/blocks-renderer` y se comparte con `intranet`.
 */
export {
  tabsConfig as seccionPestanasLateralesConfig,
  TabsRender as SeccionPestanasLaterales,
  MAX_TABS,
} from '@olo/blocks-renderer';

export type {
  TabsProps as SeccionPestanasLateralesProps,
  TabItem,
} from '@olo/blocks-renderer';
