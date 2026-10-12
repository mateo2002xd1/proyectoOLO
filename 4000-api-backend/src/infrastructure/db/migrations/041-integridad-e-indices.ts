import { QueryInterface } from 'sequelize';

export const nombre = '041-integridad-e-indices';

/**
 * Lo que encontró la revisión del esquema del 08-10-2026 (`docs/11-base-de-datos.md` §9),
 * medido contra la base real y no contra lo que declaran las migraciones o los modelos.
 *
 * ## 1. Tres `UNIQUE` que la documentación daba por hechos y nunca existieron
 *
 * La 026 (`departamentos.nombre`, `niveles_formacion.nombre`) y la 038
 * (`ciiu_secciones.letra`) los pidieron con `unique: 'uq_…'` dentro de
 * `queryInterface.createTable`. Ahí **una cadena no crea nada**: solo `unique: true`
 * escribe `UNIQUE`; el nombre en cadena es una opción de `Model.init` que `createTable`
 * ignora en silencio. Desde entonces el importador de «Programa + Sobresalientes» podía
 * duplicar un nivel y el de alertas una sección sin que la base protestara.
 *
 * Y uno que faltaba por diseño: el código CIIU de cuatro cifras ya identifica la clase
 * (sus dos primeras cifras son la división, y cada división es de una sola sección:
 * `listarSeccionesConDivisiones` deduce la sección así). `buscarClasePorCodigo` busca por
 * `codigo` solo, pero la base solo exigía `(seccion_id, codigo)`. Pasa a `UNIQUE (codigo)`,
 * que implica al anterior.
 *
 * ## 2. Copias controladas: una FK compuesta por cada dato repetido
 *
 * Cuatro columnas repiten algo que ya se deduce de otra fila (dependencia transitiva):
 *
 * | Tabla | Columna | Se deduce de |
 * |---|---|---|
 * | `programas_sobresalientes` | `departamento_id` | `centro_id` → `centros_formacion.departamento_id` |
 * | `programas_sobresalientes` | `nivel_formacion_id` | `programa_id` → `programas_formacion.nivel_formacion_id` |
 * | `proyectos_inversion` | `seccion_id` (si hay `clase_id`) | `clase_id` → `ciiu_clases.seccion_id` |
 * | `proyectos_inversion_ubicaciones` | `departamento_id` (si hay `municipio_id`) | `municipio_id` → `municipios.departamento_id` |
 *
 * No se quitan: en las dos de alertas la columna es obligatoria cuando la otra falta (una
 * noticia sin clase CIIU, una sede sin municipio), y en la tabla de hechos ahorran un JOIN
 * en cada filtro. Lo que se cierra es que puedan contradecirse: `FOREIGN KEY (centro_id,
 * departamento_id) REFERENCES centros_formacion (id, departamento_id)` exige que la pareja
 * exista tal cual. Con `MATCH SIMPLE` (el de siempre) la regla no se aplica si una de las
 * dos es `NULL`, que es exactamente el caso «sin clase» / «sin municipio». Y con
 * `ON UPDATE CASCADE`, si un centro cambia de departamento (lo que hizo la 032 al fusionar),
 * la copia se actualiza sola en vez de quedarse vieja. Hoy las cuatro coinciden en el 100 %
 * de las filas: medido antes de escribir esto.
 *
 * La misma idea cierra un hueco del ciclo editorial: `paginas.version_publicada_id` podía
 * apuntar a la versión de **otra** página, y el sitio pintaría el contenido equivocado.
 * La FK pasa a `(version_publicada_id, id) → paginas_versiones (id, pagina_id)`, sigue
 * diferida (la referencia es circular) y al borrar la versión vacía solo el puntero
 * (`SET NULL (version_publicada_id)`, Postgres 15+; Neon y el servidor son 18).
 *
 * Las FK simples que ya había se quedan: cada compuesta es una regla más, no un reemplazo.
 *
 * ## 3. Columnas que admitían NULL sin que NULL signifique nada
 *
 * Las que nacieron con `sequelize.sync()` y no con la 001: `paginas_versiones.estado` (un
 * `CHECK` deja pasar `NULL`, así que una versión sin estado esquivaba las invariantes I1–I4),
 * los indicadores y el contador de `usuarios`, `preguntas_seguridad.orden` y
 * `auditoria_cambios.entidad_tipo`, que además tenía `DEFAULT 'post'`, un valor que su
 * propio `CHECK` rechaza. Los nulos de `usuarios` se rellenan con lo que el código ya
 * entendía (`NULL` es falso en JavaScript: `false`, `false`, `0`), no con el `DEFAULT`, que
 * en `debe_configurar_preguntas` es `true` y obligaría a cuentas existentes a configurar
 * preguntas. Hoy no hay ninguno; el relleno es para otras bases.
 *
 * Y las fechas y los `id` sin `DEFAULT`: los ponía Sequelize desde JavaScript, así que un
 * `INSERT` en SQL plano (migraciones, scripts) tenía que acordarse. Es la trampa que la
 * 8.4 de la documentación cuenta con `permissions.created_at`.
 *
 * ## 4. Reglas que vivían solo en el código
 *
 * - Lo publicado tiene fecha (`paginas_versiones`, `cortes_ocupacionales`): la I5 de
 *   `contenidos` se fue con la 036 y no la heredó nadie. Los listados de respaldos ordenan
 *   por `publicado_en`.
 * - `cargas_datos.modulo` es uno de los cuatro módulos (D4): era texto libre.
 * - El correo se guarda en minúsculas. Había dos índices únicos: `lower(email)` (de la 005)
 *   y `email` (una copia que dejó `sync`, `users_email_key61`, que la 005 quiso borrar por
 *   otro nombre). El login busca `email = …` ya normalizado, así que solo el segundo le
 *   sirve. Con `CHECK (email = lower(email))` los dos significan lo mismo y queda uno.
 *
 * ## 5. Índices que solo costaban escrituras
 *
 * Medido con `pg_stat_user_indexes`: cero lecturas y ninguna consulta que los pueda usar.
 * `users_status` y los de `sexo`/`tasa_vinculacion` (dos o pocos valores, y la lectura de
 * sobresalientes trae la tabla entera), `idx_security_questions_user_id` (repite la primera
 * columna del único `(usuario_id, pregunta_clave)`) e `idx_archivos_ambito` (ninguna
 * consulta filtra `archivos` por ámbito ni estado). `programas_sobresalientes` se vacía y
 * recarga en cada importación: cada índice de más se reescribe entero.
 *
 * ## 6. Que Neon y una base nueva tengan el mismo esquema
 *
 * Comparando una copia de Neon con una base vacía migrada de la 001 a la 041:
 *
 * - Cuatro índices de búsqueda por FK existían solo en Neon, con nombres de `sync`, y
 *   están entre los más leídos (`usuarios.rol_id`, `roles_permisos.permiso_id`,
 *   `auditoria_cambios.accion` —el listado de la bitácora— y `paginas.creado_por`). En el
 *   servidor faltaban. Se renombran donde están y se crean donde no.
 * - `_obsoleto_attachment` seguía en toda base nueva: la 004 renombró `"Attachment"` en
 *   vez de borrarlo, a la espera de que `archivos` estuviera en uso, y la 020 no la
 *   incluyó al purgar. En Neon ya no está. Se borra si está vacía; si tuviera filas se
 *   deja y se avisa, porque una migración no decide borrar datos (criterio de la 013).
 *
 * Quedan diferencias que no cambian nada: las FK que hizo `sync` llevan `ON UPDATE
 * CASCADE` sobre claves UUID que nunca cambian, y algunos `CHECK` se escriben distinto
 * con el mismo significado.
 *
 * Todo en una transacción propia, como la 032, la 035 y la 037: el runner no le pasa la
 * suya a `up`, y a medio camino quedaría la mitad de las reglas.
 */

/** `ADD CONSTRAINT` solo si no existe ya con ese nombre en esa tabla. */
const agregarRestriccion = (tabla: string, nombre: string, definicion: string) => `
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conrelid = '${tabla}'::regclass AND conname = '${nombre}'
    ) THEN
      ALTER TABLE ${tabla} ADD CONSTRAINT ${nombre} ${definicion};
    END IF;
  END $$;
`;

const quitarRestriccion = (tabla: string, nombre: string) =>
  `ALTER TABLE ${tabla} DROP CONSTRAINT IF EXISTS ${nombre};`;

/**
 * Quita las FK de `paginas` hacia `paginas_versiones` **por definición**, no por nombre
 * (mismo criterio que la 008): la 001 la llama `fk_paginas_version_publicada`, pero una
 * base nacida de `sync` pudo ponerle otro.
 */
const QUITAR_FK_VERSION_PUBLICADA = `
  DO $$
  DECLARE r record;
  BEGIN
    FOR r IN
      SELECT conname FROM pg_constraint
       WHERE contype = 'f'
         AND conrelid = 'paginas'::regclass
         AND confrelid = 'paginas_versiones'::regclass
    LOOP
      EXECUTE format('ALTER TABLE paginas DROP CONSTRAINT %I', r.conname);
    END LOOP;
  END $$;
`;

/**
 * Deja un único `UNIQUE (email)` llamado `uq_usuarios_email`, venga la base de donde venga:
 * en Neon hay una copia de `sync` (`users_email_key61`); en una base nacida de la 001 no
 * hay ninguna, porque la 005 la borró. El índice `lower(email)` ya se quitó antes: su
 * nombre era `uq_usuarios_email`.
 */
const UNIQUE_EMAIL_UNICO = `
  DO $$
  DECLARE
    r record;
    primero boolean := true;
  BEGIN
    FOR r IN
      SELECT c.conname
        FROM pg_constraint c
       WHERE c.conrelid = 'usuarios'::regclass
         AND c.contype = 'u'
         AND c.conkey = ARRAY[(SELECT attnum FROM pg_attribute
                                WHERE attrelid = 'usuarios'::regclass AND attname = 'email')]::int2[]
       ORDER BY c.oid
    LOOP
      IF primero THEN
        IF r.conname <> 'uq_usuarios_email' THEN
          EXECUTE format('ALTER TABLE usuarios RENAME CONSTRAINT %I TO uq_usuarios_email', r.conname);
        END IF;
        primero := false;
      ELSE
        EXECUTE format('ALTER TABLE usuarios DROP CONSTRAINT %I', r.conname);
      END IF;
    END LOOP;
    IF primero THEN
      ALTER TABLE usuarios ADD CONSTRAINT uq_usuarios_email UNIQUE (email);
    END IF;
  END $$;
`;

const MODULOS_DE_CARGA = ['programa_sobresalientes', 'tendencia_ocupacional', 'fuentes_futuras_empleo', 'alertas_inversion'];

/** Columnas de fecha que no tenían `DEFAULT now()` (las dejó `sync`; la 001 sí lo ponía). */
const FECHAS_SIN_DEFAULT: [string, string][] = [
  ['auditoria_cambios', 'created_at'],
  ['paginas', 'created_at'],
  ['paginas', 'updated_at'],
  ['paginas_versiones', 'creado_en'],
  ['permisos', 'created_at'],
  ['permisos', 'updated_at'],
  ['preguntas_seguridad', 'created_at'],
  ['preguntas_seguridad', 'updated_at'],
  ['roles', 'created_at'],
  ['roles', 'updated_at'],
  ['usuarios', 'created_at'],
  ['usuarios', 'updated_at'],
];

const INDICES_SOBRANTES = [
  'users_status',
  'idx_security_questions_user_id',
  'idx_archivos_ambito',
  'idx_sobresalientes_nivel',
  'idx_sobresalientes_sexo',
  'idx_sobresalientes_tasa',
];

/** [nombre que le puso `sync` en Neon, nombre de la casa, tabla (columnas)]. */
const INDICES_A_UNIFICAR: [string, string, string][] = [
  ['idx_users_role_id', 'idx_usuarios_rol', 'usuarios (rol_id)'],
  ['idx_rp_permission_id', 'idx_roles_permisos_permiso', 'roles_permisos (permiso_id)'],
  ['idx_audit_action_type', 'idx_auditoria_accion', 'auditoria_cambios (accion)'],
  ['paginas_creado_por', 'idx_paginas_creado_por', 'paginas (creado_por)'],
];

/** Renombra el índice de `sync` si está; si no, lo crea con el nombre de la casa. */
const unificarIndice = ([viejo, nuevo, sobre]: [string, string, string]) => `
  DO $$
  BEGIN
    IF to_regclass('public.${viejo}') IS NOT NULL AND to_regclass('public.${nuevo}') IS NULL THEN
      ALTER INDEX ${viejo} RENAME TO ${nuevo};
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS ${nuevo} ON ${sobre};
`;

const BORRAR_ATTACHMENT_OBSOLETO = `
  DO $$
  BEGIN
    IF to_regclass('public._obsoleto_attachment') IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM _obsoleto_attachment) THEN
        RAISE NOTICE '_obsoleto_attachment tiene filas: se deja sin borrar, revísela a mano';
      ELSE
        DROP TABLE _obsoleto_attachment;
      END IF;
    END IF;
  END $$;
`;

const enUnaTransaccion = (queryInterface: QueryInterface, sentencias: string[]) =>
  queryInterface.sequelize.transaction(async (transaction) => {
    for (const sentencia of sentencias) await queryInterface.sequelize.query(sentencia, { transaction });
  });

export async function up(queryInterface: QueryInterface): Promise<void> {
  await enUnaTransaccion(queryInterface, [
    // ── 1. Unicidad que faltaba ─────────────────────────────────────────────────
    agregarRestriccion('departamentos', 'uq_departamentos_nombre', 'UNIQUE (nombre)'),
    agregarRestriccion('niveles_formacion', 'uq_niveles_formacion_nombre', 'UNIQUE (nombre)'),
    agregarRestriccion('ciiu_secciones', 'uq_ciiu_secciones_letra', 'UNIQUE (letra)'),
    agregarRestriccion('ciiu_clases', 'uq_ciiu_clases_codigo', 'UNIQUE (codigo)'),
    quitarRestriccion('ciiu_clases', 'uq_ciiu_clases_seccion_codigo'),

    // ── 2. Copias controladas ───────────────────────────────────────────────────
    // Destino de cada FK compuesta: Postgres exige un único sobre esas columnas.
    agregarRestriccion('centros_formacion', 'uq_centros_formacion_id_departamento', 'UNIQUE (id, departamento_id)'),
    agregarRestriccion('programas_formacion', 'uq_programas_formacion_id_nivel', 'UNIQUE (id, nivel_formacion_id)'),
    agregarRestriccion('ciiu_clases', 'uq_ciiu_clases_id_seccion', 'UNIQUE (id, seccion_id)'),
    agregarRestriccion('municipios', 'uq_municipios_id_departamento', 'UNIQUE (id, departamento_id)'),
    agregarRestriccion('paginas_versiones', 'uq_paginas_versiones_id_pagina', 'UNIQUE (id, pagina_id)'),

    agregarRestriccion(
      'programas_sobresalientes',
      'fk_sobresalientes_centro_departamento',
      `FOREIGN KEY (centro_id, departamento_id) REFERENCES centros_formacion (id, departamento_id)
         ON UPDATE CASCADE ON DELETE RESTRICT`
    ),
    agregarRestriccion(
      'programas_sobresalientes',
      'fk_sobresalientes_programa_nivel',
      `FOREIGN KEY (programa_id, nivel_formacion_id) REFERENCES programas_formacion (id, nivel_formacion_id)
         ON UPDATE CASCADE ON DELETE RESTRICT`
    ),
    // `centro_id` ya tiene índice (encabeza `uq_sobresalientes_registro`); `programa_id` no
    // tenía ninguno, y lo necesita el `ON UPDATE CASCADE` / `RESTRICT` de la compuesta.
    'CREATE INDEX IF NOT EXISTS idx_sobresalientes_programa ON programas_sobresalientes (programa_id, nivel_formacion_id);',
    agregarRestriccion(
      'proyectos_inversion',
      'fk_proyectos_inversion_clase_seccion',
      `FOREIGN KEY (clase_id, seccion_id) REFERENCES ciiu_clases (id, seccion_id)
         ON UPDATE CASCADE ON DELETE RESTRICT`
    ),
    agregarRestriccion(
      'proyectos_inversion_ubicaciones',
      'fk_proyectos_ubicaciones_municipio_departamento',
      `FOREIGN KEY (municipio_id, departamento_id) REFERENCES municipios (id, departamento_id)
         ON UPDATE CASCADE ON DELETE RESTRICT`
    ),

    QUITAR_FK_VERSION_PUBLICADA,
    `ALTER TABLE paginas ADD CONSTRAINT fk_paginas_version_publicada
       FOREIGN KEY (version_publicada_id, id) REFERENCES paginas_versiones (id, pagina_id)
       ON DELETE SET NULL (version_publicada_id)
       DEFERRABLE INITIALLY DEFERRED;`,

    // ── 3. NULL que no significaba nada, y DEFAULT que faltaban ─────────────────
    'ALTER TABLE paginas_versiones ALTER COLUMN estado SET NOT NULL;',
    `UPDATE usuarios SET debe_cambiar_password = false WHERE debe_cambiar_password IS NULL;
     UPDATE usuarios SET debe_configurar_preguntas = false WHERE debe_configurar_preguntas IS NULL;
     UPDATE usuarios SET intentos_fallidos = 0 WHERE intentos_fallidos IS NULL;`,
    `ALTER TABLE usuarios
       ALTER COLUMN debe_cambiar_password SET NOT NULL,
       ALTER COLUMN debe_configurar_preguntas SET NOT NULL,
       ALTER COLUMN intentos_fallidos SET NOT NULL;`,
    'UPDATE preguntas_seguridad SET orden = 0 WHERE orden IS NULL;',
    'ALTER TABLE preguntas_seguridad ALTER COLUMN orden SET NOT NULL;',
    `ALTER TABLE auditoria_cambios
       ALTER COLUMN entidad_tipo DROP DEFAULT,
       ALTER COLUMN entidad_tipo SET NOT NULL,
       ALTER COLUMN campos_modificados SET NOT NULL;`,
    ...FECHAS_SIN_DEFAULT.map(([tabla, columna]) => `ALTER TABLE ${tabla} ALTER COLUMN ${columna} SET DEFAULT now();`),
    'ALTER TABLE paginas ALTER COLUMN id SET DEFAULT gen_random_uuid();',
    'ALTER TABLE paginas_versiones ALTER COLUMN id SET DEFAULT gen_random_uuid();',

    // ── 4. Reglas que vivían solo en el código ──────────────────────────────────
    agregarRestriccion(
      'paginas_versiones',
      'ck_paginas_versiones_publicado_en',
      `CHECK (estado <> 'publicado' OR publicado_en IS NOT NULL)`
    ),
    agregarRestriccion(
      'cortes_ocupacionales',
      'ck_cortes_ocupacionales_publicado_en',
      `CHECK (estado <> 'publicado' OR publicado_en IS NOT NULL)`
    ),
    agregarRestriccion(
      'cargas_datos',
      'ck_cargas_datos_modulo',
      `CHECK (modulo IN (${MODULOS_DE_CARGA.map((m) => `'${m}'`).join(', ')}))`
    ),

    // El índice `lower(email)` impide dos correos que solo difieran en mayúsculas, así
    // que pasarlos a minúsculas no puede chocar. Va antes de quitarlo.
    'UPDATE usuarios SET email = lower(email) WHERE email <> lower(email);',
    'DROP INDEX IF EXISTS uq_usuarios_email;',
    UNIQUE_EMAIL_UNICO,
    agregarRestriccion('usuarios', 'ck_usuarios_email_minusculas', 'CHECK (email = lower(email))'),

    // ── 5. Índices que solo costaban escrituras ─────────────────────────────────
    ...INDICES_SOBRANTES.map((indice) => `DROP INDEX IF EXISTS ${indice};`),

    // ── 6. El mismo esquema en Neon y en una base nueva ─────────────────────────
    ...INDICES_A_UNIFICAR.map(unificarIndice),
    BORRAR_ATTACHMENT_OBSOLETO,
  ]);
}

/**
 * Quita las reglas nuevas y devuelve los índices. No devuelve los `NULL` ni los
 * `DEFAULT 'post'`: el código anterior funciona igual con columnas obligatorias, y el
 * `DEFAULT` era un error. El único de correo vuelve a ser el de `lower(email)` y el
 * otro queda como `users_email_key` (en Neon se llamaba `users_email_key61`).
 *
 * Tampoco deshace el punto 6: los cuatro índices unificados no estorban al código
 * anterior, y `_obsoleto_attachment` era una tabla vacía sin uso.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await enUnaTransaccion(queryInterface, [
    `CREATE INDEX IF NOT EXISTS users_status ON usuarios (estado);
     CREATE INDEX IF NOT EXISTS idx_security_questions_user_id ON preguntas_seguridad (usuario_id);
     CREATE INDEX IF NOT EXISTS idx_archivos_ambito ON archivos (ambito, estado);
     CREATE INDEX IF NOT EXISTS idx_sobresalientes_nivel ON programas_sobresalientes (nivel_formacion_id);
     CREATE INDEX IF NOT EXISTS idx_sobresalientes_sexo ON programas_sobresalientes (sexo);
     CREATE INDEX IF NOT EXISTS idx_sobresalientes_tasa ON programas_sobresalientes (tasa_vinculacion);`,

    quitarRestriccion('usuarios', 'ck_usuarios_email_minusculas'),
    'ALTER TABLE usuarios RENAME CONSTRAINT uq_usuarios_email TO users_email_key;',
    'CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email ON usuarios (lower(email));',

    quitarRestriccion('cargas_datos', 'ck_cargas_datos_modulo'),
    quitarRestriccion('cortes_ocupacionales', 'ck_cortes_ocupacionales_publicado_en'),
    quitarRestriccion('paginas_versiones', 'ck_paginas_versiones_publicado_en'),

    QUITAR_FK_VERSION_PUBLICADA,
    `ALTER TABLE paginas ADD CONSTRAINT fk_paginas_version_publicada
       FOREIGN KEY (version_publicada_id) REFERENCES paginas_versiones (id)
       ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;`,

    quitarRestriccion('proyectos_inversion_ubicaciones', 'fk_proyectos_ubicaciones_municipio_departamento'),
    quitarRestriccion('proyectos_inversion', 'fk_proyectos_inversion_clase_seccion'),
    'DROP INDEX IF EXISTS idx_sobresalientes_programa;',
    quitarRestriccion('programas_sobresalientes', 'fk_sobresalientes_programa_nivel'),
    quitarRestriccion('programas_sobresalientes', 'fk_sobresalientes_centro_departamento'),

    quitarRestriccion('paginas_versiones', 'uq_paginas_versiones_id_pagina'),
    quitarRestriccion('municipios', 'uq_municipios_id_departamento'),
    quitarRestriccion('ciiu_clases', 'uq_ciiu_clases_id_seccion'),
    quitarRestriccion('programas_formacion', 'uq_programas_formacion_id_nivel'),
    quitarRestriccion('centros_formacion', 'uq_centros_formacion_id_departamento'),

    agregarRestriccion('ciiu_clases', 'uq_ciiu_clases_seccion_codigo', 'UNIQUE (seccion_id, codigo)'),
    quitarRestriccion('ciiu_clases', 'uq_ciiu_clases_codigo'),
    quitarRestriccion('ciiu_secciones', 'uq_ciiu_secciones_letra'),
    quitarRestriccion('niveles_formacion', 'uq_niveles_formacion_nombre'),
    quitarRestriccion('departamentos', 'uq_departamentos_nombre'),
  ]);
}
