/**
 * Esquemas de la identidad visual del panel (Configuración, migración 044).
 *
 * El valor se guarda en `configuracion.valor` (JSONB) y el esquema de la base solo exige
 * que sea un objeto, así que **esta es la única definición de su forma**: la usa la ruta
 * para validar lo que llega y el caso de uso para leer lo que hay guardado.
 *
 * @see 3-seguridad-del-proyecto.md §3
 */

import { z } from 'zod';

/**
 * Solo `#rrggbb`. No es estética: el frontend escribe estos valores dentro de una
 * etiqueta `<style>` del panel, y cualquier otra cosa que se admitiera aquí —`red`,
 * `rgb(…)`, `url(…)`, un `}` o un `</style>`— sería CSS o HTML inyectado en la página de
 * todas las personas del panel.
 */
const colorHex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Debe ser un color #rrggbb.')
  .transform((valor) => valor.toLowerCase());

/**
 * Las etiquetas de acción y los tipos de botón son catálogos del frontend (dónde están y de
 * qué color salen de fábrica); la API no los duplica. Se acota la forma del identificador y
 * cuántos caben, para que nadie llene la fila con claves inventadas.
 */
const idDeColor = z.string().regex(/^[a-z][a-z-]{0,39}$/, 'Identificador no válido.');

const MAXIMO_POR_CONJUNTO = 40;

const fondoYTexto = z.object({ fondo: colorHex, texto: colorHex }).strict();

/** Id → `{fondo, texto}`. Lo usan `acciones` (las etiquetas) y `botones` (los tipos de botón). */
const conjuntoDeColores = z
  .record(idDeColor, fondoYTexto)
  .refine((valor) => Object.keys(valor).length <= MAXIMO_POR_CONJUNTO, {
    message: `Como máximo ${MAXIMO_POR_CONJUNTO} colores.`,
  });

/**
 * El nombre que pone la subida: UUID y `.png`. Hasta el 10-10-2026 se aceptaba también JPG:
 * se sigue leyendo por si quedó alguno guardado, pero ya no se sube.
 */
const nombreDeArchivo = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg)$/);

/**
 * Lo que hay guardado. Todo opcional: lo que falta es «lo de fábrica», que decide el
 * frontend. Sin `.strict()` a propósito: al leer, una clave desconocida se descarta en
 * vez de dejar el panel sin identidad.
 */
export const identidadGuardadaSchema = z.object({
  logo: nombreDeArchivo.nullable().optional(),
  icono: nombreDeArchivo.nullable().optional(),
  blancoEnModoOscuro: z.boolean().optional(),
  acciones: conjuntoDeColores.optional(),
  botones: conjuntoDeColores.optional(),
});

export type IdentidadGuardada = z.infer<typeof identidadGuardadaSchema>;

/**
 * `PATCH /api/configuracion/identidad-panel`. Los archivos van por su propia ruta
 * (multipart); aquí solo los ajustes que caben en JSON.
 *
 * `acciones` y `botones` reemplazan su conjunto entero: el panel manda solo los que
 * difieren de fábrica, y el que ya no viene vuelve al de fábrica.
 */
export const actualizarIdentidadSchema = z
  .object({
    acciones: conjuntoDeColores.optional(),
    botones: conjuntoDeColores.optional(),
    blancoEnModoOscuro: z.boolean().optional(),
  })
  .strict()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No hay nada que actualizar.',
  });

export type CambiosDeIdentidad = z.infer<typeof actualizarIdentidadSchema>;

/** Las dos imágenes que se pueden subir. */
export const PIEZAS_DE_IDENTIDAD = ['logo', 'icono'] as const;
export type PiezaDeIdentidad = (typeof PIEZAS_DE_IDENTIDAD)[number];
