"use strict";
// Validators - Paginas
// Stub: Implementar con Zod según §13.2 del ARQUITECTURA.md
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginaSchema = void 0;
const zod_1 = require("zod");
exports.paginaSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    contenido: zod_1.z.array(zod_1.z.object({
        tipo: zod_1.z.string(),
        datos: zod_1.z.record(zod_1.z.unknown()),
    })),
});
//# sourceMappingURL=paginas.validators.js.map