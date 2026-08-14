import { InicioView } from '@/features/sitio-web/inicio';
import { EditButton, obtenerPaginaInicio } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/session';

/**
 * La portada. Su contenido se guarda con el slug `inicio`, aunque la URL sea `/`:
 * por eso el botón de editar lleva ese slug y no el de la ruta.
 */
export default async function HomePage() {
  const [data, puedeEditar] = await Promise.all([
    obtenerPaginaInicio(),
    puedeEditarPaginas(),
  ]);

  return (
    <>
      <EditButton slug="inicio" hasPermission={puedeEditar} volverA="/" />
      <InicioView data={data} />
    </>
  );
}
