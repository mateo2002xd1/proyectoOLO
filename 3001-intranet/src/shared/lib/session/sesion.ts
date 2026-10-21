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
import { cache } from 'react';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { apiClient } from '../api/api-client';
import { permisosEditan, rolEdita } from './edicion';

export interface Sesion {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

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
 * pero no editan, así que para ellas esto es `false`. Las reglas están en `edicion.ts`,
 * que comparte con el login.
 */
export async function puedeEditarPaginas(): Promise<boolean> {
  const sesion = await obtenerSesion();

  if (rolEdita(sesion?.rol)) {
    return true;
  }

  if (!sesion) {
    return false;
  }

  return permisosEditan(await permisosDeLaSesion());
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

/**
 * Los permisos de la sesión actual, preguntados a la API.
 *
 * No salen del token: el JWT lleva el rol, no las claves. Para decidir si se pinta
 * «Nueva sección» no basta con el rol —`secciones.crear` se concede aparte, y un
 * Editor puede tenerlo o no— y adivinarlo llevaba a una de dos: esconder la acción a
 * quien sí puede, o pintar un botón que responde 403.
 *
 * `cache()` de React lo deja en **una sola llamada por petición** aunque lo consulten
 * el layout y la página. Nunca lanza: si la API no responde, se devuelve la lista
 * vacía y como mucho se deja de pintar un botón — nunca se rompe la sección entera.
 */
export const permisosDeLaSesion = cache(async (): Promise<string[]> => {
  try {
    // Por `apiClient` y no por `fetch` a pelo para no repetir aquí la resolución de la
    // URL base, que en servidor y en navegador no es la misma.
    // `/me`, no `/auth/me`: `authRoutes` se monta en `/api` a secas (`app.ts`), así
    // que la ruta completa es `/api/me`. Con el prefijo de más esto devolvía 404, se
    // tragaba el fallo y el botón no se pintaba nunca — sin error visible en ningún
    // sitio, que es exactamente cómo un `catch` que devuelve lista vacía esconde un
    // problema de rutas.
    const datos = await apiClient.get<{ permisos?: unknown }>(
      '/me',
      await cabecerasConSesion()
    );
    return Array.isArray(datos.permisos) ? datos.permisos.map(String) : [];
  } catch {
    return [];
  }
});

/**
 * Si puede crear secciones nuevas.
 *
 * Esto decide qué se pinta. Quien decide de verdad es `POST /api/paginas`, que exige
 * la misma clave y responde 403 sin mirar lo que crea el navegador.
 */
export async function puedeCrearSecciones(): Promise<boolean> {
  return (await permisosDeLaSesion()).includes('secciones.crear');
}

/**
 * Si puede eliminar secciones.
 *
 * Clave aparte de la de crear: crear añade, eliminar destruye y no se deshace. Igual
 * que arriba, esto solo decide qué se pinta — `DELETE /api/paginas/:slug` exige la
 * misma clave y además vuelve a comprobar que la sección no sea de fábrica y que nada
 * la enlace.
 */
export async function puedeEliminarSecciones(): Promise<boolean> {
  return (await permisosDeLaSesion()).includes('secciones.eliminar');
}
