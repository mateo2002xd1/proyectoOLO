import { SecurityQuestion } from '../infrastructure/db/models';
export declare const SecurityQuestionRepository: {
    findByUserId: (userId: string) => Promise<SecurityQuestion[]>;
    deleteByUserId: (userId: string) => Promise<number>;
    createBulk: (data: any[]) => Promise<SecurityQuestion[]>;
};
//# sourceMappingURL=security-questions.repository.d.ts.map