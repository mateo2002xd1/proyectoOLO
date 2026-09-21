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
  nombreArchivo?: string;
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
}

const cacheDeMiniaturas: Record<string, string> = {};

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
    console.error('No se pudo dibujar la portada del PDF:', pdfUrl, err);
    return null;
  }
}

function Portada({ pdfUrl, titulo }: { pdfUrl: string; titulo: string }) {
  const [urlAnterior, setUrlAnterior] = useState(pdfUrl);
  const [src, setSrc] = useState<string | null>(cacheDeMiniaturas[pdfUrl] || null);
  const [cargando, setCargando] = useState(!cacheDeMiniaturas[pdfUrl]);

  // Si cambia el PDF, se reinicia al valor cacheado (o a "cargando") durante el
  // render, sin esperar al efecto: así nunca se ve la portada del PDF anterior.
  if (pdfUrl !== urlAnterior) {
    setUrlAnterior(pdfUrl);
    setSrc(cacheDeMiniaturas[pdfUrl] || null);
    setCargando(!cacheDeMiniaturas[pdfUrl]);
  }

  useEffect(() => {
    let montado = true;
    dibujarPortada(pdfUrl).then((url) => {
      if (montado && url) {
        setSrc(url);
        setCargando(false);
      }
    });
    return () => {
      montado = false;
    };
  }, [pdfUrl]);

  if (cargando || !src) {
    return (
      <div className="w-full h-full bg-[#f3f4f6] flex flex-col items-center justify-center text-gray-400 p-4 text-center">
        <svg className="w-8 h-8 mb-2 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-xs font-medium">Cargando PDF...</span>
      </div>
    );
  }

  return (
    // src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={titulo}
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
}: PublicacionesProps) {
  const conArchivo = publicaciones.filter((publicacion) => publicacion.pdfUrl);
  const total = conArchivo.length;

  const [inicio, setInicio] = useState(0);
  const [arrastreDesde, setArrastreDesde] = useState(0);
  const [arrastreHasta, setArrastreHasta] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    conArchivo.forEach((publicacion) => {
      if (publicacion.pdfUrl) dibujarPortada(publicacion.pdfUrl);
    });
    // Basta con la lista de rutas: dibujar es idempotente y va contra caché.
  }, [conArchivo.map((publicacion) => publicacion.pdfUrl).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (total <= porPagina) return;
    const temporizador = setInterval(() => {
      setInicio((previo) => (previo + porPagina) % total);
    }, 5000);
    return () => clearInterval(temporizador);
  }, [total, porPagina]);

  if (total === 0) return null;

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
    (_, desplazamiento) => conArchivo[(inicio + desplazamiento) % total]
  );

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
        <div className="relative w-full max-w-[1200px] mx-auto group/carousel flex items-center justify-center px-4 md:px-8">
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
                <a
                  key={`${publicacion.pdfUrl}-${indice}`}
                  href={publicacion.pdfUrl}
                  download={
                    publicacion.nombreArchivo ||
                    (publicacion.pdfUrl?.includes('?nombre=')
                      ? decodeURIComponent(publicacion.pdfUrl.split('?nombre=')[1]?.split('&')[0] ?? '')
                      : '') ||
                    (typeof publicacion.titulo === 'string' && publicacion.titulo
                      ? `${publicacion.titulo.replace(/<[^>]*>/g, '').trim()}.pdf`
                      : true)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  // Un arrastre termina en un clic sobre el enlace; sin esto,
                  // pasar de página abriría además el PDF que quedó debajo.
                  onClick={(evento) => {
                    if (Math.abs(arrastreHasta - arrastreDesde) > 5) {
                      evento.preventDefault();
                      evento.stopPropagation();
                    }
                  }}
                  draggable={false}
                  className="publicaciones-card group pointer-events-auto"
                >
                  <div>
                    <div className="publicaciones-card-img-wrapper pointer-events-none">
                      <Portada pdfUrl={publicacion.pdfUrl!} titulo={typeof publicacion.titulo === 'string' ? publicacion.titulo : ''} />
                    </div>
                    <h3 className="publicaciones-card-title">{publicacion.titulo}</h3>
                    <p className="publicaciones-card-hashtag">{publicacion.etiqueta}</p>
                  </div>

                  <div className="publicaciones-card-footer">
                    <div className="publicaciones-date-badge">
                      <span className="publicaciones-date-month">{publicacion.mes}</span>
                      <span className="publicaciones-date-day">{publicacion.dia}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
