import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../config/database';
import {
  AuditRepository,
  SQL_IDS_GUARDADOS_AUTOMATICOS,
  type DatosAuditoria,
  type FiltrosAuditoria,
} from '../../repositories/auditoria.repository';
import { UserRepository } from '../../repositories/usuarios.repository';
import { Role } from '../../infrastructure/db/models';
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

/** El «desde dónde» de una petición sin sesión: solo IP y navegador. */
type OrigenSinSesion = { ip?: string | null; userAgent?: string | null } | undefined;

/**
 * Una cuenta que quedó bloqueada por intentos fallidos (migración 031).
 *
 * El actor es el sistema y no quien estaba intentando entrar: los intentos pueden ser de
 * la propia persona o de alguien que prueba contraseñas contra una cuenta ajena, y la
 * fila no puede saber cuál. Lo que sí guarda es **desde dónde** llegó el intento que
 * disparó el bloqueo, que es lo primero que se mira si alguien está atacando una cuenta.
 */
export const logBloqueoDeCuenta = (
  usuarioId: string,
  origen: OrigenSinSesion,
  bloqueo: {
    motivo: 'inicio_sesion' | 'preguntas_seguridad';
    intentos: number;
    minutos: number;
    hasta: Date;
  }
): Promise<void> =>
  logAudit({
    entidadId: usuarioId,
    entidadTipo: 'usuario',
    accion: 'bloquear',
    usuarioId: null,
    usuarioNombre: 'Sistema (bloqueo por intentos fallidos)',
    ip: origen?.ip ?? null,
    userAgent: origen?.userAgent ?? null,
    camposModificados: [
      { campo: 'motivo', antes: null, despues: bloqueo.motivo },
      { campo: 'intentos_fallidos', antes: null, despues: bloqueo.intentos },
      { campo: 'minutos_bloqueo', antes: null, despues: bloqueo.minutos },
      { campo: 'bloqueado_hasta', antes: null, despues: bloqueo.hasta.toISOString() },
    ],
  });

/**
 * Alguien respondió las preguntas de seguridad de una cuenta (migración 031).
 *
 * **Acertar demuestra quién es; fallar, no.** Por eso el acierto lleva a la persona como
 * actor —igual que la recuperación de contraseña— y el fallo no: podría ser alguien
 * intentando entrar en una cuenta ajena, y ponerle el nombre del dueño sería atribuirle
 * algo que quizá no hizo.
 */
export const logVerificacionDePreguntas = (
  usuario: { id: string; email: string },
  origen: OrigenSinSesion,
  resultado: { correctas: true } | { correctas: false; intento: number; maximo: number }
): Promise<void> =>
  logAudit({
    entidadId: usuario.id,
    entidadTipo: 'usuario',
    accion: 'verificar_preguntas',
    usuarioId: resultado.correctas ? usuario.id : null,
    usuarioNombre: resultado.correctas ? usuario.email : 'Sin sesión (recuperación de contraseña)',
    ip: origen?.ip ?? null,
    userAgent: origen?.userAgent ?? null,
    camposModificados: resultado.correctas
      ? [{ campo: 'resultado', antes: null, despues: 'correctas' }]
      : [
          { campo: 'resultado', antes: null, despues: 'incorrectas' },
          { campo: 'intento', antes: null, despues: resultado.intento },
          { campo: 'intentos_maximos', antes: null, despues: resultado.maximo },
        ],
  });

export const getAuditByContentId = (contentId: string, contentType?: string) =>
  AuditRepository.findByContentId(contentId, contentType);

export const getAllAudit = (filtros: FiltrosAuditoria) => AuditRepository.findAll(filtros);

/** Lo mínimo que hace falta de una fila para saber a qué cuenta apunta. */
type FilaConEntidad = { entidad_tipo: EntidadAuditable; entidad_id: string };

/** Lo que hace falta de una fila para el contexto de lectura completo. */
type FilaDeLectura = FilaConEntidad & {
  id: string;
  accion: string;
  campos_modificados?: { campo: string }[] | null;
};

/**
 * De estas filas, cuáles son guardados que el editor hizo solo antes de enviar a revisión.
 *
 * Los listados ya no los enseñan (ver `SQL_IDS_GUARDADOS_AUTOMATICOS` en el repositorio),
 * pero el análisis previo a la depuración sí, porque cuenta lo que de verdad se va a
 * borrar. Ahí tienen que llevar su propia frase y no la de un guardado hecho a mano: decir
 * que «el usuario guardó su edición» sería falso, nadie pulsó nada.
 *
 * Misma regla que la exclusión, leída del mismo SQL: las dos no pueden discrepar.
 */
export const guardadosPreviosAEnvio = async (filas: FilaDeLectura[]): Promise<Set<string>> => {
  const ids = filas
    .filter((f) => f.entidad_tipo === 'pagina' && f.accion === 'guardar_borrador')
    .map((f) => f.id);
  if (ids.length === 0) return new Set();

  const automaticos = await sequelize.query<{ id: string }>(
    `SELECT a.id FROM (${SQL_IDS_GUARDADOS_AUTOMATICOS}) a WHERE a.id IN (:ids)`,
    { replacements: { ids }, type: QueryTypes.SELECT }
  );

  return new Set(automaticos.map((f) => f.id));
};

/**
 * El nombre de cada rol, por id, solo si alguna fila lo necesita.
 *
 * Hace falta para dos cosas: decir «rol «Editor»» donde la fila guarda un UUID
 * (`role_id` al crear o modificar una cuenta) y nombrar el rol al que se le dio o quitó
 * un permiso. La tabla de roles tiene un puñado de filas, así que se lee entera en una
 * consulta en vez de filtrar por ids.
 *
 * Por el modelo y no con SQL a mano: la columna se llama `nombre` y el modelo la expone
 * como `name`. Un `SELECT name` escrito aquí fallaba contra la base de verdad.
 */
const nombresDeRoles = async (filas: FilaDeLectura[]): Promise<Map<string, string>> => {
  const necesita = filas.some(
    (f) =>
      f.entidad_tipo === 'rol' ||
      (f.campos_modificados ?? []).some((c) => c.campo === 'role_id')
  );
  if (!necesita) return new Map();

  const roles = await Role.findAll({ attributes: ['id', 'name'] });
  return new Map(roles.map((r) => [r.id, r.name]));
};

/**
 * Todo lo que la bitácora necesita saber de fuera de cada fila para redactarla, resuelto
 * de una vez para la página de resultados entera. Lo usan la pantalla, el historial de
 * un objeto y el análisis previo a la depuración: los tres leen las mismas frases.
 */
export const contextoDeLectura = async (filas: FilaDeLectura[]) => {
  const [emailPorUsuario, guardadosAutomaticos, rolPorId] = await Promise.all([
    correosDeCuentasAuditadas(filas),
    guardadosPreviosAEnvio(filas),
    nombresDeRoles(filas),
  ]);
  return { emailPorUsuario, guardadosAutomaticos, rolPorId };
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
