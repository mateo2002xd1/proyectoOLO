import 'dotenv/config';
import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../src/config/database';
import { ColisionDeDelimitador, literal, tablasDeLaBase, volcar } from './volcado-sql';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Escribe `seed/base-datos-AAAA-MM-DD.sql`: la copia de la base a la que apunte
 * `DATABASE_URL`, en UN solo archivo, para llevarla a un servidor pasando por GitHub.
 *
 * Lo carga `./docker/deploy.sh sembrar`, que lo mete en una transacción con los pasos de
 * antes y después de `importar-paginas`. El archivo es autónomo: vacía las tablas que trae,
 * las llena, comprueba que entró cada fila y que no se tocó ninguna cuenta.
 *
 * Qué NO viaja, y por qué:
 *   - `usuarios`, `preguntas_seguridad`, `auditoria_cambios`: cuentas, hashes de contraseña,
 *     correos, IP y navegador de cada persona. Esto va a GitHub (Ley 1581); el servidor
 *     conserva sus cuentas y su bitácora. Toda columna que apunte a una cuenta
 *     (`creado_por`, `subido_por`…) sale NULL: en el servidor esas filas quedan sin autor.
 *   - `bloqueos_edicion`, `subidas_pendientes`, `migraciones_aplicadas`: estado de sesiones
 *     de la base de origen y descripción de SU esquema.
 *   - `roles`, `permisos`, `roles_permisos`: los reconcilia el código en cada despliegue
 *     (`sembrar:permisos`). Reemplazarlos dejaría a las cuentas del servidor sin rol. Solo
 *     viaja quién podía editar cada página, por NOMBRE de rol.
 *
 * Las páginas van en «inicio limpio»: cada una con versión publicada viaja con SOLO esa
 * versión, renumerada como la 1 (sin historial, borradores ni respaldos), y con 0 visitas.
 * Lo primero que se edite en el servidor será la versión 2.
 *
 * Cada volcado borra el anterior: en `seed/` queda un solo `base-datos-*.sql`.
 *
 * Uso:  npm run base:volcar
 */

const CARPETA = path.join(__dirname, '..', '..', 'seed');

/** GitHub avisa desde los 50 MB y rechaza desde los 100 MB. */
const AVISO_MB = 50;

/** Tablas con datos de personas o de sesiones de la base de origen: no viajan. */
const NO_VIAJAN = [
  'usuarios',
  'preguntas_seguridad',
  'auditoria_cambios',
  'bloqueos_edicion',
  'subidas_pendientes',
  'migraciones_aplicadas',
];

/** Catálogo que reconcilia el código en cada despliegue: no viaja. */
const LO_DEFINE_EL_CODIGO = ['roles', 'permisos', 'roles_permisos'];

/** Las dos tablas de páginas van aparte: filtradas y renumeradas. */
const PAGINAS = ['paginas', 'paginas_versiones'];

/**
 * Páginas que existen en desarrollo pero no deben llegar a producción aunque tengan una
 * versión publicada: pruebas del equipo. Una página sin versión publicada ya queda fuera
 * sola. Los valores son constantes del código, no entrada de nadie: se interpolan.
 */
const EXCLUIDAS: ReadonlyArray<{ ambito: 'sitio' | 'intranet'; slug: string }> = [
  { ambito: 'intranet', slug: 'prueba' },
];

/**
 * Etiquetas del literal con `$`, de la más corta a la más larga: se usa la primera que no
 * aparece en ningún dato (cada letra de la etiqueta se repite en cada valor del archivo).
 */
const ETIQUETAS = ['o', 'ol', 'olo', 'olo_base_de_datos'];
let TAG = ETIQUETAS[0];

/** La fecha de hoy en la zona del equipo, `AAAA-MM-DD`. */
const hoy = (): string => new Date().toLocaleDateString('en-CA');

const cabecera = (
  fecha: string,
  incluidas: string[],
  conteo: Map<string, number>
): string => `-- Copia de la base de datos del OLO, ${fecha}. GENERADO, no editar a mano.
--
-- Qué lleva: el contenido y los datos del observatorio de TODAS las tablas menos las de
-- abajo, y las páginas en «inicio limpio»: cada una con versión publicada, con SOLO esa
-- versión, renumerada como la 1, sin historial ni visitas.
--
-- Qué NO lleva, a propósito:
--   * ${NO_VIAJAN.join(', ')}
--     -> cuentas, contraseñas, correos, IP y bitácora (Ley 1581), estado de sesiones del
--     origen y descripción de su esquema. El servidor conserva las suyas. Toda columna que
--     apuntaba a una cuenta va en NULL: esas filas quedan sin autor.
--   * ${LO_DEFINE_EL_CODIGO.join(', ')}
--     -> los reconcilia el código en cada despliegue. Solo viaja quién podía editar cada
--     página, por nombre de rol.
--   * Los archivos subidos (imágenes, PDF, Excel): viajan en filesystem/, no aquí.
--
-- No se aplica con psql: lo carga \`./docker/deploy.sh sembrar\`, que lo envuelve en una
-- transacción con los pasos de antes y después (usa tablas temporales que crea ese paso).
-- Vacía las tablas que trae; no toca \`usuarios\` ni lo que no está en esta lista.
--
-- Regenerar desde la base de desarrollo:  ./docker/deploy.sh exportar-base
-- Generado el ${new Date().toISOString()}
-- modo: inicio-limpio
-- tablas: ${incluidas.join(' ')}
${[...conteo].map(([t, n]) => `-- conteo: ${t}=${n}`).join('\n')}
`;

/** Quién podía editar cada página en el origen, por nombre de rol. */
const permisosDeEdicion = async (
  transaccion: Transaction,
  condicionPaginas: string
): Promise<{ sql: string; n: number }> => {
  const filas = await sequelize.query<{ clave: string; rol: string }>(
    `SELECT p.clave, r.nombre AS rol
       FROM permisos p
       JOIN roles_permisos rp ON rp.permiso_id = p.id
       JOIN roles r ON r.id = rp.rol_id
      WHERE p.clave LIKE 'editar.%'
        AND p.clave IN (SELECT 'editar.' || ambito || '.' || slug FROM paginas WHERE ${condicionPaginas})
      ORDER BY p.clave, r.nombre`,
    { type: QueryTypes.SELECT, transaction: transaccion }
  );
  if (filas.length === 0) return { sql: '-- permisos de edición: sin filas\n', n: 0 };

  const valores = filas.map((f) => `  (${literal(f.clave, TAG)}, ${literal(f.rol, TAG)})`).join(',\n');
  return {
    sql: `INSERT INTO pg_temp.origen_permisos_paginas (clave, rol) VALUES\n${valores};\n`,
    n: filas.length,
  };
};

/** Toda columna que apunta a `usuarios`, como `tabla.columna`. Se leen del catálogo. */
const columnasHaciaCuentas = async (transaccion: Transaction): Promise<Set<string>> => {
  const filas = await sequelize.query<{ tabla: string; columna: string }>(
    `SELECT con.conrelid::regclass::text AS tabla, a.attname AS columna
       FROM pg_constraint con
       JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY (con.conkey)
      WHERE con.contype = 'f' AND con.confrelid = 'public.usuarios'::regclass
        AND con.conrelid <> 'public.usuarios'::regclass`,
    { type: QueryTypes.SELECT, transaction: transaccion }
  );
  return new Set(filas.map((f) => `${f.tabla}.${f.columna}`));
};

/** Las comprobaciones que van al final del archivo: nada falta y no se tocó ninguna cuenta. */
const comprobaciones = (conteo: Map<string, number>): string => {
  const esperado = [...conteo].map(([t, n]) => `('${t}', ${n})`).join(', ');
  return `
-- Que no falte nada: si alguna tabla no tiene las filas que se volcaron, se deshace toda la
-- importación.
DO $$
DECLARE
  esperada record;
  n bigint;
  malas text := '';
BEGIN
  FOR esperada IN SELECT * FROM (VALUES ${esperado}) AS v(tabla, filas) LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', esperada.tabla) INTO n;
    IF n <> esperada.filas THEN
      malas := malas || format(' %s (traía %s, entraron %s)', esperada.tabla, esperada.filas, n);
    END IF;
  END LOOP;
  IF malas <> '' THEN
    RAISE EXCEPTION 'El volcado no entró completo:%. No se importó nada.', malas;
  END IF;
END $$;

-- Las cuentas de este servidor no se tocan: si alguna tabla vaciada las arrastró, se deshace todo.
DO $$
DECLARE
  antes bigint;
  ahora bigint;
BEGIN
  SELECT n INTO antes FROM pg_temp.cuentas_antes;
  SELECT count(*) INTO ahora FROM public.usuarios;
  IF antes <> ahora THEN
    RAISE EXCEPTION 'Había % cuentas y quedaron %. No se importó nada.', antes, ahora;
  END IF;
END $$;

-- Rutas guardadas desde Windows (uploads\\cargas-datos\\x.xlsx): la API corre en Linux,
-- donde \\ no separa carpetas y el archivo no aparece.
UPDATE public.archivos SET ruta_relativa = replace(ruta_relativa, E'\\\\', '/')
 WHERE position(E'\\\\' in ruta_relativa) > 0;
`;
};

const generar = async (): Promise<void> => {
  await sequelize.authenticate();

  const noExcluidas = EXCLUIDAS.map((e) => `NOT (ambito = '${e.ambito}' AND slug = '${e.slug}')`).join(' AND ');
  const condicionPaginas = `version_publicada_id IS NOT NULL AND ${noExcluidas}`;

  // Una sola foto de la base: si alguien guarda algo a mitad del volcado, `paginas` no puede
  // apuntar a una versión que `paginas_versiones` todavía no trae.
  const resultado = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
    async (transaccion) => {
      const todas = await tablasDeLaBase(transaccion);
      const conocidas = new Set([...NO_VIAJAN, ...LO_DEFINE_EL_CODIGO, ...PAGINAS]);
      const generales = todas.filter((t) => !conocidas.has(t));
      const aNull = await columnasHaciaCuentas(transaccion);

      // Una tabla que desaparece sin avisar sería un volcado a medias.
      const faltantes = [...NO_VIAJAN, ...LO_DEFINE_EL_CODIGO, ...PAGINAS].filter((t) => !todas.includes(t));
      if (faltantes.length) throw new Error(`Faltan tablas que el script espera: ${faltantes.join(', ')}.`);

      const conteo = new Map<string, number>();
      const partes: string[] = [];

      const permisos = await permisosDeEdicion(transaccion, condicionPaginas);
      partes.push('\n-- Quién podía editar cada página (lo lee el paso de después)\n', permisos.sql);

      for (const tabla of generales) {
        const v = await volcar(tabla, { tag: TAG, transaccion, aNull });
        conteo.set(tabla, v.n);
        console.log(`  ${tabla.padEnd(34)} ${String(v.n).padStart(7)} filas`);
        partes.push(`\n-- ${tabla}\n`, v.sql);
      }

      // `paginas.version_publicada_id` apunta a una versión que se inserta después: la llave
      // es DEFERRABLE INITIALLY DEFERRED y se comprueba al confirmar.
      const p = await volcar('paginas', {
        tag: TAG,
        transaccion,
        aNull,
        filtro: ` WHERE ${condicionPaginas} ORDER BY ambito, slug`,
        fijar: { visitas: '0' },
      });
      conteo.set('paginas', p.n);
      partes.push('\n-- paginas (solo las publicadas, con 0 visitas)\n', p.sql);

      const v = await volcar('paginas_versiones', {
        tag: TAG,
        transaccion,
        aNull,
        // Solo la versión que cada página publica hoy, como la primera.
        filtro: ` WHERE id IN (SELECT version_publicada_id FROM paginas WHERE ${condicionPaginas}) ORDER BY pagina_id`,
        fijar: { numero_version: '1', comentario_cambios: 'Versión inicial' },
      });
      conteo.set('paginas_versiones', v.n);
      partes.push('\n-- paginas_versiones (solo la publicada, como versión 1)\n', v.sql);

      return { conteo, partes, generales, permisos: permisos.n };
    }
  );

  if ((resultado.conteo.get('paginas') ?? 0) === 0) {
    throw new Error('No hay páginas que volcar: no se escribe un volcado que borraría las del servidor.');
  }

  // Se vacían las tablas generales y se vuelven a llenar; las páginas ya las vacía el paso
  // de antes (`DELETE FROM paginas`, que arrastra sus versiones).
  const vaciar = resultado.generales.map((t) => `public."${t}"`).join(', ');
  const incluidas = [...resultado.conteo.keys()];
  const contenido = [
    cabecera(hoy(), incluidas, resultado.conteo),
    `
-- Cuántas cuentas hay antes de tocar nada (se comprueba al final).
CREATE TEMP TABLE cuentas_antes ON COMMIT DROP AS SELECT count(*)::bigint AS n FROM public.usuarios;

-- Vaciar las tablas que trae este archivo. Sin CASCADE a propósito: si otra tabla las
-- referencia y no está en la lista, falla en vez de arrastrarla.
TRUNCATE ${vaciar};

-- Las llaves foráneas se comprueban al final (las páginas y sus versiones se citan entre sí).
SET session_replication_role = replica;
`,
    ...resultado.partes,
    '\nSET session_replication_role = DEFAULT;\n',
    comprobaciones(resultado.conteo),
  ].join('');

  fs.mkdirSync(CARPETA, { recursive: true });
  const nombre = `base-datos-${hoy()}.sql`;
  // Un solo volcado a la vez: se borran los de otros días (y el mismo, si se repite).
  for (const f of fs.readdirSync(CARPETA)) {
    if (/^base-datos-\d{4}-\d{2}-\d{2}\.sql$/.test(f) && f !== nombre) fs.unlinkSync(path.join(CARPETA, f));
  }
  fs.writeFileSync(path.join(CARPETA, nombre), contenido, 'utf8');

  const mb = fs.statSync(path.join(CARPETA, nombre)).size / 1024 / 1024;
  const filas = [...resultado.conteo.values()].reduce((a, b) => a + b, 0);
  console.log(`Generado seed/${nombre} (${mb.toFixed(1)} MB)`);
  console.log(`  ${resultado.conteo.size} tablas, ${filas} filas | permisos de edición: ${resultado.permisos}`);
  console.log(`  páginas: ${resultado.conteo.get('paginas')} | versiones: ${resultado.conteo.get('paginas_versiones')}`);
  if (mb >= AVISO_MB) {
    console.warn(`AVISO: pesa ${mb.toFixed(0)} MB y GitHub rechaza archivos de 100 MB.`);
  }
};

/** Prueba cada etiqueta, de la más corta a la más larga, hasta que alguna no choque con un dato. */
const generarConLaEtiquetaMasCorta = async (): Promise<void> => {
  for (const etiqueta of ETIQUETAS) {
    TAG = etiqueta;
    try {
      await generar();
      return;
    } catch (error) {
      if (!(error instanceof ColisionDeDelimitador)) throw error;
      console.log(`  ${error.message}: se prueba con una etiqueta más larga`);
    }
  }
  throw new Error('Ninguna etiqueta sirvió: todas aparecen dentro de algún dato.');
};

generarConLaEtiquetaMasCorta()
  .then(() => sequelize.close())
  .catch(async (error: Error) => {
    console.error('Error generando la copia de la base:', error.message);
    await sequelize.close();
    process.exit(1);
  });
