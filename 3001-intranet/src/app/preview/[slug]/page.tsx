import { notFound } from 'next/navigation';
import {
  ClientPuckRender,
  MarcoSecciones,
  obtenerVersionEditable,
  SLUG_PLANTILLA,
} from '@/features/paginas';
import { puedeEditarPaginas, cabecerasConSesion } from '@/shared/lib/sesion';
import { VigilanteSesion } from '@/shared/lib/inactividad';
import { SITE_URL } from '@/shared/lib/constants';

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
 *
 * Vive fuera de `app/(secciones)/` para poder elegir si lleva marco o no. Dentro
 * del grupo lo llevaba siempre, y previsualizar la plantilla salía con el menú y
 * el pie duplicados: los publicados que ponía el layout, y dentro los del
 * borrador que se estaba revisando.
 */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ versionId?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const versionId = query?.versionId;
  // La cola de revisión y Respaldos viven en el panel del sitio: «Volver» cruza de
  // aplicación. Con `versionId` se llega desde Respaldos; sin él, desde la cola.
  const volverA = `${SITE_URL}${versionId ? '/admin/respaldos' : '/admin/revision'}`;

  // Quien no puede ni editar ni aprobar no tiene por qué ver borradores.
  if (!(await puedeEditarPaginas())) {
    notFound();
  }

  // Si viene versionId, busca esa versión específica (por ej. respaldo archivado);
  // de lo contrario, la última versión editable para la cola de revisión.
  const version = await obtenerVersionEditable(slug, await cabecerasConSesion(), versionId);

  // El borrador de la plantilla ES el menú y el pie: rodearlo del marco los
  // pintaría dos veces y no se sabría cuál es el que se está revisando. Cualquier
  // otra sección sí va dentro, que es como se verá una vez publicada.
  const esPlantilla = slug === SLUG_PLANTILLA;
  const contenido = <ClientPuckRender data={version.contenido} />;

  return (
    <div className="preview-page">
      <div className="preview-aviso">
        <span className="preview-aviso-etiqueta">Vista previa</span>
        <span>
          /{slug} · {version.versionId ? 'versión previsualizada' : 'versión sin publicar'}
          {version.estado ? ` · ${version.estado.replace('_', ' ')}` : ''}
        </span>
        <span className="preview-aviso-nota">
          {version.estado === 'archivado'
            ? 'Esta es una versión archivada (respaldo). Puedes restaurarla desde la sección de respaldos.'
            : esPlantilla
            ? 'Así quedarán el menú y el pie en todas las secciones.'
            : 'Así quedará la página. Para publicarla, vuelve a la cola de revisión.'}
        </span>
        <a href={volverA} className="preview-aviso-volver">
          ← Volver
        </a>
      </div>

      {esPlantilla ? contenido : <MarcoSecciones>{contenido}</MarcoSecciones>}

      {/* La vista previa cuelga fuera de `(secciones)`, así que no hereda su
          vigilante. Sin `alExpirar`: aquí no hay nada que guardar, solo se mira. */}
      <VigilanteSesion />
    </div>
  );
}
