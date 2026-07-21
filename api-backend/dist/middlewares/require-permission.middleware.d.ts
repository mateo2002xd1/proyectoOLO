import { Request, Response, NextFunction } from 'express';
export declare function requirePermission(permissionName: string): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=require-permission.middleware.d.ts.map