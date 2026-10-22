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
 * Recorriendo todo el JSON, un bloque nuevo queda cubierto el día que se cree **si** sus
 * enlaces se guardan en alguno de los campos de `CLAVES_DE_ENLACE` (`href`, `url`,
 * `urlEnlace`, `enlaceBoton`…). Lo que no se puede adivinar es el nombre del campo: un
 * bloque que guarde su enlace con otro nombre no se vería aquí, y borrar la página a la
 * que apunta dejaría un enlace roto sin aviso. Al crear un bloque con enlaces, usar uno
 * de esos nombres o añadir el suyo a la lista.
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
const CLAVES_DE_ENLACE = [
  'href',
  'url',
  'urlEnlace',
  'enlace',
  'enlaceBoton',
  'govBannerEnlace',
  'link',
  'urlDestino',
  // La página de resultados del buscador de ocupaciones, en la cabecera de «Menú y pie».
  'paginaDelBuscador',
];

/**
 * Los `href="…"` de un texto con marcado (los campos de texto enriquecido guardan HTML).
 * Cada coincidencia trae el valor en el grupo 3.
 */
const ANCLAS_EN_HTML = /(\bhref\s*=\s*)(["'])(.*?)\2/gi;

/** Si un texto parece llevar enlaces escritos como HTML. */
const llevaAnclas = (valor: string): boolean => /\bhref\s*=/i.test(valor);

/**
 * El texto visible de una ancla (`<a href="…">texto</a>`): lo que hay entre su etiqueta de
 * apertura y su cierre, sin marcado. `desde` es donde acaba el `href="…"` encontrado. Sin él,
 * el «texto» del enlace sería el HTML entero del campo donde está.
 */
const textoDeAncla = (html: string, desde: number): string | null => {
  const finDeApertura = html.indexOf('>', desde);
  if (finDeApertura === -1) return null;
  const cierre = html.toLowerCase().indexOf('</a', finDeApertura);
  const interior = html
    .slice(finDeApertura + 1, cierre === -1 ? undefined : cierre)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return interior || null;
};

/** Lo que sigue a la ruta (`?consulta`, `#ancla`), que sigue valiendo tras cambiarla. */
const restoDeLaRuta = (valor: string): string => {
  const corte = valor.search(/[?#]/);
  return corte === -1 ? '' : valor.slice(corte);
};

/**
 * Claves de las que sale el texto visible, en orden de preferencia.
 *
 * `label` lo usan los menús, `texto` el pie y los botones, `etiqueta` las descargas y
 * `titulo` las tarjetas. Se busca en el **mismo objeto** que el enlace o se hereda
 * del bloque contenedor.
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
 * `mailto:`), lo que solo sea un ancla (`#`) y la URL sin esquema (`//otro-sitio/ruta`), que
 * el navegador resuelve hacia fuera aunque empiece por barra.
 */
function apuntaA(valor: string, destino: Destino): boolean {
  const limpio = valor.trim();
  if (!limpio || limpio.startsWith('#') || limpio.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(limpio)) {
    return false;
  }

  const candidato = normalizarRuta(limpio.startsWith('/') ? limpio : `/${limpio}`).split(/[?#]/)[0];

  // Solo coincidencia exacta: `/bolsa-de-empleo-2024` es otra sección, no esta.
  // Se ignora lo que venga detrás de `?` o `#`, que sigue siendo la misma página.
  return typeof destino === 'function' ? destino(candidato) : candidato === normalizarRuta(destino);
}

/**
 * A dónde puede llevar un enlace: una ruta exacta, o una función que dice si una ruta
 * (ya normalizada y sin `?` ni `#`) cuenta. La función existe para las páginas cuya ruta
 * no sale solo de su slug (las del sitio, que las arma el menú).
 */
type Destino = string | ((ruta: string) => boolean);

/**
 * Todos los enlaces del contenido que apuntan a `ruta`.
 *
 * `ruta` se pasa como `/slug` (o como función, ver `Destino`). Devuelve una entrada por enlace encontrado, así que un
 * mismo destino repetido en dos sitios sale dos veces — que es lo que hace falta para
 * decirle a alguien cuántos tiene que quitar.
 */
export function buscarEnlacesA(contenido: unknown, ruta: Destino): EnlaceEncontrado[] {
  const encontrados: EnlaceEncontrado[] = [];
  // Guarda contra referencias circulares: el JSON de la base no debería tenerlas, pero
  // un recorrido recursivo sin red se cuelga en vez de fallar si algún día las tiene.
  const visitados = new WeakSet<object>();

  /** Apunta los enlaces de `objeto` que llevan a la ruta. */
  const registrar = (
    objeto: Record<string, unknown>,
    ubicacion: (clave: string) => Ubicacion,
    textoDelBloque: string | null
  ): void => {
    for (const [clave, valor] of Object.entries(objeto)) {
      if (typeof valor !== 'string') continue;
      const claveTexto = CLAVES_DE_TEXTO.find((c) => typeof objeto[c] === 'string' && objeto[c]);
      const textoVisible = claveTexto ? String(objeto[claveTexto]) : textoDelBloque;

      if (CLAVES_DE_ENLACE.includes(clave)) {
        if (apuntaA(valor, ruta)) {
          encontrados.push({ texto: textoVisible, href: valor, ...ubicacion(clave) });
        }
        continue;
      }

      // Un enlace dentro de un texto enriquecido (`<a href="/pagina">`): no tiene campo
      // propio, así que se busca en el HTML de cualquier otro campo de texto.
      if (llevaAnclas(valor)) {
        for (const ancla of valor.matchAll(ANCLAS_EN_HTML)) {
          if (apuntaA(ancla[3], ruta)) {
            const textoAncla = textoDeAncla(valor, (ancla.index ?? 0) + ancla[0].length);
            encontrados.push({ texto: textoAncla, href: ancla[3], ...ubicacion(clave) });
          }
        }
      }
    }
  };

  const recorrer = (nodo: unknown, ubicacion: Ubicacion, textoDelBloque: string | null): void => {
    if (nodo === null || typeof nodo !== 'object') return;
    if (visitados.has(nodo)) return;
    visitados.add(nodo);

    if (Array.isArray(nodo)) {
      nodo.forEach((hijo) => recorrer(hijo, ubicacion, textoDelBloque));
      return;
    }

    const objeto = nodo as Record<string, unknown>;

    // Al entrar en un bloque, cada prop suya es el campo; un bloque dentro de un slot
    // pasa a ser el bloque de lo que tenga dentro.
    if (esBloque(objeto)) {
      const bloque = objeto.type as string;
      const props = objeto.props as Record<string, unknown>;
      visitados.add(props);

      const claveTextoProp = CLAVES_DE_TEXTO.find((c) => typeof props[c] === 'string' && props[c]);
      const textoDeProps = claveTextoProp ? String(props[claveTextoProp]) : null;

      registrar(props, (clave) => ({ bloque, campo: clave }), textoDeProps);
      for (const [campo, valor] of Object.entries(props)) {
        recorrer(valor, { bloque, campo }, textoDeProps);
      }
      return;
    }

    registrar(objeto, () => ubicacion, textoDelBloque);
    Object.values(objeto).forEach((hijo) => recorrer(hijo, ubicacion, textoDelBloque));
  };

  recorrer(contenido, { bloque: null, campo: null }, null);
  return encontrados;
}

/**
 * Una copia del contenido con los enlaces a `ruta` apuntando a `nuevoHref`, y cuántos se
 * cambiaron. No toca el original.
 *
 * Recorre lo mismo que `buscarEnlacesA` y con las mismas reglas de «a dónde lleva»
 * (`apuntaA`), así que lo que el análisis enseñó es exactamente lo que se reescribe: las
 * claves de `CLAVES_DE_ENLACE` y los `href` de los textos enriquecidos. Lo que va detrás de
 * `?` o `#` se conserva (`/vieja?buscar=1#a` → `/nueva?buscar=1#a`).
 *
 * `nuevoHref` va con su barra inicial y sin resto; no se valida aquí: quien llama ya decidió
 * que la ruta nueva es buena.
 */
export function reemplazarEnlaces(
  contenido: unknown,
  ruta: Destino,
  nuevoHref: string
): { contenido: unknown; cambiados: number } {
  let cambiados = 0;
  const copia = structuredClone(contenido);
  const visitados = new WeakSet<object>();

  const nuevoValor = (valor: string): string => {
    cambiados += 1;
    return `${nuevoHref}${restoDeLaRuta(valor.trim())}`;
  };

  const recorrer = (nodo: unknown): void => {
    if (nodo === null || typeof nodo !== 'object' || visitados.has(nodo)) return;
    visitados.add(nodo);

    if (Array.isArray(nodo)) {
      nodo.forEach(recorrer);
      return;
    }

    const objeto = nodo as Record<string, unknown>;
    for (const [clave, valor] of Object.entries(objeto)) {
      if (typeof valor !== 'string') {
        recorrer(valor);
      } else if (CLAVES_DE_ENLACE.includes(clave)) {
        if (apuntaA(valor, ruta)) objeto[clave] = nuevoValor(valor);
      } else if (llevaAnclas(valor)) {
        objeto[clave] = valor.replace(ANCLAS_EN_HTML, (completo, antes, comilla, href) =>
          apuntaA(href, ruta) ? `${antes}${comilla}${nuevoValor(href)}${comilla}` : completo
        );
      }
    }
  };

  recorrer(copia);
  return { contenido: copia, cambiados };
}
