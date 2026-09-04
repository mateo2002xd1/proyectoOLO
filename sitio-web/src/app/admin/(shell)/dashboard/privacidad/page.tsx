import type { Data } from '@puckeditor/core';
import { ClientPuckRender, obtenerPaginaPublicadaCacheada } from '@/features/paginas';

/**
 * Vista de solo lectura de la política de privacidad dentro del panel.
 *
 * Lee el mismo contenido publicado que `(public)/politica-de-privacidad/page.tsx`
 * — antes ambas rutas renderizaban el mismo componente con texto hardcodeado;
 * ahora las dos leen de la CMS, así que no pueden divergir. Sin `EditButton`
 * aquí: ya está dentro del shell autenticado, y editar de verdad se hace
 * desde `/admin/editor/politica-de-privacidad`.
 */
export default async function AdminPrivacidadPage() {
  const pagina = await obtenerPaginaPublicadaCacheada('politica-de-privacidad');

  if (!pagina || !pagina.contenido) {
    return (
      <div className="space-y-6">
        <p>Esta página todavía no tiene contenido publicado.</p>
      </div>
    );
  }

  const data: Data = Array.isArray(pagina.contenido)
    ? { content: pagina.contenido, root: {} }
    : pagina.contenido;

  return (
    <div className="space-y-6">
      <ClientPuckRender data={data} />
    </div>
  );
}
