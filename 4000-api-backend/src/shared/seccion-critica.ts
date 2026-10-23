/**
 * Exclusión mutua para operaciones que leen, deciden y escriben.
 *
 * El patrón «leer → comprobar → escribir» falla cuando dos peticiones llegan a la vez: las
 * dos leen lo mismo, las dos deciden lo mismo y las dos escriben. Dos herramientas, según
 * quién tenga la transacción:
 *
 *  - `tomarCandadoDeAviso(clave, tx)`: para código que **ya corre dentro de una
 *    transacción**. Pide un `pg_advisory_xact_lock` sobre la clave, lo suelta Postgres al
 *    cerrar la transacción (con éxito o con error) y no deja nada huérfano. Sirve para
 *    proteger algo que todavía no existe como fila (no hay nada que `FOR UPDATE`ar).
 *
 *  - `enSeccionCritica(clave, fn)`: para código que **no** corre en una transacción y que
 *    usa varios repositorios sin pasar `tx`. Abre una transacción solo para sostener el
 *    candado mientras dura `fn`; lo que `fn` escriba va por sus propias conexiones y queda
 *    confirmado antes de soltarlo, así que quien espera el candado ya ve el resultado.
 *
 * `enSeccionCritica` además hace cola **dentro del proceso**, antes de pedir conexión: el
 * pool de la API es de 5, y si cinco peticiones esperaran el candado cada una con su
 * conexión, la que lo tiene no podría conseguir una para trabajar y todas esperarían al
 * tiempo de espera del pool. La cola deja a lo sumo una por clave y proceso; el candado de
 * Postgres cubre el caso de varios procesos.
 */
import type { Transaction } from 'sequelize';
import sequelize from '../config/database';

/** Pide el candado de aviso `clave` hasta que cierre la transacción `tx`. */
export const tomarCandadoDeAviso = (clave: string, tx: Transaction): Promise<unknown> =>
  sequelize.query('SELECT pg_advisory_xact_lock(hashtext(:clave))', {
    replacements: { clave },
    transaction: tx,
  });

/** Lo último que está en la cola de cada clave, para encadenar al siguiente. */
const colas = new Map<string, Promise<unknown>>();

/**
 * Corre `fn` con la exclusión de `clave`: de una en una por proceso y, entre procesos, con el
 * candado de aviso de Postgres. Si `fn` lanza, se suelta el candado y el error sigue su camino.
 */
export const enSeccionCritica = <T>(clave: string, fn: () => Promise<T>): Promise<T> => {
  const anterior = colas.get(clave) ?? Promise.resolve();
  const turno = anterior
    .catch(() => undefined)
    .then(() =>
      sequelize.transaction(async (tx) => {
        await tomarCandadoDeAviso(clave, tx);
        return fn();
      })
    );
  const cola = turno.catch(() => undefined);
  colas.set(clave, cola);
  // Sin esto el mapa crecería con una entrada por clave que se haya usado alguna vez.
  void cola.then(() => {
    if (colas.get(clave) === cola) colas.delete(clave);
  });
  return turno;
};
