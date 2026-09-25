import { QueryInterface, QueryTypes } from 'sequelize';

export const nombre = '015-inicio-texto-enriquecido';

/**
 * Pasa los campos de la portada del sitio de «texto con `**`» a texto enriquecido.
 *
 * ## Por qué
 *
 * Varios bloques guardaban el título en un campo de texto plano donde la negrita se
 * marcaba con dobles asteriscos (`**Recursos** visuales`), y un helper —`resaltar()`—
 * los traducía a `<strong>` al pintar. Funcionaba, pero le pedía sintaxis de Markdown
 * a un funcionario en un panel que evita la jerga a propósito
 * (`2-convenciones-del-proyecto.md`), y solo sabía hacer negrita: ni cursiva, ni
 * enlaces, ni una lista.
 *
 * Esos campos pasan a `type: 'richtext'`, que Puck trae de serie y guarda **HTML**. El
 * helper `resaltar()` ya no interviene, así que un contenido que se quede con los
 * asteriscos se vería con los asteriscos puestos, literales, en la página pública. De
 * ahí esta migración: no es una mejora opcional, es lo que evita que la portada quede
 * mal escrita en cuanto se despliegue el código nuevo.
 *
 * ## Qué se toca
 *
 * Todas las versiones de `paginas_versiones`, **no solo la publicada**. Un borrador o
 * algo en revisión se abre en el editor igual que lo demás, y si se queda con los
 * asteriscos reaparecen en cuanto alguien lo apruebe. Convertirlo todo es lo único
 * que deja el ciclo editorial coherente.
 *
 * ## De regalo, tres campos que el editor no podía tocar
 *
 * - `Hero.heading` → `Hero.titulo`. El JSON guardado ya llevaba un `heading` con la
 *   frase del titular, pero no había campo que lo editara ni render que lo leyera: el
 *   texto estaba escrito a mano en el JSX de `OcupacionSearchBanner`. Se conserva el
 *   valor guardado si lo hay, y si no se siembra el que estaba en el código, para que
 *   la portada diga exactamente lo mismo antes y después.
 * - `Services[].description` y las descripciones de portales se envuelven en `<p>`:
 *   eran texto plano y el editor de texto enriquecido espera bloques.
 * - `portals[].gradient` se descompone en `colorInicio` y `colorFin`, que es lo que
 *   ahora ofrecen dos selectores de color en vez de una línea de CSS a mano.
 *
 * ## Reversible
 *
 * `down()` deshace la conversión: vuelve a `**`, restaura `heading` y recompone el
 * `gradient`. Solo desanda lo que esta migración sabe haber hecho, así que el formato
 * enriquecido que alguien escriba DESPUÉS (una lista, un enlace) no sobrevive a la
 * vuelta atrás — se avisa en el log en vez de perderlo en silencio.
 */

/** Una versión de página tal como se lee de la tabla. */
interface FilaVersion {
  id: string;
  contenido: unknown;
}

/** Bloque de Puck. `props` es libre: cada bloque declara los suyos. */
interface BloquePuck {
  type?: string;
  props?: Record<string, unknown>;
  [clave: string]: unknown;
}

const HEADING_ORIGINAL =
  'Explora las ocupaciones clave de los sectores productivos en Colombia.';

const TITULO_HERO_POR_DEFECTO =
  '<p><em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong></p>';

/** `&` va primero o volvería a escapar los `&` que introducen los demás. */
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * `**negrita**` → `<strong>negrita</strong>`, y los saltos de línea a `<br>`.
 *
 * Reproduce lo que hacía `resaltar()` al pintar —tramos impares en negrita, `\n` como
 * `<br>`— para que el resultado se vea igual que antes. El texto se escapa primero:
 * viene de un campo que hasta hoy era texto plano, así que un `<` suelto era
 * perfectamente válido ahí y no debe convertirse en una etiqueta al guardarlo como
 * HTML.
 */
function aHtml(texto: string): string {
  const tramos = texto.split('**');
  const cuerpo = tramos
    .map((tramo, indice) => {
      const escapado = escaparHtml(tramo).replace(/\n/g, '<br>');
      return indice % 2 === 1 ? `<strong>${escapado}</strong>` : escapado;
    })
    .join('');

  return `<p>${cuerpo}</p>`;
}

/** Deshace `aHtml` en la medida de lo posible. */
function aTextoPlano(html: string): string {
  return html
    .replace(/^<p>/, '')
    .replace(/<\/p>$/, '')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** True si el valor ya es HTML, para no envolverlo dos veces al re-ejecutar. */
function yaEsHtml(valor: unknown): valor is string {
  return typeof valor === 'string' && /^\s*<(p|h[1-6]|ul|ol|div)\b/i.test(valor);
}

/** Convierte un campo de texto a HTML, dejándolo igual si ya lo era. */
function convertirCampo(props: Record<string, unknown>, clave: string): boolean {
  const valor = props[clave];
  if (typeof valor !== 'string' || valor.trim() === '') return false;
  if (yaEsHtml(valor)) return false;
  props[clave] = aHtml(valor);
  return true;
}

function revertirCampo(props: Record<string, unknown>, clave: string): boolean {
  const valor = props[clave];
  if (!yaEsHtml(valor)) return false;
  props[clave] = aTextoPlano(valor);
  return true;
}

/** Los dos colores de un `linear-gradient(...)` de dos paradas. */
function coloresDeGradiente(gradiente: unknown): [string, string] | null {
  if (typeof gradiente !== 'string') return null;
  const hex = gradiente.match(/#[0-9a-fA-F]{3,8}/g);
  if (!hex || hex.length < 2) return null;
  return [hex[0], hex[hex.length - 1]];
}

function esLista(valor: unknown): valor is Record<string, unknown>[] {
  return Array.isArray(valor);
}

/**
 * Aplica la conversión a un árbol de contenido de Puck. Devuelve si cambió algo.
 *
 * Recorre `content` a un nivel: los bloques de la portada no se anidan hoy. Si algún
 * día se meten dentro de un `Grid` —que los admite en un `slot`— hará falta recorrer
 * también esos huecos.
 */
export function convertirContenido(contenido: unknown, sentido: 'up' | 'down'): boolean {
  const raiz = contenido as { content?: unknown } | null;
  if (!raiz || !Array.isArray(raiz.content)) return false;

  const campo = sentido === 'up' ? convertirCampo : revertirCampo;
  let cambio = false;

  for (const bloque of raiz.content as BloquePuck[]) {
    const props = bloque?.props;
    if (!props || typeof props !== 'object') continue;

    switch (bloque.type) {
      case 'Hero': {
        if (sentido === 'up') {
          if (props.titulo === undefined) {
            const heading = props.heading;
            props.titulo =
              typeof heading === 'string' && heading.trim() !== ''
                ? aHtml(heading)
                : TITULO_HERO_POR_DEFECTO;
            cambio = true;
          }
          // `heading` ya no lo lee nadie; se retira para que no queden dos textos
          // distintos conviviendo y no se sepa cuál manda.
          if ('heading' in props) {
            delete props.heading;
            cambio = true;
          }
        } else {
          if (typeof props.titulo === 'string') {
            props.heading = aTextoPlano(props.titulo) || HEADING_ORIGINAL;
            delete props.titulo;
            cambio = true;
          }
        }
        break;
      }

      case 'Services': {
        if (esLista(props.services)) {
          for (const servicio of props.services) {
            if (campo(servicio, 'description')) cambio = true;
          }
        }
        break;
      }

      case 'RecursosVisualesBloque':
      case 'Publicaciones': {
        if (campo(props, 'titulo')) cambio = true;
        break;
      }

      case 'ExternalPortals': {
        if (campo(props, 'title')) cambio = true;
        if (esLista(props.portals)) {
          for (const portal of props.portals) {
            if (campo(portal, 'description')) cambio = true;

            if (sentido === 'up') {
              // El `gradient` se conserva: `ExternalPortals.tsx` lo usa de respaldo
              // si faltara alguno de los dos colores, y borrarlo dejaría sin fondo a
              // cualquier tarjeta cuyo degradado no se pudiera descomponer.
              if (portal.colorInicio === undefined || portal.colorFin === undefined) {
                const colores = coloresDeGradiente(portal.gradient);
                if (colores) {
                  portal.colorInicio = colores[0];
                  portal.colorFin = colores[1];
                  cambio = true;
                }
              }
            } else if (portal.colorInicio !== undefined || portal.colorFin !== undefined) {
              delete portal.colorInicio;
              delete portal.colorFin;
              cambio = true;
            }
          }
        }
        break;
      }
    }
  }

  return cambio;
}

/** Recorre todas las versiones y guarda solo las que cambian. */
async function migrar(queryInterface: QueryInterface, sentido: 'up' | 'down'): Promise<void> {
  const sql = queryInterface.sequelize;

  // **Solo el ámbito `sitio`.** Esta migración se escribió filtrando por tipo de
  // bloque y eso no bastaba: `RecursosVisualesBloque` y `Publicaciones` existen en
  // las DOS aplicaciones, y la intranet los sigue declarando como `type: 'text'`,
  // pintándolos con `resaltar()`. Convertir allí su título a HTML hacía que la
  // intranet mostrara el código en pantalla, literal, en vez del texto. Lo que
  // separa un caso del otro no es el bloque sino la app, así que el filtro va aquí.
  //
  // El daño que llegó a hacerse en la primera versión de esta migración lo repara
  // `018-revertir-titulos-intranet`.
  const filas = (await sql.query(
    `SELECT v.id, v.contenido
       FROM paginas_versiones v
       JOIN paginas p ON p.id = v.pagina_id
      WHERE p.ambito = 'sitio'
      ORDER BY v.creado_en`,
    { type: QueryTypes.SELECT }
  )) as FilaVersion[];

  let tocadas = 0;

  for (const fila of filas) {
    // JSONB llega ya parseado con el driver de Postgres, pero una columna guardada
    // como texto en algún entorno llegaría como cadena; se cubren los dos casos.
    let contenido: unknown = fila.contenido;
    if (typeof contenido === 'string') {
      try {
        contenido = JSON.parse(contenido);
      } catch {
        console.warn(`[${nombre}] versión ${fila.id}: contenido ilegible, se omite`);
        continue;
      }
    }

    if (!convertirContenido(contenido, sentido)) continue;

    await sql.query(
      `UPDATE paginas_versiones SET contenido = :contenido::jsonb WHERE id = :id`,
      { replacements: { contenido: JSON.stringify(contenido), id: fila.id } }
    );
    tocadas += 1;
  }

  console.log(
    `[${nombre}] ${sentido}: ${tocadas} de ${filas.length} versiones actualizadas.`
  );
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  await migrar(queryInterface, 'up');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.warn(
    `[${nombre}] La vuelta atrás recupera el formato de asteriscos, pero el formato ` +
      'que se haya añadido desde el editor después de la migración (listas, enlaces, ' +
      'cursivas) no tiene equivalente en texto plano y se pierde.'
  );
  await migrar(queryInterface, 'down');
}
