/**
 * Piezas comunes de los scripts `probar-carreras-*.ts`.
 *
 * **Se importa primero** en cada script: al cargarse comprueba que la base y el Redis sean
 * locales y aborta si no lo son, antes de que nadie haga una sola consulta. Así ninguna
 * prueba de carrera puede escribir en Neon por un `DATABASE_URL` mal puesto. También vacía
 * `REVALIDAR_SECRET` para que publicar una página no llame al front, y manda el disco
 * (`FILESYSTEM_DIR`) a una carpeta temporal.
 *
 * Una carrera «se prueba» lanzando las operaciones a la vez (`Promise.all`) con el pool
 * caliente, repitiendo la ronda muchas veces con datos nuevos, y mirando dos cosas: que la
 * base quede coherente y que ninguna operación falle con un error **sin `status` 4xx** (el
 * manejador de errores lo convierte en un 500 genérico).
 */
import 'dotenv/config';
import os from 'os';
import path from 'path';

const esLocal = (url: string) =>
  /@(localhost|127\.0\.0\.1)(:|\/)/.test(url) || /^redis:\/\/(localhost|127\.0\.0\.1)/.test(url);

if (!esLocal(process.env.DATABASE_URL ?? '')) {
  console.error('Aborto: DATABASE_URL tiene que apuntar a localhost (base desechable).');
  process.exit(2);
}
if (process.env.REDIS_URL && !esLocal(process.env.REDIS_URL)) {
  console.error('Aborto: REDIS_URL tiene que apuntar a localhost.');
  process.exit(2);
}
process.env.REVALIDAR_SECRET = '';
// El disco de las pruebas (respaldos de páginas, Excel de las cargas, logo e icono) va a una carpeta
// temporal: sin esto cada publicación creaba una carpeta vacía en el `filesystem/` del proyecto.
// `raizDelFilesystem()` la lee en cada llamada, así que basta fijarla aquí.
process.env.FILESYSTEM_DIR = path.join(os.tmpdir(), 'olo-carreras-filesystem');

import type { Transaction } from 'sequelize';
import sequelize from '../../src/config/database';

/** Rondas por escenario: el primer argumento de la línea de comandos, o 30. */
export const RONDAS = Number(process.argv[2]) || 30;

export type Accion = { nombre: string; correr: () => Promise<unknown> };
export type Resultado =
  | { nombre: string; ok: true }
  | { nombre: string; ok: false; status: number | null; error: string };

/** Una transacción como la que abren los controladores. */
export const enTx = <T>(fn: (tx: Transaction) => Promise<T>) => sequelize.transaction(fn);

/** Corre una acción y devuelve cómo acabó, sin lanzar nunca. */
export const intentar = async (a: Accion): Promise<Resultado> => {
  try {
    await a.correr();
    return { nombre: a.nombre, ok: true };
  } catch (e: any) {
    const status = Number.isInteger(e?.status) && e.status >= 400 && e.status <= 499 ? e.status : null;
    return {
      nombre: a.nombre,
      ok: false,
      status,
      error: `${e?.name ?? 'Error'}: ${String(e?.message ?? e).split('\n')[0].slice(0, 90)}`,
    };
  }
};

/** Etiqueta corta de un resultado: `ok`, `409` o `500!` (sin status 4xx). */
export const etiqueta = (r: Resultado) => (r.ok ? 'ok' : r.status ? String(r.status) : '500!');

/** La salida de un grupo de acciones, ordenada por nombre para poder contar firmas iguales. */
export const firma = (rs: Resultado[]) =>
  [...rs]
    .sort((x, y) => x.nombre.localeCompare(y.nombre))
    .map((r) => `${r.nombre}:${etiqueta(r)}`)
    .join(' ');

export const sumar = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);

/** Abre las 5 conexiones del pool para que ninguna operación llegue tarde por tener que conectar. */
export const calentarPool = async () => {
  await Promise.all(Array.from({ length: 5 }, () => sequelize.query('SELECT pg_sleep(0.05)')));
};

/**
 * Repite `ronda` y resume lo que pasó. Cada ronda monta sus datos, lanza las operaciones a la
 * vez y devuelve los resultados, las incoherencias que detectó y una frase del estado final.
 * Devuelve `true` si no hubo incoherencias ni fallos sin `status`.
 */
export const correrRondas = async (
  titulo: string,
  ronda: () => Promise<{ rs: Resultado[]; problemas: string[]; final: string }>,
  rondas = RONDAS
): Promise<boolean> => {
  const firmas = new Map<string, number>();
  const problemas = new Map<string, number>();
  const finales = new Map<string, number>();
  const sinStatus = new Map<string, number>();
  for (let i = 0; i < rondas; i++) {
    await calentarPool();
    const { rs, problemas: ps, final } = await ronda();
    sumar(firmas, firma(rs));
    for (const r of rs) if (!r.ok && !r.status) sumar(sinStatus, `${r.nombre} → ${r.error}`);
    for (const p of ps) sumar(problemas, p);
    sumar(finales, final);
  }
  const mal = problemas.size > 0 || sinStatus.size > 0;
  console.log(`\n${mal ? '✗' : '✓'} ${titulo}`);
  for (const [f, n] of [...firmas.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(n).padStart(3)}× ${f}`);
  }
  console.log(`   estados finales: ${[...finales.entries()].map(([k, n]) => `${n}× ${k}`).join(' ; ')}`);
  for (const [v, n] of problemas) console.log(`   INCOHERENCIA (${n}×): ${v}`);
  for (const [v, n] of sinStatus) console.log(`   FALLO SIN STATUS (${n}×): ${v}`);
  return !mal;
};
