'use client';

import { useEffect } from 'react';
import { usePathname, useServerInsertedHTML } from 'next/navigation';
import { CLAVE_TEMA, esRutaDelPanel, SCRIPT_TEMA_ANTES_DE_PINTAR } from './tema';

/**
 * Inyecta el script anti-flash en el `<head>` antes de pintar en SSR (mediante
 * `useServerInsertedHTML`) evitando warnings de React 19 al renderizar en cliente,
 * y vuelve a sincronizar la regla del tema en cada cambio de ruta.
 */
export function SincronizarTema() {
  const ruta = usePathname();

  useServerInsertedHTML(() => (
    <script
      id="anti-flash-theme"
      dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_ANTES_DE_PINTAR }}
    />
  ));

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
