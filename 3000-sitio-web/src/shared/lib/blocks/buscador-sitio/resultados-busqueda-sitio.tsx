'use client';

import React, { Suspense, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { resaltarCoincidenciaTexto } from '@olo/blocks-renderer';
import { obtenerIndiceBusqueda, type PaginaIndiceBusqueda, type ResultadoBusqueda } from '@/features/editor';
import { buscarEnIndiceLocal, esMismaPagina } from './lib/consulta-indice-local';

import { PARAM_BUSQUEDA_SITIO } from './hooks/use-navegacion-busqueda';

function IconoLupa() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="m17.5 17.5-3.6-3.6m1.6-4.4a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Verde institucional sobre fondo claro: idéntico al componente de resultados CNO */
const CLASE_RESALTADO = 'rounded bg-[#7DB828]/30 px-0.5 text-[#001631]';

export interface ResultadosBusquedaSitioProps {
  /** Identificador único inyectado por Puck para operaciones de estado */
  id?: string;
  /** Título principal de la sección de resultados */
  tituloResultados?: string;
  /** Cantidad de resultados que se visualizan por página */
  resultadosPorPagina?: number;
  /** Permite mostrar u ocultar la barra de búsqueda y refinamiento superior */
  mostrarBarraRefinamiento?: boolean;
  /** Datos pre-cargados del índice de páginas (ej. desde resolveData de Puck) */
  paginas?: PaginaIndiceBusqueda[];
  /** Indica si el componente está montado dentro del Editor Visual de Puck */
  esEdicion?: boolean;

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
  colorPaginacionActiva?: string;
}

/**
 * Componente interno que lee los search params de Next.js.
 * Encapsulado dentro de un Suspense Boundary para cumplir con Next.js App Router.
 */
function ContenidoResultadosBusqueda({
  id,
  tituloResultados = 'Resultados de Búsqueda',
  resultadosPorPagina = 10,
  mostrarBarraRefinamiento = true,
  paginas: paginasIniciales,
  esEdicion = false,
  colorBarraFondo,
  colorBarraBorde,
  colorBarraBordeHover,
  colorBarraTexto,
  colorBarraPlaceholder,
  colorBarraBoton,
  colorBarraIconoBoton,
  colorBarraBotonLimpiar,
  colorTitulo,
  colorConteo,
  colorBordeTabla,
  colorCabeceraTabla,
  colorTextoCabeceraTabla,
  colorFilaHover,
  colorBadgeFondo,
  colorBadgeTexto,
  colorTituloResultado,
  colorRutaResultado,
  colorTextoResultado,
  colorResaltado,
  colorTextoResaltado,
  colorPaginacionActiva,
}: ResultadosBusquedaSitioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lee el parámetro desacoplado 'busqueda' o 'q' del sitio web, con fallback seguro a 'buscar' solo si no es consulta CNO
  const busquedaParam = (
    searchParams.get(PARAM_BUSQUEDA_SITIO) ||
    searchParams.get('busqueda') ||
    searchParams.get('q') ||
    searchParams.get('buscar-sitio') ||
    (!searchParams.has('ocupacion') ? searchParams.get('buscar') || '' : '')
  ).trim();

  const [terminoRefinado, setTerminoRefinado] = useState(busquedaParam);
  const [indiceLocal, setIndiceLocal] = useState<PaginaIndiceBusqueda[]>(paginasIniciales || []);
  const [cargandoIndice, setCargandoIndice] = useState(!paginasIniciales || paginasIniciales.length === 0);
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados de interacción visual para la barra de búsqueda
  const [barraHover, setBarraHover] = useState(false);
  const [barraEnfocada, setBarraEnfocada] = useState(false);
  const [hoverBotonBarra, setHoverBotonBarra] = useState(false);

  const rawId = useId();
  const scopeId = rawId.replace(/:/g, '');
  const inputId = `resultados-buscador-${scopeId}`;
  const tableScopeClass = `olo-resultados-${scopeId}`;

  // Valores de color resueltos con fallbacks seguros institucionales
  const barraFondoEfectivo = colorBarraFondo || '#ffffff';
  const barraBordeEfectivo = colorBarraBorde || '#d1d5db';
  const barraBordeHoverEfectivo = colorBarraBordeHover || '#7DB828';
  const barraTextoEfectivo = colorBarraTexto || '#111111';
  const barraPlaceholderEfectivo = colorBarraPlaceholder || '#4b5563';
  const barraBotonEfectivo = colorBarraBoton || '#001631';
  const barraIconoBotonEfectivo = colorBarraIconoBoton || '#ffffff';
  const barraLimpiarEfectivo = colorBarraBotonLimpiar || '#667085';

  const tituloEfectivo = colorTitulo || '#001631';
  const conteoEfectivo = colorConteo || '#667085';
  const bordeTablaEfectivo = colorBordeTabla || '#eaecf0';
  const cabeceraTablaEfectivo = colorCabeceraTabla || '#f8f9fa';
  const textoCabeceraTablaEfectivo = colorTextoCabeceraTabla || '#667085';
  const filaHoverEfectivo = colorFilaHover || '#f8f9fa';
  const badgeFondoEfectivo = colorBadgeFondo || '#001631';
  const badgeTextoEfectivo = colorBadgeTexto || '#ffffff';
  const tituloResultadoEfectivo = colorTituloResultado || '#344054';
  const rutaResultadoEfectivo = colorRutaResultado || '#98a2b3';
  const textoResultadoEfectivo = colorTextoResultado || '#667085';
  const resaltadoEfectivo = colorResaltado || 'rgba(125, 184, 40, 0.3)';
  const textoResaltadoEfectivo = colorTextoResaltado || '#001631';
  const paginacionActivaEfectivo = colorPaginacionActiva || '#0943B5';

  // Sincronizar el input de refinamiento cuando cambie la URL
  useEffect(() => {
    setTerminoRefinado(busquedaParam);
    setPaginaActual(1);
  }, [busquedaParam]);

  // Si no llegaron páginas iniciales por props, cargar el índice local en el cliente
  useEffect(() => {
    if (paginasIniciales && paginasIniciales.length > 0) {
      setIndiceLocal(paginasIniciales);
      setCargandoIndice(false);
      return;
    }

    let activo = true;
    setCargandoIndice(true);
    obtenerIndiceBusqueda()
      .then((datos) => {
        if (activo && Array.isArray(datos)) {
          setIndiceLocal(datos);
        }
      })
      .catch((err) => {
        console.warn('Error al cargar índice de búsqueda en ResultadosBusquedaSitio:', err);
      })
      .finally(() => {
        if (activo) setCargandoIndice(false);
      });

    return () => {
      activo = false;
    };
  }, [paginasIniciales]);

  // Detección dinámica y contextual de la ruta actual donde está montado el componente
  const rutaActual = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  // Ejecución de la búsqueda difusa local excluyendo dinámicamente la página actual
  const resultados = buscarEnIndiceLocal(indiceLocal, busquedaParam, rutaActual);

  // Filtro de seguridad adicional para garantizar que ningún resultado pertenezca a la página donde se está parado
  const resultadosFiltrados = rutaActual
    ? resultados.filter((item) => !esMismaPagina(item.href, rutaActual))
    : resultados;

  // Manejador del formulario de refinamiento
  const handleRefinarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = terminoRefinado.trim();
    if (esEdicion) {
      // En modo editor evitamos empujar a la URL para no perder el borrador de Puck
      return;
    }
    if (query) {
      router.push(`${pathname}?${PARAM_BUSQUEDA_SITIO}=${encodeURIComponent(query)}`, { scroll: false });
    } else {
      router.push(pathname, { scroll: false });
    }
  };

  // Paginación calculada sobre los resultados que no pertenecen a la propia página
  const totalResultados = resultadosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalResultados / resultadosPorPagina));
  const indiceInicio = (paginaActual - 1) * resultadosPorPagina;
  const resultadosPaginados = resultadosFiltrados.slice(indiceInicio, indiceInicio + resultadosPorPagina);

  const hayConsulta = busquedaParam.length > 0;

  return (
    <section
      aria-label="Resultados de búsqueda del sitio"
      className={`relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${tableScopeClass}`}
    >
      {/* Estilos dinámicos para placeholder, hover de filas y resaltado exacto */}
      <style>{`
        #${inputId}::placeholder {
          color: ${barraPlaceholderEfectivo} !important;
          opacity: 1;
        }
        .${tableScopeClass} .olo-resultado-fila:hover,
        .${tableScopeClass} .olo-resultado-fila:focus-visible {
          background-color: ${filaHoverEfectivo} !important;
        }
        .${tableScopeClass} mark.olo-resaltado-marca {
          background-color: ${resaltadoEfectivo} !important;
          color: ${textoResaltadoEfectivo} !important;
        }
      `}</style>

      {/* Barra de búsqueda superior */}
      {mostrarBarraRefinamiento && (
        <div className="mb-8 w-full max-w-2xl mx-auto">
          <form
            onSubmit={handleRefinarSubmit}
            role="search"
            aria-label="Buscar en el sitio web"
            className="relative w-full"
          >
            <div
              onMouseEnter={() => setBarraHover(true)}
              onMouseLeave={() => setBarraHover(false)}
              style={{
                backgroundColor: barraFondoEfectivo,
                borderColor: (barraEnfocada || barraHover)
                  ? barraBordeHoverEfectivo
                  : barraBordeEfectivo,
                boxShadow: barraEnfocada
                  ? `0 0 0 2px ${barraBordeHoverEfectivo}, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                  : undefined,
              }}
              className="group relative flex items-center w-full rounded-[12px] border transition-all shadow-sm"
            >
              <label htmlFor={inputId} className="sr-only">
                Buscar en el sitio web
              </label>
              <input
                id={inputId}
                type="search"
                value={terminoRefinado}
                onChange={(e) => setTerminoRefinado(e.target.value)}
                onFocus={() => setBarraEnfocada(true)}
                onBlur={() => setBarraEnfocada(false)}
                placeholder="Buscar en el sitio web..."
                style={{
                  color: barraTextoEfectivo,
                }}
                className="olo-sin-boton-limpiar w-full h-12 sm:h-[50px] pl-5 pr-20 sm:pr-24 text-sm sm:text-[15px] bg-transparent rounded-[12px] border-none outline-none focus:outline-none focus:ring-0"
              />
              {terminoRefinado && (
                <button
                  type="button"
                  onClick={() => setTerminoRefinado('')}
                  aria-label="Borrar texto"
                  style={{
                    color: barraLimpiarEfectivo,
                  }}
                  className="absolute right-12 sm:right-13 top-1/2 -translate-y-1/2 flex items-center justify-center size-7 sm:size-8 rounded-full hover:bg-gray-100/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB828]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                aria-label="Buscar"
                onMouseEnter={() => setHoverBotonBarra(true)}
                onMouseLeave={() => setHoverBotonBarra(false)}
                style={{
                  backgroundColor: barraBotonEfectivo,
                  color: barraIconoBotonEfectivo,
                  filter: hoverBotonBarra ? 'brightness(1.15)' : undefined,
                }}
                className="absolute top-1/2 right-1.5 flex size-9 sm:size-[38px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm focus-visible:ring-2 focus-visible:ring-[#7DB828] focus-visible:outline-none"
              >
                <IconoLupa />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Región viva accesible para lectores de pantalla */}
      <div role="status" aria-live="polite" className="sr-only">
        {cargandoIndice
          ? 'Cargando índice de contenidos...'
          : hayConsulta
          ? `Se encontraron ${totalResultados} resultados para ${busquedaParam}.`
          : 'Esperando término de búsqueda.'}
      </div>

      {/* Encabezado con conteo de resultados - idéntico al estilo CNO */}
      {hayConsulta && (
        <div className="mb-4">
          {tituloResultados && (
            <h2
              style={{ color: tituloEfectivo }}
              className="mb-1 text-xl font-bold sm:text-2xl"
            >
              {tituloResultados}
            </h2>
          )}
          <p
            style={{ color: conteoEfectivo }}
            className="text-sm"
            aria-live="polite"
          >
            {totalResultados === 1
              ? '1 resultado encontrado'
              : `${totalResultados} resultados encontrados`}{' '}
            para «<span style={{ color: tituloResultadoEfectivo || tituloEfectivo }} className="font-medium">{busquedaParam}</span>»
          </p>
        </div>
      )}

      {/* Maqueta visual de distribución en el Editor de Puck (idéntica a la estructura CNO) */}
      {esEdicion && !hayConsulta && (
        <div className="space-y-4">
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <h2
                style={{ color: tituloEfectivo }}
                className="text-xl font-bold sm:text-2xl"
              >
                {tituloResultados || 'Resultados de Búsqueda'}
              </h2>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0943B5]">
                Maqueta en edición
              </span>
            </div>
            <p
              style={{ color: conteoEfectivo }}
              className="mt-1 text-sm"
            >
              N resultados encontrados para «[término]»
            </p>
          </div>

          <div
            style={{ borderColor: bordeTablaEfectivo }}
            className="overflow-hidden rounded-[16px] border"
          >
            <div
              style={{
                backgroundColor: cabeceraTablaEfectivo,
              }}
              className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4 sm:px-4 sm:py-2.5"
            >
              <span
                style={{ color: textoCabeceraTablaEfectivo }}
                className="text-[11px] tracking-[0.12em] uppercase"
              >
                Página / Sección
              </span>
              <span
                style={{ color: textoCabeceraTablaEfectivo }}
                className="text-[11px] tracking-[0.12em] uppercase"
              >
                Contenido coincidente
              </span>
            </div>

            <div
              style={{ borderColor: bordeTablaEfectivo }}
              className="divide-y"
            >
              {[1, 2].map((slot) => (
                <div
                  key={slot}
                  style={{ borderColor: bordeTablaEfectivo }}
                  className="grid w-full grid-cols-1 gap-3 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4 bg-white"
                >
                  <span className="flex items-start gap-2.5">
                    <span
                      style={{
                        backgroundColor: badgeFondoEfectivo,
                        color: badgeTextoEfectivo,
                      }}
                      className="mt-0.5 shrink-0 rounded-[8px] px-2 py-0.5 font-mono text-[11px]"
                    >
                      Página
                    </span>
                    <span className="min-w-0 space-y-1.5 w-full">
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-100 rounded" />
                    </span>
                  </span>
                  <span className="min-w-0 space-y-1.5">
                    <div className="h-3.5 w-full bg-gray-100 rounded" />
                    <div className="h-3.5 w-5/6 bg-gray-100 rounded" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estado: Cargando - limpio como CNO */}
      {cargandoIndice && hayConsulta && (
        <p
          style={{ color: conteoEfectivo }}
          className="py-10 text-center text-sm"
          aria-live="polite"
        >
          Buscando en las páginas y contenidos del sitio…
        </p>
      )}

      {/* Estado: Sin coincidencias - limpio como CNO (Imagen 2) */}
      {!cargandoIndice && hayConsulta && totalResultados === 0 && (
        <div className="py-10 text-center" aria-live="polite">
          <p
            style={{ color: tituloResultadoEfectivo }}
            className="text-sm font-medium"
          >
            No hay contenidos que coincidan con «{busquedaParam}».
          </p>
          <p
            style={{ color: conteoEfectivo }}
            className="mt-1 text-sm"
          >
            Prueba con términos más generales o verifica la ortografía de las palabras.
          </p>
        </div>
      )}

      {/* Listado en tabla de resultados - idéntico a ResultadosOcupaciones (CNO) */}
      {!cargandoIndice && hayConsulta && resultadosPaginados.length > 0 && (
        <div
          style={{ borderColor: bordeTablaEfectivo }}
          className="overflow-hidden rounded-[16px] border"
        >
          {/* Encabezado de columnas: Página / Sección a la izquierda, Contenido coincidente a la derecha */}
          <div
            style={{ backgroundColor: cabeceraTablaEfectivo }}
            className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4 sm:px-4 sm:py-2.5"
          >
            <span
              style={{ color: textoCabeceraTablaEfectivo }}
              className="text-[11px] tracking-[0.12em] uppercase"
            >
              Página / Sección
            </span>
            <span
              style={{ color: textoCabeceraTablaEfectivo }}
              className="text-[11px] tracking-[0.12em] uppercase"
            >
              Contenido coincidente
            </span>
          </div>

          <ul
            style={{ borderColor: bordeTablaEfectivo }}
            className="divide-y"
          >
            {resultadosPaginados.map((item, idx) => {
              const enlaceDestino = item.blockId ? `${item.href}#${item.blockId}` : item.href;
              const badgeTipo =
                item.type === 'h1'
                  ? 'Página'
                  : item.type === 'h2'
                  ? 'Sección'
                  : 'Contenido';

              return (
                <li
                  key={`${item.href}-${idx}`}
                  style={{ borderColor: bordeTablaEfectivo }}
                >
                  <Link
                    href={enlaceDestino}
                    aria-label={`Ver ${item.context}`}
                    className="olo-resultado-fila grid w-full grid-cols-1 gap-3 px-4 py-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB828] focus-visible:ring-inset sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4"
                  >
                    <span className="flex items-start gap-2.5">
                      <span
                        style={{
                          backgroundColor: badgeFondoEfectivo,
                          color: badgeTextoEfectivo,
                        }}
                        className="mt-0.5 shrink-0 rounded-[8px] px-2 py-1 font-mono text-[11px] tabular-nums"
                      >
                        {badgeTipo}
                      </span>
                      <span className="min-w-0">
                        <span
                          style={{ color: tituloResultadoEfectivo }}
                          className="block text-sm font-medium"
                        >
                          {resaltarCoincidenciaTexto(item.context, busquedaParam, 'olo-resaltado-marca rounded px-0.5')}
                        </span>
                        <span
                          style={{ color: rutaResultadoEfectivo }}
                          className="block text-xs mt-0.5"
                        >
                          {item.href}
                        </span>
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span
                        style={{ color: rutaResultadoEfectivo }}
                        className="mb-1 block text-[11px] tracking-[0.12em] uppercase sm:hidden"
                      >
                        Contenido
                      </span>
                      <span
                        style={{ color: textoResultadoEfectivo }}
                        className="text-sm leading-relaxed line-clamp-3"
                      >
                        {resaltarCoincidenciaTexto(item.text, busquedaParam, 'olo-resaltado-marca rounded px-0.5')}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Paginación Accesible */}
      {!cargandoIndice && totalPaginas > 1 && (
        <nav
          aria-label="Paginación de resultados de búsqueda"
          className="mt-10 flex items-center justify-center space-x-2 pt-6 border-t border-gray-200"
        >
          <button
            type="button"
            onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
            disabled={paginaActual === 1}
            aria-label="Ir a la página anterior"
            className="px-4 h-10 rounded-xl text-sm font-medium border border-gray-300 text-[#344054] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Anterior
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => {
              const esActual = num === paginaActual;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPaginaActual(num)}
                  aria-label={`Página ${num}`}
                  aria-current={esActual ? 'page' : undefined}
                  style={{
                    backgroundColor: esActual ? paginacionActivaEfectivo : undefined,
                  }}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    esActual
                      ? 'text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-[#344054] hover:bg-gray-50'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
            disabled={paginaActual === totalPaginas}
            aria-label="Ir a la página siguiente"
            className="px-4 h-10 rounded-xl text-sm font-medium border border-gray-300 text-[#344054] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Siguiente
          </button>
        </nav>
      )}
    </section>
  );
}

/**
 * Bloque Modular «Resultados de Búsqueda del Sitio»
 * Encapsulado con Suspense para compatibilidad total con Server Components y Next.js App Router.
 */
export function ResultadosBusquedaSitio(props: ResultadosBusquedaSitioProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto px-4 py-16 text-center" aria-busy="true">
          <div className="inline-block w-8 h-8 border-4 border-[#0943B5]/20 border-t-[#0943B5] rounded-full animate-spin mb-4" />
          <p className="text-[#667085] text-sm">Cargando resultados de búsqueda...</p>
        </div>
      }
    >
      <ContenidoResultadosBusqueda {...props} />
    </Suspense>
  );
}
