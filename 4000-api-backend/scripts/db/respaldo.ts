import 'dotenv/config';
import fs from 'fs';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';

// Respaldo lógico previo a una migración: todas las tablas del esquema `public`.
// Cada fila se pide como un único JSON (`row_to_json`) para no depender de si el
// driver devuelve objetos o arrays posicionales.
//
// La lista se pide a la base en cada ejecución. Hasta el 09-10-2026 estaba escrita a
// mano con los nombres de antes de la 005 (`users`, `permissions`, `"Post"`…), así que
// el script fallaba en la primera tabla y no respaldaba nada.
const listarTablas = async (): Promise<string[]> => {
  const filas = await sequelize.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name`,
    { type: QueryTypes.SELECT, logging: false }
  );
  return filas.map((fila) =>
    String(Array.isArray(fila) ? fila[0] : Object.values(fila as Record<string, unknown>)[0])
  );
};

/** Vuelca a un JSON las filas de todas las tablas, para restaurarlas a mano si hace falta. */
const main = async () => {
  const destino = process.argv[2];
  if (!destino) throw new Error('Uso: npm run respaldo -- <ruta-del-json>');

  const volcado: Record<string, unknown[]> = {};

  for (const tabla of await listarTablas()) {
    const filas = await sequelize.query(`SELECT row_to_json(t) FROM "${tabla}" t`, {
      type: QueryTypes.SELECT,
      logging: false,
    });
    volcado[tabla] = filas.map((fila) =>
      Array.isArray(fila) ? fila[0] : Object.values(fila as Record<string, unknown>)[0]
    );
    console.log(`${String(volcado[tabla].length).padStart(5)} filas  ${tabla}`);
  }

  fs.writeFileSync(destino, JSON.stringify(volcado, null, 2), 'utf8');
  console.log(`\nRespaldo escrito en ${destino}`);
};

main()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
