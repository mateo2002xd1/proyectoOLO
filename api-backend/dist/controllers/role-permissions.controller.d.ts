import { Request, Response, NextFunction } from 'express';
export declare const RolePermissionController: {
    getAll(_req: Request, res: Response, next: NextFunction): Promise<void>;
    getByRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    assign(req: Request, res: Response, next: NextFunction): Promise<void>;
    revoke(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=role-permissions.controller.d.ts.map