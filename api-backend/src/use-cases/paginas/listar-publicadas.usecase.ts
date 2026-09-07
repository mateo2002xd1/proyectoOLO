import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';

/** Una página publicada, con lo justo para contarla y enlazarla. */
export interface PaginaPublicada {
  id: string;
  slug: string;
  titulo: string;
}

/**
 * El recuento de páginas publicadas, separado por aplicación.
 *
 * Se devuelve ya agrupado y con su total en vez de una lista plana: quien lo pinta es un
 * panel que muestra «Sitio web: 4 · Intranet: 6» y despliega el detalle debajo. Agrupar
 * en el cliente obligaría a repetir esa misma partición en cada pantalla que lo use, y a
 * mantenerla sincronizada con los valores que admite `ambito`.
 */
export interface ResumenPaginasPublicadas {
  total: number;
  sitio: PaginaPublicada[];
  intranet: PaginaPublicada[];
}

/**
 * Las páginas visibles ahora mismo en el portal y en la intranet.
 *
 * No filtra por ámbito: el panel general vive en el sitio pero resume las dos
 * aplicaciones, igual que hace `listarEnRevision`. La API es la única que sabe qué
 * está publicado de verdad — `versionPublicadaId` — y por eso el recuento sale de aquí
 * y no de contar rutas en el frontend, que solo conoce las suyas.
 */
export const listarPaginasPublicadas = async (): Promise<ResumenPaginasPublicadas> => {
  const paginas = await PaginaRepository.listarPublicadas();

  const porAmbito = (ambito: Ambito): PaginaPublicada[] =>
    paginas
      .filter((p) => p.ambito === ambito)
      .map((p) => ({ id: p.id, slug: p.slug, titulo: p.titulo }));

  const sitio = porAmbito('sitio');
  const intranet = porAmbito('intranet');

  return { total: sitio.length + intranet.length, sitio, intranet };
};
