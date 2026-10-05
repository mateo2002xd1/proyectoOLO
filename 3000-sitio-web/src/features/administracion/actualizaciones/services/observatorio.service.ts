import axios from 'axios';
import type {
  CargaDatos,
  CargaFuentesFuturasCreada,
  CargaFuentesFuturasEliminada,
  CargaTendencia,
  CargaTendenciaEliminada,
  ClaseCiiu,
  CeldaTendencia,
  DatosProyectoInversionManual,
  FiltroHistorialTendencia,
  FormatoDeCarga,
  HistorialTendencia,
  ProyectoInversionPanel,
  ResultadoActualizarSectores,
  SeccionCiiu,
} from '../types';
import { URL_DE_LA_API } from '@/shared/lib/url-de-la-api';

/**
 * Cliente autenticado propio de esta feature — mismo patrón que
 * `features/paginas/model/api-con-sesion.ts`: `axios` + `withCredentials`,
 * directo al backend (no por un route handler de Next), igual que
 * `aprobarPagina`/`rechazarPagina`.
 */
const api = axios.create({
  baseURL: URL_DE_LA_API,
  withCredentials: true,
  timeout: 15000,
});

/**
 * Excel de ejemplo de una carga, con las hojas y columnas que espera. Va por la API y no
 * por un enlace directo porque pide la sesión de Administrador.
 */
export async function descargarFormatoDeCarga(formato: FormatoDeCarga): Promise<Blob> {
  try {
    const { data } = await api.get(`/api/observatorio/formatos/${formato}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return data;
  } catch (error) {
    // Con `responseType: 'blob'` el cuerpo del error también llega como Blob: se lee aquí
    // para que `mensajeDeErrorApi` encuentre el `{ error }` de la API como en las demás.
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        // No era JSON (una página de error del proxy, por ejemplo): se deja tal cual.
      }
    }
    throw error;
  }
}

/** Sube el Excel y arranca la carga de inmediato — sin paso de aprobación (decisión de sesión). */
export async function subirExcelProgramaSobresalientes(archivo: File): Promise<{ cargaId: string }> {
  const formData = new FormData();
  formData.append('file', archivo);
  const { data } = await api.post('/api/observatorio/cargas', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export async function listarCargasProgramaSobresalientes(): Promise<CargaDatos[]> {
  const { data } = await api.get('/api/observatorio/cargas');
  return data;
}

export async function obtenerCargaProgramaSobresalientes(id: string): Promise<CargaDatos> {
  const { data } = await api.get(`/api/observatorio/cargas/${id}`);
  return data;
}

/** Borra la carga del historial y, si nadie más comparte el archivo, también el Excel de disco. */
export async function eliminarCargaProgramaSobresalientes(id: string): Promise<void> {
  await api.delete(`/api/observatorio/cargas/${id}`);
}

// ---------------------------------------------------------------------------
// Criterios de clasificación de resultados (tendencia ocupacional)
// ---------------------------------------------------------------------------

const TENDENCIA = '/api/observatorio/tendencia-ocupacional';

/** Matriz año × periodo (2012..año actual) con el estado de cada celda. */
export async function obtenerEstadoTendencia(): Promise<CeldaTendencia[]> {
  const { data } = await api.get(`${TENDENCIA}/estado`);
  return data;
}

/**
 * Sube el Excel de una celda. El archivo no trae año ni periodo: van aquí. Si la celda
 * ya tiene datos o una carga en curso, la API responde 409.
 */
export async function subirExcelTendencia(
  archivo: File,
  celda: { anio: string; periodo: string }
): Promise<{ cargaId: string }> {
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('anio', celda.anio);
  formData.append('periodo', celda.periodo);
  const { data } = await api.post(`${TENDENCIA}/cargas`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export async function listarCargasTendencia(
  filtro: FiltroHistorialTendencia,
  pagina: number,
  porPagina: number
): Promise<HistorialTendencia> {
  const { data } = await api.get(`${TENDENCIA}/cargas`, {
    params: { anio: filtro.anio || undefined, periodo: filtro.periodo || undefined, pagina, porPagina },
  });
  return data;
}

export async function obtenerCargaTendencia(id: string): Promise<CargaTendencia> {
  const { data } = await api.get(`${TENDENCIA}/cargas/${id}`);
  return data;
}

/** Hace visibles en el sitio los cortes en borrador. */
export async function publicarCortesTendencia(corteIds: string[]): Promise<void> {
  await api.post(`${TENDENCIA}/cortes/publicar`, { corteIds });
}

/**
 * Quita una carga del historial y su Excel del almacenamiento. Si era la vigente de su año
 * y periodo, la API borra también esos datos (y el sitio deja de mostrarlos).
 */
export async function eliminarCargaTendencia(id: string): Promise<CargaTendenciaEliminada> {
  const { data } = await api.delete(`${TENDENCIA}/cargas/${id}`);
  return data;
}

/** Devuelve un corte a borrador: deja de verse en el sitio y sus datos se conservan. */
export async function despublicarCorteTendencia(corteId: string): Promise<void> {
  await api.patch(`${TENDENCIA}/cortes/${corteId}/despublicar`);
}

// ---------------------------------------------------------------------------
// Alertas de inversión
// ---------------------------------------------------------------------------

const ALERTAS_INVERSION = '/api/alertas-inversion';

/** Sube el Excel y arranca la carga de inmediato — sin paso de aprobación. */
export async function subirExcelAlertasInversion(archivo: File): Promise<{ cargaId: string }> {
  const formData = new FormData();
  formData.append('file', archivo);
  const { data } = await api.post(`${ALERTAS_INVERSION}/cargas`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export async function listarCargasAlertasInversion(): Promise<CargaDatos[]> {
  const { data } = await api.get(`${ALERTAS_INVERSION}/cargas`);
  return data;
}

export async function obtenerCargaAlertasInversion(id: string): Promise<CargaDatos> {
  const { data } = await api.get(`${ALERTAS_INVERSION}/cargas/${id}`);
  return data;
}

export async function eliminarCargaAlertasInversion(id: string): Promise<void> {
  await api.delete(`${ALERTAS_INVERSION}/cargas/${id}`);
}

export async function listarProyectosInversion(): Promise<ProyectoInversionPanel[]> {
  const { data } = await api.get(`${ALERTAS_INVERSION}/proyectos`);
  return data;
}

/** «Limpiar»: borra todos los proyectos. */
export async function eliminarTodosLosProyectosInversion(): Promise<{ eliminados: number }> {
  const { data } = await api.delete(`${ALERTAS_INVERSION}/proyectos`);
  return data;
}

export async function eliminarProyectoInversion(id: string): Promise<void> {
  await api.delete(`${ALERTAS_INVERSION}/proyectos/${id}`);
}

/** Excel de ejemplo de la carga — mismo manejo de error-como-blob que `descargarFormatoDeCarga`. */
/**
 * Descarga un Excel de ejemplo de Alertas de inversión. Con `responseType: 'blob'` el
 * cuerpo del error también llega como Blob: se lee aquí para que `mensajeDeErrorApi`
 * encuentre el `{ error }` de la API, igual que en `descargarFormatoDeCarga`.
 */
async function descargarExcelDeAlertas(ruta: string): Promise<Blob> {
  try {
    const { data } = await api.get(`${ALERTAS_INVERSION}/${ruta}`, { responseType: 'blob', timeout: 60000 });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        // No era JSON: se deja tal cual.
      }
    }
    throw error;
  }
}

/** Excel de ejemplo de la carga de proyectos. */
export const descargarFormatoAlertasInversion = () => descargarExcelDeAlertas('formatos/plantilla');

/** Excel de ejemplo de «Actualizar sectores (CIIU)». */
export const descargarFormatoSectoresCiiu = () => descargarExcelDeAlertas('formatos/sectores');

/** Catálogo de secciones CIIU activas, para el formulario manual. Público, sin sesión. */
/** Catálogos del formulario manual: sectores CIIU y departamentos (la API los reconoce por nombre). */
export async function obtenerOpcionesProyectoInversion(): Promise<{
  secciones: SeccionCiiu[];
  departamentos: { codigoDane: string; nombre: string }[];
  clases: ClaseCiiu[];
}> {
  const { data } = await api.get(`${ALERTAS_INVERSION}/opciones`);
  return { secciones: data.secciones, departamentos: data.departamentos ?? [], clases: data.clases ?? [] };
}

/** Actualiza el catálogo de sectores CIIU desde un Excel de código y nombre. */
export async function actualizarSectoresCiiu(archivo: File): Promise<ResultadoActualizarSectores> {
  const formData = new FormData();
  formData.append('file', archivo);
  const { data } = await api.post(`${ALERTAS_INVERSION}/sectores`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

/** Alta manual de un proyecto — segunda vía de entrada, junto a la carga de Excel. */
export async function crearProyectoInversionManual(datos: DatosProyectoInversionManual): Promise<{ id: string }> {
  const { data } = await api.post(`${ALERTAS_INVERSION}/proyectos`, datos);
  return data;
}

// ---------------------------------------------------------------------------
// Fuentes futuras de empleo
// ---------------------------------------------------------------------------

const FUENTES_FUTURAS = '/api/observatorio/fuentes-futuras-empleo';

/**
 * Sube el Excel y lo deja vigente en el portal en la misma petición: esta carga no pasa
 * por la cola, así que no hay nada que sondear después.
 */
export async function subirExcelFuentesFuturas(archivo: File): Promise<CargaFuentesFuturasCreada> {
  const formData = new FormData();
  formData.append('file', archivo);
  const { data } = await api.post(`${FUENTES_FUTURAS}/cargas`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export async function listarCargasFuentesFuturas(): Promise<CargaDatos[]> {
  const { data } = await api.get(`${FUENTES_FUTURAS}/cargas`);
  return data;
}

/** Borra la carga y su Excel; el portal vuelve a la carga anterior, o se queda sin datos. */
export async function eliminarCargaFuentesFuturas(id: string): Promise<CargaFuentesFuturasEliminada> {
  const { data } = await api.delete(`${FUENTES_FUTURAS}/cargas/${id}`);
  return data;
}
