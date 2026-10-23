/**
 * Prueba de la cola real de cargas pesadas (BullMQ, `heavy-jobs`) con **dos workers a la vez**,
 * que es lo que pasa con dos réplicas de la API: cada proceso llama a `setupWorker()`.
 *
 * La defensa de la 2.ª parte del 22-10 es `setGlobalConcurrency(1)`: el límite vive en Redis y
 * vale para toda la cola sea cual sea el número de workers. Aquí se comprueba de verdad:
 *
 *   1. Nunca hay más de un trabajo activo a la vez (se mide con `getActiveCount()` cada 10 ms
 *      mientras dura la carga).
 *   2. Las dos cargas acaban, y la tabla `programas_sobresalientes` queda exactamente como una
 *      de ellas (no mezclada): el orden lo pone la cola, y el candado de la importación es la
 *      segunda defensa si alguna vez la cola dejara pasar dos.
 *
 * Los Excel son grandes a propósito (miles de filas) para que cada trabajo dure lo bastante
 * como para que un solapamiento se vea.
 *
 * Además de la guarda de `carreras-comun.ts`, **aborta si el Redis es el 6379**: este script
 * escribe en la cola `heavy-jobs` y la vacía al empezar, y el 6379 es el Redis de desarrollo.
 *
 *   DATABASE_URL=postgres://postgres:prueba@localhost:55432/olo_prueba DB_SSL=false \
 *   REDIS_URL=redis://localhost:6390/0 \
 *   npx ts-node scripts/verificaciones/probar-carreras-cola.ts
 */
import './carreras-comun';

if (!process.env.REDIS_URL || /:6379(\/|$)/.test(process.env.REDIS_URL)) {
  console.error('Aborto: este script necesita un Redis desechable (REDIS_URL definida y distinta del 6379 de desarrollo).');
  process.exit(2);
}

import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import '../../src/infrastructure/db/models';
import { getHeavyJobsQueue, setupWorker, cerrarCola } from '../../src/infrastructure/redis/queue';
import { ObservatorioRepository } from '../../src/repositories/observatorio.repository';
import { getRedis } from '../../src/infrastructure/redis';
import { libro, generar } from './carreras-excel';

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

const huella = async () =>
  (await sequelize.query<{ f: string | null }>(
    `SELECT string_agg(c.codigo || '/' || p.codigo || '/' || s.sexo, ',' ORDER BY c.codigo, p.codigo, s.sexo) AS f
       FROM programas_sobresalientes s
       JOIN centros_formacion c ON c.id = s.centro_id
       JOIN programas_formacion p ON p.id = s.programa_id`,
    { type: QueryTypes.SELECT }
  ))[0].f ?? '';

const main = async () => {
  await sequelize.authenticate();
  const cola = getHeavyJobsQueue();
  await cola.obliterate({ force: true }).catch(() => undefined);
  await sequelize.query('DELETE FROM programas_sobresalientes; DELETE FROM programas_formacion; DELETE FROM centros_formacion; DELETE FROM niveles_formacion;');

  const carpeta = await fs.mkdtemp(path.join(os.tmpdir(), 'olo-cola-'));
  const filasA = generar(1, 5, 300);
  const filasB = generar(2, 5, 300);
  const rutaA = path.join(carpeta, 'a.xlsx');
  const rutaB = path.join(carpeta, 'b.xlsx');
  await fs.writeFile(rutaA, await libro(filasA));
  await fs.writeFile(rutaB, await libro(filasB));
  console.log(`Excel de prueba: ${filasA.length} filas cada uno`);

  // Dos workers: como dos réplicas de la API apuntando a la misma cola.
  const workers = [setupWorker(), setupWorker()];
  await esperar(500);

  const [cargaA, cargaB] = [await ObservatorioRepository.crearCarga(null, null), await ObservatorioRepository.crearCarga(null, null)];
  const idA = cargaA.get('id') as string;
  const idB = cargaB.get('id') as string;

  let maxActivos = 0;
  let muestras = 0;
  let midiendo = true;
  const medidor = (async () => {
    while (midiendo) {
      const activos = await cola.getActiveCount();
      maxActivos = Math.max(maxActivos, activos);
      muestras++;
      await esperar(10);
    }
  })();

  const inicio = Date.now();
  await cola.add('importar-observatorio-excel', { cargaId: idA, rutaAbsoluta: rutaA });
  await cola.add('importar-observatorio-excel', { cargaId: idB, rutaAbsoluta: rutaB });

  const estados = async () =>
    (await sequelize.query<{ id: string; estado: string }>('SELECT id, estado FROM cargas_datos WHERE id IN (:a, :b)', {
      replacements: { a: idA, b: idB },
      type: QueryTypes.SELECT,
    })).map((f) => f.estado);
  while ((await estados()).some((e) => e === 'procesando') && Date.now() - inicio < 120_000) await esperar(100);
  midiendo = false;
  await medidor;

  const final = await estados();
  const f = await huella();
  const deA = generar(1, 5, 300).map((x) => `${x.codCentro}/${x.codPrograma}/${x.sexo}`).sort().join(',');
  const deB = generar(2, 5, 300).map((x) => `${x.codCentro}/${x.codPrograma}/${x.sexo}`).sort().join(',');
  const filas = f ? f.split(',').length : 0;

  console.log(`\nDuración: ${((Date.now() - inicio) / 1000).toFixed(1)} s · ${muestras} mediciones de trabajos activos`);
  console.log(`Estados de las cargas: ${final.join(' + ')}`);
  console.log(`Máximo de trabajos activos a la vez con 2 workers: ${maxActivos}`);
  console.log(`Tabla final: ${filas} filas (${f === deA ? 'exactamente la carga A' : f === deB ? 'exactamente la carga B' : 'NI A NI B'})`);

  const problemas: string[] = [];
  if (maxActivos > 1) problemas.push(`hubo ${maxActivos} trabajos activos a la vez: la concurrencia global no se respeta`);
  if (final.some((e) => e !== 'completado')) problemas.push(`alguna carga no terminó en «completado»: ${final.join(', ')}`);
  if (f !== deA && f !== deB) problemas.push('la tabla no quedó como una sola de las dos cargas');

  for (const w of workers) await w.close();
  await cerrarCola();
  getRedis().disconnect?.();
  await fs.rm(carpeta, { recursive: true, force: true });
  await sequelize.query('DELETE FROM programas_sobresalientes; DELETE FROM programas_formacion; DELETE FROM centros_formacion; DELETE FROM niveles_formacion;');
  await sequelize.close();

  if (problemas.length > 0) {
    problemas.forEach((p) => console.log(`✗ ${p}`));
    process.exit(1);
  }
  console.log('\n✓ la cola respeta la concurrencia 1 con dos workers y la tabla queda coherente');
  process.exit(0);
};

main().catch(async (e) => {
  console.error(e);
  await sequelize.close().catch(() => undefined);
  process.exit(1);
});
