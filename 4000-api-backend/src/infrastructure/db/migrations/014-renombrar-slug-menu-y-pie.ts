import { QueryInterface, QueryTypes } from 'sequelize';

export const nombre = '014-renombrar-slug-menu-y-pie';

/** El slug que se retira. */
const VIEJO = 'plantilla';

/** El slug nuevo. Debe coincidir con `SLUG_PLANTILLA` de `shared/catalogo-permisos.ts`. */
const NUEVO = 'menu-y-pie';

/**
 * Renombra el slug de la página que guarda el menú y el pie: `plantilla` → `menu-y-pie`.
 *
 * ## Por qué
 *
 * El slug no es solo una ruta: `pagina.controller.ts` lo escribe en la bitácora como
 * campo modificado de cada publicación y aprobación. Quien audita leía `slug → plantilla`
 * y no tenía forma de saber si eso fue tocar una página o cambiar la cabecera y el pie de
 * TODAS. `menu-y-pie` se lee solo, y va en español como el resto de slugs del sistema
 * (`inicio`, `tasa`, `encuestas-seguimiento-laboral`).
 *
 * ## Las dos tablas
 *
 * 1. **`paginas`** — una fila por ámbito (sitio e intranet). Las versiones cuelgan de
 *    `pagina_id`, así que no hay que tocarlas: siguen apuntando a la misma fila.
 *
 * 2. **`permisos`** — las claves `editar.{ambito}.plantilla` se construyen desde el slug
 *    (`claveDeSeccion`). Aquí está lo que hay que hacer bien: se hace **UPDATE de la
 *    clave conservando el `id`**, no un INSERT de la nueva y DELETE de la vieja. La
 *    tabla `roles_permisos` referencia el permiso por UUID; borrar la fila se llevaría
 *    por delante todas las concesiones, y quien tuviera «Menú y pie de página» lo
 *    perdería **en silencio** — sin error, sin aviso, solo el botón de editar que ya no
 *    aparece. Con UPDATE el UUID no cambia y ningún rol se entera.
 *
 * ## Lo que NO se toca
 *
 * Los registros de auditoría ya escritos siguen diciendo `plantilla`, y así debe ser: la
 * bitácora es evidencia (RF-07, Ley 1581) y reescribir lo que ya ocurrió la invalida como
 * tal. Los registros nuevos dirán `menu-y-pie`; el corte queda datado por la fecha de esta
 * migración.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // El índice único es `(ambito, slug)`. Si alguien ya creó una página con el slug nuevo
  // en algún ámbito, el UPDATE reventaría con un error de constraint que no explica nada;
  // esto falla antes y dice qué pasa y dónde.
  //
  // La comprobación va en TypeScript y no en un `DO $$ ... $$`: los `replacements` de
  // Sequelize son una sustitución de texto sobre el SQL entero y también entran dentro
  // del dollar-quoting, así que un guard escrito ahí depende de un detalle del driver.
  const chocan = (await sql.query(`SELECT ambito FROM paginas WHERE slug = :nuevo`, {
    replacements: { nuevo: NUEVO },
    type: QueryTypes.SELECT,
  })) as { ambito: string }[];

  if (chocan.length > 0) {
    throw new Error(
      `Ya existe una página con el slug "${NUEVO}" en: ${chocan
        .map((fila) => fila.ambito)
        .join(', ')}. Renómbrala o bórrala antes de aplicar esta migración.`
    );
  }

  await sql.query(
    `UPDATE paginas
        SET slug = :nuevo, updated_at = now()
      WHERE slug = :viejo`,
    { replacements: { viejo: VIEJO, nuevo: NUEVO } }
  );

  // Conserva el `id`: ver la nota de arriba sobre `roles_permisos`.
  await sql.query(
    `UPDATE permisos
        SET clave = replace(clave, :sufijoViejo, :sufijoNuevo), updated_at = now()
      WHERE clave LIKE 'editar.%' AND clave LIKE :patronViejo`,
    {
      replacements: {
        sufijoViejo: `.${VIEJO}`,
        sufijoNuevo: `.${NUEVO}`,
        patronViejo: `%.${VIEJO}`,
      },
    }
  );
}

/**
 * Deshace el renombrado. Es exacto: `up` no crea ni borra filas, solo cambia dos textos,
 * así que revertirlo devuelve la base al estado previo — incluidos los UUID de permiso,
 * que nunca se movieron.
 *
 * Lo único que no vuelve atrás son los registros de auditoría escritos entre medias, que
 * dirán `menu-y-pie`. Es correcto: describen lo que de verdad pasó cuando pasó.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(
    `UPDATE paginas
        SET slug = :viejo, updated_at = now()
      WHERE slug = :nuevo`,
    { replacements: { viejo: VIEJO, nuevo: NUEVO } }
  );

  await sql.query(
    `UPDATE permisos
        SET clave = replace(clave, :sufijoNuevo, :sufijoViejo), updated_at = now()
      WHERE clave LIKE 'editar.%' AND clave LIKE :patronNuevo`,
    {
      replacements: {
        sufijoViejo: `.${VIEJO}`,
        sufijoNuevo: `.${NUEVO}`,
        patronNuevo: `%.${NUEVO}`,
      },
    }
  );
}
