/**
 * Cliente HTTP para comunicación con la API backend (:4000).
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §5 (La API es la única que emite y valida el JWT)
 */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== 'undefined' ? '/api-backend' : 'http://127.0.0.1:4000');
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
      window.location.href = '/login';
    }
    throw new ApiError(401, 'No autenticado');
  }

  if (!response.ok) {
    let message = 'Ocurrió un error inesperado';
    try {
      const errorData = await response.json();
      message = errorData.error || errorData.message || message;
    } catch {
      message = await response.text();
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

function getDefaultHeaders(customHeaders?: HeadersInit) {
  return {
    'Content-Type': 'application/json',
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
