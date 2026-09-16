import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';

/**
 * Forma que consume el mapa público — calcada de `RegistroConDepartamento` en
 * `sitio-web/.../programas-sobresalientes/types.ts`.
 */
export interface RegistroObservatorioActual {
  id: string;
  centro: string;
  nivelFormacion: string;
  programa: string;
  sexo: 'M' | 'F';
  certificados: number;
  vinculados: number;
  /** Porcentaje 0-100, aunque en la base se guarda como fracción 0-1 (`tasa_vinculacion`). */
  tasaVinculacion: number;
  salarioPromedio: number;
  codigoDane: string;
  departamento: string;
}

/**
 * Los datos vigentes de "Programa + sobresalientes" — `programas_sobresalientes`
 * completo, porque cada carga lo vacía y recarga entero (no hay una "versión"
 * que filtrar). Público, sin sesión: es analítica agregada, no dato personal.
 */
export async function consultarObservatorioActual(): Promise<RegistroObservatorioActual[]> {
  const filas = await Repo.obtenerProgramasSobresalientes();

  return filas.map((fila: any) => ({
    id: fila.id,
    centro: fila.centro?.nombre ?? '',
    nivelFormacion: fila.nivelFormacion?.nombre ?? '',
    programa: fila.programa?.nombre ?? '',
    sexo: fila.sexo,
    certificados: fila.certificados,
    vinculados: fila.vinculados,
    // La base guarda fracción (0-1, `ck_sobresalientes_tasa`); el frontend siempre
    // esperó un porcentaje (`toFixed(1)` + '%' directo) — se convierte aquí y en
    // ningún otro lado, para que el contrato público no cambie.
    tasaVinculacion: Number(fila.tasa_vinculacion) * 100,
    salarioPromedio: Number(fila.salario_promedio),
    codigoDane: fila.departamento?.codigo_dane ?? '',
    departamento: fila.departamento?.nombre ?? '',
  }));
}
