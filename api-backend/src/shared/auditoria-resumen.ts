import type { AccionAuditable, EntidadAuditable } from '../infrastructure/db/models/content-audit-log';
import type { CampoModificado } from '../repositories/auditoria.repository';

/**
 * La frase que lee quien audita, construida aquí y no en la pantalla.
 *
 * La columna «Cambios» enseñaba el campo crudo —`status: active`,
 * `expiration_date: 2026-09-20T00:00:00.000Z`—: correcto como dato, ilegible como
 * bitácora, y sin decir **sobre quién**. Quien administra no tendría que traducir
 * códigos internos ni abrir el detalle para saber qué pasó.
 *
 * Se resuelve en el backend por tres razones:
 *
 * - La bitácora la leen la tabla, el detalle y el CSV. Una sola fuente evita que
 *   cuenten tres versiones distintas de lo mismo.
 * - El correo del usuario afectado **no está en la fila**: `entidad_id` es su id, y
 *   resolverlo es una consulta, no algo que la pantalla pueda inventar.
 * - Vale para las filas que ya existen. No se guarda nada nuevo en la tabla: la frase
 *   se calcula al leer, así que los registros de ayer también quedan explicados.
 *
 * **Nada de esto se escribe en `campos_modificados`.** Esa columna es la evidencia
 * —qué campo cambió, de qué a qué— y meterle texto de presentación, o un correo que
 * nadie modificó, la convierte en algo que ya no se sostiene como prueba.
 */

/** Acciones que alguien decidió desde el panel. */
const ACCIONES_DEL_PANEL = new Set<AccionAuditable>(['actualizar', 'inactivar']);

/**
 * Campos que esta versión sabe contar en palabras.
 *
 * Mientras un cambio toque **solo** campos de esta lista, la fila se explica con una
 * frase. En cuanto toque cualquier otro se devuelve `null` y la pantalla enseña la
 * lista de campos de siempre: es preferible un texto feo a una frase que cuente la
 * mitad y esconda el resto.
 */
const CAMPOS_CON_FRASE = new Set(['status', 'expiration_date']);

/**
 * El día de una fecha, en UTC y como `YYYY-MM-DD`.
 *
 * **En UTC a propósito.** `fecha_caducidad` es un `TIMESTAMP`, pero lo que se guarda
 * ahí es un día suelto: el panel manda `2026-09-20` y Sequelize lo convierte en la
 * medianoche UTC de ese día. Leerlo con los getters locales, en Colombia (UTC-5),
 * devuelve el 19 — un día menos que el que se eligió, justo en la pantalla que existe
 * para demostrar qué se eligió.
 */
const diaUtc = (valor: unknown): string | null => {
  if (valor === null || valor === undefined) return null;

  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor.toISOString().slice(0, 10);
  }

  const texto = String(valor).trim();
  if (!texto) return null;

  // Un día suelto no pasa por `Date`: no hace falta, y así no depende de nada.
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;

  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString().slice(0, 10);
};

/** `2026-09-20` → `20/09/2026`, que es como se escribe una fecha aquí. */
const enDiaMesAno = (valor: unknown): string | null => {
  const iso = diaUtc(valor);
  if (!iso) return null;

  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
};

/**
 * Si el campo cambió de verdad.
 *
 * Hace falta porque el formulario de usuarios manda **siempre** `name`, `apellidos`,
 * `email` y `role_id`, cambien o no: sin esta comprobación, editar solo la fecha de
 * caducidad parecería un cambio de cinco campos y ninguna frase encajaría.
 *
 * La fecha se compara por día y no por texto: el «antes» llega de la base como
 * `2026-09-19T00:00:00.000Z` y el «después» del formulario como `2026-09-19`. Son el
 * mismo día escrito de dos formas, y como texto se darían por distintos.
 */
const cambioDeVerdad = ({ campo, antes, despues }: CampoModificado): boolean => {
  if (campo === 'expiration_date') return diaUtc(antes) !== diaUtc(despues);
  return JSON.stringify(antes ?? null) !== JSON.stringify(despues ?? null);
};

/** Fase 1: activar o inactivar una cuenta, con el correo de quien la tiene. */
const fraseDeEstado = (despues: unknown, email: string | null): string | null => {
  const sujeto = email ? `el usuario ${email}` : 'la cuenta';

  if (despues === 'active') return `Se activó ${sujeto}`;
  if (despues === 'inactive') return `Se inactivó ${sujeto}`;
  return null;
};

/** Fase 2: la fecha de caducidad, de la que era a la que quedó. */
const fraseDeCaducidad = (antes: unknown, despues: unknown): string | null => {
  const desde = enDiaMesAno(antes);
  const hasta = enDiaMesAno(despues);

  if (desde && hasta) return `Se actualizó la fecha de caducidad de ${desde} a ${hasta}`;
  if (hasta) return `Se asignó la fecha de caducidad ${hasta}`;
  if (desde) return `Se quitó la fecha de caducidad, que era ${desde}`;
  return null;
};

export interface DatosDelResumen {
  accion: AccionAuditable;
  entidadTipo: EntidadAuditable;
  camposModificados: CampoModificado[];
  /** Correo de la cuenta sobre la que se actuó, ya resuelto. */
  emailAfectado?: string | null;
}

/**
 * La frase de una entrada, o `null` si esta versión no sabe contarla.
 *
 * `null` no es un fallo: es «que lo cuente quien ya lo contaba». La pantalla conserva
 * su camino de siempre, y cada fase nueva mueve un caso más a este lado.
 *
 * Basta con que **un** campo del cambio se resista para devolver `null` entero. Una
 * frase que hable de la fecha y se calle el estado es peor que la lista cruda: quien
 * audita leería como completo un resumen que no lo es.
 */
export const resumenDeRegistro = (datos: DatosDelResumen): string | null => {
  if (datos.entidadTipo !== 'usuario') return null;

  // `expirar` también deja `status: inactive`, pero eso no lo decidió nadie: se
  // cumplió una fecha. Contarlo como «se inactivó el usuario» le atribuiría a una
  // persona algo que hizo el sistema.
  if (!ACCIONES_DEL_PANEL.has(datos.accion)) return null;

  const cambios = (datos.camposModificados ?? []).filter(cambioDeVerdad);
  if (cambios.length === 0) return null;
  if (cambios.some(({ campo }) => !CAMPOS_CON_FRASE.has(campo))) return null;

  const email = datos.emailAfectado?.trim() || null;
  const frases: string[] = [];

  for (const { campo, antes, despues } of cambios) {
    const frase = campo === 'status' ? fraseDeEstado(despues, email) : fraseDeCaducidad(antes, despues);
    if (!frase) return null;
    frases.push(frase);
  }

  return frases.join(' · ');
};

/**
 * El correo que la propia fila recuerda, para cuando la cuenta ya no existe.
 *
 * El formulario de edición manda el correo en cada guardado, así que muchas filas lo
 * llevan aunque no cambiara. Es el último recurso: mientras la cuenta viva, el correo
 * bueno es el que devuelve la consulta y no el que quedó congelado en la fila.
 */
export const emailEnLaFila = (campos: CampoModificado[]): string | null => {
  const campo = campos.find((c) => c.campo === 'email');
  const valor = campo?.despues ?? campo?.antes;
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
};
