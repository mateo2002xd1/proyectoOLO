import { GooLoader } from '@/shared/ui/atoms/goo-loader';

interface CargandoSeccionProps {
  label?: string;
  /** Clases extra del contenedor (p. ej. otro alto mínimo dentro de una tabla). */
  className?: string;
}

/**
 * Loader de las secciones del panel: el mismo GooLoader del editor y la intranet,
 * centrado en el área de contenido. No usa `min-h-screen` ni un overlay fijo: el
 * panel ya descuenta la barra superior y lateral, así que ocupar la pantalla
 * entera empujaba la animación fuera del recuadro visible y se veía cortada.
 *
 * Por defecto cubre el 100 % del ancho y del alto de `<main>` (`absolute inset-0`;
 * `<main>` es `relative` en `sidebar-layout.tsx`) y queda en su centro. Con
 * `min-h-[60vh]` se dibujaba arriba del área y se veía alto. Sirve porque la
 * transición entre rutas anima `margin-top` y no `transform`: un `transform` haría de
 * su contenedor, sin alto, el bloque de referencia. Dentro de una tabla o tarjeta se
 * pasa `className` (p. ej. `min-h-[40vh]`) y se queda en el flujo.
 */
export function CargandoSeccion({ label = 'Cargando...', className = 'absolute inset-0' }: CargandoSeccionProps) {
  return (
    <div role="status" aria-live="polite" className={`flex w-full items-center justify-center py-8 ${className}`}>
      <GooLoader label={label} />
    </div>
  );
}
