import { QueryInterface } from 'sequelize';

export const nombre = '002-tablas-nuevas';

/**
 * Las diez tablas del diseño (`11-base-de-datos.md` §4) que hoy no existen.
 * Es puramente aditiva: no toca ni renombra nada de lo existente, así que la API
 * actual sigue funcionando igual mientras se construyen los casos de uso encima.
 *
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // ── RF-02 / RF-12 / RF-15 — archivos ──────────────────────────────────────
  // El archivo se guarda desacoplado del contenido: una imagen subida desde el
  // editor Puck no pertenece a ningún contenido, pertenece a un bloque.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS archivos (
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre_original    TEXT NOT NULL,
      nombre_almacenado  TEXT NOT NULL UNIQUE,
      ruta_relativa      TEXT NOT NULL,
      mime_type          TEXT NOT NULL,
      extension          TEXT,
      tamano_bytes       BIGINT NOT NULL CHECK (tamano_bytes > 0),
      hash_sha256        CHAR(64) NOT NULL UNIQUE,
      ambito             TEXT NOT NULL DEFAULT 'publico'
                           CHECK (ambito IN ('publico', 'interno')),
      estado             TEXT NOT NULL DEFAULT 'pendiente'
                           CHECK (estado IN ('pendiente', 'disponible', 'rechazado', 'eliminado')),
      texto_alternativo  TEXT,
      subido_por         UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS contenidos_archivos (
      contenido_id UUID NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
      archivo_id   UUID NOT NULL REFERENCES archivos(id) ON DELETE RESTRICT,
      orden        SMALLINT NOT NULL DEFAULT 0,
      rol          TEXT NOT NULL DEFAULT 'adjunto'
                     CHECK (rol IN ('adjunto', 'portada', 'galeria')),
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (contenido_id, archivo_id)
    );
  `);

  // ── RF-02 / RF-08 / RF-17 — ajustes del sistema ───────────────────────────
  // La clave es la identidad: un id sintético sería una columna que nadie consulta.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS configuraciones (
      clave           TEXT PRIMARY KEY,
      valor           JSONB NOT NULL,
      descripcion     TEXT,
      actualizado_por UUID REFERENCES users(id) ON DELETE SET NULL,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── RF-03 — identidad visual ──────────────────────────────────────────────
  // Los logotipos dentro de `tokens` son ids de `archivos`, no rutas copiadas.
  // Postgres no puede declarar esa FK desde JSONB; la valida el caso de uso.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS marca_versiones (
      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      version             INTEGER NOT NULL UNIQUE,
      tokens              JSONB NOT NULL,
      activa              BOOLEAN NOT NULL DEFAULT false,
      contraste_validado  BOOLEAN NOT NULL DEFAULT false,
      creado_por          UUID REFERENCES users(id) ON DELETE SET NULL,
      aprobado_por        UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── RF-08 — tableros Power BI ─────────────────────────────────────────────
  // Los bloques Puck guardan `tablero_id`, no la URL: cambiar el informe se hace
  // una vez y no en los tres componentes donde hoy está escrito a mano.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS tableros_bi (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre      TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      url         TEXT NOT NULL,
      page_name   TEXT,
      ambito      TEXT NOT NULL DEFAULT 'intranet'
                    CHECK (ambito IN ('sitio', 'intranet')),
      activo      BOOLEAN NOT NULL DEFAULT true,
      creado_por  UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── RF-13 — Habeas Data (Ley 1581/2012) ───────────────────────────────────
  await sql.query(`
    CREATE TABLE IF NOT EXISTS politicas_privacidad (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      version       TEXT NOT NULL UNIQUE,
      titulo        TEXT NOT NULL,
      cuerpo        TEXT NOT NULL,
      url           TEXT,
      vigente_desde TIMESTAMPTZ NOT NULL DEFAULT now(),
      vigente_hasta TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      CHECK (vigente_hasta IS NULL OR vigente_hasta > vigente_desde)
    );
  `);

  // `politica_id` con RESTRICT: una política con consentimientos registrados no se
  // puede borrar, tiene valor probatorio. Y `aceptado` solo admite `true`: se
  // registra la aceptación explícita, nunca una casilla premarcada.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS consentimientos (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      politica_id           UUID NOT NULL REFERENCES politicas_privacidad(id) ON DELETE RESTRICT,
      formulario            TEXT NOT NULL,
      titular_identificador TEXT NOT NULL,
      aceptado              BOOLEAN NOT NULL DEFAULT true CHECK (aceptado = true),
      aceptado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
      ip                    INET,
      user_agent            TEXT
    );
  `);

  // ── RF-17 — historial de respaldos ────────────────────────────────────────
  await sql.query(`
    CREATE TABLE IF NOT EXISTS respaldos (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      disparado_por    TEXT NOT NULL DEFAULT 'programado'
                         CHECK (disparado_por IN ('programado', 'manual')),
      usuario_id       UUID REFERENCES users(id) ON DELETE SET NULL,
      iniciado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
      terminado_en     TIMESTAMPTZ,
      estado           TEXT NOT NULL DEFAULT 'en_curso'
                         CHECK (estado IN ('en_curso', 'exitoso', 'fallido')),
      destino          TEXT,
      tamano_bytes     BIGINT,
      checksum_sha256  CHAR(64),
      cifrado          BOOLEAN NOT NULL DEFAULT true,
      retencion_hasta  TIMESTAMPTZ,
      error            TEXT,
      CHECK (terminado_en IS NULL OR terminado_en >= iniciado_en),
      CHECK (estado <> 'fallido' OR error IS NOT NULL)
    );
  `);

  // ── RF-06 — avisos en el panel ────────────────────────────────────────────
  // No copia el motivo del rechazo: guarda a qué entidad apunta y los parámetros
  // del mensaje. El texto se compone en el frontend a partir de `tipo`, así el
  // motivo vive en un solo lugar y editarlo no deja una notificación mintiendo.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      destinatario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tipo           TEXT NOT NULL,
      entidad_tipo   TEXT NOT NULL,
      entidad_id     UUID NOT NULL,
      datos          JSONB NOT NULL DEFAULT '{}'::jsonb,
      leida_en       TIMESTAMPTZ,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── RF-12 / RF-15 — auditoría de accesos ──────────────────────────────────
  // Separada de la de cambios: distinto volumen, distinta retención, distintas
  // columnas. `usuario_id` nulo significa descarga pública anónima.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS auditoria_accesos (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      usuario_id   UUID REFERENCES users(id) ON DELETE SET NULL,
      recurso_tipo TEXT NOT NULL
                     CHECK (recurso_tipo IN ('archivo', 'pagina_interna', 'tablero')),
      recurso_id   UUID NOT NULL,
      accion       TEXT NOT NULL CHECK (accion IN ('ver', 'descargar')),
      ip           INET,
      user_agent   TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── Datos de referencia ───────────────────────────────────────────────────
  // Los permisos de acceso por aplicación (11-base-de-datos.md §2.1) son parte del
  // contrato del esquema, no datos de prueba: sin ellos ningún frontend autoriza.
  // Las marcas de tiempo van explícitas: `permissions` la creó `sequelize.sync()` con
  // `created_at NOT NULL` pero sin DEFAULT, porque el valor lo ponía Sequelize desde
  // JavaScript. Un INSERT en SQL plano no tiene quien se lo rellene.
  await sql.query(`
    INSERT INTO permissions (name, created_at, updated_at) VALUES
      ('acceso.sitio', now(), now()),
      ('acceso.intranet', now(), now())
    ON CONFLICT (name) DO NOTHING;
  `);

  await sql.query(`
    INSERT INTO configuraciones (clave, valor, descripcion) VALUES
      ('archivos.tamano_maximo_bytes', '10485760'::jsonb,
       'Tamaño máximo por archivo, verificado en el servidor (RF-02)'),
      ('archivos.tipos_permitidos',
       '["application/pdf","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","image/jpeg","image/png","image/svg+xml"]'::jsonb,
       'Lista blanca de tipos MIME reales, validados por magic bytes (RF-02)'),
      ('powerbi.dominios_permitidos', '["app.powerbi.com"]'::jsonb,
       'Dominios autorizados para incrustar tableros (RF-08)'),
      ('respaldos.frecuencia_cron', '"0 3 * * *"'::jsonb,
       'Frecuencia configurable de los respaldos automáticos (RF-17)'),
      ('respaldos.retencion_dias', '30'::jsonb,
       'Días que se conserva un respaldo antes de rotarlo (RF-17)')
    ON CONFLICT (clave) DO NOTHING;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    DROP TABLE IF EXISTS
      auditoria_accesos,
      notificaciones,
      respaldos,
      consentimientos,
      politicas_privacidad,
      tableros_bi,
      marca_versiones,
      configuraciones,
      contenidos_archivos,
      archivos
    CASCADE;
  `);

  await sql.query(`
    DELETE FROM permissions WHERE name IN ('acceso.sitio', 'acceso.intranet');
  `);
}
