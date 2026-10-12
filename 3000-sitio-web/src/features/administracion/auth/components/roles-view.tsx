'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { GRUPO_TOOLTIP, TOOLTIP_ENCIMA, TOOLTIP_ENCIMA_A_LA_DERECHA } from '@/shared/ui/atoms/tooltip';
import { COLOR_DE_ACCION } from '@/shared/lib/identidad-panel';
import {
  useUsuarios,
  mensajeDeError,
  type Role,
  type Permission,
} from '../hooks/use-usuarios';
import { Button } from '@/shared/ui/atoms/button';
import { Notification } from '@/shared/ui/molecules/notification';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  areaDeModalClass,
  campoDeModalClass,
  etiquetaDeModalClass,
} from '@/shared/ui/molecules/alert';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { BotonDeFila, RESALTE_DE_FILA, ResumenDeFila, useFilasAbiertas } from '@/shared/ui/molecules/fila-acordeon';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { ModalPermisos } from './modal-permisos';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';

/** Largo máximo de la descripción de un rol nuevo. */
const DESCRIPCION_MAX = 100;

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
            <label htmlFor="rol-nombre" className={etiquetaDeModalClass}>
              Nombre del rol
            </label>
            <div className="flex items-center gap-2">
              <span className="flex h-11 shrink-0 items-center rounded-[32px] border border-[#d9d9d9] bg-zinc-100 px-5 text-base font-medium text-zinc-500 dark:border-[#2d3649] dark:bg-[#0f1624]">Editor</span>
              <input
                id="rol-nombre"
                type="text"
                required
                maxLength={70}
                placeholder="ej: Inicio"
                value={nombreExtra}
                onChange={(e) => setNombreExtra(e.target.value)}
                className={campoDeModalClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="rol-descripcion" className={etiquetaDeModalClass}>
              Descripción
            </label>
            {/* 100 caracteres contados al escribir y sin el agarre para estirarlo, como el
                motivo de la cola de revisión. La API no lo limita (`descripcion` es TEXT). */}
            <textarea
              id="rol-descripcion"
              maxLength={DESCRIPCION_MAX}
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              aria-describedby="rol-descripcion-cuenta"
              className={`${areaDeModalClass} resize-none`}
            />
            <p
              id="rol-descripcion-cuenta"
              className={`mt-2 text-right text-xs tabular-nums ${
                descripcion.length >= DESCRIPCION_MAX ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {descripcion.length}/{DESCRIPCION_MAX}
            </p>
          </div>
          <div>
            <p className={etiquetaDeModalClass}>Permisos</p>
            <div className="flex items-center gap-3">
              <Button type="button" plain onClick={() => setMostrandoPermisos(true)}>
                Añadir permisos
              </Button>
              <span className="text-sm text-zinc-500 dark:text-[#94a3b8]">
                {selecionados.size} seleccionados
              </span>
            </div>
          </div>

          <AlertActions>
            <Button type="button" plain onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" variant="verde" disabled={guardando}>
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
    users,
    fetchUsers,
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
  const { estaAbierta, alternar } = useFilasAbiertas();
  const [itemsPorPagina, setItemsPorPagina] = useState(15);

  const [modalRolAbierto, setModalRolAbierto] = useState(false);
  // Contador de aperturas usado como `key` de `ModalNuevoEditor`: cambia al abrir —y
  // solo al abrir— para que React lo monte limpio en vez de que el modal se vacíe a sí
  // mismo con un efecto. Si cambiara también al cerrar, el `Alert` se desmontaría de
  // golpe y se perdería su animación de salida.
  const [aperturaModalRol, setAperturaModalRol] = useState(0);
  const [rolEditando, setRolEditando] = useState<Role | null>(null);
  const [guardandoRol, setGuardandoRol] = useState(false);

  const [rolAEliminar, setRolAEliminar] = useState<Role | null>(null);
  const [eliminandoRol, setEliminandoRol] = useState(false);

  const [rolPermisos, setRolPermisos] = useState<Role | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState('');
  const [descripcionEdicion, setDescripcionEdicion] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [originalPermissionIds, setOriginalPermissionIds] = useState<Set<string>>(new Set());
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);
  const [guardandoPermisos, setGuardandoPermisos] = useState(false);

  useEffect(() => {
    let cancelado = false;
    Promise.all([fetchRoles(), fetchPermissions(), fetchUsers()]).finally(() => {
      if (!cancelado) setLoading(false);
    });
    return () => { cancelado = true; };
  }, [fetchRoles, fetchPermissions, fetchUsers]);

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

  const usuariosDelRolAEliminar = useMemo(() => {
    if (!rolAEliminar) return [];
    return users.filter((u) => u.role_id === rolAEliminar.id || u.role?.id === rolAEliminar.id);
  }, [rolAEliminar, users]);
  const tieneUsuariosAsignados = usuariosDelRolAEliminar.length > 0;

  const handleEliminar = async () => {
    if (!rolAEliminar) return;
    setEliminandoRol(true);
    try {
      const res = await fetch(`/api/roles/${rolAEliminar.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      notificar('Rol eliminado', `El rol «${rolAEliminar.name}» se eliminó exitosamente.`);
      await Promise.all([fetchRoles(), fetchUsers()]);
    } catch (err) {
      notificar('Error', mensajeDeError(err) || 'No se pudo eliminar el rol.', 'error');
    } finally {
      setEliminandoRol(false);
      setRolAEliminar(null);
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
      if (descripcionCambiada) {
        promises.push(
          fetch(`/api/roles/${rolPermisos.id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              description: descripcionEdicion,
            }),
          }).then(async res => {
             if (!res.ok) throw new Error((await res.json()).error || 'Error al actualizar detalles del rol');
          })
        );
      }

      await Promise.all(promises);

      if (descripcionCambiada) {
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
    <div className="px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Gestion de Roles"
        descripcion="Administra los roles del sistema y configura sus permisos"
        className="mb-8"
        acciones={
          <Button
            onClick={async () => {
              await fetchPermissions();
              setAperturaModalRol((n) => n + 1);
              setModalRolAbierto(true);
            }}
          >
            Nuevo Editor
          </Button>
        }
      />

      <div className="mb-6">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          placeholder="Buscar roles..."
          className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-interactive focus:outline-none focus:ring-2 focus:ring-brand-interactive/20 dark:border-zinc-700 dark:bg-[#131b2f] dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Cargando, el loader va en lugar de la tabla y no en una de sus filas: así llena el
          espacio de la sección como en las demás (una celda no se puede estirar). */}
      {loading ? (
        <CargandoSeccion label="Cargando roles..." />
      ) : (
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-[#7db828]/30 dark:bg-[#131b2f]">
        {/* En el móvil y la tablet, acordeón, como Usuarios: el encabezado de cada fila es
            solo el nombre del rol y al tocarlo salen la descripción y los permisos, y debajo
            «Editar» y «Eliminar» con su nombre. Piezas en `fila-acordeon.tsx`. */}
        <table className="olo-tabla-apilable olo-tabla-acordeon w-full text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-[#0f1624] dark:text-[#94a3b8]">
            <tr>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Descripcion</th>
              <th className="px-5 py-3 text-center">Permisos</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rolesPagina.length === 0 ? (
              // `data-abierta`: en acordeón, una fila plegada solo enseña el resumen, y esta no tiene.
              <tr data-abierta>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay roles registrados.'}
                </td>
              </tr>
            ) : (
              rolesPagina.map((rol) => {
                const numPermisos = rol.permissions?.length ?? 0;
                const noEliminable = rol.name === 'Editor';
                const abierta = estaAbierta(rol.id);
                return (
                  <tr key={rol.id} data-abierta={abierta || undefined} className="transition-colors hover:bg-zinc-50 dark:hover:bg-[#0f1624]/60">
                    <td data-resumen>
                      <ResumenDeFila abierta={abierta} onAlternar={() => alternar(rol.id)}>
                        <span className={RESALTE_DE_FILA}>{rol.name}</span>
                      </ResumenDeFila>
                    </td>
                    <td data-solo-tabla className="px-5 py-2">
                      <span className="font-medium text-zinc-900 dark:text-[#f6f6f6]">{rol.name}</span>
                    </td>
                    <td data-etiqueta="Descripción" className="max-w-xs px-5 py-2">
                      <span className="truncate text-zinc-500 dark:text-[#94a3b8]">
                        {rol.description || 'Sin descripcion'}
                      </span>
                    </td>
                    <td data-etiqueta="Permisos" className="px-5 py-2 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-interactive/30 bg-brand-interactive/10 px-2.5 py-0.5 text-xs font-semibold text-brand-interactive">
                        {numPermisos} permiso{numPermisos !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td data-solo-tabla data-etiqueta="Acciones" className="px-5 py-2">
                      <div className="flex items-center gap-1 en-tabla:justify-end">
                        {/* Deslizadores de Font Awesome (`deslizadores.svg`, un color: va por máscara
                            y toma `currentColor`). En el verde de «Editar usuario»; el tooltip, del
                            color de «Editar» en Configuración → Identidad visual. */}
                        <button
                          type="button"
                          onClick={() => abrirModalPermisos(rol)}
                          aria-label="Editar rol"
                          className={`${GRUPO_TOOLTIP} rounded-lg p-1.5 text-[#7DB728] transition-colors hover:bg-[#7DB728]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB728]`}
                        >
                          <IconoMascara nombre="deslizadores" tamano="h-6 w-6" />
                          <span aria-hidden="true" className={`${TOOLTIP_ENCIMA} ${COLOR_DE_ACCION.editar}`}>
                            Editar rol
                          </span>
                        </button>
                        {/* Tooltip alineado a la derecha: es el último botón de la fila y el texto
                            del rol base es largo; centrado se saldría de la tabla. Desactivado,
                            explica por qué en gris (el `:hover` de CSS sí llega a un botón
                            `disabled`). */}
                        <button
                          type="button"
                          onClick={() => !noEliminable && setRolAEliminar(rol)}
                          disabled={noEliminable}
                          aria-label={noEliminable ? 'No se puede eliminar el rol base de Editor' : 'Eliminar rol'}
                          className={`${GRUPO_TOOLTIP} rounded-lg p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                            noEliminable
                              ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                              : 'text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300'
                          }`}
                        >
                          <TrashIcon className="size-6" />
                          <span
                            aria-hidden="true"
                            className={`${TOOLTIP_ENCIMA_A_LA_DERECHA} ${noEliminable ? 'bg-zinc-600 text-white' : COLOR_DE_ACCION.eliminar}`}
                          >
                            {noEliminable ? 'No se puede eliminar el rol base de Editor' : 'Eliminar rol'}
                          </span>
                        </button>
                      </div>
                    </td>
                    {/* Solo en acordeón y desplegada: las acciones con su nombre, al final. El rol
                        base de Editor no se elimina: el botón queda gris y dice por qué. */}
                    <td data-detalle>
                      <div className="mb-1 mt-2 grid grid-cols-2 gap-2">
                        <BotonDeFila color={COLOR_DE_ACCION.editar} onClick={() => abrirModalPermisos(rol)}>
                          <IconoMascara nombre="deslizadores" tamano="h-5 w-5" />
                          Editar
                        </BotonDeFila>
                        <BotonDeFila
                          color={noEliminable ? 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300' : COLOR_DE_ACCION.eliminar}
                          onClick={() => setRolAEliminar(rol)}
                          disabled={noEliminable}
                        >
                          <TrashIcon className="size-5" aria-hidden="true" />
                          Eliminar
                        </BotonDeFila>
                      </div>
                      {noEliminable && (
                        <p className="mb-1 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          El rol base de Editor no se puede eliminar.
                        </p>
                      )}
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
      )}

      <ModalNuevoEditor
        key={aperturaModalRol}
        open={modalRolAbierto}
        onClose={() => setModalRolAbierto(false)}
        onGuardar={handleGuardarRol}
        guardando={guardandoRol}
        permisos={permissions}
      />

      {rolAEliminar && (
        <Alert open={!!rolAEliminar} onClose={() => !eliminandoRol && setRolAEliminar(null)}>
          <AlertTitle>
            {tieneUsuariosAsignados ? 'No se puede eliminar este rol' : '¿Eliminar este rol?'}
          </AlertTitle>
          <AlertDescription>
            {tieneUsuariosAsignados ? (
              <>
                El rol <strong>«{rolAEliminar.name}»</strong> está asignado a {usuariosDelRolAEliminar.length}{' '}
                usuario{usuariosDelRolAEliminar.length === 1 ? '' : 's'}. Cada usuario debe tener siempre un rol asignado. Para eliminar este rol, primero debes dirigirte al módulo de Usuarios y reasignar a los funcionarios a otro rol.
              </>
            ) : (
              <>
                ¿Estás seguro de que deseas eliminar el rol <strong>«{rolAEliminar.name}»</strong>? Esta acción es definitiva y no se puede deshacer.
              </>
            )}
          </AlertDescription>
          <AlertActions>
            {tieneUsuariosAsignados ? (
              <Button type="button" onClick={() => setRolAEliminar(null)}>
                Entendido
              </Button>
            ) : (
              <>
                <Button type="button" plain onClick={() => setRolAEliminar(null)} disabled={eliminandoRol}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleEliminar}
                  disabled={eliminandoRol}
                  className="!bg-red-600 !text-white hover:!bg-red-700"
                >
                  {eliminandoRol ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </>
            )}
          </AlertActions>
        </Alert>
      )}

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
