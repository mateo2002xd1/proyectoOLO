/**
 * Prueba de contención de rutas (OBS-01 del informe off-by-slash del 2026-10-19): que ninguna
 * operación sobre archivos suba de `uploads/` o `backup/` por culpa de una ruta guardada en el
 * contenido de una página.
 *
 * Una página de Puck es JSON que escribe un Editor, y publicar, restaurar y borrar huérfanos
 * convierten cada `/uploads/...` que nombra en una ruta de disco. Si la ruta lleva `../`
 * —también codificada, porque `extraerRutasUploads` la **decodifica** antes de entregarla— o es
 * absoluta, un `path.join` sin contención la saca de la carpeta: publicar movía un archivo
 * ajeno (el adjunto de la intranet, un Excel de las cargas) al backup **público** del sitio y
 * borraba el original; restaurar escribía donde el atacante dijera.
 *
 * Lo que se comprueba, con las funciones reales de `backup-uploads.service.ts` y
 * `filesystem.ts` sobre una carpeta temporal (no toca la base ni el `filesystem/` del proyecto):
 *
 *  - publicar (`respaldarArchivosAlPublicar`): lo de fuera de `uploads/` ni se mueve ni se copia
 *    al backup; el control legítimo sí se respalda;
 *  - restaurar (`restaurarArchivosDesdeBackup`): no escribe fuera de `uploads/`;
 *  - borrar huérfanos (`borrarDeUploads`): no borra fuera de `uploads/`;
 *  - servir (`resolverArchivoServible`): `..` y `%2e%2e` no sirven nada de fuera;
 *  - `resolverDentroDe`: el caso del prefijo hermano (`uploads-x`), que un `startsWith` sin
 *    barra aceptaría.
 *
 * Uso:  npm run rutas:verificar     (sale con código 1 si algo falla)
 *
 * @see 3-seguridad-del-proyecto.md (registro de hallazgos, OBS-01)
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

// La raíz del filesystem se lee en cada llamada: basta fijarla antes de usar el servicio.
const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'olo-contencion-'));
process.env.FILESYSTEM_DIR = raiz;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const servicio = require('../../src/infrastructure/storage/backup-uploads.service') as typeof import('../../src/infrastructure/storage/backup-uploads.service');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const almacen = require('../../src/infrastructure/storage/filesystem') as typeof import('../../src/infrastructure/storage/filesystem');

let fallos = 0;
let comprobaciones = 0;
const informar = (ok: boolean, descripcion: string, detalle = '') => {
  comprobaciones += 1;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
};

const escribir = (ruta: string, contenido: string) => {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, contenido);
};
const existe = (ruta: string) => fs.existsSync(ruta);
const leer = (ruta: string) => fs.readFileSync(ruta, 'utf8');

/** Todos los archivos bajo una carpeta, para comprobar que nada ajeno llegó al backup. */
const listar = (dir: string): string[] =>
  !existe(dir)
    ? []
    : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listar(path.join(dir, e.name)) : [path.join(dir, e.name)]));

const PAGINA = '11111111-1111-4111-8111-111111111111';
const sitio = path.join(raiz, 'sitio');
const intranet = path.join(raiz, 'intranet');

const legitimo = path.join(sitio, 'uploads', 'img', 'legitimo.png');
const adjuntoIntranet = path.join(intranet, 'uploads', 'pdf', 'adjunto-de-la-intranet.pdf');
const excelPrivado = path.join(raiz, 'cargas-datos', 'excel-privado.xlsx');
const sueltoEnLaRaiz = path.join(raiz, 'suelto-en-la-raiz.txt');

/** Una ruta absoluta escrita como la guardaría el contenido: `/uploads/` + la ruta. */
const comoUploads = (absoluta: string) => `/uploads/${absoluta.replace(/\\/g, '/')}`;

const contenidoMalicioso = {
  content: [
    { type: 'Imagen', props: { src: '/uploads/img/legitimo.png' } },
    { type: 'Enlace', props: { href: '/uploads/../../intranet/uploads/pdf/adjunto-de-la-intranet.pdf' } },
    { type: 'Enlace', props: { href: '/uploads/%2e%2e/%2e%2e/intranet/uploads/pdf/adjunto-de-la-intranet.pdf' } },
    { type: 'Enlace', props: { href: '/uploads/img/../../../cargas-datos/excel-privado.xlsx' } },
    { type: 'Enlace', props: { href: comoUploads(sueltoEnLaRaiz) } },
  ],
};

const preparar = () => {
  fs.rmSync(raiz, { recursive: true, force: true });
  escribir(legitimo, 'legitimo');
  escribir(adjuntoIntranet, 'ADJUNTO PRIVADO DE LA INTRANET');
  escribir(excelPrivado, 'EXCEL PRIVADO DE LAS CARGAS');
  escribir(sueltoEnLaRaiz, 'SUELTO EN LA RAIZ');
};

const intactos = () =>
  existe(adjuntoIntranet) && leer(adjuntoIntranet) === 'ADJUNTO PRIVADO DE LA INTRANET' &&
  existe(excelPrivado) && leer(excelPrivado) === 'EXCEL PRIVADO DE LAS CARGAS' &&
  existe(sueltoEnLaRaiz) && leer(sueltoEnLaRaiz) === 'SUELTO EN LA RAIZ';

async function principal() {
  console.log('\n=== resolverDentroDe: el prefijo hermano y los escapes ===');
  const base = path.join(raiz, 'sitio', 'uploads');
  informar(almacen.resolverDentroDe(base, 'img', 'a.png') === path.join(base, 'img', 'a.png'), 'control: una ruta interna se resuelve');
  informar(almacen.resolverDentroDe(base, '..', 'intranet', 'x') === null, '`..` que sale de la base → null');
  informar(almacen.resolverDentroDe(base, '..', 'uploads-x', 'a.png') === null, 'el prefijo hermano (`uploads-x`) → null, no pasa por empezar igual');
  informar(almacen.resolverDentroDe(base, path.resolve(raiz, 'fuera.txt')) === null, 'una ruta absoluta → null');
  informar(almacen.resolverDentroDe(base, 'img\0.png') === null, 'un byte nulo → null');
  informar(almacen.resolverDentroDe(base) === null, 'la propia base, sin archivo → null');

  console.log('\n=== Publicar: respaldarArchivosAlPublicar ===');
  preparar();
  servicio.respaldarArchivosAlPublicar({ paginaId: PAGINA, versionAnteriorContenido: contenidoMalicioso, versionNuevaContenido: { content: [] }, ambito: 'sitio' });
  informar(intactos(), 'el adjunto de la intranet, el Excel de las cargas y el archivo de la raíz siguen en su sitio, con su contenido');
  const enBackup = listar(path.join(sitio, 'backup')).map((f) => path.basename(f));
  informar(
    !enBackup.some((n) => /adjunto-de-la-intranet|excel-privado|suelto-en-la-raiz/.test(n)),
    'nada de lo ajeno aparece en el backup público del sitio',
    enBackup.join(', ') || '(vacío)'
  );
  informar(existe(path.join(sitio, 'backup', PAGINA, 'legitimo.png')) && !existe(legitimo), 'control: el archivo legítimo sí se mueve al backup');

  console.log('\n=== Restaurar: restaurarArchivosDesdeBackup ===');
  preparar();
  const victima = path.join(raiz, 'victima', 'captura.png');
  // Un archivo en el backup con el nombre al que apuntaría una ruta que se sale de `uploads/`.
  escribir(path.join(sitio, 'backup', PAGINA, 'captura.png'), 'DEL BACKUP');
  servicio.restaurarArchivosDesdeBackup({
    paginaId: PAGINA,
    versionRestaurarContenido: { content: [{ type: 'Imagen', props: { src: '/uploads/../../victima/captura.png' } }] },
    versionActualContenido: contenidoMalicioso,
    ambito: 'sitio',
  });
  informar(!existe(victima), 'no escribe fuera de `uploads/` (no aparece victima/captura.png)');
  informar(intactos(), 'y lo ajeno que nombra la versión actual tampoco se mueve');

  console.log('\n=== Borrar huérfanos: borrarDeUploads ===');
  preparar();
  const borradas = await servicio.borrarDeUploads(
    ['/uploads/img/legitimo.png', '/uploads/../../intranet/uploads/pdf/adjunto-de-la-intranet.pdf', '/uploads/img/../../../cargas-datos/excel-privado.xlsx', comoUploads(sueltoEnLaRaiz)],
    'sitio'
  );
  informar(intactos(), 'no borra nada fuera de `uploads/`');
  informar(!existe(legitimo), 'control: el archivo legítimo sí se borra', `borradas: ${borradas.length}`);

  console.log('\n=== Servir: resolverArchivoServible ===');
  informar(almacen.resolverArchivoServible('sitio', ['uploads', 'img', 'legitimo.png'])?.rutaAbsoluta === legitimo, 'control: un archivo de uploads se sirve');
  informar(almacen.resolverArchivoServible('sitio', ['uploads', '..', '..', 'intranet', 'uploads', 'pdf', 'adjunto-de-la-intranet.pdf']) === null, '`..` no sirve nada de otro ámbito');
  informar(almacen.resolverArchivoServible('sitio', ['uploads', '..', '..', 'cargas-datos', 'excel-privado.xlsx']) === null, '`..` no sirve las cargas');
}

principal()
  .catch((error) => {
    fallos += 1;
    console.error(error);
  })
  .finally(() => {
    fs.rmSync(raiz, { recursive: true, force: true });
    console.log(`\n${comprobaciones - fallos}/${comprobaciones} comprobaciones en orden.`);
    process.exit(fallos > 0 ? 1 : 0);
  });
