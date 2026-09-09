#!/usr/bin/env node
/**
 * Sincroniza los paquetes locales `@olo/*` con su copia dentro de `node_modules`.
 *
 * ── Por qué hace falta ─────────────────────────────────────────────────────────
 * `sitio-web`, `intranet` y `api-backend` declaran los paquetes de `packages/`
 * como `file:../packages/*`, y sus `.npmrc` fijan `install-links=true`. Esa opción
 * está puesta a propósito: en Windows, sin modo desarrollador, npm no puede crear
 * el symlink y deja la carpeta vacía. Pero al copiar en vez de enlazar aparece un
 * efecto que muerde tarde y fuerte: npm solo repite la copia cuando cambia la
 * VERSIÓN declarada del paquete, y todos siguen en `0.1.0` desde el primer día.
 *
 * Resultado: edites lo que edites en `packages/`, npm contesta `up to date` y la
 * app sigue compilando contra una copia congelada. El síntoma es de los que hacen
 * perder una tarde, porque el error miente sobre dónde está el problema:
 *
 *     Export ResaltadorDeBusqueda doesn't exist in target module
 *
 * ...señalando un export que en `packages/` existe perfectamente. La ruta del
 * error es la pista: apunta a `node_modules/@olo/...`, no a `packages/`.
 *
 * ── Qué hace ───────────────────────────────────────────────────────────────────
 * Compara el contenido real de cada paquete con el de su copia y, solo si
 * difieren, borra `node_modules/@olo` y reinstala (al no existir la carpeta, npm
 * se ve obligado a copiar de nuevo). Si coinciden no hace nada y arrancar cuesta
 * unos milisegundos.
 *
 * No guarda estado en ningún archivo: la comparación ES la fuente de verdad. Por
 * eso acierta también después de un `git pull`, un cambio de rama o un borrado
 * manual de `node_modules`, y por eso dentro de Docker no hace nada — allí el
 * Dockerfile ya deja la copia buena con su doble `npm ci`.
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

function leerJson(archivo) {
  try {
    return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  } catch {
    return null;
  }
}

/** Mapa de ruta relativa → sha1 del contenido, para todo el árbol de `raiz`. */
function huellaDeArbol(raiz) {
  const huellas = new Map();
  if (!fs.existsSync(raiz)) return huellas;

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
      if (EXCLUIDOS.has(entrada.name)) continue;
      const completo = path.join(actual, entrada.name);
      if (entrada.isDirectory()) {
        pendientes.push(completo);
      } else if (entrada.isFile()) {
        const relativo = path.relative(raiz, completo).split(path.sep).join('/');
        huellas.set(relativo, createHash('sha1').update(fs.readFileSync(completo)).digest('hex'));
      }
    }
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
  if (!fs.existsSync(raiz)) return maxima;

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
      if (EXCLUIDOS.has(entrada.name)) continue;
      const completo = path.join(actual, entrada.name);
      if (entrada.isDirectory()) pendientes.push(completo);
      else if (entrada.isFile()) maxima = Math.max(maxima, fs.statSync(completo).mtimeMs);
    }
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

function reinstalar() {
  // `npm_execpath` lo pone npm al lanzar el script y apunta a su propio JS. Usarlo
  // evita invocar `npm.cmd`, que en Windows las versiones recientes de Node se
  // niegan a ejecutar sin shell.
  const cliNpm = process.env.npm_execpath;
  if (cliNpm && cliNpm.endsWith('.js')) {
    execFileSync(process.execPath, [cliNpm, 'install', '--no-audit', '--no-fund'], {
      cwd: dirApp,
      stdio: 'inherit',
    });
  } else {
    execFileSync('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: dirApp,
      stdio: 'inherit',
      shell: true,
    });
  }
}

// ── 1. Qué paquetes locales declara esta app ──────────────────────────────────
const pkgApp = leerJson(path.join(dirApp, 'package.json'));
if (pkgApp === null) process.exit(0);

const dependencias = { ...pkgApp.dependencies, ...pkgApp.devDependencies };
const paquetes = Object.entries(dependencias)
  .filter(([n, v]) => n.startsWith('@olo/') && typeof v === 'string' && v.startsWith('file:'))
  .map(([nombre, spec]) => ({
    nombre,
    origen: path.resolve(dirApp, spec.slice('file:'.length)),
    copia: path.join(dirApp, 'node_modules', ...nombre.split('/')),
  }))
  .filter((p) => fs.existsSync(p.origen));

if (paquetes.length === 0) process.exit(0);

// ── 2. ¿Alguno difiere de su copia? ───────────────────────────────────────────
const desincronizados = [];
for (const paquete of paquetes) {
  const cambios = diferencias(huellaDeArbol(paquete.origen), huellaDeArbol(paquete.copia));
  if (cambios.length > 0) desincronizados.push({ ...paquete, cambios });
}

// ── 3. Aviso aparte: `dist/` sin recompilar ───────────────────────────────────
// Cinco paquetes se consumen por `dist/` y no por `src/`. Copiar un `dist` viejo
// no da error de compilación: la app arranca y ejecuta la lógica anterior, que es
// bastante peor que un fallo ruidoso. Aquí solo se avisa, no se compila: `dist/`
// está en .gitignore y compilarlo exige instalar antes las dependencias del paquete.
for (const paquete of paquetes) {
  const suPkg = leerJson(path.join(paquete.origen, 'package.json'));
  const main = typeof suPkg?.main === 'string' ? suPkg.main : '';
  if (!main.startsWith('dist/')) continue;

  const dirDist = path.join(paquete.origen, 'dist');
  const relativo = path.relative(path.dirname(dirApp), paquete.origen).split(path.sep).join('/');

  if (!fs.existsSync(dirDist)) {
    console.warn(`[olo] AVISO  ${paquete.nombre} no tiene dist/ compilado, y la app lee dist/.`);
    console.warn(`[olo]        npm --prefix ${relativo} install && npm --prefix ${relativo} run build`);
  } else if (masReciente(path.join(paquete.origen, 'src')) > masReciente(dirDist)) {
    console.warn(`[olo] AVISO  ${paquete.nombre} tiene src/ más nuevo que dist/, y la app lee dist/.`);
    console.warn(`[olo]        npm --prefix ${relativo} run build`);
  }
}

if (desincronizados.length === 0) process.exit(0);

// ── 4. Resincronizar ──────────────────────────────────────────────────────────
console.log(`[olo] ${nombreApp}: la copia en node_modules no coincide con packages/.`);
for (const paquete of desincronizados) {
  console.log(`[olo]   ${paquete.nombre} — ${paquete.cambios.join(', ')}`);
}
console.log('[olo] Borrando node_modules/@olo y reinstalando...');

vaciarCarpetaOlo(path.join(dirApp, 'node_modules', '@olo'));
reinstalar();

// ── 5. Comprobar que la reinstalación sirvió de algo ──────────────────────────
// Sin esto, un fallo silencioso de npm dejaría arrancar la app con la copia vieja
// y el error original volvería disfrazado de otra cosa.
const siguenMal = desincronizados.filter(
  (p) => diferencias(huellaDeArbol(p.origen), huellaDeArbol(p.copia)).length > 0,
);

if (siguenMal.length > 0) {
  console.error('[olo] ERROR  la reinstalación no dejó la copia al día:');
  for (const paquete of siguenMal) console.error(`[olo]   ${paquete.nombre}`);
  console.error(`[olo] Prueba a mano: borra ${nombreApp}/node_modules y reinstala.`);
  process.exit(1);
}

console.log('[olo] Listo: paquetes locales al día.');
