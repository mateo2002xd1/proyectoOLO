/**
 * El sonido de los avisos flotantes del panel (`Notification`) y el de las alertas que
 * llegan a la campana de Notificaciones (`alerta`).
 *
 * Un tono corto por estado: el de éxito sube, el de advertencia se repite y el de error
 * baja. Se sintetizan con Web Audio en el momento, sin archivos de audio: no hay nada que
 * descargar, cachear ni licenciar. El aviso informativo (`info`) no suena, porque es el
 * que menos pide la atención.
 *
 * Duran menos de medio segundo, así que no les aplica el control de audio de WCAG 1.4.2
 * (sonidos de más de 3 s); aun así cada persona puede silenciarlos en Configuración. La
 * preferencia es del navegador, como el tema (`CLAVE_TEMA`), y no de la cuenta: quien
 * comparte la oficina quiere silencio en ese equipo, no en todos.
 *
 * El navegador solo deja sonar una página con la que la persona ya interactuó. Los avisos
 * llegan siempre después de un clic (guardar, borrar), así que suenan; si no lo hubo, no
 * suenan y el aviso se ve igual.
 */

/** Dónde se guarda la preferencia. Solo se escribe `'apagado'`: sin valor, suena. */
export const CLAVE_SONIDO_AVISOS = 'olo-sonido-avisos';

/** Avisa a los suscriptores de esta pestaña; las demás se enteran por el evento `storage`. */
const EVENTO_CAMBIO = 'olo-sonido-avisos-cambio';

interface Nota {
  /** Frecuencia en hercios. */
  hz: number;
  /** Segundos desde el comienzo del sonido. */
  desde: number;
  /** Segundos hasta que se apaga. */
  dura: number;
}

interface Sonido {
  onda: OscillatorType;
  notas: Nota[];
}

const SONIDOS = {
  // Sube una quinta (mi → si): «hecho».
  success: {
    onda: 'sine',
    notas: [
      { hz: 659.25, desde: 0, dura: 0.16 },
      { hz: 987.77, desde: 0.09, dura: 0.3 },
    ],
  },
  // La misma nota dos veces (la): «ojo».
  warning: {
    onda: 'triangle',
    notas: [
      { hz: 880, desde: 0, dura: 0.12 },
      { hz: 880, desde: 0.17, dura: 0.12 },
    ],
  },
  // Campanita de dos notas (sol → do, una cuarta arriba), suave y algo más larga que las
  // demás: «te llegó algo». La toca la campana de Notificaciones cuando aparece una alerta
  // nueva sin recargar (pedido del usuario, 2026-10-15).
  alerta: {
    onda: 'sine',
    notas: [
      { hz: 783.99, desde: 0, dura: 0.22 },
      { hz: 1046.5, desde: 0.14, dura: 0.42 },
    ],
  },
  // Baja un tritono (do → fa#) y queda más grave: «no se pudo».
  error: {
    onda: 'triangle',
    notas: [
      { hz: 523.25, desde: 0, dura: 0.16 },
      { hz: 369.99, desde: 0.13, dura: 0.32 },
    ],
  },
} satisfies Record<string, Sonido>;

export type TipoConSonido = keyof typeof SONIDOS;

/** Pico de cada nota, sobre 1. Se oye sin tapar lo que suene en el equipo. */
const VOLUMEN = 0.18;

/** Si el navegador tarda más que esto en dejar sonar, el aviso ya pasó: mejor callar. */
const ESPERA_MAXIMA_MS = 300;

/** Cuando el navegador no deja usar `localStorage`, la preferencia vive hasta recargar. */
let preferenciaEnMemoria = true;

export function sonidoAvisosActivo(): boolean {
  try {
    return localStorage.getItem(CLAVE_SONIDO_AVISOS) !== 'apagado';
  } catch {
    return preferenciaEnMemoria;
  }
}

export function cambiarSonidoAvisos(activo: boolean): void {
  preferenciaEnMemoria = activo;
  try {
    if (activo) localStorage.removeItem(CLAVE_SONIDO_AVISOS);
    else localStorage.setItem(CLAVE_SONIDO_AVISOS, 'apagado');
  } catch {
    // Navegación privada o almacenamiento bloqueado: queda `preferenciaEnMemoria`.
  }
  window.dispatchEvent(new Event(EVENTO_CAMBIO));
}

/** Para `useSyncExternalStore`: avisa del cambio hecho en esta pestaña y en las demás. */
export function suscribirSonidoAvisos(alCambiar: () => void): () => void {
  const porOtraPestana = (evento: StorageEvent) => {
    if (evento.key === CLAVE_SONIDO_AVISOS || evento.key === null) alCambiar();
  };
  window.addEventListener(EVENTO_CAMBIO, alCambiar);
  window.addEventListener('storage', porOtraPestana);
  return () => {
    window.removeEventListener(EVENTO_CAMBIO, alCambiar);
    window.removeEventListener('storage', porOtraPestana);
  };
}

let contexto: AudioContext | null = null;

function contextoDeAudio(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  contexto ??= new AudioContext();
  return contexto;
}

function tocarNota(ctx: AudioContext, onda: OscillatorType, { hz, desde, dura }: Nota, inicio: number) {
  const t = inicio + desde;
  const oscilador = ctx.createOscillator();
  const volumen = ctx.createGain();
  oscilador.type = onda;
  oscilador.frequency.value = hz;
  // Entrada y salida en rampa: un corte seco suena a «clic».
  volumen.gain.setValueAtTime(0.0001, t);
  volumen.gain.exponentialRampToValueAtTime(VOLUMEN, t + 0.015);
  volumen.gain.exponentialRampToValueAtTime(0.0001, t + dura);
  oscilador.connect(volumen).connect(ctx.destination);
  oscilador.start(t);
  oscilador.stop(t + dura + 0.02);
}

/** Toca el sonido aunque esté silenciado: es la muestra que se escucha en Configuración. */
export async function tocarSonidoAviso(tipo: TipoConSonido): Promise<void> {
  const ctx = contextoDeAudio();
  if (!ctx) return;
  try {
    if (ctx.state !== 'running') {
      const pedido = performance.now();
      await ctx.resume();
      if (performance.now() - pedido > ESPERA_MAXIMA_MS) return;
    }
    const { onda, notas } = SONIDOS[tipo];
    const inicio = ctx.currentTime + 0.01;
    for (const nota of notas) tocarNota(ctx, onda, nota, inicio);
  } catch {
    // Sin salida de audio o con el contexto cerrado: el aviso se ve igual.
  }
}

/** El sonido del aviso, si la persona no lo silenció. */
export function reproducirSonidoAviso(tipo: TipoConSonido | 'info'): void {
  if (tipo === 'info' || !sonidoAvisosActivo()) return;
  void tocarSonidoAviso(tipo);
}

/**
 * Safari solo deja arrancar el audio dentro de un gesto, y el aviso aparece después,
 * cuando responde la API. Con el primer clic o tecla de la página se prepara el contexto,
 * y el aviso que llegue luego ya puede sonar. Si está silenciado no se crea nada.
 */
function prepararConElPrimerGesto() {
  if (typeof window === 'undefined') return;
  const preparar = () => {
    window.removeEventListener('pointerdown', preparar, true);
    window.removeEventListener('keydown', preparar, true);
    if (sonidoAvisosActivo()) contextoDeAudio()?.resume().catch(() => {});
  };
  window.addEventListener('pointerdown', preparar, true);
  window.addEventListener('keydown', preparar, true);
}

prepararConElPrimerGesto();
