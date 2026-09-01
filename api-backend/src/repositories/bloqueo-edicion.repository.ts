import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { BloqueoEdicion } from '../infrastructure/db/models';
import type { Ambito } from '../shared/ambito';

/** Una fila de `bloqueos_edicion` tal como la devuelve el SQL de abajo. */
export interface FilaBloqueo {
  ambito: string;
  slug: string;
  usuario_id: string;
  usuario_nombre: string;
  adquirido_en: Date;
  expira_en: Date;
}

interface DatosParaAdquirir {
  ambito: Ambito;
  slug: string;
  usuarioId: string;
  usuarioNombre: string;
  /** Cuánto dura el candado desde ahora. */
  minutos: number;
  /** Solo lo pasa quien puede aprobar: se queda el candado aunque sea de otro. */
  forzar: boolean;
}

export const BloqueoEdicionRepository = {
  /**
   * Se queda con el candado si puede, en UNA sola sentencia.
   *
   * Tiene que ser atómico. Comprobar primero y escribir después deja una ventana
   * —corta, pero real— en la que dos personas leen «libre» y las dos entran, que es
   * justo el problema que este candado existe para evitar. El `WHERE` del `DO UPDATE`
   * es quien decide: si no se cumple ninguna de las tres condiciones, Postgres no
   * actualiza nada y no devuelve fila, y eso significa «lo tiene alguien más».
   *
   * Devuelve la fila si el candado quedó a nombre de quien lo pidió, o `null` si no.
   */
  async adquirir({
    ambito,
    slug,
    usuarioId,
    usuarioNombre,
    minutos,
    forzar,
  }: DatosParaAdquirir): Promise<FilaBloqueo | null> {
    const filas = await sequelize.query<FilaBloqueo>(
      `INSERT INTO bloqueos_edicion AS b
         (ambito, slug, usuario_id, usuario_nombre, adquirido_en, expira_en)
       VALUES
         (:ambito, :slug, :usuarioId, :usuarioNombre, now(), now() + (:minutos * interval '1 minute'))
       ON CONFLICT (ambito, slug) DO UPDATE
          SET usuario_id     = EXCLUDED.usuario_id,
              usuario_nombre = EXCLUDED.usuario_nombre,
              adquirido_en   = now(),
              expira_en      = EXCLUDED.expira_en
        WHERE b.usuario_id = EXCLUDED.usuario_id   -- lo renueva su propio dueño
           OR b.expira_en  < now()                 -- el anterior caducó
           OR :forzar                              -- toma de control de un admin
       RETURNING *`,
      {
        replacements: { ambito, slug, usuarioId, usuarioNombre, minutos, forzar },
        type: QueryTypes.SELECT,
      }
    );

    return filas[0] ?? null;
  },

  /** Quién lo tiene, si es que sigue vigente. */
  async vigente(ambito: Ambito, slug: string): Promise<FilaBloqueo | null> {
    const filas = await sequelize.query<FilaBloqueo>(
      `SELECT * FROM bloqueos_edicion
        WHERE ambito = :ambito AND slug = :slug AND expira_en > now()`,
      { replacements: { ambito, slug }, type: QueryTypes.SELECT }
    );

    return filas[0] ?? null;
  },

  /**
   * Suelta el candado, pero solo si es de quien lo suelta.
   *
   * El `usuarioId` en el `where` no sobra: sin él, a quien acaba de perder el candado
   * en una toma de control le bastaría cerrar su pestaña para dejar sin candado a
   * quien se lo quitó.
   */
  liberar: (ambito: Ambito, slug: string, usuarioId: string) =>
    BloqueoEdicion.destroy({ where: { ambito, slug, usuarioId } }),
};
