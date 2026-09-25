/**
 * Genera `docs/13-mapa-del-proyecto.md`: el plano de cómo ESTÁ el proyecto —carpetas,
 * features, rutas, endpoints, librerías y base de datos—, sacado del propio código.
 *
 *   node scripts/mapa/generar-mapa.mjs                        # desde tu árbol de trabajo
 *   node scripts/mapa/generar-mapa.mjs --desde index --hook   # lo que entra en el commit (pre-commit)
 *   node scripts/mapa/generar-mapa.mjs --comparar ORIG_HEAD HEAD   # qué cambió (post-merge)
 *   node scripts/mapa/generar-mapa.mjs --pendientes           # carpetas que falta describir
 *
 * Cómo DEBE estar el proyecto no sale de aquí: eso lo dicen las personas, en
 * `descripciones.md` (para qué es cada carpeta) y en los `.md` de `docs/`.
 *
 * El mapa no lleva fecha ni commit a propósito: así solo cambia cuando cambia la
 * estructura, y el diff de un commit dice exactamente qué carpeta, librería o ruta entró.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const SALIDA = 'docs/13-mapa-del-proyecto.md';
const DESCRIPCIONES = 'scripts/mapa/descripciones.md';

/**
 * Las carpetas de las apps, con o sin el puerto delante: el historial dice `sitio-web`
 * y el presente `3000-sitio-web`, y el mapa tiene que leer los dos, porque el hook de
 * después de un pull compara un commit viejo con uno nuevo.
 */
const FRONT = String.raw`(?:\d+-)?(?:sitio-web|intranet)`;
const API = String.raw`(?:\d+-)?api-backend`;
const re = (patron) => new RegExp(patron);
/** La misma ruta sin el puerto delante de la app, para comparar entre los dos nombres. */
const sinPuerto = (texto) => texto.replace(/(?<![\w/-])\d+-(?=(?:sitio-web|intranet|api-backend)\b)/g, '');

/** Lo que no es estructura: datos subidos, generados y dependencias instaladas. */
const IGNORAR = re(String.raw`(^|/)(node_modules|\.next|dist)/|(^|/)public/storage/|^${API}/uploads/`);

/** Hasta qué profundidad se dibuja cada zona en el árbol de carpetas. */
const PROFUNDIDAD = [
  [re(String.raw`^${FRONT}/src/app/`), 4],
  [re(String.raw`^${FRONT}/public/`), 3],
  [re(String.raw`^${FRONT}/`), 5],
  [re(String.raw`^${API}/src/infrastructure/`), 5],
  [re(String.raw`^${API}/`), 4],
  [/^packages\//, 3],
  [/.*/, 2],
];

/** Las carpetas que tienen que decir para qué son. Las demás se dibujan sin exigirlo. */
const SE_DESCRIBE = [
  /^[^/]+$/,
  re(String.raw`^${FRONT}/[^/]+$`),
  re(String.raw`^${FRONT}/src/[^/]+$`),
  re(String.raw`^${FRONT}/src/features/[^/]+$`),
  re(String.raw`^${FRONT}/src/features/[^/]+/[^/]+$`),
  re(String.raw`^${FRONT}/src/shared/[^/]+$`),
  re(String.raw`^${FRONT}/src/shared/[^/]+/[^/]+$`),
  re(String.raw`^${API}/[^/]+$`),
  re(String.raw`^${API}/src/[^/]+$`),
  re(String.raw`^${API}/src/[^/]+/[^/]+$`),
  /^packages\/[^/]+$/,
  /^docker\/[^/]+$/,
];

/**
 * Dentro de una feature, estos nombres ya están definidos por la anatomía de
 * `2-convenciones` §2.4 y `1-guia` §4.0: no hace falta describirlos cada vez.
 */
const ESTANDAR = {
  components: 'UI del dominio',
  hooks: 'estado y efectos del dominio',
  services: 'única capa que llama a la API',
  lib: 'lógica y datos que no son servicio',
  model: 'lo que comparten las etapas del dominio',
};

// ── Fuente: árbol de trabajo, índice (staging) o un commit ─────────────────────────

function git(args, { entrada, binario = false } = {}) {
  const r = spawnSync('git', args, { cwd: RAIZ, encoding: binario ? null : 'utf8', maxBuffer: 1 << 29, input: entrada });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${String(r.stderr).trim()}`);
  return r.stdout;
}

function crearFuente(desde) {
  let rutas;
  let prefijo = null;
  if (desde === 'arbol') {
    rutas = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter((r) => r && fs.existsSync(path.join(RAIZ, r)));
  } else if (desde === 'index') {
    rutas = git(['ls-files', '--cached', '-z']).split('\0').filter(Boolean);
    prefijo = ':';
  } else {
    rutas = git(['ls-tree', '-r', '--name-only', '-z', desde]).split('\0').filter(Boolean);
    prefijo = `${desde}:`;
  }
  rutas = [...new Set(rutas)].filter((r) => !IGNORAR.test(r)).sort();
  const existentes = new Set(rutas);
  const cache = new Map();

  /** Una sola llamada a git para todos los archivos: en un hook, cada proceso cuenta. */
  function precargar(lista) {
    const faltan = lista.filter((r) => existentes.has(r) && !cache.has(r));
    if (!faltan.length) return;
    if (prefijo === null) {
      for (const r of faltan) cache.set(r, fs.readFileSync(path.join(RAIZ, r), 'utf8'));
      return;
    }
    const salida = git(['cat-file', '--batch'], { entrada: `${faltan.map((r) => prefijo + r).join('\n')}\n`, binario: true });
    let pos = 0;
    for (const r of faltan) {
      const fin = salida.indexOf(10, pos);
      const cabecera = salida.subarray(pos, fin).toString('utf8');
      pos = fin + 1;
      if (cabecera.endsWith('missing')) continue;
      const tamano = Number(cabecera.split(' ')[2]);
      cache.set(r, salida.subarray(pos, pos + tamano).toString('utf8'));
      pos += tamano + 1;
    }
  }
  const leer = (r) => {
    precargar([r]);
    return cache.get(r) ?? '';
  };
  return { rutas, existe: (r) => existentes.has(r), leer, precargar };
}

// ── Modelo: lo que se sabe del proyecto a partir de la fuente ──────────────────────

const profundidad = (dir) => dir.split('/').length;
const maximo = (dir) => PROFUNDIDAD.find(([re]) => re.test(`${dir}/`))[1];

function leerDescripciones(texto) {
  const mapa = new Map();
  for (const linea of texto.split(/\r?\n/)) {
    const m = /^\s*-\s*`([^`]+?)\/?`\s*[—–-]\s*(.+?)\s*$/.exec(linea);
    if (m) mapa.set(m[1], m[2]);
  }
  return mapa;
}

/** Recorre los argumentos de `obj.metodo(...)` sin confundirse con strings ni comentarios. */
function llamadas(texto, objeto) {
  const resultado = [];
  const re = new RegExp(`\\b${objeto}\\.(use|get|post|put|patch|delete)\\s*\\(`, 'g');
  for (const m of texto.matchAll(re)) {
    const args = [];
    let actual = '';
    let nivel = 0;
    let i = m.index + m[0].length;
    for (; i < texto.length; i++) {
      const c = texto[i];
      if (c === '/' && texto[i + 1] === '/') { i = texto.indexOf('\n', i); if (i < 0) break; continue; }
      if (c === '/' && texto[i + 1] === '*') { i = texto.indexOf('*/', i) + 1; continue; }
      if (c === "'" || c === '"' || c === '`') {
        const inicio = i;
        for (i++; i < texto.length && texto[i] !== c; i++) if (texto[i] === '\\') i++;
        actual += texto.slice(inicio, i + 1);
        continue;
      }
      if ('([{'.includes(c)) nivel++;
      if (')]}'.includes(c)) {
        if (nivel === 0) break;
        nivel--;
      }
      if (c === ',' && nivel === 0) { args.push(actual.trim()); actual = ''; continue; }
      actual += c;
    }
    if (actual.trim()) args.push(actual.trim());
    resultado.push({ metodo: m[1], args, linea: texto.slice(0, m.index).split('\n').length });
  }
  return resultado;
}
const literal = (arg) => /^(['"`])(.*)\1$/s.exec(arg ?? '')?.[2] ?? null;
const resumir = (arg) => {
  const limpio = arg.replace(/\s+/g, ' ');
  if (/=>|^async\b|^function\b/.test(limpio)) return 'función en línea';
  return limpio.length > 60 ? `${limpio.slice(0, 57)}…` : limpio;
};
const PROTEGE = /requireAuth|requierePermiso|requirePermission/;

function construirModelo(fuente) {
  const { rutas } = fuente;
  // Las apps con el nombre que tienen en esta fuente.
  const primerNivel = [...new Set(rutas.map((r) => r.split('/')[0]))];
  const buscar = (nombre) => primerNivel.find((d) => sinPuerto(d) === nombre) ?? nombre;
  const apps = { sitio: buscar('sitio-web'), intranet: buscar('intranet'), api: buscar('api-backend') };
  const MIGRACIONES = `${apps.api}/src/infrastructure/db/migrations/`;
  const MODELOS = `${apps.api}/src/infrastructure/db/models/`;
  const APP_TS = `${apps.api}/src/app.ts`;

  const paquetes = rutas.filter((r) => re(String.raw`^(${FRONT}|${API}|packages/[^/]+)/package\.json$`).test(r));
  const archivosRutas = rutas.filter((r) => re(String.raw`^${API}/src/routes/[^/]+\.ts$`).test(r));
  const modelos = rutas.filter((r) => r.startsWith(MODELOS) && /^[^/]+\.ts$/.test(r.slice(MODELOS.length)) && !r.endsWith('/index.ts'));
  fuente.precargar([...paquetes, ...archivosRutas, ...modelos, APP_TS, `${MIGRACIONES}index.ts`, DESCRIPCIONES]);

  // Carpetas
  const todas = new Set();
  for (const r of rutas) {
    const partes = r.split('/');
    for (let i = 1; i < partes.length; i++) todas.add(partes.slice(0, i).join('/'));
  }
  const carpetas = [...todas].filter((d) => profundidad(d) <= maximo(d)).sort();
  const descripciones = leerDescripciones(fuente.leer(DESCRIPCIONES));
  const descripcionDe = (dir) => {
    if (descripciones.has(dir)) return descripciones.get(dir);
    const nombre = path.posix.basename(dir);
    const padre = path.posix.dirname(dir);
    if (ESTANDAR[nombre] && /\/features\/[^/]+(\/[^/]+)?$/.test(padre)) return ESTANDAR[nombre];
    return null;
  };
  const exigidas = carpetas.filter((d) => SE_DESCRIBE.some((re) => re.test(d)));
  const pendientes = exigidas.filter((d) => !descripcionDe(d));
  const huerfanas = [...descripciones.keys()].filter((d) => !todas.has(d)).sort();

  // Features
  const features = carpetas
    .filter((d) => re(String.raw`^${FRONT}/src/features/[^/]+$`).test(d))
    .map((d) => ({
      ruta: d,
      app: d.split('/')[0],
      nombre: path.posix.basename(d),
      subcarpetas: [...todas].filter((x) => path.posix.dirname(x) === d).map((x) => path.posix.basename(x)).sort(),
      conIndex: fuente.existe(`${d}/index.ts`),
      archivos: rutas.filter((r) => r.startsWith(`${d}/`)).length,
    }));

  // Rutas de Next
  const rutasNext = [];
  const esRutaNext = re(String.raw`^(${FRONT})/src/app/(?:(.*)/)?(page|route|manifest|sitemap|robots)\.(tsx?|jsx?)$`);
  for (const r of rutas) {
    const m = esRutaNext.exec(r);
    if (!m) continue;
    const segmentos = (m[2] ?? '').split('/').filter(Boolean);
    let url = `/${segmentos.filter((s) => !/^\(.*\)$/.test(s) && !s.startsWith('@')).join('/')}`;
    const tipo = { page: 'página', route: 'manejador', manifest: 'metadatos', sitemap: 'metadatos', robots: 'metadatos' }[m[3]];
    if (m[3] === 'manifest') url = '/manifest.webmanifest';
    if (m[3] === 'sitemap') url = '/sitemap.xml';
    if (m[3] === 'robots') url = '/robots.txt';
    rutasNext.push({ app: m[1], url, tipo, grupo: segmentos.find((s) => /^\(.*\)$/.test(s)) ?? '', archivo: r });
  }
  rutasNext.sort((a, b) => (a.app + a.url < b.app + b.url ? -1 : 1));

  // Endpoints de la API
  const app = fuente.leer(APP_TS);
  const archivoDe = new Map([...app.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/routes\/([^'"]+)['"]/g)].map((m) => [m[1], `${apps.api}/src/routes/${m[2]}.ts`]));
  const prefijos = new Map([...app.matchAll(/app\.use\(\s*['"]([^'"]+)['"]\s*,\s*(\w+)\s*\)/g)].map((m) => [archivoDe.get(m[2]), m[1]]));
  const endpoints = [];
  for (const l of llamadas(app, 'app')) {
    const ruta = literal(l.args[0]);
    if (l.metodo === 'use' || !ruta) continue;
    endpoints.push({ archivo: APP_TS, metodo: l.metodo.toUpperCase(), ruta, protecciones: l.args.slice(1, -1).map(resumir), manejador: resumir(l.args.at(-1)) });
  }
  for (const archivo of archivosRutas) {
    const prefijo = prefijos.get(archivo) ?? '(sin montar en app.ts)';
    const comunes = [];
    for (const l of llamadas(fuente.leer(archivo), 'router')) {
      if (l.metodo === 'use') {
        if (literal(l.args[0]) === null) comunes.push(...l.args.map(resumir));
        continue;
      }
      const ruta = literal(l.args[0]);
      if (ruta === null) continue;
      endpoints.push({
        archivo,
        metodo: l.metodo.toUpperCase(),
        ruta: `${prefijo}${ruta === '/' ? '' : ruta}` || '/',
        protecciones: [...comunes, ...l.args.slice(1, -1).map(resumir)],
        manejador: resumir(l.args.at(-1) ?? ''),
      });
    }
  }

  // Librerías
  const librerias = paquetes.map((archivo) => {
    const pkg = JSON.parse(fuente.leer(archivo) || '{}');
    const lista = (deps, tipo) => Object.entries(deps ?? {}).map(([nombre, version]) => ({ nombre, version, tipo }));
    return {
      donde: path.posix.dirname(archivo),
      nombre: pkg.name ?? path.posix.dirname(archivo),
      deps: [...lista(pkg.dependencies, 'producción'), ...lista(pkg.devDependencies, 'desarrollo')].sort((a, b) => (a.nombre < b.nombre ? -1 : 1)),
    };
  });

  // Base de datos
  const manifiesto = [...fuente.leer(`${MIGRACIONES}index.ts`).matchAll(/import\s+\*\s+as\s+\w+\s+from\s+['"]\.\/([^'"]+)['"]/g)].map((m) => m[1]);
  const archivosMigracion = rutas
    .filter((r) => r.startsWith(MIGRACIONES) && /^[^/]+\.ts$/.test(r.slice(MIGRACIONES.length)) && !r.endsWith('/index.ts'))
    .map((r) => path.posix.basename(r, '.ts'));
  const migraciones = [...new Set([...manifiesto, ...archivosMigracion])].map((nombre) => ({
    nombre,
    registrada: manifiesto.includes(nombre),
    conArchivo: archivosMigracion.includes(nombre),
  }));
  const tablas = modelos.map((r) => ({
    archivo: path.posix.basename(r, '.ts'),
    tabla: /tableName:\s*['"]([^'"]+)['"]/.exec(fuente.leer(r))?.[1] ?? '—',
  }));

  return { apps, carpetas, descripcionDe, exigidas, pendientes, huerfanas, features, rutasNext, endpoints, librerias, migraciones, tablas };
}

// ── El documento ──────────────────────────────────────────────────────────────────

const esc = (t) => String(t).replace(/\|/g, '\\|');

function arbol(m) {
  const raices = m.carpetas.filter((d) => profundidad(d) === 1);
  const lineas = [];
  const ancho = 46;
  const dibujar = (dir, prefijo, ultimo, esRaiz) => {
    const nombre = `${path.posix.basename(dir)}/`;
    const cabeza = esRaiz ? nombre : `${prefijo}${ultimo ? '└── ' : '├── '}${nombre}`;
    const desc = m.descripcionDe(dir) ?? (m.exigidas.includes(dir) ? '⚠ sin descripción' : '');
    lineas.push(desc ? `${cabeza.padEnd(ancho)} ${desc}` : cabeza);
    const hijos = m.carpetas.filter((d) => path.posix.dirname(d) === dir);
    hijos.forEach((h, i) => dibujar(h, esRaiz ? '' : `${prefijo}${ultimo ? '    ' : '│   '}`, i === hijos.length - 1, false));
  };
  for (const r of raices) {
    dibujar(r, '', true, true);
    lineas.push('');
  }
  return lineas.join('\n').trimEnd();
}

function documento(m) {
  const apps = [m.apps.sitio, m.apps.intranet, m.apps.api];
  const frontends = [m.apps.sitio, m.apps.intranet];
  const esApi = (a) => a === m.apps.api;
  const deApp = (a) => ({
    carpetas: m.carpetas.filter((d) => d.startsWith(`${a}/`)).length,
    features: m.features.filter((f) => f.app === a).length,
    rutas: m.rutasNext.filter((r) => r.app === a).length,
    endpoints: esApi(a) ? m.endpoints.length : 0,
    librerias: m.librerias.find((l) => l.donde === a)?.deps.length ?? 0,
  });
  const out = [];
  out.push(
    '# Mapa del proyecto',
    '',
    '> **Generado, no se edita a mano.** Lo escribe `scripts/mapa/generar-mapa.mjs` a partir del',
    '> código: dice cómo **está** el proyecto, no cómo debe estar. Si algo de aquí está mal,',
    '> lo que se corrige es el código, o la descripción de la carpeta en',
    '> [`scripts/mapa/descripciones.md`](../scripts/mapa/descripciones.md).',
    '>',
    '> Se regenera solo antes de cada commit y después de cada `git pull`. Los hooks que lo',
    '> hacen se activan la primera vez que corres `npm run dev` en cualquier app (o a mano:',
    '> `git config core.hooksPath .githooks`). Para regenerarlo sin commit:',
    '> `node scripts/mapa/generar-mapa.mjs`.',
    '',
    '## Resumen',
    '',
    '| | Carpetas | Features | Rutas de Next | Endpoints | Librerías |',
    '|---|--:|--:|--:|--:|--:|',
    ...apps.map((a) => {
      const n = deApp(a);
      return `| \`${a}\` | ${n.carpetas} | ${esApi(a) ? '—' : n.features} | ${esApi(a) ? '—' : n.rutas} | ${esApi(a) ? n.endpoints : '—'} | ${n.librerias} |`;
    }),
    '',
    `Paquetes compartidos: ${m.librerias.filter((l) => l.donde.startsWith('packages/')).length} · migraciones: ${m.migraciones.length} · modelos: ${m.tablas.length}.`,
    '',
  );

  out.push(`## Carpetas sin descripción (${m.pendientes.length})`, '');
  if (m.pendientes.length) {
    out.push('Cada carpeta de estos niveles tiene que decir para qué es. Se describe en `scripts/mapa/descripciones.md` con una línea: `` - `ruta/` — para qué es ``.', '');
    out.push(...m.pendientes.map((d) => `- \`${d}/\``), '');
  } else {
    out.push('Todas las carpetas que se describen tienen su descripción.', '');
  }
  if (m.huerfanas.length) {
    out.push(`**Descripciones de carpetas que ya no existen (${m.huerfanas.length}):** ${m.huerfanas.map((d) => `\`${d}/\``).join(', ')}. Se borran de \`descripciones.md\` o se corrige la ruta.`, '');
  }

  out.push('## Carpetas', '', '```text', arbol(m), '```', '');

  out.push('## Features', '');
  for (const a of frontends) {
    out.push(`### ${a}`, '', '| Feature | Para qué | Subcarpetas | `index.ts` | Archivos |', '|---|---|---|:-:|--:|');
    for (const f of m.features.filter((x) => x.app === a)) {
      out.push(`| \`${f.nombre}/\` | ${esc(m.descripcionDe(f.ruta) ?? '⚠ sin descripción')} | ${f.subcarpetas.map((s) => `\`${s}/\``).join(' ') || '—'} | ${f.conIndex ? 'sí' : '**no**'} | ${f.archivos} |`);
    }
    out.push('');
  }

  out.push('## Rutas de Next', '', 'La URL que ve el navegador y el archivo que la pinta. Los grupos entre paréntesis ordenan carpetas y no aparecen en la URL.', '');
  for (const a of frontends) {
    out.push(`### ${a}`, '', '| URL | Tipo | Grupo | Archivo |', '|---|---|---|---|');
    for (const r of m.rutasNext.filter((x) => x.app === a)) {
      out.push(`| \`${r.url}\` | ${r.tipo} | ${r.grupo ? `\`${r.grupo}\`` : ''} | \`${r.archivo.replace(`${a}/src/app/`, '')}\` |`);
    }
    out.push('');
  }

  out.push('## Endpoints de la API', '', '🔓 = ninguna protección de sesión o permiso a la vista (puede ser público a propósito, como el login).', '');
  for (const archivo of [...new Set(m.endpoints.map((e) => e.archivo))]) {
    out.push(`### \`${archivo.replace(`${m.apps.api}/src/`, '')}\``, '', '| Método | Ruta | Protección y validación | Manejador |', '|---|---|---|---|');
    for (const e of m.endpoints.filter((x) => x.archivo === archivo)) {
      const abierta = !e.protecciones.some((p) => PROTEGE.test(p));
      out.push(`| ${e.metodo} | \`${esc(e.ruta)}\` | ${abierta ? '🔓 ' : ''}${esc(e.protecciones.join(', ')) || '—'} | ${esc(e.manejador)} |`);
    }
    out.push('');
  }

  out.push('## Librerías', '');
  const locales = m.librerias.filter((l) => l.donde.startsWith('packages/'));
  if (locales.length) {
    out.push('### Paquetes compartidos (`packages/`)', '', '| Paquete | Carpeta | Lo usan |', '|---|---|---|');
    for (const p of locales) {
      const usan = m.librerias.filter((l) => l.deps.some((d) => d.nombre === p.nombre)).map((l) => `\`${l.donde}\``);
      out.push(`| \`${p.nombre}\` | \`${p.donde}/\` | ${usan.join(', ') || '—'} |`);
    }
    out.push('');
  }
  for (const l of m.librerias.filter((x) => !x.donde.startsWith('packages/'))) {
    out.push(`### ${l.donde}`, '', '| Librería | Versión | Para |', '|---|---|---|');
    for (const d of l.deps) out.push(`| \`${d.nombre}\` | \`${esc(d.version)}\` | ${d.tipo} |`);
    out.push('');
  }

  out.push('## Base de datos', '', '### Migraciones', '', 'En el orden del manifiesto (`migrations/index.ts`), que es el orden en que corren.', '');
  out.push(...m.migraciones.map((g) => `- \`${g.nombre}\`${g.registrada ? '' : ' — ⚠ el archivo existe pero no está en el manifiesto: no corre'}${g.conArchivo ? '' : ' — ⚠ está en el manifiesto y no hay archivo'}`), '');
  out.push('### Modelos', '', '| Modelo | Tabla |', '|---|---|', ...m.tablas.map((t) => `| \`${t.archivo}\` | \`${t.tabla}\` |`), '');
  return `${out.join('\n').trimEnd()}\n`;
}

// ── Comparar dos versiones: lo que imprime el hook después de un pull ─────────────

function cambios(antes, despues) {
  const lineas = [];
  // Se compara sin el puerto delante de la app: renombrar `sitio-web` a `3000-sitio-web`
  // no es una carpeta, una ruta y una librería nuevas por cada cosa que tiene dentro.
  const porClave = (lista) => new Map(lista.map((x) => [sinPuerto(x), x]));
  const diferencia = (etiqueta, f) => {
    const a = porClave(f(antes));
    const d = porClave(f(despues));
    for (const [k, x] of d) if (!a.has(k)) lineas.push(`  + ${etiqueta} ${x}`);
    for (const [k, x] of a) if (!d.has(k)) lineas.push(`  − ${etiqueta} ${x}`);
  };
  const carpetasAntes = new Set(antes.carpetas.map(sinPuerto));
  const carpetasDespues = new Set(despues.carpetas.map(sinPuerto));
  for (const c of despues.carpetas) {
    if (!carpetasAntes.has(sinPuerto(c))) lineas.push(`  + carpeta ${c}/${despues.pendientes.includes(c) ? '  (⚠ sin descripción)' : ''}`);
  }
  for (const c of antes.carpetas) if (!carpetasDespues.has(sinPuerto(c))) lineas.push(`  − carpeta ${c}/`);
  diferencia('ruta', (m) => m.rutasNext.map((r) => `${r.url} (${r.app})`));
  diferencia('endpoint', (m) => m.endpoints.map((e) => `${e.metodo} ${e.ruta}`));
  diferencia('migración', (m) => m.migraciones.map((g) => g.nombre));
  const versiones = (m) => new Map(m.librerias.flatMap((l) => l.deps.map((d) => {
    const real = `${d.nombre} en ${l.donde}`;
    return [sinPuerto(real), { real, version: d.version }];
  })));
  const va = versiones(antes);
  const vd = versiones(despues);
  for (const [k, v] of vd) {
    const previa = va.get(k);
    if (!previa) lineas.push(`  + librería ${v.real.replace(' en ', `@${v.version} en `)}`);
    else if (previa.version !== v.version) lineas.push(`  ~ librería ${v.real}: ${previa.version} → ${v.version}`);
  }
  for (const [k, v] of va) if (!vd.has(k)) lineas.push(`  − librería ${v.real}`);
  return lineas;
}

// ── Principal ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const valor = (bandera) => {
  const i = argv.indexOf(bandera);
  return i >= 0 ? argv[i + 1] : null;
};
const normalizar = (t) => t.replace(/\r\n/g, '\n');
const destino = path.join(RAIZ, SALIDA);
const actual = fs.existsSync(destino) ? normalizar(fs.readFileSync(destino, 'utf8')) : '';

if (argv.includes('--comparar')) {
  const i = argv.indexOf('--comparar');
  const [refAntes, refDespues] = [argv[i + 1], argv[i + 2]];
  const lineas = cambios(construirModelo(crearFuente(refAntes)), construirModelo(crearFuente(refDespues)));
  if (lineas.length) console.log(`Mapa del proyecto — lo que cambió en la estructura:\n${lineas.join('\n')}`);
  const nuevo = documento(construirModelo(crearFuente('arbol')));
  if (nuevo !== actual) {
    fs.writeFileSync(destino, nuevo);
    console.log(`${SALIDA} se actualizó: entra en tu próximo commit.`);
  }
  process.exit(0);
}

const modelo = construirModelo(crearFuente(valor('--desde') ?? 'arbol'));

if (argv.includes('--pendientes')) {
  console.log(modelo.pendientes.map((d) => `${d}/`).join('\n') || 'Ninguna carpeta pendiente de describir.');
  process.exit(0);
}

const nuevo = documento(modelo);
if (nuevo === actual) {
  if (!argv.includes('--hook')) console.log(`${SALIDA} ya estaba al día.`);
} else {
  fs.writeFileSync(destino, nuevo);
  console.log(`mapa: ${SALIDA} actualizado${modelo.pendientes.length ? ` (${modelo.pendientes.length} carpetas sin descripción → ${DESCRIPCIONES})` : ''}.`);
}
