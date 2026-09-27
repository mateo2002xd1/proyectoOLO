import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
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
const COLUMNAS_A_NULL = new Set([
  'creado_por',
  'revisor_id',
  'publicado_por',
  'actualizado_por',
  'autor_id', // contenidos.autor_id
  'revisado_por', // contenidos.revisado_por
  'aprobado_por', // marca_versiones.aprobado_por
]);

const SALIDA = path.join(__dirname, '..', '..', 'seed', 'contenido-inicial.sql');

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

interface OpcionesVolcado {
  tag: string;
  /** Columnas que no se incluyen en el INSERT (p. ej. una referencia circular). */
  omitir?: string[];
  /** Cláusula WHERE completa, si solo interesa parte de la tabla. */
  filtro?: string;
}

/** Los INSERT de una tabla, con las columnas omitidas fuera y un filtro opcional. */
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

/** El comentario que encabeza el archivo generado, con la fecha. */
const cabecera = (fecha: string) => `-- Contenido inicial del OLO. GENERADO, no editar a mano.
--
-- Qué lleva: las páginas del sitio y de la intranet con su versión PUBLICADA, el árbol
-- de secciones, los contenidos (estudios/informes/banners), la identidad visual
-- (marca_versiones) y las políticas de privacidad vigentes. Es lo que hace falta para
-- que el portal cargue completo, con contenido real, en una instalación nueva.
--
-- Qué NO lleva, a propósito:
--   * usuarios, auditoria_cambios, auditoria_accesos y preguntas_seguridad -> datos
--     personales o historial de actividad de la instalación de origen (Ley 1581). Las
--     columnas que apuntaban a un usuario (creado_por, revisor_id, publicado_por,
--     actualizado_por, autor_id, revisado_por, aprobado_por) se vuelcan como NULL: son
--     trazabilidad, y la de otra instalación no significa nada. Una instalación nueva
--     nace sin usuarios; el único administrador se crea con \`./deploy.sh crear-admin\`.
--   * roles, permisos y roles_permisos -> los siembran las migraciones 012, 016 y 019, y
--     el reconciliador \`npm run sembrar:permisos\` (corre solo en cada deploy).
--   * archivos, contenidos_archivos y _obsoleto_attachment -> metadatos de subidas con
--     rutas de disco que no persisten en el contenedor de origen ni viajan con este
--     archivo. Si \`marca_versiones.tokens\` referencia un logotipo por su archivo_id,
--     esa referencia llega rota hasta que alguien lo vuelva a subir en la instalación
--     nueva -- no es un bug de este script, es que los archivos no viajan.
--   * consentimientos, respaldos, notificaciones y tableros_bi -> historial operativo o
--     datos de prueba de la instalación de origen, no contenido del sitio.
--   * las versiones de página y los contenidos en borrador, en revisión, rechazados o
--     archivados -> son trabajo a medias de la instalación de origen. Solo viaja lo
--     publicado, que es lo que se ve.
--
-- Se aplica DESPUÉS de las migraciones, con \`./deploy.sh sembrar\`. Es idempotente, así
-- que ejecutarlo dos veces no duplica nada.
--
-- Regenerar desde una base al día:  npm run seed:generar
-- Generado el ${fecha}
`;

/** Escribe `seed/contenido-inicial.sql` con las páginas y versiones de la base actual. */
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
  partes.push('\n-- 4. Configuraciones (identidad visual)\n', configuraciones.sql);

  // `secciones.padre_id` es autorreferenciada (ON DELETE RESTRICT): ordenar por `nivel`
  // (1 a 3) garantiza que cada sección padre se inserte antes que sus hijas.
  const secciones = await volcar('secciones', { tag, filtro: ' ORDER BY nivel ASC' });
  partes.push('\n-- 5. Secciones (árbol de navegación, padres antes que hijas)\n', secciones.sql);

  // `contenidos.seccion_id` referencia `secciones`: va después. Mismo criterio que
  // `paginas_versiones`: solo lo publicado, no trabajo a medias de la instalación de
  // origen.
  const contenidos = await volcar('contenidos', { tag, filtro: " WHERE estado = 'publicado'" });
  partes.push('\n-- 6. Contenidos publicados (estudios, informes, estadísticas, banners)\n', contenidos.sql);

  const marca = await volcar('marca_versiones', { tag });
  partes.push('\n-- 7. Identidad visual (marca_versiones)\n', marca.sql);

  const politicas = await volcar('politicas_privacidad', { tag });
  partes.push('\n-- 8. Políticas de privacidad vigentes\n', politicas.sql, '\nCOMMIT;\n');

  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, partes.join(''), 'utf8');

  const kb = (fs.statSync(SALIDA).size / 1024).toFixed(0);
  console.log(`Generado seed/contenido-inicial.sql (${kb} KB)`);
  console.log(
    `  páginas: ${paginas.n} | versiones publicadas: ${versiones.n} | ` +
      `enlaces: ${enlaces.length} | configuraciones: ${configuraciones.n} | ` +
      `secciones: ${secciones.n} | contenidos: ${contenidos.n} | ` +
      `marca_versiones: ${marca.n} | politicas_privacidad: ${politicas.n}`
  );
};

generar()
  .then(() => sequelize.close())
  .catch(async (error: Error) => {
    console.error('Error generando la semilla:', error.message);
    await sequelize.close();
    process.exit(1);
  });
