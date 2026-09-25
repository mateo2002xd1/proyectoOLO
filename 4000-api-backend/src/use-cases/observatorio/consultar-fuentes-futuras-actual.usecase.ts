import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';

export interface RegistroFuenteFuturaDTO {
  id: string;
  departamento: string;
  sector: string;
  cuentaProyecto: number;
  principalesFuentes?: string;
}

const NOMBRES_ARCHIVO_SOPORTADOS = [
  'fuentes-futuras-de-empleo.xlsx',
  'fuentes-futuras-empleo.xlsx',
  'fuentes-futuras.xlsx',
];

const cacheEnMemoria = new Map<string, { mtime: number; registros: RegistroFuenteFuturaDTO[] }>();

/**
 * Consulta los datos vigentes de "Fuentes futuras de empleo" leyendo el archivo Excel
 * `fuentes-futuras-de-empleo.xlsx` desde la carpeta de uploads del backend.
 *
 * Estructura de columnas:
 * - Departamento
 * - Sector
 * - Cuenta de Proyecto
 * - Principales Fuentes
 */
export async function consultarFuentesFuturasActual(): Promise<RegistroFuenteFuturaDTO[]> {
  let rutaArchivo = '';

  const carpetasBusqueda = [
    path.resolve(process.cwd(), 'uploads/cargas-datos'),
    path.resolve(process.cwd(), 'uploads'),
  ];

  for (const carpeta of carpetasBusqueda) {
    for (const nombre of NOMBRES_ARCHIVO_SOPORTADOS) {
      const p = path.join(carpeta, nombre);
      if (fs.existsSync(p)) {
        rutaArchivo = p;
        break;
      }
    }
    if (rutaArchivo) break;
  }

  // Si aún no existe el archivo Excel, retornamos limpio sin error
  if (!rutaArchivo || !fs.existsSync(rutaArchivo)) {
    return [];
  }

  try {
    const stat = fs.statSync(rutaArchivo);
    const cache = cacheEnMemoria.get(rutaArchivo);
    if (cache && cache.mtime === stat.mtimeMs) {
      return cache.registros;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(rutaArchivo);

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount < 2) {
      return [];
    }

    const headerRow = worksheet.getRow(1);
    const colMap: Record<string, number> = {};

    headerRow.eachCell((cell, colNumber) => {
      const text = (cell.value || '').toString().toLowerCase().trim();
      if (text.includes('departamento') || text.includes('depto')) {
        colMap.departamento = colNumber;
      } else if (text.includes('sector')) {
        colMap.sector = colNumber;
      } else if (text.includes('cuenta') || text.includes('proyecto')) {
        colMap.cuentaProyecto = colNumber;
      } else if (text.includes('fuente')) {
        colMap.principalesFuentes = colNumber;
      }
    });

    const registros: RegistroFuenteFuturaDTO[] = [];

    for (let r = 2; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
      const deptoRaw = row.getCell(colMap.departamento || 1).value;
      if (!deptoRaw) continue;

      const sectorRaw = row.getCell(colMap.sector || 2).value;
      if (!sectorRaw) continue;

      const cuentaRaw = row.getCell(colMap.cuentaProyecto || 3).value;
      const fuentesRaw = colMap.principalesFuentes
        ? row.getCell(colMap.principalesFuentes).value
        : undefined;

      registros.push({
        id: `ffe-${r}`,
        departamento: String(deptoRaw).trim(),
        sector: String(sectorRaw).trim(),
        cuentaProyecto: Number(cuentaRaw) || 0,
        principalesFuentes: fuentesRaw ? String(fuentesRaw).trim() : undefined,
      });
    }

    cacheEnMemoria.set(rutaArchivo, { mtime: stat.mtimeMs, registros });
    return registros;
  } catch (err) {
    console.warn('[fuentes-futuras-empleo] Error al leer el archivo Excel:', err);
    return [];
  }
}
