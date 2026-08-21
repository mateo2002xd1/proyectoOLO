import { Header } from '@/shared/lib/blocks/Header';
import { Footer } from '@/shared/lib/blocks/Footer';
import {
  EliminarSeccionButton,
  NuevaSeccionButton,
  obtenerPlantilla,
  PlantillaEditButton,
} from '@/features/paginas';

/**
 * Marco común de todo el sitio público: cabecera arriba, pie abajo.
 *
 * Hasta ahora los dos estaban escritos aquí a mano y la única forma de cambiar un
 * enlace del menú era tocar este archivo. Ahora se pintan con lo que guarda la
 * página `plantilla` (ver `features/paginas/lib/plantilla.ts`), que se edita desde
 * el botón «Menú y pie» y se aplica a todas las páginas a la vez.
 *
 * Aquí NO se lee la cookie de sesión a propósito: `PlantillaEditButton` resuelve
 * su permiso en el cliente. Leerla en este layout marcaría como dinámicas todas
 * las páginas del sitio, incluidas las que no cambian nunca. El comentario largo
 * está en el propio botón.
 *
 * El editor, la vista previa y el panel quedan fuera: viven en `app/admin/`, fuera
 * de este grupo de rutas, y no deben llevar la navegación del sitio encima.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const plantilla = await obtenerPlantilla();

  return (
    <div className="publico-layout min-h-screen flex flex-col">
      {plantilla.cabecera && <Header block={{ id: 'header-plantilla' }} {...plantilla.cabecera} />}
      <main className="flex-grow">{children}</main>
      {plantilla.pie && <Footer block={{ id: 'footer-plantilla' }} />}

      <PlantillaEditButton />
      {/* Resuelve su permiso en el cliente por lo mismo que el de arriba: leerlo aquí
          volvería dinámicas todas las páginas del sitio. */}
      <NuevaSeccionButton />
      {/* Se esconde solo en las páginas de fábrica y sin el permiso: lo decide el propio
          componente, que también resuelve el permiso en cliente. */}
      <EliminarSeccionButton />
    </div>
  );
}
