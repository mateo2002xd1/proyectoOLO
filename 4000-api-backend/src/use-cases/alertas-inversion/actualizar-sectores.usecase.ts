import crypto from 'crypto';
import * as ExcelJS from 'exceljs';
// Misma versión fijada de `file-type` y mismo validador que las demás cargas de Excel
// (ver `observatorio/guardar-excel-de-carga.ts`).
import { fromBuffer as detectarTipoDeArchivo } from 'file-type';
import { validarArchivoSubido, fueRechazada } from '@olo/upload-policy';
import { AlertasInversionRepository as Repo } from '../../repositories/alertas-inversion.repository';
import { normalizarParaComparar } from '../../shared/normalizar-texto';
import { crearBuscadorDeSeccionPorDivision } from './ciiu-divisiones';

export class ErrorAlActualizarSectores extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const MAX_FILAS = 5000;
const LARGO_MAXIMO_NOMBRE = 300;

export interface ErrorDeFilaSectores {
  fila: number;
  mensaje: string;
}

export interface ResultadoActualizarSectores {
  creados: number;
  actualizados: number;
  sinCambios: number;
  /** Códigos de 2 o 3 dígitos (sector principal): se leen pero no se guardan. */
  omitidos: number;
  errores: ErrorDeFilaSectores[];
}

const comoTexto = (celda: ExcelJS.Cell): string => (celda.text ?? '').toString().trim();

/**
 * Actualiza el catálogo de actividades CIIU (`ciiu_clases`) desde un Excel de dos
 * columnas: código y nombre. Cada código de 4 dígitos se asocia a su sección por el
 * prefijo —los dos primeros dígitos son la división, y cada sección cubre un rango de
 * divisiones (`ciiu_secciones.divisiones`)—, así que el Excel no necesita traer la letra.
 *
 * Los códigos de 2 y 3 dígitos del mismo archivo (el «sector principal» de cada grupo
 * de derivados) se aceptan y se cuentan como omitidos: el catálogo solo guarda clases.
 * Si el código ya existe se actualiza el nombre; nunca se borra nada. Las filas con
 * problema se reportan y las demás se aplican igual.
 *
 * Síncrono y sin cola: son cientos de filas de dos columnas, no un dataset masivo, y no
 * depende de Redis.
 */
export async function actualizarSectoresCiiu(datos: Buffer): Promise<ResultadoActualizarSectores> {
  const validacion = await validarArchivoSubido(datos, detectarTipoDeArchivo, () => crypto.randomUUID());
  if (fueRechazada(validacion)) {
    throw new ErrorAlActualizarSectores(validacion.error, validacion.status);
  }
  if (validacion.ext !== 'xlsx') {
    throw new ErrorAlActualizarSectores('Este módulo solo acepta archivos Excel (.xlsx).', 415);
  }

  const libro = new ExcelJS.Workbook();
  try {
    await libro.xlsx.load(datos as any);
  } catch {
    throw new ErrorAlActualizarSectores('No se pudo leer el Excel: el archivo está dañado.', 400);
  }
  const hoja = libro.worksheets[0];
  if (!hoja) throw new ErrorAlActualizarSectores('El Excel no tiene ninguna hoja.', 400);
  if (hoja.rowCount > MAX_FILAS + 1) {
    throw new ErrorAlActualizarSectores(`El Excel supera el máximo de ${MAX_FILAS} filas.`, 400);
  }

  const secciones = await Repo.listarSeccionesConDivisiones();
  const seccionDeDivision = crearBuscadorDeSeccionPorDivision(
    secciones.map((s: any) => ({ id: s.get('id') as string, divisiones: s.get('divisiones') as string }))
  );

  const existentes = new Map<string, { id: string; nombre: string }>(
    (await Repo.listarClases()).map((c: any) => [c.get('codigo') as string, { id: c.get('id') as string, nombre: c.get('nombre') as string }])
  );

  const resultado: ResultadoActualizarSectores = { creados: 0, actualizados: 0, sinCambios: 0, omitidos: 0, errores: [] };
  const nuevas: { seccionId: string; codigo: string; nombre: string }[] = [];
  const cambios: { id: string; nombre: string }[] = [];
  const vistos = new Set<string>();
  let filasLeidas = 0;

  hoja.eachRow((fila, numeroFila) => {
    const codigo = comoTexto(fila.getCell(1)).replace(/\s+/g, '');
    const nombre = comoTexto(fila.getCell(2));

    // Encabezado: la primera fila cuyo código no es numérico ("Código", "Código CIIU"…).
    if (numeroFila === 1 && !/^\d+$/.test(codigo)) return;
    if (!codigo && !nombre) return;
    filasLeidas += 1;

    if (!/^\d+$/.test(codigo)) {
      resultado.errores.push({ fila: numeroFila, mensaje: `el código "${codigo}" no es numérico` });
      return;
    }
    if (!nombre) {
      resultado.errores.push({ fila: numeroFila, mensaje: `el código ${codigo} no trae nombre` });
      return;
    }
    if (codigo.length < 4) {
      // Sector principal (división o grupo): no se guarda. Ojo: un código de 4 dígitos con
      // cero inicial (0111) guardado como número llega como "111", y también cae aquí.
      resultado.omitidos += 1;
      return;
    }
    if (codigo.length > 4) {
      resultado.errores.push({ fila: numeroFila, mensaje: `el código ${codigo} tiene más de 4 dígitos` });
      return;
    }
    if (nombre.length > LARGO_MAXIMO_NOMBRE) {
      resultado.errores.push({ fila: numeroFila, mensaje: `el nombre del código ${codigo} supera ${LARGO_MAXIMO_NOMBRE} caracteres` });
      return;
    }
    if (vistos.has(codigo)) {
      resultado.errores.push({ fila: numeroFila, mensaje: `el código ${codigo} está repetido en el archivo` });
      return;
    }
    vistos.add(codigo);

    const seccionId = seccionDeDivision(Number(codigo.slice(0, 2)));
    if (!seccionId) {
      resultado.errores.push({ fila: numeroFila, mensaje: `el código ${codigo} no pertenece a ninguna sección CIIU (división ${codigo.slice(0, 2)})` });
      return;
    }

    const actual = existentes.get(codigo);
    if (!actual) {
      nuevas.push({ seccionId, codigo, nombre });
    } else if (normalizarParaComparar(actual.nombre) === normalizarParaComparar(nombre) && actual.nombre === nombre) {
      resultado.sinCambios += 1;
    } else {
      cambios.push({ id: actual.id, nombre });
    }
  });

  if (filasLeidas === 0) {
    throw new ErrorAlActualizarSectores('El Excel no trae filas con código y nombre. Use dos columnas: Código y Nombre.', 400);
  }

  await Repo.guardarClases(nuevas, cambios);
  resultado.creados = nuevas.length;
  resultado.actualizados = cambios.length;
  return resultado;
}
