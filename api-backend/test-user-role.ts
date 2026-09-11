import { UserRepository } from './src/repositories/usuarios.repository';

async function test() {
  const users = await UserRepository.findAll();
  if (users.length > 0) {
    const user = users[0] as any;
    console.log('User Role object:', user.role);
    console.log('User role name via .name:', user.role?.name);
    console.log('User role name via .get:', user.role?.get ? user.role.get('name') : 'No get()');
  }
}

test().catch(console.error).finally(() => process.exit(0));
