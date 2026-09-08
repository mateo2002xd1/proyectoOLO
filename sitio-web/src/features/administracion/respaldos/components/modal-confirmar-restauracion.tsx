'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export function ModalConfirmarRestauracion({
  abierto,
  versionAnteriorNumero,
  slug,
  numeroVersionActual,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  versionAnteriorNumero: number;
  slug: string;
  numeroVersionActual: number;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierto && !el.open) el.showModal();
    if (!abierto && el.open) el.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      onClose={onCancelar}
      onClick={(e) => {
        if (e.target === dialogo.current) onCancelar();
      }}
      className="m-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-black/50 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      <div className="flex flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-[#f6f6f6]">
            ¿Restaurar versión anterior?
          </h2>
        </div>
        
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          <p>
            Estás a punto de restaurar la versión <strong>{versionAnteriorNumero}</strong> de <strong>/{slug}</strong>.
          </p>
          <p className="mt-2">
            Esta acción publicará nuevamente la versión {versionAnteriorNumero} y pasará la versión actual ({numeroVersionActual}) al archivo histórico.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex w-full justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-interactive/50 sm:w-auto dark:border-zinc-600 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="inline-flex w-full justify-center rounded-lg bg-brand-interactive px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-interactive-hover focus:outline-none focus:ring-2 focus:ring-brand-interactive/50 sm:w-auto"
          >
            Aceptar
          </button>
        </div>
      </div>
    </dialog>
  );
}
