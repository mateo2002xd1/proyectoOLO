/**
 * Borra archivos de `public/storage/uploads/` que no está referenciando NINGUNA
 * versión de página (publicada, archivada o en borrador/revisión) en la base de
 * datos.
 *
 * Aparecen porque reemplazar un archivo dentro de una edición en curso, sin
 * publicar, no mueve nada a `backup/` — el único momento en que el sistema mueve
 * archivos es al publicar (`respaldarArchivosAlPublicar`). Si alguien sube A, lo
 * reemplaza por B en el mismo borrador sin publicar, y luego por C, tanto A como B
 * quedan en disco sin que ninguna fila de `paginas_versiones` los mencione ya.
 *
 * Corre en modo reporte (dry-run) por defecto. Pasa `--aplicar` para borrar de
 * verdad.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sequelize from '../../src/config/database';
import { PaginaVersion } from '../../src/infrastructure/db/models';
// De ahí sale la carpeta de cada app: el nombre vive en un solo lugar.
import { resolverDirectorioStorage } from '../../src/infrastructure/storage/backup-uploads.service';

type Ambito = 'sitio' | 'intranet';

function dirUploads(ambito: Ambito): string {
  return path.join(resolverDirectorioStorage(ambito), 'uploads');
}

/** Todas las rutas de archivo bajo `dir`, recursivo, relativas a `dir` (con `/`). */
function listarArchivosRecursivo(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const resultado: string[] = [];

  function recorrer(actual: string, base: string) {
    for (const entrada of fs.readdirSync(actual, { withFileTypes: true })) {
      const rutaAbsoluta = path.join(actual, entrada.name);
      const rutaRelativa = base ? `${base}/${entrada.name}` : entrada.name;
      if (entrada.isDirectory()) {
        recorrer(rutaAbsoluta, rutaRelativa);
      } else if (entrada.isFile()) {
        resultado.push(rutaRelativa);
      }
    }
  }

  recorrer(dir, '');
  return resultado;
}

/** Extrae, de un JSON de Puck como texto, todas las subrutas usadas tras `/uploads/`. */
function extraerSubRutasReferenciadas(jsonComoTexto: string): Set<string> {
  const subRutas = new Set<string>();
  const coincidencias = jsonComoTexto.match(/\/uploads\/[^\s"'<>\\]+/g) ?? [];

  for (const m of coincidencias) {
    const limpia = m
      .replace(/^\/uploads\//, '')
      .split(/[?#]/)[0]
      .replace(/[),;:.]+$/, '');
    subRutas.add(limpia);
    try {
      subRutas.add(decodeURIComponent(limpia));
    } catch {
      // Ruta ya sin codificar o inválida: se queda solo con la versión literal.
    }
  }

  return subRutas;
}

async function construirReferenciadas(ambito: Ambito): Promise<Set<string>> {
  const { Pagina } = await import('../../src/infrastructure/db/models');
  const paginas = await Pagina.findAll({ where: { ambito } });
  const idsDePaginas = paginas.map((p) => p.id);
  const versiones = idsDePaginas.length
    ? await PaginaVersion.findAll({ where: { paginaId: idsDePaginas } })
    : [];

  const referenciadas = new Set<string>();
  for (const version of versiones) {
    for (const sub of extraerSubRutasReferenciadas(JSON.stringify(version.contenido))) {
      referenciadas.add(sub);
    }
    if (version.layout) {
      for (const sub of extraerSubRutasReferenciadas(JSON.stringify(version.layout))) {
        referenciadas.add(sub);
      }
    }
  }
  return referenciadas;
}

async function procesarAmbito(ambito: Ambito, aplicar: boolean): Promise<void> {
  console.log(`\n=== ${ambito} ===`);

  const dUploads = dirUploads(ambito);
  const archivosFisicos = listarArchivosRecursivo(dUploads);
  const referenciadas = await construirReferenciadas(ambito);

  const huerfanos = archivosFisicos.filter((archivo) => !referenciadas.has(archivo));

  if (huerfanos.length === 0) {
    console.log('No hay archivos huérfanos en uploads/. Nada que limpiar.');
    return;
  }

  console.log(`Archivos huérfanos (${huerfanos.length} de ${archivosFisicos.length} en total):`);
  for (const huerfano of huerfanos) {
    console.log(`  ${huerfano}`);
  }

  if (!aplicar) return;

  let borrados = 0;
  for (const huerfano of huerfanos) {
    try {
      fs.unlinkSync(path.join(dUploads, huerfano));
      borrados += 1;
    } catch (error) {
      console.error(`  No se pudo borrar ${huerfano}:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`Borrados: ${borrados} de ${huerfanos.length}`);
}

async function main() {
  const aplicar = process.argv.includes('--aplicar');

  await sequelize.authenticate();

  for (const ambito of ['sitio', 'intranet'] as const) {
    await procesarAmbito(ambito, aplicar);
  }

  if (!aplicar) {
    console.log('\n(Reporte en seco — no se borró nada. Vuelve a ejecutar con --aplicar.)');
  }
}

main()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
