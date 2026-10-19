'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  guardarPreferencias,
  leerPreferencias,
  PREFERENCIAS_PREDETERMINADAS,
  suscribirPreferencias,
  type PreferenciasAccesibilidad,
} from './preferencias';

/** En el servidor no hay almacenamiento: se pinta el sitio tal cual y se corrige al hidratar. */
const enElServidor = () => PREFERENCIAS_PREDETERMINADAS;

/** Las preferencias guardadas y la forma de cambiarlas. */
export function usePreferenciasAccesibilidad() {
  const preferencias = useSyncExternalStore(suscribirPreferencias, leerPreferencias, enElServidor);

  const cambiar = useCallback((cambios: Partial<PreferenciasAccesibilidad>) => {
    guardarPreferencias({ ...leerPreferencias(), ...cambios });
  }, []);

  const restablecer = useCallback(() => guardarPreferencias(PREFERENCIAS_PREDETERMINADAS), []);

  return { preferencias, cambiar, restablecer };
}
