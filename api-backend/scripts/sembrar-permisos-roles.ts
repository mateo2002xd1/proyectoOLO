/**
 * Seed: Verifica e inserta permisos clave y asignaciones de rol.
 *
 * Permisos requeridos:
 *   - acceso.intranet  → Editor (accede a la intranet)
 *   - acceso.sitio     → (permiso para sitio web público)
 *   - edit_post        → Editor (puede editar contenido en el sitio web)
 *
 * Restricciones:
 *   - Editor NO tiene acceso al panel administrativo (access_dashboard)
 *   - Subdirector NO tiene edit_post, ni acceso al panel, solo lectura
 *
 * Uso: npx ts-node -r dotenv/config scripts/sembrar-permisos-roles.ts
 */
import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../src/config/database';

const PERMISOS_REQUERIDOS: { clave: string; descripcion: string }[] = [
  { clave: 'acceso.intranet', descripcion: 'Permite acceder a la intranet' },
  { clave: 'acceso.sitio', descripcion: 'Permite acceder al sitio web público' },
  { clave: 'edit_post', descripcion: 'Permite editar contenido en el sitio web (botón editar)' },
];

// Permisos que debe tener cada rol
const PERMISOS_POR_ROL: Record<string, string[]> = {
  Editor: ['acceso.intranet', 'edit_post', 'acceso.sitio'],
  Subdirector: [], // Solo lectura: ningún permiso especial de edición
};

// Permisos que NO debe tener cada rol (se revocan si existen)
const PERMISOS_PROHIBIDOS_POR_ROL: Record<string, string[]> = {
  Editor: ['access_dashboard'], // El Editor NO puede acceder al panel administrativo
  Subdirector: ['edit_post', 'access_dashboard', 'access_users_roles', 'manage_roles'],
};

async function upsertPermiso(clave: string, descripcion: string): Promise<string> {
  const [existing] = await sequelize.query<{ id: string }>(
    `SELECT id FROM permisos WHERE clave = :clave LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { clave }, logging: false }
  );

  if (existing) {
    console.log(`  [OK] Permiso ya existe: ${clave} (id: ${existing.id})`);
    return existing.id;
  }

  const [result] = await sequelize.query<{ id: string }>(
    `INSERT INTO permisos (id, clave, created_at, updated_at)
     VALUES (gen_random_uuid(), :clave, now(), now())
     RETURNING id`,
    { type: QueryTypes.SELECT, replacements: { clave }, logging: false }
  );
  console.log(`  [CREADO] Permiso: ${clave} (id: ${result.id})`);
  return result.id;
}

async function main(): Promise<void> {
  await sequelize.authenticate();
  console.log('\n=== Seed: Permisos y roles ===\n');

  // 1. Upsert permisos requeridos
  console.log('--- Verificando/creando permisos ---');
  const permisoIds: Record<string, string> = {};
  for (const { clave, descripcion } of PERMISOS_REQUERIDOS) {
    permisoIds[clave] = await upsertPermiso(clave, descripcion);
  }

  // 2. Obtener roles existentes
  console.log('\n--- Verificando roles ---');
  const roles = await sequelize.query<{ id: string; nombre: string }>(
    `SELECT id, nombre FROM roles ORDER BY nombre`,
    { type: QueryTypes.SELECT, logging: false }
  );

  for (const { id: roleId, nombre } of roles) {
    const permisosDeben = PERMISOS_POR_ROL[nombre] || null;
    const permisosProhibidos = PERMISOS_PROHIBIDOS_POR_ROL[nombre] || [];

    if (permisosDeben === null) {
      console.log(`\n  [SKIP] Rol '${nombre}': no hay reglas definidas para este rol`);
      continue;
    }

    console.log(`\n  [Rol: ${nombre}]`);

    // Asignar permisos requeridos
    for (const clave of permisosDeben) {
      const permisoId = permisoIds[clave];
      if (!permisoId) {
        console.log(`    AVISO: permiso '${clave}' no encontrado en mapa`);
        continue;
      }

      const [existing] = await sequelize.query<{ role_id: string }>(
        `SELECT rol_id FROM roles_permisos WHERE rol_id = :roleId AND permiso_id = :permisoId LIMIT 1`,
        { type: QueryTypes.SELECT, replacements: { roleId, permisoId }, logging: false }
      );

      if (existing) {
        console.log(`    [OK] ${clave}: ya asignado`);
      } else {
        await sequelize.query(
          `INSERT INTO roles_permisos (rol_id, permiso_id)
           VALUES (:roleId, :permisoId)`,
          { replacements: { roleId, permisoId }, logging: false }
        );
        console.log(`    [ASIGNADO] ${clave}`);
      }
    }

    // Revocar permisos prohibidos
    for (const clave of permisosProhibidos) {
      const [permisoRow] = await sequelize.query<{ id: string }>(
        `SELECT id FROM permisos WHERE clave = :clave LIMIT 1`,
        { type: QueryTypes.SELECT, replacements: { clave }, logging: false }
      );
      if (!permisoRow) continue;

      const deleted = await sequelize.query(
        `DELETE FROM roles_permisos WHERE rol_id = :roleId AND permiso_id = :permisoId`,
        { replacements: { roleId, permisoId: permisoRow.id }, logging: false }
      );
      // @ts-expect-error sequelize delete result
      if (deleted[1] > 0) {
        console.log(`    [REVOCADO] ${clave}`);
      }
    }
  }

  console.log('\n=== Seed completado ===\n');
}

main()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err instanceof Error ? err.message : err);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
