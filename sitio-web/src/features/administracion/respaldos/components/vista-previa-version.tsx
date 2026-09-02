'use client';

import { useEffect, useRef } from 'react';
import type { RegistroRespaldo } from '../types';

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm break-words text-zinc-900 dark:text-[#f6f6f6]">{children}</dd>
    </div>
  );
}

/**
 * Vista previa de solo lectura de la versión que una publicación reemplazó.
 *
 * Es un `<dialog>` nativo por lo mismo que el detalle de auditoría: foco atrapado,
 * cierre con Escape y capa propia, sin librería. El contenido de la versión en sí
 * todavía no lo expone el backend (T-XX), así que aquí solo se confirma el hueco
 * en vez de simular contenido que no existe.
 */
export function VistaPreviaVersion({
  registro,
  onCerrar,
}: {
  registro: RegistroRespaldo | null;
  onCerrar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (registro && !el.open) el.showModal();
    if (!registro && el.open) el.close();
  }, [registro]);

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === dialogo.current) onCerrar();
      }}
      className="m-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-black/50 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      {registro && (
        <div className="flex max-h-[80vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-700">
            <div>
              <h2 className="admin-subtitle">Versión anterior de {registro.titulo}</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                /{registro.slug} · versión {registro.versionAnteriorNumero}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cerrar
            </button>
          </div>

          <div className="overflow-y-auto p-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Dato etiqueta="Reemplazada por la versión">{registro.numeroVersion}</Dato>
              <Dato etiqueta="Reemplazada el">
                {new Date(registro.publicadoEn).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'medium' })}
              </Dato>
              <Dato etiqueta="Editada por">{registro.editadoPor.nombre}</Dato>
              <Dato etiqueta="Publicada por">{registro.publicadoPor.nombre}</Dato>
            </dl>

            <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/40">
              El contenido de esta versión todavía no lo expone el backend, por eso aquí solo se
              muestra su información. Cuando el endpoint de historial esté disponible, este panel
              renderizará el contenido guardado de la versión {registro.versionAnteriorNumero}.
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
