import type { CampoModificado, RegistroAuditoria } from '../types';

/**
 * Qué cuenta la bitácora de un registro, en palabras y no en campos internos.
 *
 * La columna «Cambios» enseñaba `slug: inicio · version: 7 · estado: en_revision`:
 * correcto, pero ilegible para quien administra el portal, y sin decir **qué** cambió.
 * Desde que enviar a revisión exige el comentario de cambios (el «commit»), la API lo
 * registra en cada paso que decide sobre una versión, siempre con el mismo sentido:
 *
 * - `antes`: el comentario de lo que estaba publicado en ese momento.
 * - `despues`: el de la versión sobre la que se actuó (enviada, aprobada, rechazada,
 *   descartada o restaurada).
 *
 * Tabla, detalle y CSV leen de aquí para no contar tres versiones distintas.
 */

/**
 * Acciones del ciclo editorial que siempre deberían llevar comentario. Un registro de
 * estas sin el campo es anterior a la regla: se dice así en vez de caer en la lista
 * de campos internos de antes.
 */
const ACCIONES_EDITORIALES = new Set(['enviar_revision', 'aprobar', 'rechazar']);

/** Acciones cuyo `motivo` lo escribió una persona; el resto lo genera el sistema. */
const MOTIVO_ESCRITO = new Set(['rechazar', 'eliminar']);

const campoDe = (registro: RegistroAuditoria, campo: string): CampoModificado | undefined =>
  registro.camposModificados.find((c) => c.campo === campo);

const comoTexto = (valor: unknown) =>
  typeof valor === 'string' && valor.trim() ? valor.trim() : null;

export interface ComentariosDelRegistro {
  /** Comentario de lo que estaba publicado. `null`: no había o no tenía. */
  anterior: string | null;
  /** Comentario de la versión sobre la que se actuó. */
  despues: string | null;
  /** Por qué se rechazó, descartó, archivó o restauró, si se registró. */
  motivo: string | null;
  /** `true` si el motivo lo escribió una persona (rechazo, descarte). */
  motivoEscrito: boolean;
  /** Registro del ciclo editorial hecho antes de que el comentario fuera obligatorio. */
  anteriorALaRegla: boolean;
}

/**
 * Los comentarios de un registro, o `null` si no es del ciclo editorial de páginas
 * (usuarios, roles, depuraciones…): esos siguen enseñando sus campos tal cual.
 */
export function comentariosDe(registro: RegistroAuditoria): ComentariosDelRegistro | null {
  const comentario = campoDe(registro, 'comentario');
  const esEditorial =
    registro.entidadTipo === 'pagina' && ACCIONES_EDITORIALES.has(registro.accion);

  if (!comentario && !esEditorial) return null;

  return {
    anterior: comoTexto(comentario?.antes),
    despues: comoTexto(comentario?.despues),
    motivo: comoTexto(campoDe(registro, 'motivo')?.despues),
    motivoEscrito: MOTIVO_ESCRITO.has(registro.accion),
    anteriorALaRegla: !comentario,
  };
}

/**
 * Qué es «anterior» y qué es «después» en cada acción, dicho en una línea.
 *
 * El sentido de los dos campos es el mismo en todas, pero «después» no se lee igual
 * en un envío que en un rechazo: sin esta línea, quien mira un rechazo podría creer
 * que el comentario rechazado quedó publicado.
 */
const EXPLICACION: Record<string, string> = {
  enviar_revision: 'Anterior: lo que estaba publicado. Después: lo que se envió a revisión.',
  aprobar: 'Anterior: lo que estaba publicado. Después: lo que se publicó en su lugar.',
  rechazar: 'Anterior: lo que sigue publicado. Después: lo que se rechazó.',
  eliminar: 'Anterior: lo que sigue publicado. Después: la versión que se descartó.',
  despublicar: 'Anterior: lo que se archivó. Después: lo que se publicó en su lugar.',
  publicar: 'Anterior: lo que estaba publicado. Después: la versión que se restauró.',
};

export const explicacionDeComentarios = (registro: RegistroAuditoria): string | null =>
  EXPLICACION[registro.accion] ?? null;

/** Lo de siempre, para los registros que no son del ciclo editorial. */
const listaDeCampos = (registro: RegistroAuditoria, separador: string) =>
  registro.camposModificados
    .map(({ campo, despues }) =>
      `${campo}: ${despues === null || despues === undefined ? '—' : typeof despues === 'string' ? despues : JSON.stringify(despues)}`,
    )
    .join(separador);

/**
 * El comentario de la versión de la que habla la fila.
 *
 * Es el «después» en todas las acciones menos en `despublicar`: esa fila cuenta que
 * se archivó la versión que estaba publicada, y su comentario es el «antes». Enseñar
 * ahí el «después» haría creer que se archivó lo que se acababa de publicar.
 */
export function comentarioPrincipal(registro: RegistroAuditoria): string | null {
  const comentarios = comentariosDe(registro);
  if (!comentarios) return null;
  return registro.accion === 'despublicar' ? comentarios.anterior : comentarios.despues;
}

/**
 * El texto de la columna «Cambios»: el comentario de la versión, y detrás el motivo
 * si lo hay. Así una aprobación o un rechazo dicen qué se aprobó o rechazó sin tener
 * que abrir el detalle.
 */
export function resumenDeCambios(registro: RegistroAuditoria, separador = ' · '): string {
  const comentarios = comentariosDe(registro);
  if (!comentarios) return listaDeCampos(registro, separador);

  const principal = comentarioPrincipal(registro);
  const partes = [
    principal
      ? `«${principal}»`
      : comentarios.anteriorALaRegla
        ? 'Sin comentario (registro anterior a los comentarios obligatorios)'
        : 'Sin comentario',
  ];
  if (comentarios.motivo) {
    partes.push(comentarios.motivoEscrito ? `Motivo: ${comentarios.motivo}` : comentarios.motivo);
  }
  return partes.join(separador);
}
