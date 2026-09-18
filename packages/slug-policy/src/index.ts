/**
 * Cómo se convierte el nombre de una sección en su ruta.
 *
 * Vive en un paquete compartido y no en cada app por la misma razón que
 * `@olo/password-policy`: la regla la aplican **tres** sitios y tienen que dar el
 * mismo resultado o el producto miente. El diálogo de «Nueva sección» enseña la
 * ruta mientras se escribe el nombre, y la API la vuelve a calcular al crear —
 * porque lo que manda el navegador nunca es la autoridad. Si las dos versiones
 * divergieran, la persona vería `/bolsa-de-empleo` y acabaría con otra cosa.
 *
 * Consumidores: `api-backend` (autoridad), `intranet` y `sitio-web` (vista previa).
 */

/**
 * Tope de longitud del slug.
 *
 * La columna `paginas.slug` es `VARCHAR(255)`, así que esto no la protege: protege
 * la URL. 80 caracteres ya son una ruta incómoda de leer y de pegar en un menú, y
 * el nombre largo sigue vivo en `paginas.titulo`, que es lo que se muestra.
 */
export const LONGITUD_MAX_SLUG = 80;

/** Mínimo para que la ruta signifique algo. Un slug de un carácter no es un nombre. */
export const LONGITUD_MIN_SLUG = 2;

/**
 * Rutas que una sección no puede ocupar.
 *
 * Dos motivos distintos mezclados a propósito, porque el efecto es el mismo:
 *
 *  - **Segmentos que ya son una carpeta en `app/`.** En Next.js un segmento
 *    concreto gana al comodín, así que una sección llamada `editor` se crearía en
 *    BD, aparecería en el panel y su ruta enseñaría el editor. No falla: engaña.
 *  - **`menu-y-pie`**, que es contenido pero no una página visitable (ver
 *    `SLUG_PLANTILLA`). Dejar crear otra encima la sobrescribiría.
 *
 * La lista es de las dos apps juntas y no una por ámbito: son pocas, cambian poco,
 * y una sección de intranet llamada `admin` sigue siendo mala idea aunque ahí no
 * choque con nada — la intranet y el sitio se leen como un solo producto.
 */
export const SLUGS_RESERVADOS: readonly string[] = [
  'admin',
  'api',
  'editor',
  'preview',
  'login',
  'logout',
  // Pasos del acceso: desde el 2026-09-18 son hermanos de `/login` en las dos apps
  // (`app/(auth)/`), no subcarpetas suyas, así que ocupan la raíz.
  'first-login',
  'recovery',
  'security-questions',
  'reset-password',
  'reset-success',
  'menu-y-pie',
  '_next',
  'assets',
  'uploads',
  'storage',
];

/**
 * Rango de marcas diacríticas combinantes (Unicode «Combining Diacritical Marks»).
 *
 * Va en escapes y no como caracteres literales dentro de la expresión: en el editor
 * serían invisibles —son marcas que se dibujan encima de la letra anterior— y
 * cualquier recodificación del archivo las rompería sin que nadie lo notara.
 */
const DIACRITICOS = /[̀-ͯ]/g;

/**
 * Convierte un nombre escrito por una persona en un slug de URL.
 *
 * `normalize('NFD')` separa cada letra acentuada en letra base + marca, y quitando
 * las marcas queda la base: «Vinculación» da `vinculacion`, no `vinculacin` (lo que
 * sale si uno se limita a filtrar `[a-z0-9-]`) ni `vinculaci-n`. La `ñ` entra por
 * ese mismo camino y acaba en `n` — «Diseño» da `diseno`, que es la convención
 * habitual en español y lo que ya hacen los slugs existentes.
 *
 * Nunca devuelve barras: el slug se guarda entero en `paginas.slug` y la API lo
 * expone como `/paginas/publica/:slug`, donde un parámetro de Express no cruza una
 * barra. Una sección anidada se nombra con guiones
 * (`encuestas-seguimiento-laboral`), que es como ya están las que existen.
 */
export function slugificar(nombre: string): string {
  return (nombre ?? '')
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    // Cualquier cosa que no sea letra o número pasa a ser separador. Incluye la
    // barra a propósito: «Encuestas/Calidad» debe dar un slug plano, no una ruta.
    .replace(/[^a-z0-9]+/g, '-')
    // Guiones de sobra: repetidos en medio y colgando en los extremos.
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LONGITUD_MAX_SLUG)
    // El recorte por longitud puede dejar un guión suelto al final.
    .replace(/-+$/g, '');
}

/** Por qué un slug no sirve. `null` cuando sirve. */
export type MotivoSlugInvalido = 'vacio' | 'corto' | 'reservado';

/**
 * Valida un slug ya generado.
 *
 * Se valida el **slug**, no el nombre: es lo que acaba en la URL y en la clave de
 * permiso. Un nombre como «¿?» es legítimo de escribir y produce un slug vacío, y
 * eso es lo que hay que rechazar.
 */
export function motivoSlugInvalido(slug: string): MotivoSlugInvalido | null {
  if (!slug) return 'vacio';
  if (slug.length < LONGITUD_MIN_SLUG) return 'corto';
  if (SLUGS_RESERVADOS.includes(slug)) return 'reservado';
  return null;
}

/** Si un slug se puede usar como sección. */
export const esSlugValido = (slug: string): boolean => motivoSlugInvalido(slug) === null;

/**
 * El mensaje que se le enseña a quien está creando la sección.
 *
 * Vive aquí y no en cada app para que la API y el diálogo digan lo mismo: el
 * diálogo lo usa mientras se escribe, y la API lo devuelve si la petición llega
 * igualmente (por ejemplo desde otro cliente).
 */
export function mensajeDeSlugInvalido(motivo: MotivoSlugInvalido): string {
  switch (motivo) {
    case 'vacio':
      return 'Ese nombre no produce una ruta. Usa al menos una letra o un número.';
    case 'corto':
      return `La ruta necesita al menos ${LONGITUD_MIN_SLUG} caracteres.`;
    case 'reservado':
      return 'Esa ruta está reservada por el sistema. Elige otro nombre.';
  }
}
