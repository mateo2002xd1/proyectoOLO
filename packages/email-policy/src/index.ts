/**
 * Dominio institucional admitido en OLO — la copia que consumen los formularios.
 *
 * Mismo reparto que `@olo/password-policy`: **la autoridad es el backend**
 * (`api-backend/src/shared/email-policy.ts`), y esto solo sirve para avisar antes de
 * enviar. Si cambian las reglas, cambian las dos.
 */

/**
 * El único dominio con acceso al panel.
 *
 * En minúsculas y sin la arroba: el correo se normaliza antes de compararlo, así que
 * `Usuario@SENA.EDU.CO` y `usuario@sena.edu.co` son la misma cuenta.
 */
export const DOMINIO_INSTITUCIONAL = 'sena.edu.co';

/**
 * Forma canónica de un correo: sin espacios alrededor y en minúsculas.
 *
 * Es lo que el backend ya hacía en `login` y `createUser` (`trim().toLowerCase()`),
 * recogido aquí para que la comprobación de dominio use exactamente el mismo texto
 * que después se guarda o se busca.
 */
export const normalizarEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Forma del correo, aparte del dominio.
 *
 * Es el mismo patrón que ya usaban los formularios de las dos apps; se centraliza
 * para no tenerlo escrito de nuevo en cada uno.
 */
const FORMA_VALIDA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const tieneFormaDeEmail = (email: string): boolean =>
  FORMA_VALIDA.test(normalizarEmail(email));

/**
 * ¿Pertenece al dominio institucional?
 *
 * Compara contra `@sena.edu.co` **al final de la cadena**, no con `includes`: un
 * correo como `atacante@sena.edu.co.dominio-falso.com` contiene el dominio pero no
 * pertenece a él, y `endsWith` sobre `@` + dominio es lo que distingue una cosa de
 * la otra. Tampoco valdría comparar solo `sena.edu.co`, que aceptaría
 * `alguien@nosena.edu.co`.
 */
export const esDominioInstitucional = (email: string): boolean =>
  normalizarEmail(email).endsWith(`@${DOMINIO_INSTITUCIONAL}`);

/** Mensaje único para todos los formularios, para que no se redacte distinto en cada uno. */
export const MENSAJE_DOMINIO = `Debe ser un correo institucional @${DOMINIO_INSTITUCIONAL}`;

/**
 * Comprueba forma y dominio de una vez. Devuelve el error a mostrar, o `null`.
 *
 * Se devuelve el mensaje en vez de un booleano porque los dos motivos de rechazo
 * —forma inválida y dominio ajeno— necesitan textos distintos, y quien llama no
 * debería tener que decidir cuál toca.
 */
export const validarEmail = (email: string): string | null => {
  if (!email || !email.trim()) return 'El correo es requerido';
  if (!tieneFormaDeEmail(email)) return 'Ingrese un correo válido';
  if (!esDominioInstitucional(email)) return MENSAJE_DOMINIO;
  return null;
};
