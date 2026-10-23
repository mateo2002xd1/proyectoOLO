import { app } from './app';
import { config } from './config';
import sequelize from './config/database';

// Import models to register associations
import './infrastructure/db/models';
import { listarPendientes } from './infrastructure/db/migrations';
import { cerrarCola, setupWorker } from './infrastructure/redis/queue';
import { cerrarClienteDeLimites } from './middlewares/rate-limit.middleware';
import { describirErrorParaLog } from './shared/errores';

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION — crashing:', describirErrorParaLog(reason));
  process.exit(1);
});

/**
 * Arranca la API: conecta a la base, exige que no haya migraciones pendientes, levanta el worker
 * de la cola y empieza a escuchar; cierra ordenadamente con SIGTERM o SIGINT.
 */
const start = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected.');

    // El esquema lo definen las migraciones, nunca el arranque (convención #4 de
    // 1-guia-del-proyecto.md). Aquí solo se verifica que la base esté al día: un
    // servidor que arranca contra un esquema viejo falla de formas difíciles de leer.
    const pendientes = await listarPendientes();
    if (pendientes.length > 0) {
      throw new Error(
        `Hay ${pendientes.length} migración(es) sin aplicar: ${pendientes.join(', ')}. ` +
          'Ejecutar `npm run migrate` antes de arrancar.'
      );
    }
    console.log('Database schema up to date.');

    setupWorker();
    console.log('Background worker started.');

    // La interfaz sale de la configuración y ya no está fija: sigue siendo 127.0.0.1
    // por defecto, pero dentro de un contenedor eso deja a la API incomunicada de los
    // demás. Ver el porqué completo en `config.host`.
    const servidor = app.listen(config.port, config.host, () => {
      console.log(`OLO API Backend running on ${config.host}:${config.port}`);
      console.log(`Health check: http://${config.host}:${config.port}/health`);
    });

    // Los limitadores abren su propia conexión a Redis (ver `rate-limit.middleware.ts`).
    // ioredis mantiene el socket vivo, así que sin cerrarla el proceso ignora la señal
    // y `docker stop` acaba matándolo por timeout a los diez segundos.
    const apagar = async (senal: string) => {
      console.log(`${senal} recibida — cerrando servidor...`);
      servidor.close();
      await cerrarCola();
      await cerrarClienteDeLimites();
      process.exit(0);
    };
    process.on('SIGTERM', () => void apagar('SIGTERM'));
    process.on('SIGINT', () => void apagar('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', describirErrorParaLog(error));
    process.exit(1);
  }
};

start();
