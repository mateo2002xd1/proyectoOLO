'use client';

import { useEffect } from 'react';

/**
 * «Lector de pantalla» del panel de accesibilidad: lee en voz alta lo que el visitante
 * toca o enfoca con el teclado.
 *
 * No reemplaza a NVDA, JAWS o TalkBack, que quien es ciego ya trae en su equipo y que el
 * sitio atiende con su HTML semántico (9-accesibilidad.md). Es para quien ve pero lee con
 * dificultad (baja visión, dislexia, poca alfabetización) y no tiene uno instalado. Usa la
 * voz del propio navegador (Web Speech API): nada que descargar ni que enviar a un servidor.
 */

/** Lo que se lee entero cuando se toca algo dentro. */
const LEIBLES =
  'h1,h2,h3,h4,h5,h6,[role="heading"],p,li,dt,dd,a,button,label,td,th,figcaption,blockquote,summary,img[alt],[aria-label]';

/** Un párrafo largo se corta: la idea es orientar, no leer la página entera de un toque. */
const MAXIMO_DE_CARACTERES = 600;

/** El panel no se lee a sí mismo: cada interruptor que se pulsa ya anuncia su estado. */
const DENTRO_DEL_PANEL = '[data-a11y-panel]';

const ATRIBUTO_LEYENDO = 'data-a11y-leyendo';

export const vozAltaDisponible = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function prefijoDe(elemento: Element) {
  if (elemento instanceof HTMLImageElement) return 'Imagen: ';
  if (elemento.matches('a')) return 'Enlace: ';
  if (elemento.matches('button')) return 'Botón: ';
  if (elemento.matches('h1,h2,h3,h4,h5,h6,[role="heading"]')) return 'Título: ';
  return '';
}

function textoDe(elemento: Element) {
  const crudo =
    elemento instanceof HTMLImageElement
      ? elemento.alt
      : elemento.getAttribute('aria-label') || (elemento as HTMLElement).innerText || '';
  const texto = crudo.replace(/\s+/g, ' ').trim();
  if (!texto) return '';
  const recortado = texto.length > MAXIMO_DE_CARACTERES ? `${texto.slice(0, MAXIMO_DE_CARACTERES)}…` : texto;
  return prefijoDe(elemento) + recortado;
}

/** Lee `texto` con una voz en español, cortando lo que estuviera sonando. */
export function leerEnVozAlta(texto: string, alTerminar?: () => void) {
  if (!vozAltaDisponible() || !texto) return;
  const voz = window.speechSynthesis;
  voz.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = 'es-CO';
  // `lang` solo no basta en todos los navegadores: algunos leen con la voz por defecto
  // (en inglés) si no se les da una voz concreta.
  const espanol = voz.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'));
  frase.voice = espanol.find((v) => v.lang === 'es-CO') ?? espanol.find((v) => v.lang === 'es-US') ?? espanol[0] ?? null;
  if (alTerminar) {
    frase.onend = alTerminar;
    frase.onerror = alTerminar;
  }
  voz.speak(frase);
}

export function useLectorEnVozAlta(activo: boolean) {
  useEffect(() => {
    if (!activo || !vozAltaDisponible()) return;

    let resaltado: Element | null = null;
    const quitarResaltado = () => {
      resaltado?.removeAttribute(ATRIBUTO_LEYENDO);
      resaltado = null;
    };

    const leer = (evento: Event) => {
      const objetivo = evento.target;
      if (!(objetivo instanceof Element) || objetivo.closest(DENTRO_DEL_PANEL)) return;
      const elemento = objetivo.closest(LEIBLES) ?? objetivo;
      // Un clic en un enlace o un botón primero lo enfoca: sin esto se leería dos veces.
      if (elemento === resaltado) return;
      const texto = textoDe(elemento);
      if (!texto) return;
      quitarResaltado();
      resaltado = elemento;
      elemento.setAttribute(ATRIBUTO_LEYENDO, '');
      leerEnVozAlta(texto, () => {
        if (resaltado === elemento) quitarResaltado();
      });
    };

    // En captura: un bloque que detenga la propagación del clic no lo deja sin leer.
    document.addEventListener('click', leer, true);
    document.addEventListener('focusin', leer, true);
    return () => {
      document.removeEventListener('click', leer, true);
      document.removeEventListener('focusin', leer, true);
      window.speechSynthesis.cancel();
      quitarResaltado();
    };
  }, [activo]);
}
