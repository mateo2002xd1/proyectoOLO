/**
 * Renombra una subcarpeta de tipo dentro de `uploads/` (y sus `backup/{paginaId}/`
 * asociados) en las dos apps, y reescribe las rutas `/uploads/{carpeta}/...`
 * guardadas en el contenido de página para que sigan apuntando al archivo real.
 *
 * Uso:
 *   npm run uploads:renombrar-carpeta -- <vieja> <nueva>            (reporte, no toca nada)
 *   npm run uploads:renombrar-carpeta -- <vieja> <nueva> --aplicar  (aplica de verdad)
 *
 * El orden importa: primero la base de datos
 * (una transacción, todo o nada), y solo si eso queda bien se mueven los
 * archivos físicos — así nunca hay una versión publicada apuntando a una ruta
 * que el disco ya no tiene.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sequelize from '../../src/config/database';
import { Pagina, PaginaVersion } from '../../src/infrastructure/db/models';
// De ahí sale la carpeta de cada app: el nombre vive en un solo lugar.
import { resolverDirectorioStorage } from '../../src/infrastructure/storage/backup-uploads.service';

type Ambito = 'sitio' | 'intranet';

/** La carpeta `uploads/` del frontal de ese ámbito. */
function dirUploads(ambito: Ambito): string {
  return path.join(resolverDirectorioStorage(ambito), 'uploads');
}

/** La carpeta `backup/` del frontal de ese ámbito. */
function dirBackupRaiz(ambito: Ambito): string {
  return path.join(resolverDirectorioStorage(ambito), 'backup');
}

/** Sustituye una ruta por otra dentro del JSON de una versión y dice si cambió algo. */
function reescribirRutas(
  jsonComoTexto: string,
  buscado: string,
  reemplazo: string
): { resultado: string; cambiado: boolean } {
  if (!jsonComoTexto.includes(buscado)) return { resultado: jsonComoTexto, cambiado: false };
  return { resultado: jsonComoTexto.split(buscado).join(reemplazo), cambiado: true };
}

/**
 * Renombra la carpeta en la base (una transacción) y, si eso sale bien, en el disco de los dos ámbitos.
 */
async function main() {
  const [vieja, nueva, ...resto] = process.argv.slice(2);
  const aplicar = resto.includes('--aplicar');

  if (!vieja || !nueva) {
    throw new Error(
      'Uso: npm run uploads:renombrar-carpeta -- <carpeta-vieja> <carpeta-nueva> [--aplicar]'
    );
  }

  const buscado = `/uploads/${vieja}/`;
  const reemplazo = `/uploads/${nueva}/`;

  await sequelize.authenticate();

  const paginas = await Pagina.findAll();
  const slugPorId = new Map(paginas.map((p) => [p.id, p.slug]));
  const versiones = await PaginaVersion.findAll();

  const cambiosPorVersion: { version: PaginaVersion; contenido?: unknown; layout?: unknown }[] = [];

  for (const version of versiones) {
    const contenidoTexto = JSON.stringify(version.contenido);
    const { resultado: contenidoNuevo, cambiado: cambioContenido } = reescribirRutas(
      contenidoTexto,
      buscado,
      reemplazo
    );

    let cambioLayout = false;
    let layoutNuevo: string | null = null;
    if (version.layout) {
      const layoutTexto = JSON.stringify(version.layout);
      const r = reescribirRutas(layoutTexto, buscado, reemplazo);
      layoutNuevo = r.resultado;
      cambioLayout = r.cambiado;
    }

    if (!cambioContenido && !cambioLayout) continue;

    const slug = slugPorId.get(version.paginaId) ?? version.paginaId;
    console.log(
      `v${version.numeroVersion} de "${slug}" (${version.estado})${
        aplicar ? ': actualizada' : ': se actualizaría'
      }`
    );

    cambiosPorVersion.push({
      version,
      contenido: cambioContenido ? JSON.parse(contenidoNuevo) : undefined,
      layout: cambioLayout && layoutNuevo ? JSON.parse(layoutNuevo) : undefined,
    });
  }

  console.log(
    `\nVersiones ${aplicar ? 'actualizadas' : 'a actualizar'}: ${cambiosPorVersion.length} de ${versiones.length}`
  );

  // Carpetas físicas a mover: uploads/{vieja} de cada app + cada backup/{paginaId}/{vieja}.
  const movimientos: { origen: string; destino: string }[] = [];
  for (const ambito of ['sitio', 'intranet'] as const) {
    const origenUploads = path.join(dirUploads(ambito), vieja);
    if (fs.existsSync(origenUploads)) {
      movimientos.push({ origen: origenUploads, destino: path.join(dirUploads(ambito), nueva) });
    }

    const dBackupRaiz = dirBackupRaiz(ambito);
    if (fs.existsSync(dBackupRaiz)) {
      for (const entrada of fs.readdirSync(dBackupRaiz, { withFileTypes: true })) {
        if (!entrada.isDirectory()) continue;
        const origenBackup = path.join(dBackupRaiz, entrada.name, vieja);
        if (fs.existsSync(origenBackup)) {
          movimientos.push({
            origen: origenBackup,
            destino: path.join(dBackupRaiz, entrada.name, nueva),
          });
        }
      }
    }
  }

  console.log(`\nCarpetas físicas a renombrar (${movimientos.length}):`);
  for (const mov of movimientos) {
    console.log(`  ${mov.origen}\n    -> ${mov.destino}`);
  }

  if (!aplicar) {
    console.log('\n(Reporte en seco — no se modificó nada. Vuelve a ejecutar con --aplicar.)');
    return;
  }

  // 1. Base de datos primero, todo o nada.
  await sequelize.transaction(async (transaction) => {
    for (const cambio of cambiosPorVersion) {
      const data: Record<string, unknown> = {};
      if (cambio.contenido !== undefined) data.contenido = cambio.contenido;
      if (cambio.layout !== undefined) data.layout = cambio.layout;
      await cambio.version.update(data, { transaction });
    }
  });

  // 2. Solo si la base de datos quedó consistente, renombrar carpetas físicas.
  let renombradas = 0;
  for (const mov of movimientos) {
    if (fs.existsSync(mov.destino)) {
      // Ya existe destino (p. ej. otra app ya la tenía con el nombre nuevo): fusiona archivo por archivo.
      for (const archivo of fs.readdirSync(mov.origen)) {
        const destinoArchivo = path.join(mov.destino, archivo);
        if (!fs.existsSync(destinoArchivo)) {
          fs.renameSync(path.join(mov.origen, archivo), destinoArchivo);
        }
      }
      try {
        fs.rmdirSync(mov.origen);
      } catch {
        // Si quedó algo sin poder moverse, se deja para revisión manual.
      }
    } else {
      fs.renameSync(mov.origen, mov.destino);
    }
    renombradas += 1;
  }
  console.log(`\nCarpetas físicas renombradas: ${renombradas} de ${movimientos.length}`);
}

main()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
