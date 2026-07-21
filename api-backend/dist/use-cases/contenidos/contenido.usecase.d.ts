export declare const obtenerContenidos: (filters?: any) => Promise<import("../../infrastructure/db/models").Contenido[]>;
export declare const obtenerContenidoPorId: (id: string) => Promise<import("../../infrastructure/db/models").Contenido>;
export declare const crearContenido: (data: any, authorId?: string) => Promise<import("../../infrastructure/db/models").Contenido>;
export declare const actualizarContenido: (id: string, data: any) => Promise<import("../../infrastructure/db/models").Contenido>;
export declare const buscarContenidoGlobal: (term: string) => Promise<{
    contenidos: import("../../infrastructure/db/models").Contenido[];
}>;
export declare const eliminarContenido: (id: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=contenido.usecase.d.ts.map