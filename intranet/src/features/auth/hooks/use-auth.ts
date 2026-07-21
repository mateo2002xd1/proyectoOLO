'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authApi } from '../api/auth.api';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name?: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  must_change_password?: boolean;
  must_setup_security_questions?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  verifySession: () => Promise<void>;
}

// Podrías eventualmente exportar un AuthProvider si deseas proveer el contexto globalmente,
// pero por simplicidad inicial retornamos un hook estándar.

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const verifySession = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authApi.verifySession();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      router.push('/login');
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
