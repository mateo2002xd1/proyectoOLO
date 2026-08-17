/**
 * Nombres de cookie prefijados `sitio_` a propósito: la intranet corre en otro
 * puerto pero el mismo host (`localhost` en dev), y las cookies HTTP no
 * distinguen por puerto. Sin el prefijo, la cookie `token` de sitio-web y la
 * `token` que emite la API para la intranet son la misma entrada del cajón de
 * cookies del navegador — iniciar sesión en una pisa la sesión de la otra, y
 * cerrar sesión en una cierra las dos. Ver `api-backend/src/middlewares/auth.middleware.ts`,
 * que por eso acepta tanto `token` (intranet) como `sitio_token` (este sitio).
 */
export const AUTH_COOKIE_NAME = 'sitio_token';
export const AUTH_ROLE_COOKIE_NAME = 'sitio_role';
export const AUTH_USER_NAME_COOKIE_NAME = 'sitio_userName';
export const AUTH_USER_EMAIL_COOKIE_NAME = 'sitio_userEmail';
export const AUTH_REFRESH_COOKIE_NAME = 'sitio_refreshToken';
export const AUTH_MUST_CHANGE_PW_COOKIE_NAME = 'sitio_mustChangePassword';
export const AUTH_MUST_SETUP_SQ_COOKIE_NAME = 'sitio_mustSetupSecurityQuestions';
