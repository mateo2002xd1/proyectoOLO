'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/auth.service';

export interface User {
  id: string;
  name?: string;
  email: string;
  roles?: string[];
  /** El nombre del rol, como lo devuelve `POST /login` (`role: user.role?.name`). */
  role?: string;
  permissions?: string[];
  permisos?: string[];
  must_change_password?: boolean;
  must_setup_security_questions?: boolean;
}

/** Respuesta del backend al iniciar sesión. */
export interface LoginResponse {
  user: User;
  mustChangePassword?: boolean;
  mustSetupSecurityQuestions?: boolean;
}

/**
 * Forma del contexto de autenticación. Se exporta para cuando se añada un
 * AuthProvider global; por simplicidad inicial `useAuth` es un hook estándar.
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verifySession: () => Promise<void>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifySession = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authApi.verifySession();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificación inicial. Va en una función async propia (y no llamando a
  // `verifySession`) para no ejecutar setState de forma síncrona en el cuerpo
  // del efecto, y para descartar la respuesta si el componente se desmonta.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await authApi.verifySession();
        if (!cancelado) setUser(data.user);
      } catch {
        if (!cancelado) setUser(null);
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar error de red al desloguear
    } finally {
      setUser(null);
      if (typeof document !== 'undefined') {
        document.cookie = 'token=; Max-Age=0; path=/;';
      }
      window.location.href = '/login?logout=1';
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    verifySession,
  };
}
