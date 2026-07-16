import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add indices to 'users' table
  await queryInterface.addIndex('users', ['email']);
  await queryInterface.addIndex('users', ['role_id']);
  await queryInterface.addIndex('users', ['status']);

  // Add indices to 'paginas' table
  await queryInterface.addIndex('paginas', ['slug']);
  await queryInterface.addIndex('paginas', ['creado_por']);

  // Add indices to 'Post' table
  await queryInterface.addIndex('Post', ['slug']);
  await queryInterface.addIndex('Post', ['sectionId']);
  await queryInterface.addIndex('Post', ['authorId']);
  await queryInterface.addIndex('Post', ['publishedAt']);

  // Add indices to 'usuarios_sitio' table
  await queryInterface.addIndex('usuarios_sitio', ['email']);
  await queryInterface.addIndex('usuarios_sitio', ['status']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove indices from 'usuarios_sitio'
  await queryInterface.removeIndex('usuarios_sitio', ['email']);
  await queryInterface.removeIndex('usuarios_sitio', ['status']);

  // Remove indices from 'Post'
  await queryInterface.removeIndex('Post', ['slug']);
  await queryInterface.removeIndex('Post', ['sectionId']);
  await queryInterface.removeIndex('Post', ['authorId']);
  await queryInterface.removeIndex('Post', ['publishedAt']);

  // Remove indices from 'paginas'
  await queryInterface.removeIndex('paginas', ['slug']);
  await queryInterface.removeIndex('paginas', ['creado_por']);

  // Remove indices from 'users'
  await queryInterface.removeIndex('users', ['email']);
  await queryInterface.removeIndex('users', ['role_id']);
  await queryInterface.removeIndex('users', ['status']);
}
