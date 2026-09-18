/**
 * Cliente HTTP del panel de administración.
 *
 * ## Qué problema resuelve
 *
 * Cada servicio del panel hacía su propio `fetch` y **ninguno miraba el 401**. Cuando la
 * sesión dejaba de valer —caducada, o el token ya no lo acepta la API— el resultado era
 * una pantalla en blanco: el caparazón del panel se pintaba (eso lo decide una cookie),
 * las listas quedaban vacías y no aparecía ni un mensaje. Quien lo sufría creía que la
 * base de datos estaba caída.
 *
 * Aquí el 401 se trata **una vez y en un solo sitio**: se cierra la sesión y se manda al
 * login diciendo qué pasó, en vez de dejar cada pantalla resolviéndolo por su cuenta (o,
 * como ocurría, sin resolverlo).
 *
 * ## Por qué el 403 NO se trata igual
 *
 * 401 y 403 se parecen y significan cosas opuestas para quien está delante:
 *
 * - **401** — «ya no sé quién eres». Se arregla volviendo a entrar. Redirige.
 * - **403** — «sé quién eres y esto no te toca». Volver a entrar no cambia nada, y
 *   sacar a alguien al login por pedir una pantalla vedada es una trampa: vuelve a
 *   entrar, cae en lo mismo y se repite el ciclo.
 *
 * Por eso el 403 no redirige: se devuelve marcado (`sinPermiso`) para que la pantalla lo
 * explique. Es el criterio que `auditoria.service.ts` ya aplicaba para la bitácora.
 *
 * @see 3-seguridad-del-proyecto.md §S3 (La API es la única que emite y valida el JWT)
 */
import { PARAM_MOTIVO, MOTIVO_SESION_EXPIRADA } from './auth-cookies';

/**
 * Fallo de una llamada al panel, ya clasificado.
 *
 * `mensaje` está escrito para enseñarse tal cual: la pantalla no tiene que traducir
 * códigos, y así el mismo fallo se cuenta igual en todas.
 */
export class ErrorApi extends Error {
  /** 403: la sesión es válida pero el rol no alcanza. NO se arregla volviendo a entrar. */
  readonly sinPermiso: boolean;
  /** 401: la sesión dejó de valer. Ya se está redirigiendo al login. */
  readonly sesionExpirada: boolean;
  readonly estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.sinPermiso = estado === 403;
    this.sesionExpirada = estado === 401;
  }
}

/**
 * Cierra la sesión en el navegador y lleva al login explicando el motivo.
 *
 * Se conserva la ruta actual en `redirect` para volver a ella después de entrar: sin
 * eso, quien estaba a mitad de una tarea aterriza en el panel general y tiene que
 * buscar otra vez dónde estaba.
 *
 * `replace` y no `assign`: la página cuya sesión ya no vale no debe quedar en el
 * historial, o el botón «atrás» devuelve a una pantalla que volverá a fallar.
 */
let redirigiendo = false;
export function alLoginPorSesionExpirada(): void {
  if (typeof window === 'undefined') return;

  // Una pantalla lanza varias peticiones a la vez y todas fallan juntas: sin este
  // cerrojo, cada una dispara su propia redirección y se pisan entre ellas.
  if (redirigiendo) return;
  redirigiendo = true;

  const destino = new URL('/login', window.location.origin);
  destino.searchParams.set('redirect', window.location.pathname);
  destino.searchParams.set(PARAM_MOTIVO, MOTIVO_SESION_EXPIRADA);

  // Se pide el cierre de sesión al servidor para que borre las cookies HttpOnly, que
  // el JavaScript de la página no puede tocar. Si la llamada falla no se abandona la
  // redirección: el middleware las limpia igualmente al llegar al login.
  void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    .catch(() => undefined)
    .finally(() => window.location.replace(destino.toString()));
}

/**
 * Cierra la sesión **sin** sacar a nadie de donde está.
 *
 * Para las páginas públicas: los botones de edición viven en ellas, así que un 401 puede
 * significar «eres un visitante anónimo» —lo normal— o «tu sesión se murió». En los dos
 * casos hay que dejar de afirmar que hay sesión, pero en ninguno se puede redirigir:
 * echar al login a quien solo estaba leyendo el portal sería absurdo.
 *
 * Sirve además para el síntoma concreto de la sesión caducada: sin esto, `sitio_role`
 * sobrevivía y el botón «Editar» —que se decide con esa cookie— seguía a la vista,
 * mientras «Eliminar» y «Nueva sección» —que se deciden preguntando a la API—
 * desaparecían. Borrándola, la interfaz vuelve a ser coherente: o están todos, o ninguno.
 */
let cerrandoLocal = false;
export async function cerrarSesionLocal(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (cerrandoLocal) return;
  cerrandoLocal = true;

  try {
    // El servidor es quien puede borrar las HttpOnly; de paso limpia las legibles.
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // Sin conexión no se puede confirmar el cierre. No se insiste: la próxima
    // petición volverá a dar 401 y se reintentará entonces.
  } finally {
    cerrandoLocal = false;
  }
}

/** Mensaje por defecto según el código, para no repetirlo en cada servicio. */
const mensajePara = (estado: number): string => {
  if (estado === 401) return 'Tu sesión expiró. Te llevamos al inicio de sesión.';
  if (estado === 403) return 'Tu rol no tiene acceso a esta información.';
  if (estado === 404) return 'No encontramos lo que buscabas.';
  if (estado >= 500) return 'El servidor no pudo responder. Inténtalo de nuevo en un momento.';
  return 'No se pudo cargar la información.';
};

/**
 * Hace la petición al proxy de Next (`/api/...`) y devuelve el JSON.
 *
 * Siempre con `credentials: 'include'`: la sesión viaja en una cookie HttpOnly y sin
 * esto el navegador no la manda.
 *
 * Lanza `ErrorApi` en cualquier respuesta que no sea correcta — nunca devuelve `null`
 * silencioso, que es lo que dejaba las pantallas vacías sin explicación.
 */
export async function pedirJson<T>(ruta: string, init?: RequestInit): Promise<T> {
  let respuesta: Response;

  try {
    respuesta = await fetch(ruta, { credentials: 'include', ...init });
  } catch {
    // Falla la red o la API no está levantada. Es distinto de «el servidor dijo que
    // no» y merece un mensaje propio: aquí no hay nada que el usuario pueda corregir
    // volviendo a entrar.
    throw new ErrorApi('No pudimos conectar con el servidor. Revisa tu conexión.', 0);
  }

  if (respuesta.status === 401) {
    alLoginPorSesionExpirada();
    throw new ErrorApi(mensajePara(401), 401);
  }

  if (!respuesta.ok) {
    // Si la API explicó el fallo, se prefiere su mensaje: sabe más que esta capa.
    let mensaje = mensajePara(respuesta.status);
    try {
      const cuerpo = await respuesta.json();
      if (cuerpo && typeof cuerpo.error === 'string') mensaje = cuerpo.error;
    } catch {
      // Respuesta sin JSON (un 502 de nginx, por ejemplo): queda el mensaje por defecto.
    }
    throw new ErrorApi(mensaje, respuesta.status);
  }

  // 204 y demás respuestas sin cuerpo: `res.json()` reventaría.
  if (respuesta.status === 204) return undefined as T;

  return respuesta.json() as Promise<T>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const apiClient = {
  baseUrl: API_BASE_URL,
  get: <T>(ruta: string) => pedirJson<T>(ruta),
  post: <T>(ruta: string, cuerpo?: unknown) =>
    pedirJson<T>(ruta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    }),
};
