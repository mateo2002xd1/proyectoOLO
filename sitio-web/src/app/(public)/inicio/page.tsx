import type { Metadata } from 'next';
import { InicioView } from '@/features/sitio-web/inicio';
import { EditButton, obtenerPaginaInicio } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/session';

/**
 * La portada, también accesible en `/inicio`.
 *
 * El contenido es el mismo que el de `/` —ambas leen el slug `inicio`—, así que
 * esto es contenido duplicado para un buscador. La canónica es `/`: es la que
 * enlaza el logo de la cabecera y la que devuelve `rutaPublicaDeSlug('inicio')`.
 *
 * Existe porque el slug se llama `inicio` y escribir esa URL a mano es lo natural
 * cuando vienes de la intranet, donde la portada sí vive en `/inicio`. Un segmento
 * estático gana al comodín `[slug]`, así que esta ruta deja de resolverse por el
 * catch-all, que habría dado 404 al no encontrar una página con ese slug propio.
 */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function InicioPage() {
  const [data, puedeEditar] = await Promise.all([
    obtenerPaginaInicio(),
    puedeEditarPaginas(),
  ]);

  return (
    <>
      <EditButton slug="inicio" hasPermission={puedeEditar} volverA="/inicio" />
      <InicioView data={data} />
    </>
  );
}
