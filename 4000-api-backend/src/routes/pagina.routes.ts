import { Router } from 'express';
import { PaginaController } from '../controllers/pagina.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { cacheInterceptor } from '../middlewares/cache.middleware';
import { requierePermisoPagina } from '../middlewares/permisos.middleware';
import { limitadorDeEscritura, limitadorDeVisitas, limitadorDeVisitasPorPagina } from '../middlewares/rate-limit.middleware';
import { validarCuerpo } from '../middlewares/validar.middleware';
import {
  adquirirBloqueoSchema,
  crearSeccionSchema,
  cambiarDireccionSchema,
  eliminarSeccionSchema,
  enviarARevisionSchema,
  guardarBorradorSchema,
  motivoDeDecisionSchema,
  registrarSubidaSchema,
} from '../validators/paginas.validators';
import {
  requirePermission,
  requierePermisoDeSeccion,
} from '../middlewares/require-permission.middleware';
import { AMBITO_HEADER } from '../shared/ambito';

const router = Router();

/**
 * Las escrituras del editor las limita `limitadorDeEscritura`, definido en
 * `rate-limit.middleware.ts` junto a los demás.
 *
 * El TODO que había aquí —«se aplica por IP; para granularidad por usuario, añadir
 * keyGenerator con req.user?.id»— ya está hecho: la fábrica cuenta por sesión cuando
 * la hay, y estas rutas van todas después del `requireAuth` de abajo, así que la hay.
 * Contar por IP era especialmente malo justo en este endpoint: una sede entera detrás
 * del mismo NAT compartía las treinta escrituras por minuto entre todos sus editores,
 * y el autoguardado se las gastaba solo.
 */

/**
 * @openapi
 * /api/paginas/publica/{slug}:
 *   get:
 *     tags: [Páginas]
 *     summary: Página publicada (público)
 *     description: |
 *       Devuelve el contenido **publicado** de una página, que es lo que pintan el
 *       sitio y la intranet. No exige sesión.
 *
 *       **El ámbito entra en la clave de caché**, y tiene que hacerlo: el sitio y la
 *       intranet comparten la tabla y ambos tienen su `/inicio`, así que sin separar
 *       por `X-Ambito` una de las dos aplicaciones acabaría sirviendo la portada de la
 *       otra. Buscar por slug a secas devolvía justo eso.
 *
 *       **Los slugs jerárquicos no existen**: es `encuestas-calidad-de-formacion`, con
 *       guion, y no `encuestas/calidad-de-formacion`. Un parámetro de Express no cruza
 *       una barra, así que un slug con barra no encontraría la ruta.
 *
 *       Respuesta cacheada 5 minutos. Aprobar una página invalida su entrada.
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200:
 *         description: La página publicada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagina' }
 *       404:
 *         description: No existe una página publicada con ese slug en ese ámbito.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// El ámbito entra en la clave de caché: `/publica/inicio` devuelve una página
// distinta según la pida el sitio o la intranet.
router.get(
  '/publica/:slug',
  cacheInterceptor(300, { varyBy: [AMBITO_HEADER] }),
  PaginaController.obtenerPublica
);

router.get(
  '/indice-busqueda',
  cacheInterceptor(300, { varyBy: [AMBITO_HEADER] }),
  PaginaController.obtenerIndiceBusqueda
);

/**
 * @openapi
 * /api/paginas/titulos:
 *   get:
 *     tags: [Páginas]
 *     summary: Títulos de las páginas publicadas (público)
 *     description: |
 *       Slug y título de cada página con una versión publicada en el ámbito, sin su
 *       contenido. Es lo que el sitio necesita en cada visita para rotular las migas de
 *       pan; el índice de búsqueda trae lo mismo con todo el texto y sería excesivo.
 *       No exige sesión. Respuesta cacheada 5 minutos por ámbito; aprobar una página
 *       invalida la entrada.
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200:
 *         description: Los títulos, ordenados por slug.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   slug: { type: string }
 *                   titulo: { type: string }
 */
// El ámbito entra en la clave de caché, igual que en las dos de arriba.
router.get(
  '/titulos',
  cacheInterceptor(300, { varyBy: [AMBITO_HEADER] }),
  PaginaController.obtenerTitulos
);

router.post(
  '/visitas/registrar',
  limitadorDeVisitas,
  limitadorDeVisitasPorPagina,
  PaginaController.registrarVisita
);

router.use(requireAuth);

/**
 * Dos capas sobre cada operación de edición, y hacen cosas distintas:
 *
 *  - `requierePermisoPagina('puedeEditar')` — **si** esta persona edita. Va por rol:
 *    dirección y subdirección entran a la intranet pero no editan.
 *  - `requierePermisoDeSeccion()` — **qué** puede editar. Va por `roles_permisos`, con
 *    la clave `editar.{ambito}.{slug}` construida desde la petición.
 *
 * La segunda es la que ata a un editor a secciones concretas, que es lo que el catálogo
 * de permisos existe para poder decir. La primera se conserva porque sigue siendo cierta
 * y porque un fallo en una no debe abrir la otra (§0.2 de 3-seguridad-del-proyecto.md).
 */
/**
 * Crear una sección.
 *
 * No lleva `requierePermisoDeSeccion()` —y no es un olvido—: ese middleware exige que
 * la sección ya exista, así que aplicarlo aquí haría imposible crear la primera. El
 * poder que reparte esta ruta lo controla `secciones.crear`, que es una clave fija y
 * por tanto sí se puede exigir antes de saber de qué sección hablamos.
 *
 * Va antes que `/:slug/...` por costumbre de lectura, no por necesidad: Express
 * distingue `POST /` de `POST /:slug/borrador` por la forma de la ruta, no por el
 * orden.
 */
/**
 * @openapi
 * /api/paginas:
 *   post:
 *     tags: [Páginas]
 *     summary: Crear una sección editable
 *     description: |
 *       Da de alta una página nueva del portal y siembra su clave de permiso
 *       (`editar.{ambito}.{slug}`).
 *
 *       **Solo viaja el nombre: el slug lo calcula el servidor.** Dejar que el cliente
 *       mandara la ruta sería dejarle elegir la clave de permiso que se va a crear, y
 *       eso no se negocia desde el navegador. El diálogo del editor la muestra
 *       mientras se escribe usando la misma política de slugs, así que quien crea ve la
 *       de verdad antes de confirmar.
 *
 *       El tope de 120 caracteres es del **título**, no de la ruta: un nombre largo es
 *       legítimo y se guarda entero; el slug se recorta aparte.
 *
 *       **No lleva `requierePermisoDeSeccion` y no es un olvido**: ese control exige que
 *       la sección ya exista, así que aplicarlo aquí haría imposible crear la primera.
 *       Lo que sí exige es `secciones.crear`, que es una clave fija.
 *     parameters:
 *       - $ref: '#/components/parameters/Ambito'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *                 example: Tasa de vinculación laboral
 *             required: [titulo]
 *             additionalProperties: false
 *     responses:
 *       201:
 *         description: Sección creada, con el slug que calculó el servidor.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagina' }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post(
  '/',
  limitadorDeEscritura,
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.crear'),
  validarCuerpo(crearSeccionSchema),
  PaginaController.crearSeccion
);

/**
 * Eliminar una sección, y su consulta previa.
 *
 * Van con `secciones.eliminar` y **no** con `requierePermisoDeSeccion()`, que sería lo
 * natural pero aquí hace daño: ese middleware exige la clave `editar.{ambito}.{slug}`,
 * que solo tiene el rol que creó la sección. Un administrador que llega a limpiar algo
 * que no creó él se quedaría fuera de la única ruta que sirve para limpiarlo.
 */
/**
 * @openapi
 * /api/paginas/{slug}/eliminable:
 *   get:
 *     tags: [Páginas]
 *     summary: Comprobar si una sección se puede eliminar
 *     description: |
 *       Consulta previa al borrado: dice si la sección se puede eliminar y qué se
 *       llevaría por delante, para que el diálogo lo enseñe antes de preguntar.
 *
 *       Las secciones **de fábrica** (`inicio`, `tasa`, `matriz` y las dos de
 *       encuestas) no se eliminan: hay código que da por hecho que existen, y borrar
 *       `inicio` deja el portal sin portada.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200:
 *         description: Veredicto y motivo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eliminable: { type: boolean }
 *                 motivo: { type: string, nullable: true }
 *                 versiones: { type: integer, description: Versiones que se borrarían. }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get(
  '/:slug/eliminable',
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.eliminar'),
  PaginaController.analizarEliminacion
);

/**
 * @openapi
 * /api/paginas/{slug}:
 *   delete:
 *     tags: [Páginas]
 *     summary: Eliminar una sección
 *     description: |
 *       Borra la sección, sus versiones y su clave de permiso. **No se deshace.**
 *
 *       **`confirmacion` es el título de la sección, tecleado a mano**, y no es una
 *       formalidad del cliente: el servidor lo vuelve a comparar contra lo que hay en
 *       la base. Saltarse el diálogo llamando a la API directamente no evita el paso,
 *       solo lo hace más incómodo — que es exactamente lo que se busca en una
 *       operación irreversible.
 *
 *       **Por qué exige `secciones.eliminar` y no el permiso de la sección**: el
 *       permiso `editar.{ambito}.{slug}` solo lo tiene el rol que creó la sección, así
 *       que un administrador que llega a limpiar algo que no creó él se quedaría fuera
 *       de la única ruta que sirve para limpiarlo.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmacion:
 *                 type: string
 *                 description: El título exacto de la sección. Se comprueba en el servidor.
 *             required: [confirmacion]
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Sección eliminada.
 *       400:
 *         description: La confirmación no coincide, o la sección es de fábrica.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.delete(
  '/:slug',
  limitadorDeEscritura,
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.eliminar'),
  validarCuerpo(eliminarSeccionSchema),
  PaginaController.eliminarSeccion
);

/**
 * Las tres rutas de «Editar dirección» van con `puedePublicar` (solo quien aprueba) **y**
 * `secciones.cambiar-direccion`, y **no** con `requierePermisoDeSeccion()`: esa clave la tiene
 * solo el rol que creó la página, y quien administra el portal tiene que poder cambiar la
 * dirección de lo que no creó.
 *
 * `puedePublicar` y no `puedeEditar` porque reescribir los enlaces de la versión publicada
 * sin pasar por la cola de aprobación equivale a publicar: dejarlo a cualquier rol con el
 * permiso concedido desde el panel rompería la invariante del ciclo editorial. El permiso
 * sigue existiendo (para verlo y repartirlo con el resto), pero solo opera para quien
 * aprueba. `cambiar-direccion.usecase.ts` lo vuelve a comprobar: es la doble capa de
 * `3-seguridad-del-proyecto.md` §4.3.
 */
/**
 * @openapi
 * /api/paginas/{slug}/direccion:
 *   get:
 *     tags: [Páginas]
 *     summary: Dónde se usa la dirección de una página
 *     description: |
 *       Consulta previa al cambio de dirección: los enlaces del portal que apuntan a la
 *       dirección actual (en lo publicado, en lo que espera aprobación y en los borradores),
 *       si la página está protegida (`inicio`, `menu-y-pie`, las secciones de fábrica y las
 *       acopladas al código: no se cambian) y quién tiene abierta en el editor esta página o
 *       alguna de las que la enlazan. Solo quien aprueba (Superadmin y Administrador); 400 si
 *       el ámbito no es el sitio.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200:
 *         description: Uso de la dirección.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 slug: { type: string }
 *                 titulo: { type: string }
 *                 protegida: { type: boolean }
 *                 paginasConEnlaces: { type: integer }
 *                 referencias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slug: { type: string }
 *                       titulo: { type: string }
 *                       texto: { type: string, nullable: true }
 *                       bloque: { type: string, nullable: true }
 *                       campo: { type: string, nullable: true }
 *                       estado: { type: string, enum: [publicado, en_revision, borrador] }
 *                 enEdicion:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slug: { type: string }
 *                       titulo: { type: string }
 *                       usuario: { type: string }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get(
  '/:slug/direccion',
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.cambiar-direccion'),
  PaginaController.consultarUsoDeDireccion
);

/**
 * @openapi
 * /api/paginas/{slug}/direccion/validacion:
 *   get:
 *     tags: [Páginas]
 *     summary: Comprobar si una dirección nueva sirve
 *     description: |
 *       Normaliza lo escrito con la política de direcciones (la de crear una página) y
 *       dice si está libre. Es una sola consulta y se puede repetir mientras se escribe;
 *       el cambio vuelve a comprobarlo todo.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *       - in: query
 *         name: nueva
 *         schema: { type: string }
 *         description: Lo que se escribió como dirección nueva.
 *     responses:
 *       200:
 *         description: Veredicto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valor: { type: string, description: La dirección ya normalizada. }
 *                 valida: { type: boolean }
 *                 motivo: { type: string, nullable: true, enum: [vacia, igual, invalida, ocupada] }
 *                 mensaje: { type: string, nullable: true }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.get(
  '/:slug/direccion/validacion',
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.cambiar-direccion'),
  PaginaController.validarNuevaDireccion
);

/**
 * @openapi
 * /api/paginas/{slug}/direccion:
 *   patch:
 *     tags: [Páginas]
 *     summary: Cambiar la dirección de una página
 *     description: |
 *       Cambia el slug de la página y reescribe los enlaces que apuntaban a la dirección
 *       anterior: con `actualizarEnlaces`, los de las versiones vigentes (publicada, en
 *       revisión y borradores) y siempre los de la historia que se puede reabrir (rechazadas)
 *       o restaurar (archivadas). Todo en una transacción, con un cambio de dirección a la vez
 *       por ámbito y las versiones afectadas bloqueadas. Renombra también la clave de
 *       permiso de edición, sin quitarle el acceso a nadie.
 *
 *       Solo quien aprueba (Superadmin y Administrador): reescribir lo publicado sin pasar por
 *       la cola de aprobación equivale a publicar. Se rechaza (409) si la dirección está
 *       ocupada, si la clave de permiso de la dirección nueva ya tiene accesos, si hay enlaces
 *       y no se pidió actualizarlos, o si alguien tiene abierto el editor en esta página o en
 *       una que habría que reescribir. La portada, `menu-y-pie`, las secciones de fábrica y las
 *       acopladas al código no se cambian (403). Solo el sitio (400 en otro ámbito).
 *
 *       **No deja redirección:** los enlaces de fuera del portal dejan de funcionar.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nuevaDireccion: { type: string }
 *               actualizarEnlaces: { type: boolean }
 *             required: [nuevaDireccion, actualizarEnlaces]
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Dirección cambiada.
 *       400:
 *         description: La dirección no sirve.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 *       409:
 *         description: Dirección ocupada, enlaces sin autorizar o página abierta en el editor.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.patch(
  '/:slug/direccion',
  limitadorDeEscritura,
  requierePermisoPagina('puedeEditar'),
  requirePermission('secciones.cambiar-direccion'),
  validarCuerpo(cambiarDireccionSchema),
  PaginaController.cambiarDireccion
);

/**
 * @openapi
 * /api/paginas/{slug}/editable:
 *   get:
 *     tags: [Páginas]
 *     summary: Abrir una página en el editor
 *     description: |
 *       Devuelve la versión sobre la que se trabaja —el borrador si lo hay, y si no lo
 *       publicado— para cargarla en el editor visual.
 *
 *       **Aquí es donde actúan las dos capas de autorización**, y hacen cosas
 *       distintas: `puedeEditar` decide **si** esta persona edita (dirección y
 *       subdirección entran a la intranet pero no editan), y el permiso de sección
 *       decide **qué** puede editar, con la clave `editar.{ambito}.{slug}` construida
 *       desde la propia petición. La segunda es la que ata a un editor a secciones
 *       concretas.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200:
 *         description: Contenido editable de la página.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagina' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.get(
  '/:slug/editable',
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  PaginaController.obtenerEditable
);

/**
 * @openapi
 * /api/paginas/{slug}/borrador:
 *   post:
 *     tags: [Páginas]
 *     summary: Guardar borrador
 *     description: |
 *       Guarda el árbol de bloques del editor como versión en borrador (RF-01). Es la
 *       ruta que dispara el autoguardado, así que es la que más tráfico recibe del
 *       editor.
 *
 *       **El HTML de dentro se sanea en el servidor**, recorriendo el árbol entero. El
 *       esquema de validación solo fija la *forma* (`type` y `props` por bloque); son
 *       dos capas que hacen cosas distintas y ninguna sustituye a la otra.
 *
 *       **El tope de 500 bloques no es decorativo**: el saneado recorre todos los
 *       nodos, así que el coste lo marca su número y no el tamaño del JSON. Con solo
 *       el límite de 1 MB del cuerpo, una petición llena de bloques diminutos daba
 *       decenas de miles de nodos que limpiar de una vez.
 *
 *       **La validación va después de los permisos, no antes**: a quien no puede
 *       editar esta sección se le responde 403 sin mirarle el cuerpo. Es más barato y
 *       no le confirma qué forma espera el endpoint.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contenido: { $ref: '#/components/schemas/ContenidoPagina' }
 *               automatico:
 *                 type: boolean
 *                 description: |
 *                   Lo manda el autoguardado del editor. Guarda igual, pero la bitácora lo
 *                   escribe como `autoguardar_borrador` y no como un guardado que alguien
 *                   pulsó, y no devuelve a borrador una versión en revisión (409).
 *             required: [contenido]
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Borrador guardado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagina' }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       409: { description: Autoguardado sobre una versión en revisión; no se guardó nada }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post(
  '/:slug/borrador',
  limitadorDeEscritura,
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  // La validación va después de los permisos y no antes: a quien no puede editar esta
  // sección se le responde 403 sin mirarle el cuerpo, que es más barato y no le confirma
  // qué forma espera el endpoint.
  validarCuerpo(guardarBorradorSchema),
  PaginaController.guardarBorrador
);

/**
 * @openapi
 * /api/paginas/{slug}/subidas:
 *   post:
 *     tags: [Páginas]
 *     summary: Anotar un archivo subido desde el editor
 *     description: |
 *       Registra que el archivo se subió para esta página. Al publicarla, los
 *       archivos anotados que ninguna versión usa se borran de `uploads/`.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200: { description: Anotado }
 *       400: { $ref: '#/components/responses/CuerpoInvalido' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.post(
  '/:slug/subidas',
  // Sin `limitadorDeEscritura`: una subida que no queda anotada no se limpia al publicar.
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  validarCuerpo(registrarSubidaSchema),
  PaginaController.registrarSubida
);

/**
 * @openapi
 * /api/paginas/{slug}/bloqueo:
 *   post:
 *     tags: [Páginas]
 *     summary: Tomar o renovar el candado de edición
 *     description: |
 *       Reserva la página para quien la va a editar, de modo que nadie más pueda
 *       abrirla al mismo tiempo y sobrescribirle el trabajo al guardar.
 *
 *       El editor la llama al abrirse y la repite cada 45 segundos como latido. El
 *       candado dura dos minutos, así que una pestaña cerrada de golpe se libera sola.
 *
 *       Con `forzar: true` un Superadmin o Administrador le quita el candado a quien lo
 *       tenga. A los demás roles se les ignora ese campo y la petición se trata como un
 *       intento normal.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200: { description: El candado es de quien lo pidió }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       409: { description: Lo tiene otra persona; la respuesta dice quién }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.post(
  '/:slug/bloqueo',
  // Sin limitador de escritura: esto es un latido periódico de cada editor abierto,
  // y treinta por minuto se agotarían solos. Lo que protege esta ruta es que exige
  // sesión y permiso sobre la sección, y que no escribe contenido.
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  validarCuerpo(adquirirBloqueoSchema),
  PaginaController.adquirirBloqueo
);

/**
 * @openapi
 * /api/paginas/{slug}/bloqueo:
 *   delete:
 *     tags: [Páginas]
 *     summary: Soltar el candado de edición
 *     description: |
 *       La llama el editor al salir. Solo suelta el candado si es de quien lo pide, así
 *       que quien acaba de perderlo en una toma de control no puede dejar sin candado a
 *       quien se lo quitó.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200: { description: Soltado, o no había nada que soltar }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
router.delete(
  '/:slug/bloqueo',
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  PaginaController.liberarBloqueo
);

/**
 * @openapi
 * /api/paginas/{slug}/descartar-edicion:
 *   post:
 *     tags: [Páginas]
 *     summary: Descartar edición actual
 *     description: |
 *       Limpia las subidas pendientes de la sesión de edición actual.
 *       Se invoca cuando el usuario cierra el editor sin guardar cambios.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200: { description: Edición descartada y recursos liberados }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
router.post(
  '/:slug/descartar-edicion',
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  PaginaController.descartarEdicion
);

/**
 * @openapi
 * /api/paginas/{slug}/bloqueo:
 *   get:
 *     tags: [Páginas]
 *     summary: Consultar quién tiene el candado de edición
 *     description: Retorna quién está editando la página en este momento, si hay alguien.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200: { description: Información del candado si existe }
 */
router.get(
  '/:slug/bloqueo',
  // Quien no puede editar no tiene por qué saber quién está editando: con solo
  // `requireAuth` cualquier sesión válida —Director/Subdirector incluidos, que ven
  // pero no editan— enumeraba quién trabaja sobre qué página. Es el caso que §S10
  // describe y lo que `propiedad:verificar` marcaba en rojo.
  //
  // A diferencia del POST y el DELETE de esta misma ruta, **no** lleva
  // `requierePermisoDeSeccion()`: ese exige la clave `editar.{ambito}.{slug}` salvo
  // para superadmin, y esta lectura la usa el flujo de restauración de respaldos
  // (`respaldos.service.ts`), donde un Administrador sin esa clave concreta se
  // llevaría un 403 al comprobar si la página está bloqueada antes de restaurar.
  requierePermisoPagina('puedeEditar'),
  PaginaController.consultarBloqueo
);

/**
 * @openapi
 * /api/paginas/{slug}/enviar-revision:
 *   patch:
 *     tags: [Páginas]
 *     summary: Enviar a revisión
 *     description: |
 *       Mete el borrador en la cola de aprobación (RF-06). El Editor propone; publicar
 *       es cosa de quien aprueba.
 *
 *       **Exige el comentario de cambios** (el «commit» del envío, de 10 a 100
 *       caracteres). Se guarda en la versión y la bitácora lo registra en el envío y
 *       otra vez al aprobar, rechazar o descartar esa versión.
 *
 *       **Puede traer el contenido del editor.** Si viene, se guarda como borrador y se
 *       envía en una sola transacción, y la bitácora deja **una sola fila**, la del
 *       envío. Antes el editor guardaba y enviaba en dos peticiones, y cada envío dejaba
 *       un guardado que nadie había pulsado. Si el envío falla, el guardado también se
 *       deshace.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comentario]
 *             properties:
 *               contenido:
 *                 type: object
 *                 description: Lo que hay en el editor. Opcional; mismo formato que el de guardar borrador.
 *               comentario:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 100
 *                 description: Qué cambió, en una línea. Lo lee quien aprueba y queda en la bitácora.
 *     responses:
 *       200:
 *         description: Versión enviada a revisión.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagina' }
 *       400:
 *         description: Falta el comentario, es muy corto o muy largo, o el contenido no cumple accesibilidad.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 *       429: { $ref: '#/components/responses/LimiteExcedido' }
 */
router.patch(
  '/:slug/enviar-revision',
  limitadorDeEscritura,
  requierePermisoPagina('puedeEditar'),
  requierePermisoDeSeccion(),
  validarCuerpo(enviarARevisionSchema),
  PaginaController.enviarARevision
);

/**
 * @openapi
 * /api/paginas/{slug}/versiones/{versionId}:
 *   delete:
 *     tags: [Páginas]
 *     summary: Descartar una versión sin publicar
 *     description: |
 *       Elimina un borrador o una versión rechazada.
 *
 *       **Pide el id de la versión y no solo el slug** a propósito: una página acumula
 *       versiones, y borrar «la del slug» borraría por error algo distinto de lo que
 *       se está mirando en pantalla.
 *
 *       Lo hace quien publica, no quien edita: descartar es la otra mitad de aprobar.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - name: versionId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - $ref: '#/components/parameters/Ambito'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo: { type: string, minLength: 1, maxLength: 100, description: Queda en la bitácora. }
 *             required: [motivo]
 *     responses:
 *       200:
 *         description: Versión eliminada.
 *       400:
 *         description: La versión está publicada, o no pertenece a esa página.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
// Descartar una versión sin publicar. Se pide el id de la versión y no solo el
// slug para no borrar por error algo distinto de lo que se está mirando.
router.delete(
  '/:slug/versiones/:versionId',
  requierePermisoPagina('puedePublicar'),
  validarCuerpo(motivoDeDecisionSchema),
  PaginaController.eliminarVersion
);

/**
 * @openapi
 * /api/paginas/{slug}/aprobar:
 *   patch:
 *     tags: [Páginas]
 *     summary: Aprobar y publicar
 *     description: |
 *       Publica la versión que estaba en revisión (RF-06) y **avisa a los frontales
 *       para que tiren su caché**.
 *
 *       Ese aviso no es un detalle: aprobar dejaba la base correcta pero la página no
 *       cambiaba, porque el frontal seguía sirviendo su copia y la caché de la API la
 *       suya. Sin invalidar las dos, publicar no publicaba nada visible.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200:
 *         description: Página publicada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagina' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.patch('/:slug/aprobar', requierePermisoPagina('puedePublicar'), PaginaController.aprobar);

/**
 * @openapi
 * /api/paginas/{slug}/rechazar:
 *   patch:
 *     tags: [Páginas]
 *     summary: Rechazar una versión en revisión
 *     description: |
 *       Devuelve la versión a quien la propuso. El contenido no se pierde: queda en
 *       estado rechazado y se puede retomar.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo: { type: string, minLength: 1, maxLength: 100, description: Se muestra a quien propuso el cambio. }
 *             required: [motivo]
 *     responses:
 *       200:
 *         description: Versión rechazada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagina' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.patch(
  '/:slug/rechazar',
  requierePermisoPagina('puedeRechazar'),
  validarCuerpo(motivoDeDecisionSchema),
  PaginaController.rechazar
);

/**
 * @openapi
 * /api/paginas/en-revision:
 *   get:
 *     tags: [Páginas]
 *     summary: Cola de revisión
 *     description: |
 *       Las versiones que esperan aprobación (RF-06). **La cola es deliberadamente
 *       cruzada**: trae las del sitio y las de la intranet juntas, porque hoy los
 *       mismos roles editan en las dos aplicaciones.
 *
 *       La ve quien puede publicar: esta pantalla existe para aprobar o rechazar, y
 *       quien no puede hacer ninguna de las dos cosas no tiene nada que hacer en ella.
 *     responses:
 *       200:
 *         description: Versiones pendientes de aprobación.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Pagina' }
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 */
// La cola de revisión existe para aprobar o rechazar; quien no puede hacer ninguna
// de las dos no tiene nada que hacer aquí.
router.get('/en-revision', requierePermisoPagina('puedePublicar'), PaginaController.listarEnRevision);

/**
 * @openapi
 * /api/paginas/respaldos:
 *   get:
 *     tags: [Páginas]
 *     summary: Historial de publicaciones y respaldos de páginas
 *     description: |
 *       Lista las versiones actualmente publicadas junto con su versión anterior
 *       archivada (respaldo) y los autores de cada una.
 *     responses:
 *       200:
 *         description: Lista de respaldos de páginas.
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
router.get('/respaldos', requireAuth, PaginaController.listarRespaldos);
router.get('/respaldos/analizar-depuracion', requireAuth, PaginaController.analizarDepuracion);
router.post('/respaldos/depurar', requireAuth, requierePermisoPagina('puedePublicar'), PaginaController.depurarVersiones);

/**
 * @openapi
 * /api/paginas/publicadas:
 *   get:
 *     tags: [Páginas]
 *     summary: Recuento de páginas publicadas, separado por aplicación
 *     description: |
 *       Las páginas visibles ahora mismo, agrupadas en `sitio` e `intranet`, con el
 *       total. Cada una trae `slug` y `titulo` para poder enlazarla.
 *     responses:
 *       200:
 *         description: Recuento y detalle de lo publicado.
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 */
// Solo `requireAuth`, sin permiso de publicación: esto no descubre nada reservado
// —son justo las páginas que cualquiera ve en el portal— y lo consume el panel
// general, al que entra todo el personal con acceso al administrador.
//
// Comparte forma con `/en-revision` y `/respaldos`: una ruta literal entre las de
// `/:slug/...`. Hoy no hay ningún `GET /:slug` a secas que pudiera tragársela (el
// comodín suelto es un `DELETE`), pero si algún día se añade, tiene que declararse
// DESPUÉS de estas tres o se las comerá tomándolas por slugs.
router.get('/publicadas', requireAuth, PaginaController.listarPublicadas);

/**
 * @openapi
 * /api/paginas/{slug}/restaurar:
 *   post:
 *     tags: [Páginas]
 *     summary: Restaurar versión anterior archivada (respaldo)
 *     description: |
 *       Restaura la última versión archivada que estuvo publicada, intercambiándola
 *       con la versión actualmente publicada y restaurando sus archivos de /uploads/.
 *     parameters:
 *       - $ref: '#/components/parameters/SlugEnRuta'
 *       - $ref: '#/components/parameters/Ambito'
 *     responses:
 *       200:
 *         description: Versión restaurada con éxito.
 *       401: { $ref: '#/components/responses/NoAutenticado' }
 *       403: { $ref: '#/components/responses/SinPermiso' }
 *       404: { $ref: '#/components/responses/NoEncontrado' }
 */
router.post('/:slug/restaurar', requierePermisoPagina('puedePublicar'), PaginaController.restaurar);

export default router;

