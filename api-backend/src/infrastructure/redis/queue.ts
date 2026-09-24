import { Queue, Worker, Job } from 'bullmq';
import { crearLoggerDeErrorConThrottle, getRedis } from './index';
import { procesarCargaObservatorio } from '../../use-cases/observatorio/procesar-carga.usecase';
import { procesarCargaTendencia } from '../../use-cases/observatorio/tendencia-ocupacional/procesar-carga-tendencia.usecase';

// Misma conexión que `getRedis()` — ya se abre con `maxRetriesPerRequest: null`
// porque BullMQ lo exige (ver el comentario en `./index`). Antes esto armaba su
// propia conexión a partir de `REDIS_HOST`/`REDIS_PORT`, variables que nada en
// el proyecto define (todo lo demás usa `REDIS_URL`), así que siempre caía en
// el valor por defecto `127.0.0.1:6379` y nunca llegaba al Redis real.
const connection = getRedis();

export const heavyJobsQueue = new Queue('heavy-jobs', { connection });

export const setupWorker = () => {
  const worker = new Worker('heavy-jobs', async (job: Job) => {
    console.log(`[Worker] Procesando trabajo asíncrono ${job.id}:`, job.name);

    // Observatorio ("Programa + Sobresalientes"): parsear el Excel y hacer el
    // vaciado+recarga transaccional no debe bloquear la respuesta HTTP de la
    // subida — por eso corre aquí y no en el controller.
    // `procesarCargaObservatorio` deja su propio resultado (completado/error)
    // escrito en `cargas_datos`; el worker no necesita más.
    if (job.name === 'importar-observatorio-excel') {
      const { cargaId, rutaAbsoluta } = job.data as { cargaId: string; rutaAbsoluta: string };
      await procesarCargaObservatorio(cargaId, rutaAbsoluta);
      return { success: true, processedAt: new Date().toISOString() };
    }

    // Tendencia ocupacional (percentiles): un Excel por celda año × periodo. Igual que
    // el anterior, deja su resultado en `cargas_datos`. El worker procesa de a un
    // trabajo, así que una carga masiva queda en fila sin pisarse.
    if (job.name === 'importar-tendencia-ocupacional') {
      const { cargaId, rutaAbsoluta } = job.data as { cargaId: string; rutaAbsoluta: string };
      await procesarCargaTendencia(cargaId, rutaAbsoluta);
      return { success: true, processedAt: new Date().toISOString() };
    }

    // Simular trabajo pesado (proof-of-concept original de la cola).
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log(`[Worker] Trabajo asíncrono ${job.id} completado.`);
    return { success: true, processedAt: new Date().toISOString() };
  }, { connection });

  worker.on('completed', (job) => {
    console.log(`El trabajo ${job.id} ha finalizado con éxito.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`El trabajo ${job?.id} ha fallado:`, err);
  });

  worker.on('error', crearLoggerDeErrorConThrottle('Worker Error'));

  return worker;
};

heavyJobsQueue.on('error', crearLoggerDeErrorConThrottle('Queue Error'));
