import type { ReactNode } from 'react';
import { TituloRico } from './titulo-rico';
import { poppins } from '@/shared/lib/fonts';

interface PoliticaPrivacidadEncabezadoProps {
  block: { id: string };
  titulo?: ReactNode;
  intro?: ReactNode;
}

/**
 * Banner de cabecera de la página de política de privacidad: título + intro.
 *
 * El título va con `TituloRico` (nivel 1: es el único `<h1>` de la página) y
 * no con un `<h1>` literal — ver el comentario de `titulo-rico.tsx` sobre por
 * qué un campo `richtext` de Puck no puede ir dentro de un encabezado.
 */
export function PoliticaPrivacidadEncabezado({
  block,
  titulo,
  intro,
}: PoliticaPrivacidadEncabezadoProps) {
  return (
    <div className={`${poppins.className} bg-white dark:bg-[#0b1121]`} data-block-id={block.id}>
      <div className="relative overflow-hidden border-b border-gray-200 dark:border-[#1e293b]">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-4xl">
            <TituloRico
              className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white"
              nivel={1}
            >
              {titulo}
            </TituloRico>
          </div>
        </div>
      </div>
      {intro && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 text-sm text-gray-600 dark:text-slate-300 leading-relaxed [&_p]:mb-2.5 [&_p:last-child]:mb-0">
          {intro}
        </div>
      )}
    </div>
  );
}
