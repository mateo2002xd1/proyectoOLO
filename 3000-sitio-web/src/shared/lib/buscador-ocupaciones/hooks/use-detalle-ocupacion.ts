'use client';

import { useEffect, useState } from 'react';
import { obtenerDetalleOcupacion } from '../services/buscador-ocupaciones.service';
import type { DetalleOcupacion } from '../types';

interface Respuesta {
  codigo: string;
  detalle: DetalleOcupacion | null;
  error: string | null;
}

/**
 * La vista ampliada de la ocupación `codigo` (sale de la URL, `?ocupacion=`).
 *
 * Mismo esquema que `useBuscadorOcupaciones`: la respuesta se guarda con su código y
 * `loading` es «hay código y aún no llegó la respuesta de ese código». Una ocupación
 * inexistente no es un error, es `detalle === null`; `error` es solo la consulta fallida.
 */
export function useDetalleOcupacion(codigo: string | null) {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  useEffect(() => {
    if (!codigo) return;

    let vigente = true;
    obtenerDetalleOcupacion(codigo)
      .then((detalle) => {
        if (vigente) setRespuesta({ codigo, detalle, error: null });
      })
      .catch((fallo) => {
        if (!vigente) return;
        setRespuesta({
          codigo,
          detalle: null,
          error: fallo instanceof Error ? fallo.message : 'No se pudo cargar el detalle de esta ocupación.',
        });
      });

    return () => {
      vigente = false;
    };
  }, [codigo]);

  const lista = codigo && respuesta?.codigo === codigo ? respuesta : null;

  return {
    detalle: lista?.detalle ?? null,
    loading: Boolean(codigo) && !lista,
    error: lista?.error ?? null,
  };
}
