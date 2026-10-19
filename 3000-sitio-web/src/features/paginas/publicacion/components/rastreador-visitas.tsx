'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { registrarVisita } from '../services/publicacion.service';
import { slugDeRutaPublica } from '../../model/rutas';

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

    // "/" -> "inicio", "/tendencias" -> "tendencias", "/clasificacion/cno" ->
    // "clasificacion-cno": la misma cuenta que hace el comodín `[...puckPath]`.
    const slug = slugDeRutaPublica(pathname);

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
