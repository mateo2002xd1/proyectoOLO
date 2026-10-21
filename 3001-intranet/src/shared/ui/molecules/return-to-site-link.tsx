'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/20/solid';
import { SITE_URL } from '@/shared/lib/api/constants';

interface ReturnToSiteLinkProps {
  /**
   * Clases del enlace. Las pone el marco del acceso (`accesoRegresoClass` en
   * `features/login/components/acceso-ui.ts`, las medidas del sitio web); hasta el
   * 2026-10-11 eran las de `globals.css` (`.login-return`, `.fl-return`…), con medidas
   * distintas en cada pantalla.
   */
  className: string;
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

export function ReturnToSiteLink({ className, cerrarSesion = false }: ReturnToSiteLinkProps) {
  return (
    <Link
      href={SITE_URL}
      onClick={cerrarSesion ? salirCerrandoSesion : undefined}
      className={className}
    >
      {/* La casa rellena del acceso del sitio web (`BackToSiteLink`), del mismo tamaño. */}
      <HomeIcon aria-hidden="true" className="mr-2 size-5 shrink-0" />
      Regresar al sitio web del Observatorio
    </Link>
  );
}
