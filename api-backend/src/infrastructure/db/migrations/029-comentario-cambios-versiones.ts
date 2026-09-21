import { QueryInterface, DataTypes } from 'sequelize';

export const nombre = '029-comentario-cambios-versiones';

/**
 * El «commit» de cada versión: lo que quien edita escribe al enviarla a revisión.
 *
 * Va en la versión y no solo en la bitácora porque aprobar, rechazar y descartar
 * ocurren después, las hace otra persona y también tienen que dejarlo escrito en su
 * propia fila de `auditoria_cambios`. Sin la columna, cada una tendría que ir a
 * buscar en la bitácora el último envío de esa página y confiar en que fuera el de
 * esta versión.
 *
 * `VARCHAR(100)` es la regla del producto (máximo 100 caracteres), no un tope
 * técnico: la validación de la API y la de los editores dicen lo mismo — ver
 * `shared/comentario-cambios.ts`.
 *
 * El `CHECK` es la invariante I14, gemela de la I4 (`ck_paginas_versiones_motivo`):
 * una versión no puede estar esperando aprobación sin decir qué trae. Las que ya
 * estaban en la cola al aplicar esto se rellenan con un texto que dice la verdad, en
 * vez de dejarlas fuera del `CHECK` con `NOT VALID` para siempre.
 */
const TEXTO_RELLENO = 'Enviada antes de que el comentario fuera obligatorio';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('paginas_versiones', 'comentario_cambios', {
    type: DataTypes.STRING(100),
    allowNull: true,
  });

  await queryInterface.sequelize.query(
    `UPDATE paginas_versiones
        SET comentario_cambios = :relleno
      WHERE estado = 'en_revision' AND comentario_cambios IS NULL;`,
    { replacements: { relleno: TEXTO_RELLENO } }
  );

  await queryInterface.sequelize.query(`
    ALTER TABLE paginas_versiones
      ADD CONSTRAINT ck_paginas_versiones_comentario
      CHECK (estado <> 'en_revision' OR btrim(coalesce(comentario_cambios, '')) <> '');
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE paginas_versiones DROP CONSTRAINT IF EXISTS ck_paginas_versiones_comentario;
  `);
  await queryInterface.removeColumn('paginas_versiones', 'comentario_cambios');
}
