import fs from 'fs';
import path from 'path';
import type { Ambito } from '../ambito';

/**
 * Resuelve la ruta física absoluta de la carpeta `uploads` según el ámbito.
 *
 * Vive bajo `public/storage/uploads`, pero se sigue sirviendo en la URL pública
 * `/uploads/...` de siempre: el rewrite en next.config es el que traduce una cosa
 * en la otra, así que el contenido ya publicado (con esa URL guardada en la BD)
 * no necesita tocarse.
 */
export function resolverDirectorioUploads(ambito: Ambito): string {
  const raizProyecto = path.resolve(__dirname, '../../../../');
  const carpetaApp = ambito === 'sitio' ? 'sitio-web' : 'intranet';
  return path.join(raizProyecto, carpetaApp, 'public', 'storage', 'uploads');
}

/**
 * Resuelve la ruta física absoluta de la carpeta de backup para una página dada.
 * Ubicación física: /{aplicacion}/public/storage/backup/{paginaId}/ — servida en la
 * URL pública `/backup/{paginaId}/...` vía rewrite (ver next.config).
 * Crea el directorio si aún no existe y garantiza que permanezca creado.
 */
export function resolverDirectorioBackup(paginaId: string, ambito: Ambito): string {
  const raizProyecto = path.resolve(__dirname, '../../../../');
  const carpetaApp = ambito === 'sitio' ? 'sitio-web' : 'intranet';
  const dirBackup = path.join(raizProyecto, carpetaApp, 'public', 'storage', 'backup', paginaId);

  if (!fs.existsSync(dirBackup)) {
    fs.mkdirSync(dirBackup, { recursive: true });
  }
  return dirBackup;
}

/**
 * Nombre con el que un archivo de `uploads/{tipo}/...` se guarda en backup: suelto en
 * la carpeta de la página, sin la subcarpeta de tipo. Conserva un `?`/`#` final si lo trae.
 */
function nombreEnBackup(subRuta: string): string {
  return subRuta.split('/').pop() ?? subRuta;
}

/**
 * Extrae recursivamente todas las rutas de archivos que inicien por `/uploads/`
 * presentes en cualquier parte del árbol JSON de bloques de Puck.
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

function copiarArchivoSeguro(origen: string, destino: string): void {
  const dirDestino = path.dirname(destino);
  if (!fs.existsSync(dirDestino)) {
    fs.mkdirSync(dirDestino, { recursive: true });
  }
  fs.copyFileSync(origen, destino);
}

function moverArchivoSeguro(origen: string, destino: string): void {
  copiarArchivoSeguro(origen, destino);
  try {
    fs.unlinkSync(origen);
  } catch {
    // Si no se pudo eliminar el origen, se conserva sin interrumpir la operación
  }
}

/**
 * Elimina de forma recursiva cualquier archivo o subdirectorio en dirBackup
 * que no pertenezca al conjunto de nombres válidos de la versión archivada.
 */
function limpiarArchivosHuerfanosEnBackup(
  dirBackup: string,
  nombresValidos: Set<string>
): string[] {
  if (!fs.existsSync(dirBackup)) return [];

  const eliminados: string[] = [];

  function limpiarRecursivo(directorioActual: string, rutaRelativaBase: string = '') {
    const entradas = fs.readdirSync(directorioActual, { withFileTypes: true });

    for (const entrada of entradas) {
      const rutaRelativa = rutaRelativaBase ? `${rutaRelativaBase}/${entrada.name}` : entrada.name;
      const rutaAbsoluta = path.join(directorioActual, entrada.name);

      if (entrada.isDirectory()) {
        limpiarRecursivo(rutaAbsoluta, rutaRelativa);
        try {
          if (fs.readdirSync(rutaAbsoluta).length === 0) {
            fs.rmdirSync(rutaAbsoluta);
          }
        } catch {}
      } else if (entrada.isFile()) {
        const normalizada = rutaRelativa.replace(/\\/g, '/');
        if (!nombresValidos.has(normalizada)) {
          try {
            fs.unlinkSync(rutaAbsoluta);
            eliminados.push(normalizada);
          } catch {}
        }
      }
    }
  }

  limpiarRecursivo(dirBackup);
  return eliminados;
}

/**
 * Respalda los archivos `/uploads/` cuando una página se publica y la versión anterior pasa a `archivado`.
 *
 * Regla de integridad:
 *  - Si un archivo de la versión anterior también lo usa la nueva versión: se COPIA a backup (se mantiene en uploads).
 *  - Si un archivo de la versión anterior ya NO lo usa la nueva versión: se MUEVE a backup (se quita de uploads).
 *  - Limpia cualquier archivo en backup que no pertenezca a la versión archivada.
 */
export function respaldarArchivosAlPublicar(params: {
  paginaId: string;
  versionAnteriorContenido: unknown;
  versionNuevaContenido: unknown;
  ambito: Ambito;
}): { respaldados: string[]; preservadosEnUploads: string[]; purgadosDeBackup: string[] } {
  const { paginaId, versionAnteriorContenido, versionNuevaContenido, ambito } = params;

  const dirUploads = resolverDirectorioUploads(ambito);
  const dirBackup = resolverDirectorioBackup(paginaId, ambito);

  const rutasAnteriores = extraerRutasUploads(versionAnteriorContenido);
  const rutasNuevas = new Set(extraerRutasUploads(versionNuevaContenido));

  const respaldados: string[] = [];
  const preservadosEnUploads: string[] = [];

  for (const rutaRelativa of rutasAnteriores) {
    const subRuta = rutaRelativa.replace(/^\/?uploads\//, '');
    const rutaOrigenFisica = path.join(dirUploads, subRuta);
    const rutaDestinoFisica = path.join(dirBackup, nombreEnBackup(subRuta));

    if (!fs.existsSync(rutaOrigenFisica)) {
      continue;
    }

    const sigueEnUsoPorNuevaVersion = rutasNuevas.has(rutaRelativa);

    if (sigueEnUsoPorNuevaVersion) {
      copiarArchivoSeguro(rutaOrigenFisica, rutaDestinoFisica);
      preservadosEnUploads.push(subRuta);
    } else {
      moverArchivoSeguro(rutaOrigenFisica, rutaDestinoFisica);
      respaldados.push(subRuta);
    }
  }

  // Eliminar de backup cualquier archivo residual que no pertenezca a la versión archivada
  const nombresValidosArchivados = new Set(
    rutasAnteriores.map((r) => nombreEnBackup(r.replace(/^\/?uploads\//, '')))
  );
  const purgadosDeBackup = limpiarArchivosHuerfanosEnBackup(dirBackup, nombresValidosArchivados);

  return { respaldados, preservadosEnUploads, purgadosDeBackup };
}

/**
 * Restaura los archivos de backup hacia `/uploads/` cuando se revierte a una versión archivada.
 *
 * Regla de integridad:
 *  - Los archivos de `backup/{paginaId}/` vuelven a su carpeta de tipo en `uploads/`.
 *  - Los archivos de la versión que deja de ser publicada se mueven a `backup/{paginaId}/`.
 *  - Se purga cualquier archivo en backup que no pertenezca a la versión que pasa a ser archivada.
 */
export function restaurarArchivosDesdeBackup(params: {
  paginaId: string;
  versionRestaurarContenido: unknown;
  versionActualContenido: unknown;
  ambito: Ambito;
}): { restaurados: string[]; guardadosEnBackup: string[]; purgadosDeBackup: string[] } {
  const { paginaId, versionRestaurarContenido, versionActualContenido, ambito } = params;

  const dirUploads = resolverDirectorioUploads(ambito);
  const dirBackup = resolverDirectorioBackup(paginaId, ambito);

  const rutasRestaurar = extraerRutasUploads(versionRestaurarContenido);
  const rutasActuales = new Set(extraerRutasUploads(versionActualContenido));

  const restaurados: string[] = [];
  const guardadosEnBackup: string[] = [];

  // 1. Mover hacia uploads los archivos necesarios para la versión que se restaura
  for (const rutaRelativa of rutasRestaurar) {
    const subRuta = rutaRelativa.replace(/^\/?uploads\//, '');
    const rutaOrigenBackup = path.join(dirBackup, nombreEnBackup(subRuta));
    const rutaDestinoUploads = path.join(dirUploads, subRuta);

    if (fs.existsSync(rutaOrigenBackup)) {
      moverArchivoSeguro(rutaOrigenBackup, rutaDestinoUploads);
      restaurados.push(subRuta);
    }
  }

  // 2. Mover a backup los archivos de la versión que se despublica (que ahora pasa a archivada)
  for (const rutaRelativa of rutasActuales) {
    const subRuta = rutaRelativa.replace(/^\/?uploads\//, '');
    const rutaOrigenUploads = path.join(dirUploads, subRuta);
    const rutaDestinoBackup = path.join(dirBackup, nombreEnBackup(subRuta));

    if (rutasRestaurar.includes(rutaRelativa)) {
      // Si la versión restaurada también la usa, se copia a backup (se mantiene en uploads)
      if (fs.existsSync(rutaOrigenUploads)) {
        copiarArchivoSeguro(rutaOrigenUploads, rutaDestinoBackup);
        guardadosEnBackup.push(subRuta);
      }
    } else {
      // Si la versión restaurada ya no la usa, se mueve a backup y se retira de uploads
      if (fs.existsSync(rutaOrigenUploads)) {
        moverArchivoSeguro(rutaOrigenUploads, rutaDestinoBackup);
        guardadosEnBackup.push(subRuta);
      }
    }
  }

  // 3. Purgar de backup cualquier archivo residual que no pertenezca a la versión que quedó archivada
  const nombresValidosArchivados = new Set(
    Array.from(rutasActuales).map((r) => nombreEnBackup(r.replace(/^\/?uploads\//, '')))
  );
  const purgadosDeBackup = limpiarArchivosHuerfanosEnBackup(dirBackup, nombresValidosArchivados);

  return { restaurados, guardadosEnBackup, purgadosDeBackup };
}

/**
 * Lista todos los archivos que actualmente residen en la carpeta de backup de una página.
 */
export function listarArchivosEnBackup(paginaId: string, ambito: Ambito): string[] {
  const dirBackup = resolverDirectorioBackup(paginaId, ambito);
  if (!fs.existsSync(dirBackup)) return [];

  function listarRecursivo(dir: string, base: string = ''): string[] {
    const entradas = fs.readdirSync(dir, { withFileTypes: true });
    let archivos: string[] = [];
    for (const entrada of entradas) {
      const rutaRelativa = base ? path.join(base, entrada.name) : entrada.name;
      if (entrada.isDirectory()) {
        archivos = archivos.concat(listarRecursivo(path.join(dir, entrada.name), rutaRelativa));
      } else {
        archivos.push(rutaRelativa.replace(/\\/g, '/'));
      }
    }
    return archivos;
  }

  return listarRecursivo(dirBackup);
}

/**
 * Adapta recursivamente las URLs de `/uploads/...` en el contenido de una versión
 * archivada para que apunten a `/backup/{paginaId}/...` si el recurso existe físicamente
 * en la carpeta de resguardo (backup) de la página.
 *
 * Si el archivo no está en backup (o si continúa en uploads), mantiene la ruta `/uploads/...`.
 * Esto asegura que la vista previa cargue siempre los recursos correctos con máxima fidelidad
 * sin alterar el contenido almacenado en la base de datos.
 */
export function adaptarRutasParaVistaPreviaArchivada(
  contenido: unknown,
  paginaId: string,
  ambito: Ambito
): unknown {
  if (!contenido) return contenido;

  const dirBackup = resolverDirectorioBackup(paginaId, ambito);
  if (!fs.existsSync(dirBackup)) {
    return contenido;
  }

  // Caché de existencia por ejecución para evitar llamadas repetitivas a fs.existsSync
  const cacheExiste = new Map<string, boolean>();

  function existeEnBackup(subRuta: string): boolean {
    if (cacheExiste.has(subRuta)) {
      return cacheExiste.get(subRuta)!;
    }
    const rutaFisica = path.join(dirBackup, nombreEnBackup(subRuta));
    const existe = fs.existsSync(rutaFisica);
    cacheExiste.set(subRuta, existe);
    return existe;
  }

  function transformar(nodo: unknown): unknown {
    if (!nodo) return nodo;

    if (typeof nodo === 'string') {
      let nuevoNodo = nodo;

      // Si por alguna razón histórica el contenido trae /backend/{paginaId}/, normalizar a /backup/{paginaId}/
      if (nuevoNodo.includes(`/backend/${paginaId}/`)) {
        nuevoNodo = nuevoNodo.split(`/backend/${paginaId}/`).join(`/backup/${paginaId}/`);
      }

      if (nuevoNodo.includes('/uploads/')) {
        const nodoTrim = nuevoNodo.trim();
        if (nodoTrim.startsWith('/uploads/') && !nodoTrim.includes('"') && !nodoTrim.includes('\n')) {
          const subRuta = nodoTrim.replace(/^\/?uploads\//, '').split(/[?#]/)[0].replace(/[\),;:.]+$/, '');
          let subRutaFisica = subRuta;
          try {
            subRutaFisica = decodeURIComponent(subRuta);
          } catch {}
          if (existeEnBackup(subRutaFisica)) {
            nuevoNodo = nuevoNodo.replace(`/uploads/${subRuta}`, `/backup/${paginaId}/${nombreEnBackup(subRuta)}`);
          }
        }

        nuevoNodo = nuevoNodo.replace(/\/uploads\/([^\s"'<>]+)/g, (coincidencia, subRutaConSufijo) => {
          const subRutaLimpia = subRutaConSufijo.split(/[?#]/)[0].replace(/[\),;:.]+$/, '');
          let subRutaFisica = subRutaLimpia;
          try {
            subRutaFisica = decodeURIComponent(subRutaLimpia);
          } catch {}

          if (existeEnBackup(subRutaFisica)) {
            return coincidencia.replace(
              `/uploads/${subRutaConSufijo}`,
              `/backup/${paginaId}/${nombreEnBackup(subRutaConSufijo)}`
            );
          }
          return coincidencia;
        });
      }

      return nuevoNodo;
    }

    if (Array.isArray(nodo)) {
      return nodo.map(transformar);
    }

    if (typeof nodo === 'object') {
      const resultado: Record<string, unknown> = {};
      for (const [clave, valor] of Object.entries(nodo as Record<string, unknown>)) {
        resultado[clave] = transformar(valor);
      }
      return resultado;
    }

    return nodo;
  }

  return transformar(contenido);
}
