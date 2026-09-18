import { Metadata } from 'next';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Configuración - Observatorio Laboral y Ocupacional',
};

export default function ConfiguracionPage() {
  return (
    <div className="p-6">
      <h1 className="admin-header text-zinc-900 dark:text-[#f6f6f6]">Configuración</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-[#94a3b8]">
        Preferencias generales del panel administrativo
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-[#0b1121]">
        <Cog8ToothIcon className="size-10 text-zinc-400 dark:text-zinc-600" />
        <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-[#cbd5e1]">
          Esta sección está en construcción
        </p>
        <p className="mt-1 max-w-md text-sm text-zinc-500 dark:text-[#94a3b8]">
          Muy pronto podrás ajustar aquí las preferencias del panel.
        </p>
      </div>
    </div>
  );
}
