import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import { ClientPuckRender } from './client-puck-render';
import { obtenerPaginaPublicadaCacheada } from '../services/publicacion.service';
import { enlaceAlEditor, rutaPublicaDeSlug } from '../../model/rutas';

interface Props {
  slug: string;
  /**
   * Lo resuelve la página con `puedeEditarPaginas()` y no este componente: esa
   * función lee cookies con `next/headers`, y este archivo sale por el `index.ts`
   * del módulo, que también importan componentes de cliente.
   */
  puedeEditar: boolean;
}

/**
 * Una página de Puck servida desde una carpeta propia de `app/(public)/` en vez de
 * por el comodín `[slug]`.
 *
 * Se usa cuando la página necesita algo que el comodín no da: una URL anidada
 * (`/clasificacion/cno`) o su propia metadata. La carpeta pone la URL y la
 * metadata; esto pone el contenido, igual para todas: la versión publicada del
 * slug, y si no hay ninguna, un 404 para quien visita o la entrada al editor para
 * quien puede editar.
 *
 * Si la URL no es `/{slug}`, el slug tiene que estar en `RUTAS_PROPIAS`
 * (`model/rutas.ts`): si no, el botón de editar, el de eliminar y el
 * contador de visitas no la reconocen.
 */
export async function PaginaPuckFija({ slug, puedeEditar }: Props) {
  const pagina = await obtenerPaginaPublicadaCacheada(slug);
  const ruta = rutaPublicaDeSlug(slug);

  if (!pagina || !pagina.contenido) {
    if (!puedeEditar) notFound();

    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1>Esta página todavía no tiene contenido</h1>
        <p>
          No se ha publicado nada en <code>{ruta}</code>. Cuando la llenes y se apruebe,
          se verá aquí.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Link
            href={enlaceAlEditor(slug, ruta)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#002c46] rounded-full hover:bg-[#001a2a]"
          >
            Editar sección
          </Link>
        </p>
      </div>
    );
  }

  // El contenido legado se guardaba como Bloque[] plano; Puck espera { content, root }
  const data: Data = Array.isArray(pagina.contenido)
    ? { content: pagina.contenido, root: {} }
    : pagina.contenido;

  return <ClientPuckRender data={data} />;
}
