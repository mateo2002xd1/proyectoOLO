import type { AccionAuditable, EntidadAuditable } from '../infrastructure/db/models/content-audit-log';

/**
 * Las tres categorías con que la pantalla de Auditoría agrupa la bitácora:
 *
 * - `editorial` — lo que las personas hacen **en el editor**: crear una página y editar
 *   una sección o una página (guardar el borrador y enviarla a revisión incluidos).
 * - `administracion` — lo que decide quien revisa: rechazar, publicar o archivar.
 * - `seguridad` — quién entra y con qué cuenta: autenticarse, modificar, expirar,
 *   inactivar o eliminar cuentas y roles, y cambiar contraseñas.
 */
export type CategoriaAuditoria = 'editorial' | 'administracion' | 'seguridad';

export const CATEGORIAS: CategoriaAuditoria[] = ['editorial', 'administracion', 'seguridad'];

/**
 * Una fila entra en la categoría si su acción está en `acciones` y, cuando la regla
 * lo pide, su entidad está en `entidades`.
 */
export interface ReglaDeCategoria {
  acciones: AccionAuditable[];
  entidades?: EntidadAuditable[];
}

const ENTIDADES_DEL_EDITOR: EntidadAuditable[] = ['pagina', 'contenido'];
const ENTIDADES_DE_ACCESO: EntidadAuditable[] = ['usuario', 'rol', 'configuracion'];

/**
 * Por qué la categoría no sale de la entidad sola, como antes: Rechazo, Publicación y
 * Archivado caen sobre las mismas entidades que Creación y Edición (`pagina`,
 * `contenido`), y a la vez son de otra categoría. Y dos verbos son ambiguos por sí
 * solos —`crear` y `actualizar` sirven igual para una página que para una cuenta—, así
 * que ahí manda la entidad. Las reglas de cada categoría **no se pisan**: cada par
 * (acción, entidad) cae en una sola, o en ninguna.
 *
 * - `eliminar` va a `seguridad` sea cual sea la entidad: es una sola etiqueta,
 *   «Eliminación», y las eliminaciones de páginas (depurar versiones, borrar una
 *   página) no tienen otro sitio donde encontrarse.
 * - `crear` sobre usuarios y roles también es de `seguridad`, aunque la pantalla no
 *   ofrezca una acción propia para ello: así esas filas se ven al elegir la categoría
 *   en vez de quedar sin ninguna.
 *
 * Una fila que no encaje en nada (`seccion`, `marca` o `archivo` con cualquier verbo:
 * hoy ningún código los escribe) tiene categoría `null` y solo se ve sin filtrar por
 * categoría. Si alguna empieza a auditarse, se suma aquí.
 */
export const REGLAS_POR_CATEGORIA: Record<CategoriaAuditoria, ReglaDeCategoria[]> = {
  editorial: [
    { acciones: ['crear', 'actualizar', 'guardar_borrador', 'enviar_revision'], entidades: ENTIDADES_DEL_EDITOR },
  ],
  administracion: [{ acciones: ['rechazar', 'aprobar', 'publicar', 'despublicar'] }],
  seguridad: [
    {
      acciones: [
        'autenticar', 'expirar', 'inactivar', 'cambiar_password', 'eliminar',
        'bloquear', 'verificar_preguntas',
      ],
    },
    { acciones: ['crear', 'actualizar'], entidades: ENTIDADES_DE_ACCESO },
  ],
};

/**
 * La categoría de una fila, con la misma regla que usa el filtro del repositorio: la
 * píldora de una fila y lo que trae el filtro no pueden discrepar, y por eso las dos
 * salen de `REGLAS_POR_CATEGORIA`.
 */
export const categoriaDe = (accion: AccionAuditable, entidad: EntidadAuditable): CategoriaAuditoria | null =>
  CATEGORIAS.find((categoria) =>
    REGLAS_POR_CATEGORIA[categoria].some(
      (regla) => regla.acciones.includes(accion) && (!regla.entidades || regla.entidades.includes(entidad)),
    ),
  ) ?? null;
