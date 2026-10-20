'use client';

import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { CargaCriteriosClasificacion } from './carga-criterios-clasificacion';
import { CargaProgramaSobresalientes } from './carga-programa-sobresalientes';
import { CargaAlertasInversion } from './carga-alertas-inversion';
import { SeccionAcordeon } from '@/shared/ui/molecules/seccion-acordeon';

interface ActualizacionesViewProps {
  /** Rol de la sesión (cookie legible, no la fuente de verdad — ver `middleware.ts`). Solo Administrador/Superadmin puede cargar; el resto ve el historial. */
  puedeActualizar: boolean;
}

/**
 * Sección "Actualizaciones" del panel de administración — antes "Soporte", un
 * enlace del sidebar sin página real detrás (`/admin-panel/dashboard/soporte`, 404).
 *
 * Cada submódulo es una fila de acordeón (`SeccionAcordeon`) que se despliega para mostrar
 * sus opciones: formato, carga e historial. "Fuentes futuras de empleo" se quitó de aquí el
 * 2026-10-09 a pedido del usuario; su tarjeta (`carga-fuentes-futuras.tsx`) queda sin uso.
 */
export function ActualizacionesView({ puedeActualizar }: ActualizacionesViewProps) {
  return (
    <div className="w-full px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Actualizaciones"
        descripcion="Cargas de archivos que actualizan datos públicos del sitio."
      />

      <div className="flex flex-col gap-4">
        <SeccionAcordeon titulo="Programa + Sobresalientes">
          <CargaProgramaSobresalientes puedeActualizar={puedeActualizar} />
        </SeccionAcordeon>
        <SeccionAcordeon titulo="Alertas de inversión">
          <CargaAlertasInversion puedeActualizar={puedeActualizar} />
        </SeccionAcordeon>
        <SeccionAcordeon titulo="Criterios de clasificación de resultados">
          <CargaCriteriosClasificacion puedeActualizar={puedeActualizar} />
        </SeccionAcordeon>
      </div>
    </div>
  );
}
