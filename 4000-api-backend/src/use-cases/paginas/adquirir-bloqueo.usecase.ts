import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';
import { paginasPolicies } from '../../policies/paginas.policies';
import type { Ambito } from '../../shared/ambito';

/**
 * Cuánto vale un candado sin dar señales de vida.
 *
 * Corto a propósito: es lo que tarda en liberarse una página cuya pestaña se cerró
 * de golpe (o cuyo portátil se suspendió), y durante ese rato nadie más puede
 * entrar. El editor lo renueva cada 45 s (`MS_ENTRE_LATIDOS` en los dos
 * `use-bloqueo-de-edicion.ts`, menos de la mitad de este plazo), bastante antes de que
 * caduque, así que a quien está trabajando de verdad no se le cae nunca. Si se cambia
 * uno de los dos valores, hay que mirar el otro.
 */
export const MINUTOS_DE_BLOQUEO = 2;

export interface ResultadoDeBloqueo {
  /** `true` si el candado quedó a nombre de quien lo pidió. */
  propio: boolean;
  expiraEn: Date | null;
  /** Solo cuando `propio` es `false`: quién lo tiene. */
  bloqueadoPor: { nombre: string } | null;
  /** Si a quien pregunta le saldría el botón de «Entrar de todos modos». */
  puedeForzar: boolean;
}

interface Datos {
  slug: string;
  ambito: Ambito;
  usuarioId: string;
  usuarioNombre: string;
  rol?: string | null;
  forzar?: boolean;
}

/**
 * Pide (o renueva) el candado de edición de una página.
 *
 * No lanza cuando el candado es de otro: eso no es un error del sistema sino una
 * respuesta legítima, y quien llama necesita saber de quién es para poder decirlo en
 * pantalla. El controlador lo traduce a un 409 con el nombre dentro.
 *
 * `forzar` solo se obedece si el rol puede, y esa comprobación va aquí y no en el
 * router: es una regla de negocio sobre el trabajo ajeno, no un permiso de ruta.
 */
export const adquirirBloqueo = async ({
  slug,
  ambito,
  usuarioId,
  usuarioNombre,
  rol,
  forzar = false,
}: Datos): Promise<ResultadoDeBloqueo> => {
  const puedeForzar = paginasPolicies.puedeForzarBloqueo(rol);

  const fila = await BloqueoEdicionRepository.adquirir({
    ambito,
    slug,
    usuarioId,
    usuarioNombre,
    minutos: MINUTOS_DE_BLOQUEO,
    // Pedir forzar sin poder hacerlo no es un 403: es una petición normal de
    // candado, que fallará si de verdad lo tiene otro.
    forzar: forzar && puedeForzar,
  });

  if (fila) {
    return { propio: true, expiraEn: fila.expira_en, bloqueadoPor: null, puedeForzar };
  }

  // No se consiguió: alguien lo tiene y sigue vigente. Se relee para poder decir
  // quién —entre el INSERT y esta consulta pudo caducar, y entonces no hay nadie
  // dentro y quien pregunta puede reintentar sin más.
  const dueño = await BloqueoEdicionRepository.vigente(ambito, slug);

  return {
    propio: false,
    expiraEn: dueño?.expira_en ?? null,
    bloqueadoPor: { nombre: dueño?.usuario_nombre ?? 'Otra persona' },
    puedeForzar,
  };
};
