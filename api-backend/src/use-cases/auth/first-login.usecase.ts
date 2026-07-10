import bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/usuarios.repository';
import { SecurityQuestionRepository } from '../../repositories/security-questions.repository';
import { config } from '../../config';

export const firstLoginUseCase = async (userId: string, tempPassword: string, newPassword: string, securityQuestions: any[]) => {
  const user = await UserRepository.findByIdWithPassword(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  // 1. Verify the temporary password
  const valid = await bcrypt.compare(tempPassword, (user as any).password_hash || '');
  if (!valid) throw Object.assign(new Error('La contraseña temporal es incorrecta'), { status: 401 });

  // 2. Hash the new password
  if (!newPassword || newPassword.length < 8) {
    throw Object.assign(new Error('La nueva contraseña debe tener al menos 8 caracteres'), { status: 400 });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // 3. Validate security questions
  if (!Array.isArray(securityQuestions) || securityQuestions.length !== 3) {
    throw Object.assign(new Error('Debe proporcionar exactamente 3 preguntas de seguridad'), { status: 400 });
  }

  const uniqueKeys = new Set(securityQuestions.map((q) => q.key));
  if (uniqueKeys.size !== 3) {
    throw Object.assign(new Error('Las preguntas de seguridad deben ser diferentes'), { status: 400 });
  }

  // 4. Save everything in a transaction or sequentially
  await SecurityQuestionRepository.deleteByUserId(userId);

  const questionsToCreate = [];
  for (let i = 0; i < securityQuestions.length; i++) {
    const q = securityQuestions[i];
    if (!q.answer || typeof q.answer !== 'string' || q.answer.trim().length < 1)
      throw Object.assign(new Error('Las respuestas no pueden estar vacías'), { status: 400 });
    if (q.answer.length > 500)
      throw Object.assign(new Error('Las respuestas son demasiado largas'), { status: 400 });

    const answerHash = await bcrypt.hash(q.answer.trim().toLowerCase(), 12);
    questionsToCreate.push({
      user_id: userId,
      question_key: q.key,
      answer_hash: answerHash,
    });
  }

  await SecurityQuestionRepository.createBulk(questionsToCreate);

  // 5. Update the user flags
  await UserRepository.update(userId, {
    password_hash: passwordHash,
    must_change_password: false,
    must_setup_security_questions: false,
  });

  return { success: true };
};
