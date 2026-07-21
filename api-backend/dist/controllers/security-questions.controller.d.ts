import { Request, Response, NextFunction } from 'express';
export declare const SecurityQuestionController: {
    getCatalog(_req: Request, res: Response): void;
    getQuestionKeysForUser(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    setupQuestions(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    verifyAnswersCtrl(req: Request, res: Response, next: NextFunction): Promise<void>;
    recoverPasswordCtrl(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=security-questions.controller.d.ts.map