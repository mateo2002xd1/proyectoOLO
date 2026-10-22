'use client';

import { useBuscadorActivo } from '@/shared/lib/rutas-del-menu';
import { BuscadorOcupacionesBanner } from './buscador-ocupaciones-banner';

/**
 * Buscador de ocupaciones (RF-09): banner de búsqueda y, debajo, los resultados y la
 * ficha de cada ocupación, que son parte de la página (su consulta va en la URL).
 *
 * La búsqueda en sí la aporta `BuscadorOcupacionesBanner`, que es el mismo
 * componente que usa el resto del sitio: así esta página y la portada consultan el
 * catálogo por el mismo camino.
 *
 * Se monta como el bloque `BuscadorOcupaciones` de Puck; el texto de ayuda lo pone el
 * editor. La página que lleva este bloque es la de resultados: el sitio la reconoce sola y
 * a ella llevan todos los buscadores (el de la portada, el de cualquier página).
 *
 * Es también el interruptor de todo el buscador: con `activo` en `false` el sitio no pinta
 * buscadores ni resultados y los endpoints `/api/ocupaciones` responden 404 (ver
 * `features/editor/navegation/buscador-ocupaciones.ts`). Aquí, en la página de resultados,
 * quien llega con un enlace viejo ve un aviso. Dentro del editor se sigue viendo el buscador,
 * con un aviso, para poder encenderlo otra vez.
 *
 * Las migas de pan no van aquí: las pone el layout público en todas las páginas
 * (`MigasDePan`).
 */
export function BuscadorOcupacionesView({
  ayuda = 'Ingresa un código, denominación u ocupación para consultar el catálogo CNO/CUOC.',
  esEdicion = false,
  activo = true,
}: { ayuda?: string; esEdicion?: boolean; activo?: boolean } = {}) {
  const buscadorActivo = useBuscadorActivo();

  // En el sitio manda el valor que lee el layout; en el editor, el del bloque que se edita.
  if (!esEdicion && !buscadorActivo) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p role="status" className="text-base text-[#344054]">
          El buscador de ocupaciones no está disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {esEdicion && !activo && (
        <p className="rounded-[10px] border border-[#F79009] bg-[#FFFAEB] px-4 py-3 text-sm text-[#93370D]">
          El buscador está apagado: en el sitio no se ven los buscadores de ocupaciones ni se
          consulta el catálogo. Cámbialo a «Activo» para volver a usarlo.
        </p>
      )}
      <BuscadorOcupacionesBanner esEdicion={esEdicion}>
        {ayuda && <p className="text-sm text-[#667085]">{ayuda}</p>}
      </BuscadorOcupacionesBanner>
    </div>
  );
}
