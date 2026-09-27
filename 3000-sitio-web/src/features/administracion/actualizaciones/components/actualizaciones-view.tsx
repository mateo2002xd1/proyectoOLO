'use client';

import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { CargaCriteriosClasificacion } from './carga-criterios-clasificacion';
import { CargaProgramaSobresalientes } from './carga-programa-sobresalientes';

interface ActualizacionesViewProps {
  /** Rol de la sesión (cookie legible, no la fuente de verdad — ver `middleware.ts`). Solo Administrador/Superadmin puede cargar; el resto ve el historial. */
  puedeActualizar: boolean;
}

/** Las tarjetas que todavía no tienen Excel ni esquema de datos especificado. */
const MODULOS_PROXIMAMENTE = [
  'Alertas de inversión',
  'Fuentes futuras de empleo',
];

/**
 * Sección "Actualizaciones" del panel de administración — antes "Soporte", un
 * enlace del sidebar sin página real detrás (`/admin/dashboard/soporte`, 404).
 *
 * Cuatro tarjetas de carga de datos. "Programa + Sobresalientes" y "Criterios de
 * clasificación de resultados" (percentiles de la tendencia ocupacional) ya cargan;
 * las otras dos quedan como "Próximamente" hasta que se defina su estructura de datos.
 * Criterios ocupa todo el ancho: lleva formulario de año y periodo e historial por celda.
 */
export function ActualizacionesView({ puedeActualizar }: ActualizacionesViewProps) {
  return (
    <div className="w-full px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Actualizaciones"
        descripcion="Cargas de archivos que actualizan datos públicos del sitio."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <CargaCriteriosClasificacion puedeActualizar={puedeActualizar} />
      </div>
    </div>
  );
}
