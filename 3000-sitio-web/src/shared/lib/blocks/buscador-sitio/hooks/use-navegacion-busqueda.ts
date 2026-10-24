'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PARAM_BUSQUEDA_SITIO } from '../lib/parametro-busqueda';
import { RUTA_DE_RESULTADOS_POR_DEFECTO, rutaDeLosResultados } from '../lib/ruta-de-resultados';

export interface UseNavegacionBusquedaOpciones {
  paginaResultados?: string;
  esEdicion?: boolean;
}

/**
 * Hook de navegación desacoplada para el Buscador del Sitio Web.
 * Redirige dinámicamente hacia la página de resultados configurada en Puck
 * sin quemar rutas en el código, protegiendo el borrador en modo edición.
 */
export function useNavegacionBusqueda({
  paginaResultados = RUTA_DE_RESULTADOS_POR_DEFECTO,
  esEdicion = false,
}: UseNavegacionBusquedaOpciones = {}) {
  const router = useRouter();
  const [avisoEdicion, setAvisoEdicion] = useState(false);

  const ejecutarBusqueda = useCallback(
    (termino: string) => {
      const consulta = (termino || '').trim();
      if (!consulta) return;

      if (esEdicion) {
        // En modo de edición de Puck no se navega para no perder el borrador.
        setAvisoEdicion(true);
        setTimeout(() => setAvisoEdicion(false), 3500);
        return;
      }

      router.push(`${rutaDeLosResultados(paginaResultados)}?${PARAM_BUSQUEDA_SITIO}=${encodeURIComponent(consulta)}`);
    },
    [paginaResultados, esEdicion, router]
  );

  return {
    ejecutarBusqueda,
    avisoEdicion,
  };
}
