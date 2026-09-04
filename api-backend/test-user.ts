import { UserRepository } from './src/repositories/usuarios.repository';
import sequelize from './src/config/database';

async function test() {
  await sequelize.authenticate();
  const users = await UserRepository.findAll();
  if (users.length > 0) {
    const user = users[0];
    console.log('toJSON exists?', typeof (user as any).toJSON === 'function');
    console.log('toJSON output:', typeof (user as any).toJSON === 'function' ? (user as any).toJSON() : user);
  } else {
    console.log('No users');
  }
  process.exit(0);
}
test().catch(console.error);
