import { RolePermissionRepository } from './src/repositories/role-permissions.repository';
import { Role } from './src/infrastructure/db/models';

async function test() {
  const roles = await Role.findAll();
  console.log('Roles:', roles.map(r => r.get('name')));
  for (const role of roles) {
    const name = role.get('name') as string;
    const perms = await RolePermissionRepository.getPermissionsByRole(name);
    console.log(`Permisos de ${name}:`, perms);
  }
}

test().catch(console.error).finally(() => process.exit(0));
