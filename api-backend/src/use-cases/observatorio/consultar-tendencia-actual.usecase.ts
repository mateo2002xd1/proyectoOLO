import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';

export interface RegistroTendenciaDTO {
  id: string;
  departamento: string;
  nivelOcupacional: string;
  nivelCodigo: string;
  codigoCno: string;
  nombreOcupacion: string;
  totalInscritos: number;
  totalVacantes: number;
  anio: number;
  periodo: string;
}

/**
 * Mapeo de cuadrantes de tendencias a los nombres de archivo soportados:
 * Admite nombres descriptivos (base-tendencia-mas-menos.xlsx, tendencias-ocupacionales-mas-menos.xlsx),
 * secuenciales (base-tendencia-1.xlsx), o directos (mas-menos.xlsx).
 */
const MAPA_ARCHIVOS_POR_TIPO: Record<string, string[]> = {
  'mas-menos': [
    'base-tendencia-mas-menos.xlsx',
    'base-tendencia-1.xlsx',
    'tendencia-mas-menos.xlsx',
    'tendencias-ocupacionales-mas-menos.xlsx',
    'mas-menos.xlsx',
  ],
  'mas-mas': [
    'base-tendencia-mas-mas.xlsx',
    'base-tendencia-2.xlsx',
    'tendencia-mas-mas.xlsx',
    'tendencias-ocupacionales-mas-mas.xlsx',
    'mas-mas.xlsx',
  ],
  'menos-menos': [
    'base-tendencia-menos-menos.xlsx',
    'base-tendencia-3.xlsx',
    'tendencia-menos-menos.xlsx',
    'tendencias-ocupacionales-menos-menos.xlsx',
    'menos-menos.xlsx',
  ],
  'menos-mas': [
    'base-tendencia-menos-mas.xlsx',
    'base-tendencia-4.xlsx',
    'tendencia-menos-mas.xlsx',
    'tendencias-ocupacionales-menos-mas.xlsx',
    'menos-mas.xlsx',
  ],
};

// Caché en memoria indexada por ruta de archivo y timestamp de modificación (mtime)
const cacheEnMemoria = new Map<string, { mtime: number; registros: RegistroTendenciaDTO[] }>();

/**
 * Lee el archivo Excel correspondiente al tipo de tendencia solicitado
 * en tiempo real sin tocar bases de datos. Si el archivo se reemplaza
 * en disco, detecta el cambio de fecha y recarga los datos al instante.
 */
export async function consultarTendenciaOcupacionalActual(
  tipo: string = 'mas-menos'
): Promise<RegistroTendenciaDTO[]> {
  let rutaArchivo = '';

  // 1. Buscar en el mapa según el cuadrante
  const opciones = MAPA_ARCHIVOS_POR_TIPO[tipo] || [];
  for (const nombre of opciones) {
    const p = path.resolve(process.cwd(), 'uploads/cargas-datos', nombre);
    if (fs.existsSync(p)) {
      rutaArchivo = p;
      break;
    }
  }

  if (!rutaArchivo || !fs.existsSync(rutaArchivo)) {
    return [];
  }

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
    if (text.includes('departamento')) colMap.departamento = colNumber;
    else if (text.includes('nivel') && text.includes('ocupacional')) colMap.nivelOcupacional = colNumber;
    else if (text.includes('c.n.o') || text.includes('cno') || text.includes('código') || text.includes('codigo')) {
      colMap.codigoCno = colNumber;
    } else if (text.includes('nombre') || text.includes('ocupaci')) {
      colMap.nombreOcupacion = colNumber;
    } else if (text.includes('inscrito')) {
      colMap.totalInscritos = colNumber;
    } else if (text.includes('vacante')) {
      colMap.totalVacantes = colNumber;
    } else if (text.includes('año') || text.includes('anio')) {
      colMap.anio = colNumber;
    } else if (text.includes('periodo')) {
      colMap.periodo = colNumber;
    }
  });

  const registros: RegistroTendenciaDTO[] = [];

  for (let r = 2; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r);
    const deptoRaw = row.getCell(colMap.departamento || 1).value;
    if (!deptoRaw) continue;

    const nivelRaw = String(row.getCell(colMap.nivelOcupacional || 2).value || '').trim();
    let nivelCodigo = nivelRaw;
    const matchNivel = nivelRaw.match(/^(Nivel\s*[0-9,]+\s*\([A-Za-z]\))/i);
    if (matchNivel) {
      nivelCodigo = matchNivel[1];
    } else if (nivelRaw.toLowerCase().startsWith('0 direcci')) {
      nivelCodigo = '0 Dirección y gerencia';
    } else if (nivelRaw.includes(':')) {
      nivelCodigo = nivelRaw.split(':')[0].trim();
    }

    const cnoRaw = row.getCell(colMap.codigoCno || 3).value;
    const codigoCno = cnoRaw ? String(cnoRaw).trim().padStart(4, '0') : '';

    registros.push({
      id: `${tipo}-${r}`,
      departamento: String(deptoRaw).trim(),
      nivelOcupacional: nivelRaw,
      nivelCodigo,
      codigoCno,
      nombreOcupacion: String(row.getCell(colMap.nombreOcupacion || 4).value || '').trim(),
      totalInscritos: Number(row.getCell(colMap.totalInscritos || 5).value) || 0,
      totalVacantes: Number(row.getCell(colMap.totalVacantes || 6).value) || 0,
      anio: Number(row.getCell(colMap.anio || 7).value) || 2026,
      periodo: String(row.getCell(colMap.periodo || 8).value || '').trim(),
    });
  }

  cacheEnMemoria.set(rutaArchivo, { mtime: stat.mtimeMs, registros });
  return registros;
}
