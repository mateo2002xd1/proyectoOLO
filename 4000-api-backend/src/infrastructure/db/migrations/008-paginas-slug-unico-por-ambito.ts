import { QueryInterface } from 'sequelize';

export const nombre = '008-paginas-slug-unico-por-ambito';

/**
 * Termina lo que 007 dejó a medias: que el slug sea único por ámbito y no a secas.
 *
 * 007 creó `uq_paginas_ambito_slug` y quiso quitar la unicidad vieja con
 * `DROP CONSTRAINT IF EXISTS paginas_slug_key`, pero esa restricción no se llamaba
 * así. En la base había decenas de copias numeradas (`paginas_slug_key1`,
 * `paginas_slug_key2`, ...) que dejó `sequelize.sync({ alter: true })` al correr una
 * y otra vez antes de que existieran las migraciones; el `IF EXISTS` no encontró
 * ninguna y pasó de largo sin error.
 *
 * El resultado era que `ambito` no servía de nada: la base seguía impidiendo que el
 * sitio y la intranet tuvieran cada uno su `/inicio`.
 *
 * Se borran por definición y no por nombre, porque los nombres son accidentales y
 * su cantidad varía según cuántas veces se ejecutó el sync en cada entorno.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    DO $$
    DECLARE restriccion RECORD;
    BEGIN
      FOR restriccion IN
        SELECT conname
          FROM pg_constraint
         WHERE conrelid = 'paginas'::regclass
           AND contype = 'u'
           AND pg_get_constraintdef(oid) = 'UNIQUE (slug)'
      LOOP
        EXECUTE format('ALTER TABLE paginas DROP CONSTRAINT %I', restriccion.conname);
      END LOOP;
    END $$;
  `);

  // La unicidad correcta debe existir sí o sí al terminar: si 007 corrió, ya está y
  // esto es un no-op; si no, la deja puesta igual.
  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_paginas_ambito_slug ON paginas (ambito, slug);
  `);
}

/**
 * No se restaura la unicidad por slug a secas: volver a ponerla rompería cualquier
 * página que la intranet haya creado con un slug que el sitio ya usaba, que es
 * justo el caso que esta migración habilita. Revertir de verdad exige antes decidir
 * cuál de las dos páginas se elimina, y eso no se hace en automático.
 */
export async function down(): Promise<void> {
  // Intencionalmente vacío.
}
