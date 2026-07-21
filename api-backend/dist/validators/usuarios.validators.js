"use strict";
// Validators - Usuarios
// Stub: Implementar con Zod según §13.2 del ARQUITECTURA.md
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioSchema = void 0;
const zod_1 = require("zod");
exports.usuarioSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    rol: zod_1.z.enum(['superadmin', 'administrador', 'editor', 'director', 'subdirector']),
});
//# sourceMappingURL=usuarios.validators.js.map