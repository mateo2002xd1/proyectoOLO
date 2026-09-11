/**
 * Reorganiza `public/storage/uploads/` (y las carpetas de backup asociadas) en
 * subcarpetas por tipo de archivo: pdf/, imagenes/, word/, excel/, presentaciones/.
 *
 * Hasta ahora todo se guardaba suelto en la raíz de `uploads/{paginaId no aplica
 * aquí}/`. El contenido de Puck guarda la ruta completa como texto literal
 * (`/uploads/{archivo}`), así que mover el archivo sin actualizar la base de datos
 * rompería cualquier página que lo referencie — publicada, archivada o en borrador.
 *
 * Por eso este script hace las dos cosas juntas, en este orden:
 *   1. Reescribe `contenido`/`layout` de TODAS las versiones de página afectadas
 *      (una sola transacción por ámbito: o se actualizan todas o ninguna).
 *   2. Solo si el paso 1 fue exitoso, mueve los archivos físicos (uploads/ y cada
 *      backup/{paginaId}/) a su nueva subcarpeta.
 *
 * Corre en modo reporte (dry-run) por defecto: lista qué se movería y qué
 * versiones cambiarían, sin tocar nada. Pasa `--aplicar` para ejecutar de verdad.
 *
 * Carpetas ya organizadas a mano (p. ej. `uploads/documents/...`, usada por los
 * scripts de seed `sembrar-pagina-tasa.ts`) se dejan intactas: este script solo
 * mira archivos sueltos en la raíz, nunca recorre subcarpetas existentes.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sequelize from '../src/config/database';
import { Pagina, PaginaVersion } from '../src/infrastructure/db/models';

type Ambito = 'sitio' | 'intranet';

/** Mismo criterio que `resolverCarpetaPorExtension` de `@olo/upload-policy`. */
const CARPETA_POR_EXTENSION: Record<string, string> = {
  pdf: 'pdf',
  jpg: 'imagenes',
  jpeg: 'imagenes',
  png: 'imagenes',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ppt: 'presentaciones',
  pptx: 'presentaciones',
};

function carpetaPorArchivo(nombre: string): string {
  const ext = path.extname(nombre).slice(1).toLowerCase();
  return CARPETA_POR_EXTENSION[ext] ?? 'otros';
}

const RAIZ_PROYECTO = path.resolve(__dirname, '../../');

function carpetaApp(ambito: Ambito): string {
  return ambito === 'sitio' ? 'sitio-web' : 'intranet';
}

function dirUploads(ambito: Ambito): string {
  return path.join(RAIZ_PROYECTO, carpetaApp(ambito), 'public', 'storage', 'uploads');
}

function dirBackupRaiz(ambito: Ambito): string {
  return path.join(RAIZ_PROYECTO, carpetaApp(ambito), 'public', 'storage', 'backup');
}

/** Archivos sueltos directamente en `dir` (no recorre subcarpetas). */
function archivosSueltos(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entrada) => entrada.isFile())
    .map((entrada) => entrada.name);
}

interface Movimiento {
  origen: string;
  destino: string;
}

interface PlanAmbito {
  ambito: Ambito;
  /** nombreDeArchivo -> subcarpeta destino */
  renombres: Map<string, string>;
  movimientos: Movimiento[];
}

function construirPlan(ambito: Ambito): PlanAmbito {
  const renombres = new Map<string, string>();
  const movimientos: Movimiento[] = [];

  const dUploads = dirUploads(ambito);
  for (const nombre of archivosSueltos(dUploads)) {
    const carpeta = carpetaPorArchivo(nombre);
    renombres.set(nombre, carpeta);
    movimientos.push({
      origen: path.join(dUploads, nombre),
      destino: path.join(dUploads, carpeta, nombre),
    });
  }

  const dBackupRaiz = dirBackupRaiz(ambito);
  if (fs.existsSync(dBackupRaiz)) {
    const carpetasDePagina = fs
      .readdirSync(dBackupRaiz, { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory());

    for (const carpetaDePagina of carpetasDePagina) {
      const dirPagina = path.join(dBackupRaiz, carpetaDePagina.name);
      for (const nombre of archivosSueltos(dirPagina)) {
        const carpeta = carpetaPorArchivo(nombre);
        // Mismo nombre -> misma extensión -> misma carpeta que en uploads/.
        renombres.set(nombre, carpeta);
        movimientos.push({
          origen: path.join(dirPagina, nombre),
          destino: path.join(dirPagina, carpeta, nombre),
        });
      }
    }
  }

  return { ambito, renombres, movimientos };
}

/** El mismo archivo puede aparecer en el contenido con espacios literales o
 * codificados (`%20`, etc.) según cómo se haya guardado el enlace. */
function variantesDeArchivo(nombre: string): string[] {
  const codificado = encodeURIComponent(nombre);
  return codificado === nombre ? [nombre] : [nombre, codificado];
}

function reescribirRutas(
  jsonComoTexto: string,
  renombres: Map<string, string>
): { resultado: string; cambiado: boolean } {
  let resultado = jsonComoTexto;
  let cambiado = false;

  for (const [nombre, carpeta] of renombres) {
    for (const variante of variantesDeArchivo(nombre)) {
      const buscado = `/uploads/${variante}`;
      const reemplazo = `/uploads/${carpeta}/${variante}`;
      if (resultado.includes(buscado)) {
        resultado = resultado.split(buscado).join(reemplazo);
        cambiado = true;
      }
    }
  }

  return { resultado, cambiado };
}

async function procesarAmbito(plan: PlanAmbito, aplicar: boolean): Promise<void> {
  console.log(`\n=== ${plan.ambito} ===`);

  if (plan.renombres.size === 0) {
    console.log('No hay archivos sueltos en la raíz de uploads/backup. Nada que reorganizar.');
    return;
  }

  console.log(`Archivos a reubicar (${plan.renombres.size}):`);
  for (const [nombre, carpeta] of plan.renombres) {
    console.log(`  ${nombre}  ->  ${carpeta}/${nombre}`);
  }

  const paginas = await Pagina.findAll({ where: { ambito: plan.ambito } });
  const slugPorId = new Map(paginas.map((p) => [p.id, p.slug]));
  const idsDePaginas = paginas.map((p) => p.id);

  const versiones = idsDePaginas.length
    ? await PaginaVersion.findAll({ where: { paginaId: idsDePaginas } })
    : [];

  const cambiosPorVersion: { version: PaginaVersion; contenido?: unknown; layout?: unknown }[] = [];

  for (const version of versiones) {
    const contenidoTexto = JSON.stringify(version.contenido);
    const { resultado: contenidoNuevo, cambiado: cambioContenido } = reescribirRutas(
      contenidoTexto,
      plan.renombres
    );

    let cambioLayout = false;
    let layoutNuevo: string | null = null;
    if (version.layout) {
      const layoutTexto = JSON.stringify(version.layout);
      const r = reescribirRutas(layoutTexto, plan.renombres);
      layoutNuevo = r.resultado;
      cambioLayout = r.cambiado;
    }

    if (!cambioContenido && !cambioLayout) continue;

    const slug = slugPorId.get(version.paginaId) ?? version.paginaId;
    console.log(
      `  v${version.numeroVersion} de "${slug}" (${version.estado})${
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
    `Versiones ${aplicar ? 'actualizadas' : 'a actualizar'}: ${cambiosPorVersion.length} de ${versiones.length}`
  );

  if (!aplicar) return;

  // 1. Base de datos primero, todo o nada por ámbito.
  await sequelize.transaction(async (transaction) => {
    for (const cambio of cambiosPorVersion) {
      const data: Record<string, unknown> = {};
      if (cambio.contenido !== undefined) data.contenido = cambio.contenido;
      if (cambio.layout !== undefined) data.layout = cambio.layout;
      await cambio.version.update(data, { transaction });
    }
  });

  // 2. Solo si la base de datos quedó consistente, mover los archivos físicos.
  let movidos = 0;
  for (const mov of plan.movimientos) {
    if (!fs.existsSync(mov.origen)) continue;
    fs.mkdirSync(path.dirname(mov.destino), { recursive: true });
    fs.renameSync(mov.origen, mov.destino);
    movidos += 1;
  }
  console.log(`Archivos físicos movidos: ${movidos} de ${plan.movimientos.length}`);
}

async function main() {
  const aplicar = process.argv.includes('--aplicar');

  await sequelize.authenticate();

  for (const ambito of ['sitio', 'intranet'] as const) {
    const plan = construirPlan(ambito);
    await procesarAmbito(plan, aplicar);
  }

  if (!aplicar) {
    console.log(
      '\n(Reporte en seco — no se modificó nada. Vuelve a ejecutar con --aplicar para aplicar los cambios.)'
    );
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
