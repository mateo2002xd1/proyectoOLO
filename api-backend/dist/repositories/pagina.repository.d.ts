import { Pagina, PaginaVersion } from '../infrastructure/db/models';
export declare const PaginaRepository: {
    findBySlug: (slug: string) => Promise<Pagina | null>;
    crear: (data: any) => Promise<Pagina>;
    actualizarPagina: (pagina: Pagina, data: any) => Promise<Pagina>;
    findUltimaVersion: (paginaId: string) => Promise<PaginaVersion | null>;
    findVersionPorEstado: (paginaId: string, estado: string) => Promise<PaginaVersion | null>;
    crearVersion: (data: any) => Promise<PaginaVersion>;
    actualizarVersion: (version: PaginaVersion, data: any) => Promise<PaginaVersion>;
    findVersionPorId: (id: string) => Promise<PaginaVersion | null>;
    listarEnRevision: () => Promise<PaginaVersion[]>;
};
//# sourceMappingURL=pagina.repository.d.ts.map