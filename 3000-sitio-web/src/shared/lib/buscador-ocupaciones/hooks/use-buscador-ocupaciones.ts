'use client';

import { useCallback, useRef, useState } from 'react';
import { buscarOcupaciones as consultarOcupaciones } from '../services/buscador-ocupaciones.service';
import type { ResultadoOcupacion } from '../types';

/**
 * Estado del buscador de ocupaciones: dispara la consulta y guarda lo que la
 * vista de resultados necesita pintar.
 *
 * `terminoBuscado` no es el texto del input, sino el de la última consulta que
 * se lanzó: es el que se resalta en los resultados y el que aparece en el
 * mensaje de "sin coincidencias". Si se usara el valor del input, ambos
 * cambiarían mientras la persona sigue escribiendo sobre resultados que
 * corresponden a otra búsqueda.
 */
export function useBuscadorOcupaciones() {
  const [resultados, setResultados] = useState<ResultadoOcupacion[]>([]);
  const [terminoBuscado, setTerminoBuscado] = useState('');
  const [loading, setLoading] = useState(false);
  /** Mensaje para la pantalla si la última consulta falló; `null` si respondió bien. */
  const [error, setError] = useState<string | null>(null);
  /** Falso hasta la primera búsqueda; es lo que decide si la vista de resultados se abre. */
  const [consultaRealizada, setConsultaRealizada] = useState(false);

  /**
   * Contador de peticiones. Dos búsquedas seguidas pueden responder en orden
   * inverso, y sin este guardia la más lenta —la vieja— pisaría los resultados
   * de la más reciente.
   */
  const peticionVigente = useRef(0);

  const limpiar = useCallback(() => {
    peticionVigente.current += 1;
    setResultados([]);
    setTerminoBuscado('');
    setConsultaRealizada(false);
    setLoading(false);
    setError(null);
  }, []);

  const buscar = useCallback(
    async (termino: string) => {
      const texto = termino.trim();
      if (!texto) {
        limpiar();
        return;
      }

      const idPeticion = (peticionVigente.current += 1);
      setTerminoBuscado(texto);
      setConsultaRealizada(true);
      setLoading(true);
      setError(null);

      try {
        const encontradas = await consultarOcupaciones(texto);
        if (idPeticion !== peticionVigente.current) return;
        setResultados(encontradas);
      } catch (fallo) {
        if (idPeticion !== peticionVigente.current) return;
        setResultados([]);
        setError(fallo instanceof Error ? fallo.message : 'No se pudo consultar el catálogo de ocupaciones.');
      } finally {
        if (idPeticion === peticionVigente.current) setLoading(false);
      }
    },
    [limpiar],
  );

  return { resultados, terminoBuscado, loading, error, consultaRealizada, buscar, limpiar };
}
