import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';

export interface RegistrarVisitaParams {
  slug: string;
  ambito: Ambito;
}

export interface RegistrarVisitaResultado {
  ok: boolean;
  slug: string;
  ambito: string;
  visitas?: number;
}

/**
 * Incrementa en 1 el contador de visitas de una página según su slug y ámbito.
 * Es tolerante a fallos: si la página no existe, responde ok: false sin error 500.
 */
export async function registrarVisita({
  slug,
  ambito,
}: RegistrarVisitaParams): Promise<RegistrarVisitaResultado> {
  const slugLimpio = (slug || '').trim().replace(/^\/+/, '');
  if (!slugLimpio) {
    return { ok: false, slug, ambito };
  }

  const nuevoTotal = await PaginaRepository.incrementarVisitas(slugLimpio, ambito);
  if (nuevoTotal === null) {
    return { ok: false, slug: slugLimpio, ambito };
  }

  return {
    ok: true,
    slug: slugLimpio,
    ambito,
    visitas: nuevoTotal,
  };
}
