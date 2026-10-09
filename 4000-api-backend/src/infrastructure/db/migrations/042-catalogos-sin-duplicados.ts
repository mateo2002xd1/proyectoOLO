import { QueryInterface } from 'sequelize';

export const nombre = '042-catalogos-sin-duplicados';

/**
 * Que las cargas de «Actualizaciones» no dupliquen filas en las tablas maestras
 * (revisión del 09-10-2026, `docs/11-base-de-datos.md` §9.5).
 *
 * Cada catálogo se identifica por lo que de verdad lo identifica en la fuente:
 *
 * | Catálogo | Identidad | Por qué |
 * |---|---|---|
 * | `departamentos` | código DANE (cerrado: 32 departamentos + Bogotá D.C.) | Ya lo era (032). Ahora la base rechaza además dos nombres que solo difieran en tildes, mayúsculas o signos («Vaupés» / «Vaupes») y cualquier código que no sea uno de los 33 |
 * | `niveles_formacion`, `centros_formacion`, `programas_formacion` | **código SENA** (`Cod. Nivel de formación`, `Cod. Centro`, `Cod. Programa` del Excel) | Decisión del usuario (09-10-2026). El nombre no identifica: el Excel oficial trae «Apoyo administrativo en salud» con los códigos 134507 y 134508, y cinco centros distintos llamados «Centro de Comercio y Servicios». Por nombre, el importador sumaba programas distintos (223201 + 223213) y a la vez separaba uno mismo escrito con otra mayúscula |
 * | `municipios` | departamento + nombre normalizado | El Excel de alertas no trae código DIVIPOLA: el nombre normalizado es lo mejor que hay. Había «Medellín» y «Medellin» |
 * | `empresas` | nombre normalizado | Tampoco hay NIT. Antes solo ignoraba mayúsculas |
 *
 * La tendencia ocupacional y las clases CIIU ya se identifican por código y no se tocan.
 *
 * ## `normalizar_nombre()`
 *
 * La gemela en SQL de `normalizarParaComparar()` (`shared/normalizar-texto.ts`): sin tildes,
 * minúsculas, todo lo que no sea letra o dígito como un espacio, espacios colapsados. Es la
 * misma regla con la que se guardan los alias de departamento (032). Va en la base y no
 * solo en el código porque así **la base misma** rechaza el duplicado, venga del importador,
 * del formulario manual o de un `INSERT` a mano. `translate` se aplica antes que `lower` para
 * no depender del locale de la base: Neon (`C.UTF-8`) y el servidor no tienen por qué coincidir.
 *
 * ## Los catálogos de sobresalientes, por código
 *
 * `codigo` entra **sin `NOT NULL`**: las filas actuales no lo tienen y solo el Excel lo trae.
 * La primera carga después de esta migración crea los catálogos por código, recarga los
 * hechos y borra las filas viejas que se quedan sin hechos (`importar-programas-excel`). A
 * partir de ahí todas tienen código. Los únicos por nombre (`uq_*_nombre`) se quitan: dos
 * programas del mismo nivel pueden llamarse igual.
 *
 * Se borran ya las filas de esos catálogos que **ningún hecho usa**: vienen de cargas
 * anteriores y el importador las recrea si un Excel las vuelve a traer. Hoy son cinco: el
 * nivel «Tecnico» (sin tilde) con su único programa, un centro de Vaupés con una errata
 * («Agropecuarios») y dos «Centro Textil y de Gestión Industrial» asignados a Amazonas y
 * Córdoba.
 *
 * Todo en una transacción propia, como la 041.
 */

/** Pares de letras con tilde (o equivalentes) → su letra base, en mayúscula y minúscula. */
const LETRAS: [string, string][] = [
  ['áàäâãå', 'a'], ['éèëê', 'e'], ['íìïî', 'i'], ['óòöôõ', 'o'], ['úùüû', 'u'],
  ['ñ', 'n'], ['ç', 'c'], ['ýÿ', 'y'],
];
const DESDE = LETRAS.map(([con]) => con + con.toUpperCase()).join('');
const HACIA = LETRAS.map(([con, base]) => base.repeat(con.length) + base.toUpperCase().repeat(con.length)).join('');

const FUNCION_NORMALIZAR = `
  CREATE OR REPLACE FUNCTION normalizar_nombre(texto text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
      SELECT btrim(regexp_replace(lower(translate(texto, '${DESDE}', '${HACIA}')), '[^a-z0-9]+', ' ', 'g'))
    $$;
  COMMENT ON FUNCTION normalizar_nombre(text) IS
    'Gemela de normalizarParaComparar() (shared/normalizar-texto.ts): sin tildes, minúsculas, signos como espacio. Migración 042.';
`;

/** Los 33 códigos DANE del catálogo: 32 departamentos y Bogotá D.C. (11). */
const CODIGOS_DANE = [
  '05', '08', '11', '13', '15', '17', '18', '19', '20', '23', '25', '27', '41', '44', '47', '50', '52',
  '54', '63', '66', '68', '70', '73', '76', '81', '85', '86', '88', '91', '94', '95', '97', '99',
];

/**
 * Funde las filas de `tabla` que solo difieren en cómo se escribió el nombre, dentro de
 * `alcance` (o en toda la tabla). Se queda la más usada (y, a igualdad, la más antigua),
 * pasa a ella las referencias de `hija.columna` y borra las demás. Si al pasarlas una fila
 * hija quedara repetida (`claveHija`: la misma ubicación dos veces), se borra la sobrante.
 */
const fundirVariantes = (o: {
  tabla: string;
  alcance: string | null;
  hija: string;
  columna: string;
  claveHija?: string[];
}) => {
  const particion = o.alcance ? `${o.alcance}, normalizar_nombre(nombre)` : 'normalizar_nombre(nombre)';
  const tmp = `tmp_fusion_${o.tabla}`;
  const repetidas = o.claveHija
    ? `DELETE FROM ${o.hija} h USING ${tmp} f
        WHERE h.${o.columna} = f.viejo
          AND EXISTS (SELECT 1 FROM ${o.hija} h2
                       WHERE h2.${o.columna} = f.nuevo
                         AND ${o.claveHija.map((c) => `h2.${c} IS NOT DISTINCT FROM h.${c}`).join(' AND ')});`
    : '';
  return `
    CREATE TEMP TABLE ${tmp} ON COMMIT DROP AS
    SELECT id AS viejo, canonico AS nuevo
      FROM (SELECT t.id,
                   first_value(t.id) OVER (
                     PARTITION BY ${particion}
                     ORDER BY (SELECT count(*) FROM ${o.hija} h WHERE h.${o.columna} = t.id) DESC,
                              t.created_at, t.id) AS canonico
              FROM ${o.tabla} t) r
     WHERE id <> canonico;
    ${repetidas}
    UPDATE ${o.hija} h SET ${o.columna} = f.nuevo FROM ${tmp} f WHERE h.${o.columna} = f.viejo;
    DELETE FROM ${o.tabla} t USING ${tmp} f WHERE t.id = f.viejo;
  `;
};

const enUnaTransaccion = (queryInterface: QueryInterface, sentencias: string[]) =>
  queryInterface.sequelize.transaction(async (transaction) => {
    for (const sentencia of sentencias) await queryInterface.sequelize.query(sentencia, { transaction });
  });

export async function up(queryInterface: QueryInterface): Promise<void> {
  await enUnaTransaccion(queryInterface, [
    FUNCION_NORMALIZAR,

    // ── Departamentos: catálogo cerrado de 33 ───────────────────────────────────
    // Sin fusión: es cerrado y hoy no tiene variantes. Si las tuviera, el índice falla
    // y la migración no se aplica, que es lo correcto (la 032 es la que sabe fusionar).
    'ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS uq_departamentos_nombre;',
    'CREATE UNIQUE INDEX uq_departamentos_nombre ON departamentos (normalizar_nombre(nombre));',
    'ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS ck_departamentos_codigo_dane;',
    `ALTER TABLE departamentos ADD CONSTRAINT ck_departamentos_codigo_dane
       CHECK (codigo_dane IN (${CODIGOS_DANE.map((c) => `'${c}'`).join(', ')}));`,

    // ── Municipios y empresas: por nombre normalizado ───────────────────────────
    fundirVariantes({
      tabla: 'municipios',
      alcance: 'departamento_id',
      hija: 'proyectos_inversion_ubicaciones',
      columna: 'municipio_id',
      claveHija: ['proyecto_id', 'departamento_id'],
    }),
    'ALTER TABLE municipios DROP CONSTRAINT IF EXISTS uq_municipios_depto_nombre;',
    'CREATE UNIQUE INDEX uq_municipios_depto_nombre ON municipios (departamento_id, normalizar_nombre(nombre));',

    fundirVariantes({ tabla: 'empresas', alcance: null, hija: 'proyectos_inversion', columna: 'empresa_id' }),
    'DROP INDEX IF EXISTS uq_empresas_nombre;',
    'CREATE UNIQUE INDEX uq_empresas_nombre ON empresas (normalizar_nombre(nombre));',

    // ── Sobresalientes: niveles, centros y programas por código SENA ────────────
    `ALTER TABLE niveles_formacion ADD COLUMN codigo VARCHAR(20);
     ALTER TABLE niveles_formacion ADD CONSTRAINT uq_niveles_formacion_codigo UNIQUE (codigo);
     ALTER TABLE niveles_formacion ADD CONSTRAINT ck_niveles_formacion_codigo CHECK (codigo ~ '^[0-9]+$');
     ALTER TABLE niveles_formacion DROP CONSTRAINT IF EXISTS uq_niveles_formacion_nombre;`,
    `ALTER TABLE centros_formacion ADD COLUMN codigo VARCHAR(20);
     ALTER TABLE centros_formacion ADD CONSTRAINT uq_centros_formacion_codigo UNIQUE (codigo);
     ALTER TABLE centros_formacion ADD CONSTRAINT ck_centros_formacion_codigo CHECK (codigo ~ '^[0-9]+$');
     ALTER TABLE centros_formacion DROP CONSTRAINT IF EXISTS uq_centros_formacion_depto_nombre;`,
    `ALTER TABLE programas_formacion ADD COLUMN codigo VARCHAR(20);
     ALTER TABLE programas_formacion ADD CONSTRAINT uq_programas_formacion_codigo UNIQUE (codigo);
     ALTER TABLE programas_formacion ADD CONSTRAINT ck_programas_formacion_codigo CHECK (codigo ~ '^[0-9]+$');
     ALTER TABLE programas_formacion DROP CONSTRAINT IF EXISTS uq_programas_formacion_nivel_nombre;`,

    // Lo que ningún hecho usa: restos de cargas anteriores.
    `DELETE FROM programas_formacion p
      WHERE NOT EXISTS (SELECT 1 FROM programas_sobresalientes s WHERE s.programa_id = p.id);
     DELETE FROM centros_formacion c
      WHERE NOT EXISTS (SELECT 1 FROM programas_sobresalientes s WHERE s.centro_id = c.id);
     DELETE FROM niveles_formacion n
      WHERE NOT EXISTS (SELECT 1 FROM programas_formacion p WHERE p.nivel_formacion_id = n.id)
        AND NOT EXISTS (SELECT 1 FROM programas_sobresalientes s WHERE s.nivel_formacion_id = n.id);`,
  ]);
}

/**
 * Devuelve los únicos por nombre exacto y quita los códigos y la función. No devuelve las
 * filas fundidas ni las borradas sin uso. Falla sin tocar nada si ya hay dos centros con el
 * mismo nombre en un departamento o dos programas con el mismo nombre en un nivel (lo que
 * el código SENA sí permite): habría que eliminar antes la carga que los trajo.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await enUnaTransaccion(queryInterface, [
    `ALTER TABLE programas_formacion DROP COLUMN codigo;
     ALTER TABLE programas_formacion ADD CONSTRAINT uq_programas_formacion_nivel_nombre UNIQUE (nivel_formacion_id, nombre);`,
    `ALTER TABLE centros_formacion DROP COLUMN codigo;
     ALTER TABLE centros_formacion ADD CONSTRAINT uq_centros_formacion_depto_nombre UNIQUE (departamento_id, nombre);`,
    `ALTER TABLE niveles_formacion DROP COLUMN codigo;
     ALTER TABLE niveles_formacion ADD CONSTRAINT uq_niveles_formacion_nombre UNIQUE (nombre);`,

    'DROP INDEX IF EXISTS uq_empresas_nombre;',
    'CREATE UNIQUE INDEX uq_empresas_nombre ON empresas (lower(nombre));',
    'DROP INDEX IF EXISTS uq_municipios_depto_nombre;',
    'ALTER TABLE municipios ADD CONSTRAINT uq_municipios_depto_nombre UNIQUE (departamento_id, nombre);',

    'ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS ck_departamentos_codigo_dane;',
    `ALTER TABLE departamentos ADD CONSTRAINT ck_departamentos_codigo_dane CHECK (codigo_dane ~ '^[0-9]{2}$');`,
    'DROP INDEX IF EXISTS uq_departamentos_nombre;',
    'ALTER TABLE departamentos ADD CONSTRAINT uq_departamentos_nombre UNIQUE (nombre);',

    'DROP FUNCTION IF EXISTS normalizar_nombre(text);',
  ]);
}
