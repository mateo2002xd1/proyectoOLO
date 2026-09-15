import { Header } from '@/shared/lib/blocks/Header';
import { Footer } from '@/shared/lib/blocks/Footer';
import {
  obtenerPlantilla,
  PaginasFabSpeedDial,
  RastreadorVisitas,
} from '@/features/paginas';
import { RouteTransition } from '@/shared/ui/atoms/RouteTransition';
import { ResaltadorBusquedaClient } from '@/shared/ui/atoms/ResaltadorBusquedaClient';

/**
 * Marco común de todo el sitio público: cabecera arriba, pie abajo.
 *
 * Hasta ahora los dos estaban escritos aquí a mano y la única forma de cambiar un
 * enlace del menú era tocar este archivo. Ahora se pintan con lo que guarda la
 * página `plantilla` (ver `features/paginas/lib/plantilla.ts`), que se edita desde
 * el botón «Menú y pie» y se aplica a todas las páginas a la vez.
 *
 * Las acciones de administración de página (editar contenido, editar plantilla,
 * nueva página y eliminar página) se unifican en el menú flotante `PaginasFabSpeedDial`,
 * que resuelve los permisos en el cliente para mantener el renderizado estático/ISR.
 *
 * El editor, la vista previa y el panel quedan fuera: viven en `app/admin/`, fuera
 * de este grupo de rutas, y no deben llevar la navegación del sitio encima.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const plantilla = await obtenerPlantilla();

  return (
    <div className="publico-layout min-h-screen flex flex-col">
      {plantilla.cabecera && <Header block={{ id: 'header-plantilla' }} {...plantilla.cabecera} />}
      <main className="flex-grow">
        <RouteTransition>{children}</RouteTransition>
      </main>
      {plantilla.pie && <Footer block={{ id: 'footer-plantilla' }} />}

      <PaginasFabSpeedDial />
      <ResaltadorBusquedaClient />
      <RastreadorVisitas ambito="sitio" />
    </div>
  );
}
