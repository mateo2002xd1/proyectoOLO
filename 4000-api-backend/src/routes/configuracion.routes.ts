import { Router } from 'express';
import { ConfiguracionController } from '../controllers/configuracion.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/require-permission.middleware';
import { recibirArchivo } from '../middlewares/recibir-archivo.middleware';
import { validarCuerpo } from '../middlewares/validar.middleware';
import { actualizarIdentidadSchema, PIEZAS_DE_IDENTIDAD } from '../validators/configuracion.validators';

/**
 * Configuración del panel. Hoy, su identidad visual: logo, icono y color de las
 * etiquetas de las acciones (migración 044).
 *
 * Leerla pide sesión y nada más: la lee el panel y también el editor, al que entra quien
 * edita sin tener `acceso.panel`. Cambiarla pide `configuracion.identidad`.
 */
const router = Router();

/** Corte grueso de multer; el límite de cada pieza lo aplica el caso de uso. */
const LIMITE_DE_SUBIDA = 1024 * 1024;

const puedeCambiarla = [requireAuth, requirePermission('configuracion.identidad')];

/**
 * @openapi
 * /api/configuracion/identidad-panel/archivos/{nombre}:
 *   get:
 *     tags: [Configuración]
 *     summary: Servir el logo o el icono del panel
 *     description: |
 *       Sin sesión: el navegador pide el icono de la pestaña por su cuenta. El panel la
 *       expone como `/identidad-panel/{nombre}` (rewrite de `next.config.mjs`). Solo
 *       sirve nombres con la forma que pone la subida (UUID + `.png`/`.jpg`), con caché de
 *       un año: un logo nuevo lleva otro nombre.
 *     security: []
 *     parameters:
 *       - { name: nombre, in: path, required: true, schema: { type: string }, example: 3f1c….png }
 *     responses:
 *       200: { description: La imagen }
 *       404: { description: No existe }
 */
router.get('/identidad-panel/archivos/:nombre', ConfiguracionController.servirArchivo);

/**
 * @openapi
 * /api/configuracion/identidad-panel:
 *   get:
 *     tags: [Configuración]
 *     summary: Consultar la identidad visual del panel
 *     description: |
 *       Lo que se cambió en Configuración. Lo que no viene (`logo: null`, una acción que
 *       no está en `acciones`) va con el de fábrica, que decide el frontend.
 *     responses:
 *       200:
 *         description: La identidad.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logo: { type: string, nullable: true, example: 3f1c….png }
 *                 icono: { type: string, nullable: true }
 *                 blancoEnModoOscuro: { type: boolean }
 *                 acciones:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       fondo: { type: string, example: '#7db728' }
 *                       texto: { type: string, example: '#ffffff' }
 *                 botones:
 *                   type: object
 *                   description: Igual que acciones, para los tipos de botón (principal, peligro…).
 *                 actualizadoEn: { type: string, format: date-time, nullable: true }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *   patch:
 *     tags: [Configuración]
 *     summary: Cambiar los colores de las etiquetas y los botones, o el logo en modo oscuro
 *     description: |
 *       `acciones` y `botones` reemplazan su conjunto entero: lo que no viene vuelve a
 *       lo de fábrica. Los colores solo como `#rrggbb`: el panel los escribe en una etiqueta
 *       `<style>`. Queda en la bitácora como `actualizar` sobre `configuracion`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acciones: { type: object }
 *               botones: { type: object }
 *               blancoEnModoOscuro: { type: boolean }
 *     responses:
 *       200: { description: La identidad ya guardada }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get('/identidad-panel', requireAuth, ConfiguracionController.obtenerIdentidad);
router.patch(
  '/identidad-panel',
  ...puedeCambiarla,
  validarCuerpo(actualizarIdentidadSchema),
  ConfiguracionController.actualizarIdentidad
);

/**
 * @openapi
 * /api/configuracion/identidad-panel/{pieza}:
 *   post:
 *     tags: [Configuración]
 *     summary: Subir el logo o el icono del panel
 *     description: |
 *       Solo PNG, comprobado por magic bytes con `@olo/upload-policy`. Logo hasta 1 MB,
 *       icono hasta 512 KB. Reemplaza y borra el anterior.
 *     parameters:
 *       - { name: pieza, in: path, required: true, schema: { type: string, enum: [logo, icono] } }
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
 *       200: { description: La identidad ya guardada }
 *       400: { description: No llegó ningún archivo }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       413: { description: Supera el tamaño de su pieza }
 *       415: { description: No es PNG }
 *   delete:
 *     tags: [Configuración]
 *     summary: Volver al logo o al icono de fábrica
 *     parameters:
 *       - { name: pieza, in: path, required: true, schema: { type: string, enum: [logo, icono] } }
 *     responses:
 *       200: { description: La identidad ya guardada }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
for (const pieza of PIEZAS_DE_IDENTIDAD) {
  router.post(
    `/identidad-panel/${pieza}`,
    ...puedeCambiarla,
    recibirArchivo(LIMITE_DE_SUBIDA),
    ConfiguracionController.subirImagen(pieza)
  );
  router.delete(`/identidad-panel/${pieza}`, ...puedeCambiarla, ConfiguracionController.restablecerImagen(pieza));
}

export default router;
