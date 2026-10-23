import { QueryTypes, type Transaction } from 'sequelize';
import sequelize from '../config/database';
import { tomarCandadoDeAviso } from '../shared/seccion-critica';

/** Una fila de `configuracion` (migración 044). */
export interface FilaConfiguracion {
  id: string;
  clave: string;
  valor: Record<string, unknown>;
  updated_at: Date;
}

/**
 * Ajustes del sistema guardados como clave → objeto JSON. La forma de cada `valor` la
 * decide su caso de uso y la valida su validador; aquí solo se lee y se escribe.
 */
export const ConfiguracionRepository = {
  /**
   * Lee un ajuste. Con `tx`, bloquea la fila hasta el final de la transacción
   * (`FOR UPDATE`): quien reemplaza el logo necesita saber cuál había para borrarlo, y
   * dos reemplazos a la vez dejarían uno de los archivos sin nadie que lo borre.
   */
  async leer(clave: string, tx?: Transaction): Promise<FilaConfiguracion | null> {
    // Dentro de una transacción la clave se bloquea con un candado de aviso además del
    // `FOR UPDATE`: la primera vez no hay fila que bloquear, y dos escrituras a la vez leían
    // «no hay nada» y cada una guardaba solo lo suyo, perdiéndose el cambio de la otra.
    if (tx) await tomarCandadoDeAviso(`configuracion:${clave}`, tx);

    const filas = await sequelize.query<FilaConfiguracion>(
      `SELECT id, clave, valor, updated_at
         FROM configuracion
        WHERE clave = :clave
        ${tx ? 'FOR UPDATE' : ''}`,
      { replacements: { clave }, type: QueryTypes.SELECT, transaction: tx }
    );
    return filas[0] ?? null;
  },

  /**
   * Escribe el valor entero de un ajuste. `INSERT … ON CONFLICT` y no `UPDATE` por si la
   * fila no existe (una base donde alguien la borró a mano): el ajuste se recrea en vez
   * de perderse sin error.
   */
  async guardar(
    clave: string,
    valor: Record<string, unknown>,
    actualizadoPor: string | null,
    tx?: Transaction
  ): Promise<FilaConfiguracion> {
    const filas = await sequelize.query<FilaConfiguracion>(
      `INSERT INTO configuracion (clave, valor, actualizado_por)
       VALUES (:clave, CAST(:valor AS jsonb), :actualizadoPor)
       ON CONFLICT (clave) DO UPDATE
          SET valor           = EXCLUDED.valor,
              actualizado_por = EXCLUDED.actualizado_por,
              updated_at      = now()
       RETURNING id, clave, valor, updated_at`,
      {
        replacements: { clave, valor: JSON.stringify(valor), actualizadoPor },
        type: QueryTypes.SELECT,
        transaction: tx,
      }
    );
    return filas[0];
  },
};
