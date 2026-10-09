import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { PreferenciaSonidoAvisos } from './preferencia-sonido-avisos';

/**
 * Configuración del panel: preferencias de quien lo usa. Hasta el 2026-10-09 era una
 * página «en construcción»; el sonido de los avisos fue la primera.
 */
export function ConfiguracionView() {
  return (
    <div className="w-full px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel titulo="Configuración" descripcion="Preferencias del panel administrativo." />

      <div className="flex max-w-2xl flex-col gap-6">
        <PreferenciaSonidoAvisos />
      </div>
    </div>
  );
}
