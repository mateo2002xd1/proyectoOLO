import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
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
      {/* La barra de la vista previa del sitio web, igual (pedido del usuario, 2026-10-15):
          la etiqueta «Vista previa» y «Volver». Antes era un aviso ámbar propio con la ruta,
          el estado y una nota. El azul va escrito (`#1face3`, el `brand-blue` del sitio)
          porque la intranet no tiene ese token. Fondo opaco (el azul mezclado con blanco, no
          `/10`): la barra es fija y la página pasa por debajo al bajar. La etiqueta va en azul
          oscuro y no en blanco: sobre el azul, el blanco da 2,6:1 y el `#0d1526`, 7:1. */}
      <div className="sticky top-0 z-[200] flex items-center border-b border-[#1face3]/40 bg-[color-mix(in_srgb,#1face3_12%,white)] px-4 py-1.5 lg:px-8">
        <span className="rounded-full bg-[#1face3] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0d1526]">
          Vista previa
        </span>
        {/* `<a>` y no `Link`: la cola de revisión y Respaldos están en el sitio web. */}
        <a
          href={volverA}
          className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-[16px] px-3 text-sm font-semibold text-[#0d1526] transition-colors hover:bg-[#1face3]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Volver
        </a>
      </div>

      {esPlantilla ? contenido : <MarcoSecciones>{contenido}</MarcoSecciones>}

      {/* La vista previa cuelga fuera de `(secciones)`, así que no hereda su
          vigilante. Sin `alExpirar`: aquí no hay nada que guardar, solo se mira. */}
      <VigilanteSesion />
    </div>
  );
}
