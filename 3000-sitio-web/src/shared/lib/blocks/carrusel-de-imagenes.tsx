'use client';

import { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { registerOverlayPortal } from '@puckeditor/core';
import { muestraDeImagen } from '@olo/blocks-renderer';
import { esColorOscuro } from './tinta-de-franja';

export interface DiapositivaDeCarrusel {
  id?: string;
  imagen?: string;
  alt?: string;
  /** Opcional: a dónde lleva el botón o, si no hay botón, la imagen entera. */
  enlace?: string;
  /** Texto del botón bajo la imagen; solo se pinta con `enlace`. */
  textoBoton?: string;
  /** Fondo de la sección mientras se ve esta imagen. Vacío = blanco. */
  colorFondo?: string;
}

export interface CarruselDeImagenesProps {
  block: { id: string };
  /**
   * Campos `richtext` de Puck dentro de un `object`: llegan ya convertidos en nodos.
   * `colorFondo` es el de la franja del texto, aparte del banner. Vacío = blanco.
   */
  textos?: { parrafo?: ReactNode; colorFondo?: string };
  diapositivas?: DiapositivaDeCarrusel[];
  esEdicion?: boolean;
}

/** Cada cuánto pasa sola a la siguiente. También la usa «Dato OLO de la semana». */
export const INTERVALO_MS = 6000;

/** Texto sobre fondos claros (y sobre el blanco por defecto); sobre oscuros, blanco. */
const AZUL_TEXTO = '#001145';

/** Fondo de una franja y su texto: blanco sobre oscuros, azul sobre claros. Vacío: el CSS (blanco). */
export function estiloDeFondo(color?: string): CSSProperties | undefined {
  const fondo = color?.trim();
  return fondo ? { backgroundColor: fondo, color: esColorOscuro(fondo) ? '#ffffff' : AZUL_TEXTO } : undefined;
}

/** La misma muestra de «Imagen destacada», con su texto. */
const MUESTRA = muestraDeImagen('Carrusel de imágenes', 'Agrega imágenes en el panel lateral derecho');

const MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)';
const suscribirMenosMovimiento = (avisar: () => void) => {
  const consulta = window.matchMedia(MENOS_MOVIMIENTO);
  consulta.addEventListener('change', avisar);
  return () => consulta.removeEventListener('change', avisar);
};

/** «Menos movimiento» del sistema: entonces no pasa sola. En el servidor, no. */
export function usePrefiereMenosMovimiento(): boolean {
  return useSyncExternalStore(
    suscribirMenosMovimiento,
    () => window.matchMedia(MENOS_MOVIMIENTO).matches,
    () => false
  );
}

/** Las flechas del diseño: un arco y un chevrón en gris, sin fondo. */
function Flecha({ direccion }: { direccion: 'anterior' | 'siguiente' }) {
  const trazos =
    direccion === 'anterior'
      ? [
          'M17.5 1.5C8.66235 1.5 1.5 7.99088 1.5 16C1.5 24.0091 8.66235 30.5 17.5 30.5',
          'M17.5 9.5L8.88983 15.8074C8.37006 16.1882 8.37006 16.8062 8.88983 17.1925L17.5 23.5',
        ]
      : [
          'M1.50012 1.5C10.3378 1.5 17.5001 7.99088 17.5001 16C17.5001 24.0091 10.3378 30.5 1.50012 30.5',
          'M1.50012 9.5L10.1103 15.8074C10.6301 16.1882 10.6301 16.8062 10.1103 17.1925L1.50012 23.5',
        ];
  return (
    <svg aria-hidden="true" width="19" height="32" viewBox="0 0 19 32" fill="none" className="olo-carrusel__flecha-icono">
      {trazos.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" />
      ))}
    </svg>
  );
}

/**
 * Carrusel de imágenes a lo ancho, una por vez, con un párrafo enriquecido encima.
 * Son dos franjas, cada una con su fondo: la del texto, con el color de «Párrafo», y
 * la del banner, con el de la imagen que se ve (cambia con un fundido). En las dos el
 * texto pasa a blanco sobre fondos oscuros.
 *
 * Pasa sola cada 6 s y se detiene mientras el cursor o el foco están dentro, o si el
 * sistema pide menos movimiento; en el editor no pasa. Lleva las dos flechas y, debajo,
 * un ubicador de puntos (el de la imagen visible se alarga).
 * Todas las imágenes se apilan en la misma celda de una rejilla: el bloque toma el alto
 * de la más alta y no salta. Las que no se ven llevan `inert`.
 *
 * No hay campo de título aparte: si hace falta un encabezado (H1–H4), quien edita lo
 * pone dentro del párrafo con la barra del texto enriquecido.
 *
 * Patrón de carrusel de WAI-ARIA: región con `aria-roledescription`, cada imagen como
 * grupo «N de M» y anuncio del cambio solo cuando no está pasando sola.
 */
export function CarruselDeImagenes({ block, textos, diapositivas = [], esEdicion = false }: CarruselDeImagenesProps) {
  const lista = diapositivas.filter((d) => d?.imagen?.trim());
  const total = lista.length;
  const [activa, setActiva] = useState(0);
  const [encima, setEncima] = useState(false);
  const menosMovimiento = usePrefiereMenosMovimiento();
  const pasaSola = total > 1 && !encima && !menosMovimiento && !esEdicion;
  // En el editor, al agregar una imagen se salta a ella para personalizarla. Ajuste de
  // estado durante el render (el patrón de React para «comparar con el render anterior»).
  const [totalAnterior, setTotalAnterior] = useState(total);
  if (total !== totalAnterior) {
    setTotalAnterior(total);
    if (esEdicion && total > totalAnterior) setActiva(total - 1);
  }
  // Si se borran imágenes en el editor, el índice guardado se acota a la lista.
  const indice = total > 0 ? Math.min(activa, total - 1) : 0;
  /*
   * En el editor, Puck tapa el bloque con una capa que se queda con los clics (para
   * seleccionarlo y arrastrarlo). Registrar las flechas y el ubicador como «portal» de
   * esa capa los deja pulsables ahí, para pasar de una imagen a otra mientras se edita.
   * En el sitio publicado no hay capa y no se registra nada.
   */
  const pulsableEnElEditor = useCallback(
    (el: HTMLElement | null) => (esEdicion ? registerOverlayPortal(el, { disableDrag: true }) : undefined),
    [esEdicion]
  );

  useEffect(() => {
    if (!pasaSola) return;
    const temporizador = setInterval(() => setActiva((i) => (i + 1) % total), INTERVALO_MS);
    return () => clearInterval(temporizador);
  }, [pasaSola, total]);

  if (total === 0 && !esEdicion) return null;

  const ir = (destino: number) => setActiva((destino + total) % total);
  const { parrafo, colorFondo: fondoTexto } = textos ?? {};

  return (
    <section
      className="olo-carrusel"
      aria-roledescription="carrusel"
      aria-label="Carrusel de imágenes"
      data-block-id={block.id}
    >
      {parrafo && (
        <div className="olo-carrusel__franja-texto" style={estiloDeFondo(fondoTexto)}>
          <div className="olo-carrusel__encabezado olo-carrusel__parrafo">{parrafo}</div>
        </div>
      )}

      <div className="olo-carrusel__franja-banner" style={estiloDeFondo(lista[indice]?.colorFondo)}>
        {total === 0 ? (
          // eslint-disable-next-line @next/next/no-img-element -- muestra del editor en data: URI
          <img src={MUESTRA} alt="" className="olo-carrusel__muestra" />
        ) : (
          <div
            className="olo-carrusel__escenario"
            onMouseEnter={() => setEncima(true)}
            onMouseLeave={() => setEncima(false)}
            onFocus={() => setEncima(true)}
            onBlur={(evento) => {
              if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setEncima(false);
            }}
          >
            <div className="olo-carrusel__pista" aria-live={pasaSola ? 'off' : 'polite'}>
              {lista.map((diapositiva, i) => {
                const visible = i === indice;
                const imagen = (
                  // eslint-disable-next-line @next/next/no-img-element -- la sube quien edita; el tamaño va por CSS
                  <img src={diapositiva.imagen} alt={diapositiva.alt ?? ''} className="olo-carrusel__imagen" />
                );
                const enlace = diapositiva.enlace?.trim();
                const textoBoton = diapositiva.textoBoton?.trim();
                // Con botón, el enlace va en el botón y la imagen no es enlace (no dos
                // enlaces seguidos al mismo sitio). En el editor el botón se ve pero no navega.
                const boton =
                  enlace && textoBoton ? (
                    esEdicion ? (
                      <span className="olo-carrusel__boton">{textoBoton}</span>
                    ) : (
                      <a href={enlace} className="olo-carrusel__boton">
                        {textoBoton}
                      </a>
                    )
                  ) : null;
                return (
                  <div
                    key={diapositiva.id ?? i}
                    className="olo-carrusel__diapositiva"
                    data-visible={visible || undefined}
                    role="group"
                    aria-roledescription="diapositiva"
                    aria-label={`${i + 1} de ${total}`}
                    aria-hidden={!visible}
                    inert={!visible}
                  >
                    {enlace && !boton && !esEdicion ? <a href={enlace}>{imagen}</a> : imagen}
                    {boton}
                  </div>
                );
              })}
            </div>

            {total > 1 && (
              <>
                <button
                  ref={pulsableEnElEditor}
                  type="button"
                  className="olo-carrusel__flecha olo-carrusel__flecha--anterior"
                  onClick={() => ir(indice - 1)}
                  aria-label="Imagen anterior"
                >
                  <Flecha direccion="anterior" />
                </button>
                <button
                  ref={pulsableEnElEditor}
                  type="button"
                  className="olo-carrusel__flecha olo-carrusel__flecha--siguiente"
                  onClick={() => ir(indice + 1)}
                  aria-label="Imagen siguiente"
                >
                  <Flecha direccion="siguiente" />
                </button>
              </>
            )}
          </div>
        )}

        {total > 1 && (
          // Ubicador: un punto por imagen; el de la que se ve se alarga. También lleva a ella.
          <div ref={pulsableEnElEditor} className="olo-carrusel__ubicador">
            {lista.map((diapositiva, i) => (
              <button
                key={diapositiva.id ?? i}
                type="button"
                className="olo-carrusel__punto"
                data-activo={i === indice || undefined}
                onClick={() => ir(i)}
                aria-label={`Ir a la imagen ${i + 1} de ${total}`}
                aria-current={i === indice ? 'true' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
