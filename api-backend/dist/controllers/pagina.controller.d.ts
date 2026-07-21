import { Request, Response, NextFunction } from 'express';
export declare const PaginaController: {
    obtenerPublica(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    guardarBorrador(req: Request, res: Response, next: NextFunction): Promise<void>;
    enviarARevision(req: Request, res: Response, next: NextFunction): Promise<void>;
    aprobar(req: Request, res: Response, next: NextFunction): Promise<void>;
    rechazar(req: Request, res: Response, next: NextFunction): Promise<void>;
    listarEnRevision(_req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=pagina.controller.d.ts.map