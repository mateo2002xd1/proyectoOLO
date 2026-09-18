import type { Metadata } from 'next';
import { PaginaPuckFija } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/session';

/**
 * Clasificación Nacional de Ocupaciones (CNO).
 *
 * Página de Puck con slug `cno`, servida bajo `/clasificacion/` para que quede junto
 * al buscador de ocupaciones. La traducción slug ↔ URL está en `RUTAS_PROPIAS`
 * (`features/paginas/model/rutas.ts`) y `/cno` redirige aquí
 * (`next.config.mjs`).
 */
export const metadata: Metadata = {
  title: 'Clasificación Nacional de Ocupaciones (CNO) | SENA OLO',
  description:
    'Consulte la Clasificación Nacional de Ocupaciones (CNO) en el Observatorio Laboral y Ocupacional del SENA.',
};

export default async function CnoPage() {
  return <PaginaPuckFija slug="cno" puedeEditar={await puedeEditarPaginas()} />;
}
