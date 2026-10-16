import bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/usuarios.repository';
import { SecurityQuestionRepository } from '../../repositories/security-questions.repository';
import { nuevaPasswordSinRepetir, exigirPasswordValida } from '../../shared/password-policy';
import { logBloqueoDeCuenta, logVerificacionDePreguntas } from '../auditoria/audit.usecase';

/** Respuestas incorrectas seguidas antes del bloqueo, y cuánto dura (§3). */
const INTENTOS_MAXIMOS_PREGUNTAS = 3;
const MINUTOS_BLOQUEO_PREGUNTAS = 30;

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
 * @throws {Error} 404 si el correo no existe; 423 si la cuenta está bloqueada.
 */
export const getQuestionKeysForUser = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserRepository.findByEmail(normalizedEmail);

  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  if (user.locked_until && new Date(user.locked_until) > new Date())
    throw Object.assign(new Error('Cuenta bloqueada temporalmente'), { status: 423 });

  const questions = await SecurityQuestionRepository.findByUserId(user.id);
  if (!questions || questions.length === 0) return [];

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
 * @throws {Error} 404 si el correo no existe; 423 si está bloqueada; 400 si faltan respuestas; 401 si alguna no coincide.
 */
export const verifyAnswers = async (
  email: string,
  answersData: any[],
  opciones: OpcionesDeVerificacion = {}
) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserRepository.findByEmail(normalizedEmail);

  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  if (user.locked_until && new Date(user.locked_until) > new Date())
    throw Object.assign(new Error('Cuenta bloqueada temporalmente'), { status: 423 });

  const storedQuestions = await SecurityQuestionRepository.findByUserId(user.id);
  if (!storedQuestions || storedQuestions.length !== 3)
    throw Object.assign(new Error('El usuario no tiene preguntas configuradas'), { status: 400 });

  if (!Array.isArray(answersData) || answersData.length !== 3)
    throw Object.assign(new Error('Debe proporcionar respuestas a las 3 preguntas'), { status: 400 });

  for (const stored of storedQuestions) {
    const provided = answersData.find((a) => a.key === stored.question_key);
    if (!provided) throw Object.assign(new Error('Falta una o más respuestas'), { status: 400 });
    if (!provided.answer || typeof provided.answer !== 'string' || provided.answer.trim().length < 1)
      throw Object.assign(new Error('Las respuestas no pueden estar vacías'), { status: 400 });

    const isValid = await bcrypt.compare(provided.answer.trim().toLowerCase(), stored.answer_hash);
    if (!isValid) {
      const newCount = (user.failed_security_attempts || 0) + 1;
      const updates: any = { failed_security_attempts: newCount };
      const seBloquea = newCount >= INTENTOS_MAXIMOS_PREGUNTAS;
      if (seBloquea) updates.locked_until = new Date(Date.now() + MINUTOS_BLOQUEO_PREGUNTAS * 60 * 1000);
      await UserRepository.update(user.id, updates);

      await logVerificacionDePreguntas(user, opciones.origen, {
        correctas: false,
        intento: newCount,
        maximo: INTENTOS_MAXIMOS_PREGUNTAS,
      });
      if (seBloquea) {
        await logBloqueoDeCuenta(user.id, opciones.origen, {
          motivo: 'preguntas_seguridad',
          intentos: newCount,
          minutos: MINUTOS_BLOQUEO_PREGUNTAS,
          hasta: updates.locked_until,
        });
      }

      throw Object.assign(new Error('Una o más respuestas son incorrectas'), { status: 401 });
    }
  }

  if (user.failed_security_attempts > 0 || user.locked_until) {
    await UserRepository.update(user.id, { failed_security_attempts: 0, locked_until: null });
  }

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
