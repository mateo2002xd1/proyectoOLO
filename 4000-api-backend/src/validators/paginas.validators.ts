/**
 * Esquemas de páginas.
 *
 * El stub anterior describía un formato que no existe (`{ titulo, slug, contenido:
 * [{tipo, datos}] }`). Lo que el editor manda de verdad es el árbol de Puck bajo la
 * clave `contenido` — ver `ContenidoPagina` en
 * `3001-intranet/src/features/editor/model/pagina.types.ts`.
 *
 * @see 3-seguridad-del-proyecto.md §3
 */

import { z } from 'zod';
import { errorDeComentario, normalizarComentario } from '../shared/comentario-cambios';

/**
 * Un bloque de Puck: siempre trae `type` y `props`.
 *
 * `passthrough` porque `props` lo define cada bloque y el catálogo crece; enumerar
 * aquí las propiedades de cada componente convertiría este archivo en algo que hay
 * que tocar cada vez que se añade un bloque, y se quedaría desactualizado a la
 * primera. Lo que este esquema fija es la **forma**, no el contenido de los campos:
 * de limpiar el HTML de dentro se encarga `sanitizarContenidoPuck`, que recorre el
 * árbol entero y es quien cierra §S2. Las dos capas hacen cosas distintas.
 */
const bloquePuckSchema = z
  .object({
    type: z.string().min(1).max(100),
    props: z.record(z.unknown()).optional(),
  })
  .passthrough();

/**
 * Árbol de contenido de una página.
 *
 * El tope de bloques no es decorativo: `sanitizarContenidoPuck` recorre el árbol
 * completo con jsdom y DOMPurify, así que el coste de guardar lo marca el número de
 * nodos, no el tamaño del JSON. Con el límite de 1 MB de `express.json()` como única
 * frontera, un cuerpo lleno de bloques diminutos daba decenas de miles de nodos que
 * sanear en una sola petición.
 */
export const contenidoPaginaSchema = z
  .object({
    content: z.array(bloquePuckSchema).max(500),
    root: z.record(z.unknown()).optional(),
    zones: z.record(z.array(bloquePuckSchema).max(500)).optional(),
  })
  .passthrough();

/**
 * Cuerpo de `POST /api/paginas/:slug/borrador`.
 *
 * `automatico` lo manda el autoguardado del editor. No se salta nada —mismo esquema,
 * mismo saneado, misma fila en la bitácora—: solo cambia el verbo con el que queda
 * escrita (`autoguardar_borrador`) y prohíbe sacar de la cola una versión en revisión.
 */
export const guardarBorradorSchema = z
  .object({
    contenido: contenidoPaginaSchema,
    automatico: z.boolean().optional(),
  })
  .strict();

/**
 * Cuerpo de `PATCH /api/paginas/:slug/enviar-revision`.
 *
 * `comentario` es el «commit» del envío y es obligatorio: es lo que la bitácora
 * enseña en la columna «Cambios» y lo que lee quien aprueba. Se normaliza aquí (una
 * sola línea, sin espacios sobrantes) antes de medirlo, para que el tope se aplique
 * a lo que de verdad se va a guardar. La regla vive en `shared/comentario-cambios.ts`
 * porque el caso de uso la vuelve a aplicar.
 *
 * `contenido` es opcional y es lo que hay en el editor al pulsar «Enviar». Con el
 * mismo esquema que el guardado de borrador, así que enviarlo por aquí no se salta
 * ninguna comprobación de forma ni de tamaño.
 */
export const enviarARevisionSchema = z
  .object({
    contenido: contenidoPaginaSchema.optional(),
    comentario: z
      .string({
        required_error: 'Escribe un comentario que describa tus cambios antes de enviarlos a revisión.',
        invalid_type_error: 'El comentario debe ser texto.',
      })
      .transform(normalizarComentario)
      .superRefine((valor, ctx) => {
        const error = errorDeComentario(valor);
        if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
      }),
  })
  .strict();

/**
 * Cuerpo de `POST /api/paginas`.
 *
 * Solo viaja el nombre: **el slug lo calcula el servidor**. Dejar que el cliente
 * mandara la ruta sería dejarle elegir la clave de permiso que se va a crear
 * (`editar.{ambito}.{slug}`), y eso no se negocia desde el navegador. El diálogo la
 * enseña mientras se escribe con el mismo `@olo/slug-policy`, así que ve la de verdad.
 *
 * El tope de 120 caracteres es para el **título**, no para la ruta: el slug se recorta
 * aparte a `LONGITUD_MAX_SLUG`. Un nombre largo es legítimo y se guarda entero en
 * `paginas.titulo`, que es lo que se lee en el panel.
 */
export const crearSeccionSchema = z
  .object({
    titulo: z.string().trim().min(1, 'La página necesita un nombre.').max(120),
  })
  .strict();

/**
 * Cuerpo de `DELETE /api/paginas/:slug`.
 *
 * `confirmacion` es el título de la sección, tecleado a mano. No es una formalidad del
 * cliente: el use-case lo vuelve a comparar contra lo que hay en la base, así que
 * saltarse el diálogo llamando a la API directamente no evita el paso — solo lo hace
 * más incómodo, que es exactamente lo que se busca en una operación que no se deshace.
 */
export const eliminarSeccionSchema = z
  .object({
    confirmacion: z.string().trim().min(1, 'Escribe el nombre de la página para confirmar.').max(120),
  })
  .strict();

/**
 * Cuerpo de `PATCH /api/paginas/:slug/direccion`.
 *
 * `nuevaDireccion` es lo que se escribió, no el slug: el servidor lo normaliza con
 * `@olo/slug-policy` y es quien decide si sirve. `actualizarEnlaces` es el consentimiento
 * explícito para reescribir los enlaces de otras páginas; sin él, si hay alguno el cambio se
 * rechaza (409). No tiene valor por defecto a propósito: reescribir contenido ajeno no debe
 * ocurrir por omisión.
 */
export const cambiarDireccionSchema = z
  .object({
    nuevaDireccion: z.string().trim().min(1, 'Escribe la nueva dirección.').max(200),
    actualizarEnlaces: z.boolean(),
  })
  .strict();

/**
 * Cuerpo de `POST /api/paginas/:slug/bloqueo`.
 *
 * `forzar` es «entrar de todos modos» y quitarle el candado a quien lo tenga. Pedirlo
 * sin poder hacerlo no es un error de forma: el caso de uso comprueba el rol y, si no
 * puede, trata la petición como un intento normal de coger el candado. Por eso el
 * esquema lo acepta de cualquiera y la decisión vive en `adquirir-bloqueo.usecase.ts`.
 */
export const adquirirBloqueoSchema = z
  .object({
    forzar: z.boolean().optional(),
  })
  .strict();

/**
 * Solo acepta lo que genera `/api/upload`: un UUID dentro de su carpeta de tipo. Así
 * nadie puede anotar un archivo sembrado o escrito a mano para que se borre al publicar.
 */
const RUTA_SUBIDA_RE =
  /^\/uploads\/(pdf|img|word|excel|presentaciones)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png|doc|docx|xls|xlsx|ppt|pptx)$/;

/** Cuerpo de `POST /api/paginas/:slug/subidas`. */
export const registrarSubidaSchema = z
  .object({
    ruta: z.string().regex(RUTA_SUBIDA_RE, 'Ruta de subida inválida.'),
  })
  .strict();

/**
 * Rechazar o descartar una versión en revisión: el motivo es obligatorio.
 *
 * La pantalla ya bloqueaba el botón sin motivo, pero eso es comodidad y no una garantía:
 * una llamada directa a la API lo dejaba vacío, y la bitácora guarda el motivo como la única
 * explicación de por qué una versión volvió a borrador o se destruyó. El largo máximo es el
 * mismo del comentario de cambios y del contador de la pantalla (100).
 */
export const motivoDeDecisionSchema = z
  .object({
    motivo: z.string().trim().min(1, 'Escribe el motivo.').max(100, 'El motivo admite hasta 100 caracteres.'),
  })
  .strict();
