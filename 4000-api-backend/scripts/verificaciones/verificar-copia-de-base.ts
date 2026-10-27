import 'dotenv/config';
import { QueryTypes, Sequelize } from 'sequelize';
import sequelize from '../../src/config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Comprueba que lo cargado en una base de DESTINO coincide con la base de ORIGEN
 * (`DATABASE_URL`, Neon): tabla por tabla, no solo el número de filas sino un hash de todas
 * las filas.
 *
 * Qué compara, de `seed/base-datos-*.sql` (el que tenga la fecha más reciente):
 *   - Cada tabla general (todas menos las páginas): mismas filas, byte a byte, salvo las
 *     columnas que apuntaban a una cuenta, que viajan vacías a propósito.
 *   - Las páginas: cada página publicada en el origen está en el destino, con el mismo
 *     título y el MISMO contenido, como versión 1, publicada y con 0 visitas.
 *   - Que las tablas que no viajan (cuentas...) no cambiaron.
 *
 * Solo lee. Para probar, restaura la copia en una base desechable (ver
 * `docs/6-auditoria.md`, sesión del 26-10-2026) y apunta `DESTINO_DATABASE_URL` a ella.
 *
 * Uso:  DESTINO_DATABASE_URL=postgres://... npm run base:verificar
 */

const destinoUrl = process.env.DESTINO_DATABASE_URL;
if (!destinoUrl) {
  console.error('Falta DESTINO_DATABASE_URL: la base donde se cargó la copia.');
  process.exit(1);
}
if (destinoUrl === process.env.DATABASE_URL) {
  console.error('DESTINO_DATABASE_URL es la misma base de origen: no hay nada que comparar.');
  process.exit(1);
}

// La misma zona horaria en las dos conexiones, o el texto de un timestamptz diferiría.
const destino = new Sequelize(destinoUrl, { dialect: 'postgres', logging: false, timezone: '+00:00' });

const carpeta = path.join(__dirname, '..', '..', 'seed');
const archivo = fs
  .readdirSync(carpeta)
  .filter((f) => /^base-datos-\d{4}-\d{2}-\d{2}\.sql$/.test(f))
  .sort()
  .pop();
if (!archivo) {
  console.error('No hay seed/base-datos-*.sql.');
  process.exit(1);
}
const cabecera = fs.readFileSync(path.join(carpeta, archivo), 'utf8').split('\n').slice(0, 80).join('\n');
const conteo = new Map<string, number>(
  [...cabecera.matchAll(/^-- conteo: ([a-z_]+)=(\d+)$/gm)].map((m) => [m[1], Number(m[2])] as [string, number])
);

let fallos = 0;
const mal = (texto: string): void => {
  fallos += 1;
  console.log(`  ✗ ${texto}`);
};

/** Las columnas que se comparan de una tabla: no generadas y que no apunten a una cuenta. */
const columnasComparables = async (db: Sequelize, tabla: string): Promise<string[]> => {
  const filas = await db.query<{ column_name: string }>(
    `SELECT c.column_name FROM information_schema.columns c
      WHERE c.table_schema = 'public' AND c.table_name = :tabla AND c.is_generated = 'NEVER'
        AND NOT EXISTS (
          SELECT 1 FROM pg_constraint con
            JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY (con.conkey)
           WHERE con.contype = 'f' AND con.confrelid = 'public.usuarios'::regclass
             AND con.conrelid = format('public.%I', c.table_name)::regclass AND a.attname = c.column_name)
      ORDER BY c.ordinal_position`,
    { type: QueryTypes.SELECT, replacements: { tabla } }
  );
  return filas.map((f) => f.column_name);
};

/** Cuántas filas y un hash de todas ellas (cada fila como texto, ordenadas). */
const huella = async (db: Sequelize, tabla: string, columnas: string[]): Promise<{ n: number; hash: string }> => {
  // La copia corrige las rutas guardadas desde Windows (`uploads\x` -> `uploads/x`): se compara ya corregida.
  const expresion = (c: string) => (tabla === 'archivos' && c === 'ruta_relativa' ? `replace("${c}", chr(92), '/')` : `"${c}"`);
  const fila = 'ROW(' + columnas.map(expresion).join(', ') + ')::text';
  const [r] = await db.query<{ n: string; hash: string }>(
    `SELECT count(*)::text AS n, md5(coalesce(string_agg(r, E'\\n' ORDER BY r), '')) AS hash
       FROM (SELECT ${fila} AS r FROM "${tabla}") x`,
    { type: QueryTypes.SELECT }
  );
  return { n: Number(r.n), hash: r.hash };
};

const verificar = async (): Promise<void> => {
  await sequelize.authenticate();
  await destino.authenticate();
  console.log(`Copia: seed/${archivo}  (${conteo.size} tablas en la cabecera)\n`);

  console.log('Tablas generales (origen = Neon, destino = la copia cargada):');
  for (const [tabla] of conteo) {
    if (tabla === 'paginas' || tabla === 'paginas_versiones') continue;
    const columnas = await columnasComparables(sequelize, tabla);
    const colsDestino = await columnasComparables(destino, tabla);
    if (columnas.join() !== colsDestino.join()) {
      mal(`${tabla}: las columnas difieren entre origen y destino (¿faltan migraciones en el destino?)`);
      continue;
    }
    const o = await huella(sequelize, tabla, columnas);
    const d = await huella(destino, tabla, columnas);
    const igual = o.n === d.n && o.hash === d.hash && o.n === conteo.get(tabla);
    console.log(`  ${igual ? '✓' : '✗'} ${tabla.padEnd(34)} ${String(o.n).padStart(6)} filas | destino ${String(d.n).padStart(6)} | hash ${igual ? 'igual' : 'DISTINTO'}`);
    if (!igual) fallos += 1;
  }

  console.log('\nPáginas (cada publicada en el origen debe estar en el destino como versión 1):');
  type Pagina = { ambito: string; slug: string; titulo: string; hash: string; numero_version?: number; estado?: string; visitas?: number };
  const sql = (publicada: boolean) => `
    SELECT p.ambito, p.slug, p.titulo, md5(v.contenido::text) AS hash,
           v.numero_version, v.estado, p.visitas
      FROM paginas p ${publicada ? 'JOIN' : 'LEFT JOIN'} paginas_versiones v ON v.id = p.version_publicada_id
     ORDER BY p.ambito, p.slug`;
  const deOrigen = (await sequelize.query<Pagina>(sql(true), { type: QueryTypes.SELECT }));
  const deDestino = await destino.query<Pagina>(sql(false), { type: QueryTypes.SELECT });
  const porClave = (l: Pagina[]) => new Map(l.map((p) => [`${p.ambito}/${p.slug}`, p]));
  const mO = porClave(deOrigen);
  const mD = porClave(deDestino);

  let bien = 0;
  for (const [clave, d] of mD) {
    const o = mO.get(clave);
    if (!o) { mal(`${clave}: está en el destino y no tiene versión publicada en el origen`); continue; }
    const problemas: string[] = [];
    if (o.titulo !== d.titulo) problemas.push('título distinto');
    if (o.hash !== d.hash) problemas.push('contenido distinto');
    if (Number(d.numero_version) !== 1) problemas.push(`versión ${d.numero_version}, no 1`);
    if (d.estado !== 'publicado') problemas.push(`estado ${d.estado}`);
    if (Number(d.visitas) !== 0 && clave !== 'sitio/inicio') problemas.push(`${d.visitas} visitas`);
    if (problemas.length) mal(`${clave}: ${problemas.join(', ')}`);
    else bien += 1;
  }
  console.log(`  ✓ ${bien} de ${mD.size} páginas del destino coinciden con el origen (contenido idéntico, versión 1, publicada)`);
  const sinLlegar = [...mO.keys()].filter((k) => !mD.has(k));
  console.log(`  · publicadas en el origen que NO llegaron (esperado solo las excluidas a propósito): ${sinLlegar.join(', ') || 'ninguna'}`);
  const esperadas = conteo.get('paginas') ?? -1;
  if (mD.size < esperadas) mal(`la cabecera dice ${esperadas} páginas y el destino tiene ${mD.size}`);

  console.log('\nVersiones por página en el destino:');
  const [v] = await destino.query<{ total: string; max: string }>(
    'SELECT count(*)::text AS total, max(numero_version)::text AS max FROM paginas_versiones',
    { type: QueryTypes.SELECT }
  );
  console.log(`  ${v.total} versiones, la más alta es la ${v.max}`);
  if (Number(v.max) !== 1) mal('hay versiones por encima de la 1');

  console.log(fallos === 0 ? '\nTODO COINCIDE.' : `\n${fallos} diferencia(s).`);
};

verificar()
  .then(async () => {
    await sequelize.close();
    await destino.close();
    process.exit(fallos === 0 ? 0 : 1);
  })
  .catch(async (error: Error) => {
    console.error('Error verificando:', error.message);
    await sequelize.close().catch(() => undefined);
    await destino.close().catch(() => undefined);
    process.exit(1);
  });
