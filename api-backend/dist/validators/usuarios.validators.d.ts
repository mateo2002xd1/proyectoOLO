import { z } from 'zod';
export declare const usuarioSchema: z.ZodObject<{
    nombre: z.ZodString;
    email: z.ZodString;
    rol: z.ZodEnum<["superadmin", "administrador", "editor", "director", "subdirector"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nombre: string;
    rol: "superadmin" | "administrador" | "editor" | "director" | "subdirector";
}, {
    email: string;
    nombre: string;
    rol: "superadmin" | "administrador" | "editor" | "director" | "subdirector";
}>;
//# sourceMappingURL=usuarios.validators.d.ts.map