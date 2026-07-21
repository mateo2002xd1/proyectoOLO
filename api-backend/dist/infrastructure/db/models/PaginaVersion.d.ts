import { Model } from 'sequelize';
export declare class PaginaVersion extends Model {
    id: string;
    paginaId: string;
    contenido: any;
    layout: any;
    numeroVersion: number;
    estado: 'borrador' | 'en_revision' | 'publicado' | 'rechazado';
    motivoRechazo: string | null;
    revisorId: string | null;
    publicadoPor: string | null;
    publicadoEn: Date | null;
    creadoEn: Date;
    pagina?: any;
    revisor?: any;
    publicador?: any;
}
//# sourceMappingURL=PaginaVersion.d.ts.map