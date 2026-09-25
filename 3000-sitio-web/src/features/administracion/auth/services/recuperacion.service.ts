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
 * Se usa el texto que manda el servidor cuando lo hay: los casos que de verdad
 * importan —cuenta bloqueada (423) y demasiados intentos (429)— traen una
 * explicación que el usuario necesita, y sustituirla por un genérico dejaría a
 * alguien reintentando sin entender por qué no avanza.
 */
const mensajeDeError = async (res: Response, porDefecto: string): Promise<string> => {
  const data = await res.json().catch(() => null);
  return data?.error || porDefecto;
};

/**
 * Preguntas configuradas para un correo.
 *
 * Devuelve lista vacía tanto si el correo no existe como si existe sin preguntas: el
 * backend no distingue los dos casos a propósito, para que esta pantalla no sirva
 * para averiguar qué cuentas hay.
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

export const verificarRespuestas = async (
  email: string,
  answers: RespuestaDeUsuario[]
): Promise<void> => {
  const res = await fetch('/api/security-questions/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, answers }),
  });

  if (!res.ok) throw new Error(await mensajeDeError(res, 'Una o más respuestas son incorrectas'));
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

  if (!res.ok) throw new Error(await mensajeDeError(res, 'No fue posible recuperar la contraseña'));
};
