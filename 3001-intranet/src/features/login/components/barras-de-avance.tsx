import { accesoHuecoClass } from './acceso-ui';

/**
 * El avance de «pregunta n de 3» en las preguntas de seguridad, en blanco sobre el azul.
 * Solo decorativo: el número lo dice la etiqueta de la pregunta.
 *
 * Dos estilos, los mismos que `AuthProgressDots` del sitio web:
 * - `puntos` (verificar la identidad en la recuperación): la actual, una píldora; las ya
 *   respondidas, puntos medio atenuados; las que faltan, más atenuados. Es el diseño de la
 *   intranet que el usuario pidió llevar también al sitio (2026-10-11).
 * - `barras` (primer ingreso): todas del mismo ancho, la actual entera.
 */
export function BarrasDeAvance({
  total,
  actual,
  variante = 'barras',
}: {
  total: number;
  actual: number;
  variante?: 'barras' | 'puntos';
}) {
  return (
    <div className={`flex justify-center ${variante === 'puntos' ? 'gap-1.5' : 'gap-2'} ${accesoHuecoClass}`} aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => {
        const clase =
          variante === 'puntos'
            ? i === actual
              ? 'w-6 bg-white'
              : i < actual
                ? 'w-1.5 bg-white/55'
                : 'w-1.5 bg-white/25'
            : `w-8 ${i === actual ? 'bg-white' : 'bg-white/30'}`;
        return <span key={i} className={`h-1.5 rounded-full transition-all ${clase}`} />;
      })}
    </div>
  );
}
