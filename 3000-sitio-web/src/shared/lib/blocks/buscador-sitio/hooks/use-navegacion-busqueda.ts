'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UseNavegacionBusquedaOpciones {
  paginaResultados?: string;
  esEdicion?: boolean;
}

/**
 * Parámetro de búsqueda exclusivo para el sitio web ('busqueda').
 * Se desacopla intencionalmente del parámetro 'buscar' de ocupaciones CNO
 * para garantizar que las búsquedas del sitio web no interfieran con el catálogo CNO/CUOC.
 */
export const PARAM_BUSQUEDA_SITIO = 'busqueda';

/**
 * Hook de navegación desacoplada para el Buscador del Sitio Web.
 * Redirige dinámicamente hacia la página de resultados configurada en Puck
 * sin quemar rutas en el código, protegiendo el borrador en modo edición.
 */
export function useNavegacionBusqueda({
  paginaResultados = '/buscador-general',
  esEdicion = false,
}: UseNavegacionBusquedaOpciones = {}) {
  const router = useRouter();
  const [avisoEdicion, setAvisoEdicion] = useState(false);

  const ejecutarBusqueda = useCallback(
    (termino: string) => {
      const query = (termino || '').trim();
      if (!query) return;

      if (esEdicion) {
        // En modo de edición de Puck, no navegamos para evitar pérdida de cambios
        setAvisoEdicion(true);
        setTimeout(() => setAvisoEdicion(false), 3500);
        return;
      }

      // Normalizar la ruta de resultados: asegurar que empiece con "/" y quitar query params previos
      let ruta = (paginaResultados || '/buscador-general').trim();
      if (!ruta.startsWith('/')) {
        ruta = `/${ruta}`;
      }
      const [rutaBase] = ruta.split('?');

      const destino = `${rutaBase}?${PARAM_BUSQUEDA_SITIO}=${encodeURIComponent(query)}`;
      router.push(destino);
    },
    [paginaResultados, esEdicion, router]
  );

  return {
    ejecutarBusqueda,
    avisoEdicion,
  };
}
