import { QueryInterface } from 'sequelize';

export const nombre = '020-bloqueos-edicion';

/**
 * Un candado por página para que dos personas no editen lo mismo a la vez.
 *
 * Hasta ahora la edición era colaborativa a propósito, pero sin ninguna fusión
 * detrás: el editor no guarda nada hasta que alguien pulsa «Guardar borrador», así
 * que dos personas trabajando sobre la misma sección producían dos versiones
 * completas del contenido y la segunda en guardar borraba el trabajo de la primera
 * sin que nadie se enterara. Este candado corta eso en la puerta: quien llega
 * segundo no entra, y se le dice quién está dentro.
 *
 * ## Por qué en Postgres y no en Redis
 *
 * Redis tiene TTL nativo y sería lo natural para un candado efímero. Pero aquí Redis
 * es opcional —la caché y las colas degradan a BYPASS cuando no está, y en
 * desarrollo local no está—, y un candado que no cierra cuando falta Redis es peor
 * que no tener candado: da una garantía que no se cumple justo cuando nadie mira. En
 * la base siempre está, y el TTL se resuelve comparando `expira_en` en la consulta.
 *
 * ## Por qué `usuario_id` es TEXT y no UUID con clave foránea
 *
 * La cuenta maestra de desarrollo (`LOCAL_AUTH_*`, ver `config/index.ts`) no vive en
 * `usuarios`: su token lleva `id: 'local-auth'`, que no es un UUID. Con `UUID
 * REFERENCES usuarios(id)` el candado reventaría precisamente en el entorno donde
 * más se prueba. `usuario_nombre` se desnormaliza por la misma razón que en
 * `auditoria_cambios`: hay que poder decir quién está dentro sin un JOIN que para la
 * cuenta local no existiría.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // La pareja (ámbito, slug) es la identidad de la fila: el sitio y la intranet
  // tienen cada uno su `/inicio`, y son dos páginas distintas que se editan aparte.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS bloqueos_edicion (
      ambito         TEXT NOT NULL CHECK (ambito IN ('sitio', 'intranet')),
      slug           TEXT NOT NULL,
      usuario_id     TEXT NOT NULL,
      usuario_nombre TEXT NOT NULL,
      adquirido_en   TIMESTAMPTZ NOT NULL DEFAULT now(),
      expira_en      TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (ambito, slug)
    );
  `);

  // Para poder barrer los caducados sin recorrer la tabla entera.
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_bloqueos_edicion_expira
      ON bloqueos_edicion (expira_en);
  `);
}

/**
 * Quita la tabla entera.
 *
 * Aquí sí se puede borrar sin remordimientos: un candado caducado no vale nada y no
 * hay historial que preservar. Lo único que pasa al revertir es que se vuelve a la
 * edición sin candado de antes.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS bloqueos_edicion;');
}
