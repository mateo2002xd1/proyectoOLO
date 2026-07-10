import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { UserRepository } from '../repositories/usuarios.repository';
import jwt from 'jsonwebtoken';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies?.token;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : tokenFromCookie;

  if (!token) {
    console.log('[Auth] Token missing in headers/cookies');
    return res.status(401).json({ error: 'No autenticado' });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (err: any) {
    console.log('[Auth] Token verify failed:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  if (decoded.isLocal) {
    req.user = decoded;
    return next();
  }

  try {
    const user = await UserRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    if ((user as any).status !== 'active') return res.status(401).json({ error: 'Cuenta inactiva o suspendida' });
    if ((user as any).locked_until && new Date((user as any).locked_until) > new Date())
      return res.status(401).json({ error: 'Cuenta bloqueada temporalmente' });
    if ((user as any).expiration_date && new Date((user as any).expiration_date) < new Date())
      return res.status(401).json({ error: 'Cuenta expirada' });
  } catch (err) {
    return next(err);
  }

  req.user = decoded;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (!roles.includes(req.user.role || '')) return res.status(403).json({ error: 'Acceso denegado' });
    next();
  };
}
