import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { poppins } from '@/shared/lib/fonts';
import {
  AvisoSeccionNueva,
  rutaPublicaDeSlug,
  obtenerPlantilla,
  obtenerPaginaPublicadaCacheada,
  SLUG_PLANTILLA,
  slugDeOrigen,
} from '@/features/paginas';
import { getAuthSessionSnapshot, getSessionPermissionsSnapshot } from '@/shared/lib/session';
import { EstilosDeAcciones, metadataDeIdentidad, obtenerIdentidadPanel } from '@/shared/lib/identidad-panel/servidor';
import { EditorClient } from './editor-client';

/** El icono de la pestaña, el mismo del panel (Configuración → Identidad visual). */
export function generateMetadata(): Promise<Metadata> {
  return metadataDeIdentidad();
}

/**
 * El editor visual de una página.
 *
 * Los dos filtros van en el servidor, antes de mandar nada al navegador: hasta
 * ahora toda esta pantalla era `'use client'` y sin ninguna comprobación, así que
 * cualquiera que escribiera la URL se descargaba el editor entero y solo se
 * enteraba de que no podía al intentar guardar.
 */
export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ nueva?: string; volver?: string }>;
}) {
  const [{ slug }, { nueva, volver }] = await Promise.all([params, searchParams]);

  const { hasSession, role } = await getAuthSessionSnapshot();
  if (!hasSession) {
    redirect(`/login?redirect=${encodeURIComponent(`/editor/${slug}`)}`);
  }

  // La verificación de si puede acceder al editor visual ahora se hace de forma granular abajo.

  // Verificación GRANULAR por página — el chequeo de arriba solo mira el rol, así
  // que un Editor sin la llave `editar.sitio.{slug}` de ESTA página llegaba a ver la
  // carcasa vacía del editor tecleando la URL a mano, aunque ya no pudiera cargar
  // contenido real ni guardar: eso lo rechaza la API con 403. Esto cierra esa rendija
  // en vez de dejar que la API la tape sola. Superadmin tiene el mismo bypass que en
  // el servidor (`require-permission.middleware.ts`): de lo contrario quedaría fuera
  // de una página creada por otro rol administrador, que no le concede la llave
  // automáticamente.
  if ((role ?? '').trim().toLowerCase() !== 'superadmin') {
    const { permissions } = await getSessionPermissionsSnapshot();
    if (!permissions.includes('acceso.sitio')) {
      redirect('/');
    }
    if (!permissions.includes(`editar.sitio.${slug}`)) {
      if (slug === SLUG_PLANTILLA) {
        redirect('/');
      } else {
        redirect(rutaPublicaDeSlug(slug));
      }
    }
  }

  // Contexto de solo lectura alrededor del lienzo de Puck: cabecera/pie publicados
  // al editar una sección, o la página de origen (`?volver=`) al editar la
  // plantilla. Ninguna de las dos llamadas puede lanzar (ver `obtenerPlantilla` y
  // `obtenerPaginaPublicadaCacheada`), así que el editor nunca se cae por esto.
  const esPlantilla = slug === SLUG_PLANTILLA;
  const [plantilla, paginaDeReferencia, identidad] = await Promise.all([
    esPlantilla ? Promise.resolve(null) : obtenerPlantilla(),
    esPlantilla ? obtenerPaginaPublicadaCacheada(slugDeOrigen(volver)) : Promise.resolve(null),
    obtenerIdentidadPanel(),
  ]);

  return (
    // Todo el editor en Poppins, como el panel (pedido del usuario, 2026-10-09): la
    // interfaz de Puck (pinta con `--puck-font-family`, Inter de serie, que no se carga),
    // la barra de Salir/Guardar/Enviar y sus modales. El lienzo no cambia: Puck lo dibuja
    // en un iframe y le copia las hojas de estilo, no los estilos en línea de aquí, así que
    // la página que se edita sigue con su letra. `contents`: el envoltorio no ocupa caja.
    <div
      className={poppins.className}
      style={
        {
          display: 'contents',
          '--puck-font-family': poppins.style.fontFamily,
          '--font-heading': poppins.style.fontFamily,
          '--font-body': poppins.style.fontFamily,
        } as CSSProperties
      }
    >
      {/* Los colores de Salir, Guardar borrador y Enviar a revisión (`.olo-editor-tooltip`). */}
      <EstilosDeAcciones identidad={identidad} />
      {/* Solo al venir de «Nueva página»: es donde se entrega el enlace de la ruta
          recién creada, que es lo que hay que pegar en el menú para poder llegar. */}
      {nueva === '1' && <AvisoSeccionNueva slug={slug} />}
      <EditorClient slug={slug} plantilla={plantilla} paginaDeReferencia={paginaDeReferencia} />
    </div>
  );
}
