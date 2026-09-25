'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  useUsuarios,
  mensajeDeError,
  type Role,
  type Permission,
} from '../hooks/use-usuarios';
import { Button } from '@/shared/ui/atoms/button';
import { Switch } from '@/shared/ui/atoms/switch';
import { Notification } from '@/shared/ui/molecules/notification';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/shared/ui/molecules/alert';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { ModalPermisos } from './modal-permisos';

function ModalNuevoEditor({
  open,
  onClose,
  onGuardar,
  guardando,
  permisos,
}: {
  open: boolean;
  onClose: () => void;
  onGuardar: (nombre: string, descripcion: string, permisosIds: string[]) => Promise<void>;
  guardando: boolean;
  permisos: Permission[];
}) {
  const [nombreExtra, setNombreExtra] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selecionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [mostrandoPermisos, setMostrandoPermisos] = useState(false);

  // Aquí no hay efecto que limpie el formulario al abrir: el padre cambia la `key` en
  // cada apertura, así que este componente se monta de cero y el estado ya nace vacío.
  // Limpiarlo con un efecto obligaba a pintar una vez con los datos del rol anterior
  // antes de borrarlos (`react-hooks/set-state-in-effect`).

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreExtra.trim()) return;
    const nombreFinal = `Editor ${nombreExtra.trim()}`;
    await onGuardar(nombreFinal, descripcion.trim(), Array.from(selecionados));
  };

  return (
    <>
      <Alert open={open && !mostrandoPermisos} onClose={() => !guardando && onClose()}>
        <AlertTitle>Nuevo Editor</AlertTitle>
        <AlertDescription>
          Completa los campos para crear un nuevo rol de editor.
        </AlertDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">
              Nombre del rol
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 text-sm bg-zinc-100 border border-zinc-300 rounded-lg dark:bg-[#0f1624] dark:border-zinc-800 text-zinc-500 font-medium">Editor</span>
              <input
                type="text"
                required
                maxLength={70}
                placeholder="ej: Inicio"
                value={nombreExtra}
                onChange={(e) => setNombreExtra(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">
              Descripcion
            </label>
            <textarea
              maxLength={200}
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-[#7db828]/30 dark:text-[#f6f6f6] dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-[#cbd5e1] mb-1">
              Permisos
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMostrandoPermisos(true)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-[#131b2f] dark:text-zinc-300 dark:hover:bg-zinc-800/50"
              >
                Añadir permisos
              </button>
              <span className="text-sm text-zinc-500 dark:text-[#94a3b8]">
                {selecionados.size} seleccionados
              </span>
            </div>
          </div>

          <AlertActions>
            <Button type="button" plain onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </AlertActions>
        </form>
      </Alert>

      <ModalPermisos
        abierto={mostrandoPermisos}
        onCerrar={() => setMostrandoPermisos(false)}
        rol={null}
        permisos={permisos}
        originales={new Set()}
        seleccionados={selecionados}
        onCambiarSeleccion={setSeleccionados}
        onGuardar={async () => { setMostrandoPermisos(false); }}
        guardando={false}
      />
    </>
  );
}

/**
 * Este panel es solo para roles de Editor. `Superadmin`, `Administrador` y
 * `Director/Subdirector` reciben sus permisos de `sembrar-permisos-roles.ts` en el
 * backend, no de un formulario — ver `api-backend/src/shared/roles-protegidos.ts`,
 * que además hace que el servidor rechace cualquier intento de tocarlos aunque se
 * salte esta pantalla. Filtrar aquí solo evita ofrecer un control que de todos
 * modos respondería 403.
 */
const esRolDeEditor = (nombre: string) => {
  const n = nombre.trim().toLowerCase();
  return n === 'editor' || n.startsWith('editor ');
};

export default function RolesView() {
  const {
    roles,
    permissions,
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,
    assignPermissionToRole,
    revokePermissionFromRole,
  } = useUsuarios();

  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);

  const [modalRolAbierto, setModalRolAbierto] = useState(false);
  // Contador de aperturas usado como `key` de `ModalNuevoEditor`: cambia al abrir —y
  // solo al abrir— para que React lo monte limpio en vez de que el modal se vacíe a sí
  // mismo con un efecto. Si cambiara también al cerrar, el `Alert` se desmontaría de
  // golpe y se perdería su animación de salida.
  const [aperturaModalRol, setAperturaModalRol] = useState(0);
  const [rolEditando, setRolEditando] = useState<Role | null>(null);
  const [guardandoRol, setGuardandoRol] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [rolPermisos, setRolPermisos] = useState<Role | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState('');
  const [descripcionEdicion, setDescripcionEdicion] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [originalPermissionIds, setOriginalPermissionIds] = useState<Set<string>>(new Set());
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);
  const [guardandoPermisos, setGuardandoPermisos] = useState(false);

  useEffect(() => {
    let cancelado = false;
    Promise.all([fetchRoles(), fetchPermissions()]).finally(() => {
      if (!cancelado) setLoading(false);
    });
    return () => { cancelado = true; };
  }, [fetchRoles, fetchPermissions]);

  const normalizar = (t: string) =>
    t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  const rolesDeVista = useMemo(() => roles.filter((r) => esRolDeEditor(r.name)), [roles]);

  const rolesFiltrados = useMemo(() => {
    const q = normalizar(busqueda);
    if (!q) return rolesDeVista;
    return rolesDeVista.filter((r) =>
      normalizar(`${r.name} ${r.description ?? ''}`).includes(q)
    );
  }, [rolesDeVista, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(rolesFiltrados.length / itemsPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const rolesPagina = rolesFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const notificar = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setNotificationMsg({ title, message, type });
    setShowNotification(true);
  };

  const handleGuardarRol = async (nombre: string, descripcion: string, permisosIds?: string[]) => {
    setGuardandoRol(true);
    try {
      if (rolEditando) {
        const res = await fetch(`/api/roles/${rolEditando.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nombre, description: descripcion }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Error al actualizar');
        notificar('Rol actualizado', 'Los cambios se guardaron correctamente.');
      } else {
        const res = await fetch('/api/roles', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nombre, description: descripcion }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Error al crear');
        
        const data = await res.json();
        
        if (permisosIds && permisosIds.length > 0) {
          await Promise.all(permisosIds.map(permId => assignPermissionToRole(data.id, permId)));
        }

        notificar('Rol creado', 'El nuevo rol se creo y configuro correctamente.');
      }
      setModalRolAbierto(false);
      setRolEditando(null);
      await fetchRoles();
    } catch (err) {
      notificar('Error', mensajeDeError(err) || 'No se pudo guardar el rol.', 'error');
    } finally {
      setGuardandoRol(false);
    }
  };

  const handleEliminar = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`/api/roles/${deleteConfirmId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al eliminar');
      notificar('Rol eliminado', 'El rol se elimino exitosamente.');
      await fetchRoles();
    } catch (err) {
      notificar('Error', mensajeDeError(err) || 'No se pudo eliminar el rol.', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const abrirModalPermisos = useCallback(async (rol: Role) => {
    setRolPermisos(rol);
    setNombreEdicion(rol.name);
    setDescripcionEdicion(rol.description || '');
    setSelectedPermissionIds(new Set());
    setOriginalPermissionIds(new Set());
    setLoadingRolePerms(true);
    try {
      await fetchPermissions();
      const rolePerms = await fetchRolePermissions(rol.id);
      // `permission_id` no está en `Permission`: la API devuelve la fila de
      // `roles_permisos` en algunos caminos y el permiso ya resuelto en otros. Se leen
      // los dos en vez de asumir uno, y el tipo lo dice en lugar de taparlo con `any`.
      const ids = new Set<string>(
        rolePerms.map((rp: Permission & { permission_id?: string }) => rp.permission_id ?? rp.id)
      );
      setSelectedPermissionIds(new Set(ids));
      setOriginalPermissionIds(new Set(ids));
    } catch (err) {
      console.error('Error cargando permisos del rol:', err);
    } finally {
      setLoadingRolePerms(false);
    }
  }, [fetchRolePermissions]);

  const guardarPermisos = useCallback(async () => {
    if (!rolPermisos) return;
    setGuardandoPermisos(true);
    try {
      const aAsignar = [...selectedPermissionIds].filter((id) => !originalPermissionIds.has(id));
      const aRevocar = [...originalPermissionIds].filter((id) => !selectedPermissionIds.has(id));
      
      const promises: Promise<any>[] = [
        ...aAsignar.map((permId) => assignPermissionToRole(rolPermisos.id, permId)),
        ...aRevocar.map((permId) => revokePermissionFromRole(rolPermisos.id, permId)),
      ];

      const descripcionCambiada = descripcionEdicion !== (rolPermisos.description || '');
      const nombreCambiado = nombreEdicion !== rolPermisos.name && nombreEdicion.trim() !== '';
      if (descripcionCambiada || nombreCambiado) {
        promises.push(
          fetch(`/api/roles/${rolPermisos.id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              ...(nombreCambiado && { name: nombreEdicion.trim() }),
              ...(descripcionCambiada && { description: descripcionEdicion }),
            }),
          }).then(async res => {
             if (!res.ok) throw new Error((await res.json()).error || 'Error al actualizar detalles del rol');
          })
        );
      }

      await Promise.all(promises);

      if (descripcionCambiada || nombreCambiado) {
        await fetchRoles();
      }

      setOriginalPermissionIds(new Set(selectedPermissionIds));
      setRolPermisos(null);
      notificar('Rol actualizado', `Se aplicaron los cambios para el rol "${rolPermisos.name}".`);
    } catch (err) {
      notificar('Error', mensajeDeError(err) || 'No se pudieron guardar los cambios.', 'error');
    } finally {
      setGuardandoPermisos(false);
    }
  }, [rolPermisos, selectedPermissionIds, originalPermissionIds, assignPermissionToRole, revokePermissionFromRole, descripcionEdicion, fetchRoles]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="admin-header text-zinc-900 dark:text-[#f6f6f6]">Gestion de Roles</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#94a3b8]">
            Administra los roles del sistema y configura sus permisos
          </p>
        </div>
        <div>
          <Button
            onClick={async () => {
              await fetchPermissions();
              setAperturaModalRol((n) => n + 1);
              setModalRolAbierto(true);
            }}
          >
            Nuevo Editor
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          placeholder="Buscar roles..."
          className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-interactive focus:outline-none focus:ring-2 focus:ring-brand-interactive/20 dark:border-zinc-700 dark:bg-[#131b2f] dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-[#7db828]/30 dark:bg-[#131b2f]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-[#0f1624] dark:text-[#94a3b8]">
            <tr>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Descripcion</th>
              <th className="px-5 py-3 text-center">Permisos</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  Cargando roles...
                </td>
              </tr>
            ) : rolesPagina.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay roles registrados.'}
                </td>
              </tr>
            ) : (
              rolesPagina.map((rol) => {
                const numPermisos = rol.permissions?.length ?? 0;
                const noEliminable = rol.name === 'Editor';
                return (
                  <tr key={rol.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-[#0f1624]/60">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-zinc-900 dark:text-[#f6f6f6]">{rol.name}</span>
                    </td>
                    <td className="max-w-xs px-5 py-3.5">
                      <span className="truncate text-zinc-500 dark:text-[#94a3b8]">
                        {rol.description || 'Sin descripcion'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-interactive/30 bg-brand-interactive/10 px-2.5 py-0.5 text-xs font-semibold text-brand-interactive">
                        {numPermisos} permiso{numPermisos !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => abrirModalPermisos(rol)}
                          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                          title="Editar rol y permisos"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => !noEliminable && setDeleteConfirmId(rol.id)}
                          disabled={noEliminable}
                          className={`rounded-lg p-1.5 transition-colors ${
                            noEliminable
                              ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                              : 'text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300'
                          }`}
                          title={noEliminable ? 'No se puede eliminar el rol base de Editor' : 'Eliminar rol'}
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <Paginador
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPagina}
          total={rolesFiltrados.length}
          porPagina={itemsPorPagina}
          onCambiarPorPagina={(n) => {
            setItemsPorPagina(n);
            setPagina(1);
          }}
          etiqueta="roles"
          className="px-5"
        />
      </div>

      <ModalNuevoEditor
        key={aperturaModalRol}
        open={modalRolAbierto}
        onClose={() => setModalRolAbierto(false)}
        onGuardar={handleGuardarRol}
        guardando={guardandoRol}
        permisos={permissions}
      />

      <Alert open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <AlertTitle>Eliminar este rol?</AlertTitle>
        <AlertDescription>Esta accion no se puede deshacer. Los usuarios con este rol quedaran sin rol asignado.</AlertDescription>
        <AlertActions>
          <Button type="button" plain onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
          <Button type="button" onClick={handleEliminar}>Eliminar</Button>
        </AlertActions>
      </Alert>

      <ModalPermisos
        abierto={!!rolPermisos}
        onCerrar={() => { setRolPermisos(null); setLoadingRolePerms(false); }}
        rol={rolPermisos ? { id: rolPermisos.id, nombre: rolPermisos.name, descripcion: rolPermisos.description } : null}
        permisos={loadingRolePerms ? [] : permissions}
        originales={originalPermissionIds}
        seleccionados={selectedPermissionIds}
        onCambiarSeleccion={setSelectedPermissionIds}
        nombre={nombreEdicion}
        onCambiarNombre={setNombreEdicion}
        descripcion={descripcionEdicion}
        onCambiarDescripcion={setDescripcionEdicion}
        onGuardar={guardarPermisos}
        guardando={guardandoPermisos}
      />

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
