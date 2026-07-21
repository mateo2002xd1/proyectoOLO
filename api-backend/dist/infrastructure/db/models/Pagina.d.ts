import { Model } from 'sequelize';
export declare class Pagina extends Model {
    id: string;
    slug: string;
    titulo: string;
    versionPublicadaId: string | null;
    creadoPor: string;
    versionPublicada?: any;
    creador?: any;
    versiones?: any[];
}
//# sourceMappingURL=Pagina.d.ts.map