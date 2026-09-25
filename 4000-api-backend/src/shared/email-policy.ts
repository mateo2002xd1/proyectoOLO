/**
 * Dominio institucional admitido en OLO.
 *
 * **Este archivo es el único sitio donde vive la regla**, igual que
 * `password-policy.ts` lo es para las contraseñas. El paquete `@olo/email-policy`
 * que consumen las dos apps solo avisa antes de enviar el formulario: no decide.
 *
 * Se aplica en los tres puntos donde un correo entra al sistema —inicio de sesión,
 * alta de usuario y cambio de correo— porque restringir solo el alta dejaría la
 * puerta abierta a cambiar el correo *después* a uno de fuera.
 */

/** En minúsculas y sin arroba: el correo se normaliza antes de comparar. */
export const DOMINIO_INSTITUCIONAL = 'sena.edu.co';

/**
 * Forma canónica: sin espacios alrededor y en minúsculas.
 *
 * Recoge el `trim().toLowerCase()` que `login.usecase.ts` y `listar-usuarios.usecase.ts`
 * ya hacían por su cuenta, para que la comprobación de dominio opere exactamente
 * sobre el mismo texto que luego se guarda o se busca.
 */
export const normalizarEmail = (email: string): string => email.trim().toLowerCase();

const FORMA_VALIDA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ¿Pertenece al dominio institucional?
 *
 * Se compara con `endsWith('@' + dominio)`, no con `includes`: un correo como
 * `atacante@sena.edu.co.dominio-falso.com` **contiene** el dominio sin pertenecer a
 * él. Incluir la arroba es lo que además descarta `alguien@nosena.edu.co`.
 */
export const esDominioInstitucional = (email: string): boolean =>
  normalizarEmail(email).endsWith(`@${DOMINIO_INSTITUCIONAL}`);

export const MENSAJE_DOMINIO = `El correo debe pertenecer al dominio institucional @${DOMINIO_INSTITUCIONAL}`;

/**
 * Marca de los errores de dominio, para distinguirlos de otros 400.
 *
 * Mismo motivo que `CODIGO_PASSWORD_INVALIDA`: hay controladores que sustituyen el
 * error por un mensaje genérico y conviene poder dejar pasar los que no revelan nada.
 */
export const CODIGO_EMAIL_INVALIDO = 'EMAIL_INVALIDO';

/**
 * Valida y devuelve el correo normalizado, listo para guardar o buscar.
 *
 * **Devuelve un valor a propósito**, igual que `exigirPasswordValida`: obliga a quien
 * llama a usar el correo que salió de aquí y no el que entró, que es lo que mantiene
 * coherente la normalización.
 */
export const exigirEmailInstitucional = (email: unknown): string => {
  const fallo = (mensaje: string) =>
    Object.assign(new Error(mensaje), { status: 400, codigo: CODIGO_EMAIL_INVALIDO });

  if (typeof email !== 'string' || !email.trim()) throw fallo('El correo es obligatorio');

  const normalizado = normalizarEmail(email);
  if (!FORMA_VALIDA.test(normalizado)) throw fallo('El correo no tiene un formato válido');
  if (!esDominioInstitucional(normalizado)) throw fallo(MENSAJE_DOMINIO);

  return normalizado;
};
