/**
 * Verifica que el ámbito aísla de verdad las páginas del sitio y de la intranet.
 *
 * Prueba lo que antes fallaba: buscar por slug sin ámbito devolvía la página de la
 * otra aplicación, y guardar un borrador creaba la página siempre bajo 'sitio'.
 *
 * Los datos que crea son temporales y se borran al final, pase o falle.
 */
import 'dotenv/config';
import { Op } from 'sequelize';
import sequelize from '../../src/config/database';
import { Pagina, PaginaVersion } from '../../src/infrastructure/db/models';
import { obtenerVersionEditable } from '../../src/use-cases/paginas/obtener-version-editable.usecase';
import { guardarBorrador } from '../../src/use-cases/paginas/guardar-borrador.usecase';

const SLUG_PRUEBA = '__prueba-ambito__';

/**
 * Slug que la prueba crea **solo** en el sitio, para comprobar que no se filtra a la
 * intranet. Antes esto se verificaba contra la página real `inicio`, dando por hecho
 * que la de intranet estaba vacía; en cuanto alguien le puso contenido de verdad la
 * prueba empezó a fallar sin que hubiera ningún fallo en el código. Una prueba se trae
 * sus propios datos.
 */
const SLUG_SOLO_SITIO = '__prueba-solo-en-sitio__';

/** Bloques de un contenido Puck, sin dar por hecho su forma. */
const bloquesDe = (contenido: unknown): unknown[] => {
  const puck = contenido as { content?: unknown[] } | null | undefined;
  return Array.isArray(puck?.content) ? puck.content : [];
};

/** El marcador `tipo` que esta prueba escribe en el primer bloque. */
const tipoDelPrimerBloque = (contenido: unknown): string | undefined =>
  (bloquesDe(contenido)[0] as { tipo?: string } | undefined)?.tipo;

let fallos = 0;

/** Imprime OK o FALLA para una comprobación y cuenta los fallos. */
const comprobar = (descripcion: string, condicion: boolean, detalle?: unknown) => {
  console.log(`  ${condicion ? 'OK  ' : 'FALLA'}  ${descripcion}`);
  if (!condicion) {
    fallos += 1;
    if (detalle !== undefined) console.log('          recibido:', JSON.stringify(detalle));
  }
};

/** Borra las páginas de prueba que crea esta verificación. */
const limpiar = async () => {
  const paginas = await Pagina.findAll({
    where: { slug: { [Op.in]: [SLUG_PRUEBA, SLUG_SOLO_SITIO] } },
  });
  for (const pagina of paginas) {
    await PaginaVersion.destroy({ where: { paginaId: pagina.id } });
    await pagina.destroy();
  }
};

/** Comprueba que el mismo slug en los dos ámbitos son páginas distintas y que nada se filtra. */
const verificar = async (): Promise<void> => {
  await sequelize.authenticate();
  await limpiar();

  console.log('\n=== A. El mismo slug en dos ámbitos son páginas distintas ===');

  await guardarBorrador(SLUG_PRUEBA, { content: [{ tipo: 'del-sitio' }] }, '', 'sitio');
  await guardarBorrador(SLUG_PRUEBA, { content: [{ tipo: 'de-intranet' }] }, '', 'intranet');

  const filas = await Pagina.findAll({ where: { slug: SLUG_PRUEBA }, order: [['ambito', 'ASC']] });
  comprobar(
    'se crean 2 filas para el mismo slug, una por ámbito',
    filas.length === 2,
    filas.map((f) => f.ambito)
  );
  comprobar(
    'cada fila guarda su ámbito real (antes todo caía en "sitio")',
    filas.map((f) => f.ambito).join(',') === 'intranet,sitio',
    filas.map((f) => f.ambito)
  );

  console.log('\n=== B. Cada ámbito lee su propio contenido ===');

  const delSitio = await obtenerVersionEditable(SLUG_PRUEBA, 'sitio');
  const deIntranet = await obtenerVersionEditable(SLUG_PRUEBA, 'intranet');

  comprobar(
    'el sitio recibe el contenido del sitio',
    tipoDelPrimerBloque(delSitio.contenido) === 'del-sitio',
    delSitio.contenido
  );
  comprobar(
    'la intranet recibe el contenido de la intranet',
    tipoDelPrimerBloque(deIntranet.contenido) === 'de-intranet',
    deIntranet.contenido
  );

  console.log('\n=== C. Un slug que solo existe en un ámbito no se filtra al otro ===');

  // Se crea a propósito en un solo ámbito. No se usa una página real (`inicio`) porque
  // entonces la prueba mediría el estado de la base y no el aislamiento por ámbito.
  await guardarBorrador(SLUG_SOLO_SITIO, { content: [{ tipo: 'solo-sitio' }] }, '', 'sitio');

  const soloEnSitio = await obtenerVersionEditable(SLUG_SOLO_SITIO, 'sitio');
  const mismoSlugEnIntranet = await obtenerVersionEditable(SLUG_SOLO_SITIO, 'intranet');

  comprobar(
    'el ámbito donde se creó conserva su contenido',
    tipoDelPrimerBloque(soloEnSitio.contenido) === 'solo-sitio',
    soloEnSitio.contenido
  );
  comprobar(
    'el otro ámbito arranca vacío en vez de heredar el contenido ajeno',
    bloquesDe(mismoSlugEnIntranet.contenido).length === 0 && mismoSlugEnIntranet.versionId === null,
    mismoSlugEnIntranet
  );

  await limpiar();

  console.log(`\n${fallos === 0 ? 'Todo correcto.' : `${fallos} comprobación(es) fallaron.`}\n`);
};

verificar()
  .then(async () => {
    await sequelize.close();
    process.exit(fallos === 0 ? 0 : 1);
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await limpiar().catch(() => undefined);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
