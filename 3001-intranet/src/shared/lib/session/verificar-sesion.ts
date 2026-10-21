/**
 * Verificación de la sesión en el borde (middleware), con firma.
 *
 * ## Por qué existe
 *
 * Hasta el 2026-09-04 el middleware usaba `decodeJwt`, que **descodifica pero no
 * comprueba la firma**. Un JWT es texto que cualquiera puede escribir, así que un token
 * inventado a mano —firma basura y `exp` lejano— pasaba por bueno. La API sí verifica y
 * devolvía 401 a todo, así que no se filtraban datos; lo que quedaba abierto era la
 * capa que decide a qué pantallas entra cada quien.
 *
 * Aquí había además un agujero propio: la condición era
 * `if (!decoded.exp || decoded.exp * 1000 > Date.now())`. Ese `!decoded.exp` daba por
 * válido **un token sin fecha de caducidad**, es decir, una sesión eterna para quien se
 * fabricara uno sin ese campo. `jwtVerify` no admite ese caso.
 *
 * El motivo que justificaba `decodeJwt` («sin requerir JWT_SECRET en frontend») ya no se
 * sostiene: `JWT_SECRET` está disponible aquí — lo declara `.env.local` y lo inyectan
 * los dos `docker-compose`. Es el mismo secreto con el que firma la API.
 *
 * ## Falla cerrado, a propósito
 *
 * Sin `JWT_SECRET` no se puede verificar nada, y la respuesta correcta a «no puedo
 * comprobarlo» es negar. Antes un despliegue al que se le olvidara la variable habría
 * seguido funcionando en apariencia, con la puerta abierta.
 */
import { jwtVerify } from 'jose';

/** Lo que el middleware necesita saber de quien pide una ruta. */
export interface SesionVerificada {
  rol: string;
  correo: string;
  debeCambiarPassword: boolean;
  debeConfigurarPreguntas: boolean;
  permisos: string[];
}

const claveSecreta = (): Uint8Array | null => {
  const secreto = process.env.JWT_SECRET;
  if (!secreto) return null;
  return new TextEncoder().encode(secreto);
};

/**
 * Devuelve la sesión si el token está firmado por la API y sigue vigente; `null` en
 * cualquier otro caso (firma inválida, caducado, sin `exp`, ausente, o sin `JWT_SECRET`).
 */
export async function verificarSesion(token: string | undefined): Promise<SesionVerificada | null> {
  if (!token) return null;

  const clave = claveSecreta();
  if (!clave) {
    console.error('[sesion] Falta JWT_SECRET: no se puede verificar la sesión, se deniega.');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, clave);

    // Un token sin `exp` no caduca nunca. `jwtVerify` no lo rechaza por sí solo
    // —`exp` es opcional en el estándar—, así que se exige aquí: esta aplicación no
    // emite sesiones perpetuas, y aceptar una sería el agujero que había antes.
    if (typeof payload.exp !== 'number') return null;

    return {
      rol: typeof payload.role === 'string' ? payload.role : '',
      correo: typeof payload.email === 'string' ? payload.email : '',
      debeCambiarPassword: Boolean(payload.must_change_password),
      debeConfigurarPreguntas: Boolean(payload.must_setup_security_questions),
      permisos: Array.isArray(payload.permisos) ? payload.permisos : [],
    };
  } catch {
    // Sin detalle en el registro a propósito: distinguir «firma inválida» de
    // «caducado» le diría a quien prueba tokens si va por buen camino.
    return null;
  }
}
