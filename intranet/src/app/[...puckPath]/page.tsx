import { EditButton, ClientPuckRender, obtenerPaginaPublicada } from '@/features/paginas';
import { puedeEditarPaginas } from '@/shared/lib/sesion';

/**
 * Páginas de la intranet creadas desde el editor visual.
 *
 * Recoge cualquier ruta que no tenga página propia en `app/`. Las secciones fijas
 * (`/inicio`, `/tasa`, `/matriz`, `/encuestas/*`) tienen la suya y no pasan por
 * aquí: en Next.js un segmento concreto gana al comodín.
 *
 * El contenido sale de la API, de la misma tabla `paginas` que usa el sitio pero
 * bajo `ambito='intranet'` — el cliente HTTP manda esa cabecera. Antes esto leía
 * archivos JSON sueltos del disco, un segundo sistema de edición al margen del
 * ciclo de borrador y revisión.
 */
export default async function PaginaDinamica({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath } = await params;
  const slug = puckPath.join('/');

  const [pagina, hasPermission] = await Promise.all([
    obtenerPaginaPublicada(slug),
    puedeEditarPaginas(),
  ]);

  // Sin versión aprobada no hay nada que mostrar, pero quien puede editar sí debe
  // poder entrar a crearla.
  if (!pagina) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Página no encontrada</h1>
        <p>No se ha publicado contenido para la ruta: /{slug}</p>
        <EditButton slug={slug} hasPermission={hasPermission} />
      </div>
    );
  }

  return (
    <div className="pagina-slug">
      <EditButton slug={slug} hasPermission={hasPermission} />
      <ClientPuckRender data={pagina.contenido} />
    </div>
  );
}
