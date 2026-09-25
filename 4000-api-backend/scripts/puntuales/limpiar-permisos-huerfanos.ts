import sequelize from '../../src/config/database';
import { Permission, RolePermission, Pagina } from '../../src/infrastructure/db/models';
import { Op } from 'sequelize';

async function cleanup() {
  const t = await sequelize.transaction();
  try {
    const allPermissions = await Permission.findAll({
      where: {
        name: {
          [Op.like]: 'editar.%'
        }
      },
      transaction: t
    });

    const paginas = await Pagina.findAll({ transaction: t });
    const validKeys = new Set(paginas.map(p => `editar.${p.ambito}.${p.slug}`));

    let deleted = 0;
    for (const p of allPermissions) {
      if (!validKeys.has(p.name)) {
        await RolePermission.destroy({ where: { permission_id: p.id }, transaction: t });
        await p.destroy({ transaction: t });
        deleted++;
        console.log('Deleted orphaned permission:', p.name);
      }
    }

    await t.commit();
    console.log(`Cleanup complete. Deleted ${deleted} orphaned permissions.`);
  } catch (error) {
    await t.rollback();
    console.error('Error during cleanup:', error);
  }
}

cleanup();
