import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { requireAuth } from './middlewares/auth.middleware';
import { requierePermisoUsuario } from './middlewares/permisos.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { UserController } from './controllers/usuarios.controller';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import rolePermissionRoutes from './routes/rolePermission.routes';
import contenidoRoutes from './routes/contenido.routes';
import sectionRoutes from './routes/section.routes';
import attachmentRoutes from './routes/attachment.routes';
import auditRoutes from './routes/audit.routes';
import securityQuestionRoutes from './routes/securityQuestion.routes';
import paginaRoutes from './routes/pagina.routes';
import jobRoutes from './routes/job.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: [config.frontendUrl, config.intranetUrl], credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', authRoutes);

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
app.use('/api/sections', sectionRoutes);
app.use('/api/contenidos', contenidoRoutes);
app.use('/api/security-questions', securityQuestionRoutes);
app.use('/api/paginas', paginaRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/jobs', jobRoutes);
// El borrado de adjuntos vivía aparte, en `/api/attachments/:id`, sin el contenido al
// que pertenecen en la ruta: no había padre contra el que comprobar nada. Ahora cuelga
// de este mismo router, que sí lo recibe por `mergeParams`.
app.use('/api/contenidos/:contenidoId/attachments', attachmentRoutes);

app.use(errorHandler);

export { app };
