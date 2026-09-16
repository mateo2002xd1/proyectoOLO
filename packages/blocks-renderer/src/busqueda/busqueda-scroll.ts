/**
 * Utilidad de búsqueda en el DOM, desplazamiento suave y resaltado visual.
 *
 * Genérica para cualquier frontend del proyecto (intranet, sitio público, etc.).
 * Localiza la etiqueta o bloque coincidente y aplica un destello visual de acento.
 */

import React from 'react';

/**
 * Normaliza cadenas para comparación insensible a tildes, mayúsculas y espacios en blanco
 * colapsando saltos de línea y tabulaciones típicos de JSX/HTML en el DOM.
 */
function normalizar(texto: string): string {
  if (!texto) return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\u00A0\r\n\t]+/g, ' ')
    .toLowerCase()
    .trim();
}

/**
 * Fragmenta un texto original resaltando con etiquetas <mark> las partes
 * que coinciden con los términos de búsqueda, de manera insensible a mayúsculas y tildes.
 */
export function resaltarCoincidenciaTexto(
  texto: string,
  consulta: string,
  claseResaltado = 'bg-sky-400/25 text-sky-200 px-0.5 rounded not-italic underline decoration-sky-400/50 underline-offset-2'
): React.ReactNode {
  if (!texto || !consulta || !consulta.trim()) return texto;

  const qLimpia = consulta
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (!qLimpia) return texto;

  // Mantener longitud 1-a-1 con el texto original para los índices de corte
  const textoNorm = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const rangos: Array<{ inicio: number; fin: number }> = [];

  // 1. Probar la frase completa primero
  let pos = 0;
  while (pos < textoNorm.length) {
    const idx = textoNorm.indexOf(qLimpia, pos);
    if (idx === -1) break;
    rangos.push({ inicio: idx, fin: idx + qLimpia.length });
    pos = idx + qLimpia.length;
  }

  // 2. Si no hubo coincidencia continua o tiene varias palabras, buscar palabras individuales
  if (rangos.length === 0) {
    const palabras = Array.from(
      new Set(qLimpia.split(/\s+/).filter((p) => p.length >= 2))
    );
    for (const palabra of palabras) {
      let pPos = 0;
      while (pPos < textoNorm.length) {
        const idx = textoNorm.indexOf(palabra, pPos);
        if (idx === -1) break;
        rangos.push({ inicio: idx, fin: idx + palabra.length });
        pPos = idx + palabra.length;
      }
    }
  }

  if (rangos.length === 0) return texto;

  // Ordenar y fusionar rangos superpuestos
  rangos.sort((a, b) => a.inicio - b.inicio);
  const fusionados: Array<{ inicio: number; fin: number }> = [];
  for (const r of rangos) {
    const ultimo = fusionados[fusionados.length - 1];
    if (!ultimo || r.inicio > ultimo.fin) {
      fusionados.push({ ...r });
    } else {
      ultimo.fin = Math.max(ultimo.fin, r.fin);
    }
  }

  // Construir fragmentos con React.createElement para soportar entornos .ts y .tsx
  const fragmentos: React.ReactNode[] = [];
  let cursor = 0;

  fusionados.forEach((r, i) => {
    if (r.inicio > cursor) {
      fragmentos.push(texto.slice(cursor, r.inicio));
    }
    fragmentos.push(
      React.createElement(
        'mark',
        {
          key: i,
          className: claseResaltado,
        },
        texto.slice(r.inicio, r.fin)
      )
    );
    cursor = r.fin;
  });

  if (cursor < texto.length) {
    fragmentos.push(texto.slice(cursor));
  }

  return fragmentos;
}

/**
 * Busca en el DOM el elemento visible más específico que contenga el texto buscado.
 * Emplea un sistema de ponderación para seleccionar la etiqueta más precisa (h1-h6, p, li, etc.)
 * y no el contenedor padre exterior.
 */
export function buscarElementoPorTexto(texto: string): HTMLElement | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  const limpio = normalizar(texto);
  if (!limpio || limpio.length < 2) return null;

  const palabras = limpio.split(' ').filter((p) => p.length > 2);
  const fraseClave = palabras.slice(0, 5).join(' ');
  const fragmento = limpio.length > 40 ? limpio.slice(0, 40) : limpio;

  // Selectores prioritarios donde reside el contenido semántico (evitamos 'div' para no recorrer cientos de contenedores)
  const selector =
    'h1, h2, h3, h4, h5, h6, p, li, span, strong, b, em, a, button, td, th, label, figcaption, blockquote, dd, dt';

  const candidatos = Array.from(document.querySelectorAll<HTMLElement>(selector));

  let mejorElemento: HTMLElement | null = null;
  let mejorPuntuacion = 0;
  let menorLongitud = Infinity;

  for (const el of candidatos) {
    // Usamos textContent que es una lectura en memoria y NO fuerza reflow de diseño
    const raw = el.textContent || el.getAttribute('alt') || '';
    if (!raw) continue;

    const textoEl = normalizar(raw);
    if (!textoEl) continue;

    let puntuacion = 0;

    if (textoEl === limpio) {
      puntuacion = 1000;
    } else if (textoEl.includes(limpio)) {
      puntuacion = 800;
    } else if (fraseClave && textoEl.includes(fraseClave)) {
      puntuacion = 650;
    } else if (textoEl.includes(fragmento)) {
      puntuacion = 500;
    } else if (limpio.includes(textoEl) && textoEl.length >= 10) {
      puntuacion = 400;
    } else if (palabras.length >= 3 && palabras.slice(0, 3).every((p) => textoEl.includes(p))) {
      puntuacion = 300;
    }

    if (puntuacion > 0) {
      // Si el elemento está dentro de un panel de pestañas, puede estar temporalmente
      // oculto (display: none). No lo descartamos por dimensiones cero.
      const panelPestana = el.closest('[role="tabpanel"]');
      const estaEnPestanaOculta = !!panelPestana && (
        (panelPestana as HTMLElement).style.display === 'none' ||
        panelPestana.hasAttribute('hidden')
      );

      if (!estaEnPestanaOculta) {
        // Solo para los elementos que coinciden en texto (1 o 2 en toda la página),
        // comprobamos visibilidad con getBoundingClientRect()
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
      }

      // Si tiene mayor puntuación, o misma puntuación pero menor longitud (es más específico),
      // lo elegimos como mejor coincidencia
      if (
        puntuacion > mejorPuntuacion ||
        (puntuacion === mejorPuntuacion && textoEl.length < menorLongitud)
      ) {
        mejorPuntuacion = puntuacion;
        menorLongitud = textoEl.length;
        mejorElemento = el;
      }
    }
  }

  return mejorElemento;
}

interface TemporizadoresElemento {
  fadeTimer: ReturnType<typeof setTimeout>;
  cleanupTimer: ReturnType<typeof setTimeout>;
}

const temporizadoresDestello = new WeakMap<HTMLElement, TemporizadoresElemento>();

/**
 * Aplica un destello de acento visual (halo difuso #fed754 al 25% de opacidad y fondo suave) temporal sobre el elemento encontrado.
 * - Sin borde sólido exterior (sin 0 0 0 4px).
 * - Sin alterar el border-radius original del elemento.
 * - Idempotente: cancela cualquier temporizador anterior sobre el mismo elemento.
 * - Limpieza total garantizada: remueve completamente los estilos inline al finalizar.
 */
export function aplicarDestello(elemento: HTMLElement): void {
  if (!elemento) return;

  // 1. Si ya existía un temporizador activo para este elemento, cancelarlo limpiamente
  const timerPrevio = temporizadoresDestello.get(elemento);
  if (timerPrevio) {
    clearTimeout(timerPrevio.fadeTimer);
    clearTimeout(timerPrevio.cleanupTimer);
    temporizadoresDestello.delete(elemento);
  }

  // 2. Aplicar resaltado de alta visibilidad (fondo amarillo + contorno brillante dorado)
  elemento.style.transition = 'all 0.35s ease';
  elemento.style.removeProperty('box-shadow');
  elemento.style.backgroundColor = '#fff201';
  elemento.style.color = '#001631';
  elemento.style.outline = '3px solid #facc15';
  elemento.style.outlineOffset = '3px';
  elemento.style.borderRadius = elemento.style.borderRadius || '4px';

  // Reiniciar clase de animación de apoyo CSS
  elemento.classList.remove('resaltado-busqueda-anim');
  void elemento.offsetWidth;
  elemento.classList.add('resaltado-busqueda-anim');

  // 3. A los 3.2s, desvanecer suavemente
  const fadeTimer = setTimeout(() => {
    elemento.style.backgroundColor = 'transparent';
    elemento.style.removeProperty('outline');
    elemento.style.removeProperty('outline-offset');

    // 4. Tras los 450ms de transición suave, remover completamente los estilos inline y clase
    const cleanupTimer = setTimeout(() => {
      elemento.style.removeProperty('box-shadow');
      elemento.style.removeProperty('background-color');
      elemento.style.removeProperty('color');
      elemento.style.removeProperty('transition');
      elemento.style.removeProperty('outline');
      elemento.style.removeProperty('outline-offset');
      elemento.classList.remove('resaltado-busqueda-anim');
      temporizadoresDestello.delete(elemento);
    }, 450);

    const actual = temporizadoresDestello.get(elemento);
    if (actual) {
      actual.cleanupTimer = cleanupTimer;
    }
  }, 3200);

  temporizadoresDestello.set(elemento, {
    fadeTimer,
    cleanupTimer: fadeTimer,
  });
}

/**
 * Detecta si el elemento encontrado reside dentro de una pestaña (o es el botón de una pestaña)
 * y ejecuta la activación de la pestaña correspondiente mediante click() en el botón selector.
 * Admite anidamiento de pestañas activando de forma secuencial de padre a hijo.
 * Devuelve true si se disparó la activación de alguna pestaña.
 */
export function activarPestanaDeElemento(elemento: HTMLElement): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !elemento) {
    return false;
  }

  let seActivo = false;

  // Caso 1: El elemento encontrado es el botón de la pestaña o un texto/icono dentro del botón
  const botonTab = elemento.closest<HTMLElement>('[role="tab"], .olo-tabs-btn');
  if (botonTab) {
    const yaActivo =
      botonTab.getAttribute('aria-selected') === 'true' ||
      botonTab.classList.contains('olo-tabs-btn--active');
    if (!yaActivo) {
      botonTab.click();
      seActivo = true;
    }
  }

  // Caso 2: El elemento reside dentro de uno o varios paneles de pestañas ([role="tabpanel"])
  const panelesParaActivar: HTMLElement[] = [];
  let actual: HTMLElement | null = elemento;

  while (actual) {
    // Anotado a mano: `actual` se reasigna con `panel.parentElement` más abajo, así que
    // sin este tipo TS entra en una inferencia circular (TS7022) y `panel` cae a `any`
    // implícito — que §4 de las convenciones prohíbe y rompía el `tsc` de la intranet.
    const panel: HTMLElement | null = actual.closest<HTMLElement>('[role="tabpanel"]');
    if (!panel) break;
    panelesParaActivar.unshift(panel); // Guardar del más externo al más interno
    actual = panel.parentElement;
  }

  for (const panel of panelesParaActivar) {
    const botonId = panel.getAttribute('aria-labelledby');
    let boton: HTMLElement | null = botonId ? document.getElementById(botonId) : null;

    if (!boton && panel.id) {
      boton = document.querySelector<HTMLElement>(
        `[role="tab"][aria-controls="${panel.id}"], button[aria-controls="${panel.id}"], .olo-tabs-btn[aria-controls="${panel.id}"]`
      );
    }

    if (!boton) {
      const slotId = panel.getAttribute('data-slot-id');
      if (slotId) {
        boton = document.querySelector<HTMLElement>(
          `button[data-slot-id="${slotId}"], [role="tab"][data-slot-id="${slotId}"]`
        );
      }
    }

    if (boton) {
      const yaActivo =
        boton.getAttribute('aria-selected') === 'true' ||
        boton.classList.contains('olo-tabs-btn--active');
      const panelVisible = panel.style.display !== 'none' && !panel.hasAttribute('hidden');

      if (!yaActivo || !panelVisible) {
        boton.click();
        seActivo = true;
      }
    }
  }

  return seActivo;
}

/**
 * Desplaza la vista suavemente hasta el bloque o elemento correspondiente,
 * respetando la barra superior fija (topbar) y aplicando el resaltado de acento.
 * Si el elemento pertenece a una pestaña inactiva, la activa automáticamente antes del scroll.
 */
export function desplazarAElemento(opciones: {
  blockId?: string;
  texto?: string;
}): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  // Si el modal de búsqueda había bloqueado el scroll del body, restaurarlo
  if (document.body.style.overflow === 'hidden') {
    document.body.style.overflow = '';
  }

  let el: HTMLElement | null = null;

  // 1. Si tenemos un texto específico, buscar la etiqueta exacta
  if (opciones.texto) {
    el = buscarElementoPorTexto(opciones.texto);
  }

  // 2. Si no encontró por texto o no había, intentar por el id del bloque Puck
  if (!el && opciones.blockId) {
    el = document.getElementById(opciones.blockId) || document.querySelector<HTMLElement>(`[data-block-id="${opciones.blockId}"]`);
  }

  if (el) {
    // Si el elemento pertenece a una pestaña o es una pestaña, activarla primero
    const seActivoPestana = activarPestanaDeElemento(el);

    const intentarDesplazarYResaltar = (intentosRestantes = 5) => {
      let target: HTMLElement | null = el;

      // Si el elemento se desconectó del DOM (por re-render de React al cambiar de pestaña)
      // o no se encuentra conectado, volver a buscarlo en el árbol DOM actualizado:
      if (!target || !document.body.contains(target)) {
        if (opciones.texto) {
          const reEncontrado = buscarElementoPorTexto(opciones.texto);
          if (reEncontrado) target = reEncontrado;
        }
        if ((!target || !document.body.contains(target)) && opciones.blockId) {
          const reEncontrado = document.getElementById(opciones.blockId) || document.querySelector<HTMLElement>(`[data-block-id="${opciones.blockId}"]`);
          if (reEncontrado) target = reEncontrado;
        }
      }

      if (target && document.body.contains(target)) {
        const rect = target.getBoundingClientRect();

        // Si la pestaña aún está abriéndose o no ha terminado el layout (altura 0)
        if (rect.height === 0 && intentosRestantes > 0) {
          setTimeout(() => intentarDesplazarYResaltar(intentosRestantes - 1), 70);
          return;
        }

        const alturaVentana = window.innerHeight || document.documentElement.clientHeight || 800;
        const alturaEncabezado = 80; // Altura de la barra superior fija

        // Centro del área útil visible entre la barra superior y la base de la pantalla
        const centroObjetivo = alturaEncabezado + (alturaVentana - alturaEncabezado) / 2;

        // Posición absoluta del elemento en el documento
        const posicionElemento = window.pageYOffset + rect.top;

        // Para elementos pequeños (h1-h6, p, li) tomamos su centro; para bloques altos,
        // priorizamos su inicio con un margen cómodo para que el título quede visible
        const compensacionAlto = Math.min(Math.max(rect.height / 2, 20), 120);
        const posicionTop = Math.max(0, posicionElemento + compensacionAlto - centroObjetivo);

        window.scrollTo({
          top: posicionTop,
          behavior: 'smooth',
        });

        // Resaltar visualmente con destello
        aplicarDestello(target);
        return;
      }

      // Si aún no está en el DOM y quedan intentos (el componente está montándose), reintentar
      if (intentosRestantes > 0) {
        setTimeout(() => intentarDesplazarYResaltar(intentosRestantes - 1), 70);
      }
    };

    if (seActivoPestana) {
      // Esperar un ciclo inicial para que React procese el click y monte el contenido de la pestaña
      setTimeout(() => intentarDesplazarYResaltar(5), 70);
    } else {
      intentarDesplazarYResaltar(1);
    }

    return true;
  }

  return false;
}
