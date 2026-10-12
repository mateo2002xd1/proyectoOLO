'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Píxeles seguidos en una misma dirección antes de ocultar o mostrar la barra. Con
 * menos, los temblores del dedo al leer la hacían parpadear.
 */
const UMBRAL = 12;

/** Lo que se sabe del desplazamiento entre un evento y el siguiente. */
export interface EstadoDesplazamiento {
  /** Recorrido en la dirección actual: positivo bajando, negativo subiendo. */
  acumulado: number;
  oculta: boolean;
}

/**
 * Decide si la barra se oculta tras un desplazamiento de `previo` a `actual`, en un
 * contenedor que puede bajar hasta `maximo`. Sin React, para poder probarla sola.
 *
 * Arriba del todo y al final siempre se ve: arriba porque es donde se llega al entrar,
 * y al final para que los últimos botones no queden debajo. Eso cubre también el
 * rebote elástico del iPhone, que lleva la posición por debajo de 0 o más allá del
 * máximo y, si no, mostraría y ocultaría la barra sola.
 */
export function siguienteEstado(
  estado: EstadoDesplazamiento,
  previo: number,
  actual: number,
  maximo: number,
): EstadoDesplazamiento {
  if (actual <= UMBRAL || actual >= maximo - UMBRAL) return { acumulado: 0, oculta: false };
  const delta = actual - previo;
  if (delta === 0) return estado;
  const acumulado = Math.sign(delta) === Math.sign(estado.acumulado) ? estado.acumulado + delta : delta;
  if (acumulado > UMBRAL) return { acumulado, oculta: true };
  if (acumulado < -UMBRAL) return { acumulado, oculta: false };
  return { acumulado, oculta: estado.oculta };
}

/**
 * Oculta la navegación mobile al bajar por la página y la muestra al subir, sea con el
 * dedo, la rueda o el trackpad: solo mira cómo se mueve el contenido. En el panel lo
 * que se desplaza es el `<main>` de `sidebar-layout.tsx`, no la ventana; por eso se
 * escucha el `scroll` de cualquier elemento (en captura, porque no burbujea) y se
 * atiende al que ocupa la pantalla. Las listas pequeñas, los diálogos y la propia hoja
 * no cuentan.
 *
 * Con `fija` (la hoja abierta) no se oculta, y al cambiar de página vuelve a verse.
 */
export function useOcultarAlBajar(fija: boolean): boolean {
  const pathname = usePathname();
  // La ruta en la que se ocultó: al navegar a otra, `oculta` vuelve a ser falso sin
  // tener que corregir el estado dentro de un efecto.
  const [ocultaEn, setOcultaEn] = useState<string | null>(null);
  const rutaRef = useRef(pathname);

  useEffect(() => {
    rutaRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const ultimas = new WeakMap<Element, number>();
    const maximos = new WeakMap<Element, number>();
    let estado: EstadoDesplazamiento = { acumulado: 0, oculta: false };
    let rutaDelEstado = rutaRef.current;

    const alDesplazar = (evento: Event) => {
      // En otra página la barra ya se muestra; el estado de aquí empieza de cero.
      if (rutaDelEstado !== rutaRef.current) {
        estado = { acumulado: 0, oculta: false };
        rutaDelEstado = rutaRef.current;
      }
      const elemento =
        evento.target === document ? document.scrollingElement : evento.target instanceof Element ? evento.target : null;
      if (!elemento) return;
      const esLaPagina = elemento === document.scrollingElement;
      if (!esLaPagina) {
        if (elemento.clientHeight < window.innerHeight / 2) return;
        if (elemento.closest('.navegacion-mobile, dialog, [role="dialog"]')) return;
      }
      const maximo = elemento.scrollHeight - elemento.clientHeight;
      const actual = elemento.scrollTop;
      const previo = ultimas.get(elemento);
      const maximoPrevio = maximos.get(elemento);
      ultimas.set(elemento, actual);
      maximos.set(elemento, maximo);
      if (previo === undefined || maximo <= 0) return;
      // Si cambió lo que se puede bajar, este `scroll` lo provocó la maquetación (el
      // navegador recoloca la posición), no el dedo: no cuenta. Así un cambio de alto
      // que dependa de la barra no puede volver a ocultarla y mostrarla en bucle, que
      // es lo que hacía temblar el final de la página (2026-10-10).
      if (maximoPrevio !== undefined && maximoPrevio !== maximo) return;

      const siguiente = siguienteEstado(estado, previo, actual, maximo);
      if (siguiente.oculta !== estado.oculta) setOcultaEn(siguiente.oculta ? rutaRef.current : null);
      estado = siguiente;
    };

    document.addEventListener('scroll', alDesplazar, { capture: true, passive: true });
    return () => document.removeEventListener('scroll', alDesplazar, { capture: true });
  }, []);

  return !fija && ocultaEn !== null && ocultaEn === pathname;
}
