import { notFound } from 'next/navigation';

/**
 * `plantilla` no es una página visitable.
 *
 * Guarda la cabecera y el pie que el layout pinta alrededor de todo el sitio, no
 * contenido propio. Sin esta ruta, el comodín `[slug]` la encontraría en la base
 * y la renderizaría como si fuera una página normal: saldrían una cabecera y un
 * pie duplicados dentro del `<main>`, debajo de los de verdad.
 *
 * Para verla antes de publicarla está `/admin/preview/plantilla`, que vive fuera
 * de este grupo de rutas y por tanto sin el marco alrededor.
 */
export default function PlantillaNoVisitable() {
  notFound();
}
