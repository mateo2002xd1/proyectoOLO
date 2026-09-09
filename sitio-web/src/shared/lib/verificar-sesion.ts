/**
 * Verificación de la sesión en el borde (middleware), con firma.
 *
 * ## Por qué existe
 *
 * Hasta el 2026-09-04 el middleware usaba `decodeJwt`, que **descodifica pero no
 * comprueba la firma**: solo miraba que el `exp` no hubiera pasado. Un JWT es texto
 * que cualquiera puede escribir, así que bastaba con inventarse uno —firma basura,
 * `role: "Superadmin"`, `exp` lejano— para que el middleware diera por buena la
 * sesión. Comprobado contra este mismo proyecto: `/admin/users` y `/admin/auditoria`
 * respondían 200 con un token fabricado a mano.
 *
 * No se filtraban datos —la API sí verifica y devolvía 401 a todo—, pero el control
 * de acceso de las rutas era decorativo, y esa es justo la capa que decide a qué
 * pantallas entra cada rol.
 *
 * El motivo que justificaba `decodeJwt` («sin requerir JWT_SECRET en frontend») ya no
 * se sostiene: `JWT_SECRET` está disponible aquí — lo declara `.env.local` y lo
 * inyectan los dos `docker-compose`. Es el mismo secreto con el que firma la API.
 *
 * ## Falla cerrado, a propósito
 *
 * Sin `JWT_SECRET` no se puede verificar nada, y la respuesta correcta a «no puedo
 * comprobarlo» es negar, no dejar pasar. Antes un despliegue al que se le olvidara la
 * variable habría seguido funcionando en apariencia, con la puerta abierta.
 */
import { jwtVerify } from 'jose';

/** Lo que el middleware necesita saber de quien pide una ruta. */
export interface SesionVerificada {
  /** Rol tal y como lo firmó la API. NO se lee de la cookie `sitio_role`. */
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
 * cualquier otro caso (firma inválida, caducado, ausente, o sin `JWT_SECRET`).
 *
 * `jwtVerify` ya rechaza por su cuenta el `exp` vencido, así que aquí no se repite esa
 * comprobación: hacerlo a mano fue lo que permitió que un token sin `exp` pasara.
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

    // Un token válido sin `role` no sirve para autorizar: las guardas de abajo
    // comparan contra ese campo, y tratarlo como cadena vacía lo dejaría fuera de
    // todos los roles admitidos, que es el resultado correcto.
    return {
      rol: typeof payload.role === 'string' ? payload.role : '',
      correo: typeof payload.email === 'string' ? payload.email : '',
      debeCambiarPassword: Boolean(payload.must_change_password),
      debeConfigurarPreguntas: Boolean(payload.must_setup_security_questions),
      permisos: Array.isArray(payload.permisos) ? payload.permisos : [],
    };
  } catch {
    // Sin detalle en el registro a propósito: el mensaje de `jose` distingue entre
    // «firma inválida» y «caducado», y eso le dice a quien prueba tokens si va por
    // buen camino. Para operar basta con saber que no era válido.
    return null;
  }
}
