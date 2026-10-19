import { QueryInterface, QueryTypes, Sequelize } from 'sequelize';

export const nombre = '046-paginas-del-sitio-en-bd';

/**
 * Deja todas las páginas del sitio en `paginas`, para que `app/(public)/` del sitio web se
 * quede con un solo comodín (`[...puckPath]`), como la intranet.
 *
 * ## Por qué
 *
 * Hasta aquí el sitio tenía una carpeta en `app/(public)/` por cada página que no cabía en
 * su comodín `[slug]`: unas porque eran vistas escritas en código (el buscador de
 * ocupaciones, las alertas de inversión, los programas sobresalientes) y otras porque
 * su URL tenía dos segmentos (`/clasificacion/cno`), que `[slug]` no admite. Añadir o
 * mover una página obligaba a desplegar.
 *
 * ## Qué hace
 *
 * 1. **Renombra `cno` y `cuoc` a `clasificacion-cno` y `clasificacion-cuoc`.** Con
 *    `[...puckPath]` el slug de una URL son sus segmentos unidos con guion, la misma
 *    regla de la intranet (`/encuestas/seguimiento-laboral` → `encuestas-seguimiento-laboral`).
 *    Así desaparece la tabla `RUTAS_PROPIAS`, que existía dos veces (en el sitio y en
 *    `extraer-textos-puck.ts`). Se renombra igual que en la `014`: **UPDATE conservando el
 *    `id`**, en la página y en su permiso, para que las versiones, las visitas y las
 *    concesiones de `roles_permisos` sigan colgando de la misma fila. También se mueve
 *    el candado de edición, si lo hay, para no dejar a nadie editando un slug que ya no
 *    existe.
 *
 * 2. **Publica como bloque de Puck las tres vistas que vivían en código:**
 *    - `clasificacion` → bloque `BuscadorOcupaciones` (página nueva).
 *    - `programas-sobresalientes` → bloque `ProgramasSobresalientes` (página nueva).
 *    - `alertas-inversion` → bloque `AlertasInversion`. Esta página **ya existía** y
 *      estaba publicada, pero no se veía nunca: la carpeta `app/(public)/alertas-inversion/`
 *      ganaba al comodín. Su versión publicada (un texto provisional) pasa a archivada,
 *      no se borra, y queda en el historial.
 *
 *    El contenido reproduce lo que pintaban las rutas, para que el día que se borren las
 *    carpetas no cambie nada a la vista. Las dos páginas nuevas estrenan su permiso
 *    `editar.sitio.{slug}`, concedido a los mismos roles que la `023`.
 *
 * ## Por qué SQL y no los casos de uso del ciclo editorial
 *
 * Los scripts de `scripts/semillas/` pasan por borrador → revisión → aprobación. Aquí no
 * se puede: los casos de uso usan sus propias transacciones y una migración no debe
 * depender de código de la app que mañana puede cambiar de firma. La versión se escribe
 * ya publicada, con `comentario_cambios` como marca: es lo que `down` usa para encontrar
 * exactamente lo que esta migración puso.
 *
 * ## Idempotente
 *
 * El runner abre una transacción pero no la propaga a estas consultas (no hay CLS), así
 * que un fallo a mitad puede dejar parte hecha. Por eso cada paso comprueba antes de
 * escribir: volver a ejecutarla termina el trabajo sin duplicar nada.
 *
 * ## Lo que NO se toca
 *
 * La bitácora: los registros viejos siguen diciendo `cno`, igual que en la `014`.
 */

const AMBITO = 'sitio';

/** Marca de las versiones que publica esta migración. Cabe en `VARCHAR(100)`. */
const COMENTARIO = 'Migración 046: la página pasa de app/(public) a la base de datos';

/** Mismos roles que `023`: los que ya editan las páginas de fábrica del sitio. */
const ROLES = ['Superadmin', 'Administrador', 'Editor'];

const RENOMBRADOS: { viejo: string; nuevo: string }[] = [
  { viejo: 'cno', nuevo: 'clasificacion-cno' },
  { viejo: 'cuoc', nuevo: 'clasificacion-cuoc' },
];

/** El espaciado neutro de `cajaPorDefecto` (`@olo/blocks-renderer`): no envuelve el bloque. */
const CAJA = {
  interiorY: 'ninguno',
  interiorX: 'ninguno',
  superior: 'ninguno',
  inferior: 'ninguno',
  ancho: 'completo',
  alineacion: 'centro',
  fondo: '',
};

interface PaginaASembrar {
  slug: string;
  /** Solo se usa si la página no existe: a una existente no se le cambia el título. */
  titulo: string;
  bloque: { type: string; props: Record<string, unknown> };
}

const PAGINAS: PaginaASembrar[] = [
  {
    slug: 'clasificacion',
    titulo: 'Buscador de ocupaciones',
    bloque: {
      type: 'BuscadorOcupaciones',
      props: {
        id: 'BuscadorOcupaciones-clasificacion',
        ayuda: 'Ingresa un código, denominación u ocupación para consultar el catálogo CNO/CUOC.',
        caja: CAJA,
      },
    },
  },
  {
    slug: 'alertas-inversion',
    titulo: 'Alertas de inversión',
    bloque: {
      type: 'AlertasInversion',
      props: {
        id: 'AlertasInversion-alertas-inversion',
        titulo: 'Alertas de inversión',
        descripcion:
          'Proyectos de inversión, nuevos o de expansión, anunciados en Colombia — agrupados por sector económico.',
        caja: CAJA,
      },
    },
  },
  {
    slug: 'programas-sobresalientes',
    titulo: 'Programas sobresalientes',
    bloque: {
      type: 'ProgramasSobresalientes',
      props: {
        id: 'ProgramasSobresalientes-programas-sobresalientes',
        modoSeleccionDepartamento: 'mapa',
        mostrarTitulo: true,
        titulo: 'Programas + sobresalientes SENA',
        alineacionTitulo: 'centro',
        colorTitulo: '',
        // La ruta montaba la vista sin descripción; se deja vacía para que se vea igual.
        mostrarDescripcion: true,
        descripcion: '',
        alineacionDescripcion: 'centro',
        colorDescripcion: '',
        caja: CAJA,
      },
    },
  },
];

const claveDeSeccion = (slug: string) => `editar.${AMBITO}.${slug}`;

type Sql = Sequelize;

const unaFila = async <T>(sql: Sql, consulta: string, replacements: Record<string, unknown>) => {
  const filas = (await sql.query(consulta, { replacements, type: QueryTypes.SELECT })) as T[];
  return filas[0] ?? null;
};

/** Cambia el slug de una página conservando su `id`, su permiso y su candado. */
const renombrar = async (sql: Sql, viejo: string, nuevo: string): Promise<void> => {
  const existeVieja = await unaFila(sql, `SELECT id FROM paginas WHERE ambito = :ambito AND slug = :viejo`, {
    ambito: AMBITO,
    viejo,
  });
  const existeNueva = await unaFila(sql, `SELECT id FROM paginas WHERE ambito = :ambito AND slug = :nuevo`, {
    ambito: AMBITO,
    nuevo,
  });

  // Las dos a la vez solo pasa si alguien creó la nueva a mano: no hay forma segura de
  // elegir cuál se queda, así que se para y se dice dónde.
  if (existeVieja && existeNueva) {
    throw new Error(
      `En el sitio existen a la vez "${viejo}" y "${nuevo}". Borra o renombra una antes de aplicar esta migración.`
    );
  }

  if (existeVieja) {
    await sql.query(
      `UPDATE paginas SET slug = :nuevo, updated_at = now() WHERE ambito = :ambito AND slug = :viejo`,
      { replacements: { ambito: AMBITO, viejo, nuevo } }
    );
  }

  // Conserva el `id` del permiso: ver `014` sobre `roles_permisos`. Si la clave nueva ya
  // existe (una ejecución anterior a medias), la vieja sobra y se reasigna antes de borrarla.
  const permisoNuevo = await unaFila<{ id: string }>(sql, `SELECT id FROM permisos WHERE clave = :clave`, {
    clave: claveDeSeccion(nuevo),
  });
  if (!permisoNuevo) {
    await sql.query(`UPDATE permisos SET clave = :nueva, updated_at = now() WHERE clave = :vieja`, {
      replacements: { vieja: claveDeSeccion(viejo), nueva: claveDeSeccion(nuevo) },
    });
  } else {
    await sql.query(
      `INSERT INTO roles_permisos (rol_id, permiso_id)
       SELECT rp.rol_id, :nuevoId
         FROM roles_permisos rp
         JOIN permisos p ON p.id = rp.permiso_id
        WHERE p.clave = :vieja
       ON CONFLICT DO NOTHING`,
      { replacements: { vieja: claveDeSeccion(viejo), nuevoId: permisoNuevo.id } }
    );
    await sql.query(
      `DELETE FROM roles_permisos WHERE permiso_id IN (SELECT id FROM permisos WHERE clave = :vieja)`,
      { replacements: { vieja: claveDeSeccion(viejo) } }
    );
    await sql.query(`DELETE FROM permisos WHERE clave = :vieja`, {
      replacements: { vieja: claveDeSeccion(viejo) },
    });
  }

  await sql.query(
    `UPDATE bloqueos_edicion SET slug = :nuevo WHERE ambito = :ambito AND slug = :viejo`,
    { replacements: { ambito: AMBITO, viejo, nuevo } }
  );
};

/** Crea la página si falta y publica el bloque, salvo que ya esté publicado. */
const publicar = async (sql: Sql, { slug, titulo, bloque }: PaginaASembrar): Promise<void> => {
  let pagina = await unaFila<{ id: string }>(
    sql,
    `SELECT id FROM paginas WHERE ambito = :ambito AND slug = :slug`,
    { ambito: AMBITO, slug }
  );

  if (!pagina) {
    pagina = await unaFila<{ id: string }>(
      sql,
      `INSERT INTO paginas (id, slug, ambito, titulo, created_at, updated_at)
       VALUES (gen_random_uuid(), :slug, :ambito, :titulo, now(), now())
       RETURNING id`,
      { slug, ambito: AMBITO, titulo }
    );
  }
  if (!pagina) throw new Error(`No se pudo crear la página "${slug}".`);

  // Ya hecho (otra ejecución, o alguien lo publicó a mano): no se publica otra versión.
  const yaPublicado = await unaFila(
    sql,
    `SELECT 1
       FROM paginas_versiones
      WHERE pagina_id = :paginaId
        AND estado = 'publicado'
        AND jsonb_path_exists(contenido, '$.content[*] ? (@.type == $tipo)', jsonb_build_object('tipo', CAST(:tipo AS text)))`,
    { paginaId: pagina.id, tipo: bloque.type }
  );

  if (!yaPublicado) {
    // Una página tiene como mucho una versión publicada (`uq_pagina_version_publicada`):
    // la anterior se archiva antes de que entre la nueva, igual que en `aprobarPagina`.
    await sql.query(
      `UPDATE paginas_versiones SET estado = 'archivado' WHERE pagina_id = :paginaId AND estado = 'publicado'`,
      { replacements: { paginaId: pagina.id } }
    );

    const contenido = { root: { props: {} }, zones: {}, content: [bloque] };
    const version = await unaFila<{ id: string }>(
      sql,
      `INSERT INTO paginas_versiones
         (id, pagina_id, contenido, numero_version, estado, comentario_cambios, publicado_en, creado_en)
       VALUES (
         gen_random_uuid(), :paginaId, CAST(:contenido AS jsonb),
         (SELECT COALESCE(MAX(numero_version), 0) + 1 FROM paginas_versiones WHERE pagina_id = :paginaId),
         'publicado', :comentario, now(), now()
       )
       RETURNING id`,
      { paginaId: pagina.id, contenido: JSON.stringify(contenido), comentario: COMENTARIO }
    );

    await sql.query(
      `UPDATE paginas SET version_publicada_id = :versionId, updated_at = now() WHERE id = :paginaId`,
      { replacements: { versionId: version?.id, paginaId: pagina.id } }
    );
  }

  await sql.query(
    `INSERT INTO permisos (id, clave, created_at, updated_at)
     VALUES (gen_random_uuid(), :clave, now(), now())
     ON CONFLICT (clave) DO NOTHING`,
    { replacements: { clave: claveDeSeccion(slug) } }
  );
  // Un rol que no exista en este entorno no produce filas; no es un error (ver `023`).
  await sql.query(
    `INSERT INTO roles_permisos (rol_id, permiso_id)
     SELECT r.id, p.id
       FROM roles r
       JOIN permisos p ON p.clave = :clave
      WHERE r.nombre IN (:roles)
     ON CONFLICT DO NOTHING`,
    { replacements: { clave: claveDeSeccion(slug), roles: ROLES } }
  );
};

export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  for (const { viejo, nuevo } of RENOMBRADOS) {
    await renombrar(sql, viejo, nuevo);
  }

  for (const pagina of PAGINAS) {
    await publicar(sql, pagina);
  }
}

/**
 * Deshace la migración:
 *
 * - Los renombrados vuelven atrás con la misma función, al revés.
 * - Se borran las versiones que esta migración publicó (las reconoce por su
 *   `comentario_cambios`). Si a la página le queda alguna versión archivada, la más
 *   reciente vuelve a publicarse: es el texto provisional que tenía `alertas-inversion`.
 *   Si no le queda ninguna, la página la creó esta migración y se borra con su permiso.
 *
 * Hay que revertir también el sitio web: sin las carpetas de `app/(public)/`, esas URLs
 * dejan de existir.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  for (const { slug } of PAGINAS) {
    const pagina = await unaFila<{ id: string }>(
      sql,
      `SELECT id FROM paginas WHERE ambito = :ambito AND slug = :slug`,
      { ambito: AMBITO, slug }
    );
    if (!pagina) continue;

    const borradas = (await sql.query(
      `DELETE FROM paginas_versiones WHERE pagina_id = :paginaId AND comentario_cambios = :comentario RETURNING id`,
      { replacements: { paginaId: pagina.id, comentario: COMENTARIO }, type: QueryTypes.SELECT }
    )) as unknown[];
    if (borradas.length === 0) continue;

    const anterior = await unaFila<{ id: string }>(
      sql,
      `SELECT id FROM paginas_versiones
        WHERE pagina_id = :paginaId AND estado = 'archivado'
        ORDER BY numero_version DESC
        LIMIT 1`,
      { paginaId: pagina.id }
    );
    const quedanVersiones = await unaFila(sql, `SELECT 1 FROM paginas_versiones WHERE pagina_id = :paginaId`, {
      paginaId: pagina.id,
    });

    if (anterior) {
      await sql.query(`UPDATE paginas_versiones SET estado = 'publicado' WHERE id = :id`, {
        replacements: { id: anterior.id },
      });
      await sql.query(`UPDATE paginas SET version_publicada_id = :id, updated_at = now() WHERE id = :paginaId`, {
        replacements: { id: anterior.id, paginaId: pagina.id },
      });
    } else if (!quedanVersiones) {
      await sql.query(`DELETE FROM paginas WHERE id = :paginaId`, { replacements: { paginaId: pagina.id } });
      await sql.query(
        `DELETE FROM roles_permisos WHERE permiso_id IN (SELECT id FROM permisos WHERE clave = :clave)`,
        { replacements: { clave: claveDeSeccion(slug) } }
      );
      await sql.query(`DELETE FROM permisos WHERE clave = :clave`, {
        replacements: { clave: claveDeSeccion(slug) },
      });
    }
  }

  for (const { viejo, nuevo } of RENOMBRADOS) {
    await renombrar(sql, nuevo, viejo);
  }
}
