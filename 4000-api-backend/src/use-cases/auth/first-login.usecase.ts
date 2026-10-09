import bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/usuarios.repository';
import { SecurityQuestionRepository } from '../../repositories/security-questions.repository';
import { compararPassword, hashearPassword, BCRYPT_ROUNDS } from '../../shared/password-policy';

/** Lo que quedó pendiente de configurar, para que quien llama sepa qué pedir. */
export interface EstadoPrimerIngreso {
  debeCambiarPassword: boolean;
  debeConfigurarPreguntas: boolean;
}

/**
 * Qué le falta a esta cuenta para estar operativa.
 *
 * Se consulta antes de pintar el formulario para no pedir lo que ya está hecho.
 */
export const estadoPrimerIngreso = async (userId: string): Promise<EstadoPrimerIngreso> => {
  const user = await UserRepository.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  return {
    debeCambiarPassword: Boolean(user.must_change_password),
    debeConfigurarPreguntas: Boolean(user.must_setup_security_questions),
  };
};

/** Las preguntas que pide una cuenta; con menos, la recuperación no funciona. */
export const TOTAL_PREGUNTAS = 3;

/**
 * Valida y prepara las preguntas de seguridad para guardar.
 *
 * Se extrae de `firstLoginUseCase` porque ahora hay un camino que solo configura
 * preguntas, sin tocar la contraseña.
 */
const prepararPreguntas = async (userId: string, securityQuestions: any[]) => {
  if (!Array.isArray(securityQuestions) || securityQuestions.length !== TOTAL_PREGUNTAS) {
    throw Object.assign(
      new Error(`Debe proporcionar exactamente ${TOTAL_PREGUNTAS} preguntas de seguridad`),
      { status: 400 }
    );
  }

  const uniqueKeys = new Set(securityQuestions.map((q) => q.key));
  if (uniqueKeys.size !== TOTAL_PREGUNTAS) {
    throw Object.assign(new Error('Las preguntas de seguridad deben ser diferentes'), { status: 400 });
  }

  const preparadas = [];
  for (const q of securityQuestions) {
    if (!q.answer || typeof q.answer !== 'string' || q.answer.trim().length < 1)
      throw Object.assign(new Error('Las respuestas no pueden estar vacías'), { status: 400 });
    if (q.answer.length > 500)
      throw Object.assign(new Error('Las respuestas son demasiado largas'), { status: 400 });

    preparadas.push({
      user_id: userId,
      question_key: q.key,
      answer_hash: await bcrypt.hash(q.answer.trim().toLowerCase(), BCRYPT_ROUNDS),
    });
  }

  return preparadas;
};

/**
 * Completa lo que le falte a una cuenta en su primer ingreso.
 *
 * ## Por qué lo decide el servidor y no el formulario
 *
 * Antes esto exigía **las tres cosas siempre**: contraseña temporal, contraseña nueva
 * y tres preguntas. Eso rompía un caso real: cuando un administrador restablece *solo*
 * las preguntas de seguridad (`reset_security_questions` sin `reset_password`), el
 * usuario no tiene ninguna contraseña temporal —la suya sigue siendo válida— pero el
 * flujo se la pedía igual y le obligaba a cambiarla otra vez. Quedaba atascado en un
 * formulario que le pedía algo que no existe.
 *
 * Ahora se mira **qué hay pendiente de verdad en la base** (`must_change_password` y
 * `must_setup_security_questions`) y se exige exactamente eso. Que lo decida el
 * servidor y no el cliente es lo que impide, además, que alguien salte el cambio de
 * contraseña simplemente no enviándolo.
 *
 * Es idempotente: si no queda nada pendiente no falla, informa.
 */
export const firstLoginUseCase = async (
  userId: string,
  tempPassword: string,
  newPassword: string,
  securityQuestions: any[]
): Promise<{ success: true; cambioPassword: boolean; configuroPreguntas: boolean }> => {
  const user = await UserRepository.findByIdWithPassword(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  const debeCambiarPassword = Boolean((user as any).must_change_password);
  const debeConfigurarPreguntas = Boolean((user as any).must_setup_security_questions);

  if (!debeCambiarPassword && !debeConfigurarPreguntas) {
    return { success: true, cambioPassword: false, configuroPreguntas: false };
  }

  const cambios: Record<string, unknown> = {};

  if (debeCambiarPassword) {
    // La temporal se comprueba contra el hash actual; no se mide contra la política
    // (§1), que solo rige lo que el usuario *elige*.
    const valida = await compararPassword(tempPassword ?? '', (user as any).password_hash || '');
    if (!valida) {
      throw Object.assign(new Error('La contraseña temporal es incorrecta'), { status: 401 });
    }

    cambios.password_hash = await hashearPassword(newPassword);
    cambios.must_change_password = false;
  }

  // Se preparan **antes** de escribir nada: si las preguntas vienen mal, no debe
  // quedar la contraseña cambiada a medias y el usuario sin saber en qué estado está.
  const preguntasListas = debeConfigurarPreguntas
    ? await prepararPreguntas(userId, securityQuestions)
    : null;

  if (preguntasListas) {
    await SecurityQuestionRepository.deleteByUserId(userId);
    await SecurityQuestionRepository.createBulk(preguntasListas);
    cambios.must_setup_security_questions = false;
  }

  await UserRepository.update(userId, cambios);

  return {
    success: true,
    cambioPassword: debeCambiarPassword,
    configuroPreguntas: debeConfigurarPreguntas,
  };
};
