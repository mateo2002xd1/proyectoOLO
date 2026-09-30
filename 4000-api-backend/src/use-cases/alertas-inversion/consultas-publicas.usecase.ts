import { AlertasInversionRepository as Repo } from '../../repositories/alertas-inversion.repository';

export interface FiltroConsultaPublica {
  /** Código DANE de dos dígitos; `null` = nacional. */
  codigoDaneDepartamento: string | null;
  /** `null` = todos los años. */
  anio: number | null;
}

export interface SeccionConCantidad {
  letra: string;
  nombre: string;
  cantidadProyectos: number;
}

/**
 * El gráfico "proyectos por sector" — calcado de la consulta `grafico` del borrador de
 * esquema de origen. Público, sin sesión: es conteo agregado, no dato personal.
 */
export async function consultarGraficoAlertasInversion(filtro: FiltroConsultaPublica): Promise<SeccionConCantidad[]> {
  const filas = await Repo.obtenerGraficoPorSeccion(filtro.codigoDaneDepartamento, filtro.anio);
  return filas.map((f) => ({ letra: f.letra, nombre: f.nombre, cantidadProyectos: Number(f.cantidad_proyectos) }));
}

export interface ProyectoInversionPublico {
  id: string;
  tipo: string;
  descripcion: string;
  empresa: string;
  sector: string;
  codigoCiiu: string | null;
  actividad: string | null;
  ubicaciones: string;
  fechaAnuncio: string;
  fuenteUrl: string;
  fuenteMedio: string | null;
  inversionCop: number | null;
  empleosEstimados: number | null;
}

export interface ListadoPublico {
  proyectos: ProyectoInversionPublico[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

/** El listado paginado que acompaña al gráfico. Público, sin sesión. */
export async function consultarListadoAlertasInversion(filtro: {
  seccionLetra: string | null;
  anio: number | null;
  pagina: number;
  porPagina: number;
}): Promise<ListadoPublico> {
  const { rows, total } = await Repo.listarPublicados(filtro);

  const proyectos: ProyectoInversionPublico[] = rows.map((p: any) => ({
    id: p.id,
    tipo: p.tipo,
    descripcion: p.descripcion,
    empresa: p.empresa?.nombre ?? '',
    sector: p.seccion?.nombre ?? '',
    codigoCiiu: p.clase?.codigo ?? null,
    actividad: p.clase?.nombre ?? null,
    ubicaciones: (p.ubicaciones ?? [])
      .map((u: any) => {
        const municipio = u.municipio?.nombre;
        const departamento = u.departamento?.nombre;
        return municipio && municipio !== departamento ? `${municipio}, ${departamento}` : departamento;
      })
      .join(' · '),
    fechaAnuncio: p.fecha_anuncio,
    fuenteUrl: p.fuente_url,
    fuenteMedio: p.fuente_medio,
    inversionCop: p.inversion_cop !== null ? Number(p.inversion_cop) : null,
    empleosEstimados: p.empleos_estimados,
  }));

  return {
    proyectos,
    total,
    pagina: filtro.pagina,
    porPagina: filtro.porPagina,
    totalPaginas: Math.max(1, Math.ceil(total / filtro.porPagina)),
  };
}

/** Catálogo de secciones activas y años con datos — para poblar los filtros del sitio y el formulario del panel. */
export async function consultarOpcionesAlertasInversion() {
  const [secciones, anios] = await Promise.all([Repo.listarSecciones(), Repo.listarAniosConDatos()]);
  return {
    secciones: secciones.map((s: any) => ({ id: s.id, letra: s.letra, nombre: s.nombre })),
    anios: anios.map((a) => a.anio),
  };
}
