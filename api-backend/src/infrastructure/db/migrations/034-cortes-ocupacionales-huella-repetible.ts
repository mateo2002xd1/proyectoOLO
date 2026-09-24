import { QueryInterface } from 'sequelize';

export const nombre = '034-cortes-ocupacionales-huella-repetible';

/**
 * Dos cortes pueden tener el mismo contenido.
 *
 * La 033 hizo `huella_datos` única (la validación V10 de la especificación): el mismo
 * Excel no podía quedar en dos celdas año × periodo, pensando en un archivo subido a la
 * celda equivocada. En la práctica los datos sí se repiten entre periodos —el usuario
 * carga el mismo archivo en otro periodo a propósito— y V10 lo bloqueaba con «Este mismo
 * contenido ya está cargado en…». Se quitó la validación del cargador, y aquí la
 * restricción, que la habría seguido rechazando al guardar el corte.
 *
 * La huella se sigue guardando: no cuesta nada y permite saber, si hace falta, qué cortes
 * comparten contenido.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    'ALTER TABLE cortes_ocupacionales DROP CONSTRAINT IF EXISTS uq_cortes_ocupacionales_huella;'
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // Con cortes repetidos la restricción no se puede volver a crear: se conserva la huella
  // del corte más antiguo de cada grupo y las demás quedan en NULL (que UNIQUE admite).
  await sql.query(`
    UPDATE cortes_ocupacionales c
       SET huella_datos = NULL
     WHERE EXISTS (SELECT 1 FROM cortes_ocupacionales o
                    WHERE o.huella_datos = c.huella_datos AND o.id < c.id);
  `);
  await sql.query(
    'ALTER TABLE cortes_ocupacionales ADD CONSTRAINT uq_cortes_ocupacionales_huella UNIQUE (huella_datos);'
  );
}
