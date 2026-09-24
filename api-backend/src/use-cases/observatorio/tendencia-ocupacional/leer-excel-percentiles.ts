import * as ExcelJS from 'exceljs';
import { normalizarParaComparar } from '../../../shared/normalizar-texto';
import type { FilaStaging, Hoja } from '../../../repositories/tendencia-ocupacional.repository';
import { ErrorDeCargaTendencia, hallazgoReporte } from './reporte-carga';

/**
 * Lectura del Excel de percentiles: dos hojas, encabezado en la fila 1, sin celdas
 * combinadas. Anatomía y problemas de calidad conocidos en
 * `criterios/analisis-normalizacion-percentiles-ocupacionales.md` §1, §2 y §6.
 *
 * No toca la base: devuelve filas listas para la tabla temporal o lanza
 * `ErrorDeCargaTendencia` con todos los problemas encontrados (no solo el primero), para
 * que el administrador corrija el archivo de una vez.
 */

const HOJAS: Record<string, Hoja> = {
  'percentiles nacional': 'NAC',
  'percentiles departamental': 'DEP',
};

const NOMBRE_HOJA: Record<Hoja, string> = {
  NAC: 'percentiles nacional',
  DEP: 'percentiles departamental',
};

type Campo =
  | 'codigoNc'
  | 'departamento'
  | 'codigo'
  | 'nombre'
  | 'inscritos'
  | 'vacantes'
  | 'pctInscritos'
  | 'pctVacantes'
  | 'x1'
  | 'x2'
  | 'x3'
  | 'x4';

/**
 * Encabezado normalizado → campo. Se mapea por nombre y nunca por posición: entre hojas
 * cambian mayúsculas, dobles espacios y hasta el nombre ("Descripción" en la nacional,
 * "Ocupación" en la departamental). "Descripción Nivel de Cualificación" se ignora a
 * propósito: trae erratas ("Técnologos") y el nombre del nivel sale del catálogo.
 */
const ENCABEZADOS: Record<string, Campo> = {
  'n c': 'codigoNc',
  departamento: 'departamento',
  'codigo ocupacion': 'codigo',
  descripcion: 'nombre',
  ocupacion: 'nombre',
  inscritos: 'inscritos',
  vacantes: 'vacantes',
  'percentil inscritos': 'pctInscritos',
  'percentil vacantes': 'pctVacantes',
  'ocupaciones mas solicitadas por los empresarios y personas que buscan empleo': 'x1',
  'ocupaciones mas registradas por las personas que buscan empleo y menos solicitadas por los empresarios': 'x2',
  'ocupaciones mas solicitadas por los empresarios y menos registradas por las personas que buscan empleo': 'x3',
  'ocupaciones menos solicitadas por los empresarios y personas que buscan empleo': 'x4',
};

const OBLIGATORIOS: Record<Hoja, Campo[]> = {
  NAC: ['codigoNc', 'codigo', 'nombre', 'inscritos', 'vacantes', 'pctInscritos', 'pctVacantes'],
  DEP: ['codigoNc', 'departamento', 'codigo', 'nombre', 'inscritos', 'vacantes', 'pctInscritos', 'pctVacantes'],
};

const ETIQUETA: Record<Campo, string> = {
  codigoNc: 'N.C.',
  departamento: 'Departamento',
  codigo: 'Código ocupación',
  nombre: 'Descripción / Ocupación',
  inscritos: 'Inscritos',
  vacantes: 'Vacantes',
  pctInscritos: 'Percentil Inscritos',
  pctVacantes: 'Percentil Vacantes',
  x1: 'criterio 1',
  x2: 'criterio 2',
  x3: 'criterio 3',
  x4: 'criterio 4',
};

/** Tope de filas por hoja: el archivo real trae 20.163 en la departamental. */
const MAX_FILAS_POR_HOJA = 100_000;

/** Errores de fila que se guardan como muestra en el reporte (se cuentan todos). */
const MAX_ERRORES_EN_REPORTE = 200;

export type FilaLeida = Omit<FilaStaging, 'departamentoId'>;

export interface LibroLeido {
  filas: FilaLeida[];
  filasNacional: number;
  filasDepartamental: number;
}

/** Valor de la celda tal como lo guardó Excel: de una fórmula, su resultado en caché. */
function valorDeCelda(celda: ExcelJS.Cell): unknown {
  const valor = celda.value;
  if (valor === null || valor === undefined) return null;
  if (typeof valor !== 'object' || valor instanceof Date) return valor;
  if ('result' in valor) return valor.result ?? null;
  if ('richText' in valor) return valor.richText.map((parte) => parte.text).join('');
  if ('text' in valor) return valor.text;
  return null; // { error: '#N/A' } y similares
}

const esVacio = (valor: unknown) => valor === null || (typeof valor === 'string' && valor.trim() === '');

/** Acepta número o texto numérico ("0,85", "85%"); `null` si no lo es. */
function comoNumero(valor: unknown): number | null {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== 'string') return null;
  const texto = valor.trim().replace(/\s/g, '');
  const esPorcentaje = texto.endsWith('%');
  const numero = Number(texto.replace('%', '').replace(',', '.'));
  if (texto === '' || !Number.isFinite(numero)) return null;
  return esPorcentaje ? numero / 100 : numero;
}

/**
 * El código lleva ceros a la izquierda ("0011"). En el archivo real viene como texto,
 * pero si alguien lo reguarda como número llega 11: se recupera con `padStart`.
 */
function comoCodigo(valor: unknown): string | null {
  if (typeof valor === 'number' && Number.isInteger(valor) && valor >= 0 && valor < 10_000) {
    return String(valor).padStart(4, '0');
  }
  if (typeof valor === 'string' && /^[0-9]{4}$/.test(valor.trim())) return valor.trim();
  return null;
}

/**
 * @param onProgreso filas leídas de las dos hojas sobre el total, para el loader.
 * @throws {ErrorDeCargaTendencia} si falta una hoja o columna, o alguna fila no es válida.
 */
export async function leerExcelPercentiles(
  datos: Buffer,
  onProgreso?: (leidas: number, total: number) => void
): Promise<LibroLeido> {
  const libro = new ExcelJS.Workbook();
  // Mismo cast que `importar-programas-excel`: los tipos de exceljs piden el `Buffer`
  // de otra versión de @types/node.
  await libro.xlsx.load(datos as any);

  const hojas = new Map<Hoja, ExcelJS.Worksheet>();
  for (const hoja of libro.worksheets) {
    const tipo = HOJAS[normalizarParaComparar(hoja.name)];
    if (tipo) hojas.set(tipo, hoja);
  }

  const estructura: string[] = [];
  const columnas = new Map<Hoja, Map<Campo, number>>();

  for (const tipo of ['NAC', 'DEP'] as Hoja[]) {
    const hoja = hojas.get(tipo);
    if (!hoja) {
      estructura.push(`Falta la hoja «${NOMBRE_HOJA[tipo]}».`);
      continue;
    }
    if (hoja.rowCount > MAX_FILAS_POR_HOJA) {
      estructura.push(`La hoja «${hoja.name}» supera el límite de ${MAX_FILAS_POR_HOJA} filas.`);
      continue;
    }

    const indice = new Map<Campo, number>();
    hoja.getRow(1).eachCell((celda, numeroColumna) => {
      const campo = ENCABEZADOS[normalizarParaComparar(String(valorDeCelda(celda) ?? ''))];
      if (campo && !indice.has(campo)) indice.set(campo, numeroColumna);
    });

    const faltantes = OBLIGATORIOS[tipo].filter((campo) => !indice.has(campo));
    if (faltantes.length > 0) {
      estructura.push(
        `En la hoja «${hoja.name}» falta${faltantes.length > 1 ? 'n' : ''} la${faltantes.length > 1 ? 's' : ''} ` +
          `columna${faltantes.length > 1 ? 's' : ''} ${faltantes.map((c) => `«${ETIQUETA[c]}»`).join(', ')}.`
      );
    }
    columnas.set(tipo, indice);
  }

  if (estructura.length > 0) {
    throw new ErrorDeCargaTendencia({
      errores: [
        hallazgoReporte('LECTURA', {
          total: estructura.length,
          muestra: estructura.map((mensaje) => ({ mensaje })),
        }),
      ],
      advertencias: [],
    });
  }

  const totalFilas = Array.from(hojas.values()).reduce((suma, hoja) => suma + Math.max(hoja.rowCount - 1, 0), 0);
  const filas: FilaLeida[] = [];
  const errores: { hoja: string; fila: number; mensaje: string }[] = [];
  let totalErrores = 0;
  let leidas = 0;

  for (const tipo of ['NAC', 'DEP'] as Hoja[]) {
    const hoja = hojas.get(tipo)!;
    const indice = columnas.get(tipo)!;

    for (let numeroFila = 2; numeroFila <= hoja.rowCount; numeroFila++) {
      leidas++;
      if (onProgreso && (leidas % 1000 === 0 || leidas === totalFilas)) onProgreso(leidas, totalFilas);

      const fila = hoja.getRow(numeroFila);
      const leer = (campo: Campo) => {
        const columna = indice.get(campo);
        return columna === undefined ? null : valorDeCelda(fila.getCell(columna));
      };

      // Excel a veces extiende el rango usado con filas vacías al final: no son datos.
      if (OBLIGATORIOS[tipo].every((campo) => esVacio(leer(campo)))) continue;

      const problemas: string[] = [];
      const anotar = (mensaje: string) => problemas.push(mensaje);

      const codigo = comoCodigo(leer('codigo'));
      if (!codigo) anotar(`«Código ocupación» debe tener cuatro dígitos (llegó «${leer('codigo') ?? ''}»)`);

      const nombreCrudo = leer('nombre');
      const nombre = typeof nombreCrudo === 'string' ? nombreCrudo.trim() : String(nombreCrudo ?? '').trim();
      if (!nombre) anotar('falta el nombre de la ocupación');
      else if (nombre.length > 255) anotar('el nombre de la ocupación supera 255 caracteres');

      const codigoNc = comoNumero(leer('codigoNc'));
      if (codigoNc === null || !Number.isInteger(codigoNc)) anotar(`«N.C.» debe ser un entero (llegó «${leer('codigoNc') ?? ''}»)`);

      let departamentoTxt: string | null = null;
      if (tipo === 'DEP') {
        departamentoTxt = String(leer('departamento') ?? '').trim();
        if (!departamentoTxt) anotar('falta el departamento');
      }

      // Vacío = 0: la hoja departamental no trae ni un cero explícito y las sumas
      // solo cuadran con la nacional si el vacío cuenta como cero.
      const conteo = (campo: 'inscritos' | 'vacantes') => {
        const crudo = leer(campo);
        if (esVacio(crudo)) return 0;
        const numero = comoNumero(crudo);
        if (numero === null || !Number.isInteger(numero) || numero < 0) {
          anotar(`«${ETIQUETA[campo]}» debe ser un entero mayor o igual a 0 (llegó «${crudo}»)`);
          return 0;
        }
        return numero;
      };
      const inscritos = conteo('inscritos');
      const vacantes = conteo('vacantes');

      // Vacío = NULL: menos de 10 registros, sin percentil. Excel lo evalúa como 0 y la
      // columna generada de la base hace lo mismo con COALESCE.
      const percentil = (campo: 'pctInscritos' | 'pctVacantes') => {
        const crudo = leer(campo);
        if (esVacio(crudo)) return null;
        const numero = comoNumero(crudo);
        if (numero === null || numero <= 0 || numero > 1) {
          anotar(`«${ETIQUETA[campo]}» debe estar entre 0 y 1 (llegó «${crudo}»)`);
          return null;
        }
        return numero;
      };
      const pctInscritos = percentil('pctInscritos');
      const pctVacantes = percentil('pctVacantes');

      // La "X" solo existe si Excel guardó el resultado de la fórmula; un archivo
      // reguardado por otra herramienta la trae vacía. Solo sirve para la advertencia V7.
      const marcadas = (['x1', 'x2', 'x3', 'x4'] as Campo[])
        .map((campo, posicion) => (String(leer(campo) ?? '').trim().toUpperCase() === 'X' ? posicion + 1 : 0))
        .filter(Boolean);
      const criterioExcel = marcadas.length === 1 ? marcadas[0] : null;

      if (problemas.length > 0) {
        totalErrores += problemas.length;
        for (const mensaje of problemas) {
          if (errores.length < MAX_ERRORES_EN_REPORTE) {
            errores.push({ hoja: hoja.name, fila: numeroFila, mensaje: `Hoja «${hoja.name}», fila ${numeroFila}: ${mensaje}.` });
          }
        }
        continue;
      }

      filas.push({
        filaExcel: numeroFila,
        hoja: tipo,
        departamentoTxt,
        codigo: codigo!,
        nombre,
        codigoNcExcel: codigoNc!,
        inscritos,
        vacantes,
        pctInscritos,
        pctVacantes,
        criterioExcel,
      });
    }
  }

  if (totalErrores > 0) {
    throw new ErrorDeCargaTendencia({
      errores: [hallazgoReporte('LECTURA', { total: totalErrores, muestra: errores })],
      advertencias: [],
    });
  }

  const filasNacional = filas.filter((f) => f.hoja === 'NAC').length;
  if (filasNacional === 0 || filasNacional === filas.length) {
    throw new ErrorDeCargaTendencia({
      errores: [
        hallazgoReporte('LECTURA', {
          total: 1,
          muestra: [{ mensaje: 'Las dos hojas deben traer datos: la nacional y la departamental.' }],
        }),
      ],
      advertencias: [],
    });
  }

  return { filas, filasNacional, filasDepartamental: filas.length - filasNacional };
}
