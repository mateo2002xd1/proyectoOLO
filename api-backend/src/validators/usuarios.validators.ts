// Validators - Usuarios
// Stub: Implementar con Zod según §13.2 del ARQUITECTURA.md

import { z } from 'zod';

export const usuarioSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  rol: z.enum(['superadmin', 'administrador', 'editor', 'director', 'subdirector']),
});
