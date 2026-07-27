/**
 * Punto de entrada público del módulo de login.
 *
 * Solo se exportan las seis vistas que enruta `app/login/`. `QuestionPicker`
 * y `AuthSuccessScreen` quedan sin exportar a propósito: son piezas que
 * componen esas vistas, no puntos de entrada del módulo.
 *
 * NOTA: este módulo y `features/auth/` son el mismo dominio partido por tipo
 * técnico — aquí las vistas, allá el hook y el cliente HTTP. Se fusionan en la
 * fase 4 de `8-ciclo-editorial.md` §5; entonces este archivo desaparece y sus
 * exports pasan a `features/auth/index.ts`.
 *
 * @see 4-reglas.md regla 6
 * @see 8-ciclo-editorial.md §3.1
 */

export { LoginView } from './ui/LoginView';
export { FirstLoginView } from './ui/FirstLoginView';
export { RecoveryView } from './ui/RecoveryView';
export { ResetPasswordView } from './ui/ResetPasswordView';
export { ResetSuccessView } from './ui/ResetSuccessView';
export { SecurityQuestionsView } from './ui/SecurityQuestionsView';
