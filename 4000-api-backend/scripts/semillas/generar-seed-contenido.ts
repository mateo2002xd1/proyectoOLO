import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import { etiquetaLibre, volcar } from './volcado-sql';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Regenera `seed/contenido-inicial.sql` a partir de la base a la que apunte
 * `DATABASE_URL`.
 *
 * Existe para poder entregar el proyecto con contenido real dentro. Sin él, una
 * instalación nueva arranca con la base vacía: la portada del sitio se salva porque
 * tiene un respaldo estático en el código (`home-fallback-data.ts`), pero el resto del
 * sitio responde 404 y todas las secciones de la intranet dicen «Página no encontrada».
 *
 * Vuelca **solo contenido**. Lo que deja fuera y por qué está en la cabecera del propio
 * `.sql` que genera, que es donde lo va a leer quien lo aplique.
 *
 * Uso:  npm run seed:generar
 */

const SALIDA = path.join(__dirname, '..', '..', 'seed', 'contenido-inicial.sql');

/** El comentario que encabeza el archivo generado, con la fecha. */
const cabecera = (fecha: string) => `-- Contenido inicial del OLO. GENERADO, no editar a mano.
--
-- Qué lleva: las páginas del sitio y de la intranet con su versión PUBLICADA, el árbol
-- de secciones, los contenidos (estudios/informes/banners), la identidad visual
-- (marca_versiones) y las políticas de privacidad vigentes. Es lo que hace falta para
-- que el portal cargue completo, con contenido real, en una instalación nueva.
--
-- Qué NO lleva, a propósito:
--   * usuarios, auditoria_cambios, auditoria_accesos y preguntas_seguridad -> datos
--     personales o historial de actividad de la instalación de origen (Ley 1581). Las
--     columnas que apuntaban a un usuario (creado_por, revisor_id, publicado_por,
--     actualizado_por, autor_id, revisado_por, aprobado_por) se vuelcan como NULL: son
--     trazabilidad, y la de otra instalación no significa nada. Una instalación nueva
--     nace sin usuarios; el único administrador se crea con \`./deploy.sh crear-admin\`.
--   * roles, permisos y roles_permisos -> los siembran las migraciones 012, 016 y 019, y
--     el reconciliador \`npm run sembrar:permisos\` (corre solo en cada deploy).
--   * archivos, contenidos_archivos y _obsoleto_attachment -> metadatos de subidas con
--     rutas de disco que no persisten en el contenedor de origen ni viajan con este
--     archivo. Si \`marca_versiones.tokens\` referencia un logotipo por su archivo_id,
--     esa referencia llega rota hasta que alguien lo vuelva a subir en la instalación
--     nueva -- no es un bug de este script, es que los archivos no viajan.
--   * consentimientos, respaldos, notificaciones y tableros_bi -> historial operativo o
--     datos de prueba de la instalación de origen, no contenido del sitio.
--   * las versiones de página y los contenidos en borrador, en revisión, rechazados o
--     archivados -> son trabajo a medias de la instalación de origen. Solo viaja lo
--     publicado, que es lo que se ve.
--
-- Se aplica DESPUÉS de las migraciones, con \`./deploy.sh sembrar\`. Es idempotente, así
-- que ejecutarlo dos veces no duplica nada.
--
-- Regenerar desde una base al día:  npm run seed:generar
-- Generado el ${fecha}
`;

/** Escribe `seed/contenido-inicial.sql` con las páginas y versiones de la base actual. */
const generar = async (): Promise<void> => {
  await sequelize.authenticate();

  // El delimitador de las cadenas no puede aparecer dentro de ningún dato, o cortaría
  // la cita por la mitad. Se comprueba contra el contenido real y se alarga si hiciera falta.
  const muestra = JSON.stringify(
    await sequelize.query('SELECT contenido FROM paginas_versiones', { type: QueryTypes.SELECT })
  );
  const tag = etiquetaLibre(muestra);

  const partes: string[] = [cabecera(new Date().toISOString()), '\nBEGIN;\n'];

  // `paginas.version_publicada_id` apunta a `paginas_versiones` y `paginas_versiones.pagina_id`
  // apunta de vuelta: es circular. Se insertan las páginas sin esa referencia, luego las
  // versiones, y al final se enlazan.
  const paginas = await volcar('paginas', { tag, omitir: ['version_publicada_id'] });
  partes.push('\n-- 1. Páginas (sin enlazar aún su versión publicada: la referencia es circular)\n', paginas.sql);

  const versiones = await volcar('paginas_versiones', { tag, filtro: " WHERE estado = 'publicado'" });
  partes.push('\n-- 2. Versión publicada de cada página\n', versiones.sql);

  const enlaces = await sequelize.query<{ id: string; version_publicada_id: string }>(
    'SELECT id, version_publicada_id FROM paginas WHERE version_publicada_id IS NOT NULL',
    { type: QueryTypes.SELECT }
  );
  partes.push('\n-- 3. Enlazar cada página con su versión publicada\n');
  for (const enlace of enlaces) {
    partes.push(
      `UPDATE "paginas" SET "version_publicada_id" = '${enlace.version_publicada_id}' WHERE "id" = '${enlace.id}';\n`
    );
  }

  const configuraciones = await volcar('configuraciones', { tag });
  partes.push('\n-- 4. Configuraciones (identidad visual)\n', configuraciones.sql);

  // `secciones.padre_id` es autorreferenciada (ON DELETE RESTRICT): ordenar por `nivel`
  // (1 a 3) garantiza que cada sección padre se inserte antes que sus hijas.
  const secciones = await volcar('secciones', { tag, filtro: ' ORDER BY nivel ASC' });
  partes.push('\n-- 5. Secciones (árbol de navegación, padres antes que hijas)\n', secciones.sql);

  // `contenidos.seccion_id` referencia `secciones`: va después. Mismo criterio que
  // `paginas_versiones`: solo lo publicado, no trabajo a medias de la instalación de
  // origen.
  const contenidos = await volcar('contenidos', { tag, filtro: " WHERE estado = 'publicado'" });
  partes.push('\n-- 6. Contenidos publicados (estudios, informes, estadísticas, banners)\n', contenidos.sql);

  const marca = await volcar('marca_versiones', { tag });
  partes.push('\n-- 7. Identidad visual (marca_versiones)\n', marca.sql);

  const politicas = await volcar('politicas_privacidad', { tag });
  partes.push('\n-- 8. Políticas de privacidad vigentes\n', politicas.sql, '\nCOMMIT;\n');

  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, partes.join(''), 'utf8');

  const kb = (fs.statSync(SALIDA).size / 1024).toFixed(0);
  console.log(`Generado seed/contenido-inicial.sql (${kb} KB)`);
  console.log(
    `  páginas: ${paginas.n} | versiones publicadas: ${versiones.n} | ` +
      `enlaces: ${enlaces.length} | configuraciones: ${configuraciones.n} | ` +
      `secciones: ${secciones.n} | contenidos: ${contenidos.n} | ` +
      `marca_versiones: ${marca.n} | politicas_privacidad: ${politicas.n}`
  );
};

generar()
  .then(() => sequelize.close())
  .catch(async (error: Error) => {
    console.error('Error generando la semilla:', error.message);
    await sequelize.close();
    process.exit(1);
  });
