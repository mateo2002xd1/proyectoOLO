import axios from 'axios';
import type { Data } from '@puckeditor/core';
import { Pagina, PaginaVersion, PaginaEditable, PaginaEnRevision, Bloque, PuckData, Ambito, PaginaIndiceBusqueda } from '../types';
import { homeFallbackData } from '../lib/home-fallback-data';
import { SITIO_ESTATICO_FALLBACK } from '../lib/sitio-busqueda-fallback';
import { etiquetaDePagina } from '../lib/etiquetas-cache';
import { cerrarSesionLocal, pedirJson } from '@/shared/lib/api-client';

// El sitio y la intranet comparten la tabla `paginas` y ambos tienen su `/inicio`.
// Esta cabecera es lo que le dice a la API a cuál de las dos pertenece cada página.
const AMBITO_HEADERS = { 'X-Ambito': 'sitio' } as const;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 5000,
  headers: AMBITO_HEADERS,
});

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function obtenerPagina(slug: string): Promise<Pagina | null> {
  try {
    const { data } = await api.get(`/api/paginas/publica/${slug}`);
    return data;
  } catch {
    return null;
  }
}

/**
 * Contenido editable para el editor: última versión (borrador/en_revisión/
 * publicado/rechazado), no solo la publicada. Nunca 404 — si la página aún no
 * existe, el backend devuelve contenido vacío para arrancar en limpio.
 */
export async function obtenerPaginaEditable(slug: string): Promise<PaginaEditable | null> {
  try {
    const { data } = await api.get(`/api/paginas/${slug}/editable`);
    return data;
  } catch {
    return null;
  }
}

/**
 * Una página publicada, leída con caché.
 *
 * `obtenerPagina` va por axios y no cachea nada, así que no sirve para lo que se
 * lee en cada request de cada página del sitio —la plantilla—: serían tantas
 * peticiones al backend como visitas. Esto usa `fetch` con `revalidate`, que Next
 * sí deduplica y cachea, y corta a los 5s para que un backend lento no cuelgue el
 * render. Devuelve `null` en cualquier fallo: quien llama decide qué pintar.
 */
export async function obtenerPaginaPublicadaCacheada(slug: string): Promise<Pagina | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/publica/${slug}`, {
      headers: AMBITO_HEADERS,
      // La etiqueta es lo que permite que aprobar una página se vea al instante: la API
      // llama a `/api/revalidar` al publicar y esta entrada se tira ahí mismo. El
      // `revalidate` se queda como red de seguridad para lo que cambie sin pasar por esa
      // ruta (una edición directa en la base, un despliegue del backend sin secreto).
      next: { revalidate: 60, tags: [etiquetaDePagina(slug)] },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function
  obtenerPaginaInicio(): Promise<Data> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/publica/inicio`, {
      headers: AMBITO_HEADERS,
      next: { revalidate: 60, tags: [etiquetaDePagina('inicio')] },
      signal: AbortSignal.timeout(5000), // 5s max — nunca bloquear el inicio
    });
    if (!res.ok) return homeFallbackData;

    const pageData = await res.json();
    if (!pageData?.contenido) return homeFallbackData;

    if (typeof pageData.contenido !== 'string') return pageData.contenido;

    try {
      return JSON.parse(pageData.contenido);
    } catch (err) {
      console.error('Failed to parse pageData.contenido', err);
      return homeFallbackData;
    }
  } catch (err) {
    console.error('Failed to fetch home page data:', err);
    return homeFallbackData;
  }
}

export async function guardarBorrador(slug: string, contenido: PuckData | Bloque[]): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.post(`/api/paginas/${slug}/borrador`, { contenido });
  return data;
}

/**
 * Anota que `ruta` se subió para esta página, para que al publicarla se borre si
 * ninguna versión la usa. Si falla, la subida sigue sirviendo igual.
 */
export async function registrarSubidaPendiente(slug: string, ruta: string): Promise<void> {
  await api.post(`/api/paginas/${slug}/subidas`, { ruta }).catch(() => undefined);
}

export function notificarRevisionActualizada(detail?: { slug?: string; id?: string }) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('olo:revision-actualizada', { detail }));
  }
}

export async function enviarARevision(slug: string): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(`/api/paginas/${slug}/enviar-revision`);
  notificarRevisionActualizada({ slug });
  return data;
}

/**
 * Al aprobar o rechazar hay que decir sobre qué aplicación se actúa: el mismo slug
 * existe en el sitio y en la intranet, y esta cola reúne las dos. Sin este ámbito
 * explícito se aprobaría siempre la del sitio.
 */
const cabeceraDeAmbito = (ambito: Ambito) => ({ headers: { 'X-Ambito': ambito } });

export async function aprobarPagina(
  slug: string,
  ambito: Ambito = 'sitio'
): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(`/api/paginas/${slug}/aprobar`, undefined, cabeceraDeAmbito(ambito));
  notificarRevisionActualizada({ slug });
  return data;
}

export async function rechazarPagina(
  slug: string,
  motivo: string,
  ambito: Ambito = 'sitio'
): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(
    `/api/paginas/${slug}/rechazar`,
    { motivo },
    cabeceraDeAmbito(ambito)
  );
  notificarRevisionActualizada({ slug });
  return data;
}

/**
 * Descarta una versión sin publicar. Si era la única de la página, la página se
 * elimina con ella y la siguiente edición vuelve a empezar por la versión 1.
 */
export async function eliminarVersion(
  slug: string,
  versionId: string,
  motivo: string | null,
  ambito: Ambito = 'sitio'
): Promise<{ paginaEliminada: boolean; versionesRestantes: number }> {
  const { data } = await api.delete(
    `/api/paginas/${slug}/versiones/${versionId}`,
    { data: { motivo }, ...cabeceraDeAmbito(ambito) }
  );
  notificarRevisionActualizada({ slug, id: versionId });
  return data;
}

export async function listarEnRevision(): Promise<PaginaEnRevision[]> {
  const { data } = await api.get('/api/paginas/en-revision');
  return data;
}

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

/**
 * Registra una visita en el backend de forma segura y no bloqueante.
 */
export async function registrarVisita(slug: string, ambito: 'sitio' | 'intranet' = 'sitio'): Promise<void> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/paginas/visitas/registrar`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ambito': ambito,
      },
      body: JSON.stringify({ slug, ambito }),
      keepalive: true,
    });
  } catch {
    // Falla silenciosamente para no alterar la experiencia del usuario
  }
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
export async function permisosDeLaSesion(): Promise<string[]> {
  try {
    // `/api/me`, no `/api/auth/me`: `authRoutes` se monta en `/api` a secas.
    const { data } = await api.get('/api/me');
    return Array.isArray(data?.permisos) ? data.permisos.map(String) : [];
  } catch (error) {
    const estado = (error as { response?: { status?: number } })?.response?.status;
    if (estado === 401) void cerrarSesionLocal();
    return [];
  }
}

/** Lo que responde la API al pedir el candado de edición. */
export interface EstadoDelBloqueo {
  /** `true` si el candado quedó a nombre de quien lo pidió. */
  propio: boolean;
  /** Solo cuando no es propio: quién lo tiene abierto. */
  bloqueadoPor: { nombre: string } | null;
  /** Si a esta persona le sale «Entrar de todos modos». */
  puedeForzar: boolean;
}

/**
 * Pide o renueva el candado de edición de una página.
 *
 * El 409 —«la tiene otra persona»— no es un fallo que haya que propagar: es una de
 * las dos respuestas normales, y trae dentro el nombre de quien está editando, que es
 * justo lo que hay que enseñar. Por eso se traduce a un objeto y no a una excepción.
 * Cualquier otro error sí sube, porque ahí sí pasa algo raro.
 */
export async function adquirirBloqueo(
  slug: string,
  forzar = false
): Promise<EstadoDelBloqueo> {
  try {
    const { data } = await api.post(`/api/paginas/${slug}/bloqueo`, { forzar });
    return data;
  } catch (fallo) {
    const respuesta = (fallo as { response?: { status?: number; data?: Partial<EstadoDelBloqueo> } })
      ?.response;
    if (respuesta?.status === 409) {
      return {
        propio: false,
        bloqueadoPor: respuesta.data?.bloqueadoPor ?? { nombre: 'Otra persona' },
        puedeForzar: respuesta.data?.puedeForzar === true,
      };
    }
    throw fallo;
  }
}

/**
 * Suelta el candado. No falla si ya no era suyo.
 *
 * Se llama también desde `pagehide`, así que va con `fetch` y `keepalive` en vez de
 * con axios: es lo que permite que la petición sobreviva a la pestaña que la lanzó.
 * Sin eso el navegador cancelaría el DELETE al cerrar y la página se quedaría
 * reservada hasta que el candado caducara solo.
 */
export async function liberarBloqueo(slug: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  await fetch(`${base}/api/paginas/${slug}/bloqueo`, {
    method: 'DELETE',
    credentials: 'include',
    keepalive: true,
    headers: AMBITO_HEADERS,
  }).catch(() => undefined);
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

/**
 * Obtiene el índice de búsqueda de páginas públicas del sitio web.
 * Usa fallback estático en caso de desconexión o fallo de red.
 */
export async function obtenerIndiceBusqueda(): Promise<PaginaIndiceBusqueda[]> {
  try {
    const { data } = await api.get<PaginaIndiceBusqueda[]>('/api/paginas/indice-busqueda');
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return SITIO_ESTATICO_FALLBACK;
  } catch (error) {
    console.warn('[sitio-web] No se pudo obtener índice dinámico de búsqueda, usando fallback:', error);
    return SITIO_ESTATICO_FALLBACK;
  }
}

