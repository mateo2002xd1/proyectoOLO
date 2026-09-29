import * as ExcelJS from 'exceljs';
import sequelize from '../../config/database';
import { DepartamentosRepository } from '../../repositories/departamentos.repository';
import { AlertasInversionRepository as Repo } from '../../repositories/alertas-inversion.repository';
import { normalizarParaComparar } from '../../shared/normalizar-texto';
import { ProyectoInversion, CiiuSeccion, Municipio, Empresa } from '../../infrastructure/db/models';

// Más bajo que el de Observatorio (100.000): cada fila aquí es una noticia distinta,
// resuelta y escrita una por una (no hay "vaciar y recargar" en bloque posible, porque
// nada se reemplaza), así que el volumen esperado es de decenas o pocos cientos, no de
// dataset masivo.
const MAX_ROWS_LIMIT = 5000;

/** Encabezados esperados de la única hoja — ver `formato-alertas-inversion.xlsx`. */
const COLUMNAS = {
  codigo: 'Código',
  actividad: 'Actividad',
  departamento: 'Departamento',
  ciudad: 'Ciudad',
  empresa: 'Empresa',
  fecha: 'Fecha',
  fuente: 'Fuente',
  descripcion: 'Descripción',
  tipo: 'Tipo',
  inversion: 'Inversión COP',
  empleos: 'Empleos estimados',
  medio: 'Medio',
} as const;

/** Las que el Excel debe traer sí o sí; el resto son opcionales. */
const COLUMNAS_OBLIGATORIAS: (keyof typeof COLUMNAS)[] = [
  'codigo', 'actividad', 'departamento', 'ciudad', 'empresa', 'fecha', 'fuente', 'descripcion', 'tipo',
];

export interface ProgresoImportacionAlertas {
  porcentaje: number;
  filasProcesadas: number;
  filasTotales: number;
}

export type OnProgresoImportacionAlertas = (progreso: ProgresoImportacionAlertas) => void;

export interface ImportarAlertasResult {
  filasCargadas: number;
  filasOmitidasPorDuplicado: number;
  nuevasEmpresas: number;
  nuevosMunicipios: number;
}

class ErrorDeFila extends Error {
  constructor(fila: number, mensaje: string) {
    super(`Fila ${fila}: ${mensaje}`);
  }
}

const comoTexto = (celda: ExcelJS.Cell): string => (celda.text ?? '').toString().trim();

/** Acepta una fecha nativa de Excel o texto DD/MM/AAAA o AAAA-MM-DD. */
function comoFecha(celda: ExcelJS.Cell, fila: number): string {
  if (celda.type === ExcelJS.ValueType.Date && celda.value instanceof Date) {
    return celda.value.toISOString().slice(0, 10);
  }
  const texto = comoTexto(celda);
  const conGuiones = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (conGuiones) return texto;
  const conBarras = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (conBarras) {
    const [, d, m, a] = conBarras;
    return `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  throw new ErrorDeFila(fila, `la columna "${COLUMNAS.fecha}" no es una fecha válida (llegó "${texto}")`);
}

function comoTipo(celda: ExcelJS.Cell, fila: number): 'nuevo' | 'expansion' {
  const texto = normalizarParaComparar(comoTexto(celda));
  if (texto === 'nuevo') return 'nuevo';
  if (texto === 'expansion') return 'expansion';
  throw new ErrorDeFila(fila, `la columna "${COLUMNAS.tipo}" debe ser "Nuevo" o "Expansión" (llegó "${comoTexto(celda)}")`);
}

function comoNumeroOpcional(celda: ExcelJS.Cell, fila: number, columna: string): number | null {
  const texto = comoTexto(celda);
  if (!texto) return null;
  const numero = Number(texto.replace(/[.,]/g, (m) => (m === ',' ? '.' : '')).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(numero)) {
    throw new ErrorDeFila(fila, `la columna "${columna}" no es un número válido (llegó "${texto}")`);
  }
  return numero;
}

/**
 * Resuelve la sección CIIU de una fila: por código de clase (4 dígitos, si ya está en
 * el catálogo), por letra de sección directa (A–U), o por el nombre exacto de
 * "Actividad" contra `ciiu_secciones.nombre` — el catálogo completo del DANE no viene
 * seedeado (son cientos de clases), así que el nombre del sector es la vía práctica
 * hasta que alguien cargue el catálogo completo.
 */
async function resolverSeccionYClase(
  codigo: string,
  actividad: string,
  fila: number
): Promise<{ seccionId: string; claseId: string | null }> {
  if (/^[A-Za-z]$/.test(codigo)) {
    const seccion = await Repo.buscarSeccionPorLetra(codigo);
    if (seccion) return { seccionId: seccion.get('id') as string, claseId: null };
  }

  if (/^[0-9]{4}$/.test(codigo)) {
    const clase = await Repo.buscarClasePorCodigo(codigo);
    if (clase) return { seccionId: clase.get('seccion_id') as string, claseId: clase.get('id') as string };
  }

  const secciones = await CiiuSeccion.findAll({ where: { activa: true } });
  const normalizado = normalizarParaComparar(actividad);
  const porNombre = secciones.find((s: any) => normalizarParaComparar(s.nombre) === normalizado);
  if (porNombre) return { seccionId: porNombre.get('id') as string, claseId: null };

  throw new ErrorDeFila(
    fila,
    `no se pudo identificar el sector CIIU con "${COLUMNAS.codigo}"="${codigo}" y ` +
      `"${COLUMNAS.actividad}"="${actividad}". Use una letra de sección (A–U), un código de ` +
      'clase ya cargado, o el nombre exacto del sector.'
  );
}

/**
 * Carga el Excel de "Alertas de inversión": una fila por proyecto anunciado. A
 * diferencia de "Programa + Sobresalientes", esto **no** vacía y recarga — cada fila
 * es un hecho noticioso independiente que se agrega al histórico. Para que subir el
 * mismo archivo dos veces no duplique, se omite cualquier fila cuya "Fuente" (URL)
 * ya exista en `proyectos_inversion`.
 *
 * `departamento` es el catálogo cerrado de los 33 oficiales (se resuelve por alias, se
 * rechaza si no calza, igual que en Observatorio); `ciudad` (municipio) es un
 * catálogo abierto que se completa solo.
 */
export const importarAlertasInversionExcel = async (
  fileBuffer: Buffer,
  subidoPor: string | null,
  onProgreso?: OnProgresoImportacionAlertas
): Promise<ImportarAlertasResult> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as any);

  const hoja = workbook.worksheets[0];
  if (!hoja) throw new Error('El archivo no tiene ninguna hoja.');
  if (hoja.rowCount > MAX_ROWS_LIMIT) {
    throw new Error(`El archivo excede el límite permitido de filas (${MAX_ROWS_LIMIT}).`);
  }

  const filaEncabezado = hoja.getRow(1);
  const indicePorColumna = new Map<string, number>();
  filaEncabezado.eachCell((celda, indice) => {
    indicePorColumna.set(celda.text?.toString().trim() ?? '', indice);
  });

  const faltante = COLUMNAS_OBLIGATORIAS.map((clave) => COLUMNAS[clave]).find((nombre) => !indicePorColumna.has(nombre));
  if (faltante) {
    throw new Error(`Falta la columna "${faltante}" en la hoja.`);
  }

  const leer = (fila: ExcelJS.Row, columna: string) =>
    indicePorColumna.has(columna) ? fila.getCell(indicePorColumna.get(columna)!) : undefined;

  const filasTotalesEstimadas = Math.max(hoja.rowCount - 1, 1);

  interface FilaCruda {
    numeroFila: number;
    codigo: string;
    actividad: string;
    departamento: string;
    ciudad: string;
    empresa: string;
    fecha: string;
    fuente: string;
    descripcion: string;
    tipo: 'nuevo' | 'expansion';
    inversionCop: number | null;
    empleosEstimados: number | null;
    medio: string | null;
  }

  const filas: FilaCruda[] = [];
  const departamentosVistos = new Map<string, number>();

  for (let numeroFila = 2; numeroFila <= hoja.rowCount; numeroFila++) {
    const fila = hoja.getRow(numeroFila);
    const departamento = comoTexto(leer(fila, COLUMNAS.departamento)!);
    if (fila.cellCount === 0 || !departamento) continue;

    const codigo = comoTexto(leer(fila, COLUMNAS.codigo)!);
    const actividad = comoTexto(leer(fila, COLUMNAS.actividad)!);
    const ciudad = comoTexto(leer(fila, COLUMNAS.ciudad)!);
    const empresa = comoTexto(leer(fila, COLUMNAS.empresa)!);
    const fecha = comoFecha(leer(fila, COLUMNAS.fecha)!, numeroFila);
    const fuente = comoTexto(leer(fila, COLUMNAS.fuente)!);
    const descripcion = comoTexto(leer(fila, COLUMNAS.descripcion)!);
    const tipo = comoTipo(leer(fila, COLUMNAS.tipo)!, numeroFila);
    const medioCelda = leer(fila, COLUMNAS.medio);
    const inversionCelda = leer(fila, COLUMNAS.inversion);
    const empleosCelda = leer(fila, COLUMNAS.empleos);

    if (!/^https?:\/\//i.test(fuente)) {
      throw new ErrorDeFila(numeroFila, `la columna "${COLUMNAS.fuente}" debe ser una URL (llegó "${fuente}")`);
    }
    if (!descripcion) {
      throw new ErrorDeFila(numeroFila, `la columna "${COLUMNAS.descripcion}" no puede estar vacía`);
    }
    if (!empresa) {
      throw new ErrorDeFila(numeroFila, `la columna "${COLUMNAS.empresa}" no puede estar vacía`);
    }

    if (!departamentosVistos.has(departamento)) departamentosVistos.set(departamento, numeroFila);

    filas.push({
      numeroFila,
      codigo,
      actividad,
      departamento,
      ciudad,
      empresa,
      fecha,
      fuente,
      descripcion,
      tipo,
      inversionCop: inversionCelda ? comoNumeroOpcional(inversionCelda, numeroFila, COLUMNAS.inversion) : null,
      empleosEstimados: empleosCelda ? comoNumeroOpcional(empleosCelda, numeroFila, COLUMNAS.empleos) : null,
      medio: medioCelda ? comoTexto(medioCelda) || null : null,
    });

    if (onProgreso && (numeroFila % 25 === 0 || numeroFila === hoja.rowCount)) {
      onProgreso({
        porcentaje: Math.min(50, Math.round((numeroFila / filasTotalesEstimadas) * 50)),
        filasProcesadas: filas.length,
        filasTotales: filasTotalesEstimadas,
      });
    }
  }

  if (filas.length === 0) {
    throw new Error('El archivo no tiene filas de datos.');
  }

  // Departamento: catálogo cerrado, se resuelve por alias o se rechaza (igual que Observatorio).
  const departamentosResueltos = await DepartamentosRepository.resolverPorNombres(departamentosVistos.keys());
  const noReconocidos = Array.from(departamentosResueltos)
    .filter(([, d]) => !d)
    .map(([nombre]) => `"${nombre}" (fila ${departamentosVistos.get(nombre)})`);
  if (noReconocidos.length > 0) {
    throw new Error(
      `Departamento no reconocido en la columna "${COLUMNAS.departamento}": ${noReconocidos.join(', ')}. ` +
        'Use el nombre oficial del departamento.'
    );
  }

  // Duplicados: cualquier fuente ya registrada se omite en vez de fallar la carga completa.
  const fuentesDelArchivo = Array.from(new Set(filas.map((f) => f.fuente)));
  const existentes = await ProyectoInversion.findAll({ where: { fuente_url: fuentesDelArchivo } });
  const fuentesYaRegistradas = new Set(existentes.map((p: any) => p.fuente_url as string));

  let nuevasEmpresas = 0;
  let nuevosMunicipios = 0;
  let filasCargadas = 0;
  let filasOmitidasPorDuplicado = 0;

  const totalAProcesar = filas.length;
  let procesadas = 0;

  for (const fila of filas) {
    procesadas += 1;
    if (onProgreso) {
      onProgreso({
        porcentaje: 50 + Math.round((procesadas / totalAProcesar) * 50),
        filasProcesadas: procesadas,
        filasTotales: totalAProcesar,
      });
    }

    if (fuentesYaRegistradas.has(fila.fuente)) {
      filasOmitidasPorDuplicado += 1;
      continue;
    }

    const departamentoResuelto = departamentosResueltos.get(fila.departamento)!;

    const empresaYaExistia = (await Empresa.count({
      where: sequelize.where(sequelize.fn('lower', sequelize.col('nombre')), fila.empresa.toLowerCase()),
    })) > 0;
    const empresa = await Repo.resolverOCrearEmpresa(fila.empresa);
    if (!empresaYaExistia) nuevasEmpresas += 1;

    let municipioId: string | null = null;
    if (fila.ciudad) {
      const antes = await Municipio.count({ where: { departamento_id: departamentoResuelto.id, nombre: fila.ciudad } });
      const municipio = await Repo.resolverOCrearMunicipio(departamentoResuelto.id, fila.ciudad);
      if (antes === 0) nuevosMunicipios += 1;
      municipioId = municipio.get('id') as string;
    }

    const { seccionId, claseId } = await resolverSeccionYClase(fila.codigo, fila.actividad, fila.numeroFila);

    await Repo.crearProyecto({
      tipo: fila.tipo,
      descripcion: fila.descripcion,
      empresaId: empresa.get('id') as string,
      seccionId,
      claseId,
      fechaAnuncio: fila.fecha,
      fuenteUrl: fila.fuente,
      fuenteMedio: fila.medio,
      inversionCop: fila.inversionCop,
      empleosEstimados: fila.empleosEstimados,
      ubicaciones: [{ departamentoId: departamentoResuelto.id, municipioId }],
      creadoPor: subidoPor,
      // "Sube el Administrador y se procesa de inmediato" — misma decisión de sesión
      // que Observatorio (`027-cargas-datos`): sin paso de aprobación.
      estado: 'publicado',
    });

    filasCargadas += 1;
  }

  return { filasCargadas, filasOmitidasPorDuplicado, nuevasEmpresas, nuevosMunicipios };
};
