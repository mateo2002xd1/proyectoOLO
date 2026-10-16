import { Request, Response, NextFunction } from 'express';
import {
  getCatalog,
  getQuestionKeysForUser,
  setupQuestions,
  verifyAnswers,
  recoverPassword,
} from '../use-cases/auth/security-questions.usecase';
import { logCambioDePassword } from '../use-cases/auditoria/audit.usecase';
import { datosDeAuditoria, origenDeLaPeticion } from '../shared/auditoria-request';
import { esErrorDePolitica, esErrorDePasswordRepetida } from '../shared/password-policy';

export const SecurityQuestionController = {
  /** Devuelve el catálogo de preguntas de seguridad disponibles. */
  getCatalog(_req: Request, res: Response) {
    res.json(getCatalog());
  },

  /** Devuelve qué preguntas configuró una cuenta; lista vacía si el correo no existe. */
  async getQuestionKeysForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'El correo es obligatorio' });
      const questions = await getQuestionKeysForUser(email);
      res.json({ questions });
    } catch (err: any) {
      if (err.status === 404) return res.json({ questions: [] });
      next(err);
    }
  },

  /** Guarda las preguntas y respuestas de seguridad de la sesión actual. */
  async setupQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'No autorizado' });
      if (req.user?.isLocal) return res.status(403).json({ error: 'El usuario local no puede configurar preguntas' });
      res.json(await setupQuestions(userId, req.body.questions));
    } catch (err) { next(err); }
  },

  /** Comprueba las respuestas de seguridad de una cuenta (paso previo a recuperar). */
  async verifyAnswersCtrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, answers } = req.body;
      // Este es el paso en que la pantalla de recuperación comprueba las respuestas: aquí
      // se registra el acierto. Los fallos se registran siempre, dentro del caso de uso.
      const usuario = await verifyAnswers(email, answers, { origen: origenDeLaPeticion(req), registrarAcierto: true });
      // El primer nombre, para el saludo de la pantalla siguiente («¡Enhorabuena, <nombre>!»).
      // Solo sale con las tres respuestas correctas: quien llega aquí ya probó quién es,
      // así que no sirve para averiguar de quién es un correo.
      const nombre = usuario.name?.trim().split(/\s+/)[0] || null;
      res.json({ message: 'Respuestas correctas', nombre });
    } catch (err) { next(err); }
  },

  /**
   * Recupera la contraseña con las respuestas de seguridad.
   * Arma sus propios errores a propósito: el mensaje genérico no delata si el correo existe.
   */
  async recoverPasswordCtrl(req: Request, res: Response, _next: NextFunction) {
    try {
      const { email, answers, newPassword } = req.body;
      const { message, usuarioId } = await recoverPassword(email, answers, newPassword, origenDeLaPeticion(req));

      // Quien recupera no tiene sesión, así que `datosDeAuditoria` deja el actor en
      // null; aquí el actor y el afectado son la misma persona —acaba de demostrarlo
      // respondiendo sus preguntas—, y sin esto la fila quedaría sin autor.
      await logCambioDePassword(
        { ...datosDeAuditoria(req), usuarioId, usuarioNombre: email },
        usuarioId,
        'recuperacion'
      );

      res.json({ message });
    } catch (err: any) {
      if (err.status === 423) return res.status(423).json({ error: err.message });

      // Un incumplimiento de la política se devuelve tal cual. El mensaje genérico
      // de abajo existe para no delatar si el correo existe o si las respuestas eran
      // correctas; esto habla solo de la contraseña que el usuario acaba de teclear,
      // y se comprueba antes de mirar la base, así que no revela nada de la cuenta.
      // Sin esto, quien eligiera una contraseña débil vería «verifica los datos» y
      // no tendría forma de averiguar qué corregir.
      if (esErrorDePolitica(err)) return res.status(400).json({ error: err.message });
      // La nueva repite la actual o la anterior: solo se llega aquí tras responder bien
      // las preguntas, así que tampoco revela nada a quien no lo hizo.
      if (esErrorDePasswordRepetida(err)) return res.status(400).json({ error: err.message, code: err.code });

      const safeMessage = 'No fue posible recuperar la contraseña. Verifica los datos e intenta de nuevo.';
      const status = (err.status === 400 || err.status === 401 || err.status === 404) ? 401 : 500;
      res.status(status).json({ error: safeMessage });
    }
  },
};
