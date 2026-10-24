import type { PaginaDelIndice, ResultadoDeBusqueda } from '../types';

/**
 * Normaliza una cadena de texto para comparación insensible a mayúsculas y tildes.
 */
export const normalizarTexto = (texto: string): string =>
  (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * Extrae un fragmento relevante de texto alrededor de la coincidencia para una lectura cómoda.
 */
export function extraerFragmentoRelevante(textoCompleto: string, consulta: string, longitudMax: number = 180): string {
  if (!textoCompleto || textoCompleto.length <= longitudMax) {
    return textoCompleto || '';
  }

  const textoNorm = normalizarTexto(textoCompleto);
  const qNorm = normalizarTexto(consulta).trim();
  const index = textoNorm.indexOf(qNorm);

  if (index === -1) {
    // Si la coincidencia fue por palabras sueltas, buscar la primera palabra significativa
    const palabras = qNorm.split(/\s+/).filter((p) => p.length >= 3);
    for (const palabra of palabras) {
      const idxPalabra = textoNorm.indexOf(palabra);
      if (idxPalabra !== -1) {
        return recortarAlrededor(textoCompleto, idxPalabra, palabra.length, longitudMax);
      }
    }
    return textoCompleto.slice(0, longitudMax) + '…';
  }

  return recortarAlrededor(textoCompleto, index, qNorm.length, longitudMax);
}

function recortarAlrededor(texto: string, inicio: number, longitudCoincidencia: number, longitudMax: number): string {
  const margen = Math.floor((longitudMax - longitudCoincidencia) / 2);
  let inicioCorte = Math.max(0, inicio - margen);
  let finCorte = Math.min(texto.length, inicio + longitudCoincidencia + margen);

  // Ajustar inicio a límite de palabra
  if (inicioCorte > 0) {
    const espacioPrevio = texto.indexOf(' ', inicioCorte);
    if (espacioPrevio !== -1 && espacioPrevio < inicio) {
      inicioCorte = espacioPrevio + 1;
    }
  }

  // Ajustar fin a límite de palabra
  if (finCorte < texto.length) {
    const espacioSiguiente = texto.lastIndexOf(' ', finCorte);
    if (espacioSiguiente !== -1 && espacioSiguiente > inicio + longitudCoincidencia) {
      finCorte = espacioSiguiente;
    }
  }

  const prefijo = inicioCorte > 0 ? '… ' : '';
  const sufijo = finCorte < texto.length ? ' …' : '';
  return prefijo + texto.slice(inicioCorte, finCorte).trim() + sufijo;
}

/**
 * Normaliza una ruta, URL o slug para una comparación robusta y dinámica.
 * Remueve query strings, hashes, barras redundantes y prefijos de edición (/edit/ o /preview/).
 */
export function normalizarRutaParaComparacion(ruta?: string | null): string {
  if (!ruta) return '';
  try {
    let path = String(ruta).trim();
    // Si viene como URL completa (ej: http://localhost:3000/mi-pagina)
    if (path.includes('://')) {
      try {
        path = new URL(path).pathname;
      } catch {
        // mantener path si falla URL parser
      }
    }
    // Remover query string y hash
    path = path.split(/[?#]/)[0].trim().toLowerCase();

    // Decodificar caracteres especiales (ej: %20, tildes)
    try {
      path = decodeURIComponent(path);
    } catch {
      // ignorar si no está codificado
    }

    // Normalizar rutas del editor o preview de Next.js para extraer el slug real
    path = path.replace(/^\/edit\//, '/').replace(/^\/preview\//, '/');

    // Limpiar barras múltiples o redundantes
    path = path.replace(/\/+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');

    // Caso especial de raíz
    if (path === '' || path === 'inicio') {
      return 'inicio';
    }

    return path;
  } catch {
    return (ruta || '')
      .split(/[?#]/)[0]
      .trim()
      .toLowerCase()
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');
  }
}

/**
 * Determina dinámicamente si una página o resultado coincide con la página
 * donde el usuario está parado actualmente.
 */
export function esMismaPagina(
  rutaA?: string | null,
  rutaB?: string | null,
  slugA?: string | null,
  slugB?: string | null
): boolean {
  if (!rutaA || !rutaB) return false;

  const normA = normalizarRutaParaComparacion(rutaA);
  const normB = normalizarRutaParaComparacion(rutaB);

  if (!normA || !normB) return false;

  // 1. Coincidencia directa de ruta normalizada (ej: 'resultados-del-buscador' === 'resultados-del-buscador')
  if (normA === normB) return true;

  // 2. Coincidencia por slug explícito o por último segmento significativo
  const sA = (slugA ? normalizarRutaParaComparacion(slugA) : normA.split('/').filter(Boolean).pop() || '').trim();
  const sB = (slugB ? normalizarRutaParaComparacion(slugB) : normB.split('/').filter(Boolean).pop() || '').trim();

  if (sA && sB && sA === sB) {
    return true;
  }

  return false;
}

/**
 * Consulta y filtra el índice local de páginas del sitio web OLO.
 * Utiliza búsqueda difusa insensible a tildes, mayúsculas y signos de puntuación intermedios.
 * Excluye dinámicamente cualquier resultado perteneciente a la página en la que se encuentra montado el componente.
 */
export function buscarEnIndiceLocal(
  indice: PaginaDelIndice[],
  consulta: string,
  rutaExcluida?: string
): ResultadoDeBusqueda[] {
  if (!Array.isArray(indice) || !consulta || consulta.trim() === '') {
    return [];
  }

  const qNorm = normalizarTexto(consulta).replace(/[\s ]+/g, ' ').trim();
  const palabrasQ = qNorm.split(' ').filter((p) => p.length >= 3);

  // Expresión regular difusa: tolera signos de puntuación o paréntesis entre palabras
  let reFraseDifusa: RegExp | null = null;
  if (qNorm.includes(' ')) {
    const palabrasQ2 = qNorm.split(' ').filter((p) => p.length >= 2);
    if (palabrasQ2.length >= 2) {
      try {
        const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        reFraseDifusa = new RegExp(palabrasQ2.map(escapeRe).join('[\\s\\W]*'));
      } catch {
        /* regex inválida ignorada */
      }
    }
  }

  interface ResultadoConPuntaje extends ResultadoDeBusqueda {
    puntaje: number;
  }

  const resultados: ResultadoConPuntaje[] = [];
  const clavesVistas = new Set<string>();

  indice.forEach((page) => {
    // La página donde se muestran los resultados no se ofrece como resultado de sí misma.
    if (rutaExcluida && esMismaPagina(page.href, rutaExcluida, page.slug)) {
      return;
    }

    const contexto = page.titulo || page.items[0]?.text || 'Observatorio Laboral';
    const contextoNorm = normalizarTexto(contexto);
    const coincideContexto = contextoNorm.includes(qNorm);

    page.items.forEach((item) => {
      const itemNorm = normalizarTexto(item.text).replace(/[\s ]+/g, ' ');

      const coincideFraseExacta = itemNorm.includes(qNorm) || coincideContexto;
      const coincideFraseDifusa =
        reFraseDifusa !== null && (reFraseDifusa.test(itemNorm) || reFraseDifusa.test(contextoNorm));
      const coincidePalabras =
        palabrasQ.length > 1 &&
        palabrasQ.every((p) => itemNorm.includes(p) || contextoNorm.includes(p));

      if (coincideFraseExacta || coincideFraseDifusa || coincidePalabras) {
        // Clave única para evitar duplicados en la misma página con idéntico texto
        const claveUnica = `${page.href}::${item.text.trim().slice(0, 80)}`;
        if (clavesVistas.has(claveUnica)) return;
        clavesVistas.add(claveUnica);

        // Cálculo de relevancia para ordenamiento intuitivo
        let puntaje = 0;
        if (item.type === 'h1' || coincideContexto) puntaje += 100;
        else if (item.type === 'h2') puntaje += 60;
        else puntaje += 20;

        if (coincideFraseExacta) puntaje += 50;
        if (itemNorm.startsWith(qNorm)) puntaje += 30;

        resultados.push({
          href: page.href,
          type: item.type,
          text: extraerFragmentoRelevante(item.text, consulta, 220),
          context: contexto,
          blockId: item.blockId,
          puntaje,
        });
      }
    });
  });

  resultados.sort((a, b) => b.puntaje - a.puntaje);

  return resultados.map(({ puntaje: _, ...resto }) => resto);
}
