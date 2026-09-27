import 'dotenv/config';
import sequelize from '../../src/config/database';
import { Role, User } from '../../src/infrastructure/db/models';
import { hashearPassword } from '../../src/shared/password-policy';
import { exigirEmailInstitucional } from '../../src/shared/email-policy';

/**
 * Crea la primera cuenta de Superadmin sobre una base recién instalada.
 *
 * Existe porque en producción no hay ninguna otra puerta. La cuenta maestra de
 * `LOCAL_AUTH_*` se desactiva sola cuando `NODE_ENV=production` —es una credencial fija
 * en variables de entorno que emite un token sin pasar por la base, o sea una puerta
 * trasera, y `config/index.ts` la apaga de raíz—, y crear usuarios por la API exige
 * estar ya autenticado. Sin este script se puede desplegar el sistema entero y quedarse
 * fuera: cero usuarios y ninguna forma de crear el primero.
 *
 * Solo sirve para el primero. Si ya hay algún usuario, se niega: a partir de ahí las
 * altas se hacen desde el panel, que deja rastro en la bitácora (Ley 1581) y asigna
 * contraseña temporal. Este atajo no hace ninguna de las dos cosas.
 *
 * Uso:  ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run crear:superadmin
 * Desde Docker, mejor:  ./deploy.sh crear-admin   (pide los datos sin dejarlos escritos)
 */

const ROL = 'Superadmin';

/** Crea la cuenta Superadmin con `ADMIN_EMAIL` y `ADMIN_PASSWORD` (falla si faltan). */
const crear = async (): Promise<void> => {
  const password = process.env.ADMIN_PASSWORD || '';

  if (!process.env.ADMIN_EMAIL || !password) {
    throw new Error(
      'Faltan ADMIN_EMAIL y/o ADMIN_PASSWORD. Uso: ADMIN_EMAIL=x@y.co ADMIN_PASSWORD=... npm run crear:superadmin'
    );
  }

  // La misma regla que el login: sin ella se creaba sin quejas una cuenta con un correo
  // de otro dominio, y el login la rechazaba después como «Credenciales inválidas». En
  // una instalación nueva es la única cuenta, así que nadie podía entrar.
  const email = exigirEmailInstitucional(process.env.ADMIN_EMAIL);

  await sequelize.authenticate();

  // El script es solo para arrancar. Con usuarios ya creados, seguir sería añadir una
  // cuenta con todos los permisos sin que quede constancia de quién la pidió.
  const cuantos = await User.count();
  if (cuantos > 0) {
    throw new Error(
      `La base ya tiene ${cuantos} usuario(s). Este script solo crea el primero; ` +
        'las demás altas se hacen desde el panel para que queden en la bitácora.'
    );
  }

  // `name` es el atributo del modelo; la columna se llama `nombre` y las une el `field`
  // de `Role.init`. Consultar por `nombre` aquí daría "column does not exist".
  const rol = await Role.findOne({ where: { name: ROL } });
  if (!rol) {
    throw new Error(
      `No existe el rol "${ROL}". ¿Se aplicaron las migraciones? Ejecuta antes: ./deploy.sh migrar`
    );
  }

  // `hashearPassword` valida la política antes de hashear (12 caracteres, 3 categorías),
  // así que una contraseña débil se rechaza aquí y no llega a la base.
  const password_hash = await hashearPassword(password);

  await User.create({
    name: 'Superadmin',
    apellidos: '',
    email,
    password_hash,
    role_id: rol.get('id'),
    status: 'active',
    // La eligió una persona ahora mismo: no hay nada que forzar a cambiar. Las cuentas
    // creadas desde el panel sí nacen con temporal y este campo en true.
    must_change_password: false,
    // Se deja en su valor por defecto (true): el primer inicio de sesión pedirá
    // configurarlas, que es el flujo normal de recuperación de la aplicación.
  });

  console.log(`Cuenta de ${ROL} creada para ${email}.`);
  console.log('Entra en /login del sitio web y configura las preguntas de seguridad.');
};

crear()
  .then(() => sequelize.close())
  .catch(async (error: Error) => {
    console.error('No se pudo crear la cuenta:', error.message);
    await sequelize.close();
    process.exit(1);
  });
