import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';
import type { Ambito } from '../../shared/ambito';

/**
 * Hace cumplir el candado de edición: los editores comparten un solo borrador, pero solo
 * uno a la vez escribe sobre él.
 *
 * El candado nació como aviso al abrir el editor («Fulano está editando») y nada más: el
 * guardado no lo miraba, así que quien se había quedado fuera —o quien volvía de una
 * pestaña dormida cuyo candado caducó y otro tomó— podía guardar encima y deshacer lo del
 * compañero sin enterarse. Aquí se vuelve una regla del servidor.
 *
 * Pasa si **nadie** tiene el candado vigente (un candado caducado o nunca pedido no
 * bloquea a nadie: los scripts de siembra y un editor cuyo latido se retrasó siguen
 * funcionando) o si lo tiene quien escribe. Quien quiera la página con otro dentro tiene
 * que tomar el candado a la fuerza, que es un permiso de quien aprueba
 * (`puedeForzarBloqueo`) y deja al otro con «candado perdido» en su pantalla.
 *
 * El 409 lleva el nombre de quien edita —el mismo texto que ya sale al abrir el editor— y
 * `code: 'PAGE_LOCKED'`, que es el que ya reconocen las pantallas de respaldos.
 *
 * @throws {Error} 409 `PAGE_LOCKED` si otra persona tiene el candado vigente.
 */
export const exigirCandadoLibreOPropio = async (
  slug: string,
  ambito: Ambito,
  usuarioId: string
): Promise<void> => {
  const dueno = await BloqueoEdicionRepository.vigente(ambito, slug);
  if (!dueno || dueno.usuario_id === usuarioId) return;

  throw Object.assign(new Error(`${dueno.usuario_nombre} está editando esta página ahora mismo.`), {
    status: 409,
    code: 'PAGE_LOCKED',
  });
};
