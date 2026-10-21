/**
 * Cliente HTTP para comunicación con la API backend (:4000).
 *
 * @see 3-seguridad-del-proyecto.md §S3 (La API es la única que emite y valida el JWT)
 */

export class ApiError extends Error {
  /**
   * El cuerpo JSON de la respuesta, cuando lo hubo.
   *
   * Algunos errores traen datos que la pantalla necesita, no solo un mensaje: el 409
   * del candado de edición dice quién está editando y si quien pregunta puede
   * quitárselo. Sin esto habría que reventar el mensaje con una expresión regular
   * para recuperar lo que la API ya mandaba estructurado.
   */
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * En el navegador se pasa por el proxy `/api-backend`, que al reescribir ya añade
 * el prefijo `/api` de la API (ver `next.config.ts`). En el servidor se llama a la
 * API directamente, así que ese prefijo hay que ponerlo aquí: sin él las peticiones
 * caían en el 404 de Express, que no responde JSON.
 */
const API_BASE_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ?? '/api-backend'
    : `${process.env.API_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000'}/api`;

const DEFAULT_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options as RequestInit & { timeout?: number };
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- cliente de la API fuera de React, sin router; con la sesión caducada se recarga del todo
      window.location.href = '/login?logout=1';
    }
    throw new ApiError(401, 'No autenticado');
  }

  if (!response.ok) {
    // El cuerpo se lee una sola vez: intentar `json()` y luego `text()` sobre la
    // misma respuesta rompe con "Body has already been read" y convierte un error
    // legible de la API en un fallo genérico.
    const cuerpo = await response.text().catch(() => '');
    let message = cuerpo || 'Ocurrió un error inesperado';
    let datos: unknown;
    try {
      const errorData = JSON.parse(cuerpo);
      datos = errorData;
      message = errorData.error || errorData.message || message;
    } catch {
      // No era JSON: se queda el texto tal cual.
    }
    throw new ApiError(response.status, message, datos);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

function getDefaultHeaders(customHeaders?: HeadersInit) {
  return {
    'Content-Type': 'application/json',
    // El sitio y la intranet comparten la tabla `paginas` y ambos tienen su
    // `/inicio`. Esta cabecera es lo que le dice a la API a cuál de las dos
    // pertenece lo que se pide o se guarda.
    'X-Ambito': 'intranet',
    ...customHeaders,
  };
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  async get<T>(path: string, options?: RequestInit & { timeout?: number }): Promise<T> {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...options,
      method: 'GET',
      credentials: 'include',
      headers: getDefaultHeaders(options?.headers),
    });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown, options?: RequestInit & { timeout?: number }): Promise<T> {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...options,
      method: 'POST',
      credentials: 'include',
      headers: getDefaultHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T>(path: string, body?: unknown, options?: RequestInit & { timeout?: number }): Promise<T> {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...options,
      method: 'PUT',
      credentials: 'include',
      headers: getDefaultHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async patch<T>(path: string, body?: unknown, options?: RequestInit & { timeout?: number }): Promise<T> {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...options,
      method: 'PATCH',
      credentials: 'include',
      headers: getDefaultHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T>(path: string, options?: RequestInit & { timeout?: number }): Promise<T> {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...options,
      method: 'DELETE',
      credentials: 'include',
      headers: getDefaultHeaders(options?.headers),
    });
    return handleResponse<T>(res);
  },
};
