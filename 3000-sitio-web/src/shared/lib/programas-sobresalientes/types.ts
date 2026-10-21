/**
 * Contratos del panel de indicadores de formación por departamento.
 *
 * El modelo sigue el esquema estrella de `programas_sobresalientes` (tabla de
 * Mateo, migración `026-observatorio-programas-sobresalientes`): departamento,
 * centro, nivel de formación, programa y sexo son las dimensiones; certificados,
 * vinculados, tasa de vinculación y salario promedio son las métricas de la tabla
 * de hechos. Los datos vienen de `GET /api/observatorio/programas-sobresalientes`
 * (`services/programas-sobresalientes.service.ts`) — cada carga vacía y recarga la
 * tabla entera, ver `api-backend/src/use-cases/observatorio/`.
 */

/**
 * Nivel de formación, verificado contra el Excel real de SENA (hoja
 * "Superan el margen"). Antes decía "Especialización" en vez de
 * "Profundización Técnica", que es el nombre real.
 */
export type NivelFormacion = 'Técnico' | 'Tecnólogo' | 'Profundización Técnica' | 'Operario' | 'Auxiliar';

/** `sexo` en el esquema real es un `CHECK IN ('M', 'F')` (nunca `ENUM` — convención D4 del proyecto). */
export type Sexo = 'M' | 'F';

/**
 * Una fila de `programas_sobresalientes`: un cruce centro + programa + nivel + sexo.
 *
 * Los campos llevan el nombre de la columna del Excel de SENA, no el que se ve en la
 * página — la traducción está en `resultados-programas-sobresalientes.tsx`.
 */
export interface RegistroFormacion {
  id: string;
  centro: string;
  /** Se muestra como «Modalidad». En el Excel: "Nivel de Formación". */
  nivelFormacion: NivelFormacion;
  programa: string;
  sexo: Sexo;
  /** Se muestra como «Egresados». En el Excel se llama "Certificados". */
  certificados: number;
  /** No se muestra; se conserva porque la tasa de vinculación se calcula con él. */
  vinculados: number;
  /** Porcentaje (0-100); `NUMERIC(5,2)` en el esquema real. */
  tasaVinculacion: number;
  /** Pesos colombianos mensuales; `NUMERIC(12,2)` en el esquema real. */
  salarioPromedio: number;
}

/** Fila de resultados: un registro ya resuelto contra su departamento. */
export interface RegistroConDepartamento extends RegistroFormacion {
  codigoDane: string;
  departamento: string;
}

/** Un departamento con al menos un registro de formación — para pintar el mapa. */
export interface DepartamentoConDatos {
  codigoDane: string;
  nombre: string;
}

/**
 * Estado de los filtros de consulta: departamento (mapa) + modalidad (nivel de
 * formación) + género + programa.
 *
 * Sin filtro de Centro a propósito (decisión de sesión): el centro se sigue
 * mostrando en la tabla de resultados, pero dejó de ser un selector.
 */
export interface FiltrosFormacion {
  /** Código DANE del departamento elegido desde el mapa, o `'todos'`. */
  codigoDane: string;
  /** `NivelFormacion` elegido, o `'todos'`. */
  nivelFormacion: string;
  /** `Sexo` elegido, o `'todos'`. */
  sexo: string;
  /** Nombre del programa elegido, o `'todos'`. */
  programa: string;
}
