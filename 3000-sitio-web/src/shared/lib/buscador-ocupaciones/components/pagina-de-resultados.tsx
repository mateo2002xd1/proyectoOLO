'use client';

import { Suspense } from 'react';
import { useBuscadorActivo } from '@/shared/lib/rutas-del-menu';
import { ConsultaOcupaciones } from './consulta-ocupaciones';

const AVISO =
  'rounded-[10px] border border-[#F79009] bg-[#FFFAEB] px-4 py-3 text-sm text-[#93370D]';

/**
 * La página de resultados del buscador de ocupaciones: lo que se ve al llegar con
 * `?buscar=…` (la lista) o `?buscar=…&ocupacion=…` (la ficha), sin el banner de búsqueda.
 *
 * Es el bloque `ResultadosOcupaciones` de Puck. Existe aparte de `BuscadorOcupacionesView`
 * para que quien edite pueda tener el buscador en una página (la de CNO) y los resultados en
 * otra, la que se elige en «Menú y pie»: así ningún banner depende de que la lista salga en
 * la misma página, y quitar uno no apaga el otro.
 *
 * Sin consulta en la URL pinta una frase que manda a buscar. Es el interruptor de todo el
 * buscador igual que `BuscadorOcupacionesView` (`activo`; ver
 * `features/editor/navegation/buscador-ocupaciones.ts`): apagado, quien llega con un enlace
 * viejo ve un aviso. Dentro del editor no hay consulta que pintar: se ve una nota de lo que
 * hará el bloque.
 */
export function PaginaDeResultadosOcupaciones({
  esEdicion = false,
  activo = true,
}: { esEdicion?: boolean; activo?: boolean } = {}) {
  const buscadorActivo = useBuscadorActivo();

  if (esEdicion) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        {!activo && (
          <p className={AVISO}>
            El buscador está apagado: en el sitio no se ven los buscadores de ocupaciones ni se
            consulta el catálogo. Cámbialo a «Activo» para volver a usarlo.
          </p>
        )}
        <p className="rounded-[10px] border border-dashed border-[#98A2B3] px-4 py-6 text-center text-sm text-[#475467]">
          Aquí se muestran los resultados de la búsqueda (la lista y la ficha de cada ocupación) de
          quien llega con <strong>?buscar=…</strong> en la dirección.
        </p>
      </div>
    );
  }

  if (!buscadorActivo) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p role="status" className="text-base text-[#344054]">
          El buscador de ocupaciones no está disponible.
        </p>
      </div>
    );
  }

  return (
    // `useSearchParams` obliga a una frontera de Suspense en una página que se genera de antemano.
    <Suspense fallback={null}>
      <ConsultaOcupaciones
        sinConsulta={
          <p className="text-base text-[#344054]">
            No hay ninguna búsqueda. Usa el buscador de ocupaciones para consultar el catálogo.
          </p>
        }
      />
    </Suspense>
  );
}
