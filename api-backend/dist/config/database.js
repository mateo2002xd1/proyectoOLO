"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
const useSSL = process.env.DB_SSL !== 'false';
const sequelize = new sequelize_1.Sequelize(index_1.config.databaseUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: index_1.config.nodeEnv !== 'production' ? console.log : false,
    dialectOptions: useSSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});
exports.default = sequelize;
//# sourceMappingURL=database.js.map