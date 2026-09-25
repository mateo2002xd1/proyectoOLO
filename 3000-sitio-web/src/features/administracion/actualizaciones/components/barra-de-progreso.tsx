'use client';

interface BarraDeProgresoProps {
  /** 0-100, tal como lo escribe el worker en `cargas_datos.progreso`. */
  progreso: number;
  filasProcesadas: number;
  filasTotales: number | null;
  /** Qué está haciendo en este momento; cada módulo tiene sus propias fases. */
  fase: string;
}

/**
 * Progreso real (no simulado) de una carga en curso: el worker de `heavy-jobs` escribe
 * `progreso`/`filasProcesadas`/`filasTotales` en `cargas_datos` a medida que avanza, y el
 * sondeo de cada tarjeta los trae aquí.
 */
export function BarraDeProgreso({ progreso, filasProcesadas, filasTotales, fase }: BarraDeProgresoProps) {
  const porcentaje = Math.min(100, Math.max(0, progreso));

  return (
    <div className="mt-3 w-full max-w-sm" aria-live="polite">
      <div className="flex items-baseline justify-between text-xs text-gray-500 dark:text-[#94a3b8]">
        <span>{fase}</span>
        <span className="font-medium text-[#001631] dark:text-[#f6f6f6]">{porcentaje}%</span>
      </div>
      <div
        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-interactive transition-[width] duration-300 ease-out"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      {filasTotales !== null && (
        <p className="mt-1 text-xs text-gray-500 dark:text-[#94a3b8]">
          {filasProcesadas.toLocaleString('es-CO')} de {filasTotales.toLocaleString('es-CO')} filas
        </p>
      )}
    </div>
  );
}
