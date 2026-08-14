import type { Data } from '@puckeditor/core';
import { ClientPuckRender } from '@/features/paginas';

interface InicioViewProps {
  data?: Data;
}

/**
 * Componente principal de la sección de Inicio.
 * Representa el contenido del <main> de la página principal.
 */
export function InicioView({ data }: InicioViewProps) {
  if (data) {
    return <ClientPuckRender data={data} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Sección de Inicio</h1>
      <p className="mt-2 text-sm text-gray-600">Contenido principal de la página de inicio.</p>
    </div>
  );
}
