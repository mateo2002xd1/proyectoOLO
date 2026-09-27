'use client';

import { type ReactNode } from 'react';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  navbar?: ReactNode;
  /** Navegación de abajo, para el móvil y la tablet (`shared/lib/mobile/`). */
  navegacionMobile?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Maqueta del panel: barra lateral desde `lg`; por debajo, barra superior (buscar y
 * tema) y la navegación mobile abajo, con las secciones.
 *
 * Hasta el 2026-09-27, en el móvil la barra lateral entraba deslizándose desde la
 * izquierda con el botón de hamburguesa. La navegación mobile la sustituye: deja cada
 * sección a un toque del pulgar en vez de esconderlas tras un menú.
 */
export function SidebarLayout({
  sidebar,
  navbar,
  navegacionMobile,
  children,
  className = '',
}: SidebarLayoutProps) {
  return (
    <div className={`flex h-dvh bg-white dark:bg-[#131B2E] ${className}`}>
      <div className="hidden w-72 flex-col lg:flex">{sidebar}</div>

      {/* La reserva va en la columna y no en `<main>`: así `<main>` termina encima de
          la barra y lo que tenga `sticky bottom-0` dentro se queda a la vista. */}
      <div className="navegacion-mobile-reserva flex min-w-0 flex-1 flex-col">
        {navbar && <div className="lg:hidden">{navbar}</div>}

        <main className="flex-1 overflow-y-auto bg-[#FFFFFF] dark:bg-[#131B2E]">
          {children}
        </main>
      </div>

      {navegacionMobile}
    </div>
  );
}
