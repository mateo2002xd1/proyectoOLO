'use client';

import { useState } from 'react';
import { DetalleRegistro } from './detalle-registro';
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

const CLASE_CAMPO =
  'rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-[#131b2f] dark:text-[#f6f6f6]';

const CLASE_BOTON =
  'rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800';

/** Una línea por campo; se corta en la tabla y se lee completo en el detalle. */
const resumen = (registro: RegistroAuditoria) =>
  registro.camposModificados
    .map(({ campo, despues }) =>
      `${campo}: ${despues === null || despues === undefined ? '—' : typeof despues === 'string' ? despues : JSON.stringify(despues)}`,
    )
    .join(' · ');

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{etiqueta}</span>
      {children}
    </label>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">Auditoría</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Registro de todo lo que administradores y editores hacen en el sistema: ciclo editorial
          de las páginas, contenidos, y gestión de usuarios, roles y permisos.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Campo etiqueta="Usuario">
          <select
            className={CLASE_CAMPO}
            value={filtros.usuarioId}
            onChange={(e) => cambiarFiltro('usuarioId', e.target.value)}
          >
            <option value="">Todos</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Acción">
          <select
            className={CLASE_CAMPO}
            value={filtros.accion}
            onChange={(e) => cambiarFiltro('accion', e.target.value)}
          >
            <option value="">Todas</option>
            {Object.entries(ETIQUETA_ACCION).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Entidad">
          <select
            className={CLASE_CAMPO}
            value={filtros.entidadTipo}
            onChange={(e) => cambiarFiltro('entidadTipo', e.target.value)}
          >
            <option value="">Todas</option>
            {Object.entries(ETIQUETA_ENTIDAD).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Desde">
          <input
            type="date"
            className={CLASE_CAMPO}
            value={filtros.desde}
            max={filtros.hasta || undefined}
            onChange={(e) => cambiarFiltro('desde', e.target.value)}
          />
        </Campo>

        <Campo etiqueta="Hasta">
          <input
            type="date"
            className={CLASE_CAMPO}
            value={filtros.hasta}
            min={filtros.desde || undefined}
            onChange={(e) => cambiarFiltro('hasta', e.target.value)}
          />
        </Campo>

        {hayFiltros && (
          <button type="button" onClick={limpiarFiltros} className={CLASE_BOTON}>
            Limpiar filtros
          </button>
        )}

        <button type="button" onClick={exportar} disabled={exportando} className={CLASE_BOTON}>
          {exportando ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      {aviso && <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">{aviso}</p>}

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
                        className={CLASE_BOTON}
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
                className={CLASE_BOTON}
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
