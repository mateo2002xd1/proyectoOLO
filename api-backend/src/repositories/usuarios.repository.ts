import { User, Role } from '../infrastructure/db/models';
import { config } from '../config';
import { Op } from 'sequelize';

export const UserRepository = {
  findAll: () =>
    User.findAll({
      where: { email: { [Op.ne]: config.localAuth.email.toLowerCase() } },
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash'] },
    }),

  findById: (id: string) =>
    User.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash'] },
    }),

  findByIdWithPassword: (id: string) =>
    User.findByPk(id, { include: [{ model: Role, as: 'role' }] }),

  /**
   * El correo de varias cuentas de una vez, por id.
   *
   * Lo usa la bitácora: sus filas guardan el id del usuario sobre el que se actuó, y
   * para poder decir «se inactivó el usuario fallip@sena.edu.co» hay que resolverlo.
   * De una sola consulta por página y no una por fila, que sobre la tabla que más
   * crece del sistema serían hasta 200 idas a la base para pintar una pantalla.
   *
   * Sin el `include` del rol ni el resto de columnas: aquí solo hace falta el correo.
   */
  findEmailsByIds: (ids: string[]) =>
    User.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'email'],
    }),

  findByEmail: (email: string) =>
    User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }],
    }),

  create: (data: any) => User.create(data),

  update: (id: string, data: any) =>
    User.update(data, { where: { id }, returning: true }),

  delete: (id: string) => User.destroy({ where: { id } }),

  updateLastAccess: (id: string) =>
    User.update({ last_access_at: new Date() }, { where: { id } }),
};
