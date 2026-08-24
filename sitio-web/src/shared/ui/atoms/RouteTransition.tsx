'use client';

import type { ReactNode } from 'react';
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
 */
export function RouteTransition({ children, className = '' }: RouteTransitionProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className={['olo-route-transition', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
