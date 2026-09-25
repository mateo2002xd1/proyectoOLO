import type { Metadata } from 'next';
import { PaginaPuckFija } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/session';

/**
 * Clasificación Única de Ocupaciones para Colombia (CUOC).
 *
 * Página de Puck con slug `cuoc`, servida bajo `/clasificacion/` para que quede junto
 * al buscador de ocupaciones. La traducción slug ↔ URL está en `RUTAS_PROPIAS`
 * (`features/paginas/model/rutas.ts`) y `/cuoc` redirige aquí
 * (`next.config.mjs`).
 */
export const metadata: Metadata = {
  title: 'Clasificación Única de Ocupaciones para Colombia (CUOC) | SENA OLO',
  description:
    'Consulte la Clasificación Única de Ocupaciones para Colombia (CUOC) en el Observatorio Laboral y Ocupacional del SENA.',
};

export default async function CuocPage() {
  return <PaginaPuckFija slug="cuoc" puedeEditar={await puedeEditarPaginas()} />;
}
