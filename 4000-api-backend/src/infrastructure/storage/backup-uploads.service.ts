/**
 * El disco de los archivos de las páginas: `uploads/` (lo que se sirve hoy) y
 * `backup/{paginaId}/` (lo de la última versión archivada), dentro de la carpeta de cada
 * ámbito en el filesystem (`filesystem.ts`).
 *
 * Solo mueve, copia y borra. **No decide qué se puede borrar**: esa pregunta —¿alguna
 * versión de alguna página nombra todavía este archivo?— la responde
 * `PaginaRepository.rutasEnUso`, y la une con el borrado `borrarArchivosHuerfanos`, que es
 * la única puerta para borrar archivos de páginas. Qué rutas nombra un contenido lo dice
 * `shared/rutas-uploads-en-contenido.ts`.
 */
import { describirErrorParaLog } from '../../shared/errores';
import fs from 'fs';
import path from 'path';
import type { Ambito } from '../../shared/ambito';
import { extraerRutasUploads } from '../../shared/rutas-uploads-en-contenido';
import { directorioDelAmbito } from './filesystem';

/**
 * Resuelve la ruta física absoluta de la carpeta `uploads` según el ámbito.
 *
 * La URL pública sigue siendo `/uploads/...`, la de siempre: cada frontend la reenvía a
 * `/api/archivos/{ambito}/uploads/...` (su `next.config` en desarrollo, nginx en el
 * servidor), así que el contenido ya publicado, con esa URL guardada en la BD, no
 * necesita tocarse.
 */
export function resolverDirectorioUploads(ambito: Ambito): string {
  return path.join(resolverDirectorioStorage(ambito), 'uploads');
}

/**
 * La carpeta del ámbito en el filesystem, donde viven `uploads/` y `backup/`. Hasta
 * el 2026-10-06 era el `public/storage` de cada frontend; los scripts de mantenimiento
 * siguen tomándola de aquí.
 */
export function resolverDirectorioStorage(ambito: Ambito): string {
  return directorioDelAmbito(ambito);
}

/** La carpeta de backup de una página, sin crearla. */
function rutaDirectorioBackup(paginaId: string, ambito: Ambito): string {
  return path.join(resolverDirectorioStorage(ambito), 'backup', paginaId);
}

/**
 * Resuelve la ruta física absoluta de la carpeta de backup para una página dada.
 * Ubicación física: `{filesystem}/{ambito}/backup/{paginaId}/` — servida en la URL
 * pública `/backup/{paginaId}/...`, que cada frontend reenvía a la API.
 * Crea el directorio si aún no existe y garantiza que permanezca creado.
 */
export function resolverDirectorioBackup(paginaId: string, ambito: Ambito): string {
  const dirBackup = rutaDirectorioBackup(paginaId, ambito);

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

/** Copia un archivo creando antes la carpeta de destino si no existe. */
function copiarArchivoSeguro(origen: string, destino: string): void {
  const dirDestino = path.dirname(destino);
  if (!fs.existsSync(dirDestino)) {
    fs.mkdirSync(dirDestino, { recursive: true });
  }
  fs.copyFileSync(origen, destino);
}

/**
 * Mueve un archivo copiándolo y borrando el original; si el borrado falla, el original se queda.
 */
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
 *  - Si un archivo de la versión anterior ya NO lo usa la nueva versión: se MUEVE a backup (se quita de uploads),
 *    salvo que esté en `conservarEnUploads` (otra página lo usa): entonces se COPIA.
 *  - Limpia cualquier archivo en backup que no pertenezca a la versión archivada.
 */
export function respaldarArchivosAlPublicar(params: {
  paginaId: string;
  versionAnteriorContenido: unknown;
  versionNuevaContenido: unknown;
  ambito: Ambito;
  /** Rutas que nombra alguna otra página (`PaginaRepository.rutasEnUso`): no salen de `uploads/`. */
  conservarEnUploads?: ReadonlySet<string>;
}): { respaldados: string[]; preservadosEnUploads: string[]; purgadosDeBackup: string[] } {
  const { paginaId, versionAnteriorContenido, versionNuevaContenido, ambito, conservarEnUploads } = params;

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

    const sigueEnUso = rutasNuevas.has(rutaRelativa) || conservarEnUploads?.has(rutaRelativa);

    if (sigueEnUso) {
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
 *  - Los archivos de la versión que deja de ser publicada se mueven a `backup/{paginaId}/`, salvo los de
 *    `conservarEnUploads` (otra página los usa), que se copian.
 *  - Se purga cualquier archivo en backup que no pertenezca a la versión que pasa a ser archivada.
 */
export function restaurarArchivosDesdeBackup(params: {
  paginaId: string;
  versionRestaurarContenido: unknown;
  versionActualContenido: unknown;
  ambito: Ambito;
  /** Rutas que nombra alguna otra página (`PaginaRepository.rutasEnUso`): no salen de `uploads/`. */
  conservarEnUploads?: ReadonlySet<string>;
}): { restaurados: string[]; guardadosEnBackup: string[]; purgadosDeBackup: string[] } {
  const { paginaId, versionRestaurarContenido, versionActualContenido, ambito, conservarEnUploads } = params;

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

    if (rutasRestaurar.includes(rutaRelativa) || conservarEnUploads?.has(rutaRelativa)) {
      // Si la versión restaurada u otra página también la usa, se copia a backup (se mantiene en uploads)
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

/**
 * Borra de `uploads/` las rutas dadas (`/uploads/img/x.png`) y devuelve las que ya no están
 * en el disco (también las que no estaban). **No comprueba si alguien las usa**: se llama
 * desde `borrarArchivosHuerfanos`, que antes lo pregunta a la base.
 *
 * Una ruta que, ya resuelta, cae fuera de `uploads/` (un `../`, una ruta absoluta) se ignora.
 */
export async function borrarDeUploads(rutas: Iterable<string>, ambito: Ambito): Promise<string[]> {
  const dirUploads = resolverDirectorioUploads(ambito);
  const borradas: string[] = [];

  for (const ruta of rutas) {
    const rutaFisica = path.resolve(dirUploads, ruta.replace(/^\/?uploads\//, ''));
    if (!rutaFisica.startsWith(dirUploads + path.sep)) continue;

    try {
      await fs.promises.rm(rutaFisica, { force: true });
      borradas.push(ruta);
    } catch (error) {
      console.error(`[storage] No se pudo borrar ${rutaFisica}:`, describirErrorParaLog(error));
    }
  }

  return borradas;
}

/**
 * Elimina por completo el directorio de backup de una página.
 * Útil cuando se elimina por completo la página del sistema.
 */
export function eliminarDirectorioBackupCompleto(paginaId: string, ambito: Ambito): void {
  // Sin `resolverDirectorioBackup`, que crea la carpeta si no existe: aquí sería crearla
  // para borrarla en la línea siguiente.
  const dirBackup = rutaDirectorioBackup(paginaId, ambito);
  if (fs.existsSync(dirBackup)) {
    try {
      fs.rmSync(dirBackup, { recursive: true, force: true });
    } catch (error) {
      console.error(`[Storage] No se pudo eliminar el directorio de backup de la página ${paginaId}:`, describirErrorParaLog(error));
    }
  }
}
