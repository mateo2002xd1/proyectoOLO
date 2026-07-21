import { Request, Response, NextFunction } from 'express';
export declare const AuthController: {
    firstLogin(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(_req: Request, res: Response): void;
    me(req: Request, res: Response): void;
    changePassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=auth.controller.d.ts.map