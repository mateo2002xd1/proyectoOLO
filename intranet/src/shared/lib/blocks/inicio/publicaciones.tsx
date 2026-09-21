'use client';

import React, { useState, useEffect } from 'react';
import { resaltar } from '../compartidos/resaltar';

/**
 * Carrusel de publicaciones en PDF con la portada como miniatura.
 *
 * Viene de `features/inicio/ui/InicioView`, donde las siete publicaciones estaban
 * escritas dentro del componente: publicar un boletín nuevo era tocar código y
 * desplegar. Ahora son un campo `array`.
 *
 * NOTA: esto sigue siendo una lista que alguien mantiene a mano. La tabla
 * `contenidos` de la API ya está pensada para servir esta sección —la invariante
 * I5 de `11-base-de-datos.md` existe literalmente por «Últimas publicaciones»—,
 * así que lo que corresponde a futuro es que el bloque lea de ahí y esta lista
 * quede como respaldo. Mientras tanto, editable es mejor que incrustada.
 *
 * La miniatura se dibuja en el navegador con pdf.js traído de un CDN. Si el CDN
 * no responde, la tarjeta se queda con su marcador de carga y el resto de la
 * página funciona igual.
 */
export interface PublicacionItem {
  titulo?: React.ReactNode;
  pdfUrl?: string;
  etiqueta?: React.ReactNode;
  mes?: React.ReactNode;
  dia?: React.ReactNode;
}

export interface PublicacionesProps {
  titulo?: React.ReactNode;
  mostrarTitulo?: boolean;
  subtitulo?: React.ReactNode;
  mostrarSubtitulo?: boolean;
  publicaciones?: PublicacionItem[];
  porPagina?: number;
  esEdicion?: boolean;
}

const cacheDeMiniaturas: Record<string, string> = {};

/** Publicaciones demostrativas que se muestran en el lienzo de edición cuando la lista está vacía */
export const PUBLICACIONES_EJEMPLO: PublicacionItem[] = [
  {
    titulo: 'Boletín Mercado Laboral — Edición 2026',
    pdfUrl: '/storage/uploads/pdf/1567f705-93ee-4839-88b1-055c0891c69e.pdf',
    etiqueta: '#OLOtecuenta',
    mes: 'Mar',
    dia: '15',
  },
  {
    titulo: 'Catálogo de Ocupaciones Campesina y Familiar',
    pdfUrl: '/storage/uploads/pdf/4ea611c8-c6a0-47e3-b7ff-3410a2eb01c9.pdf',
    etiqueta: '#OLOtecuenta',
    mes: 'Abr',
    dia: '02',
  },
  {
    titulo: 'Diccionario Ocupacional y Metodologías OLO',
    pdfUrl: '/storage/uploads/pdf/50a120cc-1171-48c8-a9fc-03f1ddf44a34.pdf',
    etiqueta: '#OLOtecuenta',
    mes: 'May',
    dia: '07',
  },
  {
    titulo: 'Informe Economía Popular y Mercado de Trabajo',
    pdfUrl: '/storage/uploads/pdf/6baad355-af7b-41de-941f-f9b6cbdd849f.pdf',
    etiqueta: '#OLOtecuenta',
    mes: 'Jun',
    dia: '18',
  },
];

/* PDF.js se carga por <script> desde un CDN, así que no trae tipos. Se declara
   aquí la porción mínima de su API que este archivo usa, en vez de castear a
   `any` y perder toda verificación sobre una librería externa. */
interface PdfViewport {
  width: number;
  height: number;
}

interface PdfPage {
  getViewport(opts: { scale: number }): PdfViewport;
  render(opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
  }): { promise: Promise<void> };
}

interface PdfDocument {
  getPage(numero: number): Promise<PdfPage>;
}

interface PdfJsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(opts: {
    url: string;
    cMapUrl?: string;
    cMapPacked?: boolean;
  }): { promise: Promise<PdfDocument> };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

async function dibujarPortada(pdfUrl: string): Promise<string | null> {
  if (!pdfUrl) return null;
  if (cacheDeMiniaturas[pdfUrl]) return cacheDeMiniaturas[pdfUrl];

  try {
    if (typeof window !== 'undefined') {
      const guardada = sessionStorage.getItem('pdf_thumb_' + pdfUrl);
      if (guardada) {
        cacheDeMiniaturas[pdfUrl] = guardada;
        return guardada;
      }
    }
  } catch {
    // sessionStorage deshabilitado o lleno: se vuelve a dibujar y ya.
  }

  try {
    if (!window.pdfjsLib) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar PDF.js'));
        document.head.appendChild(script);
      });
    }

    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) return null;

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const documento = await pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    }).promise;

    const pagina = await documento.getPage(1);
    const sinEscalar = pagina.getViewport({ scale: 1 });
    const viewport = pagina.getViewport({ scale: 400 / sinEscalar.width });

    const lienzo = document.createElement('canvas');
    lienzo.width = viewport.width;
    lienzo.height = viewport.height;
    const contexto = lienzo.getContext('2d');
    if (!contexto) return null;

    await pagina.render({ canvasContext: contexto, viewport }).promise;

    const dataUrl = lienzo.toDataURL('image/jpeg', 0.8);
    cacheDeMiniaturas[pdfUrl] = dataUrl;

    try {
      sessionStorage.setItem('pdf_thumb_' + pdfUrl, dataUrl);
    } catch {
      // Cuota de almacenamiento agotada: la caché en memoria sigue sirviendo.
    }

    return dataUrl;
  } catch (err) {
    console.warn('No se pudo dibujar la portada del PDF:', pdfUrl, err);
    return null;
  }
}

/**
 * Portada de respaldo elegante con diseño de documento PDF cuando la miniatura
 * aún no se ha generado, no hay PDF cargado o falló la carga remota.
 */
function PortadaFallback({ titulo }: { titulo?: React.ReactNode }) {
  const textoTitulo = typeof titulo === 'string' ? titulo : 'Documento PDF';
  return (
    <div className="publicaciones-card-fallback">
      <div className="publicaciones-card-fallback-doc">
        <span className="publicaciones-card-fallback-tag">PDF</span>
        <div className="publicaciones-card-fallback-lines">
          <div className="w-[85%] h-1 bg-slate-300 rounded" />
          <div className="w-full h-1 bg-slate-200 rounded" />
          <div className="w-[70%] h-1 bg-slate-200 rounded" />
        </div>
        <svg
          className="w-5 h-5 text-[#39A900]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <span className="publicaciones-card-fallback-text" title={textoTitulo}>
        {textoTitulo}
      </span>
    </div>
  );
}

function Portada({ pdfUrl, titulo }: { pdfUrl?: string; titulo?: React.ReactNode }) {
  const [urlAnterior, setUrlAnterior] = useState(pdfUrl);
  const [src, setSrc] = useState<string | null>(pdfUrl ? cacheDeMiniaturas[pdfUrl] || null : null);
  const [cargando, setCargando] = useState(Boolean(pdfUrl && !cacheDeMiniaturas[pdfUrl]));

  // Si cambia el PDF, se reinicia al valor cacheado (o a "cargando") durante el
  // render, sin esperar al efecto: así nunca se ve la portada del PDF anterior.
  if (pdfUrl !== urlAnterior) {
    setUrlAnterior(pdfUrl);
    setSrc(pdfUrl ? cacheDeMiniaturas[pdfUrl] || null : null);
    setCargando(Boolean(pdfUrl && !cacheDeMiniaturas[pdfUrl]));
  }

  useEffect(() => {
    let montado = true;
    if (!pdfUrl) return;

    dibujarPortada(pdfUrl).then((url) => {
      if (montado) {
        if (url) setSrc(url);
        setCargando(false);
      }
    });
    return () => {
      montado = false;
    };
  }, [pdfUrl]);

  if (cargando) {
    return (
      <div className="publicaciones-card-cargando">
        <svg className="publicaciones-spinner" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Cargando PDF...</span>
      </div>
    );
  }

  if (!src) {
    return <PortadaFallback titulo={titulo} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={typeof titulo === 'string' ? titulo : 'Portada de publicación'}
      draggable={false}
      className="publicaciones-card-img group-hover:scale-105 transition-transform duration-300"
    />
  );
}

export function Publicaciones({
  titulo = '**Ultimas** publicaciones',
  mostrarTitulo = true,
  subtitulo,
  mostrarSubtitulo = true,
  publicaciones = [],
  porPagina = 4,
  esEdicion,
}: PublicacionesProps) {
  // En modo edición permitimos ver siempre la preview completa
  const enEdicion =
    esEdicion ??
    (typeof window !== 'undefined' &&
      (window.location.pathname.includes('/editor') ||
        window.location.pathname.includes('/plantilla') ||
        window.location.pathname.includes('/admin/editor') ||
        window.location.pathname.includes('/admin/plantilla')));

  const configuradas = Array.isArray(publicaciones) ? publicaciones : [];
  const validas = configuradas.filter(
    (p) => p && (p.titulo || p.pdfUrl || p.etiqueta || p.mes || p.dia)
  );

  const usarEjemplo = enEdicion && validas.length === 0;
  const listaPublicaciones = usarEjemplo
    ? PUBLICACIONES_EJEMPLO
    : enEdicion
      ? validas
      : validas.filter((p) => Boolean(p.pdfUrl));

  const total = listaPublicaciones.length;

  const [inicio, setInicio] = useState(0);
  const [arrastreDesde, setArrastreDesde] = useState(0);
  const [arrastreHasta, setArrastreHasta] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    listaPublicaciones.forEach((publicacion) => {
      if (publicacion.pdfUrl) void dibujarPortada(publicacion.pdfUrl);
    });
    // Basta con la lista de rutas: dibujar es idempotente y va contra caché.
  }, [listaPublicaciones.map((publicacion) => publicacion.pdfUrl).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  // En edición detenemos el auto-carrusel para evitar interrupciones mientras se edita
  useEffect(() => {
    if (enEdicion) return;
    if (total <= porPagina) return;
    const temporizador = setInterval(() => {
      setInicio((previo) => (previo + porPagina) % total);
    }, 5000);
    return () => clearInterval(temporizador);
  }, [total, porPagina, enEdicion]);

  // Si no estamos en edición y no hay publicaciones con archivo, no mostramos el bloque vacío en el sitio público
  if (total === 0 && !enEdicion) return null;

  const soltar = () => {
    if (!arrastrando) return;
    setArrastrando(false);
    const distancia = arrastreHasta - arrastreDesde;
    if (Math.abs(distancia) > 50) {
      setInicio((previo) =>
        distancia > 0 ? (previo - porPagina + total * porPagina) % total : (previo + porPagina) % total
      );
    }
  };

  const visibles = Array.from(
    { length: Math.min(porPagina, total) },
    (_, desplazamiento) => listaPublicaciones[(inicio + desplazamiento) % total]
  );

  const CardTag = enEdicion ? 'div' : 'a';

  return (
    <div className="matriz-section-white py-12 md:py-16 px-4 md:px-8">
      <div className="matriz-content-container-wide max-w-[1200px] w-full mx-auto text-center flex flex-col items-center">
        {mostrarTitulo && titulo && (
          <h2 className={`matriz-section-title text-[#041E42] font-normal text-center ${mostrarSubtitulo && subtitulo ? 'mb-3' : 'mb-8'}`}>
            {typeof titulo === 'string' && titulo.includes('**') ? resaltar(titulo) : titulo}
          </h2>
        )}
        {mostrarSubtitulo && subtitulo && (
          <div className="text-gray-600 mb-8 text-sm sm:text-base max-w-2xl mx-auto">
            {subtitulo}
          </div>
        )}

        {usarEjemplo && (
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-sm mx-auto">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Vista previa de ejemplo · Añade publicaciones desde el panel lateral derecho</span>
          </div>
        )}

        <div
          className="relative w-full max-w-[1200px] mx-auto group/carousel flex items-center justify-center px-4 md:px-8"
          data-puck-overlay-portal={enEdicion ? 'true' : undefined}
        >
          {total > porPagina && (
            <button
              type="button"
              aria-label="Página anterior"
              onClick={(evento) => {
                evento.stopPropagation();
                setInicio((previo) => (previo - porPagina + total * porPagina) % total);
              }}
              style={enEdicion ? { pointerEvents: 'auto' } : undefined}
              className="publicaciones-nav-btn publicaciones-nav-prev"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div
            className="publicaciones-container w-full cursor-grab active:cursor-grabbing"
            onMouseDown={(evento) => {
              setArrastrando(true);
              setArrastreDesde(evento.clientX);
              setArrastreHasta(evento.clientX);
            }}
            onMouseMove={(evento) => arrastrando && setArrastreHasta(evento.clientX)}
            onMouseUp={soltar}
            onMouseLeave={soltar}
          >
            <div className="publicaciones-grid animate-fade-in select-none" key={inicio}>
              {visibles.map((publicacion, indice) => (
                <CardTag
                  key={`${publicacion.pdfUrl || 'pub'}-${indice}`}
                  {...(!enEdicion && publicacion.pdfUrl
                    ? {
                        href: publicacion.pdfUrl,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      }
                    : {})}
                  onClick={(evento) => {
                    if (enEdicion) {
                      evento.preventDefault();
                      return;
                    }
                    if (Math.abs(arrastreHasta - arrastreDesde) > 5) {
                      evento.preventDefault();
                      evento.stopPropagation();
                    }
                  }}
                  draggable={false}
                  className={`publicaciones-card group pointer-events-auto ${enEdicion ? 'cursor-default' : ''}`}
                >
                  <div>
                    <div className="publicaciones-card-img-wrapper pointer-events-none">
                      <Portada pdfUrl={publicacion.pdfUrl} titulo={publicacion.titulo} />
                    </div>
                    <h3 className="publicaciones-card-title">
                      {publicacion.titulo || (enEdicion ? <span className="text-gray-400 italic">Título de la publicación</span> : '')}
                    </h3>
                    <p className="publicaciones-card-hashtag">
                      {publicacion.etiqueta || (enEdicion ? <span className="text-gray-300">#Etiqueta</span> : '')}
                    </p>
                  </div>

                  <div className="publicaciones-card-footer">
                    <div className="publicaciones-date-badge">
                      <span className="publicaciones-date-month">{publicacion.mes || 'PDF'}</span>
                      <span className="publicaciones-date-day">{publicacion.dia || '—'}</span>
                    </div>
                  </div>
                </CardTag>
              ))}
            </div>

            {total > porPagina && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-2">
                {Array.from({ length: Math.ceil(total / porPagina) }).map((_, paginaIdx) => {
                  const activa = Math.floor(inicio / porPagina) === paginaIdx;
                  return (
                    <button
                      key={paginaIdx}
                      type="button"
                      aria-label={`Ir a la página ${paginaIdx + 1}`}
                      onClick={(evento) => {
                        evento.stopPropagation();
                        setInicio(paginaIdx * porPagina);
                      }}
                      style={enEdicion ? { pointerEvents: 'auto' } : undefined}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activa ? 'w-8 bg-[#39A900]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {total > porPagina && (
            <button
              type="button"
              aria-label="Página siguiente"
              onClick={(evento) => {
                evento.stopPropagation();
                setInicio((previo) => (previo + porPagina) % total);
              }}
              style={enEdicion ? { pointerEvents: 'auto' } : undefined}
              className="publicaciones-nav-btn publicaciones-nav-next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
