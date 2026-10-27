#!/usr/bin/env node
/**
 * Deja la app lista para arrancar sin que nadie configure nada.
 *
 * Corre en el `predev` y el `prebuild` de las tres apps (`npm run sync:paquetes`),
 * así que basta con `npm run dev`. Cada paso mira primero si hace falta y solo
 * entonces actúa: con todo al día, arrancar cuesta unos milisegundos.
 *
 *   1. Trae lo que quedó en la carpeta vieja tras el cambio de nombre
 *      (`sitio-web` → `3000-sitio-web`): `.env`, archivos subidos y `node_modules`.
 *   2. Recompila el `dist/` de los paquetes `@olo/*` que quedó viejo.
 *   3. Instala, en una sola pasada, si `node_modules` no coincide con el
 *      `package-lock.json` o si la copia de `@olo/*` no coincide con `packages/`.
 *   4. Borra `.next` cuando es de otra carpeta, de otras dependencias o de otra
 *      versión de Next.
 *   5. Activa los hooks del repositorio (`.githooks`) si el clon no usa otros.
 *   6. Copia una vez los archivos subidos de su carpeta de antes (`public/storage`,
 *      `uploads/cargas-datos`) al filesystem de la API (`filesystem/`).
 *
 * ── 1. La carpeta vieja ─────────────────────────────────────────────────────────
 * Git solo muda lo que está en el repositorio. Al hacer `git pull` del cambio de
 * nombre, lo que Git ignora se queda en la carpeta vieja, y la app nueva arranca
 * sin configuración y sin las imágenes subidas:
 *
 *   - los `.env`;
 *   - los archivos subidos (`public/storage`, `uploads/`);
 *   - `node_modules`.
 *
 * El paso copia lo que falta, sin pisar nada, y **mueve** `node_modules`: son
 * cientos de MB de algo que se puede regenerar. Al terminar deja un aviso en la
 * carpeta vieja para no repetirse y para que quien la vea sepa que ya se puede
 * borrar.
 *
 * ── 2. `dist/` desactualizado ─────────────────────────────────────────────────
 * Cinco paquetes se consumen por `dist/` y no por `src/`, y `dist/` está en
 * `.gitignore`: un `git pull` cambia `src/` pero jamás lo recompila. Copiar un
 * `dist` viejo no da error de compilación: la app arranca y ejecuta la lógica
 * anterior, que es bastante peor que un fallo ruidoso.
 *
 * Por eso, antes de comparar copia contra origen, se recompila cualquier paquete
 * cuyo `src/` sea más nuevo que su `dist/`, instalando antes sus propias
 * `devDependencies` si hace falta. Si el paquete no declara `build`, o la
 * compilación falla, corta con un error explícito en vez de dejar arrancar la app
 * contra una copia que sabe estar mal.
 *
 * ── 3. Dependencias ────────────────────────────────────────────────────────────
 * npm deja en `node_modules/.package-lock.json` lo que de verdad instaló. Si no
 * coincide con el `package-lock.json` del repositorio, un compañero agregó o
 * actualizó una librería, y la app caería con `Module not found`.
 *
 * ── 3. Paquetes locales `@olo/*` ───────────────────────────────────────────────
 * Las apps declaran los paquetes de `packages/` como `file:../packages/*`, y sus
 * `.npmrc` fijan `install-links=true`. Esa opción está puesta a propósito: en
 * Windows, sin modo desarrollador, npm no puede crear el symlink y deja la
 * carpeta vacía.
 *
 * Pero al copiar en vez de enlazar aparece un efecto que muerde tarde y fuerte:
 * npm solo repite la copia cuando cambia la VERSIÓN declarada del paquete, y
 * todos siguen en `0.1.0` desde el primer día. Resultado: edites lo que edites en
 * `packages/`, npm contesta `up to date` y la app sigue compilando contra una
 * copia congelada. El error miente sobre dónde está el problema:
 *
 *     Export ResaltadorDeBusqueda doesn't exist in target module
 *
 * ...señalando un export que en `packages/` existe perfectamente. La ruta del
 * error es la pista: apunta a `node_modules/@olo/...`, no a `packages/`.
 *
 * Por eso se compara el contenido real de cada paquete con el de su copia, y solo
 * si difieren se borra `node_modules/@olo` y se reinstala: al no existir la
 * carpeta, npm se ve obligado a copiar de nuevo. La comparación ES la fuente de
 * verdad. Así acierta también después de un `git pull`, de un cambio de rama o de
 * un borrado manual de `node_modules`. Las dos comparaciones del paso 3 van
 * contra lo que hay de verdad, sin estado propio, y si las dos piden instalar,
 * se instala una sola vez.
 *
 * ── 4. `.next` viejo ───────────────────────────────────────────────────────────
 * No se borra en cada arranque: tirar la caché hace que cada página compile de
 * cero, y eso cuesta segundos cada vez. Se borra cuando se sabe que quedó viejo:
 *
 *   - es de otra carpeta;
 *   - es de otra versión de Next;
 *   - es de otro `package-lock.json`;
 *   - no se sabe de dónde salió.
 *
 * Para saberlo se deja un sello en `.next/cache/olo-sello.json`. Va dentro de
 * `cache/` porque `next build` vacía `.next` salvo esa carpeta.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Interruptor para las imágenes de Docker, que lo fijan a 1.
//
// Allí este script sobra: el Dockerfile ya deja la copia correcta compilando los
// `dist/` y repitiendo `npm ci`. Y sobre todo, no debe correr: reinstalaría con
// `npm install`, que puede tocar el package-lock y se llevaría por delante el
// determinismo que da `npm ci` en un build de imagen.
if (process.env.OLO_SKIP_SYNC === '1') process.exit(0);

// npm ejecuta los scripts con el cwd en la carpeta del package.json.
const dirApp = process.cwd();
const nombreApp = path.basename(dirApp);

/**
 * Lo que npm NO copia al instalar un `file:` (comprobado comparando una copia
 * recién hecha con su origen). Incluirlos daría una diferencia permanente y el
 * script reinstalaría en cada arranque.
 */
const EXCLUIDOS = new Set(['node_modules', '.git', 'package-lock.json']);

/** Lo que no se trae de la carpeta vieja: se regenera solo, o ya lo trae Git. */
const DERIVADOS = new Set(['node_modules', '.next', 'dist', 'build', '.turbo', 'coverage']);

const AVISO_MUDANZA = 'CARPETA-MUDADA.txt';

function leerJson(archivo) {
  try {
    return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  } catch {
    return null;
  }
}

/** Todos los archivos bajo `raiz`, como rutas relativas con `/`, sin entrar en `saltar`. */
function archivosDe(raiz, saltar) {
  const archivos = [];
  const pendientes = [raiz];
  while (pendientes.length > 0) {
    const actual = pendientes.pop();
    let entradas;
    try {
      entradas = fs.readdirSync(actual, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entrada of entradas) {
      if (saltar.has(entrada.name)) continue;
      const completo = path.join(actual, entrada.name);
      if (entrada.isDirectory()) pendientes.push(completo);
      else if (entrada.isFile()) archivos.push(path.relative(raiz, completo).split(path.sep).join('/'));
    }
  }
  return archivos;
}

/** Mapa de ruta relativa → sha1 del contenido, para todo el árbol de `raiz`. */
function huellaDeArbol(raiz) {
  const huellas = new Map();
  for (const relativo of archivosDe(raiz, EXCLUIDOS)) {
    huellas.set(relativo, createHash('sha1').update(fs.readFileSync(path.join(raiz, relativo))).digest('hex'));
  }
  return huellas;
}

/** Primeras diferencias entre origen y copia, en ambos sentidos. */
function diferencias(origen, copia, maximo = 4) {
  const encontradas = [];
  for (const [ruta, hash] of origen) {
    if (!copia.has(ruta)) encontradas.push(`falta ${ruta}`);
    else if (copia.get(ruta) !== hash) encontradas.push(`cambió ${ruta}`);
    if (encontradas.length >= maximo) return encontradas;
  }
  for (const ruta of copia.keys()) {
    if (!origen.has(ruta)) encontradas.push(`sobra ${ruta}`);
    if (encontradas.length >= maximo) return encontradas;
  }
  return encontradas;
}

/** Fecha del archivo más reciente del árbol, o 0 si no hay ninguno. */
function masReciente(raiz) {
  let maxima = 0;
  for (const relativo of archivosDe(raiz, EXCLUIDOS)) {
    maxima = Math.max(maxima, fs.statSync(path.join(raiz, relativo)).mtimeMs);
  }
  return maxima;
}

/**
 * Borra el contenido de `node_modules/@olo`.
 *
 * Los enlaces se quitan con `unlink` y nunca con borrado recursivo: si alguien
 * instala sin `install-links` (Linux, o Windows en modo desarrollador), estas
 * entradas son symlinks a `packages/`, y un recursivo los seguiría hasta borrar
 * el código fuente del repositorio.
 */
function vaciarCarpetaOlo(dirOlo) {
  let entradas;
  try {
    entradas = fs.readdirSync(dirOlo, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entrada of entradas) {
    const completo = path.join(dirOlo, entrada.name);
    if (entrada.isSymbolicLink()) fs.unlinkSync(completo);
    else fs.rmSync(completo, { recursive: true, force: true });
  }
}

// `npm_execpath` lo pone npm al lanzar el script y apunta a su propio JS. Usarlo
// evita invocar `npm.cmd`, que en Windows las versiones recientes de Node se
// niegan a ejecutar sin shell.
function ejecutarNpm(argumentos, cwd) {
  const cliNpm = process.env.npm_execpath;
  if (cliNpm && cliNpm.endsWith('.js')) {
    execFileSync(process.execPath, [cliNpm, ...argumentos], { cwd, stdio: 'inherit' });
  } else {
    execFileSync('npm', argumentos, { cwd, stdio: 'inherit', shell: true });
  }
}

function reinstalar() {
  ejecutarNpm(['install', '--no-audit', '--no-fund'], dirApp);
}

const pkgApp = leerJson(path.join(dirApp, 'package.json'));
if (pkgApp === null) process.exit(0);
const dependencias = { ...pkgApp.dependencies, ...pkgApp.devDependencies };

// ── 1. Lo que quedó en la carpeta vieja ───────────────────────────────────────
function traerDeLaCarpetaVieja() {
  const nombreViejo = /^\d+-(.+)$/.exec(nombreApp)?.[1];
  if (!nombreViejo) return;
  const dirViejo = path.join(dirApp, '..', nombreViejo);
  if (!fs.existsSync(dirViejo) || fs.existsSync(path.join(dirViejo, AVISO_MUDANZA))) return;
  // Con package.json no son restos: es la app de una rama anterior al cambio de
  // nombre, y llevarse su node_modules la dejaría sin arrancar.
  if (fs.existsSync(path.join(dirViejo, 'package.json'))) return;

  const traido = [];
  const modulosViejos = path.join(dirViejo, 'node_modules');
  const modulosNuevos = path.join(dirApp, 'node_modules');
  if (fs.existsSync(modulosViejos) && !fs.existsSync(modulosNuevos)) {
    try {
      fs.renameSync(modulosViejos, modulosNuevos);
      traido.push('node_modules');
    } catch {
      // Un proceso lo tiene abierto (un `npm run dev` viejo, el editor): el paso 3
      // instala de cero, que es más lento pero da lo mismo.
    }
  }

  let copiados = 0;
  const envs = [];
  for (const relativo of archivosDe(dirViejo, DERIVADOS)) {
    const destino = path.join(dirApp, relativo);
    if (fs.existsSync(destino)) continue;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(path.join(dirViejo, relativo), destino);
    copiados++;
    if (path.posix.basename(relativo).startsWith('.env')) envs.push(relativo);
  }
  if (envs.length) traido.push(envs.join(', '));
  const otros = copiados - envs.length;
  if (otros) traido.push(`${otros} archivo${otros === 1 ? '' : 's'} más (subidos y locales)`);

  fs.writeFileSync(
    path.join(dirViejo, AVISO_MUDANZA),
    [
      `Esta carpeta es lo que quedó de «${nombreViejo}» cuando pasó a llamarse «${nombreApp}».`,
      `Lo que servía (.env, archivos subidos, node_modules) ya se copió a ../${nombreApp}`,
      'la primera vez que se corrió `npm run dev` allí. Esta carpeta ya se puede borrar.',
      '',
    ].join('\n'),
  );

  console.log(`[olo] ${nombreApp}: traído de ../${nombreViejo}: ${traido.join(' · ') || 'nada que faltara'}.`);
  console.log(`[olo]   La carpeta ../${nombreViejo} ya se puede borrar.`);
}

traerDeLaCarpetaVieja();

// ── 2. Recompilar `dist/` desactualizado ──────────────────────────────────────
// Antes de comparar: si no se recompila primero, el paso 3 puede ver origen y
// copia "iguales" (ambos con el mismo dist viejo) y no tocar nada.
const paquetes = Object.entries(dependencias)
  .filter(([n, v]) => n.startsWith('@olo/') && typeof v === 'string' && v.startsWith('file:'))
  .map(([nombre, spec]) => ({
    nombre,
    origen: path.resolve(dirApp, spec.slice('file:'.length)),
    copia: path.join(dirApp, 'node_modules', ...nombre.split('/')),
  }))
  .filter((p) => fs.existsSync(p.origen));

for (const paquete of paquetes) {
  const suPkg = leerJson(path.join(paquete.origen, 'package.json'));
  const main = typeof suPkg?.main === 'string' ? suPkg.main : '';
  if (!main.startsWith('dist/')) continue;

  const dirDist = path.join(paquete.origen, 'dist');
  const dirSrc = path.join(paquete.origen, 'src');
  const desactualizado = !fs.existsSync(dirDist) || masReciente(dirSrc) > masReciente(dirDist);
  if (!desactualizado) continue;

  const comandoBuild = suPkg?.scripts?.build;
  if (!comandoBuild) {
    console.warn(`[olo] AVISO  ${paquete.nombre} tiene src/ más nuevo que dist/ y no declara "build".`);
    continue;
  }

  console.log(`[olo] ${paquete.nombre}: dist/ desactualizado, recompilando...`);
  try {
    if (!fs.existsSync(path.join(paquete.origen, 'node_modules'))) {
      ejecutarNpm(['install', '--no-audit', '--no-fund'], paquete.origen);
    }
    ejecutarNpm(['run', 'build'], paquete.origen);
  } catch (error) {
    console.error(`[olo] ERROR  no se pudo compilar ${paquete.nombre}:`);
    console.error(error.message ?? error);
    process.exit(1);
  }
}

// ── 3. Instalar si algo no coincide ───────────────────────────────────────────

/**
 * Lo que el `package-lock.json` pide y `node_modules` no tiene, según el registro
 * que npm deja de lo que instaló.
 *
 * - Los opcionales se saltan: muchos son binarios de otro sistema operativo que
 *   npm nunca instala aquí, y contarlos reinstalaría en cada arranque.
 * - Los `link` son los `@olo/*`, que se comparan aparte, por contenido.
 */
function dependenciasDesalineadas() {
  const lock = leerJson(path.join(dirApp, 'package-lock.json'));
  if (!lock?.packages) return [];
  const instalado = leerJson(path.join(dirApp, 'node_modules', '.package-lock.json'))?.packages;
  if (!instalado) return ['node_modules sin instalar'];

  const fuera = [];
  for (const [clave, info] of Object.entries(lock.packages)) {
    if (!clave.startsWith('node_modules/') || info.optional || info.link) continue;
    const real = instalado[clave];
    const nombre = clave.slice('node_modules/'.length);
    if (!real) fuera.push(`falta ${nombre}`);
    else if (info.version && real.version !== info.version) fuera.push(`${nombre} ${real.version} → ${info.version}`);
  }
  // Una librería en package.json que el lock todavía no tiene: alguien la agregó a
  // mano sin instalar. `npm install` la agrega a los dos.
  for (const [nombre, spec] of Object.entries(dependencias)) {
    if (typeof spec === 'string' && spec.startsWith('file:')) continue;
    if (!instalado[`node_modules/${nombre}`]) fuera.push(`falta ${nombre}`);
  }
  return [...new Set(fuera)];
}

function paquetesDesincronizados() {
  return paquetes
    .map((p) => ({ ...p, cambios: diferencias(huellaDeArbol(p.origen), huellaDeArbol(p.copia)) }))
    .filter((p) => p.cambios.length > 0);
}

const desalineadas = dependenciasDesalineadas();
const desincronizados = paquetesDesincronizados();

if (desalineadas.length > 0 || desincronizados.length > 0) {
  if (desalineadas.length > 0) {
    const muestra = desalineadas.slice(0, 4).join(', ');
    const resto = desalineadas.length > 4 ? ` y ${desalineadas.length - 4} más` : '';
    console.log(`[olo] ${nombreApp}: node_modules no coincide con package-lock.json (${muestra}${resto}).`);
  }
  if (desincronizados.length > 0) {
    console.log(`[olo] ${nombreApp}: la copia en node_modules no coincide con packages/.`);
    for (const paquete of desincronizados) {
      console.log(`[olo]   ${paquete.nombre} — ${paquete.cambios.join(', ')}`);
    }
    vaciarCarpetaOlo(path.join(dirApp, 'node_modules', '@olo'));
  }
  console.log('[olo] Instalando...');
  reinstalar();

  // Sin esta comprobación, un fallo silencioso de npm dejaría arrancar la app con
  // la copia vieja, y el error original volvería disfrazado de otra cosa.
  const siguenMal = paquetesDesincronizados();
  if (siguenMal.length > 0) {
    console.error('[olo] ERROR  la reinstalación no dejó la copia al día:');
    for (const paquete of siguenMal) console.error(`[olo]   ${paquete.nombre}`);
    console.error(`[olo] Prueba a mano: borra ${nombreApp}/node_modules y reinstala.`);
    process.exit(1);
  }
  const sigueDesalineado = dependenciasDesalineadas();
  if (sigueDesalineado.length > 0) {
    console.warn(`[olo] AVISO  después de instalar sigue faltando: ${sigueDesalineado.slice(0, 4).join(', ')}.`);
  }
  console.log('[olo] Listo: dependencias al día.');
}

// ── 4. `.next` viejo ──────────────────────────────────────────────────────────
function limpiarNextSiQuedoViejo() {
  if (!dependencias.next) return;
  const dirNext = path.join(dirApp, '.next');
  const archivoSello = path.join(dirNext, 'cache', 'olo-sello.json');
  let lock = null;
  try {
    lock = createHash('sha1').update(fs.readFileSync(path.join(dirApp, 'package-lock.json'))).digest('hex');
  } catch {
    // Sin package-lock no hay con qué comparar: cuentan la carpeta y la versión.
  }
  const sello = {
    carpeta: dirApp,
    next: leerJson(path.join(dirApp, 'node_modules', 'next', 'package.json'))?.version ?? null,
    lock,
  };
  const anterior = leerJson(archivoSello);

  let motivo = null;
  if (fs.existsSync(dirNext)) {
    if (!anterior) motivo = 'no se sabe de dónde salió';
    else if (anterior.carpeta !== sello.carpeta) motivo = 'es de otra carpeta';
    else if (anterior.next !== sello.next) motivo = `es de Next ${anterior.next}`;
    else if (anterior.lock !== sello.lock) motivo = 'es de otras dependencias';
  }
  if (!motivo && anterior) return;

  if (motivo) {
    console.log(`[olo] ${nombreApp}: borrando .next (${motivo}); la primera carga de cada página tardará un poco más.`);
    try {
      fs.rmSync(dirNext, { recursive: true, force: true, maxRetries: 3 });
    } catch (error) {
      console.warn(`[olo] AVISO  no se pudo borrar .next (${error.code ?? error.message}).`);
      console.warn(`[olo]   Si ves errores raros, cierra lo que esté usando ${nombreApp} y bórralo a mano.`);
      return;
    }
  }
  fs.mkdirSync(path.dirname(archivoSello), { recursive: true });
  fs.writeFileSync(archivoSello, `${JSON.stringify(sello, null, 2)}\n`);
}

limpiarNextSiQuedoViejo();

// ── 5. Hooks del repositorio ──────────────────────────────────────────────────
// Solo si el clon no tiene hooks propios: un `core.hooksPath` ya puesto (husky u
// otros) es una decisión de esa persona y no se toca.
function activarHooks() {
  const raiz = path.resolve(dirApp, '..');
  if (!fs.existsSync(path.join(raiz, '.githooks'))) return;
  try {
    const actual = execFileSync('git', ['config', '--get', 'core.hooksPath'], { cwd: raiz, encoding: 'utf8' }).trim();
    if (actual) return;
  } catch {
    // `git config --get` sale con 1 cuando la clave no existe: es el caso de seguir.
  }
  try {
    execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: raiz, stdio: 'ignore' });
    console.log('[olo] Hooks del repositorio activados (.githooks): el mapa del proyecto se pone al día en cada commit.');
  } catch {
    // Sin git, o fuera de un repositorio (una copia descargada en zip): no hay hooks que activar.
  }
}

activarHooks();

// ── 6. Archivos subidos al filesystem ─────────────────────────────────────────

/** De dónde sale lo subido en cada app (las carpetas de antes) y a dónde va. */
const ARCHIVOS_DE_ANTES = {
  '3000-sitio-web': [
    ['public/storage/uploads', 'sitio/uploads'],
    ['public/storage/backup', 'sitio/backup'],
  ],
  '3001-intranet': [
    ['public/storage/uploads', 'intranet/uploads'],
    ['public/storage/backup', 'intranet/backup'],
  ],
  '4000-api-backend': [['uploads/cargas-datos', 'cargas-datos']],
};

/** Viven en esas carpetas pero son del repositorio, no algo que alguien subió. */
const DEL_REPOSITORIO = new Set(['fuentes-futuras-de-empleo.xlsx', '.gitkeep']);

/**
 * La misma raíz que usa la API (`filesystem.ts`): `FILESYSTEM_DIR` del entorno o
 * del `.env` de la API, relativa a su carpeta; si no hay, `filesystem/` en la raíz.
 */
function raizDelFilesystem() {
  const dirApi = path.resolve(dirApp, '..', '4000-api-backend');
  let valor = process.env.FILESYSTEM_DIR;
  if (!valor) {
    try {
      valor = /^FILESYSTEM_DIR=(.*)$/m.exec(fs.readFileSync(path.join(dirApi, '.env'), 'utf8'))?.[1]?.trim();
    } catch {
      // Sin `.env` vale el valor por defecto, igual que en la API.
    }
  }
  return valor ? path.resolve(dirApi, valor) : path.resolve(dirApp, '..', 'filesystem');
}

/**
 * Desde el 2026-10-06 lo subido vive en el filesystem y solo lo toca la API; antes
 * cada app lo tenía en su carpeta, y un `git pull` no lo muda. Se copia una vez por app,
 * sin pisar nada, y se deja una marca para no repetirlo: copiar en cada arranque haría
 * reaparecer lo que la API ya borró por huérfano. Las carpetas de antes no se tocan.
 */
function mudarArchivosSubidos() {
  const pares = ARCHIVOS_DE_ANTES[nombreApp];
  if (!pares) return;
  const raiz = raizDelFilesystem();
  const marca = path.join(raiz, `.mudado-${nombreApp}`);
  if (fs.existsSync(marca)) return;

  let copiados = 0;
  for (const [origenRelativo, destinoRelativo] of pares) {
    const origen = path.join(dirApp, origenRelativo);
    for (const relativo of archivosDe(origen, new Set())) {
      if (DEL_REPOSITORIO.has(path.posix.basename(relativo))) continue;
      const destino = path.join(raiz, destinoRelativo, relativo);
      if (fs.existsSync(destino)) continue;
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.copyFileSync(path.join(origen, relativo), destino);
      copiados++;
    }
  }

  fs.mkdirSync(raiz, { recursive: true });
  fs.writeFileSync(
    marca,
    `Los archivos subidos de ${nombreApp} ya se copiaron aquí. Borra esta marca para repetirlo.\n`,
  );
  if (copiados > 0) {
    const carpetas = pares.map(([origen]) => origen).join(' y ');
    console.log(`[olo] ${nombreApp}: ${copiados} archivo(s) subidos copiados a ${path.relative(path.resolve(dirApp, '..'), raiz)}/.`);
    console.log(`[olo]   La API ya no los lee de ${carpetas}: cuando compruebes que todo se ve, se pueden`);
    console.log('[olo]   borrar de ahí (lo que viene con el repositorio, no: git lo volvería a traer).');
  }
}

mudarArchivosSubidos();
