'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { GRUPO_TOOLTIP, TOOLTIP_ENCIMA } from '@/shared/ui/atoms/tooltip';
import { COLOR_DE_ACCION } from '@/shared/lib/identidad-panel';
import { validarEmail } from '@olo/email-policy';
import {
  useUsuarios,
  mensajeDeError,
  type User,
  type NuevoUsuario,
  type CambiosUsuario,
} from '../hooks/use-usuarios';
import { Button } from '@/shared/ui/atoms/button';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { Notification } from '@/shared/ui/molecules/notification';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/shared/ui/molecules/alert';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { Switch } from '@/shared/ui/atoms/switch';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';

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

/**
 * `locked_until` es el mismo campo que usan tanto el login como las preguntas de
 * seguridad (§3): mientras está en el futuro, el backend rechaza ambos caminos por
 * igual, así que un solo indicador cubre los dos casos sin necesidad de adivinar cuál
 * de los dos disparó el bloqueo.
 */
function infoBloqueo(user: User, ahora: number): string | null {
  if (!user.locked_until) return null;
  const msRestante = new Date(user.locked_until).getTime() - ahora;
  if (msRestante <= 0) return null;

  const minutos = Math.floor(msRestante / 60000);
  const segundos = Math.floor((msRestante % 60000) / 1000);
  const tiempo = minutos > 0 ? `${minutos} min` : `${segundos} s`;
  return `Bloqueada · ${tiempo} restantes`;
}

export default function UsuariosView() {
  const {
    users, roles, loading, error,
    fetchUsers, fetchRoles,
    createUser, updateUser, deleteUser,
  } = useUsuarios();


  const [isCreating, setIsCreating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Additional Actions state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [itemsPorPaginaUsuarios, setItemsPorPaginaUsuarios] = useState(15);

  // Form state
  const [name, setName] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [resetPassword, setResetPassword] = useState(false);
  const [resetSecurityQuestions, setResetSecurityQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Credentials state
  const [newUserCredentials, setNewUserCredentials] = useState<{ name: string, email: string, password: string, vence?: string | null } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Refresca la cuenta regresiva del bloqueo sin volver a pedir la lista al servidor.
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const handleRoleChange = useCallback((newRoleId: string) => {
    setRoleId(newRoleId);
  }, []);

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
        // La fecha va siempre, también vacía: `null` es «sin caducidad». Mandarla solo
        // si tenía valor hacía que «Borrar» en el calendario no llegara a la base, y la
        // API —que no recibía el campo— dejaba la fecha anterior.
        const data: CambiosUsuario = {
          name,
          apellidos,
          email,
          role_id: roleId,
          expiration_date: expirationDate || null,
        };
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
          password: response.temporaryPassword,
          vence: response.temp_password_expires_at,
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
          password: res.temporaryPassword,
          vence: res.temp_password_expires_at,
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
    setRoleId(user.role_id);
    setExpirationDate(user.expiration_date ? user.expiration_date.split('T')[0] : '');
    setResetPassword(false);
    setResetSecurityQuestions(false);
    setIsCreating(true);
  };

  function resetForm() {
    setName('');
    setApellidos('');
    setEmail('');
    setRoleId('');
    setExpirationDate('');
    setResetPassword(false);
    setResetSecurityQuestions(false);
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

  const normalizar = (t: string) =>
    t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  const usuariosFiltrados = useMemo(() => {
    const q = normalizar(busqueda);
    if (!q) return users;
    return users.filter((u) => {
      const nombreCompleto = `${u.name} ${u.apellidos ?? ''}`;
      const rolNombre = u.role?.name ?? '';
      return normalizar(`${nombreCompleto} ${u.email} ${rolNombre}`).includes(q);
    });
  }, [users, busqueda]);

  const totalPaginasUsuarios = Math.max(1, Math.ceil(usuariosFiltrados.length / itemsPorPaginaUsuarios));
  const paginaActualUsuarios = Math.min(paginaUsuarios, totalPaginasUsuarios);
  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaActualUsuarios - 1) * itemsPorPaginaUsuarios,
    paginaActualUsuarios * itemsPorPaginaUsuarios,
  );

  return (
    <div className="px-4 py-6 sm:p-6">
      <EncabezadoPanel
        titulo="Usuarios"
        descripcion="Controla los usuarios que actúan en las diferentes plataformas"
        className="mb-8"
        acciones={
          <Button onClick={() => {
            setEditingUserId(null);
            resetForm();
            setIsCreating(true);
          }}>
            Crear Usuario
          </Button>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
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
              onChange={handleRoleChange}
              placeholder="Selecciona un rol"
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">Fecha de caducidad</label>
            <DatePicker
              ariaLabel="Fecha de caducidad"
              value={expirationDate}
              onChange={setExpirationDate}
            />
          </div>

          {editingUserId && (
            <div className="pt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="reset_pwd" checked={resetPassword} onChange={e => setResetPassword(e.target.checked)} className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:checked:bg-white dark:focus:ring-white" />
                <label htmlFor="reset_pwd" className="text-sm font-medium text-zinc-700 dark:text-[#cbd5e1]">Restablecer contraseña</label>
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

      <Alert open={!!newUserCredentials} onClose={handleCloseCredentials}>
        <AlertTitle>Contraseña temporal generada</AlertTitle>
        <AlertDescription>
          {newUserCredentials && (
            <>
             {/* La API la emite con 72 horas de vigencia: si la persona no entra antes,
                  habrá que restablecerla. Se dice aquí para que quien la entrega lo avise. */}
              {newUserCredentials.vence && (
                <p className="m-0 mt-2 text-xs text-zinc-500 dark:text-[#94a3b8]">
                  Estará vigente hasta el{' '}
                  <span className="font-semibold text-zinc-900 dark:text-[#f6f6f6]">
                    {new Date(newUserCredentials.vence).toLocaleString('es-CO', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </span>
                   <br />En caso de vencerse debe generar una nueva.
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-[#7db828]/30 dark:bg-[#0b1121]/50">
                <span className="min-w-0 flex-1 truncate font-mono text-sm tracking-wide text-zinc-900 dark:text-[#f6f6f6]">
                  {newUserCredentials.password}
                </span>
              </div>
              {!copiedPassword && (
                <p className="m-0 mt-2 text-xs font-medium text-amber-600 dark:text-amber-500">
                  ⚠ Debes copiar la contraseña para poder cerrar, no la podrás ver de nuevo.
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

      <div className="mb-6">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaUsuarios(1);
          }}
          placeholder="Buscar usuarios..."
          className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-interactive focus:outline-none focus:ring-2 focus:ring-brand-interactive/20 dark:border-zinc-700 dark:bg-[#131b2f] dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Cargando, el loader va en lugar de la tabla y no en una de sus filas: así llena el
          espacio de la sección como en las demás (una celda no se puede estirar). */}
      {loading ? (
        <CargandoSeccion label="Cargando usuarios..." />
      ) : (
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#7db828]/30 dark:bg-[#0b1121]">
        <div className="overflow-x-auto">
          <table className="olo-tabla-apilable min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-[#0b1121]/50">
              <tr>
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#94a3b8]">
                  Bloqueo
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-[#94a3b8]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-500">
                    {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay usuarios registrados.'}
                  </td>
                </tr>
              ) : (
                usuariosPaginados.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-2 text-sm font-medium text-zinc-900 dark:text-[#f6f6f6]">
                      {[user.name, user.apellidos].filter(Boolean).join(' ')}
                    </td>
                    <td data-etiqueta="Correo" className="px-6 py-2 text-sm text-zinc-500 dark:text-[#94a3b8]">
                      {user.email}
                    </td>
                    <td data-etiqueta="Rol" className="px-6 py-2 text-sm text-zinc-500 dark:text-[#94a3b8]">
                      {user.role?.name || 'Sin rol'}
                    </td>
                    <td data-etiqueta="Estado" className="px-6 py-2 text-sm">
                      {/* Sin «Activo/Inactivo» al lado: el interruptor ya lo muestra, y el
                          lector lo dice por `role="switch"` + `aria-checked`. El tooltip dice
                          la acción que hará al pulsarlo. */}
                      <span className={`${GRUPO_TOOLTIP} inline-flex`}>
                        <Switch
                          checked={user.status === 'active'}
                          onChange={() => toggleStatus(user)}
                          aria-label="Usuario activo"
                        />
                        <span
                          aria-hidden="true"
                          className={`${TOOLTIP_ENCIMA} ${user.status === 'active' ? COLOR_DE_ACCION.desactivar : COLOR_DE_ACCION.activar}`}
                        >
                          {user.status === 'active' ? 'Desactivar' : 'Activar'}
                        </span>
                      </span>
                    </td>
                    <td data-etiqueta="Bloqueo" className="px-6 py-2 text-sm">
                      {(() => {
                        const bloqueo = infoBloqueo(user, ahora);
                        return bloqueo ? (
                          <span
                            title="Login y preguntas de seguridad bloqueados por intentos fallidos"
                            className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200"
                          >
                            {bloqueo}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600">—</span>
                        );
                      })()}
                    </td>
                    <td data-etiqueta="Acciones" className="px-6 py-2 text-sm text-right">
                      <div className="flex items-center gap-2 @3xl:justify-end">
                        {/* Icono de dos colores (persona gris, lápiz verde): va como imagen y no con
                            `IconoMascara`, que pinta todo de un solo color. El nombre lo da el
                            `aria-label`; el tooltip es `aria-hidden` para no leerlo dos veces. */}
                        <button
                          type="button"
                          onClick={() => startEdit(user)}
                          aria-label="Editar usuario"
                          className={`${GRUPO_TOOLTIP} rounded-lg p-1.5 transition-colors hover:bg-[#7DB728]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB728]`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático de /public: next/image no aporta nada aquí. */}
                          <img src="/assets/svg/editar-usuario.svg" alt="" aria-hidden="true" className="h-6 w-auto" />
                          <span aria-hidden="true" className={`${TOOLTIP_ENCIMA} ${COLOR_DE_ACCION.editar}`}>
                            Editar usuario
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(user.id)}
                          aria-label="Eliminar usuario"
                          className={`${GRUPO_TOOLTIP} rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400`}
                        >
                          <TrashIcon className="size-5" />
                          <span aria-hidden="true" className={`${TOOLTIP_ENCIMA} ${COLOR_DE_ACCION.eliminar}`}>
                            Eliminar
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Paginador
          pagina={paginaActualUsuarios}
          totalPaginas={totalPaginasUsuarios}
          onCambiarPagina={setPaginaUsuarios}
          total={usuariosFiltrados.length}
          porPagina={itemsPorPaginaUsuarios}
          onCambiarPorPagina={(n) => {
            setItemsPorPaginaUsuarios(n);
            setPaginaUsuarios(1);
          }}
          etiqueta="usuarios"
          className="px-6"
        />
      </div>
      )}

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
