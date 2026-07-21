import { z } from 'zod';
export declare const paginaSchema: z.ZodObject<{
    titulo: z.ZodString;
    slug: z.ZodString;
    contenido: z.ZodArray<z.ZodObject<{
        tipo: z.ZodString;
        datos: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        tipo: string;
        datos: Record<string, unknown>;
    }, {
        tipo: string;
        datos: Record<string, unknown>;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    slug: string;
    titulo: string;
    contenido: {
        tipo: string;
        datos: Record<string, unknown>;
    }[];
}, {
    slug: string;
    titulo: string;
    contenido: {
        tipo: string;
        datos: Record<string, unknown>;
    }[];
}>;
//# sourceMappingURL=paginas.validators.d.ts.map