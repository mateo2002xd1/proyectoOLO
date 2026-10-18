'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface RouteTransitionProps {
  children: ReactNode;
  /** Clases que el nodo envuelto necesita conservar además de la animación —
   *  p. ej. para seguir participando en un layout flex del que era hijo directo. */
  className?: string;
}

/**
 * Suaviza el cambio de una vista a otra dentro de la misma sección.
 *
 * Next sustituye el contenido de golpe entre navegaciones: `{children}` cambia,
 * pero es el mismo nodo del árbol, así que no hay nada que dispare una animación.
 * `key={pathname}` es lo que lo consigue — al cambiar de ruta, React desmonta el
 * nodo anterior y monta uno nuevo, y una animación CSS siempre arranca desde el
 * principio en un nodo recién montado.
 *
 * Cambiar solo el querystring (`?volver=/inicio`, una paginación, un filtro) no
 * mueve `pathname`, así que no reanima: es la señal correcta, esos cambios no son
 * "otra vista".
 *
 * La primera carga (entrar o recargar) no se anima: no hay vista anterior de la que
 * venir, y el fundido dejaba la página en blanco bajo la cabecera mientras aparecía.
 * La clase se pone a partir de la primera navegación.
 */
export function RouteTransition({ children, className = '' }: RouteTransitionProps) {
  const pathname = usePathname();
  const [rutaInicial] = useState(pathname);
  const [huboNavegacion, setHuboNavegacion] = useState(false);
  // Ajuste de estado durante el render, el patrón que React da para «guardar algo de
  // un render anterior»: un efecto pintaría primero la vista nueva sin animar.
  if (!huboNavegacion && pathname !== rutaInicial) setHuboNavegacion(true);

  return (
    <div
      key={pathname}
      className={[huboNavegacion && 'olo-route-transition', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
