import * as ExcelJS from 'exceljs';
import { Op, Transaction } from 'sequelize';
import sequelize from '../../config/database';
import {
  CentroFormacion,
  NivelFormacion,
  ProgramaFormacion,
  ProgramaSobresaliente,
} from '../../infrastructure/db/models';
import { DepartamentosRepository } from '../../repositories/departamentos.repository';
import { normalizarParaComparar } from '../../shared/normalizar-texto';
import { tomarCandadoDeAviso } from '../../shared/seccion-critica';

const MAX_ROWS_LIMIT = 100000;

/** Nombre exacto de la única hoja que se carga — el archivo real trae 31 hojas en
 * total: "Mujer" y "Hombre" (dataset crudo de cálculo de margen, no se cargan) y
 * 28 hojas por departamento que repiten esta misma información partida por
 * regional (verificadas fila por fila, redundantes, tampoco se cargan). */
const HOJA_A_CARGAR = 'Superan el margen';

/** Encabezados reales de la hoja, tal como los trae el Excel de SENA. */
const COLUMNAS = {
  codRegional: 'Cod. Regional',
  regional: 'Regional',
  codCentro: 'Cod. Centro',
  centro: 'Centro',
  codNivel: 'Cod. Nivel de formación',
  nivel: 'Nivel de Formación',
  codPrograma: 'Cod. Programa',
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
    /** Filas del Excel con el mismo centro, programa y sexo (por código) que se sumaron en una sola. */
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

/** El texto visible de una celda, sin espacios alrededor. */
const comoTexto = (celda: ExcelJS.Cell): string => (celda.text ?? '').toString().trim();

/**
 * Un código SENA, sin ceros a la izquierda: «0223» y «223» son el mismo según la celda
 * venga como texto o como número.
 * @throws {ErrorDeFila} si la celda no es un número entero.
 */
const comoCodigo = (celda: ExcelJS.Cell, fila: number, columna: string): string => {
  const texto = comoTexto(celda);
  if (!/^\d+$/.test(texto)) {
    throw new ErrorDeFila(fila, `"${columna}" debe ser un código numérico (llegó "${texto}")`);
  }
  return texto.replace(/^0+(?=\d)/, '');
};

/**
 * El valor numérico de una celda (acepta coma decimal, `%` y fórmulas).
 * @throws {ErrorDeFila} si la celda no es un número.
 */
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

/** Lo que dice el Excel de un código: su nombre (el primero que trae) y de quién cuelga. */
interface EntradaDeCatalogo {
  nombre: string;
  padre: string;
  fila: number;
}

/**
 * Anota un código del catálogo y comprueba que el archivo no se contradiga: el mismo
 * código con dos nombres distintos (más allá de tildes o mayúsculas), o colgando de dos
 * padres (un centro en dos regionales, un programa en dos niveles), rechaza la carga.
 * Mismo criterio que la V3 de la tendencia ocupacional.
 */
const anotarCodigo = (
  catalogo: Map<string, EntradaDeCatalogo>,
  tipo: string,
  codigo: string,
  nombre: string,
  padre: string,
  fila: number
) => {
  const previa = catalogo.get(codigo);
  if (!previa) {
    catalogo.set(codigo, { nombre, padre, fila });
    return;
  }
  if (normalizarParaComparar(previa.nombre) !== normalizarParaComparar(nombre)) {
    throw new ErrorDeFila(
      fila,
      `el ${tipo} ${codigo} se llama "${nombre}", pero en la fila ${previa.fila} se llamaba "${previa.nombre}"`
    );
  }
  if (previa.padre !== padre) {
    throw new ErrorDeFila(fila, `el ${tipo} ${codigo} cambia de ${tipo === 'programa' ? 'nivel' : 'regional'} respecto de la fila ${previa.fila}`);
  }
};

/**
 * Carga el Excel de "Programa + sobresalientes": lee **solo** la hoja
 * "Superan el margen", valida cada fila y reemplaza por completo
 * `programas_sobresalientes` dentro de una única transacción (vaciar + recargar:
 * si algo falla, no queda la tabla a medias ni con datos mezclados de dos cargas).
 *
 * Los catálogos (`niveles_formacion`, `centros_formacion`, `programas_formacion`) se
 * identifican por su **código SENA**, no por el nombre (migración 042): el Excel oficial
 * trae programas distintos que se llaman igual («Apoyo administrativo en salud», 134507 y
 * 134508) y centros distintos con el mismo nombre en varias regionales. Se crean o se
 * actualizan por código en la misma transacción, y al final se borran los que ya no usa
 * ningún hecho: el catálogo queda igual a lo que dice el último archivo.
 *
 * `departamentos` no: es el catálogo cerrado de los 33 (032) y se resuelve por alias; un
 * nombre que no calce rechaza la carga en vez de crear un departamento nuevo. El
 * `Cod. Regional` del Excel es el código DANE, y se exige que coincida con el alias.
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

  // Regional tal como viene → su código y la primera fila, para resolver y reportar.
  const regionales = new Map<string, { codigo: string; fila: number }>();
  const niveles = new Map<string, EntradaDeCatalogo>(); // código → nombre
  const centros = new Map<string, EntradaDeCatalogo>(); // código → nombre y regional (nombre tal como viene)
  const programas = new Map<string, EntradaDeCatalogo>(); // código → nombre y código de nivel
  const rowsData: {
    regional: string; codCentro: string; codNivel: string; codPrograma: string; sexo: string;
    certificados: number; vinculados: number; tasaVinculacion: number; salarioPromedio: number;
  }[] = [];

  for (let numeroFila = 2; numeroFila <= hoja.rowCount; numeroFila++) {
    const fila = hoja.getRow(numeroFila);
    const regional = comoTexto(leer(fila, COLUMNAS.regional));
    if (fila.cellCount === 0 || !regional) continue; // fin del rango usado por Excel, no un dato

    const codRegional = comoCodigo(leer(fila, COLUMNAS.codRegional), numeroFila, COLUMNAS.codRegional);
    const codCentro = comoCodigo(leer(fila, COLUMNAS.codCentro), numeroFila, COLUMNAS.codCentro);
    const codNivel = comoCodigo(leer(fila, COLUMNAS.codNivel), numeroFila, COLUMNAS.codNivel);
    const codPrograma = comoCodigo(leer(fila, COLUMNAS.codPrograma), numeroFila, COLUMNAS.codPrograma);
    const centro = comoTexto(leer(fila, COLUMNAS.centro));
    const nivel = comoTexto(leer(fila, COLUMNAS.nivel));
    const programa = comoTexto(leer(fila, COLUMNAS.programa));
    const sexo = comoTexto(leer(fila, COLUMNAS.sexo)).toUpperCase();

    if (sexo !== 'M' && sexo !== 'F') {
      throw new ErrorDeFila(numeroFila, `"Sexo" debe ser M o F (llegó "${sexo}")`);
    }
    if (!centro || !nivel || !programa) {
      throw new ErrorDeFila(numeroFila, 'el centro, el nivel y el programa no pueden estar vacíos');
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

    const previa = regionales.get(regional);
    if (!previa) regionales.set(regional, { codigo: codRegional, fila: numeroFila });
    else if (previa.codigo !== codRegional) {
      throw new ErrorDeFila(numeroFila, `"${regional}" llega con el código ${codRegional}, pero en la fila ${previa.fila} con ${previa.codigo}`);
    }
    anotarCodigo(niveles, 'nivel', codNivel, nivel, '', numeroFila);
    anotarCodigo(centros, 'centro', codCentro, centro, codRegional, numeroFila);
    anotarCodigo(programas, 'programa', codPrograma, programa, codNivel, numeroFila);

    rowsData.push({ regional, codCentro, codNivel, codPrograma, sexo, certificados, vinculados, tasaVinculacion, salarioPromedio });

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

  // El departamento se resuelve por alias contra el catálogo cerrado (migración 032): así
  // "Valle" y "Valle del Cauca" en el mismo archivo son un solo departamento. Y el
  // `Cod. Regional` tiene que ser su código DANE: si no, el nombre y el código del Excel
  // dicen cosas distintas y no hay forma de saber cuál es el bueno.
  const departamentos = await DepartamentosRepository.resolverPorNombres(regionales.keys());
  const problemas: string[] = [];
  for (const [regional, { codigo, fila }] of regionales) {
    const departamento = departamentos.get(regional);
    if (!departamento) problemas.push(`"${regional}" (fila ${fila}) no es un departamento reconocido`);
    else if (departamento.codigoDane !== codigo.padStart(2, '0')) {
      problemas.push(`"${regional}" (fila ${fila}) es ${departamento.nombre} (${departamento.codigoDane}), pero llega con el código ${codigo}`);
    }
  }
  if (problemas.length > 0) {
    throw new Error(
      `Revise la columna "${COLUMNAS.regional}": ${problemas.join('; ')}. Use el nombre oficial del departamento.`
    );
  }
  const departamentoDeRegional = (codRegional: string) =>
    Array.from(departamentos.values()).find((d) => d!.codigoDane === codRegional.padStart(2, '0'))!.id;

  // El mismo centro, programa y sexo (por código) en varias filas son cohortes del mismo
  // programa: se fusionan sumando certificados y vinculados, recalculando la tasa sobre
  // esos totales y ponderando el salario por certificados. Dos programas distintos que se
  // llamen igual ya no se suman: tienen códigos distintos.
  const filasAgregadas = new Map<
    string,
    { codCentro: string; codPrograma: string; sexo: string;
      certificados: number; vinculados: number; salarioPonderado: number }
  >();
  for (const fila of rowsData) {
    const clave = `${fila.codCentro}|${fila.codPrograma}|${fila.sexo}`;
    const existente = filasAgregadas.get(clave);
    const salarioPonderado = fila.salarioPromedio * fila.certificados;
    if (existente) {
      existente.certificados += fila.certificados;
      existente.vinculados += fila.vinculados;
      existente.salarioPonderado += salarioPonderado;
    } else {
      filasAgregadas.set(clave, {
        codCentro: fila.codCentro, codPrograma: fila.codPrograma, sexo: fila.sexo,
        certificados: fila.certificados, vinculados: fila.vinculados, salarioPonderado,
      });
    }
  }

  const filasFinales = Array.from(filasAgregadas.values()).map((f) => ({
    ...f,
    tasaVinculacion: f.certificados > 0 ? f.vinculados / f.certificados : 0,
    salarioPromedio: f.certificados > 0 ? f.salarioPonderado / f.certificados : 0,
  }));

  const filasCombinadas = rowsData.length - filasFinales.length;

  const resultado = await sequelize.transaction(async (transaction: Transaction) => {
    // Una carga de programas a la vez. `DELETE FROM programas_sobresalientes` solo ve lo ya
    // confirmado: con dos cargas juntas la segunda no borraba lo que insertaba la primera y la tabla
    // acababa con las filas de las dos. La cola (`heavy-jobs`, concurrencia 1) es la primera defensa;
    // este candado cubre dos réplicas, un reintento o el script manual. El Excel ya se leyó arriba:
    // la espera es solo por escribir.
    await tomarCandadoDeAviso('carga:programas_sobresalientes', transaction);

    /**
     * Crea o actualiza las filas de un catálogo por su código y devuelve código → id, y
     * cuántos códigos no existían. El nombre (y el padre) que manda es el del último archivo.
     */
    const sincronizarPorCodigo = async (
      modelo: typeof NivelFormacion | typeof CentroFormacion | typeof ProgramaFormacion,
      filas: Record<string, string>[],
      columnasQueSeActualizan: string[]
    ) => {
      const codigos = filas.map((f) => f.codigo);
      const yaExistian = await (modelo as any).count({ where: { codigo: { [Op.in]: codigos } }, transaction });
      await (modelo as any).bulkCreate(filas, {
        conflictAttributes: ['codigo'],
        updateOnDuplicate: [...columnasQueSeActualizan, 'updated_at'],
        transaction,
      });
      const guardadas = await (modelo as any).findAll({
        where: { codigo: { [Op.in]: codigos } },
        attributes: ['id', 'codigo'],
        transaction,
      });
      const idPorCodigo = new Map<string, string>(guardadas.map((g: any) => [g.codigo as string, g.id as string]));
      return { idPorCodigo, nuevos: codigos.length - yaExistian };
    };

    const nivelesGuardados = await sincronizarPorCodigo(
      NivelFormacion,
      Array.from(niveles, ([codigo, n]) => ({ codigo, nombre: n.nombre })),
      ['nombre']
    );
    const centrosGuardados = await sincronizarPorCodigo(
      CentroFormacion,
      Array.from(centros, ([codigo, c]) => ({ codigo, nombre: c.nombre, departamento_id: departamentoDeRegional(c.padre) })),
      ['nombre', 'departamento_id']
    );
    const programasGuardados = await sincronizarPorCodigo(
      ProgramaFormacion,
      Array.from(programas, ([codigo, p]) => ({
        codigo,
        nombre: p.nombre,
        nivel_formacion_id: nivelesGuardados.idPorCodigo.get(p.padre)!,
      })),
      ['nombre', 'nivel_formacion_id']
    );

    // --- Hechos: vaciar y recargar completo ---
    await ProgramaSobresaliente.destroy({ where: {}, transaction });

    const registros = filasFinales.map((fila) => {
      const centro = centros.get(fila.codCentro)!;
      const programa = programas.get(fila.codPrograma)!;
      return {
        departamento_id: departamentoDeRegional(centro.padre),
        centro_id: centrosGuardados.idPorCodigo.get(fila.codCentro)!,
        nivel_formacion_id: nivelesGuardados.idPorCodigo.get(programa.padre)!,
        programa_id: programasGuardados.idPorCodigo.get(fila.codPrograma)!,
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

    // Lo que ningún hecho usa ya: lo que traían cargas anteriores y esta no, y las filas
    // sin código de antes de la migración 042. Si un Excel futuro lo vuelve a traer, se
    // crea otra vez. Así el catálogo no acumula variantes de cargas viejas.
    await sequelize.query(
      `DELETE FROM programas_formacion p
        WHERE NOT EXISTS (SELECT 1 FROM programas_sobresalientes s WHERE s.programa_id = p.id);
       DELETE FROM centros_formacion c
        WHERE NOT EXISTS (SELECT 1 FROM programas_sobresalientes s WHERE s.centro_id = c.id);
       DELETE FROM niveles_formacion n
        WHERE NOT EXISTS (SELECT 1 FROM programas_formacion p WHERE p.nivel_formacion_id = n.id);`,
      { transaction }
    );

    return {
      exito: true,
      mensaje: 'Base de datos actualizada con éxito',
      estadisticas: {
        filasCargadas: registros.length,
        filasCombinadas,
        nuevosCentros: centrosGuardados.nuevos,
        nuevosNiveles: nivelesGuardados.nuevos,
        nuevosProgramas: programasGuardados.nuevos,
      },
    };
  });

  return resultado;
};
