'use client';

import React, { useState, useEffect, useRef } from 'react';
import { resaltar } from '../compartidos/resaltar';

/**
 * Cinta de publicaciones que corre sola de derecha a izquierda, con una miniatura
 * por documento.
 *
 * Viene de `features/inicio/ui/InicioView`, donde las siete publicaciones estaban
 * escritas dentro del componente: publicar un boletín nuevo era tocar código y
 * desplegar. Ahora son un campo `array`. El sitio-web tiene la misma pieza
 * (`3000-sitio-web/src/shared/lib/blocks/publicaciones.tsx`) con las mismas clases
 * `.publicaciones-*`; aquí el envoltorio reutiliza las `.matriz-*` de la intranet.
 *
 * La cinta es la lista pintada dos veces en fila: cuando ha corrido una copia entera,
 * la segunda está justo donde empezó la primera y la vuelta no se ve. La copia va
 * `inert` y `aria-hidden`: el lector de pantalla y el tabulador encuentran cada
 * publicación una sola vez. Si la lista no llena el ancho, no da vueltas: queda quieta,
 * centrada y sin copia, cada publicación una vez (`useCinta`).
 *
 * Avanza sola si en el editor está «Se mueve solo: Sí» (`useMovimientoDeCinta`), y
 * se arrastra con el ratón o el dedo hacia los dos lados, ande o no. Se para con el
 * ratón encima y con el foco dentro; con «reducir movimiento» no avanza sola.
 *
 * NOTA: sigue siendo una lista que alguien mantiene a mano. La tabla `contenidos`
 * de la API ya está pensada para servir esta sección —la invariante I5 de
 * `11-base-de-datos.md` existe literalmente por «Últimas publicaciones»—, así que
 * lo que corresponde a futuro es que el bloque lea de ahí y esta lista quede como
 * respaldo. Mientras tanto, editable es mejor que incrustada.
 *
 * La miniatura es la imagen subida en «Miniatura»; sin ella, se dibuja la primera
 * página del PDF en el navegador con pdf.js, servido desde el propio origen
 * (`public/assets/pdfjs/`, ver su LEEME.txt). Si no carga, la tarjeta se queda con su
 * portada de respaldo y el resto de la página funciona igual.
 */
export interface PublicacionItem {
  /** Campo `textarea`: un salto de línea parte el título en dos renglones. */
  titulo?: React.ReactNode;
  /** Texto corto en verde sobre el nombre (lo que antes era #OLOtecuenta). */
  detalle?: React.ReactNode;
  pdfUrl?: string;
  nombreArchivo?: string;
  /** Imagen propia de la tarjeta; si falta, se usa la primera página del PDF. */
  miniatura?: string;
  /** Adónde lleva la flecha: una ruta del sitio (`/…`) o una dirección web. Vacío, al PDF. */
  url?: string;
  /** Campos `richtext` de la fecha: el mes (`ENE - MAR`, línea pequeña) y el año (`2026`, grande). */
  mes?: React.ReactNode;
  dia?: React.ReactNode;
}

export interface PublicacionesProps {
  titulo?: React.ReactNode;
  mostrarTitulo?: boolean;
  publicaciones?: PublicacionItem[];
  /** Color de fondo de la franja entera; vacío, blanco. */
  fondo?: string;
  /** Píxeles por segundo que avanza la cinta (`VELOCIDADES_CINTA`). */
  velocidad?: number;
  /** Si avanza sola; con `false` solo se mueve al arrastrarla. */
  movimiento?: boolean;
  esEdicion?: boolean;
}

/** Opciones del campo «Velocidad» del editor, en píxeles por segundo. */
export const VELOCIDADES_CINTA = [
  { label: 'Lenta', value: 25 },
  { label: 'Normal', value: 45 },
  { label: 'Rápida', value: 70 },
];

const VELOCIDAD_POR_DEFECTO = 45;

/** Ancho de una tarjeta más su hueco (20rem + 1.5rem), hasta que el navegador mida. */
const PASO_POR_DEFECTO = 344;

/**
 * Dónde está pdf.js. Es el propio origen y no un CDN: así la CSP no abre `script-src` a un
 * tercero y no hace falta comprobar la integridad de un archivo ajeno (XSS-02).
 */
const RUTA_PDFJS = '/assets/pdfjs';

const cacheDeMiniaturas: Record<string, string> = {};

/** El dibujo en marcha de cada PDF: la cinta pinta la misma tarjeta varias veces y
 *  todas esperan al mismo, en vez de descargar y dibujar el PDF una vez por copia. */
const dibujosEnCurso: Record<string, Promise<string | null>> = {};

/** Publicaciones demostrativas que se muestran en el lienzo de edición cuando la lista está vacía */
export const PUBLICACIONES_EJEMPLO: PublicacionItem[] = [
  {
    titulo: 'Nombre de la publicación',
    pdfUrl: '/storage/uploads/pdf/1567f705-93ee-4839-88b1-055c0891c69e.pdf',
    mes: 'Mes',
    dia: 'Año',
  },
  {
    titulo: 'Nombre de la publicación',
    pdfUrl: '/storage/uploads/pdf/4ea611c8-c6a0-47e3-b7ff-3410a2eb01c9.pdf',
    mes: 'Mes',
    dia: 'Año',
  },
  {
    titulo: 'Nombre de la publicación',
    pdfUrl: '/storage/uploads/pdf/50a120cc-1171-48c8-a9fc-03f1ddf44a34.pdf',
    mes: 'Mes',
    dia: 'Año',
  },
  {
    titulo: 'Nombre de la publicación',
    pdfUrl: '/storage/uploads/pdf/6baad355-af7b-41de-941f-f9b6cbdd849f.pdf',
    mes: 'Mes',
    dia: 'Año',
  },
];

/* PDF.js se carga por <script> desde `public/assets/pdfjs/`, así que no trae tipos. Se declara
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

function dibujarPortada(pdfUrl: string): Promise<string | null> {
  if (!pdfUrl) return Promise.resolve(null);
  if (cacheDeMiniaturas[pdfUrl]) return Promise.resolve(cacheDeMiniaturas[pdfUrl]);
  dibujosEnCurso[pdfUrl] ??= dibujarPortadaSinCompartir(pdfUrl).finally(() => {
    delete dibujosEnCurso[pdfUrl];
  });
  return dibujosEnCurso[pdfUrl];
}

async function dibujarPortadaSinCompartir(pdfUrl: string): Promise<string | null> {

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
        script.src = `${RUTA_PDFJS}/pdf.min.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar PDF.js'));
        document.head.appendChild(script);
      });
    }

    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) return null;

    pdfjsLib.GlobalWorkerOptions.workerSrc = `${RUTA_PDFJS}/pdf.worker.min.js`;

    const documento = await pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: `${RUTA_PDFJS}/cmaps/`,
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
 * El enlace de la flecha si es una ruta del sitio (`/…`, `#…`) o una dirección web;
 * si no —un `javascript:` colado, `//otro-sitio`—, nada. La API ya sanea los campos
 * `url` al guardar; esto cubre lo que se pinta en el editor antes de guardar.
 */
function enlaceSeguro(url?: string): string {
  const limpio = typeof url === 'string' ? url.trim() : '';
  return /^(https?:\/\/|\/(?!\/)|#)/i.test(limpio) ? limpio : '';
}

/** Solo un color hexadecimal llega al `style`; lo demás deja el blanco de la hoja. */
function colorDeFondo(fondo?: string): string | undefined {
  return typeof fondo === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(fondo.trim())
    ? fondo.trim()
    : undefined;
}

function nombreDeDescarga(publicacion: PublicacionItem): string | true {
  return (
    publicacion.nombreArchivo ||
    (publicacion.pdfUrl?.includes('?nombre=')
      ? decodeURIComponent(publicacion.pdfUrl.split('?nombre=')[1]?.split('&')[0] ?? '')
      : '') ||
    (typeof publicacion.titulo === 'string' && publicacion.titulo
      ? `${publicacion.titulo.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}.pdf`
      : true)
  );
}

/** Atributos del `<a>` de la tarjeta: el enlace si lo hay; si no, el PDF; si no, ninguno. */
function destinoDe(publicacion: PublicacionItem) {
  const url = enlaceSeguro(publicacion.url);
  if (url) {
    return /^https?:\/\//i.test(url)
      ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
      : { href: url };
  }
  if (publicacion.pdfUrl) {
    return {
      href: publicacion.pdfUrl,
      target: '_blank',
      rel: 'noopener noreferrer',
      download: nombreDeDescarga(publicacion),
    };
  }
  return null;
}

/**
 * Si la lista llena el ancho de la cinta, y cuánto mide una copia. Mide la cinta y su
 * primera tarjeta, no la ventana: el ancho de la tarjeta sale del contenedor (`cqi`).
 * No se repite la lista para rellenar: con una sola publicación, su tarjeta salía
 * repetida a todo lo ancho.
 */
function useCinta(total: number) {
  const ventana = useRef<HTMLDivElement>(null);
  const [medidas, setMedidas] = useState<{ ancho: number; paso: number } | null>(null);

  useEffect(() => {
    const elemento = ventana.current;
    if (!elemento || typeof ResizeObserver === 'undefined') return;
    const medir = () => {
      const item = elemento.querySelector<HTMLElement>('.publicaciones-cinta-item');
      if (!item?.parentElement) return;
      const hueco = parseFloat(getComputedStyle(item.parentElement).columnGap) || 0;
      const ancho = elemento.clientWidth;
      const paso = item.offsetWidth + hueco;
      setMedidas((previas) => (previas?.ancho === ancho && previas.paso === paso ? previas : { ancho, paso }));
    };
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    medir();
    return () => observador.disconnect();
  }, [total]);

  const paso = medidas?.paso || PASO_POR_DEFECTO;
  // Hasta medir se pinta sin copia: con una lista corta, nada se ve dos veces.
  const llena = Boolean(medidas && total > 0 && total * paso >= medidas.ancho);
  return { ventana, llena, anchoDeCopia: total * paso };
}

/**
 * Mueve la cinta de derecha a izquierda y deja arrastrarla con el ratón o el dedo,
 * hacia los dos lados, esté avanzando o no. La posición vive en una ref y se escribe
 * directo en el `transform` de la pista en cada cuadro: un render de React por cuadro
 * no aportaría nada. Avanza sola si `enMarcha`, sin el ratón encima, sin el foco
 * dentro y sin «reducir movimiento». Empieza en 0: la primera tarjeta, a la izquierda.
 * Sin `activa` (la lista no llena la cinta) no avanza ni se arrastra: se queda en 0.
 */
function useMovimientoDeCinta(anchoDeCopia: number, pxPorSegundo: number, enMarcha: boolean, activa: boolean) {
  const pista = useRef<HTMLDivElement>(null);
  const datos = useRef({ anchoDeCopia, pxPorSegundo, enMarcha, activa });
  const desplazamiento = useRef(0);
  const quieta = useRef(false);
  const arrastre = useRef<{ desdeX: number; desde: number; movio: boolean } | null>(null);
  const tragarClic = useRef(false);

  useEffect(() => {
    datos.current = { anchoDeCopia, pxPorSegundo, enMarcha, activa };
  }, [anchoDeCopia, pxPorSegundo, enMarcha, activa]);

  useEffect(() => {
    const reducir =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let anterior = performance.now();
    let cuadro = 0;
    const avanzar = (ahora: number) => {
      // Tope de 0,1 s: al volver a una pestaña dormida no da un salto de golpe.
      const segundos = Math.min(ahora - anterior, 100) / 1000;
      anterior = ahora;
      const { anchoDeCopia: ancho, pxPorSegundo: velocidad, enMarcha: anda, activa: daVueltas } = datos.current;
      if (!daVueltas) desplazamiento.current = 0;
      else if (anda && !reducir && !quieta.current && !arrastre.current) desplazamiento.current += velocidad * segundos;
      // Una copia es justo la mitad de la pista: dar la vuelta al recorrerla no se ve.
      if (ancho > 0) desplazamiento.current = ((desplazamiento.current % ancho) + ancho) % ancho;
      if (pista.current) pista.current.style.transform = `translate3d(${-desplazamiento.current}px, 0, 0)`;
      cuadro = requestAnimationFrame(avanzar);
    };
    cuadro = requestAnimationFrame(avanzar);
    return () => cancelAnimationFrame(cuadro);
  }, []);

  const manejadores = {
    onPointerEnter: (evento: { pointerType: string }) => {
      if (evento.pointerType === 'mouse') quieta.current = true;
    },
    onPointerLeave: (evento: { pointerType: string }) => {
      if (evento.pointerType === 'mouse') quieta.current = false;
    },
    onFocus: () => {
      quieta.current = true;
    },
    onBlur: (evento: { currentTarget: HTMLElement; relatedTarget: EventTarget | null }) => {
      const sigueDentro = evento.relatedTarget instanceof Node && evento.currentTarget.contains(evento.relatedTarget);
      if (!sigueDentro) quieta.current = false;
    },
    onPointerDown: (evento: { button: number; clientX: number }) => {
      tragarClic.current = false;
      if (evento.button !== 0 || !datos.current.activa) return;
      arrastre.current = { desdeX: evento.clientX, desde: desplazamiento.current, movio: false };
    },
    onPointerMove: (evento: { clientX: number; pointerId: number; currentTarget: HTMLElement }) => {
      const actual = arrastre.current;
      if (!actual) return;
      const recorrido = evento.clientX - actual.desdeX;
      // Hasta 5 px es un clic con el pulso movido, no un arrastre.
      if (!actual.movio && Math.abs(recorrido) > 5) {
        actual.movio = true;
        evento.currentTarget.setPointerCapture(evento.pointerId);
      }
      if (actual.movio) desplazamiento.current = actual.desde - recorrido;
    },
    onPointerUp: () => {
      if (arrastre.current?.movio) tragarClic.current = true;
      arrastre.current = null;
    },
    onPointerCancel: () => {
      arrastre.current = null;
    },
    // Soltar después de arrastrar no abre la tarjeta que quedó debajo del puntero.
    onClickCapture: (evento: { preventDefault(): void; stopPropagation(): void }) => {
      if (!tragarClic.current) return;
      evento.preventDefault();
      evento.stopPropagation();
      tragarClic.current = false;
    },
    // Al tabular a una tarjeta que no se ve, el navegador desplaza la cinta (un
    // `overflow: hidden` también se desplaza). Ese desplazamiento pasa a la pista: la
    // tarjeta queda a la vista y la vuelta no se descuadra.
    onScroll: (evento: { currentTarget: HTMLElement }) => {
      const corrido = evento.currentTarget.scrollLeft;
      if (!corrido) return;
      desplazamiento.current += corrido;
      evento.currentTarget.scrollLeft = 0;
    },
  };

  return { pista, manejadores };
}

/** El icono de imagen de la muestra de «Imagen destacada» (`muestraDeImagen`, 25 × 19). */
const ICONO_DE_IMAGEN =
  'M22.6562 18.75H2.34375C1.04932 18.75 0 17.7007 0 16.4062V2.34375C0 1.04932 1.04932 0 2.34375 0H22.6562C23.9507 0 25 1.04932 25 2.34375V16.4062C25 17.7007 23.9507 18.75 22.6562 18.75ZM5.46875 2.73438C3.95859 2.73438 2.73438 3.95859 2.73438 5.46875C2.73438 6.97891 3.95859 8.20312 5.46875 8.20312C6.97891 8.20312 8.20312 6.97891 8.20312 5.46875C8.20312 3.95859 6.97891 2.73438 5.46875 2.73438ZM3.125 15.625H21.875V10.1562L17.6018 5.88306C17.373 5.65425 17.002 5.65425 16.7731 5.88306L10.1562 12.5L7.44556 9.78931C7.21675 9.5605 6.84575 9.5605 6.61689 9.78931L3.125 13.2812V15.625Z';

/**
 * Portada mientras no hay miniatura: sin imagen ni PDF, o si el PDF no se pudo dibujar.
 * Es la muestra de «Imagen destacada» (borde punteado, icono gris y dos líneas), en
 * marcado y no con aquel SVG de 1200 × 500, que a la proporción de la tarjeta se
 * recortaría. Fuera del editor queda solo el icono: las indicaciones son para quien edita.
 */
function PortadaFallback({ enEdicion }: { enEdicion: boolean }) {
  return (
    <div className={`publicaciones-card-fallback ${enEdicion ? 'publicaciones-card-fallback--edicion' : ''}`.trim()}>
      <svg className="publicaciones-card-fallback-icono" viewBox="0 0 25 19" fill="currentColor" aria-hidden="true">
        <path d={ICONO_DE_IMAGEN} />
      </svg>
      {enEdicion && (
        <>
          <span className="publicaciones-card-fallback-titulo">Miniatura</span>
          <span className="publicaciones-card-fallback-ayuda">Sube una imagen o un PDF en el panel lateral derecho</span>
        </>
      )}
    </div>
  );
}

function PortadaDePdf({ pdfUrl, alt, enEdicion }: { pdfUrl?: string; alt: string; enEdicion: boolean }) {
  const [urlAnterior, setUrlAnterior] = useState(pdfUrl);
  const [src, setSrc] = useState<string | null>(pdfUrl ? cacheDeMiniaturas[pdfUrl] || null : null);
  const [cargando, setCargando] = useState(Boolean(pdfUrl && !cacheDeMiniaturas[pdfUrl]));

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
    return <PortadaFallback enEdicion={enEdicion} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} className="publicaciones-card-img" />;
}

function Tarjeta({ publicacion, enEdicion }: { publicacion: PublicacionItem; enEdicion: boolean }) {
  const destino = enEdicion ? null : destinoDe(publicacion);
  const Contenedor = destino ? 'a' : 'div';
  // El título ya está escrito al lado: repetirlo en el `alt` haría que el lector de
  // pantalla lo leyera dos veces como nombre del enlace.
  const alt = typeof publicacion.titulo === 'string' && publicacion.titulo.trim() ? '' : 'Portada de publicación';
  const conFecha = Boolean(publicacion.mes || publicacion.dia);

  return (
    <Contenedor {...destino} draggable={false} className="publicaciones-tarjeta">
      <div className="publicaciones-tarjeta-portada">
        <div className="publicaciones-card-img-wrapper">
          {publicacion.miniatura ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={publicacion.miniatura} alt={alt} draggable={false} className="publicaciones-card-img" />
          ) : (
            <PortadaDePdf pdfUrl={publicacion.pdfUrl} alt={alt} enEdicion={enEdicion} />
          )}
        </div>
        {(destino || enEdicion) && (
          <span className="publicaciones-tarjeta-flecha" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
        )}
      </div>

      <div className="publicaciones-tarjeta-pie">
        <div className="publicaciones-tarjeta-textos">
          {/* Siempre en el marcado, aunque esté vacío: guarda su renglón y todas las
              tarjetas miden lo mismo, tengan detalle o no. */}
          <p className="publicaciones-tarjeta-detalle">
            {publicacion.detalle || (enEdicion ? <span className="opacity-50">Detalle</span> : '')}
          </p>
          <h3 className="publicaciones-card-title">
            {publicacion.titulo || (enEdicion ? <span className="text-gray-400 italic">Nombre de la publicación</span> : '')}
          </h3>
        </div>

        {(conFecha || enEdicion) && (
          <div className="publicaciones-date-badge">
            <div className="publicaciones-date-month">
              {publicacion.mes || (enEdicion ? <span className="opacity-60">Mes</span> : '')}
            </div>
            <div className="publicaciones-date-day">
              {publicacion.dia || (enEdicion ? <span className="opacity-60">Año</span> : '')}
            </div>
          </div>
        )}
      </div>
    </Contenedor>
  );
}

export function Publicaciones({
  titulo = '**Ultimas** publicaciones',
  mostrarTitulo = true,
  publicaciones = [],
  fondo,
  velocidad,
  movimiento = true,
  esEdicion,
}: PublicacionesProps) {
  // En modo edición permitimos ver siempre la preview completa
  const enEdicion =
    esEdicion ??
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/edit/') ||
        window.location.pathname.includes('/plantilla') ||
        window.location.pathname.includes('/admin/editor') ||
        window.location.pathname.includes('/admin/plantilla')));

  const configuradas = Array.isArray(publicaciones) ? publicaciones : [];
  const validas = configuradas.filter(
    (p) => p && (p.titulo || p.detalle || p.pdfUrl || p.miniatura || p.url || p.mes || p.dia)
  );

  const usarEjemplo = enEdicion && validas.length === 0;
  const listaPublicaciones = usarEjemplo
    ? PUBLICACIONES_EJEMPLO
    : enEdicion
      ? validas
      : validas.filter((p) => Boolean(p.pdfUrl || p.miniatura || enlaceSeguro(p.url)));

  const total = listaPublicaciones.length;

  const { ventana, llena, anchoDeCopia } = useCinta(total);
  const pxPorSegundo =
    typeof velocidad === 'number' && velocidad > 0 ? Math.min(velocidad, 200) : VELOCIDAD_POR_DEFECTO;
  const { pista, manejadores } = useMovimientoDeCinta(anchoDeCopia, pxPorSegundo, movimiento !== false, llena);

  useEffect(() => {
    listaPublicaciones.forEach((publicacion) => {
      if (publicacion.pdfUrl && !publicacion.miniatura) void dibujarPortada(publicacion.pdfUrl);
    });
  }, [listaPublicaciones.map((p) => (p.miniatura ? '' : p.pdfUrl)).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si no estamos en edición y no hay publicaciones con archivo, no mostramos el bloque vacío en el sitio público
  if (total === 0 && !enEdicion) return null;

  const fondoValido = colorDeFondo(fondo);

  return (
    <section
      className="matriz-section-white py-12 md:py-16 px-4 md:px-8"
      aria-label="Últimas publicaciones"
      style={fondoValido ? { backgroundColor: fondoValido } : undefined}
    >
      <div className="matriz-content-container-wide max-w-[1200px] w-full mx-auto text-center flex flex-col items-center">
        {mostrarTitulo && titulo && (
          <h2 className={`matriz-section-title text-[#041E42] font-normal text-center mb-8`}>
            {typeof titulo === 'string' && titulo.includes('**') ? resaltar(titulo) : titulo}
          </h2>
        )}

        <div
          className="w-full max-w-[1200px] mx-auto flex flex-col gap-4"
          data-puck-overlay-portal={enEdicion ? 'true' : undefined}
        >
          <div
            ref={ventana}
            className="publicaciones-cinta"
            data-llena={llena ? 'true' : undefined}
            {...manejadores}
            style={enEdicion ? { pointerEvents: 'auto' } : undefined}
          >
            <div ref={pista} className="publicaciones-cinta-pista">
              {(llena ? [0, 1] : [0]).map((vuelta) => (
                <ul
                  key={vuelta}
                  className="publicaciones-cinta-grupo"
                  aria-hidden={vuelta === 1 ? true : undefined}
                  inert={vuelta === 1}
                  data-copia={vuelta === 1 ? '' : undefined}
                >
                  {listaPublicaciones.map((publicacion, indice) => (
                    <li key={`${publicacion.pdfUrl || publicacion.miniatura || 'pub'}-${indice}`} className="publicaciones-cinta-item">
                      <Tarjeta publicacion={publicacion} enEdicion={enEdicion} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
