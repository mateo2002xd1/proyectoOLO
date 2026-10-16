/**
 * El contorno de las etiquetas de color (flags) de las tablas del panel en modo oscuro.
 *
 * Las de fondo oscuro («Intranet» y «Editado» en #001631, «Actualizado» en #00304D,
 * «Verificado», «Modificado») se fundían con el fondo de la tabla (#0f1626) y solo se
 * leía la letra. Un aro claro y fino marca el borde sin cambiar los colores que eligió el
 * usuario, y en las claras apenas se nota (pedido del usuario, 2026-10-15). Lo usan
 * `colorDeAccion` (Auditoría) y `CeldaDePagina` (Respaldos y Páginas en revisión).
 */
export const CONTORNO_DE_ETIQUETA_EN_OSCURO = 'dark:ring-1 dark:ring-white/30';
