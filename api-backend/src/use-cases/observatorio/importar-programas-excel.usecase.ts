import * as ExcelJS from 'exceljs';
import sequelize from '../../config/database';
import {
  Departamento,
  CentroFormacion,
  NivelFormacion,
  ProgramaFormacion,
  ProgramaSobresaliente,
} from '../../infrastructure/db/models';
import { Transaction } from 'sequelize';

const MAX_ROWS_LIMIT = 100000;

export interface ImportarExcelResult {
  exito: boolean;
  mensaje: string;
  estadisticas: {
    filasCargadas: number;
    nuevosDepartamentos: number;
    nuevosCentros: number;
    nuevosProgramas: number;
    nuevosNiveles: number;
  };
}

export const importarProgramasExcel = async (fileBuffer: any): Promise<ImportarExcelResult> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as any);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('El archivo Excel no contiene hojas.');
  }

  const rowCount = worksheet.rowCount;
  if (rowCount > MAX_ROWS_LIMIT) {
    throw new Error(`El archivo excede el límite permitido de filas (${MAX_ROWS_LIMIT}).`);
  }

  // 1. Leer y extraer únicos
  const deptosSet = new Set<string>();
  const nivelesSet = new Set<string>();
  const centrosMap = new Map<string, string>(); 
  const centrosSet = new Set<string>(); // "depto|centro"
  const programasSet = new Set<string>(); // "nivel|programa"

  // Estructura para almacenar las filas validadas en memoria
  const rowsData: any[] = [];

  let headerRowIndex = 1;
  const headerRow = worksheet.getRow(headerRowIndex);
  let hasHeaders = false;
  
  // Buscar encabezados (por si hay filas vacías al inicio)
  for (let i = 1; i <= Math.min(10, rowCount); i++) {
    const row = worksheet.getRow(i);
    const firstCell = row.getCell(1).text?.trim().toLowerCase();
    if (firstCell === 'regional') {
      headerRowIndex = i;
      hasHeaders = true;
      break;
    }
  }

  if (!hasHeaders) {
    throw new Error('No se encontraron las cabeceras requeridas (ej. "Regional" en la primera columna).');
  }

  // Procesar filas (saltando la cabecera)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIndex) return;

    // A: Regional, B: Centro, C: Nivel de Formación, D: Programa, E: Sexo, F: Certificados, G: Vinculados, H: Tasa vinculación, I: Salario promedio
    const regional = row.getCell(1).text?.trim();
    const centro = row.getCell(2).text?.trim();
    const nivel = row.getCell(3).text?.trim();
    const programa = row.getCell(4).text?.trim();
    const sexo = row.getCell(5).text?.trim().toUpperCase();
    const certificados = parseInt(row.getCell(6).text || '0', 10);
    const vinculados = parseInt(row.getCell(7).text || '0', 10);
    
    // Tasas y salarios pueden ser resultados de fórmulas o textos numéricos
    let tasa_vinculacion = 0;
    const tasaCell = row.getCell(8);
    if (tasaCell.type === ExcelJS.ValueType.Formula) {
      tasa_vinculacion = parseFloat(tasaCell.result?.toString() || '0');
    } else {
      tasa_vinculacion = parseFloat(tasaCell.text || '0');
    }

    let salario_promedio = 0;
    const salarioCell = row.getCell(9);
    if (salarioCell.type === ExcelJS.ValueType.Formula) {
      salario_promedio = parseFloat(salarioCell.result?.toString() || '0');
    } else {
      salario_promedio = parseFloat(salarioCell.text || '0');
    }

    if (!regional || !centro || !nivel || !programa || !sexo) {
      // Omitir filas vacías
      return;
    }

    if (sexo !== 'M' && sexo !== 'F') {
      throw new Error(`Error en fila ${rowNumber}: Sexo debe ser 'M' o 'F' (encontrado: ${sexo}).`);
    }

    if (isNaN(certificados) || isNaN(vinculados) || isNaN(tasa_vinculacion) || isNaN(salario_promedio)) {
       throw new Error(`Error en fila ${rowNumber}: Existen valores numéricos inválidos.`);
    }

    const deptoNorm = regional;
    const centroNorm = centro;
    const nivelNorm = nivel;
    const programaNorm = programa;

    deptosSet.add(deptoNorm);
    nivelesSet.add(nivelNorm);
    centrosSet.add(`${deptoNorm}|${centroNorm}`);
    programasSet.add(`${nivelNorm}|${programaNorm}`);

    rowsData.push({
      deptoNorm,
      centroNorm,
      nivelNorm,
      programaNorm,
      sexo,
      certificados,
      vinculados,
      tasa_vinculacion,
      salario_promedio
    });
  });

  if (rowsData.length === 0) {
    throw new Error('El archivo Excel no contiene datos válidos para procesar.');
  }

  // 2. Transacción Atómica
  const result = await sequelize.transaction(async (transaction: Transaction) => {
    
    let nuevosDepartamentos = 0;
    let nuevosCentros = 0;
    let nuevosNiveles = 0;
    let nuevosProgramas = 0;

    // --- A. Resolver Departamentos ---
    const deptosMap = new Map<string, string>(); // norm -> id
    const deptosExistentes = await Departamento.findAll({ transaction });
    deptosExistentes.forEach(d => deptosMap.set(d.nombre, d.id));

    const deptosFaltantes = Array.from(deptosSet).filter(d => !deptosMap.has(d));
    if (deptosFaltantes.length > 0) {
      const creados = await Departamento.bulkCreate(
        deptosFaltantes.map(nombre => ({ nombre })),
        { transaction, returning: true }
      );
      creados.forEach(d => deptosMap.set(d.nombre, d.id));
      nuevosDepartamentos = creados.length;
    }

    // --- B. Resolver Niveles ---
    const nivelesMap = new Map<string, string>(); // norm -> id
    const nivelesExistentes = await NivelFormacion.findAll({ transaction });
    nivelesExistentes.forEach(n => nivelesMap.set(n.nombre, n.id));

    const nivelesFaltantes = Array.from(nivelesSet).filter(n => !nivelesMap.has(n));
    if (nivelesFaltantes.length > 0) {
      const creados = await NivelFormacion.bulkCreate(
        nivelesFaltantes.map(nombre => ({ nombre })),
        { transaction, returning: true }
      );
      creados.forEach(n => nivelesMap.set(n.nombre, n.id));
      nuevosNiveles = creados.length;
    }

    // --- C. Resolver Centros ---
    const centrosIdMap = new Map<string, string>(); // "deptoId|centroNorm" -> id
    const centrosExistentes = await CentroFormacion.findAll({ transaction });
    centrosExistentes.forEach(c => centrosIdMap.set(`${c.departamento_id}|${c.nombre}`, c.id));

    const centrosFaltantesData: { departamento_id: string, nombre: string }[] = [];
    Array.from(centrosSet).forEach(item => {
      const [depto, centro] = item.split('|');
      const deptoId = deptosMap.get(depto)!;
      const key = `${deptoId}|${centro}`;
      if (!centrosIdMap.has(key)) {
        centrosFaltantesData.push({ departamento_id: deptoId, nombre: centro });
        centrosIdMap.set(key, 'PENDING'); 
      }
    });

    if (centrosFaltantesData.length > 0) {
      const creados = await CentroFormacion.bulkCreate(centrosFaltantesData, { transaction, returning: true });
      creados.forEach(c => centrosIdMap.set(`${c.departamento_id}|${c.nombre}`, c.id));
      nuevosCentros = creados.length;
    }

    // --- D. Resolver Programas ---
    const programasIdMap = new Map<string, string>(); // "nivelId|programaNorm" -> id
    const programasExistentes = await ProgramaFormacion.findAll({ transaction });
    programasExistentes.forEach(p => programasIdMap.set(`${p.nivel_formacion_id}|${p.nombre}`, p.id));

    const programasFaltantesData: { nivel_formacion_id: string, nombre: string }[] = [];
    Array.from(programasSet).forEach(item => {
      const [nivel, programa] = item.split('|');
      const nivelId = nivelesMap.get(nivel)!;
      const key = `${nivelId}|${programa}`;
      if (!programasIdMap.has(key)) {
        programasFaltantesData.push({ nivel_formacion_id: nivelId, nombre: programa });
        programasIdMap.set(key, 'PENDING');
      }
    });

    if (programasFaltantesData.length > 0) {
      const creados = await ProgramaFormacion.bulkCreate(programasFaltantesData, { transaction, returning: true });
      creados.forEach(p => programasIdMap.set(`${p.nivel_formacion_id}|${p.nombre}`, p.id));
      nuevosProgramas = creados.length;
    }

    // 3. Vaciar hechos (Truncate & Reload)
    await ProgramaSobresaliente.destroy({ where: {}, transaction });

    // 4. Mapear y cargar nuevos hechos
    const recordsToInsert = rowsData.map(row => {
      const deptoId = deptosMap.get(row.deptoNorm)!;
      const centroId = centrosIdMap.get(`${deptoId}|${row.centroNorm}`)!;
      const nivelId = nivelesMap.get(row.nivelNorm)!;
      const progId = programasIdMap.get(`${nivelId}|${row.programaNorm}`)!;

      return {
        departamento_id: deptoId,
        centro_id: centroId,
        nivel_formacion_id: nivelId,
        programa_id: progId,
        sexo: row.sexo,
        certificados: row.certificados,
        vinculados: row.vinculados,
        tasa_vinculacion: row.tasa_vinculacion,
        salario_promedio: row.salario_promedio
      };
    });

    await ProgramaSobresaliente.bulkCreate(recordsToInsert, { transaction });

    return {
      exito: true,
      mensaje: 'Base de datos actualizada con éxito',
      estadisticas: {
        filasCargadas: recordsToInsert.length,
        nuevosDepartamentos,
        nuevosCentros,
        nuevosNiveles,
        nuevosProgramas
      }
    };
  });

  return result;
};
