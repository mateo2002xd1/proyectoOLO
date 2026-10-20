import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import type { IdentidadPanel } from '@/shared/lib/identidad-panel';
import { IdentidadVisualPanel } from './identidad-visual-panel';
import { PreferenciaSonidoAvisos } from './preferencia-sonido-avisos';

/**
 * Configuración del panel. Hasta el 2026-10-09 era una página «en construcción»; el sonido
 * de los avisos fue la primera preferencia (de quien lo usa, en su navegador) y la
 * identidad visual, el 2026-10-10, el primer ajuste de todo el panel.
 *
 * La identidad ocupa todo el ancho: tiene dos vistas previas lado a lado y una lista de
 * acciones que en pantallas anchas va en columnas. El sonido sigue en su ancho de lectura.
 */
export function ConfiguracionView({
  identidad,
  puedeEditarIdentidad,
}: {
  identidad: IdentidadPanel;
  puedeEditarIdentidad: boolean;
}) {
  return (
    <div className="w-full px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel titulo="Configuración" descripcion="Preferencias del panel administrativo." />

      <div className="flex flex-col gap-6">
        <IdentidadVisualPanel identidadInicial={identidad} puedeEditar={puedeEditarIdentidad} />
        <div className="max-w-2xl">
          <PreferenciaSonidoAvisos />
        </div>
      </div>
    </div>
  );
}
