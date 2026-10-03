'use client';

import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { CargaCriteriosClasificacion } from './carga-criterios-clasificacion';
import { CargaProgramaSobresalientes } from './carga-programa-sobresalientes';
import { CargaAlertasInversion } from './carga-alertas-inversion';

interface ActualizacionesViewProps {
  /** Rol de la sesión (cookie legible, no la fuente de verdad — ver `middleware.ts`). Solo Administrador/Superadmin puede cargar; el resto ve el historial. */
  puedeActualizar: boolean;
}

/**
 * Sección "Actualizaciones" del panel de administración — antes "Soporte", un
 * enlace del sidebar sin página real detrás (`/admin/dashboard/soporte`, 404).
 *
 * "Programa + Sobresalientes", "Criterios de clasificación de resultados" (percentiles
 * de la tendencia ocupacional) y "Alertas de inversión" ya cargan. Criterios ocupa
 * todo el ancho: lleva formulario de año y periodo e historial por celda.
 */
export function ActualizacionesView({ puedeActualizar }: ActualizacionesViewProps) {
  return (
    <div className="w-full px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Actualizaciones"
        descripcion="Cargas de archivos que actualizan datos públicos del sitio."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CargaProgramaSobresalientes puedeActualizar={puedeActualizar} />
        <CargaAlertasInversion puedeActualizar={puedeActualizar} />

        <CargaCriteriosClasificacion puedeActualizar={puedeActualizar} />
      </div>
    </div>
  );
}
