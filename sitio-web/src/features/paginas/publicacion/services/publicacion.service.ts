/**
 * Lecturas públicas de páginas: lo que ve quien visita el sitio.
 *
 * Etapa 6 del ciclo editorial (`8-ciclo-editorial.md` §3.2). Regla de esta etapa: **nunca
 * usa el cliente con sesión**. Todo lo de aquí va a rutas de la API declaradas antes de su
 * `requireAuth` (`/api/paginas/publica/:slug`, `/indice-busqueda`, `/visitas/registrar`),
 * así que no necesita cookies, y no mandarlas deja claro que no dependen de quién mire.
 *
 * Las escrituras y las lecturas de administración están en `edicion/`, `revision/` y
 * `secciones/`, cada una con su servicio.
 */
import axios from 'axios';
import type { Data } from '@puckeditor/core';
import type { Pagina, PaginaIndiceBusqueda } from '../../model/pagina.types';
import { CABECERAS_DEL_SITIO } from '../../model/ambito';
import { homeFallbackData } from '../../model/home-fallback-data';
import { SITIO_ESTATICO_FALLBACK } from '../lib/sitio-busqueda-fallback';
import { etiquetaDePagina } from '../lib/etiquetas-cache';
import { URL_DE_LA_API } from '@/shared/lib/url-de-la-api';

/** Cliente anónimo: sin `withCredentials`, a diferencia del de `services/`. */
const apiPublica = axios.create({
  baseURL: URL_DE_LA_API,
  timeout: 5000,
  headers: CABECERAS_DEL_SITIO,
});

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function obtenerPagina(slug: string): Promise<Pagina | null> {
  try {
    const { data } = await apiPublica.get(`/api/paginas/publica/${slug}`);
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
      headers: CABECERAS_DEL_SITIO,
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

export async function obtenerPaginaInicio(): Promise<Data> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/paginas/publica/inicio`, {
      headers: CABECERAS_DEL_SITIO,
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

/**
 * Registra una visita en el backend de forma segura y no bloqueante.
 */
export async function registrarVisita(slug: string, ambito: 'sitio' | 'intranet' = 'sitio'): Promise<void> {
  try {
    const url = `${URL_DE_LA_API}/api/paginas/visitas/registrar`;
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

let cachePromesaIndice: Promise<PaginaIndiceBusqueda[]> | null = null;
let fechaCacheIndice = 0;

/**
 * Obtiene el índice de búsqueda de páginas públicas del sitio web.
 * Usa fallback estático en caso de desconexión o fallo de red.
 * Implementa una caché en memoria de 5 minutos para evitar saturar el backend.
 */
export function obtenerIndiceBusqueda(): Promise<PaginaIndiceBusqueda[]> {
  const AHORA = Date.now();
  
  // Reutiliza la promesa si existe y tiene menos de 5 minutos
  if (cachePromesaIndice && AHORA - fechaCacheIndice < 5 * 60 * 1000) {
    return cachePromesaIndice;
  }

  cachePromesaIndice = apiPublica.get<PaginaIndiceBusqueda[]>('/api/paginas/indice-busqueda')
    .then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return SITIO_ESTATICO_FALLBACK;
    })
    .catch((error) => {
      console.warn('[sitio-web] No se pudo obtener índice dinámico de búsqueda, usando fallback:', error);
      cachePromesaIndice = null; // En caso de error, permitimos que se reintente inmediatamente la próxima vez
      return SITIO_ESTATICO_FALLBACK;
    });

  fechaCacheIndice = AHORA;
  return cachePromesaIndice;
}
