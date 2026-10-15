/**
 * Documento OpenAPI de la API del OLO.
 *
 * Aquí vive **solo lo que se repite**: los esquemas de datos, las respuestas de error,
 * los parámetros comunes y los esquemas de seguridad. Cada endpoint se documenta con un
 * bloque `@openapi` **junto a su propia ruta**, en `src/routes/*.ts`, y no en este
 * archivo.
 *
 * Esa separación es deliberada y sigue la regla que el README fija para la
 * documentación del proyecto: cuando el mismo contenido vive en dos sitios, uno de los
 * dos queda desactualizado. Una lista central de endpoints se desincroniza en cuanto
 * alguien añade un `router.get` sin acordarse de ella; una anotación pegada a la línea
 * que documenta se ve en el mismo diff que la cambia.
 *
 * Lo que sí se centraliza es lo transversal, por el motivo contrario: repetir el
 * esquema de `Usuario` en las seis rutas que lo devuelven garantiza que las seis digan
 * cosas distintas dentro de un mes.
 *
 * @see 1-guia-del-proyecto.md — arquitectura y mapa requerimiento → código
 * @see 3-seguridad-del-proyecto.md — el modelo de autorización que describen las rutas
 * @see 2-convenciones-del-proyecto.md — nomenclatura de endpoints
 */

import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { AMBITOS, AMBITO_HEADER, AMBITO_POR_DEFECTO } from '../shared/ambito';

/**
 * Dónde buscar los bloques `@openapi`.
 *
 * Se resuelve desde `__dirname` y no desde el directorio de trabajo porque la API se
 * arranca de tres maneras distintas —`ts-node src/server.ts`, `node dist/server.js` y
 * el contenedor, que entra por otro `WORKDIR`— y un patrón relativo al cwd solo acierta
 * en la primera.
 *
 * La extensión sale del propio archivo en ejecución: en desarrollo esto es un `.ts` y
 * hay que leer las fuentes; compilado es un `.js` y hay que leer `dist/`. Los
 * comentarios sobreviven a `tsc` porque `removeComments` no está activado en
 * `tsconfig.json` — si alguien lo activa, la documentación se queda vacía en producción
 * y este es el sitio donde mirar.
 *
 * Las barras se normalizan a `/` porque el buscador de patrones que usa `swagger-jsdoc`
 * trata la barra invertida de Windows como carácter de escape y no como separador.
 */
const archivosAnotados = (): string[] => {
  const extension = path.extname(__filename) === '.ts' ? 'ts' : 'js';
  const raiz = path.resolve(__dirname, '..');

  return [
    path.join(raiz, 'routes', '*.' + extension),
    path.join(raiz, 'app.' + extension),
  ].map((patron) => patron.replace(/\\/g, '/'));
};

/**
 * Descripción larga de la API. Se pinta como portada de Swagger UI, así que hace de
 * primera página para quien llega al proyecto sin contexto.
 */
const descripcion = [
  'API del **Observatorio Laboral y Ocupacional (SENA)**.',
  '',
  'Es la **única puerta a los datos**: ningún frontend toca PostgreSQL, el sistema de',
  'archivos ni Redis directamente. Todo pasa por aquí, que valida, autoriza y controla',
  'qué entra y qué sale.',
  '',
  '### Cómo autenticarse',
  '',
  '1. `POST /api/login` con correo y contraseña.',
  '2. La respuesta trae el token **y** además lo deja en una cookie `HttpOnly`.',
  '3. Desde el navegador no hay que hacer nada más: la cookie viaja sola.',
  '4. Desde una herramienta externa, usa el botón **Authorize** de esta página y pega el',
  '   token; se enviará como `Authorization: Bearer <token>`.',
  '',
  '### Dos capas de autorización, siempre',
  '',
  'Casi ningún endpoint se conforma con «tienes sesión». Sobre `requireAuth` hay una',
  'segunda comprobación, y hacen cosas distintas:',
  '',
  '- **Por rol** (`requierePermisoPagina`, `requierePermisoContenido`…): si esta *clase*',
  '  de usuario puede hacer esta *clase* de cosa.',
  '- **Por permiso del catálogo** (`requirePermission`): si esta *persona* en concreto',
  '  tiene concedida esa clave en `roles_permisos`.',
  '',
  'Un fallo en una no debe abrir la otra. Cada endpoint documenta abajo lo que exige.',
  '',
  '### Ámbito (`' + AMBITO_HEADER + '`)',
  '',
  'El sitio público y la intranet **comparten la tabla de páginas** y ambos tienen su',
  '`/inicio`. Lo que los separa es esta cabecera, no el slug. Al **leer** se asume',
  '`' + AMBITO_POR_DEFECTO + '` si falta; al **escribir** es obligatoria, para que una',
  'cabecera perdida por el camino no cree la página dentro de la aplicación equivocada.',
  '',
  '### Códigos de estado que conviene conocer',
  '',
  '- **401** — no hay sesión, o el token caducó, o la cuenta está inactiva, bloqueada o',
  '  expirada.',
  '- **403** — hay sesión, pero le falta el rol o el permiso.',
  '- **404 en vez de 403** — cuando el objeto no debería ni ser visible para esa sesión.',
  '  Un 403 confirmaría que ese id existe y convertiría el endpoint en un enumerador.',
  '- **429** — límite de peticiones. Los de autenticación y recuperación cuentan **por',
  '  correo**, no por IP: atacar una cuenta solo penaliza a esa cuenta.',
].join('\n');

/**
 * Definición base: todo lo que no depende de una ruta concreta.
 *
 * `swagger-jsdoc` la fusiona con lo que encuentre en los bloques `@openapi` de las rutas
 * para producir el documento final.
 */
const definicion = {
  openapi: '3.0.3',

  info: {
    title: 'API — Observatorio Laboral y Ocupacional (OLO)',
    version: '1.0.0',
    description: descripcion,
    contact: { name: 'Equipo de desarrollo OLO — SENA' },
  },

  servers: [
    { url: 'http://localhost:4000', description: 'Desarrollo local' },
    { url: '/', description: 'Mismo origen (detrás de nginx)' },
  ],

  /**
   * Las etiquetas agrupan los endpoints en la interfaz. El orden de esta lista es el
   * orden en que se pintan, así que va de lo que se usa primero a lo que se usa menos.
   */
  tags: [
    { name: 'Sistema', description: 'Estado del servicio.' },
    { name: 'Autenticación', description: 'Inicio de sesión, sesión actual y primer ingreso.' },
    {
      name: 'Preguntas de seguridad',
      description: 'Configuración y verificación de preguntas, y recuperación de contraseña.',
    },
    { name: 'Usuarios', description: 'Alta, consulta y edición de cuentas (RF-16).' },
    {
      name: 'Roles y permisos',
      description:
        'Configuración de seguridad del sistema (RF-04, RF-05). Quien toca esto puede concederse cualquier otra cosa, así que exige `usuarios.permisos` además del rol.',
    },
    { name: 'Secciones', description: 'Taxonomía del portal: cómo se clasifica el contenido.' },
    { name: 'Contenidos', description: 'Estudios, informes, estadísticas y banners (RF-01, RF-10).' },
    { name: 'Adjuntos', description: 'Archivos que cuelgan de un contenido (RF-02, RF-12).' },
    {
      name: 'Páginas',
      description:
        'El editor visual y su ciclo editorial: borrador → revisión → publicado (RF-01, RF-06).',
    },
    { name: 'Auditoría', description: 'Historial de cambios: quién, qué, cuándo (RF-07).' },
    {
      name: 'Configuración',
      description: 'Ajustes del panel. Hoy, su identidad visual: logo, icono y color de las etiquetas de acción.',
    },
  ],

  /**
   * Seguridad por defecto para **todo** endpoint que no diga lo contrario.
   *
   * Está así a propósito, y no al revés: si la puerta se abriera por omisión, el día que
   * alguien añada una ruta sin anotarla quedaría documentada como pública, que es justo
   * el error que no se puede permitir un documento de seguridad. Las rutas realmente
   * abiertas lo declaran con `security: []` en su propio bloque.
   */
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],

  components: {
    securitySchemes: {
      /**
       * La cookie que emite `POST /api/login`. Es `HttpOnly`, así que el JavaScript del
       * navegador no la lee: viaja sola en cada petición y es el camino normal.
       *
       * Se llama `token` cuando la pone la intranet y `sitio_token` cuando la pone el
       * sitio web, para que las dos sesiones puedan convivir en el mismo navegador sin
       * pisarse. La API acepta cualquiera de las dos.
       */
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description:
          'Cookie de sesión `HttpOnly` emitida por `POST /api/login`. La API también acepta `sitio_token`, que es la que emite el sitio web para no compartir sesión con la intranet.',
      },
      /**
       * El mismo token, en cabecera. Es el camino de las herramientas externas —esta
       * página incluida, porque el botón «Authorize» no puede escribir una cookie
       * `HttpOnly`.
       */
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'El mismo token de la cookie, enviado como `Authorization: Bearer <token>`. Úsalo desde Swagger UI, Postman o `curl`.',
      },
    },

    parameters: {
      Ambito: {
        name: AMBITO_HEADER,
        in: 'header',
        required: false,
        schema: { type: 'string', enum: [...AMBITOS], default: AMBITO_POR_DEFECTO },
        description:
          'A qué aplicación pertenece la página. Opcional al leer (se asume `sitio`); **obligatoria** al escribir.',
      },
      IdEnRuta: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Identificador del recurso.',
      },
      SlugEnRuta: {
        name: 'slug',
        in: 'path',
        required: true,
        schema: { type: 'string', example: 'inicio' },
        description:
          'Ruta legible de la página. Es único por ámbito, no globalmente: `sitio/inicio` e `intranet/inicio` son dos páginas distintas.',
      },
    },

    responses: {
      NoAutenticado: {
        description:
          'Sin sesión válida: falta el token, caducó, o la cuenta está inactiva, bloqueada o expirada.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      SinPermiso: {
        description:
          'Hay sesión, pero le falta el rol o el permiso del catálogo que exige este endpoint.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NoEncontrado: {
        description:
          'El recurso no existe — o no debería ser visible para esta sesión. Los dos casos responden igual a propósito: un 403 confirmaría que el id existe.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      CuerpoInvalido: {
        description:
          'El cuerpo no cumple el esquema. Los esquemas son cerrados (`strict`): un campo de más también es un error.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorDeValidacion' } },
        },
      },
      LimiteExcedido: {
        description:
          'Demasiadas peticiones. Los límites de autenticación y recuperación cuentan por correo; el resto, por sesión o por IP.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },

    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'No tienes permisos para esta acción' },
        },
        required: ['error'],
      },

      ErrorDeValidacion: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Datos inválidos' },
          detalles: {
            type: 'array',
            description: 'Un elemento por campo rechazado, con la ruta dentro del cuerpo.',
            items: {
              type: 'object',
              properties: {
                campo: { type: 'string', example: 'email' },
                mensaje: { type: 'string', example: 'Invalid email' },
              },
            },
          },
        },
      },

      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Ana' },
          apellidos: { type: 'string', nullable: true, example: 'Ríos Mejía' },
          email: { type: 'string', format: 'email', example: 'ana.rios@sena.edu.co' },
          role_id: { type: 'string', format: 'uuid' },
          role: {
            type: 'string',
            nullable: true,
            description: 'Nombre del rol, resuelto desde la fila de `roles`.',
            example: 'Editor',
          },
          status: { type: 'string', enum: ['active', 'inactive'] },
          expiration_date: {
            type: 'string',
            format: 'date',
            nullable: true,
            description:
              'Caducidad de la **cuenta** (RF-16), no de la contraseña. Al vencer, la cuenta se desactiva sola en el siguiente acceso.',
          },
          last_access_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },

      NuevoUsuario: {
        type: 'object',
        description:
          'Lista cerrada. No admite `password`: la contraseña inicial la genera el servidor y se devuelve una sola vez, para que no haya forma de saltarse la política de contraseñas desde el alta.',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 200, example: 'Ana' },
          apellidos: { type: 'string', maxLength: 200, example: 'Ríos Mejía' },
          email: { type: 'string', format: 'email', maxLength: 320 },
          role_id: { type: 'string', format: 'uuid' },
          expiration_date: { type: 'string', format: 'date', nullable: true },
        },
        required: ['name', 'email', 'role_id'],
        additionalProperties: false,
      },

      CambiosUsuario: {
        type: 'object',
        description:
          'PATCH parcial, con al menos un campo. Que un campo se acepte aquí no significa que esta sesión pueda escribirlo: sobre la propia cuenta rige además una lista blanca que no incluye ni el rol ni el estado.',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 200 },
          apellidos: { type: 'string', maxLength: 200 },
          email: { type: 'string', format: 'email', maxLength: 320 },
          role_id: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          expiration_date: { type: 'string', format: 'date', nullable: true },
          reset_password: {
            type: 'boolean',
            description: 'Emite una contraseña temporal nueva y la devuelve una sola vez.',
          },
          reset_security_questions: { type: 'boolean' },
        },
        additionalProperties: false,
      },

      Rol: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nombre: {
            type: 'string',
            example: 'Editor',
            description:
              'Capitalizado tal cual está en la base. Las comparaciones en minúsculas fallaban en silencio; hay una prueba (`npm run permisos:verificar`) que existe para que no vuelva a pasar.',
          },
          descripcion: { type: 'string', nullable: true },
        },
      },

      Permiso: {
        type: 'object',
        description: 'Una clave concedible del catálogo.',
        properties: {
          id: { type: 'string', format: 'uuid' },
          clave: {
            type: 'string',
            example: 'editar.intranet.tasa',
            description:
              'Las de sección se construyen como `editar.{ambito}.{slug}`; el resto son fijas (`usuarios.crear`, `auditoria.ver`, `secciones.eliminar`…).',
          },
          descripcion: { type: 'string', nullable: true },
        },
      },

      Seccion: {
        type: 'object',
        description: 'Nodo de la taxonomía con la que se clasifica el contenido.',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nombre: { type: 'string', example: 'Estudios' },
          slug: { type: 'string', example: 'estudios' },
          parent_id: { type: 'string', format: 'uuid', nullable: true },
        },
      },

      Contenido: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          titulo: { type: 'string' },
          resumen: { type: 'string', nullable: true },
          cuerpo: {
            type: 'string',
            nullable: true,
            description: 'HTML ya saneado en el servidor.',
          },
          estado: {
            type: 'string',
            enum: ['borrador', 'en_revision', 'publicado', 'rechazado'],
            description:
              'Un contenido no lleva versiones como las páginas: su historial vive en la auditoría (RF-07).',
          },
          section_id: { type: 'string', format: 'uuid', nullable: true },
          creado_por: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },

      Adjunto: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          contenido_id: { type: 'string', format: 'uuid' },
          nombre_original: { type: 'string', example: 'informe-2026.pdf' },
          ruta: { type: 'string', description: 'Ruta relativa dentro del almacén de archivos.' },
          mime: { type: 'string', example: 'application/pdf' },
          tamano_bytes: { type: 'integer' },
          subido_por: { type: 'string', format: 'uuid' },
        },
      },

      BloquePuck: {
        type: 'object',
        description:
          'Un componente del editor visual. `props` la define cada bloque y el catálogo crece, así que aquí se fija la forma y no el contenido: de limpiar el HTML de dentro se encarga el saneado del servidor.',
        properties: {
          type: { type: 'string', minLength: 1, maxLength: 100, example: 'TituloRico' },
          props: { type: 'object', additionalProperties: true },
        },
        required: ['type'],
        additionalProperties: true,
      },

      ContenidoPagina: {
        type: 'object',
        description:
          'Árbol de contenido de una página, en el formato del editor. El tope de 500 bloques no es decorativo: el saneado recorre el árbol entero, así que el coste lo marca el número de nodos y no el tamaño del JSON.',
        properties: {
          content: {
            type: 'array',
            maxItems: 500,
            items: { $ref: '#/components/schemas/BloquePuck' },
          },
          root: { type: 'object', additionalProperties: true },
          zones: { type: 'object', additionalProperties: true },
        },
        required: ['content'],
      },

      Pagina: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string', example: 'inicio' },
          titulo: { type: 'string', example: 'Inicio' },
          ambito: { type: 'string', enum: [...AMBITOS] },
          contenido: { $ref: '#/components/schemas/ContenidoPagina' },
          version_id: { type: 'string', format: 'uuid', nullable: true },
          estado: {
            type: 'string',
            enum: ['borrador', 'en_revision', 'publicado', 'rechazado'],
            nullable: true,
          },
          actualizado_en: { type: 'string', format: 'date-time', nullable: true },
        },
      },

      RegistroAuditoria: {
        type: 'object',
        description: 'Una fila de la bitácora (RF-07).',
        properties: {
          id: { type: 'string', format: 'uuid' },
          usuario_id: { type: 'string', format: 'uuid', nullable: true },
          usuario_nombre: {
            type: 'string',
            description:
              'Copia deliberada del nombre. Es la única desnormalización del esquema: si la cuenta se borra, la fila tiene que seguir siendo legible.',
          },
          accion: {
            type: 'string',
            example: 'actualizar',
            enum: [
              'crear',
              'actualizar',
              'eliminar',
              'publicar',
              'despublicar',
              'aprobar',
              'rechazar',
              'enviar_revision',
              'guardar_borrador',
              'cambiar_password',
              'autenticar',
              'expirar',
              'inactivar',
              'bloquear',
              'verificar_preguntas',
              'autoguardar_borrador',
            ],
          },
          categoria: {
            type: 'string',
            nullable: true,
            enum: ['editorial', 'administracion', 'seguridad'],
            description:
              'La categoría de la pantalla de Auditoría a la que pertenece la fila (mismo criterio que el filtro `categoria`), o `null` si no encaja en ninguna.',
          },
          entidad: { type: 'string', example: 'usuarios' },
          entidad_id: { type: 'string', nullable: true },
          camposModificados: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                campo: { type: 'string', example: 'email' },
                antes: {
                  nullable: true,
                  description:
                    'Puede ser `null` cuando no hay registro previo. No se inventa un valor anterior.',
                },
                despues: { nullable: true },
              },
            },
          },
          resumen: {
            type: 'string',
            example: 'Se modificó el usuario dtejada@sena.edu.co · apellidos de «Tejada» a «Vargas»',
            description:
              'Lo que pasó, en una frase ya redactada, para que la pantalla no tenga que traducir códigos internos ni resolver a quién apunta `entidad_id`. Siempre viene: cada acción tiene frases propias, y lo que ninguna sabe contar lo redacta una genérica con cada campo en español y su antes y después. Se calcula al leer, así que también explica las filas antiguas, y no se guarda en la tabla: `camposModificados` sigue siendo la evidencia intacta.',
          },
          ip: { type: 'string', nullable: true, example: '190.0.0.1' },
          user_agent: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },

      PaginaDeAuditoria: {
        type: 'object',
        properties: {
          registros: { type: 'array', items: { $ref: '#/components/schemas/RegistroAuditoria' } },
          total: { type: 'integer', description: 'Filas que cumplen el filtro, no las devueltas.' },
          pagina: { type: 'integer' },
          limite: { type: 'integer', maximum: 200 },
        },
      },

      Sesion: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT. Viene además en una cookie `HttpOnly`, que es el camino normal.',
          },
          user: { $ref: '#/components/schemas/Usuario' },
          mustChangePassword: {
            type: 'boolean',
            description:
              'La cuenta entra con contraseña temporal y no puede hacer nada más hasta cambiarla.',
          },
          mustSetupSecurityQuestions: {
            type: 'boolean',
            description: 'Faltan las preguntas de seguridad, necesarias para recuperar la cuenta.',
          },
        },
      },

      PreguntaSeguridad: {
        type: 'object',
        properties: {
          key: { type: 'string', example: 'primera_mascota' },
          label: { type: 'string', example: '¿Cómo se llamaba tu primera mascota?' },
        },
      },

      AlertaCaducidad: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          expiration_date: { type: 'string', format: 'date' },
          dias_restantes: { type: 'integer', example: 7 },
        },
      },
    },
  },
};

/**
 * El documento final, ya fusionado con las anotaciones de las rutas.
 *
 * Se construye una sola vez al importar el módulo: leer y analizar doce archivos en cada
 * petición a `/api/docs` sería gasto puro, y las anotaciones no cambian mientras el
 * proceso vive.
 */
export const documentoOpenApi = swaggerJSDoc({
  definition: definicion,
  apis: archivosAnotados(),
}) as Record<string, unknown>;

/** Cuántas rutas quedaron documentadas. Lo usa el arranque para avisar si son cero. */
export const rutasDocumentadas = (): number =>
  Object.keys((documentoOpenApi.paths as Record<string, unknown>) ?? {}).length;
