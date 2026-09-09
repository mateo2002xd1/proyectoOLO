'use client';

import { useEffect, useState } from 'react';
import { permisosDeLaSesion } from '../services/paginas.service';
import { AUTH_ROLE_COOKIE_NAME } from '@/shared/lib/auth-cookies';

/** Mismos roles que `puedeEditarPaginas()` en `shared/lib/session.ts`. */
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor', 'admin'];

function leerCookie(nombre: string): string | null {
  if (typeof document === 'undefined') return null;
  const coincidencia = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]*)'));
  if (!coincidencia || !coincidencia[1]) return null;
  return decodeURIComponent(coincidencia[1]).replace(/^["']|["']$/g, '').trim().toLowerCase();
}

function leerRolActual(): string {
  return (
    leerCookie(AUTH_ROLE_COOKIE_NAME) ||
    leerCookie('role') ||
    leerCookie('rol') ||
    leerCookie('sitio_role') ||
    ''
  );
}

/**
 * Si la sesión actual tiene una clave de permiso concreta (`secciones.crear`,
 * `secciones.eliminar`...). Filtra primero por la cookie de rol —para no
 * consultar `/api/me` en cada visita anónima— y solo si pasa ese filtro
 * pregunta a la API, que es quien de verdad sabe las claves.
 *
 * Se revisa al montar y otra vez cada vez que la pestaña recupera el foco, no
 * solo al montar: estos botones viven en páginas públicas que la gente deja
 * abiertas en segundo plano durante días.
 */
export function usePermisoDeSeccion(clave: string): boolean {
  const [tienePermiso, setTienePermiso] = useState(() => {
    const rol = leerRolActual();
    return rol === 'superadmin' || rol === 'administrador';
  });

  useEffect(() => {
    let vigente = true;

    const revisar = () => {
      const rol = leerRolActual();
      if (!rol || !ROLES_QUE_EDITAN.includes(rol)) {
        setTienePermiso(false);
        return;
      }

      if (rol === 'superadmin') {
        setTienePermiso(true);
      }

      permisosDeLaSesion().then((permisos) => {
        if (vigente) {
          if (rol === 'superadmin') {
            setTienePermiso(true);
          } else {
            setTienePermiso(permisos.includes(clave));
          }
        }
      });
    };

    revisar();

    const alRecuperarFoco = () => {
      if (document.visibilityState === 'visible') revisar();
    };
    document.addEventListener('visibilitychange', alRecuperarFoco);
    window.addEventListener('focus', revisar);

    return () => {
      vigente = false;
      document.removeEventListener('visibilitychange', alRecuperarFoco);
      window.removeEventListener('focus', revisar);
    };
  }, [clave]);

  return tienePermiso;
}
