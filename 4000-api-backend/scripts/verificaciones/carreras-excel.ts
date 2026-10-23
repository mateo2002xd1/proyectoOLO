/**
 * Excel de prueba de «Programas sobresalientes» para los scripts `probar-carreras-*.ts`: un libro con
 * la hoja «Superan el margen» y las columnas que pide `importarProgramasExcel`.
 */
import * as ExcelJS from 'exceljs';

export interface FilaExcel {
  regional: string; codRegional: number; codCentro: number; centro: string;
  codNivel: number; nivel: string; codPrograma: number; programa: string; sexo: 'M' | 'F';
  certificados: number; vinculados: number;
}

/** Un libro con la hoja «Superan el margen» y las filas dadas. */
export const libro = async (filas: FilaExcel[]): Promise<Buffer> => {
  const wb = new ExcelJS.Workbook();
  const hoja = wb.addWorksheet('Superan el margen');
  hoja.addRow([
    'Cod. Regional', 'Regional', 'Cod. Centro', 'Centro', 'Cod. Nivel de formación', 'Nivel de Formación',
    'Cod. Programa', 'Programa', 'Sexo', 'Certificados', 'Vinculados', 'Tasa de vinculación', 'Salario promedio',
  ]);
  for (const f of filas) {
    hoja.addRow([
      String(f.codRegional).padStart(2, '0'), f.regional, String(f.codCentro), f.centro, String(f.codNivel), f.nivel,
      String(f.codPrograma), f.programa, f.sexo, f.certificados, f.vinculados,
      f.certificados ? f.vinculados / f.certificados : 0, 1500000,
    ]);
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
};

const ANT = { regional: 'Antioquia', codRegional: 5 };
export const generar = (prefijo: number, centros: number, programas: number): FilaExcel[] => {
  const filas: FilaExcel[] = [];
  for (let c = 0; c < centros; c++) {
    for (let p = 0; p < programas; p++) {
      for (const sexo of ['M', 'F'] as const) {
        filas.push({
          ...ANT, codCentro: prefijo * 100 + c, centro: `Centro ${prefijo}-${c}`, codNivel: prefijo, nivel: `Nivel ${prefijo}`,
          codPrograma: prefijo * 1000 + p, programa: `Programa ${prefijo}-${p}`, sexo, certificados: 100, vinculados: 60 + (p % 30),
        });
      }
    }
  }
  return filas;
};
