import { QueryInterface } from 'sequelize';

export const nombre = '017-titulo-menu-y-pie';

const SLUG = 'menu-y-pie';
const TITULO_VIEJO = 'plantilla';
const TITULO_NUEVO = 'Menú y pie de página';

/**
 * Pone un título legible a la página del menú y el pie.
 *
 * La 014 renombró el slug y dejó el `titulo` como estaba: `plantilla`. No es un detalle
 * cosmético — `revision-queue-view.tsx` pinta ese campo, así que en la cola de
 * aprobación, justo donde alguien decide si aprueba un cambio a la cabecera y el pie
 * de **todo** el portal, seguía leyéndose «plantilla». Es la misma confusión que la 014
 * fue a quitar de la bitácora, en una pantalla donde importa más todavía porque de ahí
 * sale una decisión.
 *
 * El título venía de `guardarBorrador`, que crea las páginas con `titulo: slug` cuando
 * no hay nada mejor. Desde que las secciones se crean desde el editor eso ya no pasa:
 * `crear-seccion.usecase.ts` guarda el nombre que escribió la persona.
 *
 * Va acotada por el título viejo además de por el slug: si alguien ya le puso un nombre
 * a mano, esto no se lo pisa.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `UPDATE paginas
        SET titulo = :nuevo, updated_at = now()
      WHERE slug = :slug AND titulo = :viejo`,
    { replacements: { slug: SLUG, viejo: TITULO_VIEJO, nuevo: TITULO_NUEVO } }
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `UPDATE paginas
        SET titulo = :viejo, updated_at = now()
      WHERE slug = :slug AND titulo = :nuevo`,
    { replacements: { slug: SLUG, viejo: TITULO_VIEJO, nuevo: TITULO_NUEVO } }
  );
}
