/**
 * Capa de API para autenticación y recuperación de cuenta.
 * 
 * Todas las peticiones apuntan a /api-backend/* que serán 
 * capturadas por el proxy de Next.js (rewrites en next.config.ts) 
 * y enviadas a localhost:4000/api/*.
 * 
 * Se utiliza `credentials: 'include'` para asegurar que 
 * la cookie HTTPOnly se envíe con cada solicitud al backend.
 */

const API_BASE = '/api-backend';

async function fetchAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Clave para las cookies de sesión
  });
  
  if (!res.ok) {
    let message = 'Ocurrió un error inesperado';
    let code: string | undefined;
    try {
      const errorData = await res.json();
      message = errorData.error || errorData.message || message;
      code = errorData.code;
    } catch {
      // Ignorar si no es JSON
    }
    // El `code` de la API viaja con el error, para que la pantalla sepa a qué campo
    // pertenece, p. ej. una contraseña repetida (`esPasswordRepetida`, @olo/password-policy).
    throw Object.assign(new Error(message), { code });
  }
  
  return res.json();
}

export const authApi = {
  // --- Autenticación ---
  
  login: async (email: string, password: string) => {
    return fetchAuth('/login', {
      method: 'POST',
      // Sitio-web e intranet entran por el mismo `POST /api/login` de la API: sin esta
      // marca las dos peticiones llegan allí idénticas y la bitácora no puede decir en
      // cuál se inició sesión. Viaja tal cual a través del rewrite de `next.config`.
      headers: { 'X-Origen-App': 'intranet' },
      body: JSON.stringify({ email, password }),
    });
  },
  
  logout: async () => {
    return fetchAuth('/logout', { method: 'POST' });
  },
  
  verifySession: async () => {
    return fetchAuth('/me', { method: 'GET' });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return fetchAuth('/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  
  /**
   * Qué le falta a la cuenta para estar operativa.
   *
   * Un administrador puede restablecer la contraseña, las preguntas, o ambas. El
   * formulario tiene que saber cuál de los tres casos es antes de pintarse: pedir una
   * contraseña temporal a quien no la tiene lo deja atascado.
   *
   * No sirve mirar el `must_change_password` del JWT ni de `/me`: se fijan al iniciar
   * sesión y no se enteran de lo que se complete después.
   */
  firstLoginStatus: async (): Promise<{
    debeCambiarPassword: boolean;
    debeConfigurarPreguntas: boolean;
  }> => {
    return fetchAuth('/first-login/status', { method: 'GET' });
  },

  firstLogin: async (tempPassword: string, newPassword: string, securityQuestions: Array<{ key: string; answer: string }>) => {
    return fetchAuth('/first-login', {
      method: 'POST',
      body: JSON.stringify({ tempPassword, newPassword, securityQuestions }),
    });
  },
  
  // --- Preguntas de Seguridad y Recuperación ---
  
  getCatalog: async () => {
    return fetchAuth('/security-questions/catalog', { method: 'GET' });
  },

  setupQuestions: async (questions: Array<{ key: string; answer: string }>) => {
    return fetchAuth('/security-questions/setup', {
      method: 'POST',
      body: JSON.stringify({ questions }),
    });
  },

  getUserQuestions: async (email: string) => {
    return fetchAuth('/security-questions/user-questions', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyAnswers: async (email: string, answers: Array<{ key: string; answer: string }>) => {
    return fetchAuth('/security-questions/verify', {
      method: 'POST',
      body: JSON.stringify({ email, answers }),
    });
  },

  recoverPassword: async (email: string, answers: Array<{ key: string; answer: string }>, newPassword: string) => {
    return fetchAuth('/security-questions/recover-password', {
      method: 'POST',
      body: JSON.stringify({ email, answers, newPassword }),
    });
  }
};
