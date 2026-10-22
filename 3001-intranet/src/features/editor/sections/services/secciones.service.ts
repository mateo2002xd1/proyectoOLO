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

/** Un sitio del portal que enlaza a la sección que se quiere borrar o renombrar. */
export interface ReferenciaAEnlace {
  slug: string;
  titulo: string;
  texto: string | null;
  /** Tipo del bloque de Puck que tiene el enlace (`IntranetTopbar`, `IntranetFooter`…). */
  bloque?: string | null;
  /** Prop de ese bloque donde está (`enlacesFila3`, `navLinks`…). */
  campo?: string | null;
  /** De qué versión es el enlace: lo publicado, lo que espera aprobación o un borrador. */
  estado?: 'publicado' | 'en_revision' | 'borrador';
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

/** Alguien con una página abierta en el editor. */
export interface PaginaEnEdicion {
  slug: string;
  titulo: string;
  usuario: string;
}

/** Dónde se usa la dirección de una página, antes de cambiarla. */
export interface UsoDeLaDireccion {
  id: string;
  slug: string;
  titulo: string;
  ambito: "sitio" | "intranet";
  /** La portada y «Menú y pie»: su dirección no se cambia. */
  protegida: boolean;
  referencias: ReferenciaAEnlace[];
  paginasConEnlaces: number;
  /** Quién tiene abierta esta página o alguna de las que la enlazan. */
  enEdicion: PaginaEnEdicion[];
}

/**
 * Dónde se usa la dirección de la página, sin cambiar nada.
 *
 * Lo pide el diálogo de «Editar dirección» al abrirse. No depende de la dirección nueva:
 * se pide una sola vez, no con cada tecla.
 */
export async function consultarUsoDeDireccion(slug: string): Promise<UsoDeLaDireccion> {
  return apiClient.get<UsoDeLaDireccion>(`/paginas/${slug}/direccion`);
}

export interface ValidacionDeDireccion {
  /** Lo escrito, ya normalizado (`Bolsa de empleo` → `bolsa-de-empleo`). */
  valor: string;
  valida: boolean;
  motivo: 'vacia' | 'igual' | 'invalida' | 'ocupada' | null;
  mensaje: string | null;
}

/** Si lo que se está escribiendo sirve como dirección nueva. Barata: se repite al teclear. */
export async function validarNuevaDireccion(
  slug: string,
  nueva: string
): Promise<ValidacionDeDireccion> {
  return apiClient.get<ValidacionDeDireccion>(
    `/paginas/${slug}/direccion/validacion?nueva=${encodeURIComponent(nueva)}`
  );
}

export interface DireccionCambiada {
  id: string;
  slugAnterior: string;
  slug: string;
  titulo: string;
  ambito: "sitio" | "intranet";
  enlacesActualizados: number;
  paginasActualizadas: { slug: string; titulo: string }[];
}

/**
 * Cambia la dirección de la página y, con `actualizarEnlaces`, los enlaces que la apuntaban.
 */
export async function cambiarDireccion(
  slug: string,
  nuevaDireccion: string,
  actualizarEnlaces: boolean
): Promise<DireccionCambiada> {
  return apiClient.patch<DireccionCambiada>(`/paginas/${slug}/direccion`, {
    nuevaDireccion,
    actualizarEnlaces,
  });
}

export interface DatosDeSesionCliente {
  rol: string;
  permisos: string[];
}

/**
 * Los datos y permisos de la sesión actual, pedidos desde el navegador.
 */
export async function pedirDatosDeLaSesion(): Promise<DatosDeSesionCliente> {
  const datos = await apiClient.get<{ user?: { role?: string }; permisos?: string[] }>("/me");
  return {
    rol: (datos.user?.role ?? '').trim().toLowerCase(),
    permisos: Array.isArray(datos.permisos) ? datos.permisos.map(String) : [],
  };
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
  const datos = await pedirDatosDeLaSesion();
  return datos.permisos;
}
