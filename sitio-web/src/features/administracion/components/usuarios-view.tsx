'use client';

import { useEffect, useState, useCallback } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  useUsuarios,
  mensajeDeError,
  type User,
  type Permission,
  type NuevoUsuario,
  type CambiosUsuario,
} from '../hooks/use-usuarios';
import { Button } from '@/shared/ui/atoms/button';
import { Notification } from '@/shared/ui/molecules/notification';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/shared/ui/molecules/alert';
import { Switch } from '@/shared/ui/atoms/switch';

/** Claves de permisos priorizadas para mostrar primero en la interfaz (según requerimientos del sistema). */
const PRIORITIZED_PERMISSIONS = [
  'acceso.sitio',
  'acceso.intranet',
  'access_dashboard',
  'edit_post',
  'edit_user',
];

/** Categorías de permisos organizadas para la ventana modal. */
interface PermissionCategory {
  id: string;
  name: string;
  keys: string[];
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'acceso',
    name: 'ACCESO Y PORTALES',
    keys: [
      'acceso.sitio',
      'acceso.intranet',
      'access_dashboard',
      'access_portal_settings',
      'configure_portal',
      'access_branding',
    ],
  },
  {
    id: 'contenido',
    name: 'CONTENIDO Y EDICIÓN',
    keys: [
      'edit_post',
      'create_post',
      'delete_post',
      'publish_post',
      'access_categories',
    ],
  },
  {
    id: 'usuarios',
    name: 'USUARIOS Y ROLES',
    keys: [
      'create_user',
      'edit_user',
      'delete_user',
      'access_users_roles',
      'manage_roles',
      'manage_permissions',
    ],
  },
  {
    id: 'auditoria',
    name: 'SISTEMA Y AUDITORÍA',
    keys: [
      'view_audit',
      'access_audit',
      'access_alerts',
      'access_trends',
    ],
  },
];

/** Etiquetas amigables para las 21 claves de permiso existentes en la base de datos. */
const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
  'acceso.sitio': {
    label: 'Acceso al Sitio Web',
    description: 'Permite acceder al sitio web público.',
  },
  'acceso.intranet': {
    label: 'Acceso a Intranet',
    description: 'Permite ver y consumir contenido de la intranet, pero no administrarlo.',
  },
  'access_dashboard': {
    label: 'Acceso al Panel Administrativo',
    description: 'Permite gestionar contenido, usuarios y configuraciones.',
  },
  'edit_post': {
    label: 'Editar Contenido (Botón Editar)',
    description: 'Permite usar la funcionalidad del botón de editar en las páginas del sitio web y la intranet.',
  },
  'edit_user': {
    label: 'Editar Usuarios',
    description: 'Permite modificar datos de usuarios registrados en el sistema.',
  },
  'create_post': { label: 'Crear Contenido', description: 'Permite crear nuevo contenido.' },
  'delete_post': { label: 'Eliminar Contenido', description: 'Permite eliminar contenido.' },
  'publish_post': { label: 'Publicar Contenido', description: 'Permite publicar y aprobar contenido.' },
  'manage_roles': { label: 'Gestionar Roles', description: 'Permite administrar roles del sistema.' },
  'create_user': { label: 'Crear Usuarios', description: 'Permite crear nuevos usuarios.' },
  'delete_user': { label: 'Eliminar Usuarios', description: 'Permite eliminar usuarios.' },
  'manage_permissions': { label: 'Gestionar Permisos', description: 'Permite administrar permisos del sistema.' },
  'access_users_roles': { label: 'Ver Usuarios y Roles', description: 'Permite ver la lista de usuarios y roles.' },
  'view_audit': { label: 'Ver Auditoría', description: 'Permite ver el registro de auditoría.' },
  'access_branding': { label: 'Acceso a Identidad Visual', description: 'Permite gestionar la identidad visual del portal.' },
  'access_categories': { label: 'Acceso a Categorías', description: 'Permite gestionar categorías de contenido.' },
  'access_portal_settings': { label: 'Configuración del Portal', description: 'Permite modificar configuraciones generales del portal.' },
  'configure_portal': { label: 'Configurar Portal', description: 'Permite configurar el portal.' },
  'access_alerts': { label: 'Ver Alertas', description: 'Permite ver alertas del sistema.' },
  'access_trends': { label: 'Ver Tendencias', description: 'Permite ver sección de tendencias.' },
  'access_audit': { label: 'Auditoría Avanzada', description: 'Permite acceder a herramientas de auditoría avanzada.' },
};

function getPermissionInfo(name: string): { label: string; description: string } {
  return PERMISSION_LABELS[name] || { label: name, description: '' };
}

export default function UsuariosView() {
  const {
    users, roles, permissions, loading, error,
    fetchUsers, fetchRoles, fetchPermissions, fetchRolePermissions,
    assignPermissionToRole, revokePermissionFromRole,
    createUser, updateUser, deleteUser,
  } = useUsuarios();

  const [isCreating, setIsCreating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Additional Actions state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [resetPassword, setResetPassword] = useState(false);
  const [resetSecurityQuestions, setResetSecurityQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permissions state — IDs de permisos actualmente seleccionados para el rol
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [originalPermissionIds, setOriginalPermissionIds] = useState<Set<string>>(new Set());
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Credentials state
  const [newUserCredentials, setNewUserCredentials] = useState<{name: string, email: string, password: string} | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, [fetchUsers, fetchRoles, fetchPermissions]);

  /** Cuando cambia el rol en el formulario, precarga los permisos de ese rol. */
  const handleRoleChange = useCallback(async (newRoleId: string) => {
    setRoleId(newRoleId);
    if (!newRoleId) {
      setSelectedPermissionIds(new Set());
      setOriginalPermissionIds(new Set());
      return;
    }
    setLoadingRolePerms(true);
    try {
      const rolePerms = await fetchRolePermissions(newRoleId);
      // El backend devuelve registros de roles_permisos con permission_id
      const ids = new Set(rolePerms.map((rp: any) => rp.permission_id || rp.id));
      setSelectedPermissionIds(new Set(ids));
      setOriginalPermissionIds(new Set(ids));
    } catch (err) {
      console.error('Error cargando permisos del rol:', err);
    } finally {
      setLoadingRolePerms(false);
    }
  }, [fetchRolePermissions]);

  const togglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleCategory = (categoryKeys: string[]) => {
    const categoryPermIds = permissions
      .filter((p) => categoryKeys.includes(p.name))
      .map((p) => p.id);

    const allSelected = categoryPermIds.length > 0 && categoryPermIds.every((id) => selectedPermissionIds.has(id));

    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        categoryPermIds.forEach((id) => next.delete(id));
      } else {
        categoryPermIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAllPermissions = () => {
    setSelectedPermissionIds(new Set(permissions.map((p) => p.id)));
  };

  const deselectAllPermissions = () => {
    setSelectedPermissionIds(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleId) return;

    setIsSubmitting(true);
    try {
      let response;
      if (editingUserId) {
        const data: CambiosUsuario = { name, email, role_id: roleId };
        if (expirationDate) data.expiration_date = expirationDate;
        if (resetPassword) data.reset_password = true;
        if (resetSecurityQuestions) data.reset_security_questions = true;
        response = await updateUser(editingUserId, data);
        setNotificationMsg({ title: 'Usuario actualizado', message: 'El usuario se ha actualizado exitosamente.', type: 'success' });
      } else {
        const data: NuevoUsuario = { name, email, role_id: roleId };
        if (expirationDate) data.expiration_date = expirationDate;
        response = await createUser(data);
        setNotificationMsg({ title: 'Usuario creado', message: 'El usuario se ha creado exitosamente.', type: 'success' });
      }

      // Sincronizar permisos del rol: asignar/revocar cambios
      if (roleId) {
        const toAssign = [...selectedPermissionIds].filter((id) => !originalPermissionIds.has(id));
        const toRevoke = [...originalPermissionIds].filter((id) => !selectedPermissionIds.has(id));

        await Promise.all([
          ...toAssign.map((permId) => assignPermissionToRole(roleId, permId).catch(console.error)),
          ...toRevoke.map((permId) => revokePermissionFromRole(roleId, permId).catch(console.error)),
        ]);
      }

      setIsCreating(false);
      setEditingUserId(null);
      resetForm();
      setShowNotification(true);

      if (response && response.temporaryPassword) {
        setNewUserCredentials({
          name: response.name || name,
          email: response.email || email,
          password: response.temporaryPassword
        });
        setCopiedPassword(false);
      }
    } catch (err) {
      setNotificationMsg({ title: 'Error', message: mensajeDeError(err) || 'Error al procesar la solicitud', type: 'error' });
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
       const newStatus = user.status === 'active' ? 'inactive' : 'active';
       const res = await updateUser(user.id, { status: newStatus });
       setNotificationMsg({ title: 'Estado actualizado', message: 'El estado se cambió exitosamente.', type: 'success' });
       setShowNotification(true);
       if (res && res.temporaryPassword) {
         setNewUserCredentials({
           name: res.name || user.name,
           email: res.email || user.email,
           password: res.temporaryPassword
         });
         setCopiedPassword(false);
       }
    } catch (err) {
       setNotificationMsg({ title: 'Error', message: mensajeDeError(err) || 'No se pudo cambiar el estado', type: 'error' });
       setShowNotification(true);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteUser(deleteConfirmId);
      setNotificationMsg({ title: 'Usuario eliminado', message: 'El usuario se eliminó exitosamente.', type: 'success' });
      setShowNotification(true);
    } catch (err) {
      setNotificationMsg({ title: 'Error', message: mensajeDeError(err) || 'No se pudo eliminar el usuario', type: 'error' });
      setShowNotification(true);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const startEdit = async (user: User) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setExpirationDate(user.expiration_date ? user.expiration_date.split('T')[0] : '');
    setResetPassword(false);
    setResetSecurityQuestions(false);
    setIsCreating(true);
    // Cargar permisos del rol del usuario
    await handleRoleChange(user.role_id);
  };

  function resetForm() {
    setName('');
    setEmail('');
    setRoleId('');
    setExpirationDate('');
    setResetPassword(false);
    setResetSecurityQuestions(false);
    setSelectedPermissionIds(new Set());
    setOriginalPermissionIds(new Set());
  }

  const handleCancel = () => {
    setIsCreating(false);
    setEditingUserId(null);
    resetForm();
  };

  function copyPassword(pwd: string) {
    void navigator.clipboard.writeText(pwd).then(() => {
      setCopiedPassword(true);
    });
  }

  function handleCloseCredentials() {
    if (!copiedPassword) return;
    setNewUserCredentials(null);
    setCopiedPassword(false);
  }

  // Determina el nombre del rol seleccionado para mostrar el aviso
  const selectedRoleName = roles.find((r) => r.id === roleId)?.name ?? '';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#f6f6f6]">Usuarios</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#94a3b8]">
            Controla los usuarios que actúan en las diferentes plataformas
          </p>
        </div>
        <Button onClick={() => {
          setEditingUserId(null);
          resetForm();
          setIsCreating(true);
        }}>
          Crear Usuario
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </div>
      )}

      <Alert open={isCreating} onClose={(open) => !isSubmitting && !open && handleCancel()}>
        <AlertTitle>{editingUserId ? 'Editar Usuario' : 'Nuevo Usuario'}</AlertTitle>
        <AlertDescription>
          Completa los campos para {editingUserId ? 'actualizar el' : 'crear un nuevo'} usuario.
        </AlertDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Nombre completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Rol</label>
            <select
              required
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white [&>option]:text-zinc-900"
            >
              <option value="" disabled>Selecciona un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Fecha de caducidad (Opcional)</label>
            <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="olo-date-input" />
          </div>

          {/* Permisos asignados — tarjeta de configuración compacta (abre modal) */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-3">Permisos de acceso (No funcional aún)</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="permisos_tipo" defaultChecked className="mt-0.5 size-4 rounded-full border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:checked:bg-white dark:focus:ring-white" />
                <div>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-[#f6f6f6]">Acceso a Intranet</span>
                  <span className="block text-xs text-zinc-500 dark:text-[#94a3b8]">Permite ver y consumir contenido, pero no administrarlo.</span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="permisos_tipo" className="mt-0.5 size-4 rounded-full border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:checked:bg-white dark:focus:ring-white" />
                <div>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-[#f6f6f6]">Acceso al Panel Administrativo</span>
                  <span className="block text-xs text-zinc-500 dark:text-[#94a3b8]">Permite gestionar contenido, usuarios y configuraciones.</span>
                </div>
              </label>
            </div>
              <button
                type="button"
                onClick={() => setShowPermissionsModal(true)}
                disabled={!roleId || loadingRolePerms}
                className="flex items-center gap-1.5 rounded-full border border-[#bfe5c8] bg-[#eaf7ee] px-4 py-1.5 text-xs font-semibold text-emerald-900 shadow-xs transition-all hover:bg-[#ddf2e3] hover:border-[#a8dcb4] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:border-emerald-700/80 dark:bg-[#162720] dark:text-emerald-300 dark:hover:bg-[#1a3328]"
              >
                <span>Configurar</span>
                <span className="text-sm font-bold">→</span>
              </button>
            </div>
          

          {editingUserId && (
             <div className="pt-2 flex flex-col gap-3">
               <div className="flex items-center gap-2">
                 <input type="checkbox" id="reset_pwd" checked={resetPassword} onChange={e => setResetPassword(e.target.checked)} className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:checked:bg-white dark:focus:ring-white" />
                 <label htmlFor="reset_pwd" className="text-sm font-medium text-zinc-700 dark:text-[#cbd5e1]">Restablecer contraseña (generará una temporal)</label>
               </div>
               <div className="flex items-center gap-2">
                 <input type="checkbox" id="reset_sq" checked={resetSecurityQuestions} onChange={e => setResetSecurityQuestions(e.target.checked)} className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:checked:bg-white dark:focus:ring-white" />
                 <label htmlFor="reset_sq" className="text-sm font-medium text-zinc-700 dark:text-[#cbd5e1]">Restablecer preguntas de seguridad</label>
               </div>
             </div>
          )}

          <AlertActions>
            <Button type="button" plain onClick={handleCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </AlertActions>
        </form>
      </Alert>

      {/* Modal de Configuración de Permisos (Categorizados con Switches) */}
      {showPermissionsModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPermissionsModal(false);
          }}
        >
          <div
            className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[88vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-200/80 bg-[#f4fbf6] text-emerald-800 shadow-xs dark:border-emerald-800 dark:bg-[#11231a] dark:text-emerald-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-[#f6f6f6]">Configurar Permisos</h3>
                  <p className="text-xs text-zinc-500 dark:text-[#94a3b8]">
                    Rol: <strong className="text-zinc-700 dark:text-zinc-300">"{selectedRoleName || 'Sin rol seleccionado'}"</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllPermissions}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Activar todo
                </button>
                <button
                  type="button"
                  onClick={deselectAllPermissions}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Desactivar todo
                </button>
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="ml-2 flex size-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido / Tarjetas de Categorías */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedRoleName && (
                <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                  ⚠ Los permisos seleccionados se aplicarán a <strong>todos los usuarios con el rol «{selectedRoleName}»</strong> al guardar los cambios.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PERMISSION_CATEGORIES.map((category) => {
                  const categoryPerms = permissions.filter((p) => category.keys.includes(p.name));
                  if (categoryPerms.length === 0) return null;

                  const selectedCount = categoryPerms.filter((p) => selectedPermissionIds.has(p.id)).length;
                  const allSelected = selectedCount === categoryPerms.length;

                  return (
                    <div
                      key={category.id}
                      className="flex flex-col rounded-2xl border border-[#d2edd7] bg-[#f2fbf4] p-4 shadow-xs dark:border-emerald-900/40 dark:bg-[#11231a]/40"
                    >
                      {/* Cabecera de Categoría */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          <span className="text-xs font-bold tracking-wider text-emerald-950 dark:text-emerald-300">
                            {category.name}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                            {selectedCount}/{categoryPerms.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.keys)}
                          className="rounded-md bg-[#d8f3de] px-2 py-0.5 text-[11px] font-semibold text-emerald-800 transition-colors hover:bg-[#c6ebd0] dark:bg-emerald-900/60 dark:text-emerald-200 dark:hover:bg-emerald-800/80"
                        >
                          {allSelected ? 'Ninguno' : 'Todos'}
                        </button>
                      </div>

                      {/* Lista de Permisos con Switch */}
                      <div className="flex flex-col gap-2">
                        {categoryPerms.map((perm) => {
                          const info = getPermissionInfo(perm.name);
                          const isChecked = selectedPermissionIds.has(perm.id);

                          return (
                            <div
                              key={perm.id}
                              onClick={() => togglePermission(perm.id)}
                              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-emerald-100/80 bg-white/90 px-3 py-2.5 shadow-xs transition-all hover:bg-white hover:border-emerald-300 dark:border-emerald-900/30 dark:bg-[#162720]/90 dark:hover:bg-[#192f26]"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="block text-xs font-medium text-zinc-900 dark:text-[#f6f6f6]">
                                  {info.label}
                                </span>
                                {info.description && (
                                  <span className="block truncate text-[10px] text-zinc-500 dark:text-[#94a3b8]">
                                    {info.description}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isChecked}
                                aria-label={info.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePermission(perm.id);
                                }}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 focus:outline-none ${
                                  isChecked ? 'bg-[#183b28] dark:bg-[#225439]' : 'bg-[#d8e2dc] dark:bg-[#2a3830]'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                                    isChecked ? 'translate-x-5.5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 dark:border-zinc-800/80 dark:bg-[#161b27]/60">
              <span className="text-xs text-zinc-500 dark:text-[#94a3b8]">
                <strong className="text-zinc-900 dark:text-white">{selectedPermissionIds.size}</strong> de {permissions.length} permisos seleccionados
              </span>
              <Button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
              >
                Listo
              </Button>
            </div>
          </div>
        </div>
      )}

      <Alert open={!!newUserCredentials} onClose={handleCloseCredentials}>
        <AlertTitle>Contraseña temporal generada</AlertTitle>
        <AlertDescription>
          {newUserCredentials && (
            <>
              <p className="m-0 text-xs text-zinc-500 dark:text-[#94a3b8]">
                <span className="font-semibold text-zinc-900 dark:text-[#f6f6f6]">{newUserCredentials.name}</span>
                {" · "}
                {newUserCredentials.email}
              </p>
              <p className="m-0 mt-2 text-xs text-zinc-500 dark:text-[#94a3b8]">
                Copia la contraseña antes de cerrar. No podrás verla de nuevo.
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-[#7db828]/30 dark:bg-[#0b1121]/50">
                <span className="min-w-0 flex-1 truncate font-mono text-sm tracking-wide text-zinc-900 dark:text-[#f6f6f6]">
                  {newUserCredentials.password}
                </span>
              </div>
              {!copiedPassword && (
                <p className="m-0 mt-2 text-xs font-medium text-amber-600 dark:text-amber-500">
                  ⚠ Debes copiar la contraseña para poder cerrar.
                </p>
              )}
            </>
          )}
        </AlertDescription>
        <AlertActions>
          <Button
            type="button"
            plain
            onClick={handleCloseCredentials}
            disabled={!copiedPassword}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            onClick={() => newUserCredentials && copyPassword(newUserCredentials.password)}
          >
            {copiedPassword ? "Copiado" : "Copiar"}
          </Button>
        </AlertActions>
      </Alert>

      <Alert open={!!deleteConfirmId} onClose={(open) => !open && setDeleteConfirmId(null)}>
        <AlertTitle>¿Eliminar usuario?</AlertTitle>
        <AlertDescription>
          Esta acción no se puede deshacer. El usuario perderá acceso al sistema permanentemente.
        </AlertDescription>
        <AlertActions>
          <Button type="button" plain onClick={() => setDeleteConfirmId(null)}>
            Cancelar
          </Button>
          <Button type="button" color="red" onClick={confirmDelete}>
            Eliminar
          </Button>
        </AlertActions>
      </Alert>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#7db828]/30 dark:bg-[#0b1121]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead>
              <tr className="bg-zinc-50 dark:bg-[#0b1121]/50">
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#94a3b8]">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#94a3b8]">
                  Correo
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#94a3b8]">
                  Rol
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#94a3b8]">
                  Estado
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#94a3b8]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-[#f6f6f6]">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-[#94a3b8]">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-[#94a3b8]">
                      {user.role?.name || 'Sin rol'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Switch
                           checked={user.status === 'active'}
                           onChange={() => toggleStatus(user)}
                        />
                        <span className="text-zinc-500 dark:text-[#94a3b8] text-xs">{user.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => startEdit(user)} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-[#94a3b8] dark:hover:text-white transition-colors" title="Editar">
                          <PencilIcon className="size-5" />
                        </button>
                        <button type="button" onClick={() => setDeleteConfirmId(user.id)} className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 transition-colors" title="Eliminar">
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNotification && (
        <Notification
          onClose={() => setShowNotification(false)}
          title={notificationMsg.title}
          message={notificationMsg.message}
          type={notificationMsg.type}
        />
      )}
    </div>
  );
}
