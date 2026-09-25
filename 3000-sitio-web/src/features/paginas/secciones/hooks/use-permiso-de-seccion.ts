'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { permisosDeLaSesion } from '../services/secciones.service';
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

function tienePermisoPorCookieSincrono(): boolean {
  const rol = leerRolActual();
  return rol === 'superadmin' || rol === 'administrador';
}

function sinSuscripcion() {
  return () => {};
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
  // Lectura síncrona de la cookie con useSyncExternalStore: el snapshot de servidor
  // es siempre `false` (el servidor no ve la cookie del navegador), así la primera
  // pasada del cliente coincide con el HTML del servidor y no rompe la hidratación.
  // React reconcilia con el valor real justo después de montar, sin esperar a /api/me.
  const tienePermisoPorCookie = useSyncExternalStore(
    sinSuscripcion,
    tienePermisoPorCookieSincrono,
    () => false
  );

  const [tienePermisoPorApi, setTienePermisoPorApi] = useState(false);

  useEffect(() => {
    let vigente = true;

    const revisar = () => {
      const rol = leerRolActual();
      if (!rol) {
        setTienePermisoPorApi(false);
        return;
      }

      permisosDeLaSesion().then((permisos) => {
        if (vigente) {
          setTienePermisoPorApi(rol === 'superadmin' || permisos.includes(clave));
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

  return tienePermisoPorCookie || tienePermisoPorApi;
}
