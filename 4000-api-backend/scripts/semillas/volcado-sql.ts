import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../src/config/database';

/**
 * Lo común a los scripts que vuelcan filas de la base a un `.sql` con INSERT
 * (`volcar-base-datos.ts`).
 */

/**
 * Un texto listo para meter en un INSERT, citado con el delimitador `$tag$` de PostgreSQL
 * en vez de con comillas simples: el contenido de los bloques de Puck es JSON lleno de
 * comillas y de barras invertidas, y escaparlas a mano es la clase de detalle que falla en
 * el caso raro. Un literal entre `$tag$` es de tipo «desconocido» y Postgres lo convierte
 * al de la columna, así que sirve igual para fechas, números y booleanos.
 */
/** El delimitador del literal aparece dentro de un dato: hay que probar con otro más largo. */
export class ColisionDeDelimitador extends Error {}

export const literal = (valor: string | null, tag: string): string =>
  valor === null ? 'NULL' : `$${tag}$${valor}$${tag}$`;

interface Columna {
  nombre: string;
  /** `true` para json y jsonb: se cita como texto y se convierte con `::jsonb`. */
  esJson: boolean;
}

/**
 * Las tablas de la base (solo `BASE TABLE`: las vistas no tienen filas propias), por
 * nombre.
 */
export const tablasDeLaBase = async (transaccion?: Transaction): Promise<string[]> => {
  const filas = await sequelize.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
    { type: QueryTypes.SELECT, transaction: transaccion }
  );
  return filas.map((f) => f.tablename);
};

/**
 * Las columnas de una tabla con su tipo, en su orden. Quedan fuera las GENERADAS
 * (`ocupaciones.codigo_nc`, `indicadores_ocupacionales.criterio_codigo`): Postgres rechaza
 * un INSERT que les ponga valor, y se recalculan solas al cargar.
 */
const columnasDe = async (tabla: string, transaccion?: Transaction): Promise<Columna[]> => {
  const filas = await sequelize.query<{ column_name: string; data_type: string }>(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = :tabla AND is_generated = 'NEVER'
     ORDER BY ordinal_position`,
    { type: QueryTypes.SELECT, replacements: { tabla }, transaction: transaccion }
  );
  return filas.map((f) => ({
    nombre: f.column_name,
    esJson: f.data_type === 'jsonb' || f.data_type === 'json',
  }));
};

export interface OpcionesVolcado {
  tag: string;
  /** Cláusula WHERE (y ORDER BY) si solo interesa parte de la tabla. Por defecto, todo. */
  filtro?: string;
  /** Para que varias tablas se lean de una misma foto de la base. */
  transaccion?: Transaction;
  /** Valor fijo para una columna, en vez del que tenga cada fila (p. ej. `visitas: '0'`). */
  fijar?: Record<string, string>;
  /** Columnas que se vuelcan como NULL, como `tabla.columna` (las que apuntan a una cuenta). */
  aNull?: ReadonlySet<string>;
}

/**
 * Los INSERT de una tabla.
 *
 * Cada valor se pide a Postgres ya convertido a texto (`col::text`) en vez de dejar que el
 * controlador lo convierta a un tipo de JavaScript: así una fecha conserva sus
 * microsegundos, un número su precisión y un `date` no se corre un día por la zona
 * horaria. Al cargar, Postgres lo convierte de vuelta.
 */
export const volcar = async (
  tabla: string,
  { tag, filtro, transaccion, fijar = {}, aNull = new Set() }: OpcionesVolcado
): Promise<{ sql: string; n: number }> => {
  const cols = await columnasDe(tabla, transaccion);
  const seleccion = cols.map((c) => `"${c.nombre}"::text AS "${c.nombre}"`).join(', ');
  // Sin filtro, orden estable por el texto de la fila: así volcar dos veces la misma base da
  // el mismo archivo y git solo muestra lo que de verdad cambió.
  const resto = filtro ?? ` ORDER BY "${tabla}"::text`;
  const filas = await sequelize.query<Record<string, string | null>>(
    `SELECT ${seleccion} FROM "${tabla}"${resto}`,
    { type: QueryTypes.SELECT, transaction: transaccion }
  );

  if (filas.length === 0) return { sql: `-- ${tabla}: sin filas\n`, n: 0 };

  const cierre = `$${tag}$`;
  const valores = filas
    .map((fila) => {
      const campos = cols.map((col) => {
        let valor: string | null;
        if (col.nombre in fijar) valor = fijar[col.nombre];
        else if (aNull.has(`${tabla}.${col.nombre}`)) valor = null;
        else valor = fila[col.nombre];
        // El delimitador no puede aparecer dentro de ningún dato, o cortaría la cita por la mitad.
        if (valor !== null && valor.includes(cierre)) {
          throw new ColisionDeDelimitador(`${tabla}.${col.nombre} contiene el delimitador ${cierre}`);
        }
        return literal(valor, tag) + (col.esJson && valor !== null ? '::jsonb' : '');
      });
      return `  (${campos.join(', ')})`;
    })
    .join(',\n');

  const columnasSql = cols.map((c) => `"${c.nombre}"`).join(', ');
  return {
    sql: `INSERT INTO "${tabla}" (${columnasSql}) VALUES\n${valores};\n`,
    n: filas.length,
  };
};
