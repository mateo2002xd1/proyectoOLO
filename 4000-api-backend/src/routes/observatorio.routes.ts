import { Router } from 'express';
import multer from 'multer';
import { ObservatorioController } from '../controllers/observatorio.controller';
import { TendenciaOcupacionalController } from '../controllers/tendencia-ocupacional.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requierePermisoObservatorio } from '../middlewares/permisos.middleware';
import { validarCuerpo } from '../middlewares/validar.middleware';
import { cargaTendenciaSchema, publicarCortesSchema } from '../validators/tendencia-ocupacional.validators';
import { LIMITE_ABSOLUTO_BYTES } from '@olo/upload-policy';

const router = Router();

// En memoria: el archivo se valida por magic bytes y se escribe a disco desde el
// use-case, no desde el middleware — mismo orden que ya sigue `@olo/upload-policy`
// en los otros dos frontends (tamaño → tipo real → lista blanca → nombre).
//
// Reemplaza al `express.raw({ type: 'application/octet-stream' })` de la primera
// versión de esta ruta: aquella no validaba tipo real por magic bytes ni guardaba
// nombre original, y no dejaba rastro de quién subió qué.
const subidaEnMemoria = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_ABSOLUTO_BYTES },
});

/**
 * @openapi
 * /api/observatorio/programas-sobresalientes:
 *   get:
 *     tags: [Observatorio]
 *     summary: Datos vigentes del mapa de formación por departamento
 *     description: |
 *       El contenido completo de `programas_sobresalientes` — pública, sin sesión,
 *       porque es analítica agregada y no dato personal. Cada carga vacía y
 *       recarga la tabla entera, así que esto siempre refleja la última carga
 *       que terminó bien.
 *     security: []
 *     responses:
 *       200:
 *         description: Registros vigentes.
 */
router.get('/programas-sobresalientes', ObservatorioController.obtenerActual);

/**
 * @openapi
 * /api/observatorio/tendencia-ocupacional:
 *   get:
 *     tags: [Observatorio]
 *     summary: Buscador de tendencia ocupacional (percentiles inscritos vs. vacantes)
 *     description: |
 *       Pública, sin sesión, y solo sobre cortes publicados. Cada bloque del sitio
 *       consulta un criterio; los filtros y la paginación se aplican en SQL y los
 *       totales suman todas las filas que cumplen los filtros, no solo la página.
 *       Las ocupaciones con 0 inscritos y 0 vacantes se ocultan salvo
 *       `incluirSinRegistros=true`.
 *     security: []
 *     parameters:
 *       - { name: anio, in: query, required: true, schema: { type: integer, minimum: 1000, maximum: 9999 } }
 *       - { name: periodo, in: query, required: true, schema: { type: string, enum: [T1, T2, T3, T4, S1, S2, ANUAL] } }
 *       - name: departamento
 *         in: query
 *         required: true
 *         description: "`nacional` o el código DANE de dos dígitos."
 *         schema: { type: string, example: nacional }
 *       - name: criterio
 *         in: query
 *         description: Código del criterio. Omitido, los cuatro.
 *         schema:
 *           type: string
 *           enum: [ALTA_OFERTA_ALTA_DEMANDA, ALTA_OFERTA_BAJA_DEMANDA, BAJA_OFERTA_ALTA_DEMANDA, BAJA_OFERTA_BAJA_DEMANDA]
 *       - { name: nivel, in: query, description: Omitido, todos los niveles., schema: { type: string, enum: ['0', A, B, C, D] } }
 *       - { name: q, in: query, description: Parte del nombre o código exacto., schema: { type: string, maxLength: 100 } }
 *       - { name: incluirSinRegistros, in: query, schema: { type: boolean, default: false } }
 *       - { name: pagina, in: query, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { name: porPagina, in: query, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       200: { description: Registros de la página, totales y departamentos con resultados. }
 *       400: { description: Filtros inválidos. }
 */
router.get('/tendencia-ocupacional', TendenciaOcupacionalController.buscar);

/**
 * @openapi
 * /api/observatorio/tendencia-ocupacional/opciones:
 *   get:
 *     tags: [Observatorio]
 *     summary: Opciones de los filtros del buscador de tendencia ocupacional
 *     description: |
 *       Años con algún corte publicado, los siete periodos (marcando cuáles tienen
 *       datos en el año pedido o, si no se pide, en el más reciente), niveles con su
 *       descripción, "Nacional" + los 33 departamentos y los cuatro criterios.
 *     security: []
 *     parameters:
 *       - { name: anio, in: query, schema: { type: integer, minimum: 1000, maximum: 9999 } }
 *     responses:
 *       200: { description: Opciones de los filtros. }
 */
router.get('/tendencia-ocupacional/opciones', TendenciaOcupacionalController.opciones);

router.get('/fuentes-futuras-empleo', ObservatorioController.obtenerFuentesFuturasEmpleo);

router.use(requireAuth);
router.use(requierePermisoObservatorio('puedeActualizarDatos'));

/**
 * @openapi
 * /api/observatorio/cargas:
 *   get:
 *     tags: [Observatorio]
 *     summary: Historial de cargas
 *     responses:
 *       200: { description: Historial de cargas del módulo. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *   post:
 *     tags: [Observatorio]
 *     summary: Sube el Excel y actualiza la base de datos de inmediato
 *     description: |
 *       Solo Administrador y Superadmin — no hay editor en este flujo ni paso de
 *       aprobación. El archivo se valida (tipo real por magic bytes, solo `.xlsx`,
 *       tamaño) y se procesa de forma asíncrona en la cola de trabajos pesados; esta
 *       respuesta llega antes de que la carga termine.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *             required: [file]
 *     responses:
 *       202: { description: Archivo recibido, procesando. }
 *       400: { description: No se envió archivo. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       415: { description: Tipo de archivo no permitido. }
 */
router.get('/cargas', ObservatorioController.listarCargas);
router.post('/cargas', subidaEnMemoria.single('file'), ObservatorioController.subir);

/**
 * @openapi
 * /api/observatorio/cargas/{id}:
 *   get:
 *     tags: [Observatorio]
 *     summary: Estado de una carga puntual
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Estado de la carga. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: Carga no encontrada. }
 */
router.get('/cargas/:id', ObservatorioController.obtenerCarga);

/**
 * @openapi
 * /api/observatorio/cargas/{id}:
 *   delete:
 *     tags: [Observatorio]
 *     summary: Elimina una carga del historial
 *     description: |
 *       Borra la fila de auditoría y, si ningún otro registro comparte el mismo
 *       archivo (mismo Excel subido dos veces, o adjunto en un contenido de
 *       RF-02), también el Excel guardado en disco. Nunca toca los datos ya
 *       importados a `programas_sobresalientes`.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Eliminada. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: Carga no encontrada. }
 */
router.delete('/cargas/:id', ObservatorioController.eliminarCarga);

/**
 * @openapi
 * /api/observatorio/formatos/{formato}:
 *   get:
 *     tags: [Observatorio]
 *     summary: Descarga el Excel de ejemplo de una carga
 *     description: |
 *       El archivo con las hojas y columnas que espera cada carga de "Actualizaciones",
 *       tomado de `uploads/formatos-carga/`. Solo se sirven los formatos de la lista:
 *       la ruta lleva un identificador, nunca un nombre de archivo.
 *     parameters:
 *       - name: formato
 *         in: path
 *         required: true
 *         schema: { type: string, enum: [programas-sobresalientes, tendencia-ocupacional] }
 *     responses:
 *       200:
 *         description: El Excel, como adjunto `formato-{formato}.xlsx`.
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: Formato desconocido o sin archivo en el servidor. }
 */
router.get('/formatos/:formato', ObservatorioController.descargarFormato);

/**
 * @openapi
 * /api/observatorio/tendencia-ocupacional/cargas:
 *   get:
 *     tags: [Observatorio]
 *     summary: Historial de cargas de percentiles (trazabilidad por año y periodo)
 *     description: |
 *       De la más reciente a la más antigua, con quién subió cada archivo, el estado de
 *       hoy del corte y `vigente` (la carga cuyos datos tiene hoy el corte). Una carga se
 *       quita con `DELETE /tendencia-ocupacional/cargas/{id}`.
 *     parameters:
 *       - { name: anio, in: query, schema: { type: integer, minimum: 1000, maximum: 9999 } }
 *       - { name: periodo, in: query, schema: { type: string, enum: [T1, T2, T3, T4, S1, S2, ANUAL] } }
 *       - { name: pagina, in: query, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { name: porPagina, in: query, schema: { type: integer, minimum: 1, maximum: 50, default: 10 } }
 *     responses:
 *       200: { description: "`{ cargas, total, pagina, porPagina, totalPaginas }`." }
 *       400: { description: Filtros inválidos. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *   post:
 *     tags: [Observatorio]
 *     summary: Sube el Excel de percentiles de una celda (año × periodo)
 *     description: |
 *       Un archivo por petición, con hojas «percentiles nacional» y «percentiles
 *       departamental». El Excel no trae año ni periodo: se eligen aquí. Se procesa en
 *       la cola de trabajos pesados con las validaciones V1–V9; esta respuesta llega
 *       antes de que termine. El corte nuevo queda en borrador. Solo en una celda sin
 *       datos: para cambiar el archivo de una celda, se elimina antes su carga.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               anio: { type: integer, minimum: 1000, maximum: 9999 }
 *               periodo: { type: string, enum: [T1, T2, T3, T4, S1, S2, ANUAL] }
 *             required: [file, anio, periodo]
 *     responses:
 *       202: { description: Archivo recibido, procesando. }
 *       400: { description: Falta el archivo o la celda no es válida. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       409: { description: La celda ya tiene datos (en borrador o publicados) o una carga en curso. }
 *       415: { description: Tipo de archivo no permitido. }
 */
router.get('/tendencia-ocupacional/cargas', TendenciaOcupacionalController.listarCargas);
router.post(
  '/tendencia-ocupacional/cargas',
  subidaEnMemoria.single('file'),
  validarCuerpo(cargaTendenciaSchema),
  TendenciaOcupacionalController.subir
);

/**
 * @openapi
 * /api/observatorio/tendencia-ocupacional/cargas/{id}:
 *   get:
 *     tags: [Observatorio]
 *     summary: Estado y reporte de validaciones de una carga de percentiles
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: La carga, con errores y advertencias por validación. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: Carga no encontrada. }
 */
router.get('/tendencia-ocupacional/cargas/:id', TendenciaOcupacionalController.obtenerCarga);

/**
 * @openapi
 * /api/observatorio/tendencia-ocupacional/cargas/{id}:
 *   delete:
 *     tags: [Observatorio]
 *     summary: Elimina una carga del historial y su Excel
 *     description: |
 *       El Excel se borra de `uploads/cargas-datos/` salvo que otra carga lo use (los archivos
 *       se deduplican por contenido). Si la carga es la vigente de su año y periodo, se borran
 *       también los datos del corte, y el sitio deja de mostrarlos si estaban publicados. Una
 *       carga reemplazada o fallida se borra sin tocar los datos.
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: "Eliminada. `datosEliminados` dice qué año y periodo perdió sus datos; `archivoEliminado`, si se borró el Excel." }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { description: No existe o no es de tendencia ocupacional. }
 *       409: { description: Hay una carga guardando datos en ese año y periodo. }
 */
router.delete(
  '/tendencia-ocupacional/cargas/:id',
  requierePermisoObservatorio('puedePublicarDatos'),
  TendenciaOcupacionalController.eliminarCarga
);

/**
 * @openapi
 * /api/observatorio/tendencia-ocupacional/estado:
 *   get:
 *     tags: [Observatorio]
 *     summary: Matriz año × periodo con el estado de cada celda
 *     description: "`estado_celda`: pendiente, procesando, borrador, publicado o fallido. Crece sola cada enero."
 *     responses:
 *       200: { description: Una fila por celda, del año más reciente al más antiguo. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get('/tendencia-ocupacional/estado', TendenciaOcupacionalController.estado);

/**
 * @openapi
 * /api/observatorio/tendencia-ocupacional/cortes/publicar:
 *   post:
 *     tags: [Observatorio]
 *     summary: Publica en bloque cortes en borrador
 *     description: Los que ya estaban publicados o no existen se ignoran; la respuesta lista los que cambiaron.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               corteIds: { type: array, items: { type: string, format: uuid }, minItems: 1, maxItems: 200 }
 *             required: [corteIds]
 *     responses:
 *       200: { description: Cortes publicados. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.post(
  '/tendencia-ocupacional/cortes/publicar',
  requierePermisoObservatorio('puedePublicarDatos'),
  validarCuerpo(publicarCortesSchema),
  TendenciaOcupacionalController.publicar
);

/**
 * @openapi
 * /api/observatorio/tendencia-ocupacional/cortes/{id}/despublicar:
 *   patch:
 *     tags: [Observatorio]
 *     summary: Devuelve un corte publicado a borrador
 *     description: Deja de verse en el sitio; sus datos se conservan.
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       204: { description: Despublicado. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       409: { description: El corte no existe o no está publicado. }
 */
router.patch(
  '/tendencia-ocupacional/cortes/:id/despublicar',
  requierePermisoObservatorio('puedePublicarDatos'),
  TendenciaOcupacionalController.despublicar
);

export default router;
