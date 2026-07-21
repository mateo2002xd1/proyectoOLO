import { app } from './app';
import { config } from './config';
import sequelize from './config/database';

// Import models to register associations
import './infrastructure/db/models';
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

    // sync({ alter: true }) modifica columnas existentes — solo con opt-in explícito
    // (DB_AUTO_ALTER=true), porque DATABASE_URL puede apuntar a una BD compartida.
    // Sin la variable, sync() solo crea las tablas que falten, sin tocar las existentes.
    await sequelize.sync(config.dbAutoAlter ? { alter: true } : undefined);
    console.log(config.dbAutoAlter ? 'Models synchronized (alter).' : 'Models synchronized (create-only).');

    setupWorker();
    console.log('Background worker started.');

    // Allow null on creado_por for local-auth development user (no valid UUID)
    if (process.env.NODE_ENV !== 'production') {
      try {
        await sequelize.query('ALTER TABLE paginas ALTER COLUMN creado_por DROP NOT NULL');
      } catch {
        // Already nullable — ignore
      }
    }

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
