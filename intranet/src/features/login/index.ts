/**
 * Punto de entrada público del módulo de autenticación.
 *
 * Fusiona lo que antes eran dos features del mismo dominio partidas por tipo
 * técnico (`auth/` con el cliente HTTP y el hook, `login/` con las vistas).
 * Solo se exportan las seis vistas que enruta `app/login/`. `QuestionPicker`
 * y `AuthSuccessScreen` quedan sin exportar a propósito: son piezas que
 * componen esas vistas, no puntos de entrada del módulo.
 *
 * Otros módulos importan desde aquí, nunca archivos internos.
 *
 * @see 4-reglas.md regla 6
 * @see 3-seguridad-del-proyecto.md (la API es la única que emite y valida el JWT)
 */

export { authApi } from './services/auth.service';
export { useAuth } from './hooks/use-auth';
export type { User } from './hooks/use-auth';

export { LoginView } from './components/login-view';
export { FirstLoginView } from './components/first-login-view';
export { RecoveryView } from './components/recovery-view';
export { ResetPasswordView } from './components/reset-password-view';
export { ResetSuccessView } from './components/reset-success-view';
export { SecurityQuestionsView } from './components/security-questions-view';
