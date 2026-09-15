/**
 * Contratos del panel de indicadores de formación por departamento.
 *
 * El modelo sigue el esquema estrella acordado para `formacion_indicadores`:
 * departamento, centro, nivel de formación, programa y sexo son las
 * dimensiones; certificados, vinculados, tasa de vinculación y salario
 * promedio son las métricas de la tabla de hechos. Aquí es solo de
 * frontend — los datos vienen de `lib/programas-sobresalientes-temporal.ts`,
 * un fixture estático (sin backend ni base de datos). El día que exista la
 * tabla real, solo cambia esa fuente — nada de aquí hacia arriba.
 */

/** Nivel de formación, tal como lo clasifica el SENA (`niveles_formacion.nombre`). */
export type NivelFormacion = 'Técnico' | 'Tecnólogo' | 'Especialización' | 'Operario' | 'Auxiliar';

/** `sexo` en el esquema real es un `ENUM ('M', 'F')`; aquí se conserva el mismo código. */
export type Sexo = 'M' | 'F';

/** Una fila de `formacion_indicadores`: un cruce centro + programa + nivel + sexo. */
export interface RegistroFormacion {
  id: string;
  centro: string;
  nivelFormacion: NivelFormacion;
  programa: string;
  sexo: Sexo;
  certificados: number;
  vinculados: number;
  /** Porcentaje (0-100); `NUMERIC(5,2)` en el esquema real. */
  tasaVinculacion: number;
  /** Pesos colombianos mensuales; `NUMERIC(12,2)` en el esquema real. */
  salarioPromedio: number;
}

/** Un departamento con al menos un registro de formación. */
export interface DepartamentoFormacion {
  /** Código DANE; debe coincidir con `DepartamentoGeo.codigoDane`. */
  codigoDane: string;
  nombre: string;
  registros: RegistroFormacion[];
}

/** Fila de resultados: un registro ya resuelto contra su departamento. */
export interface RegistroConDepartamento extends RegistroFormacion {
  codigoDane: string;
  departamento: string;
}

/** Estado de los filtros de consulta: departamento (mapa) + centro + nivel + sexo + programa. */
export interface FiltrosFormacion {
  /** Código DANE del departamento elegido desde el mapa, o `'todos'`. */
  codigoDane: string;
  /** Nombre del centro elegido, o `'todos'`. */
  centro: string;
  /** `NivelFormacion` elegido, o `'todos'`. */
  nivelFormacion: string;
  /** `Sexo` elegido, o `'todos'`. */
  sexo: string;
  /** Nombre del programa elegido, o `'todos'`. */
  programa: string;
}
