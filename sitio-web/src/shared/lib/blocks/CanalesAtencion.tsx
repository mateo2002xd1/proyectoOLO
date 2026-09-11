import type { ReactNode } from 'react';
import { TituloRico } from './titulo-rico';
import { poppins } from '@/shared/lib/fonts';

export interface CanalDeAtencion {
  etiqueta?: ReactNode;
  valor?: ReactNode;
}

interface CanalesAtencionProps {
  block: { id: string };
  titulo?: ReactNode;
  intro?: ReactNode;
  canales?: CanalDeAtencion[];
}

/** Tarjeta de canales de contacto para ejercer derechos de Habeas Data. */
export function CanalesAtencion({ block, titulo, intro, canales = [] }: CanalesAtencionProps) {
  return (
    <div className={`${poppins.className} bg-white dark:bg-[#0b1121]`} data-block-id={block.id}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#131b2f] p-6 shadow-sm transition-colors">
          {titulo && (
            <div className="border-b border-gray-100 dark:border-[#1e293b] pb-3 mb-4">
              <TituloRico className="text-lg font-bold text-gray-900 dark:text-[#f6f6f6]">{titulo}</TituloRico>
            </div>
          )}

          <div className="space-y-4 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
            {intro && <div className="[&_p]:mb-0">{intro}</div>}

            {canales.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                {canales.map((canal, indice) => (
                  <div key={indice}>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {canal.etiqueta}
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-[#f6f6f6] text-xs mt-1 truncate">
                      {canal.valor}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
