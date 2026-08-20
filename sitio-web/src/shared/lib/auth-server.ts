/**
 * Verificación de sesión server-side para Route Handlers de sitio-web.
 *
 * Espejo de `intranet/src/shared/lib/auth-server.ts`, con la diferencia que importa:
 * aquí la cookie es `sitio_token` y no `token` (ver `auth-cookies.ts` para el porqué
 * de los nombres separados).
 *
 * Usa `jwtVerify` —firma comprobada— y no `decodeJwt`. La distinción no es cosmética:
 * `decodeJwt` solo desempaqueta el JSON, así que acepta un token que cualquiera puede
 * escribir a mano. Sirve en `middleware.ts`, donde la decisión es qué pantalla pintar;
 * no sirve aquí, donde la decisión es si se escribe un archivo en disco.
 *
 * @see 3-seguridad-del-proyecto.md §0.4 — La autorización SIEMPRE se verifica server-side
 * @see 3-seguridad-del-proyecto.md §S1  — Subida de archivos: autenticación obligatoria
 */

import { jwtVerify } from 'jose';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';

/**
 * Lee una cookie del header `Cookie` por nombre exacto.
 *
 * Comparar con `startsWith(nombre + '=')` sobre la cadena entera sería suficiente hoy,
 * pero se rompe en cuanto exista una cookie cuyo nombre termine igual que otra
 * —`token` y `sitio_token` son justamente ese caso—, así que se parte por `;` y se
 * compara el nombre completo.
 */
function leerCookie(cookieHeader: string, nombre: string): string | undefined {
  for (const parte of cookieHeader.split(';')) {
    const separador = parte.indexOf('=');
    if (separador === -1) continue;
    if (parte.slice(0, separador).trim() === nombre) {
      return parte.slice(separador + 1).trim();
    }
  }
  return undefined;
}

/**
 * Extrae y verifica el JWT de sesión de una Request de Next.js.
 *
 * @returns El payload si el token es válido y no ha expirado.
 * @throws Si no hay token, falta el secreto, la firma no cuadra o el token expiró.
 */
export async function verificarTokenDesdeRequest(
  request: Request
): Promise<Record<string, unknown>> {
  const token = leerCookie(request.headers.get('cookie') ?? '', AUTH_COOKIE_NAME);

  if (!token) {
    throw new Error('Sin autenticación');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Se falla en vez de dejar pasar: un secreto ausente no puede tratarse como
    // "no hace falta comprobar".
    throw new Error('JWT_SECRET no configurado en el servidor');
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

  return payload as Record<string, unknown>;
}
