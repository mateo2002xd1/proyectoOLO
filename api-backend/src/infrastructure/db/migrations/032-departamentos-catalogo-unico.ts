import { QueryInterface } from 'sequelize';

export const nombre = '032-departamentos-catalogo-unico';

/**
 * `departamentos` pasa a ser el catálogo único de los 33 departamentos oficiales,
 * compartido por "Programa + Sobresalientes" y por la tendencia ocupacional
 * (percentiles, migración 033).
 *
 * Hasta ahora la llenaba el importador de programas con el nombre tal como viniera en
 * la columna "Regional" del Excel, así que acumuló variantes: "Distrito Capital",
 * "Valle", "Guajira", tres filas para Vaupés ("Vaupes", "Vaupés" y "Vupes", esta última
 * sin código) y le faltaban Caquetá, Chocó y Vichada. Un catálogo así no sirve de
 * filtro: el buscador de percentiles habría ofrecido dos Vaupés y ningún Chocó.
 *
 * Se depura **en su sitio** en vez de crear otra tabla: los `id` (UUID) que ya usan
 * `centros_formacion` y `programas_sobresalientes` se conservan, así que ninguna FK
 * cambia de tipo y el mapa de programas —que trabaja por `codigo_dane`— sigue igual.
 *
 * 1. Cada fila se resuelve a su código DANE por el nombre normalizado (alias) o por el
 *    código que ya tenía.
 * 2. La que no resuelve y no tiene datos se borra junto con sus centros sin datos
 *    (restos de cargas de prueba con errores de escritura). Si tuviera datos, la
 *    migración se detiene y lo dice: no se adivina a qué departamento pertenece.
 * 3. Entre varias filas con el mismo código sobrevive la que ya lleva el nombre
 *    oficial (si no, la que más datos tiene); las demás le pasan sus centros y datos.
 * 4. Los supervivientes toman el nombre oficial y se insertan los que faltan.
 * 5. `codigo_dane` queda obligatorio, único y de dos dígitos.
 * 6. `departamentos_alias` guarda los nombres "tal como vienen" en los Excel, para que
 *    ningún importador vuelva a crear departamentos: los resuelve o rechaza la fila.
 *
 * El `down` no deshace la fusión de filas (no hay forma de saber qué centro venía de
 * qué variante); solo quita la tabla de alias y afloja las restricciones.
 */

/** Los 33 departamentos con su nombre oficial (DIVIPOLA). */
const OFICIALES: [string, string][] = [
  ['05', 'Antioquia'], ['08', 'Atlántico'], ['11', 'Bogotá, D.C.'], ['13', 'Bolívar'],
  ['15', 'Boyacá'], ['17', 'Caldas'], ['18', 'Caquetá'], ['19', 'Cauca'], ['20', 'Cesar'],
  ['23', 'Córdoba'], ['25', 'Cundinamarca'], ['27', 'Chocó'], ['41', 'Huila'],
  ['44', 'La Guajira'], ['47', 'Magdalena'], ['50', 'Meta'], ['52', 'Nariño'],
  ['54', 'Norte de Santander'], ['63', 'Quindío'], ['66', 'Risaralda'], ['68', 'Santander'],
  ['70', 'Sucre'], ['73', 'Tolima'], ['76', 'Valle del Cauca'], ['81', 'Arauca'],
  ['85', 'Casanare'], ['86', 'Putumayo'],
  ['88', 'Archipiélago de San Andrés, Providencia y Santa Catalina'],
  ['91', 'Amazonas'], ['94', 'Guainía'], ['95', 'Guaviare'], ['97', 'Vaupés'], ['99', 'Vichada'],
];

/**
 * Nombres alternativos ya normalizados (minúsculas, sin tildes, todo lo que no sea letra
 * o dígito como espacio, espacios colapsados: ver `shared/normalizar-texto.ts`). Los
 * nombres oficiales normalizados se agregan solos; estos son los que se han visto en
 * los Excel reales: los de percentiles ("Guajira, La", "Bogotá D.C.", "San Andrés y
 * Providencia") y los de programas ("Distrito Capital", "Valle", "San Andrés").
 */
const ALIAS: [string, string][] = [
  ['bogota', '11'], ['bogota dc', '11'], ['distrito capital', '11'],
  ['guajira', '44'], ['guajira la', '44'],
  ['valle', '76'],
  ['san andres', '88'], ['san andres y providencia', '88'],
];

/** Misma normalización que `normalizarParaComparar()`, en SQL, solo para clasificar las filas existentes. */
const normalizarSql = (columna: string) => `
  btrim(regexp_replace(
    translate(lower(${columna}), 'áàäâéèëêíìïîóòöôúùüûñç', 'aaaaeeeeiiiioooouuuunc'),
    '[^a-z0-9]+', ' ', 'g'))`;

const valores = (filas: [string, string][]) =>
  filas.map(([a, b]) => `('${a.replace(/'/g, "''")}', '${b.replace(/'/g, "''")}')`).join(',\n    ');

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Transacción propia, como en 026: el runner abre una pero no se la pasa a `up()`, y
  // las tablas temporales (`ON COMMIT DROP`) tienen que vivir entre una consulta y otra.
  const transaction = await queryInterface.sequelize.transaction();
  const sql = {
    query: (texto: string) => queryInterface.sequelize.query(texto, { transaction }),
  };

  try {
    await sql.query(`
      CREATE TEMP TABLE tmp_oficiales (codigo_dane CHAR(2) PRIMARY KEY, nombre TEXT NOT NULL) ON COMMIT DROP;
      INSERT INTO tmp_oficiales VALUES
      ${valores(OFICIALES)};

      CREATE TEMP TABLE tmp_alias (alias_normalizado TEXT PRIMARY KEY, codigo_dane CHAR(2) NOT NULL) ON COMMIT DROP;
      INSERT INTO tmp_alias SELECT ${normalizarSql('nombre')}, codigo_dane FROM tmp_oficiales;
      INSERT INTO tmp_alias VALUES
      ${valores(ALIAS)}
      ON CONFLICT DO NOTHING;

      -- 1. Código resuelto de cada fila: primero por nombre, luego el que ya tenía.
      CREATE TEMP TABLE tmp_resueltos ON COMMIT DROP AS
      SELECT d.id,
             d.nombre,
             COALESCE(a.codigo_dane, CASE WHEN d.codigo_dane ~ '^[0-9]{2}$' THEN d.codigo_dane END) AS codigo,
             (SELECT count(*) FROM programas_sobresalientes p WHERE p.departamento_id = d.id) AS hechos
        FROM departamentos d
        LEFT JOIN tmp_alias a ON a.alias_normalizado = ${normalizarSql('d.nombre')};
    `);

    // 2. Sin código: se borra si no tiene datos; si los tiene, no se adivina.
    const [conDatosSinCodigo] = await sql.query(`
      SELECT r.nombre FROM tmp_resueltos r
       WHERE r.codigo IS NULL
         AND (r.hechos > 0 OR EXISTS (
               SELECT 1 FROM programas_sobresalientes p
                 JOIN centros_formacion c ON c.id = p.centro_id
                WHERE c.departamento_id = r.id))
    `);
    if ((conDatosSinCodigo as unknown[]).length > 0) {
      const nombres = (conDatosSinCodigo as { nombre: string }[]).map((f) => `"${f.nombre}"`).join(', ');
      throw new Error(
        `Departamentos con datos de programas que no corresponden a ningún departamento oficial: ${nombres}. ` +
          'Agregue su nombre a ALIAS en esta migración y vuelva a ejecutarla.'
      );
    }

    await sql.query(`
      DELETE FROM centros_formacion c
       USING tmp_resueltos r
       WHERE c.departamento_id = r.id AND r.codigo IS NULL;
      DELETE FROM departamentos d
       USING tmp_resueltos r
       WHERE d.id = r.id AND r.codigo IS NULL;
      DELETE FROM tmp_resueltos WHERE codigo IS NULL;

      -- 3. Un superviviente por código.
      CREATE TEMP TABLE tmp_supervivientes ON COMMIT DROP AS
      SELECT DISTINCT ON (r.codigo) r.codigo, r.id
        FROM tmp_resueltos r
        JOIN tmp_oficiales o ON o.codigo_dane = r.codigo
       ORDER BY r.codigo, (r.nombre = o.nombre) DESC, r.hechos DESC, r.id;
    `);

    // Si una variante y su superviviente tienen un centro con el mismo nombre, mover el
    // centro chocaría con `uq_centros_formacion_depto_nombre` y habría que fusionar
    // también los datos de programas. No pasa con los datos actuales; si pasa, se para.
    const [choques] = await sql.query(`
      SELECT c.nombre
        FROM centros_formacion c
        JOIN tmp_resueltos r      ON r.id = c.departamento_id
        JOIN tmp_supervivientes s ON s.codigo = r.codigo AND s.id <> r.id
       WHERE EXISTS (SELECT 1 FROM centros_formacion c2
                      WHERE c2.departamento_id = s.id AND c2.nombre = c.nombre)
    `);
    if ((choques as unknown[]).length > 0) {
      const nombres = (choques as { nombre: string }[]).map((f) => `"${f.nombre}"`).join(', ');
      throw new Error(
        `No se pueden fusionar departamentos duplicados: estos centros existen en las dos variantes: ${nombres}. ` +
          'Fusione esos centros a mano y vuelva a ejecutar la migración.'
      );
    }

    await sql.query(`
      UPDATE centros_formacion c
         SET departamento_id = s.id
        FROM tmp_resueltos r
        JOIN tmp_supervivientes s ON s.codigo = r.codigo AND s.id <> r.id
       WHERE c.departamento_id = r.id;

      UPDATE programas_sobresalientes p
         SET departamento_id = s.id
        FROM tmp_resueltos r
        JOIN tmp_supervivientes s ON s.codigo = r.codigo AND s.id <> r.id
       WHERE p.departamento_id = r.id;

      DELETE FROM departamentos d
       USING tmp_resueltos r
        JOIN tmp_supervivientes s ON s.codigo = r.codigo AND s.id <> r.id
       WHERE d.id = r.id;

      -- 4. Nombre oficial y código; después, los que faltan.
      UPDATE departamentos d
         SET nombre = o.nombre, codigo_dane = o.codigo_dane, updated_at = now()
        FROM tmp_supervivientes s
        JOIN tmp_oficiales o ON o.codigo_dane = s.codigo
       WHERE d.id = s.id
         AND (d.nombre IS DISTINCT FROM o.nombre OR d.codigo_dane IS DISTINCT FROM o.codigo_dane);

      INSERT INTO departamentos (nombre, codigo_dane)
      SELECT o.nombre, o.codigo_dane
        FROM tmp_oficiales o
       WHERE NOT EXISTS (SELECT 1 FROM departamentos d WHERE d.codigo_dane = o.codigo_dane);

      -- 5. El código deja de ser opcional.
      ALTER TABLE departamentos ALTER COLUMN codigo_dane TYPE CHAR(2);
      ALTER TABLE departamentos ALTER COLUMN codigo_dane SET NOT NULL;
      ALTER TABLE departamentos
        ADD CONSTRAINT uq_departamentos_codigo_dane UNIQUE (codigo_dane),
        ADD CONSTRAINT ck_departamentos_codigo_dane CHECK (codigo_dane ~ '^[0-9]{2}$');

      -- 6. Alias.
      CREATE TABLE departamentos_alias (
        alias_normalizado VARCHAR(120) PRIMARY KEY,
        departamento_id   UUID NOT NULL REFERENCES departamentos(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_departamentos_alias_departamento ON departamentos_alias (departamento_id);

      INSERT INTO departamentos_alias (alias_normalizado, departamento_id)
      SELECT a.alias_normalizado, d.id
        FROM tmp_alias a
        JOIN departamentos d ON d.codigo_dane = a.codigo_dane;
    `);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS departamentos_alias;
    ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS ck_departamentos_codigo_dane;
    ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS uq_departamentos_codigo_dane;
    ALTER TABLE departamentos ALTER COLUMN codigo_dane DROP NOT NULL;
    ALTER TABLE departamentos ALTER COLUMN codigo_dane TYPE VARCHAR(10);
  `);
}
