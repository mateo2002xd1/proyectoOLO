import type { ColoresDeLosResultados } from '../lib/colores';
import { EncabezadoDeColumnas } from './encabezado-de-columnas';

/**
 * Lo que se ve en el editor mientras no hay una búsqueda: la distribución de la
 * página con huecos grises, para colocar y colorear el bloque sin tener que escribir
 * nada en la URL. En el sitio público no se pinta.
 */
export function MaquetaEnEdicion({
  titulo,
  colores,
}: {
  titulo: string;
  colores: ColoresDeLosResultados;
}) {
  return (
    <div className="space-y-4">
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <h2 style={{ color: colores.titulo }} className="text-xl font-bold sm:text-2xl">
            {titulo}
          </h2>
          <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#0943B5]">
            Maqueta en edición
          </span>
        </div>
        <p style={{ color: colores.conteo }} className="mt-1 text-sm">
          N resultados encontrados para «[término]»
        </p>
      </div>

      <div style={{ borderColor: colores.bordeTabla }} className="overflow-hidden rounded-[16px] border">
        <EncabezadoDeColumnas colores={colores} />

        <div style={{ borderColor: colores.bordeTabla }} className="divide-y">
          {[1, 2].map((hueco) => (
            <div
              key={hueco}
              style={{ borderColor: colores.bordeTabla }}
              className="grid w-full grid-cols-1 gap-3 bg-white px-4 py-3.5 @xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @xl:gap-4"
            >
              <span className="flex items-start gap-2.5">
                <span
                  style={{ backgroundColor: colores.badgeFondo, color: colores.badgeTexto }}
                  className="mt-0.5 shrink-0 rounded-[8px] px-2 py-0.5 font-mono text-[11px]"
                >
                  Página
                </span>
                <span className="w-full min-w-0 space-y-1.5">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </span>
              </span>
              <span className="min-w-0 space-y-1.5">
                <div className="h-3.5 w-full rounded bg-gray-100" />
                <div className="h-3.5 w-5/6 rounded bg-gray-100" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
