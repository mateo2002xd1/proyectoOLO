'use client';

import { useEffect, useState } from 'react';
import { listarContenidosPublicados } from '../services/contenidos.service';
import type { Contenido } from '../types';

export function useContenidos() {
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarContenidosPublicados()
      .then(setContenidos)
      .finally(() => setLoading(false));
  }, []);

  return { contenidos, loading };
}
