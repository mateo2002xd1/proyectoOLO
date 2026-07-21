"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function validateEnv() {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
        throw new Error('FATAL: JWT_SECRET es obligatoria. Defínela en el archivo .env');
    }
    if (!process.env.JWT_SITE_SECRET || process.env.JWT_SITE_SECRET.trim() === '') {
        throw new Error('FATAL: JWT_SITE_SECRET es obligatoria. Defínela en el archivo .env');
    }
}
validateEnv();
exports.config = {
    port: parseInt(process.env.PORT || '4000', 10),
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET,
    jwtSiteSecret: process.env.JWT_SITE_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    intranetUrl: process.env.INTRANET_URL || 'http://localhost:3001',
    nodeEnv: process.env.NODE_ENV || 'development',
    localAuth: {
        email: process.env.LOCAL_AUTH_EMAIL || '',
        password: process.env.LOCAL_AUTH_PASSWORD || '',
        name: process.env.LOCAL_AUTH_NAME || 'Superadmin',
        role: process.env.LOCAL_AUTH_ROLE || 'Superadmin',
    },
};
//# sourceMappingURL=index.js.map