'use client';

import { useState, useEffect } from 'react';
import { resaltar } from './resaltar';

/**
 * Carrusel de publicaciones en PDF con la portada como miniatura.
 *
 * Copiado de `intranet/src/shared/lib/blocks/inicio/Publicaciones.tsx`: mismo
 * componente, mismos campos y mismas clases `.publicaciones-*` (portadas al
 * global de este sitio con sus valores literales). Solo cambia el envoltorio,
 * que allí reutiliza las clases `.matriz-*` de la intranet y aquí lleva nombre
 * propio.
 *
 * NOTA: sigue siendo una lista que alguien mantiene a mano. La tabla `contenidos`
 * de la API ya está pensada para servir esta sección —la invariante I5 de
 * `11-base-de-datos.md` existe literalmente por «Últimas publicaciones»—, así que
 * lo que corresponde a futuro es que el bloque lea de ahí y esta lista quede como
 * respaldo. Mientras tanto, editable es mejor que incrustada.
 *
 * La miniatura se dibuja en el navegador con pdf.js traído de un CDN. Si el CDN no
 * responde, la tarjeta se queda con su marcador de carga y el resto de la página
 * funciona igual.
 */
export interface PublicacionItem {
  titulo?: string;
  pdfUrl?: string;
  etiqueta?: string;
  mes?: string;
  dia?: string;
}

export interface PublicacionesProps {
  block: { id: string };
  titulo?: string;
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

  return (
    // src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={titulo} draggable={false} className="publicaciones-card-img" />
  );
}

export function Publicaciones({
  block,
  titulo = '**Ultimas** publicaciones',
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
    <section className="olo-publicaciones" aria-label="Últimas publicaciones" data-block-id={block.id}>
      <div className="olo-publicaciones-inner">
        {titulo && <h2 className="olo-publicaciones-title">{resaltar(titulo)}</h2>}

        <div className="olo-publicaciones-body">
          <div
            className="publicaciones-container"
            onMouseDown={(evento) => {
              setArrastrando(true);
              setArrastreDesde(evento.clientX);
              setArrastreHasta(evento.clientX);
            }}
            onMouseMove={(evento) => arrastrando && setArrastreHasta(evento.clientX)}
            onMouseUp={soltar}
            onMouseLeave={soltar}
          >
            <div className="publicaciones-grid animate-fade-in" key={inicio}>
              {visibles.map((publicacion, indice) => (
                <a
                  key={`${publicacion.pdfUrl}-${indice}`}
                  href={publicacion.pdfUrl}
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
                  className="publicaciones-card"
                >
                  <div>
                    <div className="publicaciones-card-img-wrapper">
                      <Portada pdfUrl={publicacion.pdfUrl!} titulo={publicacion.titulo ?? ''} />
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
    </section>
  );
}
