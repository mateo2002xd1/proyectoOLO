/**
 * A qué dirección del primer ingreso va una cuenta según lo que le falte, como en la
 * intranet (pedido del usuario, 2026-10-15). La usan el login, el proxy y la propia
 * pantalla (`FirstLoginFlow`), para que los tres manden siempre al mismo sitio.
 *
 * Las tres direcciones pintan la misma pantalla adaptable, que pregunta al servidor qué
 * falta: la dirección solo dice en qué caso está quien la ve.
 */

/** Qué le falta a la cuenta, como lo dicen el token y `/api/auth/first-login/status`. */
export type Pendiente = { debeCambiarPassword: boolean; debeConfigurarPreguntas: boolean };

/**
 * - `completo` — cuenta nueva: contraseña y preguntas.
 * - `solo-preguntas` — ya cambió la contraseña; un administrador restableció las preguntas.
 * - `solo-contrasena` — ya tiene sus preguntas; un administrador restableció la contraseña.
 */
export const RUTAS_DEL_PRIMER_INGRESO = {
  completo: '/login/first-login',
  'solo-preguntas': '/login/first-login/security-questions',
  'solo-contrasena': '/login/first-login/change-password',
} as const;

export type ModoPrimerIngreso = keyof typeof RUTAS_DEL_PRIMER_INGRESO;

/** El caso de la cuenta, o `null` si no le falta nada. */
export function modoDelPrimerIngreso({ debeCambiarPassword, debeConfigurarPreguntas }: Pendiente): ModoPrimerIngreso | null {
  if (debeCambiarPassword && debeConfigurarPreguntas) return 'completo';
  if (debeConfigurarPreguntas) return 'solo-preguntas';
  if (debeCambiarPassword) return 'solo-contrasena';
  return null;
}

/** La dirección a la que mandar la cuenta; sin nada pendiente, la de la cuenta nueva. */
export function rutaDelPrimerIngreso(pendiente: Pendiente): string {
  return RUTAS_DEL_PRIMER_INGRESO[modoDelPrimerIngreso(pendiente) ?? 'completo'];
}
