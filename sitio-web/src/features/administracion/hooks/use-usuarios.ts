'use client';

import { useState, useCallback } from 'react';

export type Role = {
  id: string;
  name: string;
  description: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role?: Role;
  status: string;
  expiration_date?: string;
  created_at: string;
};

/** Opciones base para todas las peticiones al proxy de Next.js — necesario para enviar cookies HTTPOnly */
const FETCH_OPTS: RequestInit = { credentials: 'include' };

export function useUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users', FETCH_OPTS);
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles', FETCH_OPTS);
      if (!res.ok) throw new Error('Error al cargar roles');
      const data = await res.json();
      setRoles(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const createUser = async (data: { name: string; email: string; role_id: string; expiration_date?: string }) => {
    try {
      const res = await fetch('/api/users', {
        ...FETCH_OPTS,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al crear usuario');
      }
      await fetchUsers(); // Refresh list
      return await res.json();
    } catch (err: any) {
      throw err;
    }
  };

  const updateUser = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        ...FETCH_OPTS,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al actualizar usuario');
      }
      await fetchUsers();
      return await res.json();
    } catch (err: any) {
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { ...FETCH_OPTS, method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al eliminar usuario');
      }
      await fetchUsers();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    users,
    roles,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    deleteUser,
  };
}
