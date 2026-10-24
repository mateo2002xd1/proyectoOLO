import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../src/config/database';

/**
 * Lo común a los scripts que vuelcan filas de la base a un `.sql` con INSERT:
 * `generar-seed-contenido.ts` (contenido inicial) y `volcar-paginas.ts` (páginas para
 * llevar a un servidor en uso).
 */

/**
 * Columnas que referencian `usuarios`. Se vuelcan como NULL: son trazabilidad de la base
 * de origen, y las cuentas no viajan.
 */
export const COLUMNAS_A_NULL: ReadonlySet<string> = new Set([
  'creado_por',
  'revisor_id',
  'publicado_por',
  'actualizado_por',
  'autor_id', // contenidos.autor_id
  'revisado_por', // contenidos.revisado_por
  'aprobado_por', // marca_versiones.aprobado_por
]);

/**
 * Un valor listo para meter en un INSERT.
 *
 * Las cadenas se citan con el delimitador `$tag$` de PostgreSQL en vez de con comillas
 * simples: el contenido de los bloques de Puck es JSON lleno de comillas y de barras
 * invertidas, y escaparlas a mano es la clase de detalle que falla en el caso raro.
 */
export const literal = (valor: unknown, tag: string, esJson: boolean): string => {
  if (valor === null || valor === undefined) return 'NULL';

  // Las columnas JSONB se citan SIEMPRE como texto y se convierten con `::jsonb`,
  // incluso cuando el valor es un número o un booleano. Un `5` suelto en un INSERT es
  // un `integer` para PostgreSQL, que no lo convierte solo a jsonb y rechaza la fila
  // entera: es lo que pasaba con `configuraciones.valor`.
  if (esJson) return `$${tag}$${JSON.stringify(valor)}$${tag}$::jsonb`;

  if (typeof valor === 'number') return String(valor);
  if (typeof valor === 'boolean') return valor ? 'TRUE' : 'FALSE';
  if (valor instanceof Date) return `'${valor.toISOString()}'`;
  const texto = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  return `$${tag}$${texto}$${tag}$`;
};

/**
 * El delimitador de las cadenas no puede aparecer dentro de ningún dato, o cortaría la
 * cita por la mitad: se alarga hasta que no esté en la muestra.
 */
export const etiquetaLibre = (muestra: string): string => {
  let tag = 'olo';
  while (muestra.includes(`$${tag}$`)) tag += 'x';
  return tag;
};

interface Columna {
  nombre: string;
  /** `true` para json y jsonb: obliga a citar y convertir explícitamente. */
  esJson: boolean;
}

/** Las columnas de una tabla con su tipo, en su orden. */
const columnasDe = async (tabla: string): Promise<Columna[]> => {
  const filas = await sequelize.query<{ column_name: string; data_type: string }>(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = :tabla
     ORDER BY ordinal_position`,
    { type: QueryTypes.SELECT, replacements: { tabla } }
  );
  return filas.map((f) => ({
    nombre: f.column_name,
    esJson: f.data_type === 'jsonb' || f.data_type === 'json',
  }));
};

export interface OpcionesVolcado {
  tag: string;
  /** Columnas que no se incluyen en el INSERT (p. ej. una referencia circular). */
  omitir?: string[];
  /** Cláusula WHERE completa (y ORDER BY), si solo interesa parte de la tabla. */
  filtro?: string;
  /** Para que varias tablas se lean de una misma foto de la base. */
  transaccion?: Transaction;
  /** Valor fijo para una columna, en vez del que tenga cada fila (p. ej. `visitas: 0`). */
  fijar?: Record<string, unknown>;
}

/** Los INSERT de una tabla, con las columnas omitidas fuera y un filtro opcional. */
export const volcar = async (
  tabla: string,
  { tag, omitir = [], filtro = '', transaccion, fijar = {} }: OpcionesVolcado
): Promise<{ sql: string; n: number }> => {
  const cols = (await columnasDe(tabla)).filter((c) => !omitir.includes(c.nombre));
  const filas = await sequelize.query<Record<string, unknown>>(
    `SELECT * FROM "${tabla}"${filtro}`,
    { type: QueryTypes.SELECT, transaction: transaccion }
  );

  if (filas.length === 0) return { sql: `-- ${tabla}: sin filas\n`, n: 0 };

  const valores = filas
    .map((fila) => {
      const campos = cols.map((col) => {
        if (col.nombre in fijar) return literal(fijar[col.nombre], tag, col.esJson);
        return COLUMNAS_A_NULL.has(col.nombre) ? 'NULL' : literal(fila[col.nombre], tag, col.esJson);
      });
      return `  (${campos.join(', ')})`;
    })
    .join(',\n');

  const columnasSql = cols.map((c) => `"${c.nombre}"`).join(', ');
  // `ON CONFLICT DO NOTHING` hace el archivo idempotente: aplicarlo dos veces sobre la
  // misma base no duplica ni falla, que es lo que se espera de una semilla.
  return {
    sql: `INSERT INTO "${tabla}" (${columnasSql}) VALUES\n${valores}\nON CONFLICT DO NOTHING;\n`,
    n: filas.length,
  };
};
