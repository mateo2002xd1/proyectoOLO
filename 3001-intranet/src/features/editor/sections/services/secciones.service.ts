/**
 * Crear y eliminar secciones, y los permisos que deciden qué acciones ofrece el
 * botón flotante. No es una etapa del ciclo editorial sino una parte del dominio
 * (ver `8-ciclo-editorial.md` §3.2).
 *
 * Endpoints backend:
 *   POST   /paginas               → crea la sección
 *   GET    /paginas/:slug/eliminable → qué se perdería al borrarla
 *   DELETE /paginas/:slug         → la borra
 *   GET    /me                    → las llaves de permiso de la sesión
 */

import { apiClient } from "@/shared/lib/api/api-client";

export interface SeccionCreada {
  id: string;
  slug: string;
  titulo: string;
  ambito: "sitio" | "intranet";
  /** La ruta lista para pegar en el menú, con la barra delante. */
  ruta: string;
  clavePermiso: string;
  /** El rol que recibió el permiso de editarla, o `null` si era superadmin. */
  rolConcedido: string | null;
}

/**
 * Crea una sección nueva.
 *
 * Solo manda el nombre: **la ruta la decide el servidor** con `@olo/slug-policy`. El
 * diálogo enseña una vista previa calculada con ese mismo paquete, así que coinciden,
 * pero mandar el slug desde aquí sería dejar que el navegador eligiera la clave de
 * permiso que se va a crear.
 *
 * La sección nace sin versión publicada: su ruta existe pero todavía no muestra nada
 * hasta que se llene y alguien la apruebe.
 */
export async function crearSeccion(titulo: string): Promise<SeccionCreada> {
  return apiClient.post<SeccionCreada>("/paginas", { titulo });
}

/** Un sitio del portal que enlaza a la sección que se quiere borrar. */
export interface ReferenciaAEnlace {
  slug: string;
  titulo: string;
  texto: string | null;
}

export interface AnalisisDeEliminacion {
  id: string;
  slug: string;
  titulo: string;
  ambito: "sitio" | "intranet";
  puedeEliminarse: boolean;
  motivo: "tiene-enlaces" | null;
  versiones: number;
  publicada: boolean;
  referencias: ReferenciaAEnlace[];
}

/**
 * Qué pasaría al borrar esta sección, sin borrar nada.
 *
 * Lo pide el diálogo al abrirse: cuántas versiones se pierden, si la ruta está viva y
 * —lo que de verdad decide— qué enlaces del portal apuntan ahí. El servidor lo vuelve
 * a calcular al borrar, así que esto es para informar, no para autorizar.
 */
export async function analizarEliminacion(slug: string): Promise<AnalisisDeEliminacion> {
  return apiClient.get<AnalisisDeEliminacion>(`/paginas/${slug}/eliminable`);
}

export interface SeccionEliminada {
  id: string;
  slug: string;
  titulo: string;
  versionesEliminadas: number;
  clavePermiso: string;
  rolesAfectados: string[];
}

/**
 * Borra la sección. No se deshace.
 *
 * `confirmacion` es el título tecleado a mano; el servidor lo compara con el que tiene
 * guardado y rechaza la petición si no coincide.
 */
export async function eliminarSeccion(
  slug: string,
  confirmacion: string
): Promise<SeccionEliminada> {
  return apiClient.delete<SeccionEliminada>(`/paginas/${slug}`, {
    body: JSON.stringify({ confirmacion }),
  });
}

/**
 * Las llaves de permiso de la sesión, pedidas desde el navegador.
 *
 * Es la versión de cliente de `permisosDeLaSesion` (`shared/lib/session/sesion.ts`), que lee
 * las cookies y solo funciona en el servidor. El botón flotante la necesita en el
 * navegador porque vuelve a preguntar cada vez que la pestaña recupera el foco: así,
 * si a alguien le quitan un permiso, el botón deja de ofrecerlo sin recargar.
 */
export async function pedirPermisosDeLaSesion(): Promise<string[]> {
  const datos = await apiClient.get<{ permisos?: string[] }>("/me");
  return Array.isArray(datos.permisos) ? datos.permisos.map(String) : [];
}
