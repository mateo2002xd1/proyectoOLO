'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRutaDelBuscador } from '@/shared/lib/rutas-del-menu';
import { urlDeBusqueda } from '../lib/destino-de-busqueda';

/**
 * Lo que hace el formulario de búsqueda: llevar a la página de resultados con la consulta
 * en la URL (`{página}?buscar=…`). Los resultados no se abren en un diálogo, son la
 * página, y por eso se pueden enlazar, recargar y recorrer con «atrás».
 *
 * Esa página es la que se elige en «Menú y pie» (`useRutaDelBuscador`), ya con su ruta de
 * verdad para ir directo a ella (una redirección perdería la consulta). Da igual dónde esté
 * el buscador: todos llevan a la misma página, **en la misma pestaña**. Si no se eligió
 * ninguna, los resultados salen en la página donde se busca.
 *
 * Con `esEdicion` no navega: en el editor, salir de la página con una búsqueda dejaría sin
 * guardar lo que se estaba escribiendo. Al cambiar de página se sube al inicio; en la misma
 * no: el foco pasa al encabezado de los resultados (`ConsultaOcupaciones`) y ahí se queda
 * la vista.
 */
export function useBuscarEnPagina(esEdicion = false) {
  const router = useRouter();
  const ruta = usePathname();
  const pagina = useRutaDelBuscador();
  const enOtraPagina = Boolean(pagina) && pagina !== ruta;

  const buscar = useCallback(
    (termino: string) => {
      const texto = termino.trim();
      if (esEdicion || !texto) return;

      router.push(urlDeBusqueda(pagina || ruta, texto), { scroll: enOtraPagina });
    },
    [pagina, enOtraPagina, esEdicion, router, ruta],
  );

  return { buscar };
}
