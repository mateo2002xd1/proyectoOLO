'use client';

import { useCallback, useRef, useState } from 'react';
import { obtenerDetalleOcupacion } from '../services/buscador-ocupaciones.service';
import type { DetalleOcupacion } from '../types';

/**
 * Estado de la vista ampliada de una ocupación.
 *
 * `codigoAbierto` se fija antes de que llegue la respuesta para que la vista
 * pueda abrirse ya —con su encabezado y un indicador de carga— en lugar de
 * quedarse en blanco esperando a la consulta.
 */
export function useDetalleOcupacion() {
  const [codigoAbierto, setCodigoAbierto] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<DetalleOcupacion | null>(null);
  const [loading, setLoading] = useState(false);
  /** Mensaje para la pantalla si la consulta falló; una ocupación inexistente no es un error, es `detalle === null`. */
  const [error, setError] = useState<string | null>(null);

  /** Mismo guardia contra respuestas fuera de orden que en `use-buscador-ocupaciones`. */
  const peticionVigente = useRef(0);

  const cerrar = useCallback(() => {
    peticionVigente.current += 1;
    setCodigoAbierto(null);
    setDetalle(null);
    setLoading(false);
    setError(null);
  }, []);

  const abrir = useCallback(async (codigoOcupacion: string) => {
    const idPeticion = (peticionVigente.current += 1);
    setCodigoAbierto(codigoOcupacion);
    setDetalle(null);
    setLoading(true);
    setError(null);

    try {
      const encontrado = await obtenerDetalleOcupacion(codigoOcupacion);
      if (idPeticion !== peticionVigente.current) return;
      setDetalle(encontrado);
    } catch (fallo) {
      if (idPeticion !== peticionVigente.current) return;
      setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar el detalle de esta ocupación.');
    } finally {
      if (idPeticion === peticionVigente.current) setLoading(false);
    }
  }, []);

  return { codigoAbierto, detalle, loading, error, abrir, cerrar };
}
