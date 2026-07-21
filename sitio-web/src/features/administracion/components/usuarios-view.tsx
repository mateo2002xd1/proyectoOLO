'use client';

import { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useUsuarios, User } from '../hooks/use-usuarios';
import { Button } from '@/shared/ui/atoms/button';
import { Notification } from '@/shared/ui/molecules/notification';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/shared/ui/molecules/alert';
import { Switch } from '@/shared/ui/atoms/switch';

export default function UsuariosView() {
  const { users, roles, loading, error, fetchUsers, fetchRoles, createUser, updateUser, deleteUser } = useUsuarios();
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

  // Credentials state
  const [newUserCredentials, setNewUserCredentials] = useState<{name: string, email: string, password: string} | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleId) return;

    setIsSubmitting(true);
    try {
      let response;
      if (editingUserId) {
        const data: any = { name, email, role_id: roleId };
        if (expirationDate) data.expiration_date = expirationDate;
        if (resetPassword) data.reset_password = true;
        if (resetSecurityQuestions) data.reset_security_questions = true;
        response = await updateUser(editingUserId, data);
        setNotificationMsg({ title: 'Usuario actualizado', message: 'El usuario se ha actualizado exitosamente.', type: 'success' });
      } else {
        const data: any = { name, email, role_id: roleId };
        if (expirationDate) data.expiration_date = expirationDate;
        response = await createUser(data);
        setNotificationMsg({ title: 'Usuario creado', message: 'El usuario se ha creado exitosamente.', type: 'success' });
      }

      setIsCreating(false);
      setEditingUserId(null);
      setName('');
      setEmail('');
      setRoleId('');
      setExpirationDate('');
      setResetPassword(false);
      setResetSecurityQuestions(false);
      setShowNotification(true);

      if (response && response.temporaryPassword) {
        setNewUserCredentials({
          name: response.name || name,
          email: response.email || email,
          password: response.temporaryPassword
        });
        setCopiedPassword(false);
      }
    } catch (err: any) {
      setNotificationMsg({ title: 'Error', message: err.message || 'Error al procesar la solicitud', type: 'error' });
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
    } catch (err: any) {
       setNotificationMsg({ title: 'Error', message: err.message || 'No se pudo cambiar el estado', type: 'error' });
       setShowNotification(true);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteUser(deleteConfirmId);
      setNotificationMsg({ title: 'Usuario eliminado', message: 'El usuario se eliminó exitosamente.', type: 'success' });
      setShowNotification(true);
    } catch(err: any) {
      setNotificationMsg({ title: 'Error', message: err.message || 'No se pudo eliminar el usuario', type: 'error' });
      setShowNotification(true);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRoleId(user.role_id);
    setExpirationDate(user.expiration_date ? user.expiration_date.split('T')[0] : '');
    setResetPassword(false);
    setResetSecurityQuestions(false);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingUserId(null);
    setName('');
    setEmail('');
    setRoleId('');
    setExpirationDate('');
    setResetPassword(false);
    setResetSecurityQuestions(false);
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Usuarios</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Controla los usuarios que actúan en las diferentes plataformas
          </p>
        </div>
        <Button onClick={() => {
          setEditingUserId(null);
          setName('');
          setEmail('');
          setRoleId('');
          setExpirationDate('');
          setResetPassword(false);
          setResetSecurityQuestions(false);
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
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombre completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rol</label>
            <select
              required
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:text-white dark:focus:border-white dark:focus:ring-white [&>option]:text-zinc-900"
            >
              <option value="" disabled>Selecciona un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fecha de caducidad (Opcional)</label>
            <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="olo-date-input" />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Permisos de acceso (No funcional aún)</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="permisos_tipo" defaultChecked className="mt-0.5 size-4 rounded-full border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-white dark:focus:ring-white" />
                <div>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-white">Acceso a Intranet</span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">Permite ver y consumir contenido, pero no administrarlo.</span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="permisos_tipo" className="mt-0.5 size-4 rounded-full border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-white dark:focus:ring-white" />
                <div>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-white">Acceso al Panel Administrativo</span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">Permite gestionar contenido, usuarios y configuraciones.</span>
                </div>
              </label>
            </div>
          </div>

          {editingUserId && (
             <div className="pt-2 flex flex-col gap-3">
               <div className="flex items-center gap-2">
                 <input type="checkbox" id="reset_pwd" checked={resetPassword} onChange={e => setResetPassword(e.target.checked)} className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-white dark:focus:ring-white" />
                 <label htmlFor="reset_pwd" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Restablecer contraseña (generará una temporal)</label>
               </div>
               <div className="flex items-center gap-2">
                 <input type="checkbox" id="reset_sq" checked={resetSecurityQuestions} onChange={e => setResetSecurityQuestions(e.target.checked)} className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-white dark:focus:ring-white" />
                 <label htmlFor="reset_sq" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Restablecer preguntas de seguridad</label>
               </div>
             </div>
          )}

          <AlertActions>
            <Button type="button" plain onClick={handleCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Guardar'}
            </Button>
          </AlertActions>
        </form>
      </Alert>

      <Alert open={!!newUserCredentials} onClose={handleCloseCredentials}>
        <AlertTitle>Contraseña temporal generada</AlertTitle>
        <AlertDescription>
          {newUserCredentials && (
            <>
              <p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-white">{newUserCredentials.name}</span>
                {" · "}
                {newUserCredentials.email}
              </p>
              <p className="m-0 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Copia la contraseña antes de cerrar. No podrás verla de nuevo.
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <span className="min-w-0 flex-1 truncate font-mono text-sm tracking-wide text-zinc-900 dark:text-white">
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

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Correo
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Rol
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Estado
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {user.role?.name || 'Sin rol'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Switch
                           checked={user.status === 'active'}
                           onChange={() => toggleStatus(user)}
                        />
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">{user.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => startEdit(user)} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors" title="Editar">
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
