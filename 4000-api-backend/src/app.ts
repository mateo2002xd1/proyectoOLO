import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { limitadorGlobal } from './middlewares/rate-limit.middleware';
import { requireAuth } from './middlewares/auth.middleware';
import { requierePermisoUsuario } from './middlewares/permisos.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { UserController } from './controllers/usuarios.controller';
import { montarDocumentacion } from './docs/montar-docs';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import rolePermissionRoutes from './routes/role-permission.routes';
import auditRoutes from './routes/audit.routes';
import securityQuestionRoutes from './routes/security-question.routes';
import paginaRoutes from './routes/pagina.routes';
import observatorioRoutes from './routes/observatorio.routes';
import alertasInversionRoutes from './routes/alertas-inversion.routes';
import archivosRoutes from './routes/archivos.routes';

const app = express();

/**
 * Express lee `X-Forwarded-For` en vez de la IP del socket.
 *
 * Sin esto `req.ip` era la IP de nginx —o la del contenedor de Next, para todo lo que
 * pasa por el BFF del sitio web— y cualquier límite por IP se convertía en un cubo
 * único compartido por toda la institución.
 *
 * El valor 1 significa «confía en un salto»: se toma la dirección más a la derecha de
 * la cabecera, que es justamente la que escribe nginx con `$proxy_add_x_forwarded_for`.
 * Las que el cliente haya podido inyectar quedan a su izquierda y se ignoran, así que
 * activar esto no abre la puerta a falsificar la IP.
 */
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: [config.frontendUrl, config.intranetUrl], credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Sistema]
 *     summary: Estado del servicio
 *     description: |
 *       Sonda de vida. La consultan nginx y Docker en bucle para decidir si el
 *       contenedor está sano, así que no toca la base de datos ni exige sesión: si
 *       dependiera de Postgres, una base caída se llevaría por delante al propio
 *       contenedor en vez de dejarlo responder que sigue en pie.
 *     security: []
 *     responses:
 *       200:
 *         description: El servicio responde.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 timestamp: { type: string, format: date-time }
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// La documentación va aquí por lo mismo que `/health`: abrir el visor pide media docena
// de archivos estáticos de golpe y no tiene sentido gastarle a nadie su cupo por minuto
// leyendo documentación. Los endpoints que el visor prueba sí pasan por los límites.
montarDocumentacion(app);

// Los adjuntos de las páginas, también antes del techo general: una página pública pide
// una docena de imágenes de golpe. La subida lleva el limitador puesto a mano; el porqué,
// en `archivos.routes.ts`.
app.use('/api/archivos', archivosRoutes);

// Techo general de la API: ninguna ruta queda sin límite aunque su router no declare
// el suyo. Va después de `/health` a propósito — nginx y Docker lo consultan en bucle
// y no tiene sentido gastarles cupo.
app.use(limitadorGlobal);

app.use('/api', authRoutes);

/**
 * @openapi
 * /api/alerts:
 *   get:
 *     tags: [Usuarios]
 *     summary: Cuentas próximas a caducar
 *     description: |
 *       Lista las cuentas cuya `expiration_date` se acerca (RF-16), para que
 *       administración renueve antes de que alguien se quede fuera.
 *
 *       **Por qué no basta con tener sesión**: la respuesta trae correo y fecha de
 *       vencimiento de toda la plantilla. Durante un tiempo solo llevó `requireAuth` y
 *       cualquier cuenta podía leerla; es un panel de administración y exige
 *       `puedeAdministrarUsuarios`.
 *     responses:
 *       200:
 *         description: Cuentas por vencer.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/AlertaCaducidad' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
// Las alertas de caducidad listan correo y fecha de vencimiento de toda la plantilla.
// Con solo `requireAuth` las leía cualquier sesión; es un panel de administración.
app.get(
  '/api/alerts',
  requireAuth,
  requierePermisoUsuario('puedeAdministrarUsuarios'),
  UserController.getExpirationAlerts
);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/security-questions', securityQuestionRoutes);
app.use('/api/paginas', paginaRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/observatorio', observatorioRoutes);
app.use('/api/alertas-inversion', alertasInversionRoutes);

app.use(errorHandler);

export { app };
