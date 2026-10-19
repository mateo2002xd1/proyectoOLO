/**
 * Llamadas de la etapa de edición: leer lo editable, guardar borradores, registrar
 * subidas, enviar a revisión y el candado de edición.
 *
 * Etapa 1 del ciclo editorial (`8-ciclo-editorial.md` §3.2). Va siempre con sesión y
 * nunca se cachea (regla 4 del plan).
 */
import { apiConSesion as api } from '../../model/api-con-sesion';
import { CABECERAS_DEL_SITIO } from '../../model/ambito';
import { notificarRevisionActualizada } from '../../model/eventos';
import type { Pagina, PaginaVersion, PaginaEditable, Bloque, PuckData } from '../../model/pagina.types';

/**
 * Contenido editable para el editor: última versión (borrador/en_revisión/
 * publicado/rechazado), no solo la publicada. Nunca 404 — si la página aún no
 * existe, el backend devuelve contenido vacío para arrancar en limpio.
 */
export async function obtenerPaginaEditable(slug: string): Promise<PaginaEditable | null> {
  try {
    const { data } = await api.get(`/api/paginas/${slug}/editable`);
    return data;
  } catch {
    return null;
  }
}

/**
 * `automatico` es el autoguardado del editor: la bitácora lo escribe como
 * `autoguardar_borrador` y la API no deja que saque de la cola una versión en revisión.
 */
export async function guardarBorrador(
  slug: string,
  contenido: PuckData | Bloque[],
  { automatico = false }: { automatico?: boolean } = {}
): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.post(
    `/api/paginas/${slug}/borrador`,
    automatico ? { contenido, automatico } : { contenido }
  );
  return data;
}

/**
 * Anota que `ruta` se subió para esta página, para que al publicarla se borre si
 * ninguna versión la usa. Si falla, la subida sigue sirviendo igual.
 */
export async function registrarSubidaPendiente(slug: string, ruta: string): Promise<void> {
  await api.post(`/api/paginas/${slug}/subidas`, { ruta }).catch(() => undefined);
}

/**
 * `comentario` es el «commit» del envío: la API lo exige (10 a 100 caracteres), lo
 * guarda con la versión y lo deja en la bitácora de auditoría.
 *
 * `contenido` es lo que hay en el editor. Viaja en la misma petición y la API lo guarda
 * y lo envía de una vez: antes se guardaba aparte justo antes, y cada envío dejaba en
 * la bitácora un «guardar borrador» que nadie había pulsado.
 */
export async function enviarARevision(
  slug: string,
  comentario: string,
  contenido?: PuckData | Bloque[]
): Promise<{ pagina: Pagina; version: PaginaVersion }> {
  const { data } = await api.patch(
    `/api/paginas/${slug}/enviar-revision`,
    contenido === undefined ? { comentario } : { comentario, contenido }
  );
  notificarRevisionActualizada({ slug });
  return data;
}

/** Lo que responde la API al pedir el candado de edición. */
export interface EstadoDelBloqueo {
  /** `true` si el candado quedó a nombre de quien lo pidió. */
  propio: boolean;
  /** Solo cuando no es propio: quién lo tiene abierto. */
  bloqueadoPor: { nombre: string } | null;
  /** Si a esta persona le sale «Entrar de todos modos». */
  puedeForzar: boolean;
}

/**
 * Pide o renueva el candado de edición de una página.
 *
 * El 409 —«la tiene otra persona»— no es un fallo que haya que propagar: es una de
 * las dos respuestas normales, y trae dentro el nombre de quien está editando, que es
 * justo lo que hay que enseñar. Por eso se traduce a un objeto y no a una excepción.
 * Cualquier otro error sí sube, porque ahí sí pasa algo raro.
 */
export async function adquirirBloqueo(
  slug: string,
  forzar = false
): Promise<EstadoDelBloqueo> {
  try {
    const { data } = await api.post(`/api/paginas/${slug}/bloqueo`, { forzar });
    return data;
  } catch (fallo) {
    const respuesta = (fallo as { response?: { status?: number; data?: Partial<EstadoDelBloqueo> } })
      ?.response;
    if (respuesta?.status === 409) {
      return {
        propio: false,
        bloqueadoPor: respuesta.data?.bloqueadoPor ?? { nombre: 'Otra persona' },
        puedeForzar: respuesta.data?.puedeForzar === true,
      };
    }
    throw fallo;
  }
}

/**
 * Suelta el candado. No falla si ya no era suyo.
 *
 * Se llama también desde `pagehide`, así que va con `fetch` y `keepalive` en vez de
 * con axios: es lo que permite que la petición sobreviva a la pestaña que la lanzó.
 * Sin eso el navegador cancelaría el DELETE al cerrar y la página se quedaría
 * reservada hasta que el candado caducara solo.
 */
export async function liberarBloqueo(slug: string): Promise<void> {
  await fetch(`/api/backend/api/paginas/${slug}/bloqueo`, {
    method: 'DELETE',
    credentials: 'include',
    keepalive: true,
    headers: CABECERAS_DEL_SITIO,
  }).catch(() => undefined);
}

/**
 * Descarta la sesión de edición actual, limpiando las subidas pendientes de
 * la sesión. También usa `keepalive` por si se llama al cerrar la pestaña.
 */
export async function descartarEdicion(slug: string): Promise<void> {
  await fetch(`/api/backend/api/paginas/${slug}/descartar-edicion`, {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
    headers: CABECERAS_DEL_SITIO,
  }).catch(() => undefined);
}
