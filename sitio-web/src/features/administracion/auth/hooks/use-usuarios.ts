'use client';

import { useState, useCallback } from 'react';
import { pedirJson } from '@/shared/lib/api-client';

/**
 * Un permiso, tal y como lo devuelve `GET /api/permissions`.
 *
 * `name` es la clave que compara el servidor; el resto lo añade la API desde
 * `catalogo-permisos.ts` para que el panel no tenga que traducir claves a lenguaje
 * humano por su cuenta. Antes esa traducción vivía aquí, duplicada, y por eso se
 * desviaba: nadie garantizaba que las dos listas dijeran lo mismo.
 */
export type Permission = {
  id: string;
  /** La clave: `acceso.intranet`, `editar.intranet.tasa`. La lee la máquina. */
  name: string;
  /** Cómo se llama en pantalla. La lee una persona. */
  etiqueta: string;
  descripcion: string;
  /** Grupo del catálogo con el que el modal organiza la lista. */
  grupo: string;
  /** `false` cuando el permiso solo decide qué se pinta y la API no puede comprobarlo. */
  esFrontera: boolean;
  /** `false` si la clave está en la base pero ya no en el catálogo. */
  enCatalogo: boolean;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions?: Permission[];
};

export type User = {
  id: string;
  name: string;
  apellidos?: string;
  email: string;
  role_id: string;
  role?: Role;
  status: string;
  expiration_date?: string;
  created_at: string;
  /** Fecha hasta la que el login y las preguntas de seguridad quedan bloqueados por
   *  intentos fallidos (§3 de la política de contraseñas); `null`/ausente si no hay bloqueo. */
  locked_until?: string | null;
  failed_login_attempts?: number;
  failed_security_attempts?: number;
};

export type NuevoUsuario = {
  name: string;
  apellidos: string;
  email: string;
  role_id: string;
  expiration_date?: string;
  permissions?: string[]; // lista de permission IDs a asignar al rol
};

/** Campos modificables de un usuario; todos opcionales (PATCH parcial). */
export type CambiosUsuario = Partial<{
  name: string;
  apellidos: string;
  email: string;
  role_id: string;
  status: string;
  expiration_date: string;
  reset_password: boolean;
  reset_security_questions: boolean;
  permissions?: string[]; // lista de permission IDs a asignar al rol
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
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Las lecturas pasan por `pedirJson` para que el 401 se trate en un solo sitio: si la
  // sesión dejó de valer, cierra y lleva al login en vez de dejar la tabla vacía sin
  // explicación —que era justo el síntoma de «entro al panel y no carga nada»—.
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await pedirJson<User[]>('/api/users'));
    } catch (err) {
      setError(mensajeDeError(err, 'Error al cargar usuarios'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Roles y permisos alimentan desplegables dentro de la pantalla de usuarios. Su fallo
  // se registra pero no se pinta como error propio: el de `fetchUsers` ya cuenta lo que
  // pasó, y tres avisos del mismo 401 es ruido. `pedirJson` ya redirigió si tocaba.
  const fetchRoles = useCallback(async () => {
    try {
      setRoles(await pedirJson<Role[]>('/api/roles'));
    } catch (err) {
      console.error(err);
    }
  }, []);

  /** Carga todos los permisos disponibles en el sistema. */
  const fetchPermissions = useCallback(async () => {
    try {
      const data = await pedirJson<Permission[]>('/api/permissions');
      setPermissions(data);
      return data;
    } catch (err) {
      console.error(err);
      return [] as Permission[];
    }
  }, []);

  /** Carga los permisos actuales asignados a un rol específico. */
  const fetchRolePermissions = useCallback(async (roleId: string): Promise<Permission[]> => {
    try {
      // El backend devuelve RolePermission[], cada uno con permission_id.
      // Necesitamos cruzar con los permisos para obtener el nombre.
      return await pedirJson<Permission[]>(`/api/role-permissions/role/${roleId}`);
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  /** Asigna un permiso a un rol. */
  const assignPermissionToRole = useCallback(async (roleId: string, permissionId: string): Promise<void> => {
    const res = await fetch('/api/role-permissions', {
      ...FETCH_OPTS,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: roleId, permission_id: permissionId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Error al asignar permiso');
    }
  }, []);

  /** Revoca un permiso de un rol. */
  const revokePermissionFromRole = useCallback(async (roleId: string, permissionId: string): Promise<void> => {
    const res = await fetch('/api/role-permissions', {
      ...FETCH_OPTS,
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: roleId, permission_id: permissionId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Error al revocar permiso');
    }
  }, []);

  const createUser = async (data: NuevoUsuario): Promise<RespuestaUsuario> => {
    const { permissions: _permissions, ...rest } = data;
    const res = await fetch('/api/users', {
      ...FETCH_OPTS,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
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
    const { permissions: _permissions, ...rest } = data;
    const res = await fetch(`/api/users/${id}`, {
      ...FETCH_OPTS,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
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
    permissions,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,
    assignPermissionToRole,
    revokePermissionFromRole,
    createUser,
    updateUser,
    deleteUser,
  };
}
