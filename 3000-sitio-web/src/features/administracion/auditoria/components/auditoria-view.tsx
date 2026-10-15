'use client';

import { useState } from 'react';
import { BarraFiltros, CampoFiltro } from '@/shared/ui/molecules/barra-filtros';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { DetalleRegistro } from './detalle-registro';
import { ModalDepurarAuditoria } from './modal-depurar-auditoria';
import { Trash2 } from 'lucide-react';
import { BotonOjo } from '@/shared/ui/atoms/boton-ojo';
import { COLOR_DE_ACCION } from '@/shared/lib/identidad-panel';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { BotonDeFila, FechaDeCelda, ResumenDeFila, useFilasAbiertas } from '@/shared/ui/molecules/fila-acordeon';
import { useAuditoria } from '../hooks/use-auditoria';
import { resumenDeCambios } from '../lib/cambios';
import { FraseDeRegistro, PildoraDeAccion } from './frase-de-registro';

import {
  ETIQUETA_CATEGORIA,
  opcionesDeAccion,
  type CategoriaAuditoria,
  type RegistroAuditoria,
} from '../types';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';

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
  // Registros desplegados del acordeón (móvil y tablet). En la tabla de escritorio no se usa.
  const { estaAbierta, alternar } = useFilasAbiertas();
  const [modalDepurarAbierto, setModalDepurarAbierto] = useState(false);
  // Como en Respaldos: la `key` del modal cambia en cada apertura y lo monta de cero, con
  // el análisis y el resultado limpios. Así puede seguir montado al cerrarse, que es lo
  // que necesita su animación de salida (`useCierreAnimado`).
  const [aperturaDepurar, setAperturaDepurar] = useState(0);

  return (

    <div className="px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Auditoría"
        descripcion="Registro de todo lo que administradores y editores hacen en el sistema: ciclo editorial de las páginas, contenidos, y gestión de usuarios, roles y permisos."
        acciones={
          <button
            type="button"
            onClick={() => {
              setAperturaDepurar((n) => n + 1);
              setModalDepurarAbierto(true);
            }}
            className="flex h-11 shrink-0 items-center gap-2 rounded-[16px] px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 active:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 dark:active:bg-red-950/60"
          >
            <Trash2 size={16} />
            Depurar
          </button>
        }
      />

      <BarraFiltros
        activos={Object.values(filtros).filter(Boolean).length}
      >
        {/* La categoría va la primera (pedido del usuario, 2026-10-12) y antes que la acción:
            la segunda depende de la primera (Rechazo es de Administración, Expiró de
            Seguridad), y ese es el orden en que se piensa — de qué mundo hablo, y qué pasó
            en él. */}
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
        <CargandoSeccion label="Cargando bitácora..." />
      ) : registros.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {hayFiltros
            ? 'Ningún registro coincide con los filtros aplicados.'
            : 'Todavía no hay movimientos registrados.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#7db828]/30">
            {/* En el móvil y la tablet, acordeón, como «Páginas en revisión»: cada registro
                es una frase («El usuario Ana Gómez hizo la acción de [Editado]») y al tocarlo se completa con
                lo que cambió y la fecha, y debajo sale «Ver detalle». Piezas en
                `fila-acordeon.tsx`; reglas en globals.css (`olo-tabla-acordeon`). */}
            <table className="olo-tabla-apilable olo-tabla-acordeon w-full min-w-[52rem] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Categoría</th>
                  <th scope="col" className="px-4 py-3 font-medium">Fecha y hora</th>
                  <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
                  <th scope="col" className="px-4 py-3 font-medium">Acción</th>
                  <th scope="col" className="px-4 py-3 font-medium">Cambios</th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">Detalle</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {registros.map((registro) => {
                  const abierta = estaAbierta(registro.id);
                  const nombre =
                    (registro.usuarioId ? usuarios.find((u) => u.id === registro.usuarioId)?.nombre : null) ??
                    registro.usuarioNombre;
                  return (
                  <tr key={registro.id} data-abierta={abierta || undefined} className="bg-white dark:bg-[#0f1626]">
                    {/* Solo en acordeón: la frase (`FraseDeRegistro`, la misma de «Actividad
                        reciente» en el dashboard). */}
                    <td data-resumen>
                      <ResumenDeFila abierta={abierta} onAlternar={() => alternar(registro.id)}>
                        <FraseDeRegistro registro={registro} nombre={nombre} abierta={abierta} />
                      </ResumenDeFila>
                    </td>
                    {/* Solo en acordeón y desplegada: el detalle con su nombre (el ojo solo no
                        se entiende en una pantalla táctil). Lo que cambió ya va en la frase. */}
                    <td data-detalle>
                      <div className="mb-1">
                        <BotonDeFila color={COLOR_DE_ACCION['ver-detalle']} onClick={() => setSeleccionado(registro)}>
                          <IconoMascara nombre="eye-closed" tamano="h-6 w-6" />
                          Ver detalle
                        </BotonDeFila>
                      </div>
                    </td>
                    {/* La categoría de la fila, la misma del filtro (pedido del usuario,
                        2026-10-15): en texto, #001631 en negrita; sin categoría, la raya. */}
                    <td data-solo-tabla data-etiqueta="Categoría" className="whitespace-nowrap px-4 py-2 font-bold text-[#001631] dark:text-[#f6f6f6]">
                      {registro.categoria ? ETIQUETA_CATEGORIA[registro.categoria] : <span className="font-normal text-zinc-400">—</span>}
                    </td>
                    <td data-solo-tabla data-etiqueta="Fecha y hora" className="whitespace-nowrap px-4 py-2 text-zinc-600 dark:text-zinc-300">
                      {/* La hora debajo y más pequeña (pedido del usuario, 2026-10-12). Mismo
                          formato de antes, con segundos: `exacta`. */}
                      <FechaDeCelda iso={registro.fecha} exacta />
                    </td>
                    <td data-solo-tabla data-etiqueta="Usuario" className="px-4 py-2 text-zinc-900 dark:text-[#f6f6f6]">
                      {nombre ?? <span className="text-zinc-500">Sin usuario</span>}
                    </td>
                    <td data-solo-tabla data-etiqueta="Acción" className="px-4 py-2">
                      <PildoraDeAccion registro={registro} />
                    </td>
                    {/* Se corta en la tabla y se lee completo en el `title` o en el detalle.
                        Un solo color, el de la columna Usuario (pedido del usuario, 2026-10-15). */}
                    <td
                      data-solo-tabla
                      data-etiqueta="Cambios"
                      className="max-w-xs truncate px-4 py-2 text-zinc-900 dark:text-[#f6f6f6]"
                      title={resumenDeCambios(registro)}
                    >
                      {/* Cuando la tabla pasa a tarjetas, el texto no se corta en una línea: se parte, hasta tres. */}
                      <span className="apilada:line-clamp-3">{resumenDeCambios(registro) || '—'}</span>
                    </td>
                    <td data-solo-tabla data-etiqueta="Detalle" className="px-4 py-2 text-right">
                      {/* Ojo y tooltip en el verde de la marca, como pidió el usuario. El ojo
                          verde sobre blanco da 2,4:1 y un icono pide 3:1 (SC 1.4.11); la letra
                          blanca del tooltip, 2,4:1 de los 4,5:1 de un texto de 12 px. */}
                      <BotonOjo
                        etiqueta="Ver detalle"
                        onClick={() => setSeleccionado(registro)}
                        className="rounded-lg p-1.5 text-[#7DB728] transition-colors hover:bg-[#7DB728]/10"
                        claseTooltip={COLOR_DE_ACCION['ver-detalle']}
                      />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Dentro de la tarjeta de la tabla, como en las demás listas, y con el fondo de
                sus filas. Antes era una caja aparte con su propio borde. */}
            <Paginador
              pagina={pagina}
              totalPaginas={totalPaginas}
              onCambiarPagina={irAPagina}
              total={total}
              porPagina={porPagina}
              onCambiarPorPagina={cambiarPorPagina}
              etiqueta="registros"
              className="bg-white px-4 dark:bg-[#0f1626]"
            />
          </div>
        </>
      )}

      <DetalleRegistro registro={seleccionado} usuarios={usuarios} onCerrar={() => setSeleccionado(null)} />

      <ModalDepurarAuditoria
        key={aperturaDepurar}
        abierto={modalDepurarAbierto}
        onCerrar={() => setModalDepurarAbierto(false)}
        onExito={() => {
          setModalDepurarAbierto(false);
          recargar();
        }}
      />

    </div>
  );
}

