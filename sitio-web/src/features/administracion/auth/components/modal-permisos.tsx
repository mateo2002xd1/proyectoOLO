'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlassIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Switch } from '@/shared/ui/atoms/switch';
import { Button } from '@/shared/ui/atoms/button';
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
    titulo: 'Dónde puede entrar',
    ayuda: 'Las puertas del sistema. Sin esto, lo demás no llega a usarse.',
  },
  {
    id: 'plantilla',
    titulo: 'Menú y pie de página',
    ayuda:
      'Cambia la cabecera y el pie de TODAS las páginas de esa aplicación, no de una sección.',
    sensible: true,
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
  rol: { id: string; nombre: string } | null;
  permisos: Permission[];
  /** Ids concedidos al abrir. Sirve de línea base para calcular qué cambió. */
  originales: Set<string>;
  seleccionados: Set<string>;
  onCambiarSeleccion: (ids: Set<string>) => void;
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
  rol,
  permisos,
  originales,
  seleccionados,
  onCambiarSeleccion,
  onGuardar,
  guardando,
}: ModalPermisosProps) {
  const [busqueda, setBusqueda] = useState('');

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
  const hayCambios = anadidos.length > 0 || quitados.length > 0;

  if (!abierto || typeof document === 'undefined') return null;

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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a]/50 p-3 backdrop-blur-sm sm:p-6"
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto dentro
      // del panel y suelta el ratón fuera, el clic se contabiliza en el fondo y
      // el panel se cerraba en mitad de la selección.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !guardando) onCerrar();
      }}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121824]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permisos-titulo"
      >
        <header className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 id="permisos-titulo" className="admin-subtitle text-zinc-900 dark:text-[#f6f6f6]">
                Permisos del rol {rol ? `«${rol.nombre}»` : ''}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-[#94a3b8]">
                Define qué puede hacer cualquier persona con este rol.
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
          {rol && (
            <p className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
              Esto afecta a <strong>todas las personas con el rol «{rol.nombre}»</strong>, no solo
              a la que estés editando. El cambio se aplica en cuanto guardas.
            </p>
          )}

          <div className="relative mt-3">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar un permiso…"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-interactive focus:outline-none focus:ring-2 focus:ring-brand-focus/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {gruposAPintar.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-[#94a3b8]">
              Ningún permiso coincide con «{busqueda}».
            </p>
          )}

          {gruposAPintar.map((grupo) => {
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
                      <span className="font-normal normal-case tracking-normal text-zinc-400">
                        {activos}/{ids.length}
                      </span>
                    </h4>
                    <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-[#94a3b8]">
                      {grupo.ayuda}
                    </p>
                  </div>
                  {conAtajo && (
                    <button
                      type="button"
                      onClick={() => alternarGrupo(ids, !todos)}
                      className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold text-brand-blue-dark underline-offset-2 hover:underline dark:text-sky-300"
                    >
                      {todos ? 'Quitar todas' : 'Todas'}
                    </button>
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
                            <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500 dark:text-[#94a3b8]">
                              {permiso.descripcion}
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
          })}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 dark:border-zinc-800/80 dark:bg-[#161b27]/60">
          <p className="text-xs text-zinc-500 dark:text-[#94a3b8]">
            {hayCambios ? (
              <>
                {anadidos.length > 0 && (
                  <strong className="text-zinc-900 dark:text-white">
                    {anadidos.length} {anadidos.length === 1 ? 'permiso añadido' : 'permisos añadidos'}
                  </strong>
                )}
                {anadidos.length > 0 && quitados.length > 0 && ' · '}
                {quitados.length > 0 && (
                  <strong className="text-zinc-900 dark:text-white">
                    {quitados.length} {quitados.length === 1 ? 'quitado' : 'quitados'}
                  </strong>
                )}
              </>
            ) : (
              'Sin cambios que guardar.'
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" plain onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void onGuardar()} disabled={!hayCambios || guardando}>
              {guardando ? 'Guardando…' : 'Guardar permisos'}
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
