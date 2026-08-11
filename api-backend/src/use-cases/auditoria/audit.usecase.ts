import {
  AuditRepository,
  type DatosAuditoria,
  type FiltrosAuditoria,
} from '../../repositories/auditoria.repository';

export type { DatosAuditoria, FiltrosAuditoria };

/**
 * Registra una entrada en la bitácora (RF-07).
 *
 * **Es `async` y hay que esperarla.** Antes no lo era, y ese detalle es parte de
 * por qué la auditoría no dejaba rastro sin que nadie se enterara: al no esperar
 * la promesa, un INSERT rechazado se perdía como *unhandled rejection*. El otro
 * motivo era que quien la llamaba mandaba la acción en inglés (`'create'`), y la
 * migración 006 dejó un CHECK que solo admite los verbos en español.
 *
 * El error se registra pero **no se relanza**: si la bitácora falla, la petición
 * que la originó —publicar una página, por ejemplo— debe terminar igual. Lo que
 * no puede seguir pasando es que falle en silencio.
 *
 * Nota para quien retome RF-07: lo correcto en una entidad pública es que la fila
 * de auditoría se escriba en la **misma transacción** que el cambio, para que no
 * pueda existir un cambio sin su evidencia. Hoy no es posible sin refactorizar
 * `PaginaRepository`, que no acepta `transaction` en ninguna de sus operaciones.
 * Queda como el siguiente paso de la épica, no como algo ya resuelto.
 */
export const logAudit = async (datos: DatosAuditoria): Promise<void> => {
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
