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

/**
 * Todas las cookies de sesión, para borrarlas **juntas**.
 *
 * Solo `sitio_token` es HttpOnly; las demás las lee el JavaScript de la página para
 * pintar el nombre, el rol y decidir qué botones enseñar. Al invalidarse la sesión se
 * borraba únicamente el token, y las otras sobrevivían con su vencimiento propio: la
 * interfaz seguía diciendo «eres Superadmin» y mostrando los botones que dependen del
 * rol, mientras cada petición de datos recibía un 401. De ahí el síntoma de «entro al
 * panel pero no carga nada, y me aparece Editar pero no Eliminar».
 *
 * Quien invalide la sesión debe recorrer esta lista entera, no borrar el token suelto.
 */
export const AUTH_COOKIES = [
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_USER_NAME_COOKIE_NAME,
  AUTH_USER_EMAIL_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_MUST_CHANGE_PW_COOKIE_NAME,
  AUTH_MUST_SETUP_SQ_COOKIE_NAME,
] as const;

/** Motivo con el que `/login` explica por qué se cortó la sesión. */
export const PARAM_MOTIVO = 'motivo';
export const MOTIVO_SESION_EXPIRADA = 'sesion-expirada';
