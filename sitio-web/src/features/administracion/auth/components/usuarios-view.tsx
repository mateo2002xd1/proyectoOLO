'use client';

import { useEffect, useState, useCallback } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { validarEmail } from '@olo/email-policy';
import {
  useUsuarios,
  mensajeDeError,
  type User,
  type Permission,
  type NuevoUsuario,
  type CambiosUsuario,
} from '../hooks/use-usuarios';
import { Button } from '@/shared/ui/atoms/button';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { Notification } from '@/shared/ui/molecules/notification';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/shared/ui/molecules/alert';
import { Switch } from '@/shared/ui/atoms/switch';
import { ModalPermisos } from './modal-permisos';

/**
 * Las etiquetas, descripciones y grupos de los permisos ya **no viven aquí**.
 *
 * Estaban en tres constantes de este archivo —una lista de prioridad, cuatro categorías
 * escritas a mano y un diccionario de 21 etiquetas— duplicando lo que la API tiene en
 * `catalogo-permisos.ts`. Duplicado no se mantuvo: había claves con etiquetas que no
 * distinguían unas de otras (`view_audit` y `access_audit` decían casi lo mismo) y
 * categorías que mezclaban «acceso» con «configuración del portal».
 *
 * Ahora `GET /api/permissions` devuelve cada permiso ya con su etiqueta y su grupo, y
 * `ModalPermisos` solo agrupa y pinta. La traducción de clave a lenguaje humano vive
 * junto a quien comprueba la clave, que es la API.
 */

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
  const [apellidos, setApellidos] = useState('');
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

  // Se declara aquí y no más abajo porque `guardarPermisos` lo nombra en su mensaje de
  // confirmación, y esa función tiene que existir antes de pasarse al modal.
  const selectedRoleName = roles.find((r) => r.id === roleId)?.name ?? '';

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

  const [guardandoPermisos, setGuardandoPermisos] = useState(false);

  /**
   * Guarda los permisos del rol, sin pasar por el formulario de usuario.
   *
   * Antes esto vivía dentro de `handleSubmit`: los permisos se sincronizaban como efecto
   * secundario de guardar una cuenta, así que crear *un* usuario reescribía los permisos
   * de *todos* los que compartían su rol, y para tocar solo permisos había que rellenar y
   * enviar el formulario entero. Son dos operaciones distintas sobre entidades distintas.
   */
  const guardarPermisos = useCallback(async () => {
    if (!roleId) return;
    setGuardandoPermisos(true);
    try {
      const aAsignar = [...selectedPermissionIds].filter((id) => !originalPermissionIds.has(id));
      const aRevocar = [...originalPermissionIds].filter((id) => !selectedPermissionIds.has(id));

      await Promise.all([
        ...aAsignar.map((permId) => assignPermissionToRole(roleId, permId)),
        ...aRevocar.map((permId) => revokePermissionFromRole(roleId, permId)),
      ]);

      // La nueva línea base es lo que acaba de guardarse: si no se actualiza, el modal
      // seguiría ofreciendo «se añade» sobre cambios que ya están en la base.
      setOriginalPermissionIds(new Set(selectedPermissionIds));
      setShowPermissionsModal(false);
      setNotificationMsg({
        title: 'Permisos actualizados',
        message: `Se aplicaron a todas las personas con el rol «${selectedRoleName}».`,
        type: 'success',
      });
      setShowNotification(true);
    } catch (err) {
      setNotificationMsg({
        title: 'Error',
        message: mensajeDeError(err) || 'No se pudieron guardar los permisos.',
        type: 'error',
      });
      setShowNotification(true);
    } finally {
      setGuardandoPermisos(false);
    }
  }, [
    roleId,
    selectedPermissionIds,
    originalPermissionIds,
    assignPermissionToRole,
    revokePermissionFromRole,
    selectedRoleName,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !apellidos || !email) return;

    // El rol dejó de ser un `<select required>` —ahora es una lista propia— así que
    // el navegador ya no bloquea el envío por él. Sin este aviso, guardar sin rol
    // no haría nada y no se vería por qué.
    if (!roleId) {
      setNotificationMsg({
        title: 'Falta el rol',
        message: 'Selecciona el rol del usuario antes de guardar.',
        type: 'error',
      });
      setShowNotification(true);
      return;
    }

    // El servidor lo exige igualmente, tanto al crear como al editar. Aquí se avisa
    // antes de enviar para no perder el formulario entero por el dominio del correo.
    const falloEmail = validarEmail(email);
    if (falloEmail) {
      setNotificationMsg({ title: 'Correo no válido', message: falloEmail, type: 'error' });
      setShowNotification(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (editingUserId) {
        const data: CambiosUsuario = { name, apellidos, email, role_id: roleId };
        if (expirationDate) data.expiration_date = expirationDate;
        if (resetPassword) data.reset_password = true;
        if (resetSecurityQuestions) data.reset_security_questions = true;
        response = await updateUser(editingUserId, data);
        setNotificationMsg({ title: 'Usuario actualizado', message: 'El usuario se ha actualizado exitosamente.', type: 'success' });
      } else {
        const data: NuevoUsuario = { name, apellidos, email, role_id: roleId };
        if (expirationDate) data.expiration_date = expirationDate;
        response = await createUser(data);
        setNotificationMsg({ title: 'Usuario creado', message: 'El usuario se ha creado exitosamente.', type: 'success' });
      }

      // Los permisos ya NO se guardan aquí: son del rol, no de esta cuenta, y
      // mezclarlos hacía que dar de alta a una persona reescribiera lo que pueden hacer
      // todas las demás con su mismo rol. Los guarda `ModalPermisos` con su propio botón.

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
    setApellidos(user.apellidos || '');
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
    setApellidos('');
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="admin-header text-zinc-900 dark:text-[#f6f6f6]">Usuarios</h1>
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
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Nombres</label>
            <input
              type="text"
              maxLength={50}
              required
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Apellidos</label>
            <input
              type="text"
              maxLength={50}
              required
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Correo electrónico</label>
            <input
              type="email"
              maxLength={100}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Rol</label>
            <CustomSelect
              ariaLabel="Rol"
              value={roleId}
              onChange={setRoleId}
              placeholder="Selecciona un rol"
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Fecha de caducidad (Opcional)</label>
            <DatePicker
              ariaLabel="Fecha de caducidad"
              value={expirationDate}
              onChange={setExpirationDate}
            />
          </div>

          {/* Permisos asignados — abre modal */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Permisos</label>
            <div>
              <Button
                type="button"
                onClick={() => setShowPermissionsModal(true)}
                disabled={!roleId || loadingRolePerms}
              >
                Configurar
              </Button>
            </div>
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
      <ModalPermisos
        abierto={showPermissionsModal}
        onCerrar={() => setShowPermissionsModal(false)}
        rol={roleId ? { id: roleId, nombre: selectedRoleName } : null}
        permisos={permissions}
        originales={originalPermissionIds}
        seleccionados={selectedPermissionIds}
        onCambiarSeleccion={setSelectedPermissionIds}
        onGuardar={guardarPermisos}
        guardando={guardandoPermisos}
      />

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
          <Button type="button" variant="danger" onClick={confirmDelete}>
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
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-[#f6f6f6]">
                      {[user.name, user.apellidos].filter(Boolean).join(' ')}
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
