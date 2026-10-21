/**
 * Cierre de sesión por inactividad — el reloj, compartido por las dos aplicaciones.
 *
 * Aquí viven el reloj y el diálogo del aviso, que las dos aplicaciones necesitan
 * idénticos. Lo que **no** está aquí es el cierre: `sitio-web` llama a su route handler,
 * la intranet usa `useAuth().logout()`, y las dos van a su `/login`. Eso lo
 * pone cada una en su `vigilante-sesion.tsx`, que es la única pieza que difiere.
 *
 * El corte está donde estaba la diferencia real, no donde estaba la tecnología: el
 * modal se pinta igual en las dos —`.olo-modal*` y `.sr-only` existen en ambos
 * `globals.css`— y duplicarlo solo garantizaba que acabaran divergiendo.
 *
 * Lo que este archivo sí garantiza es que las dos aplicaciones cuenten igual: mismo
 * umbral, mismos eventos considerados «actividad» y mismo comportamiento entre
 * pestañas. Cuando eso se duplica, diverge — al proyecto ya le pasó con los cinco
 * menús de la intranet.
 *
 * **Esto es experiencia de usuario, no seguridad.** Quien robe la cookie no ejecuta
 * este código. El cierre real lo hace la API comprobando `usuarios.ultimo_acceso_en`;
 * ver `api-backend/src/middlewares/auth.middleware.ts`.
 */

/**
 * Minutos sin actividad antes de cerrar la sesión.
 *
 * 15 es el valor habitual en paneles administrativos que manejan datos personales, y
 * es el mismo número que el proyecto ya usa para el bloqueo tras cinco intentos
 * fallidos (`4-reglas.md` §3). Tener dos umbrales de sesión distintos sin motivo solo
 * complica explicarlos.
 */
export const MINUTOS_DE_INACTIVIDAD = 15;

/** Segundos de aviso antes del cierre. Suficiente para volver a la mesa y guardar. */
export const SEGUNDOS_DE_AVISO = 60;

export const MS_DE_INACTIVIDAD = MINUTOS_DE_INACTIVIDAD * 60 * 1000;
export const MS_DE_AVISO = SEGUNDOS_DE_AVISO * 1000;

/**
 * Clave de `localStorage` donde se anota la última actividad.
 *
 * `localStorage` se comparte entre pestañas del mismo origen, que es justo lo que hace
 * falta: sin esto, tener el panel abierto en dos pestañas cerraba la sesión desde la
 * que estaba quieta mientras se trabajaba en la otra. Y como la cookie es una sola, ese
 * cierre se llevaba por delante las dos.
 *
 * El prefijo evita que `sitio-web` y la intranet se pisen: en desarrollo comparten
 * `localhost` y el almacenamiento no distingue por puerto, igual que las cookies — el
 * mismo motivo por el que existe `sitio_token` (ver `sitio-web/src/shared/lib/session/auth-cookies.ts`).
 */
export const claveDeActividad = (ambito: string) => `olo:${ambito}:ultima-actividad`;

/**
 * Eventos que cuentan como «sigo aquí».
 *
 * `pointerdown` cubre ratón, dedo y lápiz de una vez. `scroll` entra porque leer una
 * tabla larga es actividad aunque no se pulse nada. No se escucha `mousemove`: dispara
 * cientos de veces por segundo y bastaría con un ratón apoyado en una mesa que tiembla
 * para mantener la sesión viva sin nadie delante — que es exactamente lo que esto
 * pretende evitar.
 */
const EVENTOS_DE_ACTIVIDAD = ['pointerdown', 'keydown', 'scroll', 'wheel'] as const;

export interface OpcionesDelVigilante {
  /** Distingue el almacenamiento de cada app. Por ejemplo `'sitio'` o `'intranet'`. */
  ambito: string;
  /** Se llama al entrar en la ventana de aviso, con los ms que quedan. */
  alAvisar: (msRestantes: number) => void;
  /** Se llama si la actividad vuelve durante el aviso. */
  alCancelarAviso: () => void;
  /** Se llama al agotarse el tiempo. */
  alExpirar: () => void;
  /** Sobrescribe el umbral. Solo para pruebas; en producción se deja el de arriba. */
  msDeInactividad?: number;
  /** Sobrescribe la antelación del aviso. Solo para pruebas. */
  msDeAviso?: number;
}

export interface Vigilante {
  /** Quita los listeners y cancela los temporizadores. Idempotente. */
  detener: () => void;
  /** Marca actividad a mano, por ejemplo al pulsar «Seguir trabajando». */
  registrarActividad: () => void;
}

/**
 * Arranca la vigilancia y devuelve con qué pararla.
 *
 * Cómo cuenta el tiempo, que es donde están las trampas:
 *
 *  - Se guarda **el instante** de la última actividad y se compara contra `Date.now()`
 *    en cada disparo. No se descuenta con un `setInterval`, porque los navegadores
 *    ralentizan los temporizadores en pestañas de fondo y suspenden el equipo entero
 *    al cerrar la tapa: un contador que va restando llegaría tarde o no llegaría. Con
 *    marcas de tiempo, un portátil dormido tres horas despierta con la sesión ya
 *    vencida, que es lo correcto.
 *  - Cada disparo **reprograma** el siguiente en vez de asumir que llegó a su hora. Si
 *    el navegador lo despertó tarde, la comparación con el reloj lo detecta y expira en
 *    ese mismo momento.
 *  - El temporizador se reprograma, no se recrea en cada evento: `pointerdown` y
 *    `scroll` llegan a decenas por segundo y crear un `setTimeout` por cada uno sería
 *    trabajo tirado. Se limita a escribir la marca, y el temporizador que ya está en
 *    marcha lee esa marca cuando le toca.
 */
export const crearVigilanteDeInactividad = (opciones: OpcionesDelVigilante): Vigilante => {
  const {
    ambito,
    alAvisar,
    alCancelarAviso,
    alExpirar,
    msDeInactividad = MS_DE_INACTIVIDAD,
    msDeAviso = MS_DE_AVISO,
  } = opciones;

  const clave = claveDeActividad(ambito);

  let temporizador: ReturnType<typeof setTimeout> | null = null;
  let avisando = false;
  let detenido = false;
  // Copia en memoria: si `localStorage` no está disponible —modo privado de algunos
  // navegadores, o política corporativa— el vigilante sigue funcionando dentro de su
  // pestaña. Se pierde la coordinación entre pestañas, no la función entera.
  let ultimaActividadLocal = Date.now();

  const leerUltimaActividad = (): number => {
    try {
      const guardado = window.localStorage.getItem(clave);
      const valor = guardado ? Number.parseInt(guardado, 10) : NaN;
      // Una marca del futuro solo puede venir de un reloj movido o de basura en el
      // almacén; tratarla como buena dejaría la sesión abierta para siempre.
      if (Number.isFinite(valor) && valor <= Date.now()) {
        return Math.max(valor, ultimaActividadLocal);
      }
    } catch {
      // Sin almacenamiento se sigue con la copia en memoria.
    }
    return ultimaActividadLocal;
  };

  const escribirUltimaActividad = (instante: number) => {
    ultimaActividadLocal = instante;
    try {
      window.localStorage.setItem(clave, String(instante));
    } catch {
      // Ver `leerUltimaActividad`.
    }
  };

  const revisar = () => {
    if (detenido) return;

    const inactivoDesdeHace = Date.now() - leerUltimaActividad();
    const msParaExpirar = msDeInactividad - inactivoDesdeHace;

    if (msParaExpirar <= 0) {
      avisando = false;
      alExpirar();
      return;
    }

    if (msParaExpirar <= msDeAviso) {
      // `alAvisar` se llama en cada revisión mientras dura la ventana para que la
      // cuenta atrás de la interfaz se refresque con el tiempo real y no con el suyo.
      avisando = true;
      alAvisar(msParaExpirar);
      // Un segundo: es la resolución que necesita un contador en pantalla, y solo
      // corre durante el último minuto.
      programar(1000);
      return;
    }

    if (avisando) {
      // Hubo actividad durante el aviso: la ventana ya no aplica.
      avisando = false;
      alCancelarAviso();
    }

    // Se despierta justo cuando empezaría el aviso. Entre medias no hace nada.
    programar(msParaExpirar - msDeAviso);
  };

  function programar(ms: number) {
    if (temporizador !== null) clearTimeout(temporizador);
    temporizador = setTimeout(revisar, Math.max(ms, 0));
  }

  const registrarActividad = () => {
    if (detenido) return;
    escribirUltimaActividad(Date.now());
    // Durante el aviso se revisa de inmediato para retirar el modal sin esperar al
    // siguiente tic. Fuera de él no hace falta: el temporizador ya leerá la marca
    // nueva cuando despierte.
    if (avisando) revisar();
  };

  const alCambiarOtraPestana = (evento: StorageEvent) => {
    if (evento.key !== clave || detenido) return;
    // Otra pestaña reportó actividad. Se revisa por si estábamos avisando.
    if (avisando) revisar();
  };

  const alCambiarVisibilidad = () => {
    // Volver a la pestaña no es actividad —puede ser el navegador restaurando la
    // ventana—, pero sí es el momento de comprobar si el tiempo ya venció mientras
    // estaba de fondo, donde los temporizadores van al ralentí.
    if (document.visibilityState === 'visible') revisar();
  };

  for (const evento of EVENTOS_DE_ACTIVIDAD) {
    document.addEventListener(evento, registrarActividad, { passive: true });
  }
  document.addEventListener('visibilitychange', alCambiarVisibilidad);
  window.addEventListener('storage', alCambiarOtraPestana);

  escribirUltimaActividad(Date.now());
  programar(msDeInactividad - msDeAviso);

  return {
    detener: () => {
      detenido = true;
      if (temporizador !== null) clearTimeout(temporizador);
      temporizador = null;
      for (const evento of EVENTOS_DE_ACTIVIDAD) {
        document.removeEventListener(evento, registrarActividad);
      }
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('storage', alCambiarOtraPestana);
    },
    registrarActividad,
  };
};

/** Segundos que faltan, redondeados hacia arriba, para pintar la cuenta atrás. */
export const segundosRestantes = (msRestantes: number): number =>
  Math.max(0, Math.ceil(msRestantes / 1000));

/** `0:47` — formato de la cuenta atrás. */
export const formatearCuentaAtras = (msRestantes: number): string => {
  const total = segundosRestantes(msRestantes);
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${minutos}:${String(segundos).padStart(2, '0')}`;
};

/**
 * Motivo con el que se llega al login. Viaja en la URL (`?motivo=`) y decide qué
 * mensaje se pinta.
 */
export const MOTIVO_INACTIVIDAD = 'inactividad';

/** El cierre ocurrió con cambios del editor que no se pudieron guardar. */
export const MOTIVO_INACTIVIDAD_SIN_GUARDAR = 'inactividad-sin-guardar';

/**
 * El modal del aviso. Se exporta desde aquí para que las dos aplicaciones pinten el
 * mismo diálogo; lo que cada una decide es qué hace al cerrarse.
 */
export { ModalInactividad } from './modal-inactividad';
