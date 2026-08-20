import { notFound } from 'next/navigation';

/**
 * `menu-y-pie` no es una página visitable.
 *
 * Guarda la cabecera y el pie que el layout pinta alrededor de todo el sitio, no
 * contenido propio. Sin esta ruta, el comodín `[slug]` la encontraría en la base
 * y la renderizaría como si fuera una página normal: saldrían una cabecera y un
 * pie duplicados dentro del `<main>`, debajo de los de verdad.
 *
 * Para verla antes de publicarla está `/admin/preview/menu-y-pie`, que vive fuera
 * de este grupo de rutas y por tanto sin el marco alrededor.
 *
 * El slug se llamó `plantilla` hasta la migración 014; el nombre del concepto no
 * cambió, solo el valor que queda escrito en la bitácora.
 */
export default function PlantillaNoVisitable() {
  notFound();
}
