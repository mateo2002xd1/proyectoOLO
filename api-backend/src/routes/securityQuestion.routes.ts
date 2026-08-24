import { Router } from 'express';
import { SecurityQuestionController } from '../controllers/security-questions.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  limitadorDePreguntas,
  limitadorDeVerificacion,
  limitadorDeRecuperacion,
} from '../middlewares/rate-limit.middleware';

const router = Router();

/**
 * Los tres pasos de la recuperación cuentan por **correo**.
 *
 * `recover-password` ya lo hacía y era el único límite de la API que funcionaba de
 * verdad; los otros dos contaban por IP, así que cinco peticiones bastaban para dejar
 * sin recuperación de contraseña a toda la institución durante quince minutos. Ahora
 * los tres usan la misma clave, que además es la unidad que tiene sentido proteger:
 * las respuestas de seguridad se adivinan cuenta por cuenta.
 */

/**
 * @openapi
 * /api/security-questions/catalog:
 *   get:
 *     tags: [Preguntas de seguridad]
 *     summary: Catálogo de preguntas disponibles
 *     description: |
 *       Las preguntas entre las que se elige al configurar la cuenta. Es una lista
 *       fija y pública: no dice nada de ninguna cuenta en concreto, así que no exige
 *       sesión —la pantalla de recuperación la necesita cuando todavía no hay
 *       ninguna—.
 *     security: []
 *     responses:
 *       200:
 *         description: Preguntas disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/PreguntaSeguridad' }
 */
router.get('/catalog', SecurityQuestionController.getCatalog);

/**
 * @openapi
 * /api/security-questions/user-questions:
 *   post:
 *     tags: [Preguntas de seguridad]
 *     summary: Qué preguntas eligió una cuenta
 *     description: |
 *       Paso 1 de la recuperación: dado un correo, devuelve **las claves** de las
 *       preguntas que esa cuenta configuró, para poder pintarlas. Nunca devuelve las
 *       respuestas.
 *
 *       Va sin sesión porque quien recupera no puede entrar. El límite cuenta por
 *       correo: por IP, cinco peticiones dejaban sin recuperación a toda la
 *       institución durante quince minutos.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *             required: [email]
 *     responses:
 *       200:
 *         description: Claves de las preguntas de esa cuenta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items: { type: string, example: primera_mascota }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post('/user-questions', limitadorDePreguntas, SecurityQuestionController.getQuestionKeysForUser);

/**
 * @openapi
 * /api/security-questions/setup:
 *   post:
 *     tags: [Preguntas de seguridad]
 *     summary: Configurar las propias preguntas
 *     description: |
 *       Fija las preguntas y respuestas de la cuenta en sesión. Las respuestas se
 *       guardan hasheadas, igual que una contraseña: quien lea la tabla no puede
 *       usarlas para entrar.
 *
 *       El cuerpo manda `questions` como pares `[clave, respuesta]`. Durante un tiempo
 *       el frontal enviaba `answers` con otra forma y el flujo quedaba a medias sin
 *       decir por qué.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questions:
 *                 type: array
 *                 description: Pares `[clave, respuesta]`.
 *                 items:
 *                   type: array
 *                   items: { type: string }
 *                 example: [[primera_mascota, "Firulais"], [ciudad_natal, "Pereira"]]
 *             required: [questions]
 *     responses:
 *       200:
 *         description: Preguntas guardadas.
 *       400:
 *         description: Faltan preguntas, o alguna clave no está en el catálogo.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
router.post('/setup', requireAuth, SecurityQuestionController.setupQuestions);

/**
 * @openapi
 * /api/security-questions/verify:
 *   post:
 *     tags: [Preguntas de seguridad]
 *     summary: Verificar respuestas
 *     description: |
 *       Paso 2 de la recuperación. Tres intentos y la cuenta queda bloqueada treinta
 *       minutos para este flujo.
 *
 *       Ese contador (`intentos_fallidos`) es **distinto** del contador del login
 *       (`intentos_fallidos_login`, cinco intentos y quince minutos), y son columnas
 *       separadas a propósito: reutilizar una para las dos cosas bloquearía a
 *       destiempo en los dos flujos.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               answers:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items: { type: string }
 *             required: [email, answers]
 *     responses:
 *       200:
 *         description: Respuestas correctas. Habilita el paso de recuperación.
 *       401:
 *         description: Respuestas incorrectas, o cuenta bloqueada por intentos.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post('/verify', limitadorDeVerificacion, SecurityQuestionController.verifyAnswersCtrl);

/**
 * @openapi
 * /api/security-questions/recover-password:
 *   post:
 *     tags: [Preguntas de seguridad]
 *     summary: Fijar contraseña nueva tras verificar
 *     description: |
 *       Paso 3 y último. Fija la contraseña, limpia el bloqueo de la cuenta —devolver
 *       el acceso es justo la función de este flujo— y deja la operación registrada en
 *       la bitácora con motivo `recuperacion`.
 *
 *       **Una excepción deliberada al mensaje genérico**: el resto de errores de este
 *       endpoint se sustituyen por uno vago para no delatar si un correo existe, pero
 *       el incumplimiento de la política de contraseñas se devuelve con su motivo
 *       real. Habla de lo que la persona acaba de teclear y se comprueba antes de
 *       tocar la base, así que no revela nada de la cuenta; sin la excepción, quien
 *       eligiera una contraseña débil vería «verifica los datos» sin saber qué
 *       corregir.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               newPassword: { type: string, format: password }
 *             required: [email, newPassword]
 *     responses:
 *       200:
 *         description: Contraseña restablecida.
 *       400:
 *         description: La contraseña no cumple la política (este motivo sí se devuelve).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Mensaje genérico para cualquier otro fallo, para no delatar cuentas.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post('/recover-password', limitadorDeRecuperacion, SecurityQuestionController.recoverPasswordCtrl);

export default router;
