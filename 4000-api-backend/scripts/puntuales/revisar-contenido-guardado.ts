/**
 * Revisa el contenido ya guardado de todas las páginas y dice qué versiones traen HTML
 * peligroso: `<script>`, `<iframe>`, atributos `onerror`/`onclick`, enlaces `javascript:`.
 *
 * Hasta el 2026-09-25 el saneo no cubría el texto enriquecido de EditorJS, los campos
 * `intro` ni los bloques de una `DropZone`: lo que se guardó antes pudo entrar sin
 * limpiar. Desde entonces se sanea al guardar, al aprobar y al restaurar; esto es para lo
 * que ya estaba en la base.
 *
 *   npm run contenido:revisar                 # solo informa, no cambia nada
 *   npm run contenido:revisar -- --aplicar    # sanea esas versiones en la base
 *
 * Sale con código 1 si encuentra algo y no se pidió `--aplicar`.
 */
import 'dotenv/config';
import sequelize from '../../src/config/database';
import { Pagina, PaginaVersion } from '../../src/infrastructure/db/models';
import { htmlPeligrosoEn, sanitizarContenidoPuck } from '../../src/shared/sanitizar-contenido';

async function main() {
  const aplicar = process.argv.includes('--aplicar');
  await sequelize.authenticate();

  const paginas = new Map((await Pagina.findAll({ attributes: ['id', 'slug', 'ambito'] })).map((p) => [p.id, p]));
  const versiones = await PaginaVersion.findAll({
    attributes: ['id', 'paginaId', 'numeroVersion', 'estado', 'contenido', 'layout'],
    order: [['paginaId', 'ASC'], ['numeroVersion', 'ASC']],
  });
  console.log(`Revisando ${versiones.length} versiones de ${paginas.size} páginas…`);

  const conPeligro = versiones
    .map((v) => ({ v, hallado: [...htmlPeligrosoEn(v.contenido), ...htmlPeligrosoEn(v.layout)] }))
    .filter(({ hallado }) => hallado.length > 0);

  for (const { v, hallado } of conPeligro) {
    const p = paginas.get(v.paginaId);
    const quien = p ? `${p.ambito}/${p.slug}` : `página ${v.paginaId}`;
    const muestra = [...new Set(hallado)].slice(0, 4).join(', ');
    console.log(`  ⚠ ${quien} · versión ${v.numeroVersion} (${v.estado}): ${muestra}${hallado.length > 4 ? ` y ${hallado.length - 4} más` : ''}`);
  }

  const publicadas = conPeligro.filter(({ v }) => v.estado === 'publicado').length;
  console.log(`\n${conPeligro.length} versiones con HTML peligroso (${publicadas} publicadas).`);

  if (conPeligro.length === 0) {
    await sequelize.close();
    return;
  }
  if (!aplicar) {
    console.log('No se cambió nada. Para sanearlas: npm run contenido:revisar -- --aplicar');
    await sequelize.close();
    process.exitCode = 1;
    return;
  }

  await sequelize.transaction(async (transaction) => {
    for (const { v } of conPeligro) {
      await v.update(
        {
          contenido: sanitizarContenidoPuck(v.contenido),
          ...(v.layout ? { layout: sanitizarContenidoPuck(v.layout) } : {}),
        },
        { transaction },
      );
    }
  });
  console.log(`Saneadas ${conPeligro.length} versiones.`);
  if (publicadas) {
    console.log('Las páginas publicadas pueden seguir en caché un rato. Para verlas limpias al momento, vuelve a aprobarlas.');
  }
  await sequelize.close();
}

main().catch(async (error) => {
  console.error('Error revisando el contenido:', error);
  await sequelize.close().catch(() => undefined);
  process.exit(1);
});
