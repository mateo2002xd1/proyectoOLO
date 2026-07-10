import { Sequelize } from 'sequelize';
import { config } from './index';

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: config.nodeEnv !== 'production' ? console.log : false,
  dialectOptions: {
    // Neon PostgreSQL siempre requiere SSL, incluso en desarrollo
    ssl: { require: true, rejectUnauthorized: false },
  },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

export default sequelize;
