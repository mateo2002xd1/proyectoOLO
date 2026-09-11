'use client';

import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { useRespaldos } from '../hooks/use-respaldos';
import { VistaPreviaVersion } from './vista-previa-version';
import type { RegistroRespaldo } from '../types';

const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const normalizar = (t: string) =>
  t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

/** Misma etiqueta-encima-del-control que Auditoría, para que los filtros se lean igual en las dos pantallas. */
function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex w-44 flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{etiqueta}</span>
      {children}
    </div>
  );
}

const FILTROS_VACIOS = { busqueda: '', ambito: '', editor: '', publicador: '', desde: '', hasta: '' };

/**
 * Historial de publicaciones de página (respaldos).
 *
 * Cada fila es una publicación: qué versión quedó activa, quién la editó y quién
 * la publicó, y —si existía una versión previa— un acceso a su vista previa.
 * Por ahora la lista sale de datos de ejemplo (`respaldos.service.ts`); esta
 * pantalla es solo el frontend, sin conexión a la base de datos todavía.
 *
 * Los filtros son sobre lo ya cargado, no contra un endpoint: no hay `porPagina`
 * que enviar al servidor porque el servidor todavía no sabe filtrar esto.
 */
export function RespaldosView() {
  const { registros, isLoading, isRefreshing, error, recargar } = useRespaldos();
  const [seleccionado, setSeleccionado] = useState<RegistroRespaldo | null>(null);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);

  const cambiarFiltro = (campo: keyof typeof FILTROS_VACIOS, valor: string) =>
    setFiltros((previos) => ({ ...previos, [campo]: valor }));

  // Filtrar para que la lista únicamente contenga elementos con versión anterior disponible para restaurar
  const registrosRestaurables = registros.filter(
    (registro) => registro.versionAnteriorNumero !== null && Boolean(registro.versionAnteriorId || registro.versionAnteriorNumero)
  );

  // Las opciones de Editor/Publicador salen de lo cargado, no de un catálogo aparte:
  // Respaldos no tiene (todavía) un endpoint propio de usuarios como sí tiene Auditoría.
  const editores = useMemo(
    () => [...new Set(registrosRestaurables.map((r) => r.editadoPor.nombre))].sort((a, b) => a.localeCompare(b, 'es')),
    [registrosRestaurables]
  );
  const publicadores = useMemo(
    () => [...new Set(registrosRestaurables.map((r) => r.publicadoPor.nombre))].sort((a, b) => a.localeCompare(b, 'es')),
    [registrosRestaurables]
  );

  const registrosFiltrados = useMemo(() => {
    const q = normalizar(filtros.busqueda);
    return registrosRestaurables.filter((r) => {
      if (q && !normalizar(`${r.titulo} ${r.slug}`).includes(q)) return false;
      if (filtros.ambito && r.ambito !== filtros.ambito) return false;
      if (filtros.editor && r.editadoPor.nombre !== filtros.editor) return false;
      if (filtros.publicador && r.publicadoPor.nombre !== filtros.publicador) return false;
      // Comparación de texto sobre `YYYY-MM-DD...`: válida porque la fecha es la
      // parte más significativa al principio del ISO, sin necesidad de parsear.
      if (filtros.desde && r.publicadoEn.slice(0, 10) < filtros.desde) return false;
      if (filtros.hasta && r.publicadoEn.slice(0, 10) > filtros.hasta) return false;
      return true;
    });
  }, [registrosRestaurables, filtros]);

  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="admin-header text-zinc-950 dark:text-[#f6f6f6]">Respaldos</h1>
          <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
            Historial de publicaciones con versión anterior archivada: páginas con respaldo disponible para consultar y restaurar.
          </p>
        </div>
        {isRefreshing && (
          <span className="text-xs font-medium text-brand-interactive animate-pulse self-center">
            Actualizando respaldos…
          </span>
        )}
      </div>

      {!isLoading && registrosRestaurables.length > 0 && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Campo etiqueta="Página">
            <input
              type="search"
              value={filtros.busqueda}
              onChange={(e) => cambiarFiltro('busqueda', e.target.value)}
              placeholder="Título o slug…"
              className="h-11 w-full rounded-[16px] border border-[#d0d5dd] bg-white px-3 text-sm text-zinc-900 placeholder:text-[#8a95ad] focus:border-[#002237] focus:outline-none focus:ring-2 focus:ring-[#002237]/20 dark:border-[#2d3649] dark:bg-[#252f47] dark:text-[#e6e8f0]"
            />
          </Campo>

          <Campo etiqueta="Ámbito">
            <CustomSelect
              ariaLabel="Ámbito"
              value={filtros.ambito}
              onChange={(valor) => cambiarFiltro('ambito', valor)}
              options={[
                { value: '', label: 'Todos' },
                { value: 'sitio', label: 'Sitio web' },
                { value: 'intranet', label: 'Intranet' },
              ]}
            />
          </Campo>

          <Campo etiqueta="Editor">
            <CustomSelect
              ariaLabel="Editor"
              value={filtros.editor}
              onChange={(valor) => cambiarFiltro('editor', valor)}
              options={[{ value: '', label: 'Todos' }, ...editores.map((n) => ({ value: n, label: n }))]}
            />
          </Campo>

          <Campo etiqueta="Publicador">
            <CustomSelect
              ariaLabel="Publicador"
              value={filtros.publicador}
              onChange={(valor) => cambiarFiltro('publicador', valor)}
              options={[{ value: '', label: 'Todos' }, ...publicadores.map((n) => ({ value: n, label: n }))]}
            />
          </Campo>

          <Campo etiqueta="Publicado desde">
            <DatePicker
              ariaLabel="Publicado desde"
              value={filtros.desde}
              max={filtros.hasta || undefined}
              onChange={(valor) => cambiarFiltro('desde', valor)}
            />
          </Campo>

          <Campo etiqueta="Publicado hasta">
            <DatePicker
              ariaLabel="Publicado hasta"
              value={filtros.hasta}
              min={filtros.desde || undefined}
              onChange={(valor) => cambiarFiltro('hasta', valor)}
            />
          </Campo>

          {hayFiltros && (
            <button
              type="button"
              onClick={() => setFiltros(FILTROS_VACIOS)}
              className="h-11 rounded-[16px] border border-[#d0d5dd] px-4 text-sm font-medium text-zinc-700 transition hover:border-[#002237]/40 hover:bg-[#002237]/5 hover:text-[#002237] dark:border-[#2d3649] dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-[#f6f6f6]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {error && !registros.length ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : isLoading ? (
        <p className="text-sm text-zinc-500">Cargando respaldos…</p>
      ) : registrosRestaurables.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay páginas con versiones anteriores disponibles para restaurar.</p>
      ) : registrosFiltrados.length === 0 ? (
        <p className="text-sm text-zinc-500">Ningún registro coincide con los filtros aplicados.</p>
      ) : (
        <div className={`overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#7db828]/30 transition-opacity ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Página</th>
                <th scope="col" className="px-4 py-3 font-medium">Editado por</th>
                <th scope="col" className="px-4 py-3 font-medium">Publicado por</th>
                <th scope="col" className="px-4 py-3 font-medium">Editado el</th>
                <th scope="col" className="px-4 py-3 font-medium">Publicado el</th>
                <th scope="col" className="px-4 py-3 text-center font-medium">Versión anterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {registrosFiltrados.map((registro) => (
                <tr key={registro.id} className="bg-white dark:bg-[#0f1626]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-900 dark:text-[#f6f6f6]">{registro.titulo}</p>
                      {registro.ambito && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            registro.ambito === 'intranet'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {registro.ambito === 'intranet' ? 'Intranet' : 'Sitio web'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">/{registro.slug} · versión {registro.numeroVersion}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{registro.editadoPor.nombre}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{registro.publicadoPor.nombre}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {fecha(registro.editadoEn)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {fecha(registro.publicadoEn)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSeleccionado(registro)}
                      aria-label="Ver versión anterior"
                      title="Ver versión anterior"
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
      )}

      <VistaPreviaVersion
        registro={seleccionado}
        onCerrar={() => setSeleccionado(null)}
        onRestaurado={recargar}
      />
    </div>
  );
}
