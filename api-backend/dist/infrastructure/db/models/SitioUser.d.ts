import { Model } from 'sequelize';
export declare class SitioUser extends Model {
    id: string;
    name: string;
    email: string;
    password_hash: string | null;
    status: string;
    created_by: string | null;
    last_login_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=SitioUser.d.ts.map