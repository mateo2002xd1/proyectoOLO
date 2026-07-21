"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const database_1 = __importDefault(require("./config/database"));
// Import models to register associations
require("./infrastructure/db/models");
const queue_1 = require("./infrastructure/redis/queue");
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION — crashing:', reason);
    process.exit(1);
});
const start = async () => {
    try {
        console.log('Connecting to database...');
        await database_1.default.authenticate();
        console.log('Database connected.');
        await database_1.default.sync({ alter: true });
        console.log('Models synchronized.');
        (0, queue_1.setupWorker)();
        console.log('Background worker started.');
        // Allow null on creado_por for local-auth development user (no valid UUID)
        if (process.env.NODE_ENV !== 'production') {
            try {
                await database_1.default.query('ALTER TABLE paginas ALTER COLUMN creado_por DROP NOT NULL');
            }
            catch {
                // Already nullable — ignore
            }
        }
        app_1.app.listen(config_1.config.port, '127.0.0.1', () => {
            console.log(`OLO API Backend running on port ${config_1.config.port}`);
            console.log(`Health check: http://127.0.0.1:${config_1.config.port}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map