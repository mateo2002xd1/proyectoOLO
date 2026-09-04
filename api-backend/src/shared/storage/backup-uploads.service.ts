import fs from 'fs';
import path from 'path';
import type { Ambito } from '../ambito';

/**
 * Resuelve la ruta física absoluta de la carpeta `uploads` según el ámbito.
 */
export function resolverDirectorioUploads(ambito: Ambito): string {
  const raizProyecto = path.resolve(__dirname, '../../../../');
  if (ambito === 'sitio') {
    return path.join(raizProyecto, 'sitio-web', 'public', 'uploads');
  }
  return path.join(raizProyecto, 'intranet', 'public', 'uploads');
}

/**
 * Resuelve la ruta física absoluta de la carpeta de backup para una página dada.
 * Ubicación: /{aplicacion}/public/backend/{paginaId}/
 * Crea el directorio si aún no existe y garantiza que permanezca creado.
 */
export function resolverDirectorioBackup(paginaId: string, ambito: Ambito): string {
  const raizProyecto = path.resolve(__dirname, '../../../../');
  const carpetaApp = ambito === 'sitio' ? 'sitio-web' : 'intranet';
  const dirBackup = path.join(raizProyecto, carpetaApp, 'public', 'backend', paginaId);
  if (!fs.existsSync(dirBackup)) {
    fs.mkdirSync(dirBackup, { recursive: true });
  }
  return dirBackup;
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
 * que no pertenezca al conjunto de subRutasValidas de la versión archivada.
 */
function limpiarArchivosHuerfanosEnBackup(
  dirBackup: string,
  subRutasValidas: Set<string>
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
        if (!subRutasValidas.has(normalizada)) {
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
    const rutaDestinoFisica = path.join(dirBackup, subRuta);

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
  const subRutasValidasArchivadas = new Set(
    rutasAnteriores.map((r) => r.replace(/^\/?uploads\//, '').replace(/\\/g, '/'))
  );
  const purgadosDeBackup = limpiarArchivosHuerfanosEnBackup(dirBackup, subRutasValidasArchivadas);

  return { respaldados, preservadosEnUploads, purgadosDeBackup };
}

/**
 * Restaura los archivos de backup hacia `/uploads/` cuando se revierte a una versión archivada.
 *
 * Regla de integridad:
 *  - Los archivos de `public/backend/{paginaId}/` se mueven de regreso a `/uploads/`.
 *  - Los archivos de la versión que deja de ser publicada se mueven a `public/backend/{paginaId}/`.
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
    const rutaOrigenBackup = path.join(dirBackup, subRuta);
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
    const rutaDestinoBackup = path.join(dirBackup, subRuta);

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
  const subRutasValidasArchivadas = new Set(
    Array.from(rutasActuales).map((r) => r.replace(/^\/?uploads\//, '').replace(/\\/g, '/'))
  );
  const purgadosDeBackup = limpiarArchivosHuerfanosEnBackup(dirBackup, subRutasValidasArchivadas);

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
