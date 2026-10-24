'use client';

import { Suspense, useEffect, useId, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Paginacion } from '@/shared/ui/molecules/paginacion';
import { CampoBusquedaCapsula } from './components/campo-busqueda-capsula';
import { EncabezadoDeColumnas } from './components/encabezado-de-columnas';
import { FilaResultado } from './components/fila-resultado';
import { MaquetaEnEdicion } from './components/maqueta-en-edicion';
import { resolverColoresDeLaCapsula, resolverColoresDeLosResultados } from './lib/colores';
import { buscarEnIndiceLocal } from './lib/consulta-indice-local';
import { leerBusquedaDeLaUrl, PARAM_BUSQUEDA_SITIO } from './lib/parametro-busqueda';
import type { CargarIndice, PaginaDelIndice } from './types';

export interface ResultadosBusquedaSitioProps {
  /** Título principal de la sección de resultados */
  tituloResultados?: string;
  /** Cantidad de resultados que se visualizan por página */
  resultadosPorPagina?: number;
  /** Permite mostrar u ocultar la barra de búsqueda y refinamiento superior */
  mostrarBarraRefinamiento?: boolean;
  /** Indica si el componente está montado dentro del Editor Visual de Puck */
  esEdicion?: boolean;
  /**
   * Pide el índice de páginas publicadas. Lo inyecta `puck.config.tsx`: el bloque está en
   * `shared/` y no importa servicios de `features/`.
   */
  cargarIndice?: CargarIndice;

  // --- Colores personalizables de la barra de búsqueda superior ---
  colorBarraFondo?: string;
  colorBarraBorde?: string;
  colorBarraBordeHover?: string;
  colorBarraTexto?: string;
  colorBarraPlaceholder?: string;
  colorBarraBoton?: string;
  colorBarraIconoBoton?: string;
  colorBarraBotonLimpiar?: string;

  // --- Colores personalizables de la sección de resultados y tabla ---
  colorTitulo?: string;
  colorConteo?: string;
  colorBordeTabla?: string;
  colorCabeceraTabla?: string;
  colorTextoCabeceraTabla?: string;
  colorFilaHover?: string;
  colorBadgeFondo?: string;
  colorBadgeTexto?: string;
  colorTituloResultado?: string;
  colorRutaResultado?: string;
  colorTextoResultado?: string;
  colorResaltado?: string;
  colorTextoResaltado?: string;
}

type PropiedadesDeConfiguracion = Omit<ResultadosBusquedaSitioProps, 'cargarIndice'>;

interface ListaDeResultadosProps extends PropiedadesDeConfiguracion {
  busqueda: string;
  indice: PaginaDelIndice[];
  cargando: boolean;
}

/**
 * La barra de refinamiento, el conteo y la tabla de resultados de una búsqueda.
 *
 * Quien la monta le pone `key={busqueda}`: al cambiar la búsqueda de la URL se vuelve a
 * montar y el campo y la página actual empiezan de cero, sin un efecto que copie un estado
 * a otro (`react-hooks/set-state-in-effect`).
 */
function ListaDeResultados({
  busqueda,
  indice,
  cargando,
  tituloResultados = 'Resultados de Búsqueda',
  resultadosPorPagina = 10,
  mostrarBarraRefinamiento = true,
  esEdicion = false,
  ...coloresElegidos
}: ListaDeResultadosProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '';

  const [terminoRefinado, setTerminoRefinado] = useState(busqueda);
  const [paginaActual, setPaginaActual] = useState(1);

  const idDelCampo = `resultados-buscador-${useId().replace(/:/g, '')}`;

  const coloresDeLaBarra = resolverColoresDeLaCapsula({
    fondo: coloresElegidos.colorBarraFondo,
    borde: coloresElegidos.colorBarraBorde,
    bordeHover: coloresElegidos.colorBarraBordeHover,
    texto: coloresElegidos.colorBarraTexto,
    placeholder: coloresElegidos.colorBarraPlaceholder,
    boton: coloresElegidos.colorBarraBoton,
    iconoBoton: coloresElegidos.colorBarraIconoBoton,
    botonLimpiar: coloresElegidos.colorBarraBotonLimpiar,
  });
  const colores = resolverColoresDeLosResultados({
    titulo: coloresElegidos.colorTitulo,
    conteo: coloresElegidos.colorConteo,
    bordeTabla: coloresElegidos.colorBordeTabla,
    cabeceraTabla: coloresElegidos.colorCabeceraTabla,
    textoCabeceraTabla: coloresElegidos.colorTextoCabeceraTabla,
    filaHover: coloresElegidos.colorFilaHover,
    badgeFondo: coloresElegidos.colorBadgeFondo,
    badgeTexto: coloresElegidos.colorBadgeTexto,
    tituloResultado: coloresElegidos.colorTituloResultado,
    rutaResultado: coloresElegidos.colorRutaResultado,
    textoResultado: coloresElegidos.colorTextoResultado,
    resaltado: coloresElegidos.colorResaltado,
    textoResaltado: coloresElegidos.colorTextoResaltado,
  });

  // Sin resultados de la propia página: la búsqueda no la ofrece como resultado de sí misma.
  const resultados = useMemo(
    () => buscarEnIndiceLocal(indice, busqueda, pathname),
    [indice, busqueda, pathname]
  );

  const totalResultados = resultados.length;
  const porPagina = Math.max(1, resultadosPorPagina);
  const totalPaginas = Math.max(1, Math.ceil(totalResultados / porPagina));
  // «Resultados por página» se cambia en el editor con la lista a medias: la página actual no se pasa del final.
  const paginaVisible = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaVisible - 1) * porPagina;
  const resultadosDeLaPagina = resultados.slice(inicio, inicio + porPagina);

  const hayConsulta = busqueda.length > 0;

  const alEnviarRefinamiento = (evento: FormEvent) => {
    evento.preventDefault();
    // En el editor no se navega: la URL del editor es la del borrador.
    if (esEdicion) return;
    const consulta = terminoRefinado.trim();
    router.push(consulta ? `${pathname}?${PARAM_BUSQUEDA_SITIO}=${encodeURIComponent(consulta)}` : pathname, {
      scroll: false,
    });
  };

  // Variables, no texto dentro de un `<style>`: los colores ya están validados y el CSS
  // que los usa (`hover:bg-[color:var(--olo-fila-hover)]`…) es fijo.
  const variables = {
    '--olo-fila-hover': colores.filaHover,
    '--olo-resaltado': colores.resaltado,
    '--olo-texto-resaltado': colores.textoResaltado,
  } as CSSProperties;

  return (
    <section
      aria-label="Resultados de búsqueda del sitio"
      style={variables}
      className="@container relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {mostrarBarraRefinamiento && (
        <div className="mx-auto mb-8 w-full max-w-2xl">
          <form onSubmit={alEnviarRefinamiento} role="search" aria-label="Buscar en el sitio web" className="relative w-full">
            <CampoBusquedaCapsula
              idDelCampo={idDelCampo}
              valor={terminoRefinado}
              alCambiar={setTerminoRefinado}
              alBorrar={() => setTerminoRefinado('')}
              placeholder="Buscar en el sitio web..."
              etiqueta="Buscar en el sitio web"
              etiquetaDelBoton="Buscar"
              etiquetaDeBorrar="Borrar texto"
              colores={coloresDeLaBarra}
            />
          </form>
        </div>
      )}

      {/* Una sola región viva: anuncia el estado y el número de resultados una vez. */}
      <div role="status" aria-live="polite" className="sr-only">
        {cargando
          ? 'Cargando índice de contenidos...'
          : hayConsulta
            ? `Se encontraron ${totalResultados} resultados para ${busqueda}.`
            : 'Esperando término de búsqueda.'}
      </div>

      {hayConsulta && (
        <div className="mb-4">
          {tituloResultados && (
            <h2 style={{ color: colores.titulo }} className="mb-1 text-xl font-bold sm:text-2xl">
              {tituloResultados}
            </h2>
          )}
          <p style={{ color: colores.conteo }} className="text-sm">
            {totalResultados === 1 ? '1 resultado encontrado' : `${totalResultados} resultados encontrados`} para «
            <span style={{ color: colores.tituloResultado }} className="font-medium">
              {busqueda}
            </span>
            »
          </p>
        </div>
      )}

      {esEdicion && !hayConsulta && (
        <MaquetaEnEdicion titulo={tituloResultados || 'Resultados de Búsqueda'} colores={colores} />
      )}

      {cargando && hayConsulta && (
        <p style={{ color: colores.conteo }} className="py-10 text-center text-sm">
          Buscando en las páginas y contenidos del sitio…
        </p>
      )}

      {!cargando && hayConsulta && totalResultados === 0 && (
        <div className="py-10 text-center">
          <p style={{ color: colores.tituloResultado }} className="text-sm font-medium">
            No hay contenidos que coincidan con «{busqueda}».
          </p>
          <p style={{ color: colores.conteo }} className="mt-1 text-sm">
            Prueba con términos más generales o verifica la ortografía de las palabras.
          </p>
        </div>
      )}

      {!cargando && hayConsulta && resultadosDeLaPagina.length > 0 && (
        <div style={{ borderColor: colores.bordeTabla }} className="overflow-hidden rounded-[16px] border">
          <EncabezadoDeColumnas colores={colores} />
          <ul style={{ borderColor: colores.bordeTabla }} className="divide-y">
            {resultadosDeLaPagina.map((resultado) => (
              <FilaResultado
                key={`${resultado.href}#${resultado.blockId ?? ''}::${resultado.text.slice(0, 40)}`}
                resultado={resultado}
                consulta={busqueda}
                colores={colores}
              />
            ))}
          </ul>
        </div>
      )}

      {!cargando && totalPaginas > 1 && (
        <div className="mt-10 border-t border-gray-200 pt-6">
          <Paginacion
            pagina={paginaVisible}
            totalPaginas={totalPaginas}
            onCambiarPagina={setPaginaActual}
            tono="publico"
            ariaLabel="Paginación de resultados de búsqueda"
          />
        </div>
      )}
    </section>
  );
}

/**
 * Lee la búsqueda de la URL, pide el índice una sola vez y pinta la lista.
 *
 * El índice se pide aquí y no en `ListaDeResultados`: cambiar la búsqueda vuelve a montar
 * la lista y no debe volver a pedirlo. El efecto solo pide datos; no copia ningún estado.
 * Sale siempre del servicio (que lo guarda cinco minutos), nunca de lo que haya guardado
 * la página: un índice guardado dentro del contenido se queda viejo y sigue mostrando
 * páginas que ya se retiraron (8-ciclo-editorial §1.2).
 */
function ContenidoResultadosBusqueda({ cargarIndice, ...configuracion }: ResultadosBusquedaSitioProps) {
  const busqueda = leerBusquedaDeLaUrl(useSearchParams());
  const [indice, setIndice] = useState<PaginaDelIndice[] | null>(null);

  useEffect(() => {
    if (!cargarIndice) return;
    let vigente = true;
    cargarIndice()
      .then((datos) => {
        if (vigente) setIndice(Array.isArray(datos) ? datos : []);
      })
      .catch(() => {
        // El servicio cae solo al índice de respaldo y no rechaza; si algún día lo hiciera,
        // la lista queda vacía y dice que no hay coincidencias.
        if (vigente) setIndice([]);
      });
    return () => {
      vigente = false;
    };
  }, [cargarIndice]);

  return (
    <ListaDeResultados
      key={busqueda}
      {...configuracion}
      busqueda={busqueda}
      indice={indice ?? []}
      cargando={cargarIndice !== undefined && indice === null}
    />
  );
}

/**
 * Bloque «Resultados de Búsqueda del Sitio». `useSearchParams` obliga a un `Suspense`
 * para que la página se pueda generar de forma estática (App Router).
 */
export function ResultadosBusquedaSitio(props: ResultadosBusquedaSitioProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center" aria-busy="true">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-[#0943B5]/20 border-t-[#0943B5]" />
          <p className="text-sm text-[#667085]">Cargando resultados de búsqueda...</p>
        </div>
      }
    >
      <ContenidoResultadosBusqueda {...props} />
    </Suspense>
  );
}
