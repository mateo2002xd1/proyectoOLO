import { Queue, Worker, Job } from 'bullmq';
import { getRedis } from './index';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const heavyJobsQueue = new Queue('heavy-jobs', { connection });

export const setupWorker = () => {
  const worker = new Worker('heavy-jobs', async (job: Job) => {
    console.log(`[Worker] Procesando trabajo asíncrono ${job.id}:`, job.name);
    // Simular trabajo pesado
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

  worker.on('error', (err) => {
    console.error(`[Worker Error] (Posible fallo de Redis):`, err.message);
  });

  return worker;
};

heavyJobsQueue.on('error', (err) => {
  console.error(`[Queue Error] (Posible fallo de Redis):`, err.message);
});
