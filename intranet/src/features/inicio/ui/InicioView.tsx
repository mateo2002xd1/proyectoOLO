"use client";

import React, { useState, useEffect } from 'react';
import { IntranetTopbarWrapper } from '@/shared/lib/blocks/IntranetTopbarWrapper';
import { IntranetHero } from '@/shared/lib/blocks/IntranetHero';
import { IntranetFooter } from '@/shared/lib/blocks/IntranetFooter';
import { Carousel } from '@/shared/ui/organisms/Carousel';
import { RecursosVisuales } from './RecursosVisuales';

const oloLeCuentaImages = [
  '/assets/img/iniciocar1.png',
  '/assets/img/iniciocar2.png',
  '/assets/img/iniciocar3.png',
  '/assets/img/iniciocar4.png',
];

const datoOloSemanaImages = [
  '/assets/img/poster1.png',
  '/assets/img/poster2.png',
  '/assets/img/poster4.png',
];

const publicacionesData = [
  {
    id: 1,
    title: 'BOLETIN MERCADO LABORAL MAR 2026.pdf',
    pdfUrl: '/upload/BOLETIN%20MERCADO%20LABORAL%20MAR%202026.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 2,
    title: 'Guía de usuario SharePoint OLO.pdf',
    pdfUrl: '/upload/Gu%C3%ADa%20de%20usuario%20SharePoint%20OLO.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 3,
    title: 'La mujer en el Mercado Laboral Colombiano II-2025.pdf',
    pdfUrl: '/upload/La%20mujer%20en%20el%20Mercado%20Laboral%20Colombiano%20II-2025.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 4,
    title: 'Economía Popular.pdf',
    pdfUrl: '/upload/Econom%C3%ADa%20Popular.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 5,
    title: 'Catálogo de Ocp. Campesina, Familiar y Comunitaria-1.pdf',
    pdfUrl: '/upload/Cat%C3%A1logo%20de%20Ocp.%20Campesina%2C%20Familiar%20y%20Comunitaria-1.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 6,
    title: 'DICCIONARIO OLO.pdf',
    pdfUrl: '/upload/DICCIONARIO%20OLO.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
  {
    id: 7,
    title: 'VINCULACIÓN VICTIMAS II- SEM.pdf',
    pdfUrl: '/upload/VINCULACI%C3%93N%20VICTIMAS%20II-%20SEM.pdf',
    hashtag: '#OLOtecuenta',
    month: 'May',
    day: '07',
  },
];

const pdfThumbnailCache: Record<string, string> = {};

/* PDF.js se carga por <script> desde un CDN, así que no trae tipos. Se declara
   aquí la porción mínima de su API que este archivo usa, en vez de castear a
   `any` y perder toda verificación sobre una librería externa. */
interface PdfViewport {
  width: number;
  height: number;
}

interface PdfPage {
  getViewport(opts: { scale: number }): PdfViewport;
  render(opts: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }): { promise: Promise<void> };
}

interface PdfDocument {
  getPage(numero: number): Promise<PdfPage>;
}

interface PdfJsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(opts: { url: string; cMapUrl?: string; cMapPacked?: boolean }): { promise: Promise<PdfDocument> };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

async function renderPdfToDataUrl(pdfUrl: string): Promise<string | null> {
  if (pdfThumbnailCache[pdfUrl]) {
    return pdfThumbnailCache[pdfUrl];
  }

  try {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('pdf_thumb_' + pdfUrl);
      if (stored) {
        pdfThumbnailCache[pdfUrl] = stored;
        return stored;
      }
    }
  } catch {
    // Fallback if sessionStorage is disabled or full
  }

  try {
    if (!window.pdfjsLib) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PDF.js'));
        document.head.appendChild(script);
      });
    }

    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) return null;

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const unscaledViewport = page.getViewport({ scale: 1 });
    const scale = 400 / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');

    if (!context) return null;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    pdfThumbnailCache[pdfUrl] = dataUrl;

    try {
      sessionStorage.setItem('pdf_thumb_' + pdfUrl, dataUrl);
    } catch {
      // Storage quota fallback
    }

    return dataUrl;
  } catch (err) {
    console.error('Error rendering PDF thumbnail:', pdfUrl, err);
    return null;
  }
}

function PdfThumbnail({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [urlAnterior, setUrlAnterior] = useState(pdfUrl);
  const [imgSrc, setImgSrc] = useState<string | null>(pdfThumbnailCache[pdfUrl] || null);
  const [loading, setLoading] = useState(!pdfThumbnailCache[pdfUrl]);

  // Si cambia el PDF, se reinicia al valor cacheado (o a "cargando") durante el
  // render, sin esperar al efecto: así nunca se ve la miniatura del PDF anterior.
  if (pdfUrl !== urlAnterior) {
    setUrlAnterior(pdfUrl);
    setImgSrc(pdfThumbnailCache[pdfUrl] || null);
    setLoading(!pdfThumbnailCache[pdfUrl]);
  }

  useEffect(() => {
    let isMounted = true;

    // No hace falta comprobar la caché aquí: renderPdfToDataUrl ya la consulta
    // primero y devuelve el valor guardado sin volver a renderizar el PDF.
    renderPdfToDataUrl(pdfUrl).then((url) => {
      if (isMounted && url) {
        setImgSrc(url);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  if (loading || !imgSrc) {
    return (
      <div className="w-full h-full bg-[#f3f4f6] flex flex-col items-center justify-center text-gray-400 p-4 text-center">
        <svg className="w-8 h-8 mb-2 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs font-medium">Cargando PDF...</span>
      </div>
    );
  }

  return (
    // src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={title}
      draggable={false}
      className="publicaciones-card-img group-hover:scale-105 transition-transform duration-300"
    />
  );
}

function PublicacionesCarousel() {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;
  const totalItems = publicacionesData.length;

  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const prevPage = () => {
    setStartIndex((prev) => (prev - itemsPerPage + totalItems * itemsPerPage) % totalItems);
  };

  const nextPage = () => {
    setStartIndex((prev) => (prev + itemsPerPage) % totalItems);
  };

  useEffect(() => {
    publicacionesData.forEach((item) => {
      renderPdfToDataUrl(item.pdfUrl);
    });
  }, []);

  useEffect(() => {
    if (totalItems <= itemsPerPage) return;
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + itemsPerPage) % totalItems);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalItems]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const distance = dragCurrentX - dragStartX;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        prevPage();
      } else {
        nextPage();
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (Math.abs(dragCurrentX - dragStartX) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const currentSlides = [];
  for (let i = 0; i < itemsPerPage; i++) {
    currentSlides.push(publicacionesData[(startIndex + i) % totalItems]);
  }

  return (
    <div className="relative w-full max-w-[1200px] mx-auto group/carousel flex items-center justify-center px-4 md:px-8">
      <div
        className="publicaciones-container w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="publicaciones-grid animate-fade-in select-none" key={startIndex}>
          {currentSlides.map((item, index) => (
            <a
              key={`${item.id}-${index}`}
              href={item.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              draggable={false}
              className="publicaciones-card group pointer-events-auto"
            >
              <div>
                <div className="publicaciones-card-img-wrapper pointer-events-none">
                  <PdfThumbnail pdfUrl={item.pdfUrl} title={item.title} />
                </div>
                <h3 className="publicaciones-card-title">
                  {item.title}
                </h3>
                <p className="publicaciones-card-hashtag">
                  {item.hashtag}
                </p>
              </div>

              <div className="publicaciones-card-footer">
                <div className="publicaciones-date-badge">
                  <span className="publicaciones-date-month">
                    {item.month}
                  </span>
                  <span className="publicaciones-date-day">
                    {item.day}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InicioView() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col overflow-x-hidden">
      <IntranetTopbarWrapper />

      <IntranetHero />

      {/* OLO le cuenta (Carousel 1) */}
      <div className="matriz-content-container-datoolo">
        {/* h2 a la izquierda */}
        <h2>
          <strong className="font-extrabold">OLO</strong>tecuenta
        </h2>
        {/* Carrusel a la derecha */}
        <div className="w-full md:flex-1">
          <Carousel
            images={oloLeCuentaImages}
            itemsPerPage={1}
            showButtons={false}
            autoplay={true}
            autoplayInterval={4000}
          />
        </div>
      </div>

      {/* #datoOLO (Static Image) */}
      <div className="matriz-section-datoOLO w-full py-12">
        <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <h2 className="matriz-section-title text-[#041E42] font-bold mb-6">
            #dato<strong>OLO</strong>
          </h2>
          <div className="w-full">
            <img
              src="/assets/img/imginicioegresados.png"
              alt="#datoOLO - Egresados"
              className="w-full max-w-[1200px] mx-auto h-auto rounded-xl shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* #datoOLO de la semana (Carousel 2) */}
      <div className="matriz-section-white px-4 md:px-8">
        <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <h2 className="matriz-section-title text-[#041E42] font-bold mb-6">#datoOLO de la semana</h2>
          <div className="w-full px-2 md:px-6">
            <Carousel images={datoOloSemanaImages} itemsPerPage={2} />
          </div>
        </div>
      </div>

      {/* Recursos visuales (Youtube Videos) */}
      <div className="matriz-section-gray px-4 md:px-8">
        <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <h2 className="matriz-section-title text-[#041E42] font-bold mb-6">
            <strong>Recursos</strong> visuales
          </h2>
          <div className="w-full text-left px-2 md:px-6">
            <RecursosVisuales />
          </div>
        </div>
      </div>

      {/* Últimas publicaciones (Custom Cards Carousel) */}
      <div className="matriz-section-white py-12 md:py-16 px-4 md:px-8">
        <div className="matriz-content-container-wide max-w-[1200px] w-full mx-auto text-center flex flex-col items-center">
          <h2 className="matriz-section-title text-[#041E42] font-normal mb-8 text-center">
            <span className="font-extrabold">Ultimas</span> publicaciones
          </h2>
          <PublicacionesCarousel />
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      {/* Preguntas Frecuentes */}
      <div className="preguntas-section">
        <div className="matriz-content-container-wide max-w-[1200px] w-full mx-auto text-center flex flex-col items-center">
          <h2 className="preguntas-title">
            <span className="preguntas-title-bold">Preguntas</span> Frecuentes
          </h2>
          <div className="preguntas-grid">

            {/* Tarjeta 1 */}
            <div className="preguntas-card">
              <a href="AQUI_VA_LINK_1" target="_blank" rel="noopener noreferrer" className="preguntas-card-link">
                <img src="/assets/img/holderpregunta1.png" alt="Primera Conferencia 2025" className="preguntas-card-img" />
              </a>
              <div className="preguntas-card-content">
                <p className="preguntas-card-text">Ir a respuestas preguntas frecuentes 1ra conferencia OLO</p>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="preguntas-card">
              <a href="AQUI_VA_LINK_2" target="_blank" rel="noopener noreferrer" className="preguntas-card-link">
                <img src="/assets/img/holderpregunta2.png" alt="Segunda Conferencia 2025" className="preguntas-card-img" />
              </a>
              <div className="preguntas-card-content">
                <p className="preguntas-card-text">Ir a respuestas preguntas frecuentes 2da conferencia OLO</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <IntranetFooter block={{ id: 'static-footer', type: 'IntranetFooter' }} />
    </div>
  );
}
