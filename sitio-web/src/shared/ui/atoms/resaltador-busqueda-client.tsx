'use client';

import { usePathname } from 'next/navigation';
import { ResaltadorDeBusqueda } from '@olo/blocks-renderer';

/**
 * Componente cliente que activa el desplazamiento suave y el destello luminoso
 * de resaltado cuando la URL incluye parámetros de búsqueda (?resaltar=... o #blockId).
 */
export function ResaltadorBusquedaClient() {
  const pathname = usePathname();
  return <ResaltadorDeBusqueda pathname={pathname} delayMs={150} />;
}
