import bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/usuarios.repository';
import { SecurityQuestionRepository } from '../../repositories/security-questions.repository';
import { nuevaPasswordSinRepetir, exigirPasswordValida } from '../../shared/password-policy';
import { logBloqueoDeCuenta, logVerificacionDePreguntas } from '../auditoria/audit.usecase';
import { elegirSiempreLasMismas, gastarComparacionDeRelleno } from '../../shared/anti-enumeracion';

/** Respuestas incorrectas seguidas antes del bloqueo, y cuánto dura (§3). */
const INTENTOS_MAXIMOS_PREGUNTAS = 3;
const MINUTOS_BLOQUEO_PREGUNTAS = 30;

/**
 * Lo único que dice `verifyAnswers` cuando falla **después** de buscar la cuenta, sea cual
 * sea el motivo: correo inexistente, cuenta bloqueada, sin preguntas, respuesta errónea o
 * clave de pregunta que no es suya. Si cada caso tuviera su texto (como tenía: 404, 423, 400
 * y 401), esta pantalla serviría para averiguar qué correos existen y cuáles están bloqueados.
 * El aviso del bloqueo va dicho en general, sin confirmar que sea el caso de esta cuenta.
 */
export const MENSAJE_VERIFICACION_FALLIDA =
  `No fue posible verificar los datos. Revisa el correo y las respuestas. Si fallaste varias veces, ` +
  `espera ${MINUTOS_BLOQUEO_PREGUNTAS} minutos antes de reintentar o contacta al administrador.`;

const errorDeVerificacion = () => Object.assign(new Error(MENSAJE_VERIFICACION_FALLIDA), { status: 401 });

/** Desde dónde llega quien responde. No hay sesión: se recupera una cuenta sin entrar. */
type OrigenDeLaPeticion = { ip?: string | null; userAgent?: string | null };

interface OpcionesDeVerificacion {
  origen?: OrigenDeLaPeticion;
  /**
   * Si un acierto deja su propia fila. Las dos pantallas de recuperación verifican las
   * respuestas en un paso y, al guardar la contraseña, `recoverPassword` las vuelve a
   * verificar: si las dos registraran el acierto, cada recuperación saldría con dos
   * aciertos seguidos. El segundo ya lo cuenta la fila del cambio de contraseña.
   * Los **fallos** se registran siempre, vengan de donde vengan: cada uno gasta un
   * intento y acerca el bloqueo.
   */
  registrarAcierto?: boolean;
}

const SECURITY_QUESTIONS_CATALOG = [
  { key: 'pet_name', label: '¿Cuál es el nombre de tu primera mascota?' },
  { key: 'birth_city', label: '¿En qué ciudad naciste?' },
  { key: 'childhood_friend', label: '¿Cuál es el nombre de tu mejor amigo de la infancia?' },
  { key: 'favorite_food', label: '¿Cuál es tu comida favorita?' },
  { key: 'first_school', label: '¿Cuál fue el nombre de tu primera escuela?' },
  { key: 'mother_middle_name', label: '¿Cuál es el segundo nombre de tu madre?' },
  { key: 'first_phone', label: '¿Cuál fue tu primer número de teléfono?' },
  { key: 'favorite_movie', label: '¿Cuál es tu película favorita?' },
  { key: 'graduation_year', label: '¿En qué año te graduaste?' },
  { key: 'childhood_street', label: '¿Cuál es el nombre de la calle donde creciste?' },
];

/** El catálogo fijo de preguntas de seguridad que se pueden elegir. */
export const getCatalog = () => SECURITY_QUESTIONS_CATALOG;

/**
 * Qué preguntas configuró una cuenta (sin respuestas), para pintar el paso de recuperación.
 *
 * **Siempre devuelve tres**, exista o no el correo. Antes devolvía `[]` si no existía y las
 * preguntas reales si sí —y un 423 si estaba bloqueada—, lo que confirmaba la cuenta y, de
 * paso, regalaba su pregunta de seguridad a cualquiera. Para un correo sin cuenta, o con la
 * cuenta sin sus tres preguntas, se inventan unas del catálogo que son **siempre las mismas**
 * para ese correo (ver `elegirSiempreLasMismas`); contestarlas falla en `verifyAnswers` con
 * el mismo mensaje que cualquier respuesta errónea. El bloqueo no se anuncia aquí.
 */
export const getQuestionKeysForUser = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserRepository.findByEmail(normalizedEmail);
  const questions = user ? await SecurityQuestionRepository.findByUserId(user.id) : [];

  if (!user || !questions || questions.length !== 3) {
    return elegirSiempreLasMismas(normalizedEmail, SECURITY_QUESTIONS_CATALOG, 3);
  }

  return questions.map((q: any) => ({
    key: q.question_key,
    label: SECURITY_QUESTIONS_CATALOG.find((c) => c.key === q.question_key)?.label || q.question_key,
  }));
};

/**
 * Sustituye las preguntas de seguridad de una cuenta por las 3 nuevas, con las respuestas hasheadas.
 * @throws {Error} 400 si no son exactamente 3, se repiten o alguna respuesta está vacía.
 */
export const setupQuestions = async (userId: string, questionsData: any[]) => {
  if (!Array.isArray(questionsData) || questionsData.length !== 3)
    throw Object.assign(new Error('Debe proporcionar exactamente 3 preguntas'), { status: 400 });

  const uniqueKeys = new Set(questionsData.map((q) => q.key));
  if (uniqueKeys.size !== 3)
    throw Object.assign(new Error('Las preguntas deben ser diferentes'), { status: 400 });

  await SecurityQuestionRepository.deleteByUserId(userId);

  const questionsToCreate = [];
  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    if (!q.answer || typeof q.answer !== 'string' || q.answer.trim().length < 1)
      throw Object.assign(new Error('Las respuestas no pueden estar vacías'), { status: 400 });
    if (q.answer.length > 500)
      throw Object.assign(new Error('Las respuestas son demasiado largas'), { status: 400 });

    const answerHash = await bcrypt.hash(q.answer.trim().toLowerCase(), 12);
    questionsToCreate.push({
      user_id: userId,
      question_key: q.key,
      answer_hash: answerHash,
      sort_order: i,
    });
  }

  await SecurityQuestionRepository.createBulk(questionsToCreate);
  await UserRepository.update(userId, { must_setup_security_questions: false });

  return { message: 'Preguntas de seguridad configuradas exitosamente' };
};

/**
 * Comprueba las respuestas de seguridad de una cuenta y cuenta los fallos (bloquea al llegar al tope).
 * @throws {Error} 400 si el cuerpo no trae tres respuestas con texto (no depende de la cuenta); y, una vez
 * buscada la cuenta, siempre el mismo 401 (`MENSAJE_VERIFICACION_FALLIDA`) sea cual sea el motivo.
 */
export const verifyAnswers = async (
  email: string,
  answersData: any[],
  opciones: OpcionesDeVerificacion = {}
) => {
  // La forma del cuerpo se comprueba antes de tocar la base: no depende de la cuenta, así que
  // su mensaje no delata nada.
  if (!Array.isArray(answersData) || answersData.length !== 3)
    throw Object.assign(new Error('Debe proporcionar respuestas a las 3 preguntas'), { status: 400 });
  if (answersData.some((a) => typeof a?.key !== 'string' || typeof a?.answer !== 'string' || a.answer.trim().length < 1))
    throw Object.assign(new Error('Las respuestas no pueden estar vacías'), { status: 400 });

  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserRepository.findByEmail(normalizedEmail);

  // Desde aquí, todo fallo es el mismo 401. Los que salen sin comparar nada gastan antes el
  // tiempo de un bcrypt, para que tampoco se distingan por lo que tardan.
  if (!user) {
    await gastarComparacionDeRelleno(answersData[0].answer);
    throw errorDeVerificacion();
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    await gastarComparacionDeRelleno(answersData[0].answer);
    throw errorDeVerificacion();
  }

  const storedQuestions = await SecurityQuestionRepository.findByUserId(user.id);
  if (!storedQuestions || storedQuestions.length !== 3) {
    await gastarComparacionDeRelleno(answersData[0].answer);
    throw errorDeVerificacion();
  }

  // Que falte una respuesta no es un intento: se descarta antes de contar.
  if (storedQuestions.some((stored) => !answersData.some((a) => a.key === stored.question_key))) {
    await gastarComparacionDeRelleno(answersData[0].answer);
    throw errorDeVerificacion();
  }

  // El intento se cuenta ANTES de comparar y lo numera la base (ver `reservarIntentoDePreguntas`):
  // con «leer el contador, sumar y escribir» una ráfaga de respuestas a la vez leía todas 0 y
  // el bloqueo no llegaba nunca. Pasado el tope, el exceso se rechaza sin comparar.
  const newCount = await UserRepository.reservarIntentoDePreguntas(user.id);
  if (newCount === null || newCount > INTENTOS_MAXIMOS_PREGUNTAS) {
    await gastarComparacionDeRelleno(answersData[0].answer);
    throw errorDeVerificacion();
  }

  for (const stored of storedQuestions) {
    const provided = answersData.find((a) => a.key === stored.question_key)!;

    const isValid = await bcrypt.compare(provided.answer.trim().toLowerCase(), stored.answer_hash);
    if (!isValid) {
      const bloqueadoHasta = newCount >= INTENTOS_MAXIMOS_PREGUNTAS ? new Date(Date.now() + MINUTOS_BLOQUEO_PREGUNTAS * 60 * 1000) : null;
      if (bloqueadoHasta) await UserRepository.bloquearPorPreguntas(user.id, bloqueadoHasta);

      await logVerificacionDePreguntas(user, opciones.origen, {
        correctas: false,
        intento: newCount,
        maximo: INTENTOS_MAXIMOS_PREGUNTAS,
      });
      if (bloqueadoHasta) {
        await logBloqueoDeCuenta(user.id, opciones.origen, {
          motivo: 'preguntas_seguridad',
          intentos: newCount,
          minutos: MINUTOS_BLOQUEO_PREGUNTAS,
          hasta: bloqueadoHasta,
        });
      }

      throw errorDeVerificacion();
    }
  }

  // El intento ya estaba contado: un acierto lo borra, y con él cualquier bloqueo vencido.
  await UserRepository.update(user.id, { failed_security_attempts: 0, locked_until: null });

  if (opciones.registrarAcierto) {
    await logVerificacionDePreguntas(user, opciones.origen, { correctas: true });
  }

  return user;
};

/**
 * Recupera la contraseña: valida la nueva con la política, verifica las respuestas y la guarda.
 * @throws {Error} 400 si la contraseña no cumple la política; los de `verifyAnswers` si fallan las respuestas.
 */
export const recoverPassword = async (
  email: string,
  answersData: any[],
  newPassword: string,
  origen?: OrigenDeLaPeticion
) => {
  // Se valida **antes** de comprobar las respuestas: si la contraseña no cumple la
  // política, gastar un intento de las preguntas —y arriesgar el bloqueo de §3— por
  // un error de formato sería castigar al usuario por lo que no es.
  // Consideración 4: el flujo de recuperación aplica exactamente las mismas reglas.
  exigirPasswordValida(newPassword);

  // Sin registrar el acierto: esta es la segunda verificación de la misma recuperación,
  // y el éxito ya queda en la fila del cambio de contraseña. Un fallo aquí sí se registra.
  const user = await verifyAnswers(email, answersData, { origen, registrarAcierto: false });

  // Ni la actual ni la anterior. `findByEmail` trae los dos hashes.
  const hashes = await nuevaPasswordSinRepetir(newPassword, {
    actual: (user as any).password_hash,
    anterior: (user as any).previous_password_hash,
  });
  await UserRepository.update(user.id, {
    ...hashes,
    // La contraseña que acaba de elegir reemplaza a cualquier temporal pendiente. Sin
    // esto, quien recuperaba con una temporal ya vencida (72 h) seguía marcado como
    // «debe cambiarla» y el login lo rechazaba por una clave que ya no es la suya.
    must_change_password: false,
    temp_password_expires_at: null,
    failed_security_attempts: 0,
    // Recuperar la contraseña con éxito también libera el bloqueo del login: es el
    // camino que §3 deja abierto a quien se quedó fuera por intentos fallidos.
    failed_login_attempts: 0,
    locked_until: null,
  });

  // El id sale para que el controlador pueda auditar el cambio: quien recupera no
  // tiene sesión, así que no hay `req.user` de donde sacarlo.
  return { message: 'Contraseña actualizada exitosamente', usuarioId: user.id };
};
