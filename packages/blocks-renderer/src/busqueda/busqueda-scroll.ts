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
  claseResaltado = 'bg-sky-400/25 text-sky-200 font-semibold px-0.5 rounded not-italic underline decoration-sky-400/50 underline-offset-2'
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
      // Solo para los elementos que coinciden en texto (1 o 2 en toda la página),
      // comprobamos visibilidad con getBoundingClientRect()
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

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

/**
 * Aplica un destello de acento visual (glow pulsante y fondo luminoso) temporal sobre el elemento encontrado.
 * Garantiza visibilidad en cualquier tema (claro/oscuro) mediante estilos reactivos de alto contraste.
 */
export function aplicarDestello(elemento: HTMLElement): void {
  if (!elemento) return;

  // Guardar estilos previos inline para restauración limpia
  const prevTransition = elemento.style.transition;
  const prevBoxShadow = elemento.style.boxShadow;
  const prevBackgroundColor = elemento.style.backgroundColor;
  const prevBorderRadius = elemento.style.borderRadius;

  // Aplicar halo brillante y fondo de acento
  elemento.style.transition = 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
  elemento.style.boxShadow = '0 0 0 4px #0284c7, 0 0 28px rgba(56, 189, 248, 0.65)';
  elemento.style.backgroundColor = 'rgba(56, 189, 248, 0.22)';
  if (!prevBorderRadius) {
    elemento.style.borderRadius = '8px';
  }

  // Clase CSS complementaria
  elemento.classList.add('resaltado-busqueda-anim');

  // Mantener el halo visible durante 2.6 segundos y desvanecerlo suavemente
  setTimeout(() => {
    elemento.style.boxShadow = '0 0 0 0 transparent';
    elemento.style.backgroundColor = 'transparent';

    setTimeout(() => {
      // Restaurar estado original exacto
      elemento.style.transition = prevTransition;
      elemento.style.boxShadow = prevBoxShadow;
      elemento.style.backgroundColor = prevBackgroundColor;
      elemento.style.borderRadius = prevBorderRadius;
      elemento.classList.remove('resaltado-busqueda-anim');
    }, 400);
  }, 2600);
}

/**
 * Desplaza la vista suavemente hasta el bloque o elemento correspondiente,
 * respetando la barra superior fija (topbar) y aplicando el resaltado de acento.
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
    el = document.getElementById(opciones.blockId);
  }

  if (el) {
    const rect = el.getBoundingClientRect();
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

    // Resaltar visualmente
    aplicarDestello(el);
    return true;
  }

  return false;
}
