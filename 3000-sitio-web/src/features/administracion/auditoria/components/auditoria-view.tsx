'use client';

import { useState } from 'react';
import { BarraFiltros, CampoFiltro } from '@/shared/ui/molecules/barra-filtros';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { DetalleRegistro } from './detalle-registro';
import { ModalDepurarAuditoria } from './modal-depurar-auditoria';
import { Eye, Trash2 } from 'lucide-react';
import { useAuditoria } from '../hooks/use-auditoria';
import { comentarioPrincipal, resumenDeCambios } from '../lib/cambios';

import {
  COLOR_ACCION,
  ETIQUETA_CATEGORIA,
  etiquetaDeAccion,
  etiquetaDeEntidad,
  opcionesDeAccion,
  type CategoriaAuditoria,
  type RegistroAuditoria,
} from '../types';

// Misma altura y mismas esquinas que los filtros, para que la fila se lea como
// una sola banda de controles.
const CLASE_BOTON =
  'h-11 rounded-[16px] border border-[#d0d5dd] px-4 text-sm font-medium text-zinc-700 transition hover:border-[#002237]/40 hover:bg-[#002237]/5 hover:text-[#002237] disabled:opacity-60 dark:border-[#2d3649] dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-[#f6f6f6]';

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
    porPagina,
    usuarios,
    filtros,
    hayFiltros,
    isLoading,
    error,
    cambiarFiltro,
    limpiarFiltros,
    irAPagina,
    cambiarPorPagina,
    recargar,
  } = useAuditoria();

  const [seleccionado, setSeleccionado] = useState<RegistroAuditoria | null>(null);
  const [modalDepurarAbierto, setModalDepurarAbierto] = useState(false);

  return (

    <div className="px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Auditoría"
        descripcion="Registro de todo lo que administradores y editores hacen en el sistema: ciclo editorial de las páginas, contenidos, y gestión de usuarios, roles y permisos."
        acciones={
          <button
            type="button"
            onClick={() => setModalDepurarAbierto(true)}
            className="flex h-11 shrink-0 items-center gap-2 rounded-[16px] bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800"
          >
            <Trash2 size={16} />
            Depurar auditoría
          </button>
        }
      />

      <BarraFiltros
        activos={Object.values(filtros).filter(Boolean).length}
      >
        <CampoFiltro etiqueta="Desde">
          <DatePicker
            ariaLabel="Desde"
            value={filtros.desde}
            max={filtros.hasta || undefined}
            onChange={(valor) => cambiarFiltro('desde', valor)}
          />
        </CampoFiltro>

        <CampoFiltro etiqueta="Hasta">
          <DatePicker
            ariaLabel="Hasta"
            value={filtros.hasta}
            min={filtros.desde || undefined}
            onChange={(valor) => cambiarFiltro('hasta', valor)}
          />
        </CampoFiltro>

        <CampoFiltro etiqueta="Usuario">
          <CustomSelect
            ariaLabel="Usuario"
            value={filtros.usuarioId}
            onChange={(valor) => cambiarFiltro('usuarioId', valor)}
            options={[
              { value: '', label: 'Todos' },
              ...usuarios.map((u) => ({ value: u.id, label: u.nombre })),
            ]}
          />
        </CampoFiltro>

        {/* Primero la categoría y después la acción: la segunda depende de la primera
            (Rechazo es de Administración, Expiró de Seguridad), y ese es el orden en
            que se piensa — de qué mundo hablo, y qué pasó en él. */}
        <CampoFiltro etiqueta="Categoría">
          <CustomSelect
            ariaLabel="Categoría"
            value={filtros.categoria}
            onChange={(valor) => cambiarFiltro('categoria', valor)}
            options={[
              { value: '', label: 'Todas' },
              ...(Object.keys(ETIQUETA_CATEGORIA) as CategoriaAuditoria[]).map((value) => ({
                value,
                label: ETIQUETA_CATEGORIA[value],
              })),
            ]}
          />
        </CampoFiltro>

        <CampoFiltro etiqueta="Acción">
          <CustomSelect
            ariaLabel="Acción"
            value={filtros.accion}
            onChange={(valor) => cambiarFiltro('accion', valor)}
            options={[
              { value: '', label: 'Todas' },
              ...opcionesDeAccion(filtros.categoria).map(({ value, label }) => ({ value, label })),
            ]}
          />
        </CampoFiltro>

        {hayFiltros && (
          <button type="button" onClick={limpiarFiltros} className={CLASE_BOTON}>
            Limpiar filtros
          </button>
        )}
      </BarraFiltros>

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
            <table className="olo-tabla-apilable w-full min-w-[52rem] text-left text-sm">
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
                    <td data-etiqueta="Fecha y hora" className="whitespace-nowrap px-4 py-1.5 text-zinc-600 dark:text-zinc-300">
                      {new Date(registro.fecha).toLocaleString('es-CO')}
                    </td>
                    <td data-etiqueta="Usuario" className="px-4 py-1.5 text-zinc-900 dark:text-[#f6f6f6]">
                      {(registro.usuarioId ? usuarios.find(u => u.id === registro.usuarioId)?.nombre : null) ?? registro.usuarioNombre ?? <span className="text-zinc-500">Sin usuario</span>}
                    </td>
                    <td data-etiqueta="Acción" className="px-4 py-1.5">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${COLOR_ACCION[registro.accion] ?? ''}`}
                      >
                        {etiquetaDeAccion(registro.accion, registro.categoria)}
                      </span>
                    </td>
                    <td data-etiqueta="Entidad" className="px-4 py-1.5 text-zinc-600 dark:text-zinc-300">
                      {etiquetaDeEntidad(registro.entidadTipo)}
                    </td>
                    {/* Se corta en la tabla y se lee completo en el `title` o en el detalle.
                        El comentario de un envío va más oscuro que los campos internos:
                        es lo que se escribió para ser leído. */}
                    <td
                      data-etiqueta="Cambios"
                      className={`max-w-xs truncate px-4 py-1.5 ${
                        comentarioPrincipal(registro)
                          ? 'text-zinc-800 dark:text-zinc-200'
                          : 'text-zinc-500'
                      }`}
                      title={resumenDeCambios(registro)}
                    >
                      {/* Cuando la tabla pasa a tarjetas, el texto no se corta en una línea: se parte, hasta tres. */}
                      <span className="@max-3xl:line-clamp-3">{resumenDeCambios(registro) || '—'}</span>
                    </td>
                    <td data-etiqueta="Detalle" className="px-4 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSeleccionado(registro)}
                        aria-label="Ver detalle"
                        title="Ver detalle"
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-[#94a3b8] dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Paginador
            pagina={pagina}
            totalPaginas={totalPaginas}
            onCambiarPagina={irAPagina}
            total={total}
            porPagina={porPagina}
            onCambiarPorPagina={cambiarPorPagina}
            etiqueta="registros"
            className="mt-4 rounded-xl border border-zinc-200 px-4 dark:border-[#7db828]/30"
          />
        </>
      )}

      <DetalleRegistro registro={seleccionado} usuarios={usuarios} onCerrar={() => setSeleccionado(null)} />

      {modalDepurarAbierto && (
        <ModalDepurarAuditoria
          abierto={modalDepurarAbierto}
          onCerrar={() => setModalDepurarAbierto(false)}
          onExito={() => {
            setModalDepurarAbierto(false);
            recargar();
          }}
        />
      )}

    </div>
  );
}

