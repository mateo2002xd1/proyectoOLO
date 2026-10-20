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
  logging: false, // REGLA 95.3 BE: Desactivado para evitar imprimir contraseñas o datos de formularios en sentencias SQL
  dialectOptions: {
    // Con Postgres normal evita que la red corte en silencio la conexión que el pool
    // deja abierta. Con Neon no hace nada (su conector va por WebSocket), y no hace
    // falta: si la conexión se cae, Sequelize la marca inválida y abre otra.
    keepAlive: true,
    ...(useSSL && !isNeon ? { ssl: { require: true, rejectUnauthorized: false } } : {}),
  },
  // `min: 1`: una conexión siempre abierta. Con `min: 0` el pool cerraba todas a los 10 s
  // sin uso y la siguiente petición pagaba la reconexión a Neon (TLS y autenticación,
  // 1 a 3 s con la red lenta), lo que tumbaba pantallas con límite de 5 s como
  // /admin-panel/review-section. Ojo: si esa conexión no deja dormir a Neon, gasta horas de cómputo.
  pool: { max: 5, min: 1, acquire: 30000, idle: 60000 },
});

export default sequelize;

