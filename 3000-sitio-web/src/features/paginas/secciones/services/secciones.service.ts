/**
 * Llamadas de la gestión de secciones: crearlas, analizar y hacer su borrado, los
 * permisos de la sesión que deciden qué botones se pintan y el resumen de páginas
 * publicadas del panel.
 *
 * No es una etapa del ciclo sino una parte del dominio (`8-ciclo-editorial.md` §3.2).
 */
import { apiConSesion as api } from '../../model/api-con-sesion';
import type { Ambito } from '../../model/pagina.types';
import { cerrarSesionLocal, pedirJson } from '@/shared/lib/api-client';

/** Una página publicada, con lo justo para contarla y enlazarla. */
export interface PaginaPublicada {
  id: string;
  slug: string;
  titulo: string;
  visitas?: number;
}

/** Lo que devuelve `GET /api/paginas/publicadas`, ya separado por aplicación. */
export interface ResumenPaginasPublicadas {
  total: number;
  totalVisitas?: number;
  visitasSitio?: number;
  visitasIntranet?: number;
  sitio: PaginaPublicada[];
  intranet: PaginaPublicada[];
}

/**
 * Cuántas páginas están publicadas ahora mismo, en el sitio y en la intranet.
 *
 * Va por `pedirJson` y no por `api` (axios) para heredar el manejo central del 401: si
 * la sesión caducó, cierra y lleva al login en vez de dejar el panel con un cero que
 * parece un dato real.
 */
export async function resumenDePaginasPublicadas(): Promise<ResumenPaginasPublicadas> {
  return pedirJson<ResumenPaginasPublicadas>('/api/paginas/publicadas');
}

export interface SeccionCreada {
  id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  /** La ruta lista para pegar en el menú, con la barra delante. */
  ruta: string;
  clavePermiso: string;
  /** El rol que recibió el permiso de editarla, o `null` si era superadmin. */
  rolConcedido: string | null;
}

/**
 * Crea una sección nueva del sitio.
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
  const { data } = await api.post('/api/paginas', { titulo });
  return data;
}

/**
 * Los permisos de la sesión actual.
 *
 * Hace falta porque la cookie de rol —que es de donde los botones de esta app sacan
 * si pintarse— dice el rol, no las claves, y `secciones.crear` se concede aparte: un
 * Editor puede tenerlo o no. Devuelve lista vacía ante cualquier fallo, incluido el
 * 401 de no haber sesión, que aquí es lo normal y no un error.
 *
 * Ante un 401 **además** se cierra la sesión localmente, y esa parte sí importa: esta
 * función se llama desde páginas públicas, donde el middleware no pasa y por tanto nadie
 * limpia una cookie de rol que sobrevivió a su token. Sin ese cierre quedaba la interfaz
 * a medias —«Editar» visible porque lo decide la cookie, «Eliminar» y «Nueva sección»
 * ocultos porque los decide esta llamada—, que es exactamente el desconcierto que se
 * reportó. No se redirige a nadie: aquí un 401 puede ser simplemente un visitante.
 */
let cachePromesaPermisos: Promise<string[]> | null = null;
let fechaCachePermisos = 0;

/**
 * Los permisos de la sesión actual.
 * Utiliza una caché de 1 minuto y deduplicación de promesas para evitar que múltiples hooks
 * en el frontend (`usePermisoDeSeccion`, `PaginasFabSpeedDial`) inunden `/api/me`.
 */
export function permisosDeLaSesion(): Promise<string[]> {
  const AHORA = Date.now();
  
  if (cachePromesaPermisos && (AHORA - fechaCachePermisos) < 60 * 1000) {
    return cachePromesaPermisos;
  }

  // 20 s y no los 5 s del cliente: tras un rato sin tráfico la base (Neon) se duerme y
  // la primera consulta tarda más de 5 s en despertarla. Con el corte en 5 s los permisos
  // llegaban vacíos y el menú flotante se quedaba sin «Editar página» hasta volver a la
  // pestaña. Aquí esperar no cuesta nada: los botones simplemente aparecen un poco después.
  cachePromesaPermisos = api.get('/api/me', { timeout: 20000 })
    .then(({ data }) => {
      // Sesión abierta con la contraseña temporal o sin preguntas de seguridad (se
      // cerró la pestaña a mitad del primer ingreso). La API ya no le deja hacer nada
      // más, así que en vez de dejarla en el portal con los botones de edición a la
      // vista, se la lleva a terminar la configuración.
      if (data?.configuracionPendiente === true) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- servicio fuera de React, sin router; la recarga completa saca del portal la sesión a medio configurar
        window.location.href = '/login/first-login';
        return [];
      }
      return Array.isArray(data?.permisos) ? data.permisos.map(String) : [];
    })
    .catch((error) => {
      const estado = (error as { response?: { status?: number } })?.response?.status;
      if (estado === 401) void cerrarSesionLocal();
      cachePromesaPermisos = null; // Para no cachear el error y permitir reintento si hace login
      return [];
    });
    
  fechaCachePermisos = AHORA;
  return cachePromesaPermisos;
}

/** Un sitio del portal que enlaza a la página que se quiere borrar. */
export interface ReferenciaAEnlace {
  slug: string;
  titulo: string;
  texto: string | null;
}

export interface AnalisisDeEliminacion {
  id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  puedeEliminarse: boolean;
  motivo: 'tiene-enlaces' | null;
  versiones: number;
  publicada: boolean;
  referencias: ReferenciaAEnlace[];
}

/**
 * Qué pasaría al borrar esta página, sin borrar nada.
 *
 * Lo pide el diálogo al abrirse: cuántas versiones se pierden, si la ruta está viva y
 * —lo que de verdad decide— qué enlaces del portal apuntan ahí. El servidor lo vuelve
 * a calcular al borrar, así que esto informa, no autoriza.
 */
export async function analizarEliminacion(slug: string): Promise<AnalisisDeEliminacion> {
  const { data } = await api.get(`/api/paginas/${slug}/eliminable`);
  return data;
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
 * Borra la página. No se deshace.
 *
 * El cuerpo viaja en `data` porque así es como axios manda un cuerpo en un DELETE; sin
 * eso la confirmación no llega y el servidor la rechaza por no coincidir.
 */
export async function eliminarSeccion(
  slug: string,
  confirmacion: string
): Promise<SeccionEliminada> {
  const { data } = await api.delete(`/api/paginas/${slug}`, { data: { confirmacion } });
  return data;
}
