'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCierreAnimado, useUltimoValorAbierto } from '@/shared/lib/use-cierre-animado';
import { MagnifyingGlassIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Switch } from '@/shared/ui/atoms/switch';
import { Button, FormaDeModal } from '@/shared/ui/atoms/button';
import { areaDeModalClass, campoDeModalClass, etiquetaDeModalClass } from '@/shared/ui/molecules/alert';
import type { Permission } from '../hooks/use-usuarios';

/**
 * Los grupos del catálogo, en el orden en que se pintan.
 *
 * El orden **es** información: va de menos a más poder, así que quien recorre la lista
 * de arriba abajo va aumentando lo que concede y llega al final —cuentas y permisos— ya
 * advertido. La lista anterior mezclaba «acceso» con «configuración del portal» en la
 * misma tarjeta y no seguía ningún criterio.
 *
 * El identificador viene de `catalogo-permisos.ts` en la API. Si aparece un grupo que no
 * está aquí, se pinta al final con su clave cruda en vez de desaparecer.
 */
const GRUPOS: { id: string; titulo: string; ayuda: string; sensible?: boolean }[] = [
  {
    id: 'acceso',
    titulo: 'Acceso',
    ayuda: 'Las puertas del sistema. Sin esto, lo demás no llega a usarse.',
  },
  {
    id: 'plantilla',
    titulo: 'Editar',
    ayuda:
      'Cambia la cabecera y el pie de TODAS las páginas de esa aplicación, no de una sección.',
  },
  {
    id: 'secciones-sitio',
    titulo: 'Secciones del sitio web',
    ayuda: 'Cada una es una página del portal público.',
  },
  {
    id: 'secciones-intranet',
    titulo: 'Secciones de la intranet',
    ayuda: 'Cada una es una página de la intranet.',
  },
  {
    id: 'editor',
    titulo: 'Qué puede hacer dentro del editor',
    ayuda: 'Se aplica a todas las secciones que tenga concedidas.',
  },

  {
    id: 'huerfanos',
    titulo: 'Sin catálogo',
    ayuda:
      'Claves que están en la base pero ya no en el catálogo. No las comprueba nadie: se pueden retirar.',
    sensible: true,
  },
];

interface ModalPermisosProps {
  abierto: boolean;
  onCerrar: () => void;
  rol: { id: string; nombre: string; descripcion?: string | null } | null;
  permisos: Permission[];
  /** Ids concedidos al abrir. Sirve de línea base para calcular qué cambió. */
  originales: Set<string>;
  seleccionados: Set<string>;
  onCambiarSeleccion: (ids: Set<string>) => void;
  nombre?: string;
  onCambiarNombre?: (nombre: string) => void;
  descripcion?: string;
  onCambiarDescripcion?: (desc: string) => void;
  onGuardar: () => Promise<void>;
  guardando: boolean;
}

const normalizar = (t: string) =>
  t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

/**
 * Asignación de permisos a un rol.
 *
 * Dos cosas que cambian respecto a la versión anterior y que no son estéticas:
 *
 * 1. **Guarda por su cuenta.** Antes los permisos se sincronizaban dentro del `submit`
 *    del formulario de usuario, así que crear *un* usuario reescribía los permisos de
 *    *todos* los que compartían su rol, y para tocar solo permisos había que rellenar y
 *    guardar una cuenta. Son dos cosas distintas y ahora se guardan por separado.
 *
 * 2. **Enseña el cambio, no el total.** «12 de 21 seleccionados» no dice nada útil; lo
 *    que importa antes de pulsar es qué se está a punto de conceder y qué se quita,
 *    porque afecta a todas las personas con ese rol.
 */
export function ModalPermisos({
  abierto,
  onCerrar,
  rol: rolAbierto,
  permisos,
  originales,
  seleccionados,
  onCambiarSeleccion,
  nombre,
  onCambiarNombre,
  descripcion,
  onCambiarDescripcion,
  onGuardar,
  guardando,
}: ModalPermisosProps) {
  // Al cerrar, `roles-view` vuelve el rol a `null` y el modal pasaría a «Permisos a
  // asignar» en plena salida; mientras se va, conserva el rol que tenía.
  const rol = useUltimoValorAbierto(abierto, rolAbierto);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarPermisos, setMostrarPermisos] = useState(false);

  // Resetear el estado al abrir
  useMemo(() => {
    if (abierto) setMostrarPermisos(false);
  }, [abierto]);

  const visibles = useMemo(() => {
    // Ocultar acceso.panel porque es solo para administradores
    const filtrados = permisos.filter((p) => p.name !== 'acceso.panel');
    const q = normalizar(busqueda);
    if (!q) return filtrados;
    return filtrados.filter((p) =>
      normalizar(`${p.etiqueta} ${p.descripcion} ${p.name}`).includes(q)
    );
  }, [permisos, busqueda]);

  // Qué cambia respecto a como estaba al abrir. Es lo que se resume en el pie.
  const anadidos = useMemo(
    () => [...seleccionados].filter((id) => !originales.has(id)),
    [seleccionados, originales]
  );
  const quitados = useMemo(
    () => [...originales].filter((id) => !seleccionados.has(id)),
    [originales, seleccionados]
  );
  const descripcionCambio = rol && descripcion !== undefined && descripcion !== (rol.descripcion || '');
  const hayCambios = anadidos.length > 0 || quitados.length > 0 || descripcionCambio;

  const { montado, cerrando } = useCierreAnimado(abierto);

  if (!montado || typeof document === 'undefined') return null;

  const alternar = (id: string) => {
    const siguiente = new Set(seleccionados);
    if (siguiente.has(id)) siguiente.delete(id);
    else siguiente.add(id);
    onCambiarSeleccion(siguiente);
  };

  const alternarGrupo = (idsDelGrupo: string[], encender: boolean) => {
    const siguiente = new Set(seleccionados);
    idsDelGrupo.forEach((id) => (encender ? siguiente.add(id) : siguiente.delete(id)));
    onCambiarSeleccion(siguiente);
  };

  const gruposAPintar = GRUPOS.map((grupo) => ({
    ...grupo,
    items: visibles.filter((p) => p.grupo === grupo.id),
  })).filter((g) => g.items.length > 0);

  return createPortal(
    <div
      className="olo-anim-fondo fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a]/50 p-3 backdrop-blur-sm sm:p-6"
      data-cerrando={cerrando || undefined}
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto dentro
      // del panel y suelta el ratón fuera, el clic se contabiliza en el fondo y
      // el panel se cerraba en mitad de la selección.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !guardando) onCerrar();
      }}
    >
      <div
        className="olo-anim-caja flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121824]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permisos-titulo"
      >
        {/* Las medidas de todos los modales (`alert.tsx`): botones y campos de 44 px. */}
        <FormaDeModal>
        <header className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800/80">
          <div className="flex items-start justify-between gap-4">
            {/* El resumen va junto al título y a su tamaño (antes estaba en el pie, en letra
                pequeña): es lo que se va a guardar. `aria-live` para que el lector lo diga. */}
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 id="permisos-titulo" className="text-xl font-medium text-[#001631] dark:text-[#e6e8f0]">
                Permisos {rol ? `del rol «${rol.nombre}»` : 'a asignar'}
              </h3>
              <p aria-live="polite" className="text-xl font-medium text-zinc-500 dark:text-[#94a3b8]">
                {hayCambios && (
                  <>
                    {descripcionCambio && 'Descripción actualizada'}
                    {descripcionCambio && (anadidos.length > 0 || quitados.length > 0) && ' · '}
                    {anadidos.length > 0 &&
                      `${anadidos.length} ${anadidos.length === 1 ? 'permiso añadido' : 'permisos añadidos'}`}
                    {anadidos.length > 0 && quitados.length > 0 && ' · '}
                    {quitados.length > 0 && `${quitados.length} ${quitados.length === 1 ? 'quitado' : 'quitados'}`}
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Fuera del área que scrollea: es la advertencia que no debe perderse de vista
              mientras se mueven interruptores. */}
          {rol && !mostrarPermisos && (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="permisos-rol-nombre" className={etiquetaDeModalClass}>
                  Nombre del rol
                </label>
                <input
                  id="permisos-rol-nombre"
                  type="text"
                  value={rol.nombre}
                  disabled
                  readOnly
                  title="El nombre del rol no se puede modificar una vez creado"
                  className={`${campoDeModalClass} select-none`}
                />
              </div>
              <div>
                <label htmlFor="permisos-rol-descripcion" className={etiquetaDeModalClass}>
                  Descripción del rol
                </label>
                <textarea
                  id="permisos-rol-descripcion"
                  maxLength={200}
                  rows={2}
                  value={descripcion ?? ''}
                  onChange={(e) => onCambiarDescripcion?.(e.target.value)}
                  placeholder="Sin descripción"
                  className={areaDeModalClass}
                />
              </div>
              <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
                Esto afecta a <strong>todas las personas con el rol «{rol.nombre}»</strong>, no solo
                a la que estés editando. El cambio se aplica en cuanto guardas.
              </p>
              
              <div className="pt-2">
                <Button type="button" variant="verde" onClick={() => setMostrarPermisos(true)} className="w-full">
                  Editar permisos
                </Button>
              </div>
            </div>
          )}

          {(!rol || mostrarPermisos) && (
            <div className="relative mt-5">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar un permiso…"
                aria-label="Buscar un permiso"
                className={`${campoDeModalClass} pl-11`}
              />
            </div>
          )}
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {(rol && !mostrarPermisos) ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">
                Haz clic en "Editar permisos" para ver y modificar la lista.
              </p>
            </div>
          ) : gruposAPintar.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-[#94a3b8]">
              Ningún permiso coincide con «{busqueda}».
            </p>
          ) : (
            gruposAPintar.map((grupo) => {
              const ids = grupo.items.map((p) => p.id);
              const activos = ids.filter((id) => seleccionados.has(id)).length;
              const todos = activos === ids.length;
              // Las dos filas de plantilla no llevan atajo: activarlas de golpe es
              // justo lo que conviene que cueste un clic de más.
              const conAtajo = grupo.id.startsWith('secciones-');

              return (
                <section key={grupo.id}>
                  <div className="mb-2 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h4
                        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                          grupo.sensible
                            ? 'text-amber-800 dark:text-amber-300'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {grupo.sensible && <ShieldExclamationIcon className="size-4 shrink-0" />}
                        {grupo.titulo}
                      </h4>
                    </div>
                    {/* Interruptor a la izquierda y el texto a su derecha. El `<label>` hace
                        que pulsar «Marcar todos» también lo conmute, como en las filas. */}
                    {conAtajo && (
                      <label className="flex shrink-0 cursor-pointer items-center gap-2">
                        <Switch
                          checked={todos}
                          onChange={(marcar) => alternarGrupo(ids, marcar)}
                          aria-label={`Marcar todos los permisos de ${grupo.titulo}`}
                        />
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Marcar todos</span>
                      </label>
                    )}
                  </div>

                  <ul
                    className={`divide-y overflow-hidden rounded-2xl border ${
                      grupo.sensible
                        ? 'divide-amber-100 border-amber-200/70 dark:divide-amber-900/30 dark:border-amber-800/40'
                        : 'divide-zinc-100 border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800'
                    }`}
                  >
                    {grupo.items.map((permiso) => {
                      const activo = seleccionados.has(permiso.id);
                      const cambiado =
                        activo !== originales.has(permiso.id);

                      return (
                        <li key={permiso.id}>
                          {/* `<label>` y no `<div onClick>`: así la fila entera es
                              alcanzable con Tab y se conmuta con Espacio, que es lo que
                              antes solo hacía el botón interior. */}
                          <label className="flex cursor-pointer items-center justify-between gap-3 bg-white px-3.5 py-2.5 transition-colors hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-800/40">
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="text-xs font-medium text-zinc-900 dark:text-[#f6f6f6]">
                                  {permiso.etiqueta}
                                </span>
                                {cambiado && (
                                  <span className="rounded-full bg-brand-interactive/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-interactive-hover dark:text-brand-interactive">
                                    {activo ? 'se añade' : 'se quita'}
                                  </span>
                                )}
                                {!permiso.esFrontera && (
                                  <span
                                    className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                    title="Solo cambia lo que se ve en el editor. La API no puede comprobarlo."
                                  >
                                    solo interfaz
                                  </span>
                                )}
                              </span>
                            </span>
                            <Switch
                              checked={activo}
                              onChange={() => alternar(permiso.id)}
                              aria-label={permiso.etiqueta}
                            />
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        <footer className="flex items-center justify-end gap-4 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 dark:border-zinc-800/80 dark:bg-[#161b27]/60">
          <div className="flex items-center gap-2">
            <Button type="button" plain onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Button>
            {/* Verde #7DB728 a pedido del usuario, aunque en los modales la acción principal
                es `#001631`: variante `verde` de `Button`. */}
            <Button
              type="button"
              variant="verde"
              onClick={() => void onGuardar()}
              disabled={!hayCambios || guardando}
            >
              {guardando ? 'Guardando…' : 'Guardar permisos'}
            </Button>
          </div>
        </footer>
        </FormaDeModal>
      </div>
    </div>,
    document.body
  );
}
