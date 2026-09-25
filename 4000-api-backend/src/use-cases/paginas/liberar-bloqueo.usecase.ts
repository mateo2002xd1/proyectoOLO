import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';
import type { Ambito } from '../../shared/ambito';

/**
 * Suelta el candado de edición al salir del editor.
 *
 * Nunca falla por no haber nada que soltar: se llama al desmontar el editor y al
 * cerrar la pestaña, así que llega dos veces de rutina, y también llega de quien ya
 * había perdido el candado en una toma de control. En los tres casos lo correcto es
 * no hacer nada y responder que sí. El repositorio ya filtra por `usuarioId`, así que
 * nadie puede soltar el candado de otro.
 */
export const liberarBloqueo = async (
  slug: string,
  ambito: Ambito,
  usuarioId: string
): Promise<{ liberado: boolean }> => {
  const filas = await BloqueoEdicionRepository.liberar(ambito, slug, usuarioId);
  return { liberado: filas > 0 };
};
