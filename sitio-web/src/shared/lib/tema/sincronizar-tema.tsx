'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CLAVE_TEMA, esRutaDelPanel } from './tema';

/**
 * Vuelve a aplicar la regla del tema en cada cambio de ruta.
 *
 * El script del `<head>` solo corre en la carga completa. Al pasar del panel al sitio
 * con un enlace de Next no hay carga: el `<html>` es el mismo y conservaba `.dark`,
 * así que el sitio público se quedaba oscuro hasta recargar. Esto lo quita (o lo pone,
 * al volver al panel) sin esperar a una recarga.
 */
export function SincronizarTema() {
  const ruta = usePathname();

  useEffect(() => {
    let oscuro = false;
    try {
      oscuro = esRutaDelPanel(ruta ?? '') && localStorage.getItem(CLAVE_TEMA) === 'dark';
    } catch {
      // Sin almacenamiento no hay elección guardada: tema claro.
    }
    document.documentElement.classList.toggle('dark', oscuro);
  }, [ruta]);

  return null;
}
