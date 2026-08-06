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

export const getAuditByContentId = (contentId: string, contentType?: string) =>
  AuditRepository.findByContentId(contentId, contentType);

export const getAllAudit = (filtros: FiltrosAuditoria) => AuditRepository.findAll(filtros);
