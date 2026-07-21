import { Model } from 'sequelize';
export declare class SecurityQuestion extends Model {
    id: string;
    user_id: string;
    question_key: string;
    answer_hash: string;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=SecurityQuestion.d.ts.map