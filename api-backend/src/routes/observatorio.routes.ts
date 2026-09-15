import { Router } from 'express';
import express from 'express';
import { ObservatorioController } from '../controllers/observatorio.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoContenido } from '../middlewares/permisos.middleware';

const router = Router();

// Protegemos la ruta para que solo administradores o editores puedan importar data
router.use(requireAuth);

/**
 * Endpoint para subir Excel en crudo a la memoria.
 * No guarda el archivo en disco, lo lee directamente desde el Buffer
 * usando express.raw para recibir application/octet-stream.
 */
router.post(
  '/importar',
  // Requiere poder editar en el CMS (o algún permiso específico del observatorio)
  requierePermisoContenido('puedeEditar'),
  express.raw({ type: 'application/octet-stream', limit: '50mb' }),
  ObservatorioController.importar
);

export default router;
