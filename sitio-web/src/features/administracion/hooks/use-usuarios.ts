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

/** Datos aceptados al crear un usuario. */
export type NuevoUsuario = {
  name: string;
  email: string;
  role_id: string;
  expiration_date?: string;
};

/** Campos modificables de un usuario; todos opcionales (PATCH parcial). */
export type CambiosUsuario = Partial<{
  name: string;
  email: string;
  role_id: string;
  status: string;
  expiration_date: string;
  reset_password: boolean;
  reset_security_questions: boolean;
}>;

/** Respuesta de crear/actualizar: el backend devuelve la clave temporal solo
 *  cuando se genera una nueva. */
export type RespuestaUsuario = User & { temporaryPassword?: string };

/** Opciones base para todas las peticiones al proxy de Next.js — necesario para enviar cookies HTTPOnly */
const FETCH_OPTS: RequestInit = { credentials: 'include' };

/** Mensaje legible de un error desconocido capturado en un catch. */
export function mensajeDeError(err: unknown, porDefecto = ''): string {
  return err instanceof Error ? err.message : porDefecto;
}

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
    } catch (err) {
      setError(mensajeDeError(err, 'Error al cargar usuarios'));
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
    } catch (err) {
      console.error(err);
    }
  }, []);

  const createUser = async (data: NuevoUsuario): Promise<RespuestaUsuario> => {
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
    const creado: RespuestaUsuario = await res.json();
    await fetchUsers(); // Refresca la lista
    return creado;
  };

  const updateUser = async (id: string, data: CambiosUsuario): Promise<RespuestaUsuario> => {
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
    const actualizado: RespuestaUsuario = await res.json();
    await fetchUsers();
    return actualizado;
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { ...FETCH_OPTS, method: 'DELETE' });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Error al eliminar usuario');
    }
    await fetchUsers();
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
