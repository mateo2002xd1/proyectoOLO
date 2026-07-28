import { app } from './app';
import { config } from './config';
import sequelize from './config/database';

// Import models to register associations
import './infrastructure/db/models';
import { listarPendientes } from './infrastructure/db/migrations';
import { setupWorker } from './infrastructure/redis/queue';

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION — crashing:', reason);
  process.exit(1);
});

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

    app.listen(config.port, '127.0.0.1', () => {
      console.log(`OLO API Backend running on port ${config.port}`);
      console.log(`Health check: http://127.0.0.1:${config.port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
