/**
 * Lectura de la sesión en componentes de servidor.
 *
 * La cookie `token` es httpOnly, así que solo el servidor puede verla. La emite la
 * API :4000 al iniciar sesión, sin nombre propio por app: sitio-web usa su propia
 * cookie `sitio_token` (ver `sitio-web/src/shared/lib/auth-cookies.ts`) justamente
 * para que iniciar o cerrar sesión aquí no afecte la sesión del sitio en el mismo
 * navegador, aunque ambas compartan tabla `usuarios` y `JWT_SECRET`.
 *
 * Aquí el token se decodifica, no se valida criptográficamente: sirve para decidir
 * qué se pinta, no para conceder acceso. Quien manda es la API, que verifica la
 * firma y el rol en cada petición (`requierePermisoPagina`). Si esta lectura se
 * equivocara y mostrara un botón de más, la acción seguiría fallando con 403.
 */
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';

export interface Sesion {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

/** Roles con permiso de edición. Debe coincidir con `paginasPolicies` en la API. */
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor'];

export async function obtenerSesion(): Promise<Sesion | null> {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;

  try {
    const payload = decodeJwt(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return {
      id: String(payload.id ?? ''),
      email: String(payload.email ?? ''),
      nombre: String(payload.name ?? ''),
      rol: String(payload.role ?? ''),
    };
  } catch {
    return null;
  }
}

/**
 * Si el usuario puede editar páginas. Dirección y subdirección entran a la intranet
 * pero no editan, así que para ellas esto es `false`.
 */
export async function puedeEditarPaginas(): Promise<boolean> {
  const sesion = await obtenerSesion();
  return ROLES_QUE_EDITAN.includes((sesion?.rol ?? '').trim().toLowerCase());
}

/**
 * Cabeceras para llamar a la API desde un componente de servidor.
 *
 * En el navegador la cookie viaja sola con `credentials: 'include'`, pero en el
 * servidor no hay navegador que la ponga: hay que reenviarla a mano o la API
 * responde 401.
 */
export async function cabecerasConSesion(): Promise<RequestInit> {
  const cookie = (await cookies()).toString();
  return cookie ? { headers: { Cookie: cookie } } : {};
}
