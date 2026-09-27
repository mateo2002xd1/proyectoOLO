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
 */
export function CargandoSeccion({ label = 'Cargando...', className = 'min-h-[60vh]' }: CargandoSeccionProps) {
  return (
    <div role="status" aria-live="polite" className={`flex w-full items-center justify-center py-8 ${className}`}>
      <GooLoader label={label} />
    </div>
  );
}
