'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { registerOverlayPortal } from '@puckeditor/core';
import { muestraDeImagen } from '@olo/blocks-renderer';
import { INTERVALO_MS, estiloDeFondo, usePrefiereMenosMovimiento } from './carrusel-de-imagenes';

export interface ImagenDelDato {
  id?: string;
  imagen?: string;
  alt?: string;
  /** Fondo de la sección mientras se ve esta imagen. Vacío: blanco. */
  colorFondo?: string;
}

interface DatoOloSemanaProps {
  block: { id: string };
  /**
   * La tarjeta «Imágenes» del panel: la lista y, aparte de cada imagen, el redondeo de
   * sus esquinas en px (vacío: rectas) y los segundos que se ve cada una (vacío: 6).
   */
  galeria?: { imagenes?: ImagenDelDato[]; radioEsquinas?: number | ''; segundos?: number | '' };
  /** Versión anterior del bloque (una sola infografía con título): se ve como una imagen. */
  imagenSrc?: string;
  imagenAlt?: string;
  esEdicion?: boolean;
}

/** Tope del redondeo, el mismo de «Portales externos». */
const RADIO_MAXIMO = 100;

/**
 * Límites del tiempo de cada imagen. Menos de 3 s no da para leer el dato; más de 60
 * ya no se nota que pasa sola.
 */
const SEGUNDOS_MINIMO = 3;
const SEGUNDOS_MAXIMO = 60;

/** La vista previa de «Imagen destacada» mientras no se sube nada (solo en el editor). */
const MUESTRA = muestraDeImagen('Dato OLO de la semana', 'Sube o selecciona una imagen en el panel lateral derecho');

/**
 * Dato OLO de la semana: un mini carrusel de infografías, una por vez. Cada imagen ya
 * trae el dato dibujado, así que el bloque solo pone el fondo de cada una (la sección
 * cambia de color con un fundido), el redondeo y el paso de una a otra.
 *
 * Pasa sola con un fundido, cada `galeria.segundos` (vacío: los 6 s, `INTERVALO_MS`, del
 * «Carrusel de imágenes»), y después de la última vuelve a la primera, sin fin. Sin
 * flechas: debajo va el ubicador de puntos, que también lleva a cada imagen. Se detiene
 * mientras el cursor o el foco están dentro, o si el sistema pide menos movimiento; en
 * el editor no pasa. Las imágenes se apilan en la misma celda de una rejilla: el bloque
 * toma el alto de la más alta y no salta. Las que no se ven llevan `inert`.
 *
 * Una portada guardada con la versión anterior trae `imagenSrc` y no `imagenes`: se ve
 * con esa imagen sola.
 */
export function DatoOloSemana({
  block,
  galeria,
  imagenSrc,
  imagenAlt,
  esEdicion = false,
}: DatoOloSemanaProps) {
  const fuente = galeria?.imagenes ?? (imagenSrc ? [{ imagen: imagenSrc, alt: imagenAlt }] : []);
  const lista = fuente.filter((d) => d?.imagen?.trim());
  const total = lista.length;
  const [activa, setActiva] = useState(0);
  const [encima, setEncima] = useState(false);
  const menosMovimiento = usePrefiereMenosMovimiento();
  const pasaSola = total > 1 && !encima && !menosMovimiento && !esEdicion;
  // En el editor, al agregar una imagen se salta a ella para verla (igual que el carrusel).
  const [totalAnterior, setTotalAnterior] = useState(total);
  if (total !== totalAnterior) {
    setTotalAnterior(total);
    if (esEdicion && total > totalAnterior) setActiva(total - 1);
  }
  const indice = total > 0 ? Math.min(activa, total - 1) : 0;
  const segundos = Number(galeria?.segundos) || INTERVALO_MS / 1000;
  const intervalo = Math.min(SEGUNDOS_MAXIMO, Math.max(SEGUNDOS_MINIMO, segundos)) * 1000;
  // En el editor, la capa de Puck se queda con los clics: así el ubicador sigue pulsable.
  const pulsableEnElEditor = useCallback(
    (el: HTMLElement | null) => (esEdicion ? registerOverlayPortal(el, { disableDrag: true }) : undefined),
    [esEdicion]
  );

  useEffect(() => {
    if (!pasaSola) return;
    // El módulo hace el bucle: de la última vuelve a la primera.
    const temporizador = setInterval(() => setActiva((i) => (i + 1) % total), intervalo);
    return () => clearInterval(temporizador);
  }, [pasaSola, total, intervalo]);

  if (total === 0 && !esEdicion) return null;

  const radio = Math.min(RADIO_MAXIMO, Math.max(0, Number(galeria?.radioEsquinas) || 0));
  const estilo = {
    ...estiloDeFondo(lista[indice]?.colorFondo),
    ...(radio > 0 && { '--olo-dato-radio': `${radio}px` }),
  } as CSSProperties;

  return (
    <section
      className="olo-dato-semana"
      id="dato-olo-semana"
      style={estilo}
      aria-roledescription="carrusel"
      aria-label="Dato OLO de la semana"
      data-block-id={block.id}
    >
      {total === 0 ? (
        // eslint-disable-next-line @next/next/no-img-element -- muestra del editor en data: URI
        <img src={MUESTRA} alt="" className="olo-dato-semana__muestra" />
      ) : (
        <div
          className="olo-dato-semana__escenario"
          onMouseEnter={() => setEncima(true)}
          onMouseLeave={() => setEncima(false)}
          onFocus={() => setEncima(true)}
          onBlur={(evento) => {
            if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setEncima(false);
          }}
        >
          <div className="olo-dato-semana__pista" aria-live={pasaSola ? 'off' : 'polite'}>
            {lista.map((dato, i) => {
              const visible = i === indice;
              return (
                <div
                  key={dato.id ?? i}
                  className="olo-dato-semana__diapositiva"
                  data-visible={visible || undefined}
                  role="group"
                  aria-roledescription="diapositiva"
                  aria-label={`${i + 1} de ${total}`}
                  aria-hidden={!visible}
                  inert={!visible}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- la sube quien edita; el tamaño va por CSS */}
                  <img src={dato.imagen} alt={dato.alt ?? ''} className="olo-dato-semana__imagen" />
                </div>
              );
            })}
          </div>

          {total > 1 && (
            // El ubicador del «Carrusel de imágenes»: un punto por imagen, el visible alargado.
            <div ref={pulsableEnElEditor} className="olo-carrusel__ubicador">
              {lista.map((dato, i) => (
                <button
                  key={dato.id ?? i}
                  type="button"
                  className="olo-carrusel__punto"
                  data-activo={i === indice || undefined}
                  onClick={() => setActiva(i)}
                  aria-label={`Ir a la imagen ${i + 1} de ${total}`}
                  aria-current={i === indice ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
