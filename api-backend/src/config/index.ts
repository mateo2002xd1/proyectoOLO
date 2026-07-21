import dotenv from 'dotenv';
dotenv.config();

function validateEnv() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    throw new Error(
      'FATAL: JWT_SECRET es obligatoria. Defínela en el archivo .env'
    );
  }
  if (!process.env.JWT_SITE_SECRET || process.env.JWT_SITE_SECRET.trim() === '') {
    throw new Error(
      'FATAL: JWT_SITE_SECRET es obligatoria. Defínela en el archivo .env'
    );
  }
}

validateEnv();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET!,
  jwtSiteSecret: process.env.JWT_SITE_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  intranetUrl: process.env.INTRANET_URL || 'http://localhost:3001',
  nodeEnv: process.env.NODE_ENV || 'development',
  // Por defecto NO se altera el schema al arrancar — DATABASE_URL puede apuntar a una
  // BD compartida (ej. Neon). Opt-in explícito solo para setup local contra una BD propia.
  dbAutoAlter: process.env.DB_AUTO_ALTER === 'true',
  localAuth: {
    email: process.env.LOCAL_AUTH_EMAIL || '',
    password: process.env.LOCAL_AUTH_PASSWORD || '',
    name: process.env.LOCAL_AUTH_NAME || 'Superadmin',
    role: process.env.LOCAL_AUTH_ROLE || 'Superadmin',
  },
};
