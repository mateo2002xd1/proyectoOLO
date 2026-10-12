/**
 * El filesystem del proyecto: la única raíz donde viven en disco los archivos que sube la
 * gente (el «Filesystem» del diagrama de capas, `1-guia-del-proyecto.md` §3.1).
 *
 * Fuera del código y fuera del webroot de los frontends (`3-seguridad-del-proyecto.md`
 * §S1): solo la API la lee y la escribe, y el sitio y la intranet piden cada archivo por
 * HTTP a `/api/archivos/...` (`routes/archivos.routes.ts`). En el servidor es el volumen
 * de Docker `olo-app_filesystem`, montado únicamente en el contenedor de la API
 * (`docker-compose.servidor.yml`); en desarrollo, la carpeta `filesystem/` de la raíz
 * del repositorio, que git ignora.
 *
 *   filesystem/
 *   ├── sitio/                     adjuntos de las páginas del sitio web
 *   │   ├── uploads/<tipo>/        lo que nombran las versiones vigentes (img, pdf, excel…)
 *   │   └── backup/<paginaId>/     lo de la última versión archivada de cada página
 *   ├── intranet/                  lo mismo para las páginas de la intranet
 *   ├── cargas-datos/              los Excel de "Actualizaciones"; no se sirven nunca
 *   └── panel/identidad/           el logo y el icono del panel (Configuración)
 */
import path from 'path';
import { mimeParaServir } from '@olo/upload-policy';
import { AMBITOS, type Ambito } from '../../shared/ambito';

/**
 * `FILESYSTEM_DIR` si está definida; si no, `filesystem/` en la raíz del
 * repositorio, cuatro niveles por encima de este archivo. En la imagen eso cae en
 * `/filesystem` (desde `dist/infrastructure/storage`), que es donde el compose monta
 * el volumen, así que el valor por defecto ya sirve en los dos lados.
 *
 * Se lee en cada llamada y no al cargar el módulo: los scripts y el servidor cargan el
 * `.env` en momentos distintos, y una constante podría quedarse con el valor de antes.
 */
export function raizDelFilesystem(): string {
  return path.resolve(process.env.FILESYSTEM_DIR || path.join(__dirname, '../../../../filesystem'));
}

/** La carpeta de un ámbito, donde viven su `uploads/` y su `backup/`. */
export function directorioDelAmbito(ambito: Ambito): string {
  return path.join(raizDelFilesystem(), ambito);
}

/** Donde se guardan los Excel de las cargas del observatorio. */
export function directorioDeCargas(): string {
  return path.join(raizDelFilesystem(), 'cargas-datos');
}

/**
 * Lo que se guarda en `archivos.ruta_relativa` para el Excel de una carga.
 *
 * Conserva el prefijo `uploads/cargas-datos/` de cuando el archivo vivía en la carpeta
 * de la API: la base de desarrollo es compartida, y un equipo con el código anterior
 * resuelve ese mismo valor contra su propia carpeta. Cambiarlo dejaría a ese equipo sin
 * encontrar las cargas nuevas.
 */
export function rutaRelativaDeCarga(nombreArchivo: string): string {
  return `uploads/cargas-datos/${nombreArchivo}`;
}

/**
 * Dónde está en disco el Excel de una fila de `archivos`.
 *
 * Toma solo el nombre del archivo y lo busca en `cargas-datos/`. Así acepta las dos
 * barras —las filas que se crearon desde Windows llevan `\`— y una ruta guardada con
 * `../` no puede salir de la carpeta.
 */
export function resolverRutaDeCarga(rutaRelativa: string): string {
  const nombre = rutaRelativa.split(/[\\/]/).pop() ?? '';
  return path.join(directorioDeCargas(), nombre);
}

/**
 * Donde viven el logo y el icono que se suben en Configuración → Identidad visual.
 *
 * Aparte de `sitio/uploads/` a propósito: `npm run uploads:limpiar-huerfanos -- --aplicar`
 * borra de ahí todo lo que no nombre una versión de página, y el logo del panel no lo
 * nombra ninguna.
 */
export function directorioDeIdentidadDelPanel(): string {
  return path.join(raizDelFilesystem(), 'panel', 'identidad');
}

/** Lo único que puede haber en esa carpeta: un UUID con la extensión de una imagen. */
const NOMBRE_DE_IDENTIDAD = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.(png|jpg)$/;

/**
 * El archivo de identidad que se puede servir con ese nombre, o `null`.
 *
 * Solo acepta el formato exacto que pone la subida, así que un `..` o una barra no
 * llegan a `path.join`. Tampoco comprueba si existe: eso lo resuelve quien lo envía.
 */
export function resolverArchivoDeIdentidad(nombre: string): { rutaAbsoluta: string; mime: string } | null {
  if (!NOMBRE_DE_IDENTIDAD.test(nombre)) return null;
  const rutaAbsoluta = path.join(directorioDeIdentidadDelPanel(), nombre);
  const mime = mimeParaServir(rutaAbsoluta);
  return mime ? { rutaAbsoluta, mime } : null;
}

/** Las dos carpetas de un ámbito que se pueden pedir desde fuera. */
const CARPETAS_SERVIDAS = new Set(['uploads', 'backup']);

/**
 * Traduce una ruta pedida por HTTP (`['uploads', 'img', 'x.png']`) al archivo que hay
 * que servir, o `null` si no se debe servir.
 *
 * No se sirve lo que no esté en `uploads/` o `backup/` del ámbito, lo que al resolverse
 * caiga fuera de esa carpeta (`..`) ni lo que tenga una extensión que no se puede subir:
 * qué tipos se sirven lo decide `mimeParaServir` en `@olo/upload-policy`, sacado de la
 * misma lista blanca que la subida. No comprueba si el archivo existe; eso lo resuelve
 * quien lo envía.
 */
export function resolverArchivoServible(
  ambito: string,
  segmentos: readonly string[]
): { rutaAbsoluta: string; mime: string } | null {
  if (!AMBITOS.includes(ambito as Ambito)) return null;

  const [carpeta, ...resto] = segmentos;
  if (!carpeta || !CARPETAS_SERVIDAS.has(carpeta) || resto.length === 0) return null;

  const base = path.join(directorioDelAmbito(ambito as Ambito), carpeta);
  const rutaAbsoluta = path.resolve(base, ...resto);
  if (!rutaAbsoluta.startsWith(base + path.sep)) return null;

  const mime = mimeParaServir(rutaAbsoluta);
  return mime ? { rutaAbsoluta, mime } : null;
}
