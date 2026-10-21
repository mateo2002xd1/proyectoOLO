'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { registrarVisita } from '../services/publicacion.service';
import { slugDeRutaPublica } from '../../model/rutas';

interface Props {
  ambito?: 'sitio' | 'intranet';
}

/**
 * Rastrea visitas a las secciones de la intranet de forma automática.
 * Deduplica visitas en una misma sesión mediante sessionStorage.
 */
export function RastreadorVisitas({ ambito = 'intranet' }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/preview') ||
      pathname === '/edit' ||
      pathname.startsWith('/edit/')
    ) {
      return;
    }

    const slug = slugDeRutaPublica(pathname);

    const storageKey = `olo_visita_${ambito}_${slug}`;
    try {
      if (typeof window !== 'undefined' && !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, Date.now().toString());
        registrarVisita(slug, ambito);
      }
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }, [pathname, ambito]);

  return null;
}
