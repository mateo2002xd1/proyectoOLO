/**
 * Entradas de la tendencia ocupacional (percentiles).
 *
 * Los catálogos cerrados (periodos, niveles, criterios) se repiten aquí para rechazar en
 * la puerta lo que no existe; su fuente de verdad sigue siendo la base (migración 033).
 *
 * @see criterios/analisis-normalizacion-percentiles-ocupacionales.md §9
 */

import { z } from 'zod';

export const CODIGOS_PERIODO = ['T1', 'T2', 'T3', 'T4', 'S1', 'S2', 'ANUAL'] as const;
const CODIGOS_NIVEL = ['0', 'A', 'B', 'C', 'D'] as const;
/** `criterios_ocupacionales.codigo`: el id es un UUID (migración 037) y no sale de la API. */
const CODIGOS_CRITERIO = [
  'ALTA_OFERTA_ALTA_DEMANDA',
  'ALTA_OFERTA_BAJA_DEMANDA',
  'BAJA_OFERTA_ALTA_DEMANDA',
  'BAJA_OFERTA_BAJA_DEMANDA',
] as const;

/**
 * Cualquier año de cuatro cifras: no hay rango de negocio (se cargan años anteriores a 2012
 * y proyecciones hacia adelante). El CHECK de la base pide lo mismo (migración 035).
 */
const anio = z.coerce.number().int().min(1000).max(9999);

/** Un querystring trae texto: solo `true` y `false` cuentan como booleano. */
const booleanoDeQuery = z.enum(['true', 'false']).transform((valor) => valor === 'true');

/**
 * `GET /api/observatorio/tendencia-ocupacional`. Sin `.strict()` a propósito: en un
 * querystring público es normal que lleguen parámetros ajenos (rastreadores, caché) y
 * se ignoran; lo declarado es lo único que llega al SQL.
 */
export const consultaTendenciaSchema = z.object({
  anio,
  periodo: z.enum(CODIGOS_PERIODO),
  /** `nacional` (la hoja nacional) o el código DANE del departamento. */
  departamento: z.string().regex(/^(nacional|[0-9]{2})$/, 'Use «nacional» o el código DANE de dos dígitos.'),
  /** Código del criterio. Omitido o vacío = los cuatro. */
  criterio: z
    .enum(CODIGOS_CRITERIO)
    .or(z.literal('').transform(() => undefined))
    .optional(),
  /** Omitido = "Todos". */
  nivel: z.enum(CODIGOS_NIVEL).optional(),
  /** Parte del nombre o código exacto de la ocupación. */
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((valor) => valor || undefined),
  /** Las ocupaciones con 0 inscritos y 0 vacantes se ocultan salvo que se pidan. */
  incluirSinRegistros: booleanoDeQuery.optional().default('false'),
  pagina: z.coerce.number().int().min(1).max(10_000).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(20),
});

/** `GET /api/observatorio/tendencia-ocupacional/cargas`: historial filtrado por celda. */
export const historialCargasSchema = z.object({
  anio: anio.optional(),
  periodo: z.enum(CODIGOS_PERIODO).optional(),
  pagina: z.coerce.number().int().min(1).max(10_000).default(1),
  porPagina: z.coerce.number().int().min(1).max(50).default(10),
});

/** `GET /api/observatorio/tendencia-ocupacional/opciones`. */
export const opcionesTendenciaSchema = z.object({
  anio: anio.optional(),
});

/**
 * Campos de texto del `multipart/form-data` de la subida (el archivo va aparte, en
 * `req.file`). Todo llega como texto; `.strict()` porque es una ruta de escritura.
 */
export const cargaTendenciaSchema = z
  .object({
    anio,
    periodo: z.enum(CODIGOS_PERIODO),
  })
  .strict();

export const publicarCortesSchema = z
  .object({
    corteIds: z.array(z.string().uuid()).min(1).max(200),
  })
  .strict();

export const idCorteSchema = z.string().uuid();

export const idCargaSchema = z.string().uuid();
