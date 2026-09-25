/**
 * Comprueba que la revisión de caducidad (RF-16) nunca desactiva a un administrador.
 *
 * `deactivateExpiredUsers` corre solo, sin que nadie confirme nada, en cada `GET
 * /api/users`. La primera versión solo protegía al *último* administrador activo —
 * calcado del guard de `updateUser`/`deleteUser` — pero RF-16 pide algo más estricto:
 * "fecha de caducidad para todos excepto el administrador". No es "mientras quede
 * otro", es que el rol administrador queda fuera de esta revisión, punto. Con dos
 * administradores caducados a la vez, la versión anterior habría desactivado a uno
 * igual; esta prueba siembra exactamente ese caso para que no pueda volver a colarse.
 *
 * Escribe tres cuentas reales (Superadmin, Administrador y Editor, las tres activas y
 * ya caducadas), corre la revisión de verdad y comprueba en la base — no en memoria —
 * qué quedó activo y qué no. Se borra lo sembrado al final, pase o falle.
 *
 * Se ejecuta con `npm run caducidad:verificar`.
 */
import 'dotenv/config';
import { randomUUID } from 'crypto';
import sequelize from '../../src/config/database';
import { User } from '../../src/infrastructure/db/models';
import { RoleRepository } from '../../src/repositories/roles.repository';
import { deactivateExpiredUsers } from '../../src/use-cases/usuarios/listar-usuarios.usecase';

let fallos = 0;

const comprobar = (descripcion: string, obtenido: unknown, esperado: unknown) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (!ok) fallos += 1;
  console.log(
    `  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion}` +
      (ok ? '' : ` → ${JSON.stringify(obtenido)} (esperado ${JSON.stringify(esperado)})`)
  );
};

const AYER = new Date(Date.now() - 24 * 60 * 60 * 1000);

const sembrarUsuarioCaducado = async (rolNombre: string) => {
  const rol = await RoleRepository.findByName(rolNombre);
  if (!rol) throw new Error(`El rol '${rolNombre}' no existe en esta base — ¿falta sembrar roles?`);

  return User.create({
    name: `Prueba caducidad (${rolNombre})`,
    email: `zz-prueba-caducidad-${rolNombre.toLowerCase()}-${randomUUID()}@example.com`,
    password_hash: 'no-aplica-prueba-automatica',
    role_id: rol.get('id'),
    status: 'active',
    expiration_date: AYER,
  });
};

const main = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error(
      '\n  FALLA  no hay conexión con la base de datos: esta prueba necesita escribir filas reales.\n',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }

  console.log('\n=== La revisión de caducidad nunca desactiva a un administrador ===');

  const sembrados = {
    superadmin: await sembrarUsuarioCaducado('Superadmin'),
    administrador: await sembrarUsuarioCaducado('Administrador'),
    editor: await sembrarUsuarioCaducado('Editor'),
  };

  try {
    const resultado = await deactivateExpiredUsers();

    comprobar(
      'el Superadmin caducado queda exento, no desactivado',
      resultado.exentosPorRolAdministrador.includes(sembrados.superadmin.get('id') as string),
      true
    );
    comprobar(
      'el Administrador caducado queda exento, no desactivado',
      resultado.exentosPorRolAdministrador.includes(sembrados.administrador.get('id') as string),
      true
    );

    // No basta con leer lo que devuelve la función: se relee de la base, que es lo
    // que de verdad va a ver el próximo intento de login.
    const [superadminTrasRevision, administradorTrasRevision, editorTrasRevision] = await Promise.all([
      User.findByPk(sembrados.superadmin.get('id') as string),
      User.findByPk(sembrados.administrador.get('id') as string),
      User.findByPk(sembrados.editor.get('id') as string),
    ]);

    comprobar('el Superadmin sigue activo en la base', superadminTrasRevision?.get('status'), 'active');
    comprobar('el Administrador sigue activo en la base', administradorTrasRevision?.get('status'), 'active');

    // El control: si la función desactivara a todo el mundo por igual, esta prueba no
    // detectaría nada. El Editor caducado sí debe pasar a inactivo — es la prueba de
    // que la exención es del rol administrador y no un job que ya no hace nada.
    comprobar('el Editor caducado sí se desactiva (no es que el job esté roto)', editorTrasRevision?.get('status'), 'inactive');
  } finally {
    await User.destroy({
      where: { id: [sembrados.superadmin.get('id'), sembrados.administrador.get('id'), sembrados.editor.get('id')] },
    });
  }

  await sequelize.close();
  console.log(fallos === 0 ? '\nTODO OK\n' : `\n${fallos} FALLOS\n`);
  process.exit(fallos === 0 ? 0 : 1);
};

main().catch(async (error) => {
  console.error('\nLa verificación se interrumpió:', error);
  await sequelize.close().catch(() => undefined);
  process.exit(1);
});
