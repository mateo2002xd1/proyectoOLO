import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const esProduccion = nodeEnv === 'production';

function validateEnv() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    throw new Error(
      'FATAL: JWT_SECRET es obligatoria. Defínela en el archivo .env'
    );
  }
}

validateEnv();

/**
 * La cuenta maestra local **no existe en producción**.
 *
 * Es una credencial fija en variables de entorno que emite un token de Superadmin sin
 * pasar por la base de datos. Eso significa que se salta todo lo que protege a las
 * cuentas de verdad: no tiene fila que desactivar, el contador de intentos fallidos no
 * se le aplica —`registrarFalloDeLogin` solo toca usuarios de la base— y
 * `auth.middleware.ts` corta antes de comprobar estado, bloqueo, caducidad e
 * inactividad porque el token lleva `isLocal`. Tampoco deja rastro en la bitácora que
 * la Ley 1581 obliga a poder consultar.
 *
 * Como atajo de desarrollo es útil y se conserva. En producción es una puerta trasera
 * con contraseña reutilizable, así que aquí se apaga de raíz en vez de confiar en que
 * nadie defina las variables: `docker-compose.prod.yml` las estaba definiendo.
 */
const localAuthHabilitado =
  !esProduccion &&
  Boolean(process.env.LOCAL_AUTH_EMAIL?.trim()) &&
  Boolean(process.env.LOCAL_AUTH_PASSWORD);

if (esProduccion && process.env.LOCAL_AUTH_EMAIL?.trim()) {
  console.warn(
    '[config] LOCAL_AUTH_EMAIL está definida pero NODE_ENV=production: ' +
      'la cuenta maestra local queda desactivada. Elimina la variable del entorno.'
  );
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  intranetUrl: process.env.INTRANET_URL || 'http://localhost:3001',
  nodeEnv,
  esProduccion,
  localAuth: {
    habilitado: localAuthHabilitado,
    // Vacíos cuando está deshabilitada, para que ninguna comparación pueda acertar
    // aunque alguien se salte el flag por descuido.
    email: localAuthHabilitado ? process.env.LOCAL_AUTH_EMAIL!.trim().toLowerCase() : '',
    password: localAuthHabilitado ? process.env.LOCAL_AUTH_PASSWORD! : '',
    name: process.env.LOCAL_AUTH_NAME || 'Superadmin',
    role: process.env.LOCAL_AUTH_ROLE || 'Superadmin',
  },
};
