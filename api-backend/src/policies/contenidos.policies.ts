/**
 * Quién puede hacer qué sobre contenidos, adjuntos y secciones.
 *
 * La edición es **colaborativa**: cualquier Editor puede trabajar sobre lo que
 * escribió otro Editor. `contenidos.autor_id` y `paginas_versiones.creado_por` se
 * registran para la bitácora (RF-07), no para negar el paso. Por eso aquí no hay
 * ninguna comprobación de autoría: la que sí existe vive en el caso de uso, y solo
 * para borrar.
 *
 * Borrar no es editar. Destruir el trabajo de un compañero queda en manos de quien
 * aprueba —el mismo criterio que `pagina.routes.ts` ya aplica a `eliminarVersion`
 * exigiendo `puedePublicar`—, con la excepción del propio autor sobre lo suyo, que
 * resuelve `contenido.usecase.ts`.
 *
 * `puedeVerNoPublicado` existe porque `GET /api/contenidos/:id` devolvía borradores
 * y contenido rechazado a cualquiera con sesión. Es la fila S8 de
 * `3-seguridad-del-proyecto.md`: un documento sin publicar no debe ser accesible por
 * adivinar su id.
 */
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor'];
const ROLES_QUE_APRUEBAN = ['superadmin', 'administrador'];
const ROLES_QUE_VEN_NO_PUBLICADO = ['superadmin', 'administrador', 'editor', 'director', 'subdirector'];

const normalizar = (rol: string | undefined | null) => (rol ?? '').trim().toLowerCase();

const tieneRol = (rol: string | undefined | null, permitidos: string[]) =>
  permitidos.includes(normalizar(rol));

export const contenidosPolicies = {
  /** Crear y modificar contenido, sea de quien sea. */
  puedeEditar: (rol?: string | null) => tieneRol(rol, ROLES_QUE_EDITAN),

  /** Borrar contenido ajeno. El autor puede con el suyo aunque esto sea `false`. */
  puedeEliminar: (rol?: string | null) => tieneRol(rol, ROLES_QUE_APRUEBAN),

  /** Leer borradores, contenido en revisión, rechazado o archivado. */
  puedeVerNoPublicado: (rol?: string | null) => tieneRol(rol, ROLES_QUE_VEN_NO_PUBLICADO),

  /**
   * Las secciones son la taxonomía del sitio: cambiarlas reordena el portal entero,
   * así que no acompaña a `puedeEditar` sino a quien responde por la estructura.
   */
  puedeAdministrarSecciones: (rol?: string | null) => tieneRol(rol, ROLES_QUE_APRUEBAN),
};

export type PermisoContenido = keyof typeof contenidosPolicies;
