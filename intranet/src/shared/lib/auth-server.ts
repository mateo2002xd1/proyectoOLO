/**
 * Helpers de autenticación server-side para Route Handlers de Next.js.
 *
 * Usa `jwtVerify` (verificación criptográfica completa con firma) en lugar de
 * `decodeJwt` (que solo decodifica sin validar). Route handlers como /api/upload
 * realizan operaciones con efectos reales en el sistema de archivos, por lo que
 * necesitan verificación completa, a diferencia del middleware global que solo
 * toma decisiones de UX.
 *
 * @see 3-seguridad-del-proyecto.md §0.4 — La autorización SIEMPRE se verifica server-side
 * @see 3-seguridad-del-proyecto.md §S1  — Subida de archivos: autenticación obligatoria
 */

import { jwtVerify } from 'jose';

/**
 * Extrae y verifica el JWT de la cookie `token` de una Request de Next.js.
 *
 * @returns El payload decodificado si el token es válido y no ha expirado.
 * @throws Si no hay token, la firma es inválida o el token expiró.
 */
export async function verificarTokenDesdeRequest(request: Request): Promise<Record<string, unknown>> {
  const cookieHeader = request.headers.get('cookie') ?? '';

  // Parsear la cookie `token` del header Cookie
  const tokenMatch = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('token='));

  const token = tokenMatch?.slice('token='.length);

  if (!token) {
    console.error('[auth-server] verificarTokenDesdeRequest: No se encontró la cookie token. Cookie header:', cookieHeader);
    throw new Error('Sin autenticación');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[auth-server] verificarTokenDesdeRequest: JWT_SECRET no está configurado');
    throw new Error('JWT_SECRET no configurado en el servidor');
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload as Record<string, unknown>;
  } catch (error) {
    console.error('[auth-server] verificarTokenDesdeRequest: jwtVerify falló:', error);
    throw error;
  }
}
