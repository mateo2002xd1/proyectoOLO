import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { requireAuth } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { UserController } from './controllers/usuarios.controller';
import { AttachmentController } from './controllers/adjuntos.controller';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import rolePermissionRoutes from './routes/rolePermission.routes';
import postRoutes from './routes/post.routes';
import sectionRoutes from './routes/section.routes';
import attachmentRoutes from './routes/attachment.routes';
import auditRoutes from './routes/audit.routes';
import sitioUserRoutes from './routes/sitioUser.routes';
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
app.get('/api/alerts', requireAuth, UserController.getExpirationAlerts);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/security-questions', securityQuestionRoutes);
app.use('/api/sitio-users', sitioUserRoutes);
app.use('/api/paginas', paginaRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/posts/:postId/attachments', attachmentRoutes);
app.delete('/api/attachments/:id', requireAuth, AttachmentController.delete);

app.use(errorHandler);

export { app };
