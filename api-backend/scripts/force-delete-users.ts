import sequelize from '../src/config/database';
import { User, SecurityQuestion, Contenido, Pagina, PaginaVersion } from '../src/infrastructure/db/models';

const run = async () => {
  try {
    await sequelize.authenticate();
    
    const users = await User.findAll({
      where: { email: ['editor@sena.edu.co', 'fatatis@sena.edu.co'] }
    });
    
    const userIds = users.map(u => u.id);
    
    if (userIds.length > 0) {
      await SecurityQuestion.destroy({ where: { user_id: userIds } });
      await Contenido.destroy({ where: { authorId: userIds } });
      await PaginaVersion.destroy({ where: { revisorId: userIds } });
      await PaginaVersion.destroy({ where: { publicadoPor: userIds } });
      await Pagina.destroy({ where: { creadoPor: userIds } });
      
      await User.destroy({ where: { id: userIds } });
      console.log('Usuarios y sus datos relacionados eliminados exitosamente!');
    } else {
      console.log('No se encontraron esos usuarios.');
    }
  } catch (error) {
    console.error('Error eliminando usuarios:', error);
  } finally {
    process.exit();
  }
};

run();
