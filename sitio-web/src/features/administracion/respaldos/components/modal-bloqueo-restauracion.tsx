'use client';

import { useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';

export function ModalBloqueoRestauracion({
  abierto,
  mensajeBloqueo,
  onCerrar,
}: {
  abierto: boolean;
  mensajeBloqueo: string | null;
  onCerrar: () => void;
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
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === dialogo.current) onCerrar();
      }}
      className="m-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-black/50 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      <div className="flex flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-[#f6f6f6]">
            Página en uso
          </h2>
        </div>
        
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          <p>
            {mensajeBloqueo || 'No se puede restaurar la página porque está siendo editada en este momento.'}
          </p>
          <p className="mt-2">
            Por favor, inténtalo más tarde cuando el editor haya terminado.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCerrar}
            className="inline-flex w-full justify-center rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500/50 sm:w-auto dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Entendido
          </button>
        </div>
      </div>
    </dialog>
  );
}
