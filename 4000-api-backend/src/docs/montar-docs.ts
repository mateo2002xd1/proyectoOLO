/**
 * Monta la documentación interactiva de la API.
 *
 * Publica dos cosas en el mismo prefijo:
 *
 *  - `/api/docs`      — Swagger UI, para leer y **probar** los endpoints desde el navegador.
 *  - `/api/docs.json` — el documento OpenAPI crudo, para Postman, Insomnia, generadores
 *                       de cliente o cualquier otra herramienta.
 *
 * Nada de esto abre un endpoint que no estuviera abierto: Swagger UI es un cliente HTTP
 * más y sus peticiones pasan por los mismos middlewares que las del panel. Lo que sí
 * hace es describir la superficie entera, y por eso en producción hay que encenderlo a
 * mano (ver `config.docs`).
 *
 * @see openapi.ts — la definición base y los esquemas compartidos
 * @see docker/guia-bash.md — las variables de entorno que lo controlan
 */

import type { Express, RequestHandler } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config';
import { documentoOpenApi, rutasDocumentadas } from './openapi';

/**
 * Excepción de CSP **solo para el visor**.
 *
 * `helmet()` fija a nivel de aplicación un `script-src 'self'` que es exactamente lo que
 * se quiere para todo lo demás. Swagger UI, en cambio, arranca desde un script en línea
 * que escribe su propia configuración, así que con la política global se queda en una
 * página en blanco — y en blanco sin decir por qué, porque el bloqueo solo aparece en la
 * consola del navegador.
 *
 * La excepción se aplica montada en la ruta de la documentación, no global: fuera de
 * este prefijo la política estricta sigue intacta. `connect-src` queda en `'self'`
 * porque el «Try it out» llama a esta misma API y no debe poder llamar a otra.
 */
const politicaDelVisor: RequestHandler = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  },
});

/** Ajustes del visor. */
const opcionesDelVisor: swaggerUi.SwaggerUiOptions = {
  customSiteTitle: 'API OLO — Documentación',
  swaggerOptions: {
    /**
     * Que el token sobreviva a recargar la página.
     *
     * Sin esto, cada `F5` obliga a volver a pegar el JWT en «Authorize», y probar una
     * secuencia de varios endpoints se vuelve incómodo hasta el punto de que se deja de
     * usar el visor. Se guarda en el almacenamiento local del navegador de quien lee,
     * que ya tiene ese mismo token en una cookie.
     */
    persistAuthorization: true,
    /** Ordena por método dentro de cada etiqueta, en vez de por el orden de lectura. */
    operationsSorter: 'method',
    docExpansion: 'list',
    filter: true,
  },
};

/**
 * Engancha la documentación a la aplicación.
 *
 * Se llama desde `app.ts` **antes** del limitador global y por el mismo motivo que
 * `/health`: cargar el visor pide media docena de archivos estáticos de una tacada, y
 * gastar en el lector de documentación el cupo por minuto de un visitante no tiene
 * sentido. Los endpoints que el visor prueba sí pasan por todos los límites, que es
 * donde importan.
 */
export function montarDocumentacion(app: Express): void {
  if (!config.docs.habilitadas) {
    console.log(
      '[docs] Documentación OpenAPI desactivada. ' +
        'Actívala con SWAGGER_HABILITADO=true si la necesitas en este entorno.'
    );
    return;
  }

  const ruta = config.docs.ruta;
  const total = rutasDocumentadas();

  if (total === 0) {
    console.warn(
      '[docs] El documento OpenAPI no tiene ni una ruta. ' +
        'Suele significar que los comentarios se perdieron al compilar: ' +
        'revisa que `removeComments` siga desactivado en tsconfig.json.'
    );
  }

  // El JSON va antes que el visor y con su propia ruta literal, para que no lo capture
  // el `app.use` de abajo como si fuera un recurso interno de Swagger UI.
  app.get(`${ruta}.json`, (_req, res) => {
    res.json(documentoOpenApi);
  });

  app.use(ruta, politicaDelVisor, swaggerUi.serve, swaggerUi.setup(documentoOpenApi, opcionesDelVisor));

  console.log(`[docs] Documentación en ${ruta} (${total} rutas) · OpenAPI en ${ruta}.json`);
}
