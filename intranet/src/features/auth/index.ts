/**
 * Punto de entrada público del módulo de autenticación.
 *
 * TODO: Fase 4-5 — Implementar:
 *   - Función de login (POST a API :4000/auth/login)
 *   - Función de logout (limpiar cookie/JWT)
 *   - Función de verificación de sesión
 *   - Hook useAuth() para componentes cliente
 *   - Tipos de usuario/sesión (importar de @olo/types cuando exista)
 *
 * Regla de oro §0.3: Otros módulos importan desde aquí, nunca archivos internos.
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §5 (La API es la única que emite y valida el JWT)
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.3 (Importar solo desde index público)
 */

export { authApi } from './api/auth.api';
export { useAuth } from './hooks/use-auth';
export type { User } from './hooks/use-auth';
