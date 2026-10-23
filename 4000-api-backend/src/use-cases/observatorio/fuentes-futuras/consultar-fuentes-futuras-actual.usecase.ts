import { describirErrorParaLog } from '../../../shared/errores';
import fs from 'fs';
import path from 'path';
import { FuentesFuturasEmpleoRepository as Repo } from '../../../repositories/fuentes-futuras-empleo.repository';
import { ObservatorioRepository } from '../../../repositories/observatorio.repository';
import { resolverRutaDeCarga } from '../../../infrastructure/storage/filesystem';
import { leerRegistrosDeArchivo, type RegistroFuenteFuturaDTO } from './leer-excel-fuentes-futuras';

export type { RegistroFuenteFuturaDTO };

/**
 * Nombre fijo que leía la primera versión de este módulo, cuando el Excel se dejaba a
 * mano en `uploads/cargas-datos/` y se versionaba en git (`.gitignore` lo rescata de la
 * regla que ignora esa carpeta).
 *
 * Sigue aquí solo como respaldo, y solo mientras no haya ninguna carga: en cuanto se sube
 * el Excel desde "Actualizaciones" manda la carga vigente. Cuando el archivo esté cargado
 * en todos los ambientes, se puede borrar del repositorio junto con esta constante, su
 * excepción en `.gitignore` y su `COPY` en el Dockerfile de la API.
 *
 * Por eso se lee del código (`process.cwd()`) y no del filesystem: es un archivo del
 * repositorio, no algo que alguien subió. La imagen lo trae copiado.
 */
const ARCHIVO_HEREDADO = path.join(process.cwd(), 'uploads', 'cargas-datos', 'fuentes-futuras-de-empleo.xlsx');

/**
 * Un solo Excel vigente a la vez, así que basta una entrada: se reusa mientras la ruta y
 * la fecha de modificación no cambien. Subir otro archivo cambia la ruta (nombre UUID) y
 * eliminar la carga la deja sin pareja, así que el dato nunca se queda pegado.
 */
let cache: { ruta: string; mtime: number; registros: RegistroFuenteFuturaDTO[] } | null = null;

/** El Excel que debe ver el portal, o `null` si no hay ninguno. */
async function resolverRutaVigente(): Promise<string | null> {
  const carga = await Repo.obtenerVigente();
  const archivoId = carga?.get('archivoId') as string | null | undefined;

  if (archivoId) {
    const archivo = await ObservatorioRepository.obtenerArchivo(archivoId);
    if (archivo) {
      // La base de desarrollo es compartida y cada máquina tiene su propio
      // filesystem: la carga puede venir de otro equipo y el Excel no estar aquí. Se
      // cae al respaldo en vez de servir una lista vacía.
      const ruta = resolverRutaDeCarga(archivo.get('rutaRelativa') as string);
      if (fs.existsSync(ruta)) return ruta;
      console.warn(`[fuentes-futuras-empleo] La carga vigente apunta a un archivo que no está en disco: ${ruta}`);
    }
  }

  return fs.existsSync(ARCHIVO_HEREDADO) ? ARCHIVO_HEREDADO : null;
}

/**
 * Los registros vigentes de "Fuentes futuras de empleo" para el portal público.
 *
 * El dato vive en el propio Excel —no se importa a ninguna tabla—, así que esto lee el
 * archivo de la última carga registrada en `cargas_datos`. Eliminar esa carga desde
 * "Actualizaciones" borra su fila y su archivo, y el portal pasa solo a la carga anterior
 * (o deja de mostrar datos si no queda ninguna).
 *
 * Nunca lanza: el portal prefiere una sección vacía a un 500.
 */
export async function consultarFuentesFuturasActual(): Promise<RegistroFuenteFuturaDTO[]> {
  try {
    const ruta = await resolverRutaVigente();
    if (!ruta) return [];

    const { mtimeMs } = fs.statSync(ruta);
    if (cache && cache.ruta === ruta && cache.mtime === mtimeMs) return cache.registros;

    const registros = await leerRegistrosDeArchivo(ruta);
    cache = { ruta, mtime: mtimeMs, registros };
    return registros;
  } catch (error) {
    console.warn('[fuentes-futuras-empleo] Error al leer el archivo Excel:', describirErrorParaLog(error));
    return [];
  }
}

/** Borra la entrada de caché: la llaman subir y eliminar, que cambian cuál es el vigente. */
export function olvidarFuentesFuturasEnCache(): void {
  cache = null;
}
