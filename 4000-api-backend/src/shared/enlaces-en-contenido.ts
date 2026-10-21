/**
 * Busca enlaces a una ruta dentro del contenido guardado de Puck.
 *
 * Existe para poder responder «¿rompo algo si borro esta sección?» antes de borrarla.
 * Sin esto, eliminar una sección enlazada desde el menú deja una entrada que lleva a
 * ninguna parte, y nadie se entera hasta que un ciudadano la pulsa.
 *
 * ## Por qué recorre el árbol entero en vez de mirar los campos del menú
 *
 * Los enlaces no viven en un sitio: la barra de la intranet los guarda en `menuItems`
 * (con `children` para los submenús), la cabecera del sitio en `navLinks` (también con
 * submenú), el pie en `columnas[].lineas[].url`, y bloques como
 * `DescargasConPresentacion` o `PreguntasFrecuentes` tienen los suyos en `enlaces[]` y
 * `tarjetas[].url`. Enumerar esos caminos sería una lista que se queda corta el día que
 * alguien añada un bloque con enlaces — y se quedaría corta **en silencio**, que en una
 * comprobación de seguridad es lo peor que puede pasar.
 *
 * Recorriendo todo el JSON y recogiendo cualquier `href` o `url`, un bloque nuevo queda
 * cubierto el día que se cree, sin tocar este archivo.
 */

/** Un enlace encontrado, con lo suficiente para que una persona lo localice. */
export interface EnlaceEncontrado {
  /** El texto visible del enlace, si el objeto que lo contiene trae alguno. */
  texto: string | null;
  /** El valor tal cual está guardado. */
  href: string;
  /**
   * El tipo del bloque de Puck que lo contiene (`Footer`, `Header`…), o `null` si está
   * fuera de un bloque (en `root`). Con esto y `campo` el diálogo nombra el sitio exacto
   * con las etiquetas del editor: «Pie de página» › «Enlaces inferiores · fila 3».
   */
  bloque: string | null;
  /** La prop del bloque donde está (`enlacesFila3`, `navLinks`…), o `null` fuera de un bloque. */
  campo: string | null;
}

/** Bloque y prop en los que se está recorriendo. */
interface Ubicacion {
  bloque: string | null;
  campo: string | null;
}

/** Un bloque de Puck: `{ type, props }`, en `content`, en `zones` o dentro de un slot. */
const esBloque = (objeto: Record<string, unknown>): boolean =>
  typeof objeto.type === 'string' && typeof objeto.props === 'object' && objeto.props !== null;

/** Claves que en este contenido significan «a dónde lleva esto». */
const CLAVES_DE_ENLACE = ['href', 'url'];

/**
 * Claves de las que sale el texto visible, en orden de preferencia.
 *
 * `label` lo usan los menús, `texto` el pie, `etiqueta` las descargas y `titulo` las
 * tarjetas. Se busca en el **mismo objeto** que el enlace porque es donde está: un
 * `{ label, href }` es la forma que tienen todos.
 */
const CLAVES_DE_TEXTO = ['label', 'texto', 'etiqueta', 'titulo', 'title'];

/**
 * Normaliza una ruta para poder compararla.
 *
 * Quita la barra final y pasa a minúsculas, de modo que `/Bolsa-De-Empleo/` y
 * `/bolsa-de-empleo` cuenten como el mismo destino. No se tocan las URLs absolutas:
 * `https://otro-sitio/bolsa-de-empleo` apunta fuera y borrar la sección no lo rompe.
 */
const normalizarRuta = (valor: string): string =>
  valor.trim().toLowerCase().replace(/\/+$/, '');

/**
 * Si un valor guardado apunta a la ruta buscada.
 *
 * Acepta la ruta con y sin barra inicial porque el campo lo rellena una persona a mano
 * y las dos formas funcionan en el navegador. Descarta lo que lleve esquema (`http:`,
 * `mailto:`) y lo que solo sea un ancla (`#`).
 */
function apuntaA(valor: string, ruta: string): boolean {
  const limpio = valor.trim();
  if (!limpio || limpio.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(limpio)) return false;

  const objetivo = normalizarRuta(ruta);
  const candidato = normalizarRuta(limpio.startsWith('/') ? limpio : `/${limpio}`);

  // Solo coincidencia exacta: `/bolsa-de-empleo-2024` es otra sección, no esta.
  // Se ignora lo que venga detrás de `?` o `#`, que sigue siendo la misma página.
  return candidato.split(/[?#]/)[0] === objetivo;
}

/**
 * Todos los enlaces del contenido que apuntan a `ruta`.
 *
 * `ruta` se pasa como `/slug`. Devuelve una entrada por enlace encontrado, así que un
 * mismo destino repetido en dos sitios sale dos veces — que es lo que hace falta para
 * decirle a alguien cuántos tiene que quitar.
 */
export function buscarEnlacesA(contenido: unknown, ruta: string): EnlaceEncontrado[] {
  const encontrados: EnlaceEncontrado[] = [];
  // Guarda contra referencias circulares: el JSON de la base no debería tenerlas, pero
  // un recorrido recursivo sin red se cuelga en vez de fallar si algún día las tiene.
  const visitados = new WeakSet<object>();

  /** Apunta los `href`/`url` de `objeto` que llevan a la ruta. */
  const registrar = (objeto: Record<string, unknown>, ubicacion: (clave: string) => Ubicacion): void => {
    for (const clave of CLAVES_DE_ENLACE) {
      const valor = objeto[clave];
      if (typeof valor === 'string' && apuntaA(valor, ruta)) {
        const claveTexto = CLAVES_DE_TEXTO.find((c) => typeof objeto[c] === 'string' && objeto[c]);
        encontrados.push({
          texto: claveTexto ? String(objeto[claveTexto]) : null,
          href: valor,
          ...ubicacion(clave),
        });
      }
    }
  };

  const recorrer = (nodo: unknown, ubicacion: Ubicacion): void => {
    if (nodo === null || typeof nodo !== 'object') return;
    if (visitados.has(nodo)) return;
    visitados.add(nodo);

    if (Array.isArray(nodo)) {
      nodo.forEach((hijo) => recorrer(hijo, ubicacion));
      return;
    }

    const objeto = nodo as Record<string, unknown>;

    // Al entrar en un bloque, cada prop suya es el campo; un bloque dentro de un slot
    // pasa a ser el bloque de lo que tenga dentro.
    if (esBloque(objeto)) {
      const bloque = objeto.type as string;
      const props = objeto.props as Record<string, unknown>;
      visitados.add(props);
      registrar(props, (clave) => ({ bloque, campo: clave }));
      for (const [campo, valor] of Object.entries(props)) recorrer(valor, { bloque, campo });
      return;
    }

    registrar(objeto, () => ubicacion);
    Object.values(objeto).forEach((hijo) => recorrer(hijo, ubicacion));
  };

  recorrer(contenido, { bloque: null, campo: null });
  return encontrados;
}
