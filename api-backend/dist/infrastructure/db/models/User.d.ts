import { Model } from 'sequelize';
export declare class User extends Model {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role_id: string;
    status: string;
    expiration_date: Date | null;
    last_access_at: Date | null;
    must_setup_security_questions: boolean;
    must_change_password: boolean;
    failed_security_attempts: number;
    locked_until: Date | null;
    created_at: Date;
    updated_at: Date;
    role?: any;
}
//# sourceMappingURL=User.d.ts.map