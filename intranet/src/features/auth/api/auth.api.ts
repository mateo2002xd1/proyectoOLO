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
    try {
      const errorData = await res.json();
      message = errorData.error || errorData.message || message;
    } catch (e) {
      // Ignorar si no es JSON
    }
    throw new Error(message);
  }
  
  return res.json();
}

export const authApi = {
  // --- Autenticación ---
  
  login: async (email: string, password: string) => {
    return fetchAuth('/login', {
      method: 'POST',
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

  setupQuestions: async (answers: Array<{ questionKey: string; answer: string }>) => {
    return fetchAuth('/security-questions/setup', {
      method: 'POST',
      body: JSON.stringify({ answers }),
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
