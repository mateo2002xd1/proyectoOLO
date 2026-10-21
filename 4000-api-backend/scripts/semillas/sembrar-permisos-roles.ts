/**
 * Siembra el catálogo de permisos y las asignaciones por rol.
 *
 * **Reconcilia, no solo añade.** La versión anterior insertaba lo que faltaba y nunca
 * comprobaba lo que sobraba, así que la base se desvió de su propia declaración: el
 * script afirmaba que el Editor no tenía `access_dashboard` y en la base lo tenía. Un
 * sembrador que no puede corregir no sirve para saber en qué estado está el sistema.
 *
 * Aquí el catálogo (`src/shared/catalogo-permisos.ts`) es la autoridad: lo que no está
 * en él se borra de `permisos`, y las asignaciones de cada rol se ajustan a lo declarado
 * abajo. Correrlo dos veces da el mismo resultado.
 *
 * Uso: `npm run sembrar:permisos`
 */
import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import {
  CATALOGO_PERMISOS,
  CLAVES_DEL_CATALOGO,
  SECCIONES_POR_AMBITO,
  claveDeSeccion,
  partesDeClaveDeSeccion,
} from '../../src/shared/catalogo-permisos';

/** Las claves `editar.*` de las secciones fijas de un ámbito. */
const clavesDeEdicion = (ambito: 'sitio' | 'intranet') =>
  SECCIONES_POR_AMBITO[ambito].map((slug) => claveDeSeccion(ambito, slug));

/**
 * Qué recibe cada rol.
 *
 * Un rol que no aparece aquí no se toca: puede haberse creado desde el panel para un
 * caso concreto, y este script no tiene por qué opinar sobre él.
 *
 * `Superadmin` se lista completo aunque `requirePermission` lo deje pasar por bypass:
 * así el panel enseña sus interruptores encendidos y no parece que le falte nada.
 */
const PERMISOS_POR_ROL: Record<string, string[]> = {
  Superadmin: CLAVES_DEL_CATALOGO,
  Administrador: CLAVES_DEL_CATALOGO,

  // El Editor edita en las dos aplicaciones y envía a revisión, pero no aprueba, no
  // toca cuentas y no lee la bitácora — que guarda la IP de sus compañeros.
  // Ya no necesita `acceso.panel` porque el editor visual vive fuera de /admin en /edit.
  Editor: [
    'acceso.sitio',
    'acceso.intranet',
    ...clavesDeEdicion('sitio'),
    ...clavesDeEdicion('intranet'),
  ],

  // Dirección y subdirección entran a la intranet y leen. No editan: así lo fija
  // `paginas.policies.ts`, y el catálogo no debe contradecirlo. Comparten un único
  // rol —tenían los mismos permisos siendo dos filas separadas, y se fundieron en
  // una para que no se pudieran editar por separado desde el panel. Es también el
  // único rol de solo-lectura de la intranet: `visitante_interno` cubría el mismo
  // caso con una segunda fila y se retiró para no duplicarlo.
  'Director/Subdirector': ['acceso.intranet'],
};

const ROLES_BASE = [
  { nombre: 'Superadmin', descripcion: 'Control total del sistema y acceso a todas las configuraciones', es_sistema: true },
  { nombre: 'Administrador', descripcion: 'Gestión de contenidos, usuarios, roles y autorizaciones', es_sistema: true },
  { nombre: 'Editor', descripcion: 'Edición y redacción de contenidos para revisión', es_sistema: true },
  { nombre: 'Director/Subdirector', descripcion: 'Consulta ejecutiva de la intranet: dirección y subdirección', es_sistema: true },
];

/** Ejecuta una consulta SELECT con reemplazos y devuelve sus filas. */
const consultar = async <T>(
  sql: string,
  replacements: Record<string, unknown> = {}
): Promise<T[]> =>
  (await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
    logging: false,
  })) as T[];

/** Crea los roles base, reconcilia `permisos` con el catálogo y ajusta lo que tiene cada rol. */
const sembrar = async (): Promise<void> => {
  await sequelize.authenticate();

  // 0. Alta de roles base si no existen
  console.log('\n=== Roles del sistema ===\n');
  for (const rol of ROLES_BASE) {
    const [existe] = await consultar<{ id: string }>(
      'SELECT id FROM roles WHERE nombre = :nombre LIMIT 1',
      { nombre: rol.nombre }
    );
    if (!existe) {
      await sequelize.query(
        `INSERT INTO roles (id, nombre, descripcion, es_sistema, created_at, updated_at)
         VALUES (gen_random_uuid(), :nombre, :descripcion, :es_sistema, now(), now())`,
        { replacements: rol, logging: false }
      );
      console.log(`  [CREADO]  ${rol.nombre}`);
    } else {
      await sequelize.query(
        `UPDATE roles SET es_sistema = true WHERE nombre = :nombre`,
        { replacements: { nombre: rol.nombre }, logging: false }
      );
    }
  }

  console.log('\n=== Catálogo de permisos ===\n');

  // 1. Alta de lo que falta
  for (const permiso of CATALOGO_PERMISOS) {
    const [existe] = await consultar<{ id: string }>(
      'SELECT id FROM permisos WHERE clave = :clave LIMIT 1',
      { clave: permiso.clave }
    );
    if (existe) continue;
    await sequelize.query(
      `INSERT INTO permisos (id, clave, created_at, updated_at)
       VALUES (gen_random_uuid(), :clave, now(), now())`,
      { replacements: { clave: permiso.clave }, logging: false }
    );
    console.log(`  [CREADO]  ${permiso.clave}`);
  }

  // 2. Baja de lo que sobra. Es la mitad que faltaba: sin esto, una clave retirada del
  //    catálogo seguía viva en la base y el panel la seguía ofreciendo.
  //
  //    Con una excepción que hay que respetar: las secciones creadas desde el editor.
  //    Su clave `editar.{ambito}.{slug}` no puede estar en el catálogo —nadie la
  //    escribió en código— y sin esta salvaguarda correr el sembrador borraba el
  //    permiso de todas ellas, y con él (por el DELETE de `roles_permisos` de abajo)
  //    las concesiones. Se conserva mientras su página siga existiendo; si la página
  //    se borró, la clave sí sobra y se retira como cualquier otra.
  const paginasVivas = await consultar<{ ambito: string; slug: string }>(
    'SELECT ambito, slug FROM paginas'
  );
  const seccionesVivas = new Set(
    paginasVivas.map(({ ambito, slug }) => claveDeSeccion(ambito as 'sitio' | 'intranet', slug))
  );

  const esDeSeccionViva = (clave: string) =>
    partesDeClaveDeSeccion(clave) !== null && seccionesVivas.has(clave);

  const sobrantes = (
    await consultar<{ clave: string }>('SELECT clave FROM permisos WHERE clave NOT IN (:claves)', {
      claves: CLAVES_DEL_CATALOGO,
    })
  ).filter(({ clave }) => !esDeSeccionViva(clave));

  for (const { clave } of sobrantes) {
    await sequelize.query(
      `DELETE FROM roles_permisos WHERE permiso_id IN (SELECT id FROM permisos WHERE clave = :clave)`,
      { replacements: { clave }, logging: false }
    );
    await sequelize.query('DELETE FROM permisos WHERE clave = :clave', {
      replacements: { clave },
      logging: false,
    });
    console.log(`  [RETIRADO] ${clave} — no está en el catálogo`);
  }

  // 3. Asignaciones por rol
  console.log('\n=== Asignaciones por rol ===');
  const roles = await consultar<{ id: string; nombre: string }>(
    'SELECT id, nombre FROM roles ORDER BY nombre'
  );

  for (const { id: rolId, nombre } of roles) {
    const esperados = PERMISOS_POR_ROL[nombre];
    if (!esperados) {
      console.log(`\n  [OMITIDO] ${nombre} — sin reglas declaradas, no se toca`);
      continue;
    }

    const actuales = await consultar<{ clave: string }>(
      `SELECT p.clave FROM roles_permisos rp
         JOIN permisos p ON p.id = rp.permiso_id
        WHERE rp.rol_id = :rolId`,
      { rolId }
    );
    const claveActual = new Set(actuales.map((f) => f.clave));

    const porAsignar = esperados.filter((c) => !claveActual.has(c));
    // Las secciones creadas desde el editor no se revocan: `PERMISOS_POR_ROL` no puede
    // nombrarlas y tratarlas como sobrantes dejaría sin acceso, cada vez que se corre
    // el sembrador, a quien creó una sección — incluido el rol que la estrenó.
    const porRevocar = [...claveActual].filter(
      (c) => !esperados.includes(c) && !esDeSeccionViva(c)
    );

    console.log(`\n  [${nombre}]`);
    if (porAsignar.length === 0 && porRevocar.length === 0) {
      console.log('    sin cambios');
    }

    for (const clave of porAsignar) {
      await sequelize.query(
        `INSERT INTO roles_permisos (rol_id, permiso_id)
         SELECT :rolId, id FROM permisos WHERE clave = :clave
         ON CONFLICT DO NOTHING`,
        { replacements: { rolId, clave }, logging: false }
      );
      console.log(`    + ${clave}`);
    }

    for (const clave of porRevocar) {
      await sequelize.query(
        `DELETE FROM roles_permisos
          WHERE rol_id = :rolId
            AND permiso_id IN (SELECT id FROM permisos WHERE clave = :clave)`,
        { replacements: { rolId, clave }, logging: false }
      );
      console.log(`    - ${clave}`);
    }
  }

  console.log('\n=== Listo ===\n');
};

sembrar()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
