/**
 * Origen de datos **temporal** del catálogo CNO.
 *
 * Lee los JSON de `sitio-web/data_temporal/` —el volcado del archivo maestro de
 * la Clasificación Nacional de Ocupaciones, una hoja de Excel por tabla— y
 * resuelve las mismas uniones que hará la consulta SQL cuando el catálogo esté
 * en la base de datos. Existe para poder construir y probar las dos vistas del
 * buscador sin esperar a que el backend :4000 exponga el módulo de ocupaciones.
 *
 * Solo se importa desde los route handlers de `app/api/ocupaciones/`: usa `fs`,
 * así que no puede acabar en un bundle de cliente. No hay `server-only` en las
 * dependencias del sitio, de modo que la garantía es esta convención más el
 * hecho de que el módulo público (`index.ts`) no lo reexporta.
 *
 * TODO(catálogo real): sustituir por el service contra `/api/ocupaciones` del
 * backend. Los tipos de `../types` son el contrato y no deberían cambiar.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { DetalleOcupacion, OcupacionRelacionada, ResultadoOcupacion } from '../types';

const DIRECTORIO_DATOS = path.join(process.cwd(), 'data_temporal');

/** Máximo de ocupaciones que devuelve una búsqueda. El tope existe para consultas de una sola letra. */
const LIMITE_RESULTADOS = 50;

// --- Filas tal y como salen del Excel -------------------------------------
// Los nombres con espacios y tildes ("Código de la ocupación - C.N.O.") son los
// encabezados literales de la hoja. Se declaran para que TypeScript avise si el
// próximo volcado los renombra, en vez de devolver `undefined` en silencio.

interface FilaOcupacion {
  cod_ocupacion_cno: string;
  nomb_ocupacion_cno: string;
  desc_ocupacion_cno: string;
  cod_desempe_cno: string;
  cod_cualificacion_cno: string;
  activa_ocupacion_cno: boolean;
}

interface FilaAreaDesempeno {
  cod_desempeno_cno: string;
  nom_desempeno_cno: string;
}

interface FilaNivelCualificacion {
  cod_cualificacion_cno: string;
  descrip_nivel_cualificacion_cno: string;
}

interface FilaDenominacion {
  descr_denominacion_cno: string;
  cod_ocupacion_cno: string;
  activa_denominacion_cno: boolean;
}

interface FilaFuncion {
  desc_funcion_cno: string;
  cod_ocupacion_cno: string;
  activa_funcion_cno: boolean;
}

interface FilaRelacionada {
  'Código de la ocupación - C.N.O.': string;
  cod_ocup_relacionada_cno: string;
  nombre_ocup_relacionada_cno: string;
}

interface FilaHabilidad {
  cod_ocupacion_cno: string;
  nombre_habilidad_cno: string;
}

interface FilaConocimiento {
  'Código de la ocupación - C.N.O.': string;
  nom_conocimiento_cno: string;
}

// --- Catálogo ya indexado --------------------------------------------------

/** Una ocupación con su texto de búsqueda ya normalizado, para no recalcularlo en cada consulta. */
interface OcupacionIndexada {
  codigo: string;
  nombre: string;
  descripcion: string;
  codigoDesempeno: string;
  codigoCualificacion: string;
  nombreNormalizado: string;
  denominaciones: string[];
  denominacionesNormalizadas: string[];
}

interface CatalogoCno {
  ocupaciones: OcupacionIndexada[];
  ocupacionesPorCodigo: Map<string, OcupacionIndexada>;
  areasPorCodigo: Map<string, string>;
  nivelesPorCodigo: Map<string, string>;
  funcionesPorOcupacion: Map<string, string[]>;
  relacionadasPorOcupacion: Map<string, OcupacionRelacionada[]>;
  habilidadesPorOcupacion: Map<string, string[]>;
  conocimientosPorOcupacion: Map<string, string[]>;
}

/**
 * El catálogo entero pesa unos 6 MB de JSON y no cambia mientras el proceso
 * viva, así que se lee una vez y se guarda la **promesa**, no el resultado: si
 * llegan dos peticiones a la vez durante el arranque, ambas esperan la misma
 * lectura en lugar de disparar dos.
 */
let catalogoEnMemoria: Promise<CatalogoCno> | null = null;

async function leerTabla<T>(archivo: string): Promise<T[]> {
  const contenido = await readFile(path.join(DIRECTORIO_DATOS, archivo), 'utf8');
  return JSON.parse(contenido) as T[];
}

/** Minúsculas y sin tildes: "Diseño Gráfico" y "diseno grafico" tienen que encontrar lo mismo. */
function normalizar(texto: string): string {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Agrupa filas por código de ocupación conservando el orden del archivo y descartando repetidos. */
function agruparPorOcupacion<F, V>(
  filas: F[],
  obtenerCodigo: (fila: F) => string,
  obtenerValor: (fila: F) => V,
  claveDeValor: (valor: V) => string,
): Map<string, V[]> {
  const grupos = new Map<string, V[]>();
  const vistos = new Map<string, Set<string>>();

  for (const fila of filas) {
    const codigo = String(obtenerCodigo(fila) ?? '').trim();
    if (!codigo) continue;

    const valor = obtenerValor(fila);
    const clave = claveDeValor(valor);
    if (!clave) continue;

    let yaVistos = vistos.get(codigo);
    if (!yaVistos) {
      yaVistos = new Set();
      vistos.set(codigo, yaVistos);
      grupos.set(codigo, []);
    }
    if (yaVistos.has(clave)) continue;

    yaVistos.add(clave);
    grupos.get(codigo)!.push(valor);
  }

  return grupos;
}

async function cargarCatalogo(): Promise<CatalogoCno> {
  const [
    ocupaciones,
    areas,
    niveles,
    denominaciones,
    funciones,
    relacionadas,
    habilidades,
    conocimientos,
  ] = await Promise.all([
    leerTabla<FilaOcupacion>('ocupaciones.json'),
    leerTabla<FilaAreaDesempeno>('area_desempeno.json'),
    leerTabla<FilaNivelCualificacion>('nivel_cualificacion.json'),
    leerTabla<FilaDenominacion>('denominaciones.json'),
    leerTabla<FilaFuncion>('funciones_cno.json'),
    leerTabla<FilaRelacionada>('relacionada_cno.json'),
    leerTabla<FilaHabilidad>('habilidades_cno.json'),
    leerTabla<FilaConocimiento>('conocimientos_cno.json'),
  ]);

  // Las filas marcadas como no activas son ocupaciones y denominaciones
  // retiradas de la clasificación: no se publican. El archivo maestro trae 21
  // ocupaciones, 380 denominaciones y 52 funciones en ese estado.
  const denominacionesPorOcupacion = agruparPorOcupacion(
    denominaciones.filter((fila) => fila.activa_denominacion_cno !== false),
    (fila) => fila.cod_ocupacion_cno,
    (fila) => String(fila.descr_denominacion_cno ?? '').trim(),
    (valor) => valor,
  );

  const indexadas: OcupacionIndexada[] = ocupaciones
    .filter((fila) => fila.activa_ocupacion_cno !== false)
    .map((fila) => {
      const codigo = String(fila.cod_ocupacion_cno ?? '').trim();
      const propias = denominacionesPorOcupacion.get(codigo) ?? [];

      return {
        codigo,
        nombre: String(fila.nomb_ocupacion_cno ?? '').trim(),
        descripcion: String(fila.desc_ocupacion_cno ?? '').trim(),
        codigoDesempeno: String(fila.cod_desempe_cno ?? '').trim(),
        codigoCualificacion: String(fila.cod_cualificacion_cno ?? '').trim(),
        nombreNormalizado: normalizar(String(fila.nomb_ocupacion_cno ?? '')),
        denominaciones: propias,
        denominacionesNormalizadas: propias.map(normalizar),
      };
    });

  return {
    ocupaciones: indexadas,
    ocupacionesPorCodigo: new Map(indexadas.map((ocupacion) => [ocupacion.codigo, ocupacion])),
    areasPorCodigo: new Map(
      areas.map((fila) => [
        String(fila.cod_desempeno_cno).trim(),
        String(fila.nom_desempeno_cno ?? '').trim(),
      ]),
    ),
    nivelesPorCodigo: new Map(
      niveles.map((fila) => [
        String(fila.cod_cualificacion_cno).trim(),
        String(fila.descrip_nivel_cualificacion_cno ?? '').trim(),
      ]),
    ),
    funcionesPorOcupacion: agruparPorOcupacion(
      funciones.filter((fila) => fila.activa_funcion_cno !== false),
      (fila) => fila.cod_ocupacion_cno,
      (fila) => String(fila.desc_funcion_cno ?? '').trim(),
      (valor) => valor,
    ),
    relacionadasPorOcupacion: agruparPorOcupacion<FilaRelacionada, OcupacionRelacionada>(
      relacionadas,
      (fila) => fila['Código de la ocupación - C.N.O.'],
      (fila) => ({
        codigo: String(fila.cod_ocup_relacionada_cno ?? '').trim(),
        nombre: String(fila.nombre_ocup_relacionada_cno ?? '').trim(),
      }),
      (valor) => valor.codigo,
    ),
    habilidadesPorOcupacion: agruparPorOcupacion(
      habilidades,
      (fila) => fila.cod_ocupacion_cno,
      (fila) => String(fila.nombre_habilidad_cno ?? '').trim(),
      (valor) => valor,
    ),
    conocimientosPorOcupacion: agruparPorOcupacion(
      conocimientos,
      (fila) => fila['Código de la ocupación - C.N.O.'],
      (fila) => String(fila.nom_conocimiento_cno ?? '').trim(),
      (valor) => valor,
    ),
  };
}

function obtenerCatalogo(): Promise<CatalogoCno> {
  if (!catalogoEnMemoria) {
    catalogoEnMemoria = cargarCatalogo().catch((error) => {
      // Sin esto, un JSON ausente o mal formado dejaría cacheada una promesa
      // rechazada y el buscador quedaría roto hasta reiniciar el proceso.
      catalogoEnMemoria = null;
      throw error;
    });
  }
  return catalogoEnMemoria;
}

/**
 * Ordena de lo más específico a lo más general: primero el código exacto,
 * después el que empieza por el término, luego el nombre de la ocupación y por
 * último las coincidencias que solo aparecen en una denominación.
 */
function calcularRelevancia(
  ocupacion: OcupacionIndexada,
  termino: string,
  hayCoincidenciaEnDenominacion: boolean,
): number | null {
  if (ocupacion.codigo === termino) return 0;
  if (ocupacion.codigo.startsWith(termino)) return 1;
  if (ocupacion.nombreNormalizado.startsWith(termino)) return 2;
  if (ocupacion.nombreNormalizado.includes(termino)) return 3;
  if (hayCoincidenciaEnDenominacion) return 4;
  return null;
}

/**
 * Busca ocupaciones por código, nombre de la ocupación o denominación.
 *
 * @param termino texto tal cual lo escribió la persona; se normaliza aquí.
 * @returns hasta `LIMITE_RESULTADOS` ocupaciones ordenadas por relevancia.
 */
export async function buscarOcupaciones(termino: string): Promise<ResultadoOcupacion[]> {
  const consulta = normalizar(termino);
  if (!consulta) return [];

  const catalogo = await obtenerCatalogo();
  const encontradas: Array<{ relevancia: number; resultado: ResultadoOcupacion }> = [];

  for (const ocupacion of catalogo.ocupaciones) {
    const coincidentes = ocupacion.denominaciones.filter((_, indice) =>
      ocupacion.denominacionesNormalizadas[indice].includes(consulta),
    );

    const relevancia = calcularRelevancia(ocupacion, consulta, coincidentes.length > 0);
    if (relevancia === null) continue;

    encontradas.push({
      relevancia,
      resultado: {
        codigoOcupacion: ocupacion.codigo,
        nombreOcupacion: ocupacion.nombre,
        denominaciones: ocupacion.denominaciones,
        denominacionesCoincidentes: coincidentes,
      },
    });
  }

  return encontradas
    .sort(
      (a, b) =>
        a.relevancia - b.relevancia ||
        a.resultado.codigoOcupacion.localeCompare(b.resultado.codigoOcupacion),
    )
    .slice(0, LIMITE_RESULTADOS)
    .map((entrada) => entrada.resultado);
}

/**
 * Detalle completo de una ocupación con todas sus uniones resueltas.
 *
 * Los cuatro apartados sin tabla de origen —área ocupacional, campo
 * ocupacional, normas asociadas y correlativa CUOC— se devuelven como arreglos
 * vacíos, no como `undefined`: la vista los pinta igualmente con su rótulo y un
 * texto de "sin información", que es lo que pide la maqueta.
 *
 * @returns `null` si el código no existe o corresponde a una ocupación no activa.
 */
export async function obtenerDetalleOcupacion(
  codigoOcupacion: string,
): Promise<DetalleOcupacion | null> {
  const codigo = String(codigoOcupacion ?? '').trim();
  if (!codigo) return null;

  const catalogo = await obtenerCatalogo();
  const ocupacion = catalogo.ocupacionesPorCodigo.get(codigo);
  if (!ocupacion) return null;

  return {
    codigoOcupacion: ocupacion.codigo,
    nombreOcupacion: ocupacion.nombre,
    descripcion: ocupacion.descripcion,

    areaDesempeno: catalogo.areasPorCodigo.get(ocupacion.codigoDesempeno) ?? '',
    nivelCualificacion: catalogo.nivelesPorCodigo.get(ocupacion.codigoCualificacion) ?? '',
    areaOcupacional: [],
    campoOcupacional: [],

    funciones: catalogo.funcionesPorOcupacion.get(codigo) ?? [],
    normasAsociadas: [],
    denominaciones: ocupacion.denominaciones,
    ocupacionesRelacionadas: catalogo.relacionadasPorOcupacion.get(codigo) ?? [],
    habilidades: catalogo.habilidadesPorOcupacion.get(codigo) ?? [],
    conocimientos: catalogo.conocimientosPorOcupacion.get(codigo) ?? [],
    correlativaCuoc: [],
  };
}
