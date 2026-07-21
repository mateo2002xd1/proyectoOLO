export declare const getCatalog: () => {
    key: string;
    label: string;
}[];
export declare const getQuestionKeysForUser: (email: string) => Promise<{
    key: any;
    label: any;
}[]>;
export declare const setupQuestions: (userId: string, questionsData: any[]) => Promise<{
    message: string;
}>;
export declare const verifyAnswers: (email: string, answersData: any[]) => Promise<import("../../infrastructure/db/models").User>;
export declare const recoverPassword: (email: string, answersData: any[], newPassword: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=security-questions.usecase.d.ts.map