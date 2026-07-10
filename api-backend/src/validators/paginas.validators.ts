// Validators - Paginas
// Stub: Implementar con Zod según §13.2 del ARQUITECTURA.md

import { z } from 'zod';

export const paginaSchema = z.object({
  titulo: z.string().min(1),
  slug: z.string().min(1),
  contenido: z.array(z.object({
    tipo: z.string(),
    datos: z.record(z.unknown()),
  })),
});
