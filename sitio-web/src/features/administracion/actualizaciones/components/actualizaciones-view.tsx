'use client';

import { CargaProgramaSobresalientes } from './carga-programa-sobresalientes';

interface ActualizacionesViewProps {
  /** Rol de la sesión (cookie legible, no la fuente de verdad — ver `middleware.ts`). Solo Administrador/Superadmin puede cargar; el resto ve el historial. */
  puedeActualizar: boolean;
}

/** Las 3 tarjetas que todavía no tienen Excel ni esquema de datos especificado. */
const MODULOS_PROXIMAMENTE = [
  'Alertas de inversión',
  'Fuentes futuras de empleo',
  'Criterios de clasificación de resultados',
];

/**
 * Sección "Actualizaciones" del panel de administración — antes "Soporte", un
 * enlace del sidebar sin página real detrás (`/admin/dashboard/soporte`, 404).
 *
 * Cuatro tarjetas de carga de datos; hoy solo "Programa + Sobresalientes" tiene
 * Excel, tablas y flujo de carga especificados. Las otras tres quedan como
 * "Próximamente" hasta que se defina su estructura de datos.
 */
export function ActualizacionesView({ puedeActualizar }: ActualizacionesViewProps) {
  return (
    <div className="w-full p-6 lg:p-8">
      <h1 className="admin-header text-[#001631] dark:text-[#f6f6f6]">Actualizaciones</h1>
      <p className="mt-1 mb-6 text-sm text-gray-600 dark:text-[#94a3b8]">
        Cargas de archivos que actualizan datos públicos del sitio.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CargaProgramaSobresalientes puedeActualizar={puedeActualizar} />

        {MODULOS_PROXIMAMENTE.map((nombre) => (
          <div
            key={nombre}
            className="rounded-xl border border-gray-200 bg-gray-50 p-6 opacity-60 transition-all duration-200 ease-out hover:translate-x-1 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <h2 className="font-semibold text-[#001631] dark:text-[#f6f6f6]">{nombre}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-[#94a3b8]">Próximamente</p>
          </div>
        ))}
      </div>
    </div>
  );
}
