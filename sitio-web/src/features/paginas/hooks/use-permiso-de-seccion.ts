'use client';

import { useEffect, useState } from 'react';
import { permisosDeLaSesion } from '../services/paginas.service';
import { AUTH_ROLE_COOKIE_NAME } from '@/shared/lib/auth-cookies';

/** Mismos roles que `puedeEditarPaginas()` en `shared/lib/session.ts`. */
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor'];

function leerCookie(nombre: string): string | null {
  if (typeof document === 'undefined') return null;
  const coincidencia = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]*)'));
  return coincidencia ? decodeURIComponent(coincidencia[1]) : null;
}

/**
 * Si la sesión actual tiene una clave de permiso concreta (`secciones.crear`,
 * `secciones.eliminar`...). Filtra primero por la cookie de rol —para no
 * consultar `/api/me` en cada visita anónima— y solo si pasa ese filtro
 * pregunta a la API, que es quien de verdad sabe las claves.
 *
 * Se revisa al montar y otra vez cada vez que la pestaña recupera el foco, no
 * solo al montar: estos botones viven en páginas públicas que la gente deja
 * abiertas en segundo plano durante días. Sin la revisión al recuperar foco,
 * una pestaña que estuvo dormida mientras la sesión caducaba seguía mostrando
 * el botón hasta que alguien la recargaba a mano — el botón no concede nada
 * por sí solo (lo vuelve a comprobar el backend al enviar), pero mostrarlo sin
 * que sirva para nada es una mala señal para quien lo ve.
 */
export function usePermisoDeSeccion(clave: string): boolean {
  const [tienePermiso, setTienePermiso] = useState(false);

  useEffect(() => {
    let vigente = true;

    const revisar = () => {
      const rol = (leerCookie(AUTH_ROLE_COOKIE_NAME) ?? '').trim().toLowerCase();
      if (!ROLES_QUE_EDITAN.includes(rol)) {
        setTienePermiso(false);
        return;
      }
      permisosDeLaSesion().then((permisos) => {
        if (vigente) setTienePermiso(permisos.includes(clave));
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
