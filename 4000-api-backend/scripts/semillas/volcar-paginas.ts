import 'dotenv/config';
import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../src/config/database';
import { etiquetaLibre, literal, volcar } from './volcado-sql';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Escribe `seed/paginas-volcado.sql` con las páginas de la base a la que apunte
 * `DATABASE_URL`, para llevarlas a un servidor pasando por GitHub.
 *
 * Es el reemplazo de leer el origen en vivo (`ORIGEN_DATABASE_URL`): el servidor no
 * necesita alcanzar Neon, solo el archivo que trae el `git pull`.
 *
 * Lo carga `./docker/deploy.sh importar-paginas --desde-archivo`, que lo mete en la misma
 * transacción que usa con el origen en vivo. Por eso el archivo no lleva BEGIN/COMMIT y sí
 * lo que ese flujo espera: los permisos de edición de cada página, por nombre de rol.
 *
 * Dos modos:
 *   - **inicio limpio** (por defecto): lo que se ve hoy, como si el servidor empezara de
 *     cero. Cada página con versión publicada viaja con SOLO esa versión, renumerada como
 *     la 1, y con 0 visitas. No hay historial, ni respaldos, ni borradores: lo primero que
 *     se edite en el servidor será la versión 2.
 *   - **`--con-historial`**: todas las páginas con todas sus versiones (borradores y en
 *     revisión incluidos) y sus visitas.
 *
 * No lleva correos ni cuentas. Las columnas que apuntaban a un usuario (creado_por,
 * revisor_id, publicado_por) salen como NULL: lo que va a GitHub no puede llevar datos
 * personales (Ley 1581), y el costo es que en el servidor esas versiones quedan sin
 * autor. Con el origen en vivo la autoría sí se conserva, porque allí se traduce por
 * correo.
 *
 * Uso:  npm run paginas:volcar [-- --con-historial]
 */

const SALIDA = path.join(__dirname, '..', '..', 'seed', 'paginas-volcado.sql');

/** GitHub avisa desde los 50 MB y rechaza desde los 100 MB. */
const AVISO_MB = 50;

/**
 * Páginas que existen en desarrollo pero no deben llegar a producción aunque tengan una
 * versión publicada: pruebas del equipo. Una página sin versión publicada ya queda fuera
 * sola en el modo de inicio limpio, no hace falta listarla aquí.
 */
const EXCLUIDAS: ReadonlyArray<{ ambito: 'sitio' | 'intranet'; slug: string }> = [
  { ambito: 'intranet', slug: 'prueba' },
];

type Modo = 'inicio-limpio' | 'historial';

const cabecera = (modo: Modo, fecha: string, paginas: number, versiones: number) => {
  const queLleva =
    modo === 'inicio-limpio'
      ? `Modo INICIO LIMPIO: cada página con versión publicada, con SOLO esa versión
-- renumerada como la 1 (sin historial, borradores ni respaldos), con 0 visitas, y los
-- permisos de edición de esas páginas por nombre de rol. Lo primero que se edite en el
-- servidor será la versión 2.`
      : `Modo CON HISTORIAL: \`paginas\` y \`paginas_versiones\` (sitio e intranet) con TODAS sus
-- versiones —borradores y en revisión incluidos— y sus visitas, y los permisos de edición
-- de cada página por nombre de rol.`;
  return `-- Páginas del OLO para llevar a un servidor. GENERADO, no editar a mano.
--
-- ${queLleva}
--
-- Qué NO lleva: usuarios ni correos. Las columnas que apuntaban a una cuenta (creado_por,
-- revisor_id, publicado_por) van en NULL, así que en el servidor esas versiones quedan
-- sin autor. Las visitas de una página que el servidor ya tenía las conserva el servidor.
--
-- No se aplica con psql: lo carga \`./docker/deploy.sh importar-paginas --desde-archivo\`,
-- que lo envuelve en una transacción con los pasos de antes y después. Suelto fallaría
-- (usa tablas temporales que crea ese paso).
--
-- Regenerar desde la base de desarrollo:  ./docker/deploy.sh exportar-paginas
-- Generado el ${fecha}
-- modo: ${modo}
-- conteo: paginas=${paginas} paginas_versiones=${versiones}
`;
};

/** Falla la carga entera si no entraron todas las filas que se volcaron. */
const comprobacion = (paginas: number, versiones: number) => `
-- Que no falte nada: si la cuenta no cuadra, se deshace toda la importación.
DO $$
DECLARE
  p bigint;
  v bigint;
BEGIN
  SELECT count(*) INTO p FROM public.paginas;
  SELECT count(*) INTO v FROM public.paginas_versiones;
  IF p <> ${paginas} OR v <> ${versiones} THEN
    RAISE EXCEPTION 'El volcado traía ${paginas} páginas y ${versiones} versiones, pero entraron % y %. No se importó nada.', p, v;
  END IF;
END $$;
`;

/** Quién podía editar cada página en el origen, por nombre de rol. */
const permisosDeEdicion = async (
  tag: string,
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

  const valores = filas
    .map((f) => `  (${literal(f.clave, tag, false)}, ${literal(f.rol, tag, false)})`)
    .join(',\n');
  return {
    sql: `INSERT INTO pg_temp.origen_permisos_paginas (clave, rol) VALUES\n${valores};\n`,
    n: filas.length,
  };
};

const generar = async (modo: Modo): Promise<void> => {
  await sequelize.authenticate();

  // Qué páginas viajan. En el modo limpio, solo las que tienen algo publicado y no son de
  // pruebas; con historial, todas. Los ámbitos y slugs de EXCLUIDAS son constantes del
  // código, no entrada de nadie: se interpolan sin parámetros.
  const noExcluidas = EXCLUIDAS.map((e) => `NOT (ambito = '${e.ambito}' AND slug = '${e.slug}')`).join(' AND ');
  const condicionPaginas = modo === 'inicio-limpio' ? `version_publicada_id IS NOT NULL AND ${noExcluidas}` : 'TRUE';

  // Una sola foto de la base: si alguien guarda una versión a mitad del volcado, `paginas`
  // no puede apuntar a una versión que `paginas_versiones` todavía no trae.
  const { partes, paginas, versiones, permisos } = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
    async (transaccion) => {
      const muestra = JSON.stringify(
        await sequelize.query('SELECT contenido FROM paginas_versiones', {
          type: QueryTypes.SELECT,
          transaction: transaccion,
        })
      );
      const tag = etiquetaLibre(muestra);

      const p = await volcar('paginas', {
        tag,
        filtro: ` WHERE ${condicionPaginas} ORDER BY ambito, slug`,
        transaccion,
        fijar: modo === 'inicio-limpio' ? { visitas: 0 } : {},
      });

      const v = await volcar('paginas_versiones', {
        tag,
        transaccion,
        ...(modo === 'inicio-limpio'
          ? {
              // Solo la versión que cada página publica hoy, como la primera.
              filtro: ` WHERE id IN (SELECT version_publicada_id FROM paginas WHERE ${condicionPaginas}) ORDER BY pagina_id`,
              fijar: { numero_version: 1, comentario_cambios: 'Versión inicial' },
            }
          : { filtro: ' ORDER BY pagina_id, numero_version' }),
      });

      const perm = await permisosDeEdicion(tag, transaccion, condicionPaginas);

      return {
        paginas: p.n,
        versiones: v.n,
        permisos: perm.n,
        // `paginas.version_publicada_id` apunta a una versión que se inserta después: la
        // llave es DEFERRABLE INITIALLY DEFERRED y se comprueba al confirmar.
        partes: [
          '\n-- 1. Permisos de edición del origen (los lee el paso de después)\n',
          perm.sql,
          '\n-- 2. Páginas\n',
          p.sql,
          '\n-- 3. Versiones\n',
          v.sql,
        ],
      };
    }
  );

  if (paginas === 0) {
    throw new Error('No hay páginas que volcar: no se escribe un volcado vacío que borraría las del servidor.');
  }

  const contenido = [
    cabecera(modo, new Date().toISOString(), paginas, versiones),
    ...partes,
    comprobacion(paginas, versiones),
  ].join('');

  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, contenido, 'utf8');

  const mb = fs.statSync(SALIDA).size / 1024 / 1024;
  console.log(`Generado seed/paginas-volcado.sql (${mb.toFixed(1)} MB), modo ${modo}`);
  console.log(`  páginas: ${paginas} | versiones: ${versiones} | permisos de edición: ${permisos}`);
  if (mb >= AVISO_MB) {
    console.warn(`AVISO: pesa ${mb.toFixed(0)} MB y GitHub rechaza archivos de 100 MB.`);
  }
};

const argumentos = process.argv.slice(2);
const desconocido = argumentos.find((a) => a !== '--con-historial');
if (desconocido) {
  console.error(`Opción desconocida: ${desconocido}. Uso: npm run paginas:volcar [-- --con-historial]`);
  process.exit(1);
}

generar(argumentos.includes('--con-historial') ? 'historial' : 'inicio-limpio')
  .then(() => sequelize.close())
  .catch(async (error: Error) => {
    console.error('Error generando el volcado de páginas:', error.message);
    await sequelize.close();
    process.exit(1);
  });
