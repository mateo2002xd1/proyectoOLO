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

        {/* `relative` no es decorativo: `.sr-only` es `position: absolute` y, sin un
            ancestro posicionado, su bloque contenedor era `<body>`. Al no ser `<main>`
            quien lo contiene, su `overflow-y: auto` no lo recortaba: cada etiqueta
            invisible de las que hay repartidas por el panel se quedaba en su posición
            estática —abajo del todo del contenido— y estiraba el alto del documento.
            Resultado: la ventana entera hacía scroll y aparecía una franja blanca bajo
            el panel. Medido el 2026-10-03 en `/admin/actualizaciones`: 1.306 px de
            documento para 784 px de ventana; con `relative`, 784. */}
        <main className="relative flex-1 overflow-y-auto bg-[#FFFFFF] dark:bg-[#131B2E]">
          {children}
        </main>
      </div>

      {navegacionMobile}
    </div>
  );
}
