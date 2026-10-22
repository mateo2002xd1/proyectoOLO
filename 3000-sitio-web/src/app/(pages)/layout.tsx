import { Header } from '@/shared/lib/blocks/header';
import { Footer } from '@/shared/lib/blocks/footer';
import {
  buscadorDeOcupacionesActivo,
  obtenerPlantilla,
  obtenerTitulosPublicados,
  PaginasFabSpeedDial,
  RastreadorVisitas,
} from '@/features/editor';
import { RouteTransition } from '@/shared/ui/atoms/route-transition';
import { ResaltadorBusquedaClient } from '@/shared/ui/atoms/resaltador-busqueda-client';
import { BotonSubir } from '@/shared/ui/atoms/boton-subir';
import { MigasDePan } from '@/shared/ui/organisms/migas-de-pan';
import { MenuDelSitio } from '@/shared/lib/rutas-del-menu';
import { Accesibilidad } from '@/shared/lib/accesibilidad';
import { lexend } from '@/shared/lib/typography/fonts';

/**
 * Marco común de todo el sitio público: cabecera arriba, pie abajo.
 *
 * Hasta ahora los dos estaban escritos aquí a mano y la única forma de cambiar un
 * enlace del menú era tocar este archivo. Ahora se pintan con lo que guarda la
 * página `plantilla` (ver `features/editor/navegation/menu-y-pie.ts`), que se edita desde
 * el botón «Menú y pie» y se aplica a todas las páginas a la vez.
 *
 * Las acciones de administración de página (editar contenido, editar plantilla,
 * nueva página y eliminar página) se unifican en el menú flotante `PaginasFabSpeedDial`,
 * que resuelve los permisos en el cliente para mantener el renderizado estático/ISR.
 *
 * El editor, la vista previa y el panel quedan fuera: viven en `app/edit/`,
 * `app/preview/` y `app/admin/`, fuera de este grupo de rutas, y no deben llevar la
 * navegación del sitio encima. Tampoco llevan `Accesibilidad` (el botón del borde derecho
 * y su panel): sus preferencias son del sitio público (9-accesibilidad.md §0).
 *
 * `lexend.variable` define `--font-dislexia`, la letra de «Fuente dislexia».
 *
 * Las migas de pan van fijas debajo de la cabecera, fuera de lo que se edita: toman los
 * nombres del menú de la plantilla y, para lo que el menú no enlaza, el título de la página
 * en la base de datos.
 *
 * `MenuDelSitio` pone el menú al alcance de los bloques de la página, que no lo reciben:
 * los buscadores lo usan, con la página de resultados que se elige en «Menú y pie», para
 * saber a dónde llevar.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [plantilla, titulos] = await Promise.all([
    obtenerPlantilla(),
    obtenerTitulosPublicados(),
  ]);
  const buscadorActivo = await buscadorDeOcupacionesActivo(plantilla);
  const menu = plantilla.cabecera?.navLinks ?? [];

  return (
    <div className={`publico-layout min-h-dvh flex flex-col ${lexend.variable}`}>
      {plantilla.cabecera && <Header block={{ id: 'header-plantilla' }} {...plantilla.cabecera} />}
      <MigasDePan menu={menu} titulos={titulos} />
      <main className="flex-grow">
        <MenuDelSitio
          menu={menu}
          paginaDelBuscador={plantilla.cabecera?.paginaDelBuscador}
          buscadorActivo={buscadorActivo}
        >
          <RouteTransition>{children}</RouteTransition>
        </MenuDelSitio>
      </main>
      {plantilla.pie && <Footer block={{ id: 'footer-plantilla' }} {...plantilla.pie} />}

      <PaginasFabSpeedDial />
      <BotonSubir />
      <ResaltadorBusquedaClient />
      <RastreadorVisitas ambito="sitio" />
      <Accesibilidad />
    </div>
  );
}
