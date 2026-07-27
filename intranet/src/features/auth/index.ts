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
 * Otros módulos importan desde aquí, nunca archivos internos.
 *
 * NOTA: `features/login/` tiene las vistas de este mismo dominio. Se fusionan
 * en la fase 4 de `8-ciclo-editorial.md` §5.
 *
 * @see 4-reglas.md regla 6
 * @see 3-seguridad-del-proyecto.md (la API es la única que emite y valida el JWT)
 */

export { authApi } from './api/auth.api';
export { useAuth } from './hooks/use-auth';
export type { User } from './hooks/use-auth';
