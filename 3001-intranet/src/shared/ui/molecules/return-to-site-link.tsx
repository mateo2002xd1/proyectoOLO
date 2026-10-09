'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { SITE_URL } from '@/shared/lib/constants';

interface ReturnToSiteLinkProps {
  classPrefix: string;
  /**
   * Cierra la sesión antes de salir. Para las pantallas del primer ingreso (contraseña
   * temporal, preguntas de seguridad): esa sesión solo sirve para terminar la
   * configuración —la API le niega lo demás— y no debe sobrevivir a quien se va sin
   * terminar. Al volver a entrar, la configuración pendiente aparece otra vez.
   */
  cerrarSesion?: boolean;
}

/** Cierra la sesión de la intranet y sigue al sitio web. */
async function salirCerrandoSesion(evento: MouseEvent<HTMLAnchorElement>) {
  evento.preventDefault();
  try {
    await fetch('/api-backend/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // Sin conexión no se puede cerrar: se sale igual. Al volver, el proxy vuelve a
    // mandar a la pantalla pendiente.
  }
  window.location.href = SITE_URL;
}

export function ReturnToSiteLink({ classPrefix, cerrarSesion = false }: ReturnToSiteLinkProps) {
  return (
    <Link
      href={SITE_URL}
      onClick={cerrarSesion ? salirCerrandoSesion : undefined}
      className={`${classPrefix}-return site-return-link`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      Regresar al sitio web del Observatorio
    </Link>
  );
}
