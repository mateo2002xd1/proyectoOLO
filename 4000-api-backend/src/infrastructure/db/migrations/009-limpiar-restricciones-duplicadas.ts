import { QueryInterface } from 'sequelize';

export const nombre = '009-limpiar-restricciones-duplicadas';

/**
 * Quita las restricciones UNIQUE repetidas que dejó `sequelize.sync({ alter: true })`.
 *
 * Cada vez que ese sync corría volvía a añadir la misma restricción con el nombre
 * siguiente (`usuarios_email_key1`, `..._key2`, ...), y llegó a acumular más de
 * sesenta copias por columna en `secciones`, `permisos`, `roles`, `contenidos`,
 * `usuarios` y `FileStatuses`. La 008 ya limpió `paginas`, donde además impedían que
 * el ámbito funcionara; estas otras no rompían nada, solo sobran: cada copia es un
 * índice más que la base mantiene en cada escritura.
 *
 * De cada grupo de restricciones idénticas se conserva la más antigua (menor `oid`),
 * que es la que las claves foráneas referencian, y se borran las demás. Comparar por
 * definición y no por nombre es lo que hace esto seguro: los nombres numerados son
 * accidentales y su cantidad varía según cuántas veces corrió el sync en cada entorno.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    DO $$
    DECLARE restriccion RECORD;
    BEGIN
      FOR restriccion IN
        SELECT tabla, conname
          FROM (
            SELECT conrelid::regclass::text AS tabla,
                   conname,
                   ROW_NUMBER() OVER (
                     PARTITION BY conrelid, pg_get_constraintdef(oid)
                     ORDER BY oid
                   ) AS copia
              FROM pg_constraint
             WHERE contype = 'u'
               AND connamespace = 'public'::regnamespace
          ) agrupadas
         WHERE copia > 1
      LOOP
        EXECUTE format(
          'ALTER TABLE %s DROP CONSTRAINT %I',
          restriccion.tabla,
          restriccion.conname
        );
      END LOOP;
    END $$;
  `);
}

/**
 * No se revierte: recrear copias redundantes de una restricción que ya existe no
 * devuelve la base a un estado útil, solo reintroduce el lastre.
 */
export async function down(): Promise<void> {
  // Intencionalmente vacío.
}
