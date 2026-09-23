import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../config/database';
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

/** Lo que hace falta de una fila para el contexto de lectura completo. */
type FilaDeLectura = FilaConEntidad & { id: string; accion: string };

/**
 * Cuánto pasaba, como mucho, entre el guardado automático y el envío que lo seguía.
 *
 * Eran dos peticiones del mismo clic, una detrás de otra. Medido sobre la base el
 * 23/9/2026: de 178 envíos con un guardado delante, 169 lo tenían a menos de un segundo,
 * 7 entre uno y dos, y 2 entre dos y tres; **ninguno** entre tres y diez. Tres segundos
 * los recogen todos, y sigue siendo corto a propósito: un guardado **a mano** seguido de
 * un envío pasa por abrir el cuadro del comentario y escribir de 10 a 100 caracteres, que
 * no cabe en ese tiempo.
 */
const SEGUNDOS_ENTRE_GUARDADO_Y_ENVIO = 3;

/**
 * De estas filas, cuáles son guardados que el editor hizo solo antes de enviar a revisión.
 *
 * Hasta el cambio de la fase 6, pulsar «Enviar a revisión» hacía dos peticiones: guardar
 * el borrador y enviarlo. Cada envío dejaba así un «guardar borrador» que nadie había
 * pulsado, un instante antes. Esas filas siguen en la base y **no se borran**: la
 * bitácora es evidencia. Lo que se hace es reconocerlas para no decir de ellas que «el
 * usuario guardó su edición».
 *
 * Una es automática si, de la misma persona y sobre la misma página, hay un envío a
 * revisión en los tres segundos siguientes **y ningún otro guardado entre medias**: así,
 * si alguien guardó a mano y el editor guardó otra vez antes de enviar, solo la segunda
 * se reconoce como automática.
 *
 * Una consulta por página de resultados, no una por fila, igual que los correos.
 */
export const guardadosPreviosAEnvio = async (filas: FilaDeLectura[]): Promise<Set<string>> => {
  const ids = filas
    .filter((f) => f.entidad_tipo === 'pagina' && f.accion === 'guardar_borrador')
    .map((f) => f.id);
  if (ids.length === 0) return new Set();

  const automaticos = await sequelize.query<{ id: string }>(
    `SELECT g.id
       FROM auditoria_cambios g
      WHERE g.id IN (:ids)
        AND EXISTS (
          SELECT 1
            FROM auditoria_cambios e
           WHERE e.entidad_tipo = 'pagina'
             AND e.entidad_id = g.entidad_id
             AND e.accion = 'enviar_revision'
             AND e.usuario_id IS NOT DISTINCT FROM g.usuario_id
             AND e.created_at >= g.created_at
             AND e.created_at <= g.created_at + make_interval(secs => :segundos)
             AND NOT EXISTS (
               SELECT 1
                 FROM auditoria_cambios g2
                WHERE g2.entidad_tipo = 'pagina'
                  AND g2.entidad_id = g.entidad_id
                  AND g2.accion = 'guardar_borrador'
                  AND g2.created_at > g.created_at
                  AND g2.created_at <= e.created_at
             )
        )`,
    {
      replacements: { ids, segundos: SEGUNDOS_ENTRE_GUARDADO_Y_ENVIO },
      type: QueryTypes.SELECT,
    }
  );

  return new Set(automaticos.map((f) => f.id));
};

/**
 * Todo lo que la bitácora necesita saber de fuera de cada fila para redactarla, resuelto
 * de una vez para la página de resultados entera. Lo usan la pantalla, el historial de
 * un objeto y el análisis previo a la depuración: los tres leen las mismas frases.
 */
export const contextoDeLectura = async (filas: FilaDeLectura[]) => {
  const [emailPorUsuario, guardadosAutomaticos] = await Promise.all([
    correosDeCuentasAuditadas(filas),
    guardadosPreviosAEnvio(filas),
  ]);
  return { emailPorUsuario, guardadosAutomaticos };
};

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
