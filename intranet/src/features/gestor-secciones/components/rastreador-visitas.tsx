'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

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
      pathname.startsWith('/editor')
    ) {
      return;
    }

    const partes = pathname.split('/').filter(Boolean);
    const slug = partes.length === 0 ? 'inicio' : partes.join('-');

    const storageKey = `olo_visita_${ambito}_${slug}`;
    try {
      if (typeof window !== 'undefined' && !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, Date.now().toString());
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/paginas/visitas/registrar`;
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Ambito': ambito,
          },
          body: JSON.stringify({ slug, ambito }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }, [pathname, ambito]);

  return null;
}
