import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import sequelize from '../src/config/database';
import type { Ambito } from '../src/shared/ambito';
import { listarVersionesArchivadas } from '../src/use-cases/paginas/listar-versiones-archivadas.usecase';
import { restaurarVersionAnterior } from '../src/use-cases/paginas/restaurar-version-anterior.usecase';
import { PaginaRepository } from '../src/repositories/pagina.repository';
import { Pagina, PaginaVersion } from '../src/infrastructure/db/models';
import {
  resolverDirectorioUploads,
  resolverDirectorioBackup,
  extraerRutasUploads,
  listarArchivosEnBackup,
} from '../src/shared/storage/backup-uploads.service';

function obtenerAmbito(args: string[]): Ambito {
  const argAmbito = args.find((a) => a.startsWith('--ambito='));
  if (argAmbito) {
    const valor = argAmbito.split('=')[1]?.toLowerCase();
    if (valor === 'sitio' || valor === 'intranet') {
      return valor;
    }
  }
  return 'intranet';
}

function obtenerComandoYParametros(args: string[]) {
  const argumentosLimpios = args.filter((a) => !a.startsWith('--ambito='));
  const comando = argumentosLimpios[0]?.toLowerCase();
  const parametro = argumentosLimpios[1];
  return { comando, parametro };
}

async function ejecutarListar(ambito: Ambito) {
  console.log(`\n======================================================================`);
  console.log(`PÁGINAS CON VERSIONES ARCHIVADAS DISPONIBLES (Ámbito: ${ambito.toUpperCase()})`);
  console.log(`======================================================================\n`);

  const paginas = await listarVersionesArchivadas(ambito);

  if (paginas.length === 0) {
    console.log(`No hay páginas en "${ambito}" con versiones archivadas previas.\n`);
    return;
  }

  const tabla = paginas.map((p) => ({
    'Slug': p.slug,
    'Título': p.titulo,
    'Versión Archivada (Nº)': `v${p.versionArchivadaNumero}`,
    'Fecha Publicación': p.versionArchivadaPublicadoEn
      ? new Date(p.versionArchivadaPublicadoEn).toLocaleString()
      : 'N/A',
    'Archivos que usa': p.archivosQueUsa.length,
    'Archivos en backup': p.archivosEnBackup.length,
  }));

  console.table(tabla);

  console.log(`\nDetalle de recursos por página:`);
  for (const p of paginas) {
    console.log(`\n• [${p.slug}] (ID: ${p.paginaId})`);
    console.log(`  Archivos que usa la versión archivada:`);
    if (p.archivosQueUsa.length === 0) {
      console.log(`    (Ninguno)`);
    } else {
      p.archivosQueUsa.forEach((a) => console.log(`    - ${a}`));
    }
    console.log(`  Archivos físicamente en backup:`);
    if (p.archivosEnBackup.length === 0) {
      console.log(`    (Carpeta creada pero sin archivos)`);
    } else {
      p.archivosEnBackup.forEach((a) => console.log(`    - ${a}`));
    }
  }
  console.log(`\nPara restaurar una de estas páginas, ejecuta:`);
  console.log(`  npm run probar:versionamiento -- restaurar <slug> --ambito=${ambito}\n`);
}

async function ejecutarEstado(identificador: string | undefined, ambito: Ambito) {
  if (!identificador) {
    console.error('Error: Debes especificar el slug o pagina_id de la página. Ejemplo: estado inicio');
    return;
  }

  const esUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identificador);
  const pagina = esUUID
    ? await Pagina.findByPk(identificador)
    : await PaginaRepository.findBySlug(identificador, ambito);

  if (!pagina) {
    console.error(`Error: Página "${identificador}" no encontrada en el ámbito "${ambito}".`);
    return;
  }

  const versionPublicada = await PaginaVersion.findOne({
    where: { paginaId: pagina.id, estado: 'publicado' },
  });

  const versionArchivada = await PaginaVersion.findOne({
    where: { paginaId: pagina.id, estado: 'archivado' },
    order: [['publicadoEn', 'DESC']],
  });

  const dirUploads = resolverDirectorioUploads(ambito);
  const dirBackup = resolverDirectorioBackup(pagina.id, ambito);

  console.log(`\n======================================================================`);
  console.log(`ESTADO DE VERSIONAMIENTO Y RECURSOS: ${pagina.slug.toUpperCase()} (${ambito.toUpperCase()})`);
  console.log(`ID Página: ${pagina.id}`);
  console.log(`======================================================================\n`);

  console.log(`1. Versión actualmente PUBLICADA:`);
  if (versionPublicada) {
    const archivosPublicados = extraerRutasUploads(versionPublicada.contenido);
    console.log(`   ID: ${versionPublicada.id} | Número: v${versionPublicada.numeroVersion} | Publicado: ${versionPublicada.publicadoEn}`);
    console.log(`   Archivos que referencia (${archivosPublicados.length}):`);
    archivosPublicados.forEach((a) => {
      const subRuta = a.replace(/^\/?uploads\//, '');
      const existeUploads = fs.existsSync(path.join(dirUploads, subRuta));
      console.log(`     - ${a} [Existe en uploads: ${existeUploads ? 'SÍ ✓' : 'NO ✗'}]`);
    });
  } else {
    console.log(`   (Ninguna)`);
  }

  console.log(`\n2. Última versión ARCHIVADA (previa):`);
  if (versionArchivada) {
    const archivosArchivados = extraerRutasUploads(versionArchivada.contenido);
    console.log(`   ID: ${versionArchivada.id} | Número: v${versionArchivada.numeroVersion} | Publicado: ${versionArchivada.publicadoEn}`);
    console.log(`   Archivos que referencia (${archivosArchivados.length}):`);
    archivosArchivados.forEach((a) => {
      const subRuta = a.replace(/^\/?uploads\//, '');
      const existeUploads = fs.existsSync(path.join(dirUploads, subRuta));
      const existeBackup = fs.existsSync(path.join(dirBackup, path.basename(subRuta)));
      console.log(`     - ${a} [En uploads: ${existeUploads ? 'SÍ' : 'NO'} | En backup: ${existeBackup ? 'SÍ ✓' : 'NO'}]`);
    });
  } else {
    console.log(`   (Ninguna versión archivada)`);
  }

  const enBackupFisico = listarArchivosEnBackup(pagina.id, ambito);
  const carpetaApp = ambito === 'sitio' ? 'sitio-web' : 'intranet';
  console.log(`\n3. Archivos físicos en ${carpetaApp}/public/backup/${pagina.id}/:`);
  if (enBackupFisico.length === 0) {
    console.log(`   (Carpeta creada, sin archivos actualmente)`);
  } else {
    enBackupFisico.forEach((f) => console.log(`   ✓ ${f}`));
  }
  console.log('');
}

async function ejecutarRestaurar(identificador: string | undefined, ambito: Ambito) {
  if (!identificador) {
    console.error('Error: Debes especificar el slug o pagina_id de la página a restaurar. Ejemplo: restaurar inicio');
    return;
  }

  console.log(`\nIniciando restauración de la página "${identificador}" (Ámbito: ${ambito})...\n`);

  try {
    const resultado = await restaurarVersionAnterior(identificador, undefined, ambito);

    console.log(`✓ ÉXITO AL RESTAURAR:`);
    console.log(`  • Página: ${resultado.pagina.titulo} (${resultado.pagina.slug})`);
    console.log(`  • Versión Restaurada a PUBLICADO: v${resultado.versionRestaurada.numeroVersion} (ID: ${resultado.versionRestaurada.id})`);
    if (resultado.versionAnteriorArchivada) {
      console.log(`  • Versión Anterior pasada a ARCHIVADO: v${resultado.versionAnteriorArchivada.numeroVersion} (ID: ${resultado.versionAnteriorArchivada.id})`);
    }

    console.log(`\n  • Movimientos de Archivos:`);
    console.log(`    - Archivos restaurados hacia /uploads/: ${resultado.archivos.restaurados.length}`);
    resultado.archivos.restaurados.forEach((a) => console.log(`      ✓ ${a} -> /uploads/`));
    console.log(`    - Archivos resguardados en backup: ${resultado.archivos.guardadosEnBackup.length}`);
    resultado.archivos.guardadosEnBackup.forEach((a) => console.log(`      ✓ ${a} -> backup/`));
    if (resultado.archivos.purgadosDeBackup && resultado.archivos.purgadosDeBackup.length > 0) {
      console.log(`    - Archivos obsoletos eliminados de backup: ${resultado.archivos.purgadosDeBackup.length}`);
      resultado.archivos.purgadosDeBackup.forEach((a) => console.log(`      ✗ ${a} (eliminado de backup por no pertenecer a la versión)`));
    }

    console.log(`\n✓ Evento de publicación e invalidación de caché emitido correctamente.\n`);
  } catch (error) {
    console.error(`\n✗ Error al restaurar:`, error instanceof Error ? error.message : error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const ambito = obtenerAmbito(args);
  const { comando, parametro } = obtenerComandoYParametros(args);

  try {
    switch (comando) {
      case 'listar':
        await ejecutarListar(ambito);
        break;
      case 'estado':
        await ejecutarEstado(parametro, ambito);
        break;
      case 'restaurar':
        await ejecutarRestaurar(parametro, ambito);
        break;
      default:
        console.log(`
Uso del CLI de Versionamiento y Respaldo de Uploads:

  npm run probar:versionamiento -- listar [--ambito=intranet|sitio]
  npm run probar:versionamiento -- estado <slug> [--ambito=intranet|sitio]
  npm run probar:versionamiento -- restaurar <slug> [--ambito=intranet|sitio]

Ejemplos:
  npm run probar:versionamiento -- listar
  npm run probar:versionamiento -- estado inicio
  npm run probar:versionamiento -- restaurar inicio
  npm run probar:versionamiento -- listar --ambito=sitio
        `);
        break;
    }
  } finally {
    try {
      const redis = (await import('../src/infrastructure/redis')).getRedis();
      redis.disconnect();
    } catch {}
    try {
      await sequelize.close();
    } catch {}
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Error no controlado:', err);
  process.exit(1);
});
