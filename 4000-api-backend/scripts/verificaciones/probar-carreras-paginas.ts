/**
 * Prueba de condiciones de carrera en el ciclo editorial de las páginas.
 *
 * Lanza **a la vez** pares (o grupos) de operaciones reales —los casos de uso, dentro de
 * `sequelize.transaction` igual que los controladores— sobre la misma página, y mira dos
 * cosas al terminar cada ronda:
 *
 *   1. Que el estado de la base siga siendo coherente (invariantes de abajo).
 *   2. Que ninguna operación falle con un error **sin `status` 4xx**: eso el manejador de
 *      errores lo convierte en un 500 genérico, y una carrera que acaba en 500 es una
 *      carrera mal resuelta aunque la base haya quedado bien.
 *
 * Cada escenario repite la ronda `RONDAS` veces con páginas nuevas, y antes corre las mismas
 * operaciones **en fila** (en los dos órdenes) como control: lo que sale en concurrencia y
 * no sale nunca en fila es lo que de verdad introduce la carrera. Un error que también sale
 * en fila (p. ej. un `Error` sin `status` por «no hay versión en revisión») no es de
 * concurrencia y se marca aparte.
 *
 * **Solo contra una base desechable**: aborta si `DATABASE_URL` no apunta a `localhost` /
 * `127.0.0.1`, para que no pueda escribir en Neon. Tampoco llama al front (`REVALIDAR_SECRET`
 * vacío) ni usa un Redis que no sea local.
 *
 *   DATABASE_URL=postgres://postgres:prueba@localhost:55432/olo_prueba DB_SSL=false \
 *   REDIS_URL=redis://localhost:6390/0 REVALIDAR_SECRET= \
 *   npx ts-node scripts/verificaciones/probar-carreras-paginas.ts [rondas]
 *
 * Sale con código 1 si algún escenario deja la base incoherente o produce un fallo sin
 * `status` que no ocurra también en fila.
 */
import {
  RONDAS,
  enTx,
  intentar,
  firma,
  sumar,
  calentarPool,
  correrRondas,
  type Accion,
  type Resultado,
} from './carreras-comun';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import { guardarBorrador } from '../../src/use-cases/paginas/guardar-borrador.usecase';
import { enviarARevision } from '../../src/use-cases/paginas/enviar-a-revision.usecase';
import { aprobarPagina } from '../../src/use-cases/paginas/aprobar-pagina.usecase';
import { rechazarPagina } from '../../src/use-cases/paginas/rechazar-pagina.usecase';
import { eliminarVersion } from '../../src/use-cases/paginas/eliminar-version.usecase';
import { crearSeccion } from '../../src/use-cases/paginas/crear-seccion.usecase';
import { cambiarDireccion } from '../../src/use-cases/paginas/cambiar-direccion.usecase';
import { adquirirBloqueo } from '../../src/use-cases/paginas/adquirir-bloqueo.usecase';
import { PaginaRepository } from '../../src/repositories/pagina.repository';
import { restaurarVersionAnterior } from '../../src/use-cases/paginas/restaurar-version-anterior.usecase';
import { depurarVersiones } from '../../src/use-cases/paginas/depurar-versiones.usecase';
import type { Ambito } from '../../src/shared/ambito';

const AMBITO: Ambito = 'sitio';
const contenidoCon = (titulo: string) => ({ content: [], root: { props: { title: titulo } } });
const CONTENIDO = contenidoCon('REVISADO');
const CONTENIDO_NUEVO = contenidoCon('NUEVO');
const COMENTARIO = 'Cambio de prueba de carrera';
const ADMIN = { rol: 'administrador', usuarioId: 'admin' };

/** `con_historial`: v1 y v2 archivadas, v3 publicada (hay a qué volver). */
type Estado = 'nueva' | 'borrador' | 'en_revision' | 'publicado' | 'con_historial';
/* ---------- Preparación y comprobación de una página ---------- */

const nuevoSlug = (() => {
  let n = 0;
  const pref = `c${Date.now().toString(36)}`;
  return (etiqueta: string) => `${pref}-${etiqueta}-${++n}`;
})();

const preparar = async (slug: string, estado: Estado) => {
  if (estado === 'nueva') return;
  await enTx((tx) => guardarBorrador(slug, CONTENIDO, 'setup', AMBITO, tx));
  if (estado === 'borrador') return;
  await enTx((tx) => enviarARevision(slug, 'setup', AMBITO, COMENTARIO, tx));
  if (estado === 'en_revision') return;
  await enTx((tx) => aprobarPagina(slug, 'setup', AMBITO, tx));
  if (estado === 'publicado') return;
  for (let i = 0; i < 2; i++) {
    await enTx((tx) => guardarBorrador(slug, CONTENIDO, 'setup', AMBITO, tx));
    await enTx((tx) => enviarARevision(slug, 'setup', AMBITO, COMENTARIO, tx));
    await enTx((tx) => aprobarPagina(slug, 'setup', AMBITO, tx));
  }
};

interface FilaVersion { id: string; numero_version: number; estado: string }

const leerPagina = async (slug: string) => {
  const [pagina] = await sequelize.query<{ id: string; version_publicada_id: string | null }>(
    'SELECT id, version_publicada_id FROM paginas WHERE slug = :slug AND ambito = :ambito',
    { replacements: { slug, ambito: AMBITO }, type: QueryTypes.SELECT }
  );
  if (!pagina) return { pagina: null, versiones: [] as FilaVersion[] };
  const versiones = await sequelize.query<FilaVersion>(
    'SELECT id, numero_version, estado FROM paginas_versiones WHERE pagina_id = :id ORDER BY numero_version',
    { replacements: { id: pagina.id }, type: QueryTypes.SELECT }
  );
  return { pagina, versiones };
};

/** Lo que tiene que cumplirse siempre, pase lo que pase en concurrencia. Devuelve las violaciones. */
const violaciones = async (slug: string): Promise<string[]> => {
  const { pagina, versiones } = await leerPagina(slug);
  if (!pagina) return [];
  const mal: string[] = [];
  const publicadas = versiones.filter((v) => v.estado === 'publicado');
  const apuntada = versiones.find((v) => v.id === pagina.version_publicada_id);
  if (pagina.version_publicada_id && !apuntada) mal.push('version_publicada_id apunta a una versión inexistente');
  if (apuntada && apuntada.estado !== 'publicado') {
    mal.push(`la página publica la v${apuntada.numero_version}, pero esa versión está «${apuntada.estado}»`);
  }
  if (publicadas.length > 0 && pagina.version_publicada_id !== publicadas[0].id) {
    mal.push(`hay una versión «publicado» (v${publicadas[0].numero_version}) que la página no apunta`);
  }
  if (publicadas.length === 0 && pagina.version_publicada_id && apuntada) {
    mal.push('la página apunta a una versión que ya no está publicada');
  }
  return mal;
};

const resumenFinal = async (slug: string) => {
  const { pagina, versiones } = await leerPagina(slug);
  if (!pagina) return '(sin página)';
  return versiones.map((v) => `v${v.numero_version}=${v.estado}`).join(',') + (pagina.version_publicada_id ? '' : ' [sin publicada]');
};

/* ---------- Escenarios ---------- */

interface Escenario {
  titulo: string;
  estado: Estado;
  /** Pasos extra después de llegar a `estado` (p. ej. dejar otra versión en revisión). */
  despues?: (slug: string) => Promise<void>;
  /** Las operaciones que compiten. Reciben el slug y devuelven acciones frescas cada vez. */
  acciones: (slug: string) => Promise<Accion[]> | Accion[];
  /** A lo sumo UNA de las operaciones puede informar éxito (transiciones que se excluyen). */
  exclusiva?: boolean;
  /** Comprobación propia del escenario además de las invariantes generales. */
  extra?: (slug: string, rs: Resultado[]) => Promise<string[]>;
}

const guardar = (slug: string, usuario: string, automatico = false): Accion => ({
  nombre: `guardar(${usuario})${automatico ? '·auto' : ''}`,
  correr: () => enTx((tx) => guardarBorrador(slug, CONTENIDO_NUEVO, usuario, AMBITO, tx, { automatico })),
});
const enviar = (slug: string, usuario: string): Accion => ({
  nombre: `enviar(${usuario})`,
  correr: () => enTx((tx) => enviarARevision(slug, usuario, AMBITO, COMENTARIO, tx)),
});
const aprobar = (slug: string, usuario: string): Accion => ({
  nombre: `aprobar(${usuario})`,
  correr: () => enTx((tx) => aprobarPagina(slug, usuario, AMBITO, tx)),
});
const rechazar = (slug: string, usuario: string): Accion => ({
  nombre: `rechazar(${usuario})`,
  correr: () => enTx((tx) => rechazarPagina(slug, usuario, 'No cumple lo pedido', AMBITO, tx)),
});
const descartarUltima = (slug: string, estados: string[]): Accion => ({
  nombre: 'descartar',
  correr: async () => {
    const { versiones } = await leerPagina(slug);
    const v = [...versiones].reverse().find((x) => estados.includes(x.estado));
    if (!v) throw Object.assign(new Error('nada que descartar'), { status: 404 });
    await enTx((tx) => eliminarVersion(slug, v.id, AMBITO, tx));
  },
});

/** Qué título de contenido tiene cada versión de la página, para saber si el guardado del editor sobrevivió. */
const titulosDe = async (slug: string) =>
  sequelize.query<{ estado: string; titulo: string | null }>(
    `SELECT v.estado, v.contenido->'root'->'props'->>'title' AS titulo
       FROM paginas_versiones v JOIN paginas p ON p.id = v.pagina_id
      WHERE p.slug = :slug AND p.ambito = :ambito`,
    { replacements: { slug, ambito: AMBITO }, type: QueryTypes.SELECT }
  );

/** aprobar × guardar: ni se publica lo que nadie revisó, ni se pierde en silencio lo que el editor guardó. */
const extraAprobarGuardar = async (slug: string, rs: Resultado[]): Promise<string[]> => {
  const filas = await titulosDe(slug);
  const mal: string[] = [];
  if (filas.some((f) => f.estado === 'publicado' && f.titulo === 'NUEVO')) {
    mal.push('se PUBLICÓ contenido que nadie revisó (el guardado del editor entró en la versión aprobada)');
  }
  const guardo = rs.find((r) => r.nombre.startsWith('guardar'))?.ok;
  if (guardo && !filas.some((f) => f.titulo === 'NUEVO')) {
    mal.push('el editor recibió «guardado» pero su contenido no está en ninguna versión (se perdió sin avisar)');
  }
  return mal;
};

/** Vuelve a publicar la v1 (archivada). */
const restaurar = (slug: string, usuario: string): Accion => ({
  nombre: `restaurar(${usuario})`,
  correr: () => restaurarVersionAnterior(slug, usuario, AMBITO, { numeroVersion: 1 }),
});
/** Depura las versiones archivadas de esa página (conserva siempre la última archivada). */
const depurar = (slug: string): Accion => ({
  nombre: 'depurar',
  correr: async () => {
    const { pagina } = await leerPagina(slug);
    await depurarVersiones({ ambito: AMBITO, paginaId: pagina!.id });
  },
});

/** restaurar × depurar: si restaurar dice «ok», la v1 existe y es la publicada; si no, el 404 es controlado. */
const extraRestaurar = async (slug: string, rs: Resultado[]): Promise<string[]> => {
  const { pagina, versiones } = await leerPagina(slug);
  const restauro = rs.find((r) => r.nombre.startsWith('restaurar'))?.ok;
  const v1 = versiones.find((v) => v.numero_version === 1);
  const mal: string[] = [];
  if (restauro && (!v1 || v1.estado !== 'publicado' || pagina?.version_publicada_id !== v1.id)) {
    mal.push('restaurar respondió «ok» pero la v1 no quedó publicada');
  }
  return mal;
};

const ESCENARIOS: Escenario[] = [
  { titulo: 'guardar ×2 sobre una página que no existe', estado: 'nueva', acciones: (s) => [guardar(s, 'A'), guardar(s, 'B')] },
  { titulo: 'guardar ×2 con la última versión publicada (abre la v2)', estado: 'publicado', acciones: (s) => [guardar(s, 'A'), guardar(s, 'B')] },
  { titulo: 'guardar ×2 sobre un borrador', estado: 'borrador', acciones: (s) => [guardar(s, 'A'), guardar(s, 'B')] },
  {
    titulo: 'crear sección ×2 con el mismo nombre',
    estado: 'nueva',
    acciones: (s) => [
      { nombre: 'crear(A)', correr: () => crearSeccion(s, AMBITO, 'A', 'administrador') },
      { nombre: 'crear(B)', correr: () => crearSeccion(s, AMBITO, 'B', 'administrador') },
    ],
  },
  { titulo: 'enviar a revisión ×2', estado: 'borrador', acciones: (s) => [enviar(s, 'A'), enviar(s, 'B')] },
  { titulo: 'enviar a revisión × guardar', estado: 'borrador', acciones: (s) => [enviar(s, 'A'), guardar(s, 'B')] },
  { exclusiva: true, titulo: 'aprobar ×2 (dos aprobadores)', estado: 'en_revision', acciones: (s) => [aprobar(s, 'A'), aprobar(s, 'B')] },
  {
    exclusiva: true, titulo: 'aprobar ×2 sobre una página que ya tenía publicada',
    estado: 'publicado',
    despues: async (s) => {
      await enTx((tx) => guardarBorrador(s, CONTENIDO, 'setup', AMBITO, tx));
      await enTx((tx) => enviarARevision(s, 'setup', AMBITO, COMENTARIO, tx));
    },
    acciones: (s) => [aprobar(s, 'A'), aprobar(s, 'B')],
  },
  { exclusiva: true, titulo: 'aprobar × rechazar', estado: 'en_revision', acciones: (s) => [aprobar(s, 'A'), rechazar(s, 'B')] },
  { exclusiva: true, titulo: 'rechazar ×2', estado: 'en_revision', acciones: (s) => [rechazar(s, 'A'), rechazar(s, 'B')] },
  { titulo: 'aprobar × guardar manual del editor', estado: 'en_revision', extra: extraAprobarGuardar, acciones: (s) => [aprobar(s, 'A'), guardar(s, 'B')] },
  { titulo: 'aprobar × autoguardado', estado: 'en_revision', extra: extraAprobarGuardar, acciones: (s) => [aprobar(s, 'A'), guardar(s, 'B', true)] },
  { exclusiva: true, titulo: 'aprobar × descartar la versión en revisión', estado: 'en_revision', acciones: (s) => [aprobar(s, 'A'), descartarUltima(s, ['en_revision'])] },
  { titulo: 'descartar borrador × guardar', estado: 'borrador', acciones: (s) => [descartarUltima(s, ['borrador']), guardar(s, 'B')] },
  { exclusiva: true, titulo: 'restaurar la v1 ×2 a la vez', estado: 'con_historial', acciones: (s) => [restaurar(s, 'A'), restaurar(s, 'B')] },
  { titulo: 'restaurar la v1 × depurar versiones', estado: 'con_historial', acciones: (s) => [restaurar(s, 'A'), depurar(s)], extra: extraRestaurar },
  {
    titulo: 'restaurar la v1 × aprobar una versión nueva',
    estado: 'con_historial',
    despues: async (s) => {
      await enTx((tx) => guardarBorrador(s, CONTENIDO, 'setup', AMBITO, tx));
      await enTx((tx) => enviarARevision(s, 'setup', AMBITO, COMENTARIO, tx));
    },
    acciones: (s) => [restaurar(s, 'A'), aprobar(s, 'B')],
  },
  { titulo: 'restaurar la v1 × guardar del editor', estado: 'con_historial', acciones: (s) => [restaurar(s, 'A'), guardar(s, 'B')] },
  { titulo: 'depurar ×2 a la vez', estado: 'con_historial', acciones: (s) => [depurar(s), depurar(s)] },
  { exclusiva: true, titulo: 'descartar ×2 el mismo borrador', estado: 'borrador', acciones: (s) => [descartarUltima(s, ['borrador']), descartarUltima(s, ['borrador'])] },
];

/** Cambio de dirección: necesita su propio montaje (dos páginas, o una página y un nombre ocupado). */
const cambiar = (slug: string, destino: string): Accion => ({
  nombre: `renombrar(${slug.slice(-6)}→${destino.slice(-6)})`,
  correr: () => enTx((tx) => cambiarDireccion(slug, AMBITO, destino, true, ADMIN, tx)),
});

/* ---------- Ejecución ---------- */

interface Informe {
  titulo: string;
  firmas: Map<string, number>;
  control: Set<string>;
  nuevasFirmas: string[];
  incoherencias: Map<string, number>;
  sinStatus: Map<string, number>;
  finales: Map<string, number>;
}

/** Corre las mismas acciones en fila (los dos órdenes) y devuelve las firmas que salen sin concurrencia. */
const correrControl = async (esc: Escenario): Promise<Set<string>> => {
  const firmas = new Set<string>();
  for (const invertir of [false, true]) {
    const slug = nuevoSlug('ctl');
    await preparar(slug, esc.estado);
    await esc.despues?.(slug);
    let acciones = await esc.acciones(slug);
    if (invertir) acciones = [...acciones].reverse();
    const rs: Resultado[] = [];
    for (const a of acciones) rs.push(await intentar(a));
    firmas.add(firma(rs));
  }
  return firmas;
};

const correrEscenario = async (esc: Escenario): Promise<Informe> => {
  const informe: Informe = {
    titulo: esc.titulo,
    firmas: new Map(),
    control: await correrControl(esc),
    nuevasFirmas: [],
    incoherencias: new Map(),
    sinStatus: new Map(),
    finales: new Map(),
  };
  for (let i = 0; i < RONDAS; i++) {
    const slug = nuevoSlug('r');
    await preparar(slug, esc.estado);
    await esc.despues?.(slug);
    const acciones = await esc.acciones(slug);
    await calentarPool();
    const rs = await Promise.all(acciones.map(intentar));
    const f = firma(rs);
    sumar(informe.firmas, f);
    if (!informe.control.has(f)) {
      for (const r of rs) if (!r.ok && !r.status) sumar(informe.sinStatus, `${r.nombre} → ${r.error}`);
    }
    if (esc.exclusiva && rs.filter((r) => r.ok).length > 1) {
      sumar(informe.incoherencias, 'más de una operación exclusiva informó éxito: una se perdió sin avisar');
    }
    for (const v of [...(await violaciones(slug)), ...((await esc.extra?.(slug, rs)) ?? [])]) sumar(informe.incoherencias, v);
    sumar(informe.finales, await resumenFinal(slug));
  }
  informe.nuevasFirmas = [...informe.firmas.keys()].filter((f) => !informe.control.has(f));
  return informe;
};

const imprimir = (inf: Informe): boolean => {
  const mal = inf.incoherencias.size > 0 || inf.sinStatus.size > 0;
  console.log(`\n${mal ? '✗' : '✓'} ${inf.titulo}`);
  console.log(`   en fila:  ${[...inf.control].join('  |  ')}`);
  for (const [f, n] of [...inf.firmas.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(n).padStart(3)}× ${f}${inf.control.has(f) ? '' : '   ← no sale en fila'}`);
  }
  if (inf.finales.size > 0) {
    console.log(`   estados finales: ${[...inf.finales.entries()].map(([k, n]) => `${n}× ${k}`).join(' ; ')}`);
  }
  for (const [v, n] of inf.incoherencias) console.log(`   INCOHERENCIA (${n}×): ${v}`);
  for (const [v, n] of inf.sinStatus) console.log(`   FALLO SIN STATUS (${n}×): ${v}`);
  return !mal;
};

/* ---------- Escenarios de cambio de dirección y de candado (montaje propio) ---------- */

const existe = async (slug: string) => (await leerPagina(slug)).pagina !== null;

const escenariosDeDireccion = async (): Promise<boolean[]> => {
  const res: boolean[] = [];

  res.push(await correrRondas('cambiar dirección: la misma página hacia dos destinos distintos', async () => {
    const origen = nuevoSlug('o'); const d1 = nuevoSlug('d1'); const d2 = nuevoSlug('d2');
    await preparar(origen, 'publicado');
    const rs = await Promise.all([cambiar(origen, d1), cambiar(origen, d2)].map(intentar));
    const hay = [await existe(origen), await existe(d1), await existe(d2)];
    const problemas: string[] = [];
    if (hay.filter(Boolean).length !== 1) problemas.push(`debía quedar UNA página y quedaron ${hay.filter(Boolean).length} (origen/d1/d2 = ${hay.join('/')})`);
    return { rs, problemas, final: `origen=${hay[0]} d1=${hay[1]} d2=${hay[2]}` };
  }));

  res.push(await correrRondas('cambiar dirección: dos páginas distintas hacia el MISMO destino', async () => {
    const a = nuevoSlug('a'); const b = nuevoSlug('b'); const d = nuevoSlug('d');
    await preparar(a, 'publicado'); await preparar(b, 'publicado');
    const rs = await Promise.all([cambiar(a, d), cambiar(b, d)].map(intentar));
    const hayD = await existe(d);
    const problemas: string[] = [];
    if (rs.filter((r) => r.ok).length !== 1) problemas.push(`debía ganar UNA y ganaron ${rs.filter((r) => r.ok).length}`);
    if (!hayD) problemas.push('el destino no existe tras el cambio');
    return { rs, problemas, final: `a=${await existe(a)} b=${await existe(b)} d=${hayD}` };
  }));

  res.push(await correrRondas('cambiar dirección × crear sección con el nombre de destino', async () => {
    const origen = nuevoSlug('o'); const d = nuevoSlug('d');
    await preparar(origen, 'publicado');
    const rs = await Promise.all([
      cambiar(origen, d),
      { nombre: 'crear', correr: () => crearSeccion(d, AMBITO, 'B', 'administrador') },
    ].map(intentar));
    const problemas: string[] = [];
    const [{ n }] = await sequelize.query<{ n: string }>(
      'SELECT count(*) AS n FROM paginas WHERE ambito = :a AND slug = :s', { replacements: { a: AMBITO, s: d }, type: QueryTypes.SELECT }
    );
    if (Number(n) !== 1) problemas.push(`el destino debía existir una vez y existe ${n}`);
    return { rs, problemas, final: `origen=${await existe(origen)} destino×${n}` };
  }));

  res.push(await correrRondas('cambiar dirección × guardar borrador de esa página', async () => {
    const origen = nuevoSlug('o'); const d = nuevoSlug('d');
    await preparar(origen, 'publicado');
    const rs = await Promise.all([cambiar(origen, d), guardar(origen, 'B')].map(intentar));
    const problemas: string[] = [];
    const enOrigen = await leerPagina(origen); const enDestino = await leerPagina(d);
    // Dos órdenes en fila son válidos: guardar y luego renombrar (todo se va a destino), o renombrar y luego
    // guardar (el guardado crea una página nueva en la dirección vieja, como siempre que se guarda un slug
    // que no existe). Lo que no puede pasar es que lo publicado se parta o se quede en el origen.
    const estados = (v: { estado: string }[]) => v.map((x) => x.estado).join(',');
    const guardoAntes = !enOrigen.pagina && estados(enDestino.versiones) === 'publicado,borrador';
    const guardoDespues = !!enOrigen.pagina && estados(enOrigen.versiones) === 'borrador' && estados(enDestino.versiones) === 'publicado';
    if (!guardoAntes && !guardoDespues) problemas.push('el resultado no corresponde a ninguno de los dos órdenes en fila');
    for (const slug of [origen, d]) problemas.push(...(await violaciones(slug)));
    return { rs, problemas, final: `origen=${!!enOrigen.pagina}[${enOrigen.versiones.map((v) => v.estado).join(',')}] destino=${!!enDestino.pagina}[${enDestino.versiones.map((v) => v.estado).join(',')}]` };
  }));

  return res;
};

const escenariosDeCandado = async (): Promise<boolean[]> => {
  const res: boolean[] = [];
  const pedir = (slug: string, usuario: string, rol: string | null = 'editor', forzar = false): Accion => ({
    nombre: `bloqueo(${usuario}${forzar ? '·forzar' : ''})`,
    correr: async () => {
      const r = await adquirirBloqueo({ slug, ambito: AMBITO, usuarioId: usuario, usuarioNombre: usuario, rol, forzar });
      if (!r.propio) throw Object.assign(new Error('lo tiene otra persona'), { status: 409 });
    },
  });
  const dueño = async (slug: string) => (await PaginaRepository.findBySlug(slug, AMBITO), (await sequelize.query<{ usuario_id: string }>(
    'SELECT usuario_id FROM bloqueos_edicion WHERE ambito = :a AND slug = :s', { replacements: { a: AMBITO, s: slug }, type: QueryTypes.SELECT }))[0]?.usuario_id ?? '—');

  res.push(await correrRondas('candado de edición: 5 personas piden la misma página libre', async () => {
    const slug = nuevoSlug('l');
    const rs = await Promise.all(['A', 'B', 'C', 'D', 'E'].map((u) => pedir(slug, u)).map(intentar));
    const ganadores = rs.filter((r) => r.ok).length;
    return { rs, problemas: ganadores === 1 ? [] : [`debía haber UN dueño y hubo ${ganadores}`], final: `dueño=${await dueño(slug)}` };
  }));

  res.push(await correrRondas('candado de edición: 5 personas piden un candado CADUCADO', async () => {
    const slug = nuevoSlug('l');
    await sequelize.query(
      `INSERT INTO bloqueos_edicion (ambito, slug, usuario_id, usuario_nombre, adquirido_en, expira_en)
       VALUES (:a, :s, 'viejo', 'viejo', now() - interval '10 minutes', now() - interval '5 minutes')`,
      { replacements: { a: AMBITO, s: slug } }
    );
    const rs = await Promise.all(['A', 'B', 'C', 'D', 'E'].map((u) => pedir(slug, u)).map(intentar));
    const ganadores = rs.filter((r) => r.ok).length;
    return { rs, problemas: ganadores === 1 ? [] : [`debía haber UN dueño y hubo ${ganadores}`], final: `dueño=${await dueño(slug)}` };
  }));

  res.push(await correrRondas('candado de edición: el dueño renueva a la vez que un administrador fuerza', async () => {
    const slug = nuevoSlug('l');
    await pedir(slug, 'dueño').correr();
    const rs = await Promise.all([pedir(slug, 'dueño'), pedir(slug, 'jefe', 'administrador', true)].map(intentar));
    const quien = await dueño(slug);
    const problemas = rs.every((r) => r.ok) && quien === 'dueño' ? ['las dos creen ser dueñas (la forzada quedó pisada)'] : [];
    return { rs, problemas, final: `dueño=${quien}` };
  }));

  res.push(await correrRondas('candado de edición: dos administradores fuerzan a la vez', async () => {
    const slug = nuevoSlug('l');
    await pedir(slug, 'dueño').correr();
    const rs = await Promise.all([pedir(slug, 'jefe1', 'administrador', true), pedir(slug, 'jefe2', 'administrador', true)].map(intentar));
    const quien = await dueño(slug);
    const ganan = rs.filter((r) => r.ok).map((r) => r.nombre);
    // Aquí las dos pueden ganar legítimamente (la segunda toma el control de la primera); lo que no puede
    // pasar es que quien figura como dueño no sea una de las dos.
    return { rs, problemas: ['jefe1', 'jefe2'].includes(quien) ? [] : [`el dueño final (${quien}) no es ninguno de los dos que forzaron`], final: `dueño=${quien} ganaron=${ganan.join(',')}` };
  }));

  return res;
};

const main = async () => {
  await sequelize.authenticate();
  console.log(`Rondas por escenario: ${RONDAS}  ·  base: ${(process.env.DATABASE_URL ?? '').replace(/:[^:@/]+@/, ':***@')}`);

  const resultados: boolean[] = [];
  for (const esc of ESCENARIOS) {
    resultados.push(imprimir(await correrEscenario(esc)));
  }
  resultados.push(...(await escenariosDeDireccion()));
  resultados.push(...(await escenariosDeCandado()));

  const fallidos = resultados.filter((r) => !r).length;
  console.log(`\n${fallidos === 0 ? 'TODO EN ORDEN' : `${fallidos} ESCENARIO(S) CON PROBLEMAS`} (${resultados.length} escenarios)`);
  await sequelize.close();
  process.exit(fallidos === 0 ? 0 : 1);
};

main().catch(async (e) => {
  console.error(e);
  await sequelize.close().catch(() => undefined);
  process.exit(1);
});
