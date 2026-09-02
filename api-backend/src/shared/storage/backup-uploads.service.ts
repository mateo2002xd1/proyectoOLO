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
      const coincidencias = nodo.match(/\/uploads\/[^\s"'<>?#]+/g);
      if (coincidencias) {
        for (const m of coincidencias) {
          try {
            rutas.add(decodeURIComponent(m));
          } catch {
            rutas.add(m);
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
 * Respalda los archivos `/uploads/` cuando una página se publica y la versión anterior pasa a `archivado`.
 *
 * Regla de integridad:
 *  - Si un archivo de la versión anterior también lo usa la nueva versión: se COPIA a backup (se mantiene en uploads).
 *  - Si un archivo de la versión anterior ya NO lo usa la nueva versión: se MUEVE a backup (se quita de uploads).
 */
export function respaldarArchivosAlPublicar(params: {
  paginaId: string;
  versionAnteriorContenido: unknown;
  versionNuevaContenido: unknown;
  ambito: Ambito;
}): { respaldados: string[]; preservadosEnUploads: string[] } {
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

  return { respaldados, preservadosEnUploads };
}

/**
 * Restaura los archivos de backup hacia `/uploads/` cuando se revierte a una versión archivada.
 *
 * Regla de integridad:
 *  - Los archivos de `public/backend/{paginaId}/` se mueven de regreso a `/uploads/`.
 *  - Los archivos exclusivos de la versión que deja de ser publicada se mueven a `public/backend/{paginaId}/`.
 */
export function restaurarArchivosDesdeBackup(params: {
  paginaId: string;
  versionRestaurarContenido: unknown;
  versionActualContenido: unknown;
  ambito: Ambito;
}): { restaurados: string[]; guardadosEnBackup: string[] } {
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

  // 2. Mover a backup los archivos de la versión que se despublica (que no use la versión restaurada)
  for (const rutaRelativa of rutasActuales) {
    if (rutasRestaurar.includes(rutaRelativa)) {
      continue;
    }

    const subRuta = rutaRelativa.replace(/^\/?uploads\//, '');
    const rutaOrigenUploads = path.join(dirUploads, subRuta);
    const rutaDestinoBackup = path.join(dirBackup, subRuta);

    if (fs.existsSync(rutaOrigenUploads)) {
      moverArchivoSeguro(rutaOrigenUploads, rutaDestinoBackup);
      guardadosEnBackup.push(subRuta);
    }
  }

  return { restaurados, guardadosEnBackup };
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
