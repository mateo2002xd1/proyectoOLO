import { QueryInterface, QueryTypes } from 'sequelize';

export const nombre = '018-revertir-titulos-intranet';

/**
 * Devuelve a texto plano los títulos que `015` convirtió de más en la intranet.
 *
 * ## Qué pasó
 *
 * La `015` pasa a HTML los campos que usaban el truco de `**negrita**`, y elegía qué
 * convertir **por tipo de bloque**. Eso no bastaba: `RecursosVisualesBloque` y
 * `Publicaciones` existen en las dos aplicaciones, y solo el sitio web migró a
 * `type: 'richtext'`. En la intranet esos títulos siguen declarados como
 * `type: 'text'` y se pintan con `resaltar()`, que no interpreta HTML — así que
 * `<p><strong>Recursos</strong> visuales</p>` se veía **en pantalla, literal**, en la
 * portada de la intranet.
 *
 * Lo que separa un caso del otro no es el bloque sino la app. La `015` ya filtra por
 * `ambito = 'sitio'`; esta migración repara lo que aquella alcanzó a convertir antes
 * de llevar el filtro.
 *
 * ## Por qué una migración nueva y no un arreglo de la 015
 *
 * La `015` está aplicada y anotada en `migraciones_aplicadas`. Reescribirla y ya está
 * dejaría esta base con los datos mal y el registro diciendo que todo fue bien. Con
 * las dos, los dos caminos acaban igual:
 *
 *  - Base ya migrada: la `015` (mal) dejó el destrozo → esta lo repara.
 *  - Base nueva: la `015` (con filtro) no toca la intranet → esta no encuentra nada.
 *
 * ## Alcance
 *
 * Solo `ambito = 'intranet'`, solo los dos bloques compartidos y solo su `titulo`.
 * Medido antes de escribirla: 46 versiones, de ellas 1 publicada. No toca el sitio
 * web, donde la conversión sí es la buena.
 */

interface FilaVersion {
  id: string;
  contenido: unknown;
}

interface BloquePuck {
  type?: string;
  props?: Record<string, unknown>;
}

/** Los dos bloques que comparten nombre entre las dos apps. */
const BLOQUES_COMPARTIDOS = ['RecursosVisualesBloque', 'Publicaciones'];

/**
 * Deshace lo que hizo `aHtml()` en la 015.
 *
 * Es la inversa exacta de aquella y no un limpiador de HTML general: solo sabe
 * deshacer `<p>`, `<strong>` y `<br>`, que es lo único que aquella pudo generar a
 * partir de un campo de texto con asteriscos.
 */
function aTextoPlano(html: string): string {
  return html
    .replace(/^<p>/i, '')
    .replace(/<\/p>$/i, '')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Solo lo que empieza por `<p>`: es la firma de lo que generó la 015. */
function loConvirtioLa015(valor: unknown): valor is string {
  return typeof valor === 'string' && /^\s*<p>/i.test(valor);
}

function revertirContenido(contenido: unknown): boolean {
  const raiz = contenido as { content?: unknown } | null;
  if (!raiz || !Array.isArray(raiz.content)) return false;

  let cambio = false;

  for (const bloque of raiz.content as BloquePuck[]) {
    if (!bloque?.props || !BLOQUES_COMPARTIDOS.includes(bloque.type ?? '')) continue;
    if (!loConvirtioLa015(bloque.props.titulo)) continue;

    bloque.props.titulo = aTextoPlano(bloque.props.titulo);
    cambio = true;
  }

  return cambio;
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  const filas = (await sql.query(
    `SELECT v.id, v.contenido
       FROM paginas_versiones v
       JOIN paginas p ON p.id = v.pagina_id
      WHERE p.ambito = 'intranet'
      ORDER BY v.creado_en`,
    { type: QueryTypes.SELECT }
  )) as FilaVersion[];

  let tocadas = 0;

  for (const fila of filas) {
    let contenido: unknown = fila.contenido;
    if (typeof contenido === 'string') {
      try {
        contenido = JSON.parse(contenido);
      } catch {
        console.warn(`[${nombre}] versión ${fila.id}: contenido ilegible, se omite`);
        continue;
      }
    }

    if (!revertirContenido(contenido)) continue;

    await sql.query(
      `UPDATE paginas_versiones SET contenido = :contenido::jsonb WHERE id = :id`,
      { replacements: { contenido: JSON.stringify(contenido), id: fila.id } }
    );
    tocadas += 1;
  }

  console.log(
    `[${nombre}] ${tocadas} de ${filas.length} versiones de intranet devueltas a texto plano.`
  );
}

/**
 * No hay vuelta atrás, y es lo correcto.
 *
 * Deshacer esto sería volver a poner HTML en unos campos que la intranet pinta como
 * texto: reintroducir el fallo a propósito. Si algún día la intranet pasa esos
 * títulos a `richtext`, lo que toca es una migración nueva que los convierta con
 * intención, no revertir esta.
 */
export async function down(): Promise<void> {
  console.log(
    `[${nombre}] Sin vuelta atrás: revertirla dejaría HTML crudo en campos que la ` +
      'intranet pinta como texto plano.'
  );
}
