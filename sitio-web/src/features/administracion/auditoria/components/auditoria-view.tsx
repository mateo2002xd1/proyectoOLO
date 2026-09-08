'use client';

import { useState } from 'react';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { DetalleRegistro } from './detalle-registro';
import { Download, AlertCircle } from 'lucide-react';
import { useAuditoria } from '../hooks/use-auditoria';
import { aCsv, descargarCsv, nombreDeArchivo } from '../lib/csv';
import {
  COLOR_ACCION,
  ETIQUETA_ACCION,
  ETIQUETA_ENTIDAD,
  etiquetaDeAccion,
  etiquetaDeEntidad,
  type RegistroAuditoria,
} from '../types';

// Misma altura y mismas esquinas que los filtros, para que la fila se lea como
// una sola banda de controles.
const CLASE_BOTON =
  'h-11 rounded-[16px] border border-[#d0d5dd] px-4 text-sm font-medium text-zinc-700 transition hover:border-[#002237]/40 hover:bg-[#002237]/5 hover:text-[#002237] disabled:opacity-60 dark:border-[#2d3649] dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-[#f6f6f6]';

// Acción principal de la pantalla: mismo verde que «Crear Usuario», vía el token
// `brand-interactive` y no un hex suelto (regla de `globals.css`). El resto de
// botones sigue en neutro: si todo es primario, no hay jerarquía que leer.
const CLASE_BOTON_PRIMARIO =
  'h-11 rounded-[16px] bg-brand-interactive px-4 text-sm font-semibold text-white transition hover:bg-brand-interactive-hover disabled:opacity-60';

// Azul institucional: el mismo #002237 que ya usan el selector de fecha y los
// desplegables de esta pantalla. Al hover se aclara con opacidad en vez de
// inventar un segundo hex, porque este azul no tiene token con pareja.
const CLASE_BOTON_NAVY =
  'h-11 rounded-[16px] bg-[#002237] px-4 text-sm font-semibold text-white transition hover:bg-[#002237]/90 disabled:opacity-60';

/** Una línea por campo; se corta en la tabla y se lee completo en el detalle. */
const resumen = (registro: RegistroAuditoria) =>
  registro.camposModificados
    .map(({ campo, despues }) =>
      `${campo}: ${despues === null || despues === undefined ? '—' : typeof despues === 'string' ? despues : JSON.stringify(despues)}`,
    )
    .join(' · ');

/**
 * Etiqueta encima del control.
 *
 * Es un `div` y no un `label`: los filtros ya no son campos nativos sino
 * botones que abren su propia lista, y un `label` no puede etiquetar a un
 * botón. El nombre viaja por `ariaLabel` en cada control.
 */
function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex w-44 flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{etiqueta}</span>
      {children}
    </div>
  );
}

/**
 * Bitácora de cambios del panel (RF-07, HU-07).
 *
 * Muestra todo el rastro del ciclo editorial y de la administración de usuarios,
 * roles y permisos. Quién puede verla lo decide la API (`auditoria.policies.ts`):
 * si el rol no alcanza, el servicio devuelve el 403 tal cual y aquí se explica.
 */
export function AuditoriaView() {
  const {
    registros,
    total,
    pagina,
    totalPaginas,
    usuarios,
    filtros,
    hayFiltros,
    isLoading,
    error,
    cambiarFiltro,
    limpiarFiltros,
    irAPagina,
    obtenerParaExportar,
  } = useAuditoria();

  const [seleccionado, setSeleccionado] = useState<RegistroAuditoria | null>(null);
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function exportar() {
    setExportando(true);
    setAviso(null);
    try {
      const { registros: todos, truncado } = await obtenerParaExportar();
      if (todos.length === 0) {
        setAviso('No hay registros que exportar con los filtros actuales.');
        return;
      }
      descargarCsv(nombreDeArchivo(), aCsv(todos));
      if (truncado) {
        setAviso(
          `La exportación se limitó a los ${todos.length} registros más recientes. Acota el rango de fechas para incluir el resto.`,
        );
      }
    } catch {
      setAviso('No se pudo generar la exportación.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="admin-header text-zinc-950 dark:text-[#f6f6f6]">Auditoría</h1>
          <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
            Registro de todo lo que administradores y editores hacen en el sistema: ciclo editorial
            de las páginas, contenidos, y gestión de usuarios, roles y permisos.
          </p>
        </div>
        <button 
          type="button" 
          onClick={exportar} 
          disabled={exportando} 
          className={`${CLASE_BOTON_PRIMARIO} flex shrink-0 items-center gap-2 shadow-sm`}
        >
          <Download size={16} />
          {exportando ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Campo etiqueta="Desde">
          <DatePicker
            ariaLabel="Desde"
            value={filtros.desde}
            max={filtros.hasta || undefined}
            onChange={(valor) => cambiarFiltro('desde', valor)}
          />
        </Campo>

        <Campo etiqueta="Hasta">
          <DatePicker
            ariaLabel="Hasta"
            value={filtros.hasta}
            min={filtros.desde || undefined}
            onChange={(valor) => cambiarFiltro('hasta', valor)}
          />
        </Campo>

        <Campo etiqueta="Usuario">
          <CustomSelect
            ariaLabel="Usuario"
            value={filtros.usuarioId}
            onChange={(valor) => cambiarFiltro('usuarioId', valor)}
            options={[
              { value: '', label: 'Todos' },
              ...usuarios.map((u) => ({ value: u.id, label: u.nombre })),
            ]}
          />
        </Campo>

        <Campo etiqueta="Acción">
          <CustomSelect
            ariaLabel="Acción"
            value={filtros.accion}
            onChange={(valor) => cambiarFiltro('accion', valor)}
            options={[
              { value: '', label: 'Todas' },
              ...Array.from(
                new Map(Object.entries(ETIQUETA_ACCION).map(([value, label]) => [label, { value, label }])).values()
              ),
            ]}
          />
        </Campo>

        <Campo etiqueta="Entidad">
          <CustomSelect
            ariaLabel="Entidad"
            value={filtros.entidadTipo}
            onChange={(valor) => cambiarFiltro('entidadTipo', valor)}
            options={[
              { value: '', label: 'Todas' },
              ...Object.entries(ETIQUETA_ENTIDAD).map(([value, label]) => ({ value, label })),
            ]}
          />
        </Campo>

        {hayFiltros && (
          <button type="button" onClick={limpiarFiltros} className={CLASE_BOTON}>
            Limpiar filtros
          </button>
        )}
      </div>

      {aviso && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <p>{aviso}</p>
        </div>
      )}

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : isLoading ? (
        <p className="text-sm text-zinc-500">Cargando bitácora…</p>
      ) : registros.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {hayFiltros
            ? 'Ningún registro coincide con los filtros aplicados.'
            : 'Todavía no hay movimientos registrados.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#7db828]/30">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Fecha y hora</th>
                  <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
                  <th scope="col" className="px-4 py-3 font-medium">Acción</th>
                  <th scope="col" className="px-4 py-3 font-medium">Entidad</th>
                  <th scope="col" className="px-4 py-3 font-medium">Cambios</th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">Detalle</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {registros.map((registro) => (
                  <tr key={registro.id} className="bg-white dark:bg-[#0f1626]">
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {new Date(registro.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-[#f6f6f6]">
                      {registro.usuarioNombre ?? <span className="text-zinc-500">Sin usuario</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${COLOR_ACCION[registro.accion] ?? ''}`}
                      >
                        {etiquetaDeAccion(registro.accion)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {etiquetaDeEntidad(registro.entidadTipo)}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-zinc-500" title={resumen(registro)}>
                      {resumen(registro) || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSeleccionado(registro)}
                        className={CLASE_BOTON_PRIMARIO}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              {total} {total === 1 ? 'registro' : 'registros'} · página {pagina} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => irAPagina(pagina - 1)}
                disabled={pagina <= 1}
                className={CLASE_BOTON}
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => irAPagina(pagina + 1)}
                disabled={pagina >= totalPaginas}
                className={CLASE_BOTON_NAVY}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      <DetalleRegistro registro={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </div>
  );
}
