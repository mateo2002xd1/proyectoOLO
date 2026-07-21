/**
 * Cliente HTTP para comunicación con la API backend (:4000).
 *
 * TODO: Configurar con las siguientes características:
 *   - Base URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
 *   - Interceptar respuestas 401 para redirigir a /login
 *   - Adjuntar cookie/JWT de sesión automáticamente
 *   - Timeout y retry configurables
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §5 (La API es la única que emite y valida el JWT)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const apiClient = {
  baseUrl: API_BASE_URL,

  async get(path: string) {
    void path;
    return null;
  },

  async post(path: string, body?: unknown) {
    void path;
    void body;
    return null;
  },
};
