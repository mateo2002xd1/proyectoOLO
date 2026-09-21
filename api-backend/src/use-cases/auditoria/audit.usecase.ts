import { Transaction } from 'sequelize';
import {
  AuditRepository,
  type DatosAuditoria,
  type FiltrosAuditoria,
} from '../../repositories/auditoria.repository';
import { UserRepository } from '../../repositories/usuarios.repository';
import type { EntidadAuditable } from '../../infrastructure/db/models/content-audit-log';

export type { DatosAuditoria, FiltrosAuditoria };

/**
 * Registra una entrada en la bitácora (RF-07).
 *
 * **Es `async` y hay que esperarla.** Antes no lo era, y ese detalle es parte de
 * por qué la auditoría no dejaba rastro sin que nadie se enterara: al no esperar
 * la promesa, un INSERT rechazado se perdía como *unhandled rejection*.
 *
 * Si se provee una transacción (`tx`), el error no se atrapa: una falla al auditar
 * debe abortar la transacción principal. Si no se provee, se atrapa y se registra
 * en la consola para no tumbar la petición original.
 */
export const logAudit = async (datos: DatosAuditoria, tx?: Transaction): Promise<void> => {
  if (tx) {
    await AuditRepository.create(datos, tx);
    return;
  }

  try {
    await AuditRepository.create(datos);
  } catch (error) {
    // Explícito y con los datos del intento: un registro perdido tiene que dejar
    // rastro en el log aunque no rompa la petición.
    console.error(
      `[Auditoría] No se pudo registrar «${datos.accion}» sobre ${datos.entidadTipo ?? 'contenido'} ${datos.entidadId}:`,
      error
    );
  }
};

/** El «quién y desde dónde», ya extraído de la petición por `datosDeAuditoria`. */
export type ContextoAuditoria = Pick<
  DatosAuditoria,
  'usuarioId' | 'usuarioNombre' | 'ip' | 'userAgent'
>;

/**
 * Registra un cambio de contraseña (consideración 2 del proyecto, Ley 1581/2012).
 *
 * Existe como función propia porque lo llaman tres controladores distintos —primer
 * inicio, cambio voluntario y recuperación—, que hasta ahora no escribían ninguna
 * fila: se auditaba solo el cambio que hacía un administrador desde el panel, por ser
 * el único que pasaba por `usuarios.controller.ts`.
 *
 * Recibe el contexto ya extraído y no el `Request`: hacia dentro solo viajan datos.
 *
 * **La contraseña no entra aquí de ninguna forma**, ni redactada. Lo que la ley pide
 * es constancia del hecho —quién, cuándo, desde dónde—, y `via` distingue por cuál de
 * los tres caminos ocurrió.
 */
export const logCambioDePassword = (
  contexto: ContextoAuditoria,
  usuarioId: string,
  via: 'primer-inicio' | 'cambio-voluntario' | 'recuperacion'
): Promise<void> =>
  logAudit({
    ...contexto,
    entidadId: usuarioId,
    entidadTipo: 'usuario',
    accion: 'cambiar_password',
    camposModificados: [{ campo: 'via', antes: null, despues: via }],
  });

export const getAuditByContentId = (contentId: string, contentType?: string) =>
  AuditRepository.findByContentId(contentId, contentType);

export const getAllAudit = (filtros: FiltrosAuditoria) => AuditRepository.findAll(filtros);

/** Lo mínimo que hace falta de una fila para saber a qué cuenta apunta. */
type FilaConEntidad = { entidad_tipo: EntidadAuditable; entidad_id: string };

/**
 * Los correos de las cuentas de las que hablan estas filas, por id.
 *
 * La bitácora guarda en `entidad_id` el id del usuario sobre el que se actuó, nunca su
 * correo. Para que la pantalla pueda leer «se inactivó el usuario fallip@sena.edu.co»
 * hay que resolverlo, y se resuelve **de una sola consulta para toda la página**: una
 * por fila serían hasta 200 idas a la base para pintar una tabla.
 *
 * Una cuenta borrada no aparece en el resultado, y no es un error: `entidad_id` no
 * tiene clave foránea contra `usuarios`, así que sus filas sobreviven al borrado. Quien
 * consume el mapa decide qué decir cuando falta —hoy, `auditoria-resumen.ts` cae en el
 * correo que la propia fila recuerda y, si tampoco lo hay, en una frase sin correo.
 */
export const correosDeCuentasAuditadas = async (
  filas: FilaConEntidad[]
): Promise<Map<string, string>> => {
  const ids = [
    ...new Set(filas.filter((f) => f.entidad_tipo === 'usuario').map((f) => f.entidad_id)),
  ];
  if (ids.length === 0) return new Map();

  const cuentas = await UserRepository.findEmailsByIds(ids);

  return new Map(
    cuentas
      .filter((cuenta) => Boolean(cuenta.email))
      .map((cuenta) => [cuenta.id, cuenta.email] as const)
  );
};
