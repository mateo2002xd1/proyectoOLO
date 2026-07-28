import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../src/config/database';
import '../src/infrastructure/db/models';

/**
 * Contrasta cada modelo Sequelize contra las columnas reales de Postgres.
 *
 * Existe porque el puente entre modelo y esquema son cadenas (`field: 'titulo'`) y
 * ninguna herramienta las valida: un `field` mal escrito compila sin protestar y
 * revienta en la primera consulta. Después de una migración que renombra columnas,
 * esto es lo que dice si el mapeo quedó bien.
 */

interface Discrepancia {
  modelo: string;
  detalle: string;
}

// Según la conexión, este driver devuelve las filas como objeto o como array
// posicional. Leerlas de una sola forma daba un informe silenciosamente falso, así
// que se normalizan antes de usarlas.
const valores = (fila: unknown): unknown[] =>
  Array.isArray(fila) ? fila : Object.values(fila as Record<string, unknown>);

const obtenerColumnasReales = async (): Promise<Map<string, Set<string>>> => {
  const filas = await sequelize.query(
    `SELECT table_name, column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'`,
    { type: QueryTypes.SELECT, logging: false }
  );

  const porTabla = new Map<string, Set<string>>();
  for (const fila of filas) {
    const [tabla, columna] = valores(fila) as [string, string];
    if (!porTabla.has(tabla)) porTabla.set(tabla, new Set());
    porTabla.get(tabla)!.add(columna);
  }
  return porTabla;
};

const verificar = async (): Promise<Discrepancia[]> => {
  const columnasReales = await obtenerColumnasReales();
  const discrepancias: Discrepancia[] = [];

  for (const modelo of Object.values(sequelize.models)) {
    const tabla = modelo.getTableName() as string;
    const columnas = columnasReales.get(tabla);

    if (!columnas) {
      discrepancias.push({
        modelo: modelo.name,
        detalle: `la tabla "${tabla}" no existe en la base de datos`,
      });
      continue;
    }

    const atributos = modelo.getAttributes();
    for (const [atributo, definicion] of Object.entries(atributos)) {
      const columna = (definicion as { field?: string }).field ?? atributo;
      if (!columnas.has(columna)) {
        discrepancias.push({
          modelo: modelo.name,
          detalle: `${atributo} → "${tabla}"."${columna}" no existe`,
        });
      }
    }
  }

  return discrepancias;
};

sequelize
  .authenticate()
  .then(verificar)
  .then(async (discrepancias) => {
    if (discrepancias.length === 0) {
      console.log(
        `Esquema verificado: los ${Object.keys(sequelize.models).length} modelos ` +
          'coinciden con las columnas reales.'
      );
      await sequelize.close();
      process.exit(0);
    }

    console.error(`${discrepancias.length} discrepancia(s) entre modelos y esquema:\n`);
    for (const { modelo, detalle } of discrepancias) {
      console.error(`  ${modelo}: ${detalle}`);
    }
    await sequelize.close();
    process.exit(1);
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
