'use client';

import { useCallback, useState } from 'react';
import { buscarOcupaciones } from '../services/buscador-ocupaciones.service';
import type { Ocupacion } from '../types';

export function useBuscadorOcupaciones() {
  const [resultados, setResultados] = useState<Ocupacion[]>([]);
  const [loading, setLoading] = useState(false);

  const buscar = useCallback(async (termino: string) => {
    setLoading(true);
    try {
      const data = await buscarOcupaciones(termino);
      setResultados(data);
    } finally {
      setLoading(false);
    }
  }, []);

  return { resultados, loading, buscar };
}
