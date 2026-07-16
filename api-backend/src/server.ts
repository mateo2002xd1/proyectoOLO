import { app } from './app';
import { config } from './config';
import sequelize from './config/database';

// Import models to register associations
import './infrastructure/db/models';

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION — crashing:', reason);
  process.exit(1);
});

const start = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: true });
    console.log('Models synchronized.');

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
