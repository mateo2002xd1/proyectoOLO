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

  // 1.5. Frase difusa: permite signos de puntuación entre palabras
  // Ej.: buscar "Aprendizaje SENA" encuentra "Aprendizaje (SENA)" en el texto.
  if (rangos.length === 0 && qLimpia.includes(' ')) {
    const palabrasQ2 = qLimpia.split(/\s+/).filter((p) => p.length >= 2);
    if (palabrasQ2.length >= 2) {
      const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const patronFuzzy = palabrasQ2.map(escapeRe).join('[\\s\\W]*');
      try {
        const reFuzzy = new RegExp(patronFuzzy, 'g');
        let mFuzzy: RegExpExecArray | null;
        while ((mFuzzy = reFuzzy.exec(textoNorm)) !== null) {
          rangos.push({ inicio: mFuzzy.index, fin: mFuzzy.index + mFuzzy[0].length });
          if (mFuzzy[0].length === 0) { reFuzzy.lastIndex++; }
        }
      } catch { /* ignorar expresión regular inválida */ }
    }
  }

  // 2. Si no hubo coincidencia, buscar palabras individuales significativas (>= 3 chars)
  // Se excluyen artículos/preposiciones cortas ("el", "de") para no resaltar todo el texto.
  if (rangos.length === 0) {
    const palabras = Array.from(
      new Set(qLimpia.split(/\s+/).filter((p) => p.length >= 3))
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

      // Penalizar elementos cuyo texto sea demasiado largo en comparación con lo buscado:
      // un párrafo con 500 caracteres que contiene la palabra buscada (10 chars) debe perder
      // frente a un <span> o <strong> de 12 caracteres que dice exactamente lo buscado.
      const ratioLongitud = textoEl.length / Math.max(limpio.length, 1);
      // Penalización proporcional: cuanto más largo, menos puntuación efectiva
      const penalizacion = ratioLongitud > 3 ? Math.min(ratioLongitud * 15, 300) : 0;
      const puntuacionEfectiva = puntuacion - penalizacion;

      // Si tiene mayor puntuación efectiva, o misma puntuación pero menor longitud (es más específico),
      // lo elegimos como mejor coincidencia
      if (
        puntuacionEfectiva > mejorPuntuacion ||
        (puntuacionEfectiva === mejorPuntuacion && textoEl.length < menorLongitud)
      ) {
        mejorPuntuacion = puntuacionEfectiva;
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
 * Aplica un destello de acento visual temporal sobre el elemento encontrado.
 * - Si el textContent del elemento es mucho más largo que el texto buscado,
 *   inyecta un <mark> temporal que resalta SOLO la coincidencia en vez de
 *   pintar todo el bloque.
 * - Sin alterar el border-radius original del elemento.
 * - Idempotente: cancela cualquier temporizador anterior sobre el mismo elemento.
 * - Limpieza total garantizada: remueve completamente los estilos inline al finalizar.
 *
 * @param elemento  El elemento DOM sobre el que aplicar el destello.
 * @param textoBuscado  Opcional. Cuando se provee y el elemento contiene mucho más
 *                      texto del buscado, el destello se aplica solo sobre la
 *                      coincidencia mediante un <mark> temporal.
 */
export function aplicarDestello(elemento: HTMLElement, textoBuscado?: string): void {
  if (!elemento) return;

  // Cancelar cualquier temporizador activo previo sobre este elemento
  const timerPrevio = temporizadoresDestello.get(elemento);
  if (timerPrevio) {
    clearTimeout(timerPrevio.fadeTimer);
    clearTimeout(timerPrevio.cleanupTimer);
    temporizadoresDestello.delete(elemento);
  }

  // -- Estrategia de resaltado preciso --
  // Siempre que el elemento tenga más texto que el término buscado (más de 4 chars de diferencia),
  // inyectamos un <mark> temporal solo sobre la coincidencia en vez de colorear todo el bloque.
  // Se usa split manual del nodo de texto (más fiable que Range.surroundContents, que lanza
  // excepciones cuando el rango cruza límites de elementos hijos).
  const textoContenido = (elemento.textContent || '').trim();
  const terminoTrim = textoBuscado?.trim() ?? '';
  const esBotonOLink = ['A', 'BUTTON'].includes(elemento.tagName) || !!elemento.closest('button, a, [role="button"], .btn, .boton');
  const esCorto = textoContenido.length <= 60;

  const usarMarkPreciso =
    terminoTrim.length > 0 &&
    textoContenido.length > terminoTrim.length + 4 &&
    !esBotonOLink &&
    !esCorto;

  let markInyectado: HTMLElement | null = null;

  if (usarMarkPreciso) {
    const terminoNorm = terminoTrim
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    // Recorrer los nodos de texto directos del elemento buscando la coincidencia
    const walker = document.createTreeWalker(elemento, NodeFilter.SHOW_TEXT);
    let nodo: Text | null;
    let nodoEncontrado: Text | null = null;
    let idxEnOriginal = -1;
    // Por defecto la longitud del fragmento a marcar es la del término buscado;
    // el paso 3 (fuzzy) puede sobreescribirla si la coincidencia incluye puntuación extra.
    let longitudCoincidencia = terminoTrim.length;

    while ((nodo = walker.nextNode() as Text | null)) {
      const textoNodo = nodo.nodeValue || '';

      // 1. Coincidencia directa case-insensitive — índice correcto en el DOM
      const idxDirecto = textoNodo.toLowerCase().indexOf(terminoTrim.toLowerCase());
      if (idxDirecto !== -1) {
        nodoEncontrado = nodo;
        idxEnOriginal = idxDirecto;
        break;
      }

      // Normalizar una sola vez para los pasos 2 y 3
      const textoNodoNorm = textoNodo
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      // 2. Fallback: coincidencia insensible a tildes
      const idxNorm = textoNodoNorm.indexOf(terminoNorm);
      if (idxNorm !== -1) {
        nodoEncontrado = nodo;
        // El índice en la cadena normalizada es equivalente al del original
        // para texto latino precompuesto (NFD expande y luego se contrae al mismo largo)
        idxEnOriginal = idxNorm;
        break;
      }

      // 3. Frase difusa: permite signos de puntuación/paréntesis entre palabras
      // Cubre casos como buscar "Aprendizaje SENA" cuando el DOM tiene "Aprendizaje (SENA)"
      const palabrasSignificativas = terminoNorm.split(/\s+/).filter((p) => p.length >= 3);
      if (palabrasSignificativas.length >= 2) {
        const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const patronFuzzy = palabrasSignificativas.map(escRe).join('[\\s\\W]*');
        try {
          const reFuzzy = new RegExp(patronFuzzy);
          const mFuzzy = reFuzzy.exec(textoNodoNorm);
          if (mFuzzy) {
            nodoEncontrado = nodo;
            idxEnOriginal = mFuzzy.index;
            longitudCoincidencia = mFuzzy[0].length; // puede incluir puntuación extra
            break;
          }
        } catch { /* ignorar expresión regular inválida */ }
      }
    }

    if (nodoEncontrado !== null && idxEnOriginal !== -1) {
      try {
        // Split manual: más robusto que surroundContents
        const textoOriginal = nodoEncontrado.nodeValue ?? '';
        const antes = textoOriginal.substring(0, idxEnOriginal);
        const coincidencia = textoOriginal.substring(idxEnOriginal, idxEnOriginal + longitudCoincidencia);
        const despues = textoOriginal.substring(idxEnOriginal + longitudCoincidencia);

        const mark = document.createElement('mark');
        mark.textContent = coincidencia;
        mark.style.backgroundColor = '#fff201';
        mark.style.color = '#001631';
        mark.style.outline = '2px solid #facc15';
        mark.style.outlineOffset = '1px';
        mark.style.borderRadius = '3px';
        mark.style.transition = 'all 0.35s ease';
        mark.classList.add('resaltado-busqueda-anim');

        const parentNode = nodoEncontrado.parentNode!;
        if (antes) parentNode.insertBefore(document.createTextNode(antes), nodoEncontrado);
        parentNode.insertBefore(mark, nodoEncontrado);
        if (despues) parentNode.insertBefore(document.createTextNode(despues), nodoEncontrado);
        parentNode.removeChild(nodoEncontrado);

        markInyectado = mark;
      } catch {
        // En caso de error inesperado, caemos al resaltado de bloque completo
        markInyectado = null;
      }
    }
  }


  // Si no se pudo inyectar el mark preciso, resaltar el elemento completo
  if (!markInyectado) {
    elemento.style.transition = 'all 0.35s ease';
    elemento.style.removeProperty('box-shadow');
    elemento.style.backgroundColor = '#fff201';
    elemento.style.color = '#001631';
    elemento.style.outline = '3px solid #facc15';
    elemento.style.outlineOffset = '3px';
    elemento.style.borderRadius = elemento.style.borderRadius || '4px';

    elemento.classList.remove('resaltado-busqueda-anim');
    void elemento.offsetWidth;
    elemento.classList.add('resaltado-busqueda-anim');
  }

  const objetoALimpiar = markInyectado ?? elemento;

  // A los 3.2s, desvanecer suavemente
  const fadeTimer = setTimeout(() => {
    objetoALimpiar.style.backgroundColor = 'transparent';
    objetoALimpiar.style.removeProperty('outline');
    objetoALimpiar.style.removeProperty('outline-offset');

    // Tras los 450ms de transición, limpiar todo
    const cleanupTimer = setTimeout(() => {
      if (markInyectado && markInyectado.parentNode) {
        // Reemplazar el <mark> por su contenido de texto original
        const parent = markInyectado.parentNode;
        while (markInyectado.firstChild) {
          parent.insertBefore(markInyectado.firstChild, markInyectado);
        }
        parent.removeChild(markInyectado);
        parent.normalize();
      } else {
        elemento.style.removeProperty('box-shadow');
        elemento.style.removeProperty('background-color');
        elemento.style.removeProperty('color');
        elemento.style.removeProperty('transition');
        elemento.style.removeProperty('outline');
        elemento.style.removeProperty('outline-offset');
      }
      objetoALimpiar.classList.remove('resaltado-busqueda-anim');
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
 *
 * Después del primer scroll, vigila la posición del elemento durante 4 segundos:
 * si contenedores asíncronos (tablas con API, mapas, etc.) que cargan por encima del
 * elemento lo empujan hacia abajo, se re-ajusta el scroll automáticamente.
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

    /**
     * Vigila la posición del elemento durante maxMs milisegundos y hace re-scroll
     * si detecta que se desplazó más de umbralPx (ocurre cuando contenedores
     * asíncronos que cargan encima empujan el elemento hacia abajo).
     */
    const vigilarPosicion = (
      target: HTMLElement,
      posTopInicial: number,
      centroObjetivo: number,
      maxMs = 4000,
      umbralPx = 80
    ) => {
      const fin = Date.now() + maxMs;
      let ultimaPosTop = posTopInicial;

      const verificar = () => {
        if (Date.now() >= fin) return;
        if (!document.body.contains(target)) return;

        const rActual = target.getBoundingClientRect();
        const posActual = window.pageYOffset + rActual.top;
        const compensacion = Math.min(Math.max(rActual.height / 2, 20), 120);
        const posTopActual = Math.max(0, posActual + compensacion - centroObjetivo);

        if (Math.abs(posTopActual - ultimaPosTop) > umbralPx) {
          window.scrollTo({ top: posTopActual, behavior: 'smooth' });
          ultimaPosTop = posTopActual;
        }

        setTimeout(verificar, 250);
      };

      setTimeout(verificar, 250);
    };

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

        // Vigilar desplazamientos posteriores causados por carga asíncrona
        vigilarPosicion(target, posicionTop, centroObjetivo);

        // Resaltar visualmente:
        // - Con texto buscado → resaltado preciso de la coincidencia
        // - Solo blockId (navegación por hash) → no aplicar destello para no pintar todo el bloque
        if (opciones.texto) {
          aplicarDestello(target, opciones.texto);
        }
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
