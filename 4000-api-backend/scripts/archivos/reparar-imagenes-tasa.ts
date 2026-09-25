/**
 * Corrige las rutas de imágenes que dejaron de existir en la página de Tasa.
 *
 * `vinculacion.png` y `sabiasque.png` se borraron del repositorio y se sustituyeron
 * por `vinculacion1.png` y `empleabilidad.png`, pero el contenido guardado seguía
 * apuntando a los nombres viejos y las gráficas salían rotas.
 *
 * Se reescriben todas las versiones y no solo la publicada: un borrador pendiente
 * arrastra las mismas rutas y volvería a romperlo al aprobarlo. Es una reparación
 * de enlaces, no un cambio editorial, así que no crea una versión nueva.
 */
import 'dotenv/config';
import sequelize from '../../src/config/database';
import { Pagina, PaginaVersion } from '../../src/infrastructure/db/models';

const RENOMBRADAS: Record<string, string> = {
  '/assets/img/vinculacion.png': '/assets/img/vinculacion1.png',
  '/assets/img/sabiasque.png': '/assets/img/empleabilidad.png',
  '/assets/img/SabiasQue.png': '/assets/img/empleabilidad.png',
};

const reparar = async (): Promise<void> => {
  await sequelize.authenticate();

  const pagina = await Pagina.findOne({ where: { slug: 'tasa', ambito: 'intranet' } });
  if (!pagina) {
    console.log("No existe la página 'tasa' en la intranet. Nada que reparar.");
    return;
  }

  const versiones = await PaginaVersion.findAll({
    where: { paginaId: pagina.id },
    order: [['numeroVersion', 'ASC']],
  });

  let tocadas = 0;

  for (const version of versiones) {
    const original = JSON.stringify(version.contenido);
    let corregido = original;

    for (const [vieja, nueva] of Object.entries(RENOMBRADAS)) {
      corregido = corregido.split(vieja).join(nueva);
    }

    if (corregido === original) continue;

    await version.update({ contenido: JSON.parse(corregido) });
    tocadas += 1;
    console.log(`  v${version.numeroVersion} (${version.estado}): rutas corregidas`);
  }

  console.log(
    tocadas === 0
      ? 'Ninguna versión apuntaba a las imágenes viejas.'
      : `Listo: ${tocadas} de ${versiones.length} versión(es) corregidas.`
  );
};

reparar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
