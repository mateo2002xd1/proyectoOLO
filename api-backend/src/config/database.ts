import { Sequelize } from 'sequelize';
import * as neon from '@neondatabase/serverless';
import ws from 'ws';
import { config } from './index';

const isNeon = config.databaseUrl.includes('neon.tech');
if (isNeon) {
  neon.neonConfig.webSocketConstructor = ws;
}

const useSSL = process.env.DB_SSL !== 'false';

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  ...(isNeon ? { dialectModule: neon } : {}),
  logging: config.nodeEnv !== 'production' ? console.log : false,
  dialectOptions: useSSL && !isNeon
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

export default sequelize;

