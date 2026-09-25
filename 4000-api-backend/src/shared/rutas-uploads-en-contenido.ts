/**
 * Qué archivos de `/uploads/` nombra un contenido guardado de Puck.
 *
 * Es solo lectura del JSON, sin disco ni base: por eso vive aquí, junto a
 * `enlaces-en-contenido.ts` y `extraer-textos-puck.ts`, y no en el almacenamiento. La usan
 * quienes necesitan la lista de candidatos de una página —publicar, restaurar, eliminar
 * una sección— antes de preguntar si alguien más los usa
 * (`PaginaRepository.rutasEnUso`) y de tocar el disco (`infrastructure/storage`).
 *
 * Recorre el árbol entero en vez de mirar campos concretos, por lo mismo que
 * `buscarEnlacesA`: un bloque nuevo con archivos queda cubierto el día que se cree.
 */
export function extraerRutasUploads(contenido: unknown): string[] {
  const rutas = new Set<string>();

  function recorrer(nodo: unknown) {
    if (!nodo) return;

    if (typeof nodo === 'string') {
      const nodoTrim = nodo.trim();
      if (nodoTrim.startsWith('/uploads/') && !nodoTrim.includes('"') && !nodoTrim.includes('\n')) {
        const rutaLimpia = nodoTrim.split(/[?#]/)[0].replace(/[\),;:.]+$/, '');
        try {
          rutas.add(decodeURIComponent(rutaLimpia));
        } catch {
          rutas.add(rutaLimpia);
        }
      }

      const coincidencias = nodo.match(/\/uploads\/[^\s"'<>]+/g);
      if (coincidencias) {
        for (const m of coincidencias) {
          const rutaLimpia = m.split(/[?#]/)[0].replace(/[\),;:.]+$/, '');
          try {
            rutas.add(decodeURIComponent(rutaLimpia));
          } catch {
            rutas.add(rutaLimpia);
          }
        }
      }
      return;
    }

    if (Array.isArray(nodo)) {
      for (const elemento of nodo) {
        recorrer(elemento);
      }
      return;
    }

    if (typeof nodo === 'object') {
      for (const valor of Object.values(nodo as Record<string, unknown>)) {
        recorrer(valor);
      }
    }
  }

  recorrer(contenido);
  return Array.from(rutas);
}
