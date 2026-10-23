/**
 * Recuperación de contraseña por preguntas de seguridad (RF-05).
 *
 * Va contra los proxies de `app/api/security-questions/*` y no contra el backend en
 * `:4000` directamente, siguiendo el patrón del resto de la app: el navegador no
 * conoce la URL del API ni necesita CORS abierto.
 */

export interface PreguntaDeUsuario {
  key: string;
  label: string;
}

export interface RespuestaDeUsuario {
  key: string;
  answer: string;
}

/**
 * Convierte una respuesta fallida en el mensaje a mostrar.
 *
 * Se usa el texto que manda el servidor cuando lo hay: el de «no fue posible verificar»
 * (que ya avisa de la espera tras varios fallos) y el de demasiados intentos (429) traen
 * una explicación que el usuario necesita, y sustituirla por un genérico dejaría a
 * alguien reintentando sin entender por qué no avanza. El servidor ya no responde 423:
 * el bloqueo se dice en general, sin confirmar que sea el de esta cuenta.
 */
const mensajeDeError = async (res: Response, porDefecto: string): Promise<string> => {
  const data = await res.json().catch(() => null);
  return data?.error || porDefecto;
};

/**
 * Preguntas configuradas para un correo.
 *
 * El backend devuelve siempre tres preguntas, exista o no la cuenta y las tenga o no
 * configuradas (las que no son reales las inventa, siempre las mismas por correo): así
 * esta pantalla no sirve para averiguar qué cuentas hay. La lista vacía ya no se da, pero
 * se sigue tratando como «sin preguntas» por si un backend viejo la devolviera.
 */
export const obtenerPreguntas = async (email: string): Promise<PreguntaDeUsuario[]> => {
  const res = await fetch('/api/security-questions/user-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error(await mensajeDeError(res, 'No se pudo continuar con la recuperación'));

  const data = await res.json();
  return Array.isArray(data?.questions) ? data.questions : [];
};

/**
 * Comprueba las tres respuestas. Si son correctas, el servidor devuelve además el
 * primer nombre de la cuenta, para saludar en la pantalla de la contraseña nueva.
 */
export const verificarRespuestas = async (
  email: string,
  answers: RespuestaDeUsuario[]
): Promise<{ nombre: string | null }> => {
  const res = await fetch('/api/security-questions/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, answers }),
  });

  if (!res.ok) throw new Error(await mensajeDeError(res, 'Una o más respuestas son incorrectas'));

  const data = await res.json().catch(() => null);
  return { nombre: typeof data?.nombre === 'string' && data.nombre ? data.nombre : null };
};

export const recuperarPassword = async (
  email: string,
  answers: RespuestaDeUsuario[],
  newPassword: string
): Promise<void> => {
  const res = await fetch('/api/security-questions/recover-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, answers, newPassword }),
  });

  if (!res.ok) {
    // Se lee aquí y no con `mensajeDeError`: además del texto hace falta el `code`, para
    // que la pantalla ponga una contraseña repetida bajo su campo.
    const data = await res.json().catch(() => null);
    throw Object.assign(new Error(data?.error || 'No fue posible recuperar la contraseña'), { code: data?.code });
  }
};
