import { GooLoader } from '@/shared/ui/atoms/goo-loader';

interface CargandoSeccionProps {
  label?: string;
  /**
   * Solo para un loader dentro de una tarjeta (p. ej. `min-h-[14rem]` en Actualizaciones):
   * queda en el flujo con ese alto. Sin `className`, llena el espacio de la sección.
   */
  className?: string;
}

/**
 * Loader de las secciones del panel: el mismo GooLoader del editor y la intranet,
 * centrado en el área de contenido. No usa `min-h-screen` ni un overlay fijo: el
 * panel ya descuenta la barra superior y lateral, así que ocupar la pantalla
 * entera empujaba la animación fuera del recuadro visible y se veía cortada.
 *
 * Por defecto llena lo que le queda a su sección dentro de `<main>`, sea cual sea el
 * encabezado o los filtros que tenga encima, y se centra ahí: lo hace la clase
 * `cargando-seccion--relleno` con la regla de `globals.css` («Loader que llena su
 * sección»), solo con CSS. Antes cada sección le daba un alto fijo (`min-h-[40vh]`) que no
 * tenía que ver con el espacio real.
 */
export function CargandoSeccion({ label = 'Cargando...', className }: CargandoSeccionProps) {
  const clase = className ?? 'cargando-seccion--relleno';
  return (
    <div role="status" aria-live="polite" className={`flex w-full items-center justify-center py-8 ${clase}`}>
      <GooLoader label={label} />
    </div>
  );
}
