import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuthConConfiguracionPendiente } from '../middlewares/auth.middleware';
import { limitadorDeLogin, limitadorDeLogout } from '../middlewares/rate-limit.middleware';

const router = Router();

/**
 * El límite del login cuenta por **correo**, no por IP.
 *
 * Contar por IP tenía dos fallos a la vez: no frenaba a quien rota direcciones, y
 * dejaba que un solo atacante agotara el cupo compartido y bloqueara el acceso a todo
 * el mundo. Por correo, atacar una cuenta solo penaliza a esa cuenta.
 *
 * Sigue siendo el segundo de dos controles: el bloqueo tras cinco intentos fallidos
 * (`registrarFalloDeLogin`) protege la cuenta contra quien acierta el correo, y este
 * protege a la API contra el volumen. Uno no sustituye al otro.
 */
/**
 * @openapi
 * /api/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 *     description: |
 *       Valida credenciales y abre sesión. Devuelve el token en el cuerpo **y** lo
 *       deja además en una cookie `HttpOnly`, que es el camino que usan los dos
 *       frontales.
 *
 *       **La respuesta puede pedir dos pasos más antes de dejar trabajar:**
 *       `mustChangePassword` cuando la cuenta entra con una contraseña temporal, y
 *       `mustSetupSecurityQuestions` cuando aún no tiene preguntas configuradas —sin
 *       ellas no habría forma de recuperar la cuenta más adelante—.
 *
 *       **El error es siempre el mismo, a propósito.** Un correo que no existe, una
 *       contraseña equivocada y un dominio no institucional responden los tres
 *       `401 Credenciales inválidas`. Distinguirlos convertiría el login en un
 *       detector de cuentas y de dominios válidos.
 *
 *       **Dos controles distintos protegen esto**: el bloqueo de la cuenta tras cinco
 *       intentos fallidos, y este límite de peticiones, que cuenta por correo para que
 *       atacar una cuenta no deje sin entrar a las demás.
 *
 *       **Sitio web e intranet entran los dos por aquí.** Vistas desde la API las dos
 *       peticiones son idénticas, así que cada frontal se identifica con la cabecera
 *       `X-Origen-App` y eso es lo único que permite que la bitácora diga en cuál de
 *       los dos se inició sesión. Omitirla no cambia nada del login: la fila se escribe
 *       igual, solo que sin decir desde dónde.
 *     security: []
 *     parameters:
 *       - name: X-Origen-App
 *         in: header
 *         required: false
 *         description: |
 *           Qué frontal abre la sesión. Solo se acepta `sitio-web` o `intranet`;
 *           cualquier otro valor se descarta en vez de guardarse, porque esta es una
 *           ruta pública y lo que escriba un cliente no puede acabar copiado dentro de
 *           la tabla de auditoría. Se queda en la fila, en el campo `origen`.
 *         schema:
 *           type: string
 *           enum: [sitio-web, intranet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email, example: ana.rios@sena.edu.co }
 *               password: { type: string, format: password }
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Sesión abierta. La cookie viaja en `Set-Cookie`.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Sesion' }
 *       401:
 *         description: Credenciales inválidas, o cuenta inactiva, bloqueada o expirada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post('/login', limitadorDeLogin, AuthController.login);

/**
 * @openapi
 * /api/first-login/status:
 *   get:
 *     tags: [Autenticación]
 *     summary: Qué le falta a esta cuenta para poder trabajar
 *     description: |
 *       Dice si la sesión actual todavía debe cambiar la contraseña temporal o
 *       configurar sus preguntas de seguridad. El frontal la consulta para decidir a
 *       qué paso del primer ingreso llevar a la persona.
 *     responses:
 *       200:
 *         description: Estado del primer ingreso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mustChangePassword: { type: boolean }
 *                 mustSetupSecurityQuestions: { type: boolean }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
router.get('/first-login/status', requireAuthConConfiguracionPendiente, AuthController.firstLoginStatus);

/**
 * @openapi
 * /api/first-login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Completar el primer ingreso
 *     description: |
 *       Cierra el primer ingreso: fija la contraseña definitiva y, si hacen falta, las
 *       preguntas de seguridad, en una sola operación.
 *
 *       La contraseña nueva sí se mide contra la política de composición; la temporal
 *       con la que se entró, no —esa se comprueba, no se elige—.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Debe cumplir la política de contraseñas.
 *               questions:
 *                 type: array
 *                 description: Pares `[clave, respuesta]`. Solo si la cuenta aún no tiene preguntas.
 *                 items:
 *                   type: array
 *                   items: { type: string }
 *     responses:
 *       200:
 *         description: Primer ingreso completado.
 *       400:
 *         description: La contraseña no cumple la política, o faltan preguntas.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
router.post('/first-login', requireAuthConConfiguracionPendiente, AuthController.firstLogin);

/**
 * @openapi
 * /api/logout:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cerrar sesión
 *     description: |
 *       Borra la cookie de sesión. No exige sesión válida: cerrar una sesión que ya
 *       caducó tiene que funcionar igual, o el navegador se queda con una cookie
 *       muerta que nadie puede quitar.
 *     security: []
 *     responses:
 *       200:
 *         description: Cookie borrada.
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post('/logout', limitadorDeLogout, AuthController.logout);

/**
 * @openapi
 * /api/me:
 *   get:
 *     tags: [Autenticación]
 *     summary: La sesión actual
 *     description: |
 *       Devuelve la cuenta detrás del token. El rol sale de la **fila del usuario**, no
 *       del token: degradar a alguien surtía efecto solo cuando su token expiraba —hasta
 *       siete días— y ahora se aplica en la petición siguiente.
 *     responses:
 *       200:
 *         description: Datos de la sesión.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
router.get('/me', requireAuthConConfiguracionPendiente, AuthController.me);

/**
 * @openapi
 * /api/change-password:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cambiar la propia contraseña
 *     description: |
 *       Cambio de la contraseña de la propia sesión. `currentPassword` es obligatoria
 *       solo con el primer ingreso pendiente; en el cambio voluntario es opcional y, si
 *       se envía, se comprueba. La nueva pasa por la política de composición, y el
 *       cambio queda registrado en la bitácora con su motivo (`cambio-voluntario`),
 *       como exige la Ley 1581.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *             required: [newPassword]
 *     responses:
 *       200:
 *         description: Contraseña cambiada.
 *       400:
 *         description: La contraseña actual no coincide, o la nueva incumple la política.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
router.post('/change-password', requireAuthConConfiguracionPendiente, AuthController.changePassword);

export default router;
