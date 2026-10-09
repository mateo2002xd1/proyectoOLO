import ExcelJS from 'exceljs';

export interface RegistroFuenteFuturaDTO {
  id: string;
  departamento: string;
  sector: string;
  cuentaProyecto: number;
  principalesFuentes?: string;
}

/** Tope de filas de una carga: el Excel se parsea en la misma petición, sin cola. */
export const MAX_FILAS = 20000;

export class ErrorDeExcelFuentesFuturas extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Columna por columna, por lo que dice su encabezado y no por su posición: el archivo lo
 * arma una persona y el orden varía. Se queda con la primera que coincide, así que
 * «Cuenta de Proyecto» cae en `cuentaProyecto` (contiene «cuenta») y no en un hipotético
 * «proyecto» posterior.
 */
function mapearColumnas(hoja: ExcelJS.Worksheet): Record<string, number> {
  const columnas: Record<string, number> = {};

  hoja.getRow(1).eachCell((celda, numero) => {
    const texto = (celda.text ?? '').toString().toLowerCase().trim();
    if (!columnas.departamento && (texto.includes('departamento') || texto.includes('depto'))) {
      columnas.departamento = numero;
    } else if (!columnas.sector && texto.includes('sector')) {
      columnas.sector = numero;
    } else if (!columnas.cuentaProyecto && (texto.includes('cuenta') || texto.includes('proyecto'))) {
      columnas.cuentaProyecto = numero;
    } else if (!columnas.principalesFuentes && texto.includes('fuente')) {
      columnas.principalesFuentes = numero;
    }
  });

  return columnas;
}

/**
 * Los registros de "Fuentes futuras de empleo" de un libro ya abierto: la primera hoja,
 * encabezados en la fila 1 y una fila por registro. Las filas sin departamento o sin
 * sector se saltan (el Excel real trae filas de relleno al final).
 *
 * `id` es `ffe-<fila>`: no hay clave en el archivo, y al portal solo le sirve para
 * identificar la fila dentro de la respuesta.
 */
export function registrosDelLibro(libro: ExcelJS.Workbook): RegistroFuenteFuturaDTO[] {
  const hoja = libro.worksheets[0];
  if (!hoja || hoja.rowCount < 2) return [];

  const columnas = mapearColumnas(hoja);
  const registros: RegistroFuenteFuturaDTO[] = [];
  const ultimaFila = Math.min(hoja.rowCount, MAX_FILAS + 1);

  for (let numeroFila = 2; numeroFila <= ultimaFila; numeroFila++) {
    const fila = hoja.getRow(numeroFila);
    const departamento = fila.getCell(columnas.departamento || 1).value;
    if (!departamento) continue;

    const sector = fila.getCell(columnas.sector || 2).value;
    if (!sector) continue;

    const cuenta = fila.getCell(columnas.cuentaProyecto || 3).value;
    const fuentes = columnas.principalesFuentes ? fila.getCell(columnas.principalesFuentes).value : undefined;

    registros.push({
      id: `ffe-${numeroFila}`,
      departamento: String(departamento).trim(),
      sector: String(sector).trim(),
      cuentaProyecto: Number(cuenta) || 0,
      principalesFuentes: fuentes ? String(fuentes).trim() : undefined,
    });
  }

  return registros;
}

/** Los registros de un Excel en disco. Devuelve `[]` si el archivo no se puede leer. */
export async function leerRegistrosDeArchivo(ruta: string): Promise<RegistroFuenteFuturaDTO[]> {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(ruta);
  return registrosDelLibro(libro);
}

/**
 * Lo mismo, pero sobre los bytes que acaban de llegar y exigiendo que el archivo sirva:
 * se usa antes de guardar nada, para que un Excel con otras columnas no deje carga ni
 * archivo en el servidor.
 *
 * @throws {ErrorDeExcelFuentesFuturas} 422 si no se puede abrir, no tiene las columnas
 * obligatorias o no deja ninguna fila aprovechable.
 */
export async function leerRegistrosDeBuffer(datos: Buffer): Promise<RegistroFuenteFuturaDTO[]> {
  const libro = new ExcelJS.Workbook();
  try {
    // `as any` como en las otras lecturas desde buffer del backend: los tipos de
    // `exceljs` traen su propio `Buffer`, incompatible con el de `@types/node`.
    await libro.xlsx.load(datos as any);
  } catch {
    throw new ErrorDeExcelFuentesFuturas('No se pudo abrir el archivo: ¿está dañado o no es un Excel?', 422);
  }

  const hoja = libro.worksheets[0];
  if (!hoja || hoja.rowCount < 2) {
    throw new ErrorDeExcelFuentesFuturas('El archivo no tiene filas de datos bajo los encabezados.', 422);
  }

  const columnas = mapearColumnas(hoja);
  const faltantes = (
    [
      ['departamento', 'Departamento'],
      ['sector', 'Sector'],
      ['cuentaProyecto', 'Cuenta de Proyecto'],
    ] as const
  )
    .filter(([clave]) => !columnas[clave])
    .map(([, titulo]) => titulo);

  if (faltantes.length > 0) {
    throw new ErrorDeExcelFuentesFuturas(
      `Al archivo le faltan columnas: ${faltantes.join(', ')}. Descargue el formato para ver las que se esperan.`,
      422
    );
  }

  if (hoja.rowCount - 1 > MAX_FILAS) {
    throw new ErrorDeExcelFuentesFuturas(
      `El archivo trae más de ${MAX_FILAS.toLocaleString('es-CO')} filas; divídalo antes de subirlo.`,
      422
    );
  }

  const registros = registrosDelLibro(libro);
  if (registros.length === 0) {
    throw new ErrorDeExcelFuentesFuturas(
      'Ninguna fila del archivo tiene departamento y sector: no hay nada que publicar.',
      422
    );
  }

  return registros;
}
