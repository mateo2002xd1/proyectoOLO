import { z } from 'zod';

/** `POST /api/alertas-inversion/proyectos`: alta manual desde el formulario del panel. */
export const crearProyectoManualSchema = z
  .object({
    tipo: z.enum(['nuevo', 'expansion']),
    descripcion: z.string().trim().min(1).max(2000),
    empresa: z.string().trim().min(1).max(200),
    seccionId: z.string().uuid(),
    claseId: z.string().uuid().nullable().optional().default(null),
    fechaAnuncio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use el formato AAAA-MM-DD.'),
    fuenteUrl: z.string().trim().url().regex(/^https?:\/\//i, 'La fuente debe ser una URL http(s).'),
    fuenteMedio: z.string().trim().max(120).nullable().optional().default(null),
    inversionCop: z.coerce.number().min(0).nullable().optional().default(null),
    empleosEstimados: z.coerce.number().int().min(0).nullable().optional().default(null),
    departamento: z.string().trim().min(1).max(100),
    ciudad: z.string().trim().max(120).nullable().optional().default(null),
  })
  .strict();

/** `GET /api/alertas-inversion/grafico` y `/listado`: filtros del sitio público. */
export const filtroPublicoSchema = z.object({
  departamento: z
    .string()
    .regex(/^[0-9]{2}$/, 'Use el código DANE de dos dígitos.')
    .optional()
    .transform((valor) => valor || undefined),
  anio: z.coerce.number().int().min(1900).max(9999).optional(),
});

export const listadoPublicoSchema = filtroPublicoSchema.extend({
  seccion: z
    .string()
    .regex(/^[A-Z]$/)
    .optional(),
  pagina: z.coerce.number().int().min(1).max(10_000).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(20),
});

export const idCargaSchema = z.string().uuid();
