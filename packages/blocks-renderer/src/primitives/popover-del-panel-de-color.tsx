'use client';

/**
 * El panel de color (`panel-de-color.ts`) en una ventana flotante propia, colocada bajo un
 * elemento. Lo usan el campo de color de Puck (`ColorPickerField`) y los selectores de color
 * del panel de administración: los tres se ven y se comportan igual.
 *
 * Va por portal al `body`: las columnas del editor y los acordeones recortan lo que sobresale.
 * Se cierra con Esc (y el foco vuelve a quien la abrió), con un clic fuera, al desplazar la
 * página o al cambiar el tamaño de la ventana.
 */

import { type RefObject, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { crearPanelDeColor, hexAHsv, normalizarHex, TEMA_DEL_PANEL_DE_COLOR } from './panel-de-color';

const SEPARACION = 8;

export interface PopoverDelPanelDeColorProps {
  /** El elemento bajo el que se coloca (o encima, si abajo no cabe). Un clic en él no cierra el panel. */
  ancla: RefObject<HTMLElement | null>;
  /** El color con que abre; si no es un hex, blanco. */
  valor: string;
  /** Se llama al terminar de elegir (soltar el ratón, Intro, clic en una muestra…), con `#rrggbb`. */
  onElegir: (hex: string) => void;
  /** Sin esto no hay botón de quitar: para un color que no puede quedar vacío. */
  onQuitar?: () => void;
  /** `devolverFoco`: se cerró con Esc (o con «Quitar») y el foco vuelve a quien la abrió. */
  onCerrar: (devolverFoco: boolean) => void;
}

export function PopoverDelPanelDeColor({ ancla, valor, onElegir, onQuitar, onCerrar }: PopoverDelPanelDeColorProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const llamadas = useRef({ onElegir, onQuitar, onCerrar });
  const valorAlAbrir = useRef(valor);

  useEffect(() => {
    llamadas.current = { onElegir, onQuitar, onCerrar };
  });

  useEffect(() => {
    const caja = contenedor.current;
    const anclaEl = ancla.current;
    if (!caja || !anclaEl) return;

    const panel = crearPanelDeColor({
      alElegir: (hex) => llamadas.current.onElegir(hex),
      alQuitar: llamadas.current.onQuitar
        ? () => {
            llamadas.current.onQuitar?.();
            llamadas.current.onCerrar(true);
          }
        : undefined,
    });
    panel.fijar(hexAHsv(normalizarHex(valorAlAbrir.current) ?? '#ffffff'));
    caja.appendChild(panel.elemento);

    const colocar = () => {
      const r = anclaEl.getBoundingClientRect();
      const ancho = caja.offsetWidth;
      const alto = caja.offsetHeight;
      const left = Math.min(Math.max(r.left, SEPARACION), window.innerWidth - ancho - SEPARACION);
      let top = r.bottom + SEPARACION;
      if (top + alto > window.innerHeight - SEPARACION) {
        const arriba = r.top - alto - SEPARACION;
        top = arriba >= SEPARACION ? arriba : Math.max(SEPARACION, window.innerHeight - alto - SEPARACION);
      }
      caja.style.left = `${left}px`;
      caja.style.top = `${top}px`;
      caja.style.visibility = 'visible';
    };
    colocar();
    panel.elemento.querySelector<HTMLElement>('[tabindex="0"]')?.focus({ preventScroll: true });

    const alPulsarFuera = (e: PointerEvent) => {
      const destino = e.target as Node | null;
      if (destino && !caja.contains(destino) && !anclaEl.contains(destino)) llamadas.current.onCerrar(false);
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      llamadas.current.onCerrar(true);
    };
    // Si algo se desplaza o la ventana cambia de tamaño, la ventana flotante quedaría suelta.
    const alDesplazar = (e: Event) => {
      if (!(e.target instanceof Node) || !caja.contains(e.target)) llamadas.current.onCerrar(false);
    };
    const alRedimensionar = () => llamadas.current.onCerrar(false);
    document.addEventListener('pointerdown', alPulsarFuera, true);
    document.addEventListener('keydown', alTeclear, true);
    window.addEventListener('scroll', alDesplazar, true);
    window.addEventListener('resize', alRedimensionar);
    return () => {
      document.removeEventListener('pointerdown', alPulsarFuera, true);
      document.removeEventListener('keydown', alTeclear, true);
      window.removeEventListener('scroll', alDesplazar, true);
      window.removeEventListener('resize', alRedimensionar);
      panel.elemento.remove();
    };
  }, [ancla]);

  return createPortal(
    <div
      ref={contenedor}
      className="olo-pc-popover"
      data-tema={TEMA_DEL_PANEL_DE_COLOR}
      role="dialog"
      aria-label="Selector de color"
      style={{ visibility: 'hidden', top: 0, left: 0 }}
    />,
    document.body
  );
}
