import { User, Role } from '../infrastructure/db/models';
import { config } from '../config';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export const UserRepository = {
  /** Todas las cuentas con su rol, sin el hash de contraseña ni la cuenta maestra local. */
  findAll: () =>
    User.findAll({
      where: { email: { [Op.ne]: config.localAuth.email.toLowerCase() } },
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash', 'previous_password_hash'] },
    }),

  /** Una cuenta por su id, con su rol y sin el hash de contraseña. */
  findById: (id: string) =>
    User.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash', 'previous_password_hash'] },
    }),

  /**
   * Una cuenta por su id, con los hashes (el actual y el anterior): solo para comprobar
   * la contraseña actual y que la nueva no repita ninguna de las dos.
   */
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

  /**
   * Cuenta un intento de login **antes** de comparar la contraseña, en una sola sentencia, y
   * devuelve el número de intento que le tocó (1, 2, 3…). Devuelve `null` si la cuenta ya está
   * bloqueada: el `WHERE` lo decide en la base, no una lectura anterior.
   *
   * Tiene que ser atómico y previo a la comparación. Con «leer el contador, sumar uno y
   * escribirlo después de fallar», una ráfaga de N contraseñas a la vez leía todas 0, escribía
   * todas 1 y ninguna llegaba al tope: el bloqueo no frenaba nada. Reservando el intento al
   * entrar, el número sale de la base y quien pasa del tope se rechaza sin comparar, así que
   * una ráfaga puede probar como mucho tantas contraseñas como el tope, igual que en fila.
   */
  reservarIntentoDeLogin: async (id: string): Promise<number | null> => {
    const filas = await sequelize.query<{ n: number }>(
      `UPDATE usuarios SET intentos_fallidos_login = intentos_fallidos_login + 1
        WHERE id = :id AND (bloqueado_hasta IS NULL OR bloqueado_hasta <= now())
       RETURNING intentos_fallidos_login AS n`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    return filas.length ? Number(filas[0].n) : null;
  },

  /** Bloquea la cuenta por intentos de login y reinicia su contador. */
  bloquearPorLogin: (id: string, hasta: Date) =>
    User.update({ failed_login_attempts: 0, locked_until: hasta }, { where: { id } }),

  /** Lo mismo que `reservarIntentoDeLogin`, para el contador de las preguntas de seguridad. */
  reservarIntentoDePreguntas: async (id: string): Promise<number | null> => {
    const filas = await sequelize.query<{ n: number }>(
      `UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1
        WHERE id = :id AND (bloqueado_hasta IS NULL OR bloqueado_hasta <= now())
       RETURNING intentos_fallidos AS n`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    return filas.length ? Number(filas[0].n) : null;
  },

  /** Bloquea la cuenta por respuestas de seguridad erróneas y reinicia su contador. */
  bloquearPorPreguntas: (id: string, hasta: Date) =>
    User.update({ failed_security_attempts: 0, locked_until: hasta }, { where: { id } }),

  /** Marca ahora como el último acceso de la cuenta (lo usa el cierre por inactividad). */
  updateLastAccess: (id: string) =>
    User.update({ last_access_at: new Date() }, { where: { id } }),
};
