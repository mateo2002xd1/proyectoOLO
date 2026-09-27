import { User, Role } from '../infrastructure/db/models';
import { config } from '../config';
import { Op } from 'sequelize';

export const UserRepository = {
  /** Todas las cuentas con su rol, sin el hash de contraseña ni la cuenta maestra local. */
  findAll: () =>
    User.findAll({
      where: { email: { [Op.ne]: config.localAuth.email.toLowerCase() } },
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash'] },
    }),

  /** Una cuenta por su id, con su rol y sin el hash de contraseña. */
  findById: (id: string) =>
    User.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash'] },
    }),

  /** Una cuenta por su id, con el hash: solo para comprobar la contraseña actual. */
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

  /** Una cuenta por su correo, con su rol (y con el hash, para el login). */
  findByEmail: (email: string) =>
    User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }],
    }),

  /** Crea una cuenta. */
  create: (data: any) => User.create(data),

  /** Actualiza una cuenta y devuelve las filas cambiadas. */
  update: (id: string, data: any) =>
    User.update(data, { where: { id }, returning: true }),

  /** Borra una cuenta. */
  delete: (id: string) => User.destroy({ where: { id } }),

  /** Marca ahora como el último acceso de la cuenta (lo usa el cierre por inactividad). */
  updateLastAccess: (id: string) =>
    User.update({ last_access_at: new Date() }, { where: { id } }),
};
