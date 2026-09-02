'use client';

import { useState } from 'react';
import { useRespaldos } from '../hooks/use-respaldos';
import { VistaPreviaVersion } from './vista-previa-version';
import type { RegistroRespaldo } from '../types';

const CLASE_BOTON_PRIMARIO =
  'h-9 rounded-[16px] bg-brand-interactive px-4 text-sm font-semibold text-white transition hover:bg-brand-interactive-hover disabled:cursor-not-allowed disabled:opacity-40';

const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Historial de publicaciones de página (respaldos).
 *
 * Cada fila es una publicación: qué versión quedó activa, quién la editó y quién
 * la publicó, y —si existía una versión previa— un acceso a su vista previa.
 * Por ahora la lista sale de datos de ejemplo (`respaldos.service.ts`); esta
 * pantalla es solo el frontend, sin conexión a la base de datos todavía.
 */
export function RespaldosView() {
  const { registros, isLoading, error } = useRespaldos();
  const [seleccionado, setSeleccionado] = useState<RegistroRespaldo | null>(null);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="admin-header text-zinc-950 dark:text-[#f6f6f6]">Respaldos</h1>
        <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
          Historial de publicaciones de página: quién editó, quién publicó, cuándo, y una vista
          previa de la versión que cada publicación reemplazó.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : isLoading ? (
        <p className="text-sm text-zinc-500">Cargando respaldos…</p>
      ) : registros.length === 0 ? (
        <p className="text-sm text-zinc-500">Todavía no hay publicaciones registradas.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#7db828]/30">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Página</th>
                <th scope="col" className="px-4 py-3 font-medium">Editado por</th>
                <th scope="col" className="px-4 py-3 font-medium">Publicado por</th>
                <th scope="col" className="px-4 py-3 font-medium">Editado el</th>
                <th scope="col" className="px-4 py-3 font-medium">Publicado el</th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Versión anterior</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {registros.map((registro) => (
                <tr key={registro.id} className="bg-white dark:bg-[#0f1626]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-[#f6f6f6]">{registro.titulo}</p>
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
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={registro.versionAnteriorNumero === null}
                      onClick={() => setSeleccionado(registro)}
                      title={
                        registro.versionAnteriorNumero === null
                          ? 'Esta fue la primera versión publicada: no hay una anterior que ver'
                          : undefined
                      }
                      className={CLASE_BOTON_PRIMARIO}
                    >
                      Ver versión anterior
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VistaPreviaVersion registro={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </div>
  );
}
