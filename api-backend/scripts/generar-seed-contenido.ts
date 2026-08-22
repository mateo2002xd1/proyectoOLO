import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../src/config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Regenera `seed/contenido-inicial.sql` a partir de la base a la que apunte
 * `DATABASE_URL`.
 *
 * Existe para poder entregar el proyecto con contenido real dentro. Sin él, una
 * instalación nueva arranca con la base vacía: la portada del sitio se salva porque
 * tiene un respaldo estático en el código (`home-fallback-data.ts`), pero el resto del
 * sitio responde 404 y todas las secciones de la intranet dicen «Página no encontrada».
 *
 * Vuelca **solo contenido**. Lo que deja fuera y por qué está en la cabecera del propio
 * `.sql` que genera, que es donde lo va a leer quien lo aplique.
 *
 * Uso:  npm run seed:generar
 */

/** Columnas que referencian `usuarios`. Se vuelcan como NULL — ver cabecera del .sql. */
const COLUMNAS_A_NULL = new Set(['creado_por', 'revisor_id', 'publicado_por', 'actualizado_por']);

const SALIDA = path.join(__dirname, '..', 'seed', 'contenido-inicial.sql');

/**
 * Un valor listo para meter en un INSERT.
 *
 * Las cadenas se citan con el delimitador `$tag$` de PostgreSQL en vez de con comillas
 * simples: el contenido de los bloques de Puck es JSON lleno de comillas y de barras
 * invertidas, y escaparlas a mano es la clase de detalle que falla en el caso raro.
 */
const literal = (valor: unknown, tag: string, esJson: boolean): string => {
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

interface Columna {
  nombre: string;
  /** `true` para json y jsonb: obliga a citar y convertir explícitamente. */
  esJson: boolean;
}

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

interface OpcionesVolcado {
  tag: string;
  /** Columnas que no se incluyen en el INSERT (p. ej. una referencia circular). */
  omitir?: string[];
  /** Cláusula WHERE completa, si solo interesa parte de la tabla. */
  filtro?: string;
}

const volcar = async (
  tabla: string,
  { tag, omitir = [], filtro = '' }: OpcionesVolcado
): Promise<{ sql: string; n: number }> => {
  const cols = (await columnasDe(tabla)).filter((c) => !omitir.includes(c.nombre));
  const filas = await sequelize.query<Record<string, unknown>>(
    `SELECT * FROM "${tabla}"${filtro}`,
    { type: QueryTypes.SELECT }
  );

  if (filas.length === 0) return { sql: `-- ${tabla}: sin filas\n`, n: 0 };

  const valores = filas
    .map((fila) => {
      const campos = cols.map((col) =>
        COLUMNAS_A_NULL.has(col.nombre) ? 'NULL' : literal(fila[col.nombre], tag, col.esJson)
      );
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

const cabecera = (fecha: string) => `-- Contenido inicial del OLO. GENERADO, no editar a mano.
--
-- Qué lleva: las páginas del sitio y de la intranet con su versión PUBLICADA, y las
-- configuraciones de identidad visual. Es lo que hace falta para que el portal cargue
-- con contenido real en vez de con su respaldo estático.
--
-- Qué NO lleva, a propósito:
--   * usuarios, auditoria_cambios y preguntas_seguridad -> datos personales (Ley 1581).
--     Las columnas que apuntaban a un usuario (creado_por, revisor_id, publicado_por,
--     actualizado_por) se vuelcan como NULL: son trazabilidad, y la de otra instalación
--     no significa nada. El historial de quién editó qué se queda en la base de origen.
--   * roles, permisos y roles_permisos -> los siembran las migraciones 012, 016 y 019.
--   * las versiones en borrador, rechazadas o archivadas -> son trabajo a medias de la
--     instalación de origen. Solo viaja lo publicado, que es lo que se ve.
--
-- Se aplica DESPUÉS de las migraciones, con \`./deploy.sh sembrar\`. Es idempotente, así
-- que ejecutarlo dos veces no duplica nada.
--
-- Regenerar desde una base al día:  npm run seed:generar
-- Generado el ${fecha}
`;

const generar = async (): Promise<void> => {
  await sequelize.authenticate();

  // El delimitador de las cadenas no puede aparecer dentro de ningún dato, o cortaría
  // la cita por la mitad. Se comprueba contra el contenido real y se alarga si hiciera falta.
  let tag = 'olo';
  const muestra = JSON.stringify(
    await sequelize.query('SELECT contenido FROM paginas_versiones', { type: QueryTypes.SELECT })
  );
  while (muestra.includes(`$${tag}$`)) tag += 'x';

  const partes: string[] = [cabecera(new Date().toISOString()), '\nBEGIN;\n'];

  // `paginas.version_publicada_id` apunta a `paginas_versiones` y `paginas_versiones.pagina_id`
  // apunta de vuelta: es circular. Se insertan las páginas sin esa referencia, luego las
  // versiones, y al final se enlazan.
  const paginas = await volcar('paginas', { tag, omitir: ['version_publicada_id'] });
  partes.push('\n-- 1. Páginas (sin enlazar aún su versión publicada: la referencia es circular)\n', paginas.sql);

  const versiones = await volcar('paginas_versiones', { tag, filtro: " WHERE estado = 'publicado'" });
  partes.push('\n-- 2. Versión publicada de cada página\n', versiones.sql);

  const enlaces = await sequelize.query<{ id: string; version_publicada_id: string }>(
    'SELECT id, version_publicada_id FROM paginas WHERE version_publicada_id IS NOT NULL',
    { type: QueryTypes.SELECT }
  );
  partes.push('\n-- 3. Enlazar cada página con su versión publicada\n');
  for (const enlace of enlaces) {
    partes.push(
      `UPDATE "paginas" SET "version_publicada_id" = '${enlace.version_publicada_id}' WHERE "id" = '${enlace.id}';\n`
    );
  }

  const configuraciones = await volcar('configuraciones', { tag });
  partes.push('\n-- 4. Configuraciones (identidad visual)\n', configuraciones.sql, '\nCOMMIT;\n');

  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, partes.join(''), 'utf8');

  const kb = (fs.statSync(SALIDA).size / 1024).toFixed(0);
  console.log(`Generado seed/contenido-inicial.sql (${kb} KB)`);
  console.log(
    `  páginas: ${paginas.n} | versiones publicadas: ${versiones.n} | ` +
      `enlaces: ${enlaces.length} | configuraciones: ${configuraciones.n}`
  );
};

generar()
  .then(() => sequelize.close())
  .catch(async (error: Error) => {
    console.error('Error generando la semilla:', error.message);
    await sequelize.close();
    process.exit(1);
  });
