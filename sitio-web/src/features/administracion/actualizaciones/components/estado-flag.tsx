import type { CargaTendencia, CeldaTendencia } from '../types';

/**
 * Un color por estado, el mismo en toda la tarjeta de «Criterios de clasificación»: el
 * formulario, los avisos y el historial. El color nunca va solo: el flag siempre lleva su
 * texto, para quien no distingue colores y para el lector de pantalla.
 */
export type TonoEstado = 'libre' | 'curso' | 'borrador' | 'publicado' | 'error' | 'inactivo';

const TONO: Record<TonoEstado, string> = {
  libre: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  curso: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  borrador: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  publicado: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  inactivo: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};

export interface Estado {
  tono: TonoEstado;
  texto: string;
  /** Lo que no cabe en el flag (una fecha, el porqué): se ve al pasar el cursor. */
  detalle?: string;
}

export function EstadoFlag({ estado }: { estado: Estado }) {
  return (
    <span
      title={estado.detalle}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${TONO[estado.tono]}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full bg-current ${estado.tono === 'curso' ? 'animate-pulse' : ''}`}
      />
      {estado.texto}
    </span>
  );
}

const formatearFecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '';

/** Un año y periodo: si admite carga, o qué tiene. `null` es un año sin nada todavía. */
export function estadoDeCelda(celda: CeldaTendencia | null): Estado {
  switch (celda?.estadoCelda) {
    case 'procesando':
      return { tono: 'curso', texto: 'En curso' };
    case 'borrador':
      return { tono: 'borrador', texto: 'Borrador' };
    case 'publicado':
      return { tono: 'publicado', texto: 'Publicado', detalle: `Desde ${formatearFecha(celda.publicadoEn)}` };
    default:
      return { tono: 'libre', texto: 'Libre' };
  }
}

/**
 * Una carga del historial, en un solo flag: cómo terminó y qué ve hoy el sitio. Antes eran
 * dos columnas («Completada» y luego «Borrador»), que había que leer juntas.
 */
export function estadoDeCarga(carga: CargaTendencia): Estado {
  if (carga.estado === 'procesando') return { tono: 'curso', texto: `Procesando ${carga.progreso}%` };
  if (carga.estado === 'error') return { tono: 'error', texto: 'Con errores' };
  if (!carga.vigente || carga.corteId === null) {
    return { tono: 'inactivo', texto: 'Inactiva', detalle: 'Sus datos ya no están en el sitio: los reemplazó otra carga o se eliminaron' };
  }
  return carga.corteEstado === 'publicado'
    ? { tono: 'publicado', texto: 'Publicado', detalle: `Desde ${formatearFecha(carga.cortePublicadoEn)}` }
    : { tono: 'borrador', texto: 'Borrador', detalle: 'El sitio todavía no lo muestra' };
}

const miles = (n: number) => n.toLocaleString('es-CO');

/**
 * El resultado de una carga que terminó bien, desde sus números. El mensaje que guarda la
 * API repite año, periodo y «quedó en borrador», que ya dicen la fila y el flag.
 */
export function resumenDeFilas(carga: CargaTendencia): { total: string; detalle: string } | null {
  if (carga.filasNacional === null || carga.filasDepartamental === null) return null;
  return {
    total: `${miles(carga.filasNacional + carga.filasDepartamental)} filas`,
    detalle: `${miles(carga.filasNacional)} nacionales · ${miles(carga.filasDepartamental)} departamentales`,
  };
}
