/**
 * Íconos que ofrece el bloque «Portales externos».
 *
 * Son archivos SVG de una sola tinta en `public/assets/svg/portales/`. `IconoRenderer`
 * los pinta como máscara, así que toman el color que les dé el bloque y no el del
 * archivo. Para sumar uno: copiar el `.svg` a esa carpeta y agregar su fila aquí.
 *
 * Los tres de partida salen de Lucide (licencia ISC), a falta del paquete propio.
 *
 * Sin imports a propósito: lo lee `puck.config.tsx` al cargarse (ver el ciclo de
 * `TAMANOS_TEXTO_MENU`).
 */
export const CARPETA_ICONOS_DE_PORTALES = '/assets/svg/portales';

export const ICONOS_DE_PORTALES = [
  { id: `${CARPETA_ICONOS_DE_PORTALES}/pqrs.svg`, nombre: 'PQRS (documento)', tipo: 'archivo' as const },
  { id: `${CARPETA_ICONOS_DE_PORTALES}/denuncia.svg`, nombre: 'Denuncia (megáfono)', tipo: 'archivo' as const },
  { id: `${CARPETA_ICONOS_DE_PORTALES}/transparencia.svg`, nombre: 'Transparencia (apretón de manos)', tipo: 'archivo' as const },
];
