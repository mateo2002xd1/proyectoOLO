import * as ExcelJS from 'exceljs';
import { Transaction } from 'sequelize';
import sequelize from '../../config/database';
import {
  CentroFormacion,
  NivelFormacion,
  ProgramaFormacion,
  ProgramaSobresaliente,
} from '../../infrastructure/db/models';
import { DepartamentosRepository } from '../../repositories/departamentos.repository';

const MAX_ROWS_LIMIT = 100000;

/** Nombre exacto de la única hoja que se carga — el archivo real trae 31 hojas en
 * total: "Mujer" y "Hombre" (dataset crudo de cálculo de margen, no se cargan) y
 * 28 hojas por departamento que repiten esta misma información partida por
 * regional (verificadas fila por fila, redundantes, tampoco se cargan). */
const HOJA_A_CARGAR = 'Superan el margen';

/** Encabezados reales de la hoja, tal como los trae el Excel de SENA. */
const COLUMNAS = {
  regional: 'Regional',
  centro: 'Centro',
  nivel: 'Nivel de Formación',
  programa: 'Programa',
  sexo: 'Sexo',
  certificados: 'Certificados',
  vinculados: 'Vinculados',
  tasaVinculacion: 'Tasa de vinculación',
  salarioPromedio: 'Salario promedio',
} as const;

export interface ImportarExcelResult {
  exito: boolean;
  mensaje: string;
  estadisticas: {
    filasCargadas: number;
    /** Filas del Excel que compartían centro+programa+sexo con otra y se sumaron en una sola. */
    filasCombinadas: number;
    nuevosCentros: number;
    nuevosProgramas: number;
    nuevosNiveles: number;
  };
}

export interface ProgresoImportacion {
  /** 0-100. 0-60 es leer y validar el Excel; 60-100 es escribirlo en la base. */
  porcentaje: number;
  filasProcesadas: number;
  filasTotales: number;
}

export type OnProgresoImportacion = (progreso: ProgresoImportacion) => void;

/** Filas por lote al insertar en `programas_sobresalientes` — además de repartir el
 * progreso entre 60 y 100%, evita mandar un único `INSERT` con decenas de miles de
 * filas de golpe. */
const TAMANO_LOTE_INSERCION = 2000;

class ErrorDeFila extends Error {
  constructor(fila: number, mensaje: string) {
    super(`Fila ${fila}: ${mensaje}`);
  }
}

const comoTexto = (celda: ExcelJS.Cell): string => (celda.text ?? '').toString().trim();

const comoNumero = (celda: ExcelJS.Cell, fila: number, columna: string): number => {
  const crudo = celda.type === ExcelJS.ValueType.Formula ? (celda as any).result : celda.text;
  const numero = Number(String(crudo ?? '').replace(',', '.').replace('%', '').trim());
  if (!Number.isFinite(numero)) {
    throw new ErrorDeFila(fila, `la columna "${columna}" no es un número válido (llegó "${crudo}")`);
  }
  return numero;
};

/**
 * Normaliza la tasa de vinculación a fracción (0-1), que es lo que exige el
 * `CHECK` de `programas_sobresalientes` (`ck_sobresalientes_tasa`).
 *
 * El Excel puede traer el valor como porcentaje entero (90) o ya como fracción
 * (0.9) según cómo esté formateada la celda — no hay forma de saberlo de
 * antemano sin abrir el archivo real cada vez. Cualquier tasa de vinculación
 * legítima en este dataset es mayor a 1 en su forma "porcentaje", así que la
 * regla es segura: si el valor crudo es mayor a 1, se asume porcentaje y se
 * divide entre 100; si no, ya viene como fracción.
 */
const normalizarTasa = (valorCrudo: number): number => (valorCrudo > 1 ? valorCrudo / 100 : valorCrudo);

/**
 * Carga el Excel de "Programa + sobresalientes": lee **solo** la hoja
 * "Superan el margen", valida cada fila y reemplaza por completo
 * `programas_sobresalientes` dentro de una única transacción (vaciar + recargar:
 * si algo falla, no queda la tabla a medias ni con datos mezclados de dos cargas).
 *
 * Catálogos (`centros_formacion`, `niveles_formacion`, `programas_formacion`) se
 * resuelven por nombre exacto — no tienen columna de código — y se crean los que
 * falten en la misma transacción. `departamentos` no: es el catálogo cerrado de los 33
 * oficiales (migración 032) y se resuelve por alias; un nombre que no calce rechaza
 * la carga en vez de crear un departamento nuevo.
 */
export const importarProgramasExcel = async (
  fileBuffer: Buffer,
  onProgreso?: OnProgresoImportacion
): Promise<ImportarExcelResult> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as any);

  const hoja = workbook.getWorksheet(HOJA_A_CARGAR);
  if (!hoja) {
    throw new Error(`No se encontró la hoja "${HOJA_A_CARGAR}" en el archivo.`);
  }

  if (hoja.rowCount > MAX_ROWS_LIMIT) {
    throw new Error(`El archivo excede el límite permitido de filas (${MAX_ROWS_LIMIT}).`);
  }

  // Total estimado para el loader: filas de datos antes de descartar las que
  // marcan el fin del rango usado por Excel (ver el `continue` más abajo). Se
  // conoce de una vez, así que el progreso de lectura (0-60%) no salta de total.
  const filasTotalesEstimadas = Math.max(hoja.rowCount - 1, 1);

  const filaEncabezado = hoja.getRow(1);
  const indicePorColumna = new Map<string, number>();
  filaEncabezado.eachCell((celda, indice) => {
    indicePorColumna.set(celda.text?.toString().trim() ?? '', indice);
  });

  const columnaFaltante = Object.values(COLUMNAS).find((nombre) => !indicePorColumna.has(nombre));
  if (columnaFaltante) {
    throw new Error(`Falta la columna "${columnaFaltante}" en la hoja "${HOJA_A_CARGAR}".`);
  }

  const leer = (fila: ExcelJS.Row, columna: string) => fila.getCell(indicePorColumna.get(columna)!);

  const primeraFilaPorDepto = new Map<string, number>(); // nombre tal como viene -> fila
  const nivelesSet = new Set<string>();
  const programasSet = new Set<string>(); // "nivel|programa"
  const rowsData: {
    depto: string; centro: string; nivel: string; programa: string; sexo: string;
    certificados: number; vinculados: number; tasaVinculacion: number; salarioPromedio: number;
  }[] = [];

  for (let numeroFila = 2; numeroFila <= hoja.rowCount; numeroFila++) {
    const fila = hoja.getRow(numeroFila);
    const depto = comoTexto(leer(fila, COLUMNAS.regional));
    if (fila.cellCount === 0 || !depto) continue; // fin del rango usado por Excel, no un dato

    const centro = comoTexto(leer(fila, COLUMNAS.centro));
    const nivel = comoTexto(leer(fila, COLUMNAS.nivel));
    const programa = comoTexto(leer(fila, COLUMNAS.programa));
    const sexo = comoTexto(leer(fila, COLUMNAS.sexo)).toUpperCase();

    if (sexo !== 'M' && sexo !== 'F') {
      throw new ErrorDeFila(numeroFila, `"Sexo" debe ser M o F (llegó "${sexo}")`);
    }

    const certificados = comoNumero(leer(fila, COLUMNAS.certificados), numeroFila, COLUMNAS.certificados);
    const vinculados = comoNumero(leer(fila, COLUMNAS.vinculados), numeroFila, COLUMNAS.vinculados);
    const tasaVinculacion = normalizarTasa(
      comoNumero(leer(fila, COLUMNAS.tasaVinculacion), numeroFila, COLUMNAS.tasaVinculacion)
    );
    const salarioPromedio = comoNumero(leer(fila, COLUMNAS.salarioPromedio), numeroFila, COLUMNAS.salarioPromedio);

    // Mismo `CHECK` que la base (`ck_sobresalientes_vinculados`) — se valida aquí
    // también para que el error señale la fila exacta, no un fallo genérico de
    // Postgres al insertar el lote completo.
    if (vinculados > certificados) {
      throw new ErrorDeFila(numeroFila, `"Vinculados" (${vinculados}) no puede superar a "Certificados" (${certificados})`);
    }

    if (!primeraFilaPorDepto.has(depto)) primeraFilaPorDepto.set(depto, numeroFila);
    nivelesSet.add(nivel);
    programasSet.add(`${nivel}|${programa}`);

    rowsData.push({ depto, centro, nivel, programa, sexo, certificados, vinculados, tasaVinculacion, salarioPromedio });

    // Cada 100 filas alcanza para que el loader se vea vivo sin llamar al
    // callback (y de ahí escribir en la base) en cada una de hasta 100.000 filas.
    if (onProgreso && (numeroFila % 100 === 0 || numeroFila === hoja.rowCount)) {
      onProgreso({
        porcentaje: Math.min(60, Math.round((numeroFila / filasTotalesEstimadas) * 60)),
        filasProcesadas: rowsData.length,
        filasTotales: filasTotalesEstimadas,
      });
    }
  }

  if (rowsData.length === 0) {
    throw new Error(`La hoja "${HOJA_A_CARGAR}" no tiene filas de datos.`);
  }

  // El departamento se resuelve por alias contra el catálogo cerrado (migración 032) y
  // se sustituye por su id antes de agrupar: así "Valle" y "Valle del Cauca" en el
  // mismo archivo son un solo departamento y no dos filas que chocan al insertar.
  const departamentos = await DepartamentosRepository.resolverPorNombres(primeraFilaPorDepto.keys());
  const noReconocidos = Array.from(departamentos)
    .filter(([, departamento]) => !departamento)
    .map(([nombre]) => `"${nombre}" (fila ${primeraFilaPorDepto.get(nombre)})`);
  if (noReconocidos.length > 0) {
    throw new Error(
      `Departamento no reconocido en la columna "${COLUMNAS.regional}": ${noReconocidos.join(', ')}. ` +
        'Use el nombre oficial del departamento.'
    );
  }
  const centrosSet = new Set<string>(); // "departamentoId|centro"
  for (const fila of rowsData) {
    fila.depto = departamentos.get(fila.depto)!.id;
    centrosSet.add(`${fila.depto}|${fila.centro}`);
  }

  // El Excel real trae centro+programa+sexo repetido alguna vez (varias cohortes
  // del mismo programa reportadas en filas separadas) — y `programas_sobresalientes`
  // exige esa combinación única (`uq_sobresalientes_registro`). En vez de fallar la
  // carga completa o descartar filas, se fusionan: certificados y vinculados se
  // suman, la tasa se recalcula sobre esos totales y el salario se pondera por
  // certificados — así no se pierde ningún dato, solo se consolida.
  const filasAgregadas = new Map<
    string,
    { depto: string; centro: string; nivel: string; programa: string; sexo: string;
      certificados: number; vinculados: number; salarioPonderado: number; filasOriginales: number }
  >();
  for (const fila of rowsData) {
    const clave = `${fila.depto}|||${fila.centro}|||${fila.nivel}|||${fila.programa}|||${fila.sexo}`;
    const existente = filasAgregadas.get(clave);
    const salarioPonderado = fila.salarioPromedio * fila.certificados;
    if (existente) {
      existente.certificados += fila.certificados;
      existente.vinculados += fila.vinculados;
      existente.salarioPonderado += salarioPonderado;
      existente.filasOriginales += 1;
    } else {
      filasAgregadas.set(clave, { ...fila, salarioPonderado, filasOriginales: 1 });
    }
  }

  const filasFinales = Array.from(filasAgregadas.values()).map((f) => ({
    depto: f.depto,
    centro: f.centro,
    nivel: f.nivel,
    programa: f.programa,
    sexo: f.sexo,
    certificados: f.certificados,
    vinculados: f.vinculados,
    tasaVinculacion: f.certificados > 0 ? f.vinculados / f.certificados : 0,
    salarioPromedio: f.certificados > 0 ? f.salarioPonderado / f.certificados : 0,
  }));

  const filasCombinadas = rowsData.length - filasFinales.length;

  const resultado = await sequelize.transaction(async (transaction: Transaction) => {
    let nuevosCentros = 0;
    let nuevosNiveles = 0;
    let nuevosProgramas = 0;

    // --- Niveles de formación ---
    const nivelesMap = new Map<string, string>();
    (await NivelFormacion.findAll({ transaction })).forEach((n: any) => nivelesMap.set(n.nombre, n.id));
    const nivelesFaltantes = Array.from(nivelesSet).filter((n) => !nivelesMap.has(n));
    if (nivelesFaltantes.length > 0) {
      const creados = await NivelFormacion.bulkCreate(nivelesFaltantes.map((nombre) => ({ nombre })), { transaction });
      creados.forEach((n: any) => nivelesMap.set(n.nombre, n.id));
      nuevosNiveles = creados.length;
    }

    // --- Centros de formación ---
    const centrosIdMap = new Map<string, string>(); // "deptoId|nombre" -> id
    (await CentroFormacion.findAll({ transaction })).forEach((c: any) =>
      centrosIdMap.set(`${c.departamento_id}|${c.nombre}`, c.id)
    );
    const centrosFaltantes: { departamento_id: string; nombre: string }[] = [];
    for (const key of centrosSet) {
      if (!centrosIdMap.has(key)) {
        const separador = key.indexOf('|');
        centrosFaltantes.push({ departamento_id: key.slice(0, separador), nombre: key.slice(separador + 1) });
        centrosIdMap.set(key, 'PENDIENTE');
      }
    }
    if (centrosFaltantes.length > 0) {
      const creados = await CentroFormacion.bulkCreate(centrosFaltantes, { transaction });
      creados.forEach((c: any) => centrosIdMap.set(`${c.departamento_id}|${c.nombre}`, c.id));
      nuevosCentros = creados.length;
    }

    // --- Programas de formación ---
    const programasIdMap = new Map<string, string>(); // "nivelId|nombre" -> id
    (await ProgramaFormacion.findAll({ transaction })).forEach((p: any) =>
      programasIdMap.set(`${p.nivel_formacion_id}|${p.nombre}`, p.id)
    );
    const programasFaltantes: { nivel_formacion_id: string; nombre: string }[] = [];
    for (const item of programasSet) {
      const [nivel, programa] = item.split('|');
      const key = `${nivelesMap.get(nivel)}|${programa}`;
      if (!programasIdMap.has(key)) {
        programasFaltantes.push({ nivel_formacion_id: nivelesMap.get(nivel)!, nombre: programa });
        programasIdMap.set(key, 'PENDIENTE');
      }
    }
    if (programasFaltantes.length > 0) {
      const creados = await ProgramaFormacion.bulkCreate(programasFaltantes, { transaction });
      creados.forEach((p: any) => programasIdMap.set(`${p.nivel_formacion_id}|${p.nombre}`, p.id));
      nuevosProgramas = creados.length;
    }

    // --- Hechos: vaciar y recargar completo ---
    await ProgramaSobresaliente.destroy({ where: {}, transaction });

    const registros = filasFinales.map((fila) => {
      const departamentoId = fila.depto; // ya es el id: se resolvió antes de agrupar
      const nivelFormacionId = nivelesMap.get(fila.nivel)!;
      return {
        departamento_id: departamentoId,
        centro_id: centrosIdMap.get(`${departamentoId}|${fila.centro}`)!,
        nivel_formacion_id: nivelFormacionId,
        programa_id: programasIdMap.get(`${nivelFormacionId}|${fila.programa}`)!,
        sexo: fila.sexo,
        certificados: fila.certificados,
        vinculados: fila.vinculados,
        tasa_vinculacion: fila.tasaVinculacion,
        salario_promedio: fila.salarioPromedio,
      };
    });

    onProgreso?.({ porcentaje: 60, filasProcesadas: 0, filasTotales: registros.length });

    for (let inicio = 0; inicio < registros.length; inicio += TAMANO_LOTE_INSERCION) {
      const lote = registros.slice(inicio, inicio + TAMANO_LOTE_INSERCION);
      await ProgramaSobresaliente.bulkCreate(lote, { transaction });

      const insertados = Math.min(inicio + TAMANO_LOTE_INSERCION, registros.length);
      onProgreso?.({
        porcentaje: 60 + Math.round((insertados / registros.length) * 40),
        filasProcesadas: insertados,
        filasTotales: registros.length,
      });
    }

    return {
      exito: true,
      mensaje: 'Base de datos actualizada con éxito',
      estadisticas: {
        filasCargadas: registros.length,
        filasCombinadas,
        nuevosCentros,
        nuevosNiveles,
        nuevosProgramas,
      },
    };
  });

  return resultado;
};
