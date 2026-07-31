import { notFound } from 'next/navigation';
import { ClientPuckRender, obtenerVersionEditable } from '@/features/paginas';
import { puedeEditarPaginas, cabecerasConSesion } from '@/shared/lib/sesion';

export const metadata = {
  title: 'Previsualización | Intranet',
  description: 'Vista previa de una página antes de publicarla',
};

/**
 * Vista previa de una página de la intranet antes de aprobarla.
 *
 * Existe aquí y no en el panel del sitio porque los bloques que componen estas
 * páginas —el banner de Tasa, los tableros, el visor de presentaciones— son
 * componentes de esta aplicación. El sitio no sabe dibujarlos.
 *
 * Se entra desde el botón «Ver» de la cola de revisión del panel. No hace falta
 * volver a identificarse: la sesión es la misma para las dos aplicaciones.
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Quien no puede ni editar ni aprobar no tiene por qué ver borradores.
  if (!(await puedeEditarPaginas())) {
    notFound();
  }

  // La última versión, sea cual sea su estado: es justo la que está a revisión y
  // todavía no se ve en la página real.
  const version = await obtenerVersionEditable(slug, await cabecerasConSesion());

  return (
    <div className="preview-page">
      <div className="preview-aviso">
        <span className="preview-aviso-etiqueta">Vista previa</span>
        <span>
          /{slug} · versión sin publicar
          {version.estado ? ` · ${version.estado.replace('_', ' ')}` : ''}
        </span>
        <span className="preview-aviso-nota">
          Así quedará la página. Para publicarla, vuelve a la cola de revisión.
        </span>
      </div>

      <ClientPuckRender data={version.contenido} />
    </div>
  );
}
