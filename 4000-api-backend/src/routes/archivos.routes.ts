import { Router } from 'express';
import { ArchivosController } from '../controllers/archivos.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoPagina } from '../middlewares/permisos.middleware';
import { limitadorGlobal } from '../middlewares/rate-limit.middleware';
import { recibirArchivo } from '../middlewares/recibir-archivo.middleware';

/**
 * Los adjuntos de las páginas: la única puerta al filesystem desde fuera.
 *
 * El navegador nunca llama aquí por su nombre. Pide `/uploads/...`, `/backup/...` y
 * `/api/upload` al sitio o a la intranet, como siempre, y quien está delante —nginx en
 * el servidor, el `next.config` de cada frontend en desarrollo— lo reenvía a
 * `/api/archivos/{ambito}/...`. Por eso el ámbito va en la ruta y no en `X-Ambito`: lo
 * fija ese reenvío, no un cliente que pueda olvidarlo.
 *
 * Este router se monta **antes** del `limitadorGlobal` (ver `app.ts`): una página pública
 * pide una docena de imágenes de golpe, y detrás de la red de una sede todo el mundo
 * comparte IP. Contadas con el techo general, unas pocas visitas a la vez dejarían a la
 * sede sin imágenes. Servir un archivo no toca la base, así que no hay nada que proteger
 * con ese límite; la subida sí lo lleva, puesto a mano.
 */
const router = Router();

/**
 * Subir: quien puede editar páginas, con el mismo criterio que guardar un borrador. Los
 * route handlers de los frontends que hacían esto antes solo pedían sesión; cualquier
 * cuenta, aunque no editara nada, podía llenar el disco.
 */
const guardiasDeSubida = [limitadorGlobal, requireAuth, requierePermisoPagina('puedeEditar'), recibirArchivo()];

/**
 * @openapi
 * /api/archivos/sitio:
 *   post:
 *     tags: [Adjuntos]
 *     summary: Subir un adjunto para una página del sitio web
 *     description: |
 *       Lo usan los campos de imagen y archivo del editor, a través de `/api/upload` del
 *       sitio. Valida el tipo real por magic bytes contra la lista blanca de
 *       `@olo/upload-policy` (PDF, Excel, Word, PowerPoint, JPG, PNG; sin SVG), aplica el
 *       límite de su tipo y lo guarda con nombre UUID en `sitio/uploads/{tipo}/`.
 *
 *       No lo anota como subida pendiente: eso lo hace después el editor con
 *       `POST /api/paginas/{slug}/subidas`.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Guardado. `url` es la ruta con la que el contenido lo nombra.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 url: { type: string, example: /uploads/img/3f1c…-….png }
 *                 nombreOriginal: { type: string, example: Informe técnico.pdf }
 *                 peso: { type: integer, description: Bytes }
 *       400: { description: No llegó ningún archivo }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       413: { description: Supera el tamaño máximo de su tipo }
 *       415: { description: Tipo no permitido }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 * /api/archivos/intranet:
 *   post:
 *     tags: [Adjuntos]
 *     summary: Subir un adjunto para una página de la intranet
 *     description: Igual que el del sitio web, pero lo guarda en `intranet/uploads/{tipo}/`.
 *     responses:
 *       200: { description: Guardado }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.post('/sitio', ...guardiasDeSubida, ArchivosController.subir('sitio'));
router.post('/intranet', ...guardiasDeSubida, ArchivosController.subir('intranet'));

/**
 * @openapi
 * /api/archivos/sitio/{ruta}:
 *   get:
 *     tags: [Adjuntos]
 *     summary: Servir un adjunto del sitio web
 *     description: |
 *       Pública, sin sesión: son los archivos de las páginas públicas. El sitio la
 *       expone como `/uploads/...` y `/backup/...`. Solo sirve lo que esté dentro de
 *       `uploads/` o `backup/` y tenga un tipo que se pueda subir.
 *
 *       Lo de `uploads/` con nombre UUID sale con caché de un año (`immutable`): ese
 *       nombre nunca vuelve a usarse para otro contenido.
 *     security: []
 *     parameters:
 *       - { name: ruta, in: path, required: true, schema: { type: string }, example: uploads/img/3f1c….png }
 *     responses:
 *       200: { description: El archivo }
 *       304: { description: El navegador ya tiene esta versión }
 *       404: { description: No existe o no se sirve }
 */
router.get('/sitio/*ruta', ArchivosController.servir('sitio'));

/**
 * @openapi
 * /api/archivos/intranet/{ruta}:
 *   get:
 *     tags: [Adjuntos]
 *     summary: Servir un adjunto de la intranet
 *     description: |
 *       Exige sesión de alguien que pueda ver la intranet, igual que sus páginas. Antes
 *       esto lo comprobaba solo el middleware de la intranet; ahora lo comprueba también
 *       quien tiene el archivo. Se revalida en cada petición (`private, no-cache`).
 *     parameters:
 *       - { name: ruta, in: path, required: true, schema: { type: string }, example: uploads/pdf/3f1c….pdf }
 *     responses:
 *       200: { description: El archivo }
 *       304: { description: El navegador ya tiene esta versión }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: No existe o no se sirve }
 */
router.get(
  '/intranet/*ruta',
  requireAuth,
  requierePermisoPagina('puedeVer'),
  ArchivosController.servir('intranet')
);

export default router;
