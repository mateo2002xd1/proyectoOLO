import 'dotenv/config';
import fs from 'fs';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';

// Respaldo lógico previo a las migraciones que renombran tablas con datos.
// Cada fila se pide como un único JSON (`row_to_json`) para no depender de si el
// driver devuelve objetos o arrays posicionales.
const TABLAS = [
  'users',
  'roles',
  'permissions',
  'role_permissions',
  'security_questions',
  'paginas',
  'paginas_versiones',
  'content_audit_logs',
  'Post',
  'Section',
  'Attachment',
  'FileStatuses',
];

/** Vuelca a un JSON las filas de las tablas de `TABLAS`, para restaurarlas a mano si hace falta. */
const main = async () => {
  const destino = process.argv[2];
  if (!destino) throw new Error('Uso: npm run respaldo -- <ruta-del-json>');

  const volcado: Record<string, unknown[]> = {};

  for (const tabla of TABLAS) {
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
