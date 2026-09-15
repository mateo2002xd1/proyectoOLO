'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { registrarVisita } from '../services/paginas.service';

interface Props {
  ambito?: 'sitio' | 'intranet';
}

/**
 * Rastrea visitas a las páginas públicas o de intranet de forma automática.
 * Deduplica visitas en una misma sesión mediante sessionStorage para registrar
 * conteos realistas sin sobrecargar la base de datos.
 */
export function RastreadorVisitas({ ambito = 'sitio' }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Rutas internas o técnicas que no son vistas públicas de contenido
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/preview') ||
      pathname.startsWith('/editor')
    ) {
      return;
    }

    // Extraer el slug limpio de la URL
    // e.g. "/" -> "inicio", "/cno" -> "cno", "/encuestas/tasa" -> "encuestas-tasa"
    const partes = pathname.split('/').filter(Boolean);
    const slug = partes.length === 0 ? 'inicio' : partes.join('-');

    const storageKey = `olo_visita_${ambito}_${slug}`;
    try {
      if (typeof window !== 'undefined' && !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, Date.now().toString());
        registrarVisita(slug, ambito);
      }
    } catch {
      // Ignorar errores de almacenamiento local privado
      registrarVisita(slug, ambito);
    }
  }, [pathname, ambito]);

  return null;
}
