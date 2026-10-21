/**
 * Origen de datos del catálogo CNO/CUOC: la API pública de consulta
 * (`API_PUBLICA_CONSULTA.md` en la raíz del repositorio).
 *
 * La llave (`CNO_API_KEY`) solo existe en el servidor: el navegador llama a
 * `/api/ocupaciones` del propio sitio, y son esos route handlers los que llegan
 * aquí y añaden la cabecera `x-api-key`. Por eso este módulo solo se importa
 * desde `app/api/ocupaciones/` y el `index.ts` del módulo no lo reexporta: si
 * acabara en un bundle de cliente, `process.env.CNO_API_KEY` vendría vacío y,
 * peor, el intento quedaría a la vista. No hay `server-only` en las
 * dependencias del sitio, así que la garantía es esa convención.
 *
 * Aquí se traduce también la respuesta de la API a los tipos de `../types`, que
 * son el contrato de la UI.
 */

import type {
  DetalleOcupacion,
  OcupacionRelacionada,
  ResultadoOcupacion,
  TipoClasificacion,
} from '../types';

const RUTA_BASE = '/api/public/consulta';

/** Lo máximo que acepta la API en `limit`. */
const LIMITE_RESULTADOS = 50;

/** Lo máximo que acepta la API en `q`; más largo responde 400. */
const LARGO_MAXIMO_TERMINO = 120;

const TIEMPO_MAXIMO_MS = 10_000;

/**
 * Las fichas no cambian de un minuto a otro y la API cuenta 300 peticiones por
 * minuto **por llave**, es decir, compartidas por todos los visitantes del sitio.
 * Guardarlas aquí evita gastar el cupo en la misma ocupación abierta una y otra vez.
 */
const DURACION_CACHE_FICHA_MS = 60 * 60 * 1000;
const MAXIMO_FICHAS_EN_CACHE = 500;

/** Un código CNO tiene 4 dígitos y uno CUOC 5; cualquier otra cosa no existe. */
const PATRON_CODIGO = /^\d{4,5}$/;

const MENSAJE_NO_DISPONIBLE =
  'No se pudo consultar el catálogo de ocupaciones. Inténtalo de nuevo en unos minutos.';

// --- Respuestas de la API, tal como las documenta API_PUBLICA_CONSULTA.md ----

interface ReferenciaApi {
  codigo: string;
  nombre: string;
}

interface OcupacionBuscadaApi {
  tipo: TipoClasificacion;
  codigo: string;
  nombre: string;
  denominaciones: ReferenciaApi[];
}

interface FichaApi {
  tipo: TipoClasificacion;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  ubicacion: {
    areaDesempeno: ReferenciaApi | null;
    nivelCualificacion: ReferenciaApi | null;
  } | null;
  funciones: Array<{ numero: string; codigo: string; descripcion: string }>;
  normasAsociadas: unknown[];
  denominaciones: ReferenciaApi[];
  ocupacionesRelacionadas: ReferenciaApi[];
  habilidades: ReferenciaApi[];
  conocimientos: ReferenciaApi[];
  correlativa: { tipo: TipoClasificacion; ocupaciones: ReferenciaApi[] } | null;
}

/**
 * Fallo de la consulta con el código y el mensaje que debe recibir el navegador.
 * El mensaje ya es apto para la pantalla: nunca lleva la URL, la llave ni el
 * texto de la API.
 */
class ErrorConsultaCno extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
    /** Segundos de la cabecera `Retry-After` cuando la API respondió 429. */
    readonly reintentarEn?: string,
  ) {
    super(mensaje);
    this.name = 'ErrorConsultaCno';
  }
}

/** Traduce un fallo de la consulta a la respuesta que reciben los route handlers. */
export function respuestaDeErrorCno(error: unknown): Response {
  if (error instanceof ErrorConsultaCno) {
    const cabeceras: Record<string, string> = {};
    if (error.reintentarEn) cabeceras['Retry-After'] = error.reintentarEn;
    return Response.json({ error: error.message }, { status: error.estado, headers: cabeceras });
  }

  console.error('[consulta-cno] Fallo inesperado al consultar el catálogo:', error);
  return Response.json({ error: MENSAJE_NO_DISPONIBLE }, { status: 500 });
}

const fichasEnCache = new Map<string, { ficha: DetalleOcupacion; caduca: number }>();

/**
 * Llama a la API añadiendo la llave.
 * @returns `null` si la API responde 404.
 */
async function consultar<T>(ruta: string): Promise<T | null> {
  const urlBase = process.env.CNO_API_URL;
  const llave = process.env.CNO_API_KEY;

  if (!urlBase || !llave) {
    console.error('[consulta-cno] Falta CNO_API_URL o CNO_API_KEY en el entorno del sitio web.');
    throw new ErrorConsultaCno(503, MENSAJE_NO_DISPONIBLE);
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(new URL(`${RUTA_BASE}${ruta}`, urlBase), {
      headers: { 'x-api-key': llave, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
  } catch (error) {
    console.error('[consulta-cno] La API de ocupaciones no respondió:', error);
    throw new ErrorConsultaCno(502, MENSAJE_NO_DISPONIBLE);
  }

  if (respuesta.ok) return (await respuesta.json()) as T;
  if (respuesta.status === 404) return null;

  if (respuesta.status === 429) {
    throw new ErrorConsultaCno(
      429,
      'Hay demasiadas consultas en este momento. Espera un minuto y vuelve a intentarlo.',
      respuesta.headers.get('Retry-After') ?? '60',
    );
  }

  // Un 401 es un problema de configuración nuestro (llave ausente o revocada), no
  // de quien busca: se registra para el equipo y al visitante se le da el genérico.
  console.error(`[consulta-cno] La API respondió ${respuesta.status} a ${RUTA_BASE}${ruta}`);
  throw new ErrorConsultaCno(502, MENSAJE_NO_DISPONIBLE);
}

/** Minúsculas y sin tildes: "Diseño Gráfico" y "diseno grafico" tienen que encontrar lo mismo. */
function normalizar(texto: string): string {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Nombres sin repetidos ni vacíos: la vista los usa como `key` de React. */
function nombresUnicos(referencias: ReferenciaApi[] | null | undefined): string[] {
  const nombres = (referencias ?? []).map((referencia) => String(referencia?.nombre ?? '').trim());
  return [...new Set(nombres.filter(Boolean))];
}

function referenciasUnicas(
  referencias: ReferenciaApi[] | null | undefined,
): OcupacionRelacionada[] {
  const porCodigo = new Map<string, OcupacionRelacionada>();
  for (const referencia of referencias ?? []) {
    const codigo = String(referencia?.codigo ?? '').trim();
    if (codigo && !porCodigo.has(codigo)) {
      porCodigo.set(codigo, { codigo, nombre: String(referencia.nombre ?? '').trim() });
    }
  }
  return [...porCodigo.values()];
}

function tipoContrario(tipo: TipoClasificacion): TipoClasificacion {
  return tipo === 'CNO' ? 'CUOC' : 'CNO';
}

/**
 * Busca ocupaciones CNO y CUOC por código, nombre o denominación.
 *
 * @param termino texto tal cual lo escribió la persona.
 * @returns hasta `LIMITE_RESULTADOS` ocupaciones, en el orden que da la API.
 */
export async function buscarOcupaciones(termino: string): Promise<ResultadoOcupacion[]> {
  const texto = termino.trim().slice(0, LARGO_MAXIMO_TERMINO);
  if (!texto) return [];

  const parametros = new URLSearchParams({ q: texto, limit: String(LIMITE_RESULTADOS) });
  const encontradas = (await consultar<OcupacionBuscadaApi[]>(`/buscar?${parametros}`)) ?? [];
  const consulta = normalizar(texto);

  return encontradas.map((ocupacion) => {
    const denominaciones = nombresUnicos(ocupacion.denominaciones);

    return {
      tipo: ocupacion.tipo,
      codigoOcupacion: String(ocupacion.codigo),
      nombreOcupacion: String(ocupacion.nombre ?? '').trim(),
      denominaciones,
      denominacionesCoincidentes: denominaciones.filter((nombre) =>
        normalizar(nombre).includes(consulta),
      ),
    };
  });
}

/**
 * Ficha completa de una ocupación CNO (4 dígitos) o CUOC (5 dígitos).
 * @returns `null` si el código no tiene forma de código o la ocupación no existe.
 */
export async function obtenerDetalleOcupacion(codigo: string): Promise<DetalleOcupacion | null> {
  const codigoLimpio = codigo.trim();
  if (!PATRON_CODIGO.test(codigoLimpio)) return null;

  const guardada = fichasEnCache.get(codigoLimpio);
  if (guardada && guardada.caduca > Date.now()) return guardada.ficha;

  const ficha = await consultar<FichaApi>(`/${encodeURIComponent(codigoLimpio)}`);
  if (!ficha) return null;

  const detalle: DetalleOcupacion = {
    tipo: ficha.tipo,
    codigoOcupacion: String(ficha.codigo),
    nombreOcupacion: String(ficha.nombre ?? '').trim(),
    descripcion: String(ficha.descripcion ?? '').trim(),

    areaDesempeno: String(ficha.ubicacion?.areaDesempeno?.nombre ?? '').trim(),
    nivelCualificacion: String(ficha.ubicacion?.nivelCualificacion?.nombre ?? '').trim(),
    areaOcupacional: [],
    campoOcupacional: [],

    funciones: [
      ...new Set(
        (ficha.funciones ?? [])
          .map((funcion) => String(funcion?.descripcion ?? '').trim())
          .filter(Boolean),
      ),
    ],
    normasAsociadas: [],
    denominaciones: nombresUnicos(ficha.denominaciones),
    ocupacionesRelacionadas: referenciasUnicas(ficha.ocupacionesRelacionadas),
    habilidades: nombresUnicos(ficha.habilidades),
    conocimientos: nombresUnicos(ficha.conocimientos),
    correlativa: {
      tipo: ficha.correlativa?.tipo ?? tipoContrario(ficha.tipo),
      ocupaciones: referenciasUnicas(ficha.correlativa?.ocupaciones),
    },
  };

  // El Map conserva el orden de inserción: el primero es el más antiguo.
  if (fichasEnCache.size >= MAXIMO_FICHAS_EN_CACHE) {
    const masAntigua = fichasEnCache.keys().next().value;
    if (masAntigua !== undefined) fichasEnCache.delete(masAntigua);
  }
  fichasEnCache.set(codigoLimpio, { ficha: detalle, caduca: Date.now() + DURACION_CACHE_FICHA_MS });

  return detalle;
}
