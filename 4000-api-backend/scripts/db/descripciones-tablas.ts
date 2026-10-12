/**
 * Qué guarda cada tabla, en una frase: lo usan `generar-esquema-comentado.ts` y
 * `generar-pdf-esquema.ts` para describir el esquema.
 *
 * Antes cada script tenía su propia copia, y las dos se quedaron atrás: describían diez
 * tablas que borró la migración 020, las del CMS que borró la 036, y usaban nombres
 * anteriores a los renombres (`permissions`, `role_permissions`, `security_questions`).
 * Al crear o borrar una tabla en una migración, esta lista se toca en el mismo cambio.
 * El detalle de cada tabla está en `docs/11-base-de-datos.md` y `12-diccionario-de-datos.md`.
 */
export const DESCRIPCION_DE_TABLA: Record<string, string> = {
  usuarios: 'Cuentas del panel y la intranet, con su rol, estado, caducidad y controles de seguridad',
  roles: 'Roles de las cuentas (Superadmin, Administrador, Editor…)',
  permisos: 'Claves que se pueden conceder a un rol (fijas del catálogo y de edición por sección)',
  roles_permisos: 'Qué permisos tiene cada rol',
  preguntas_seguridad: 'Las tres preguntas de seguridad de cada cuenta, con la respuesta hasheada',
  paginas: 'Una página por slug y ámbito (sitio o intranet); apunta a su versión publicada',
  paginas_versiones: 'Versiones del contenido de cada página y su estado en el ciclo editorial',
  bloqueos_edicion: 'Quién tiene abierta cada página en el editor, y hasta cuándo',
  subidas_pendientes: 'Archivos subidos a un borrador que aún no se ha publicado',
  archivos: 'Archivos guardados en disco (los Excel de las cargas), deduplicados por SHA-256',
  auditoria_cambios: 'Bitácora (RF-07): quién hizo qué, cuándo y desde dónde',
  configuracion: 'Ajustes de todo el panel, clave → JSON: hoy, su identidad visual (logo, icono y colores de las acciones)',
  cargas_datos: 'Cada carga de Excel de «Actualizaciones», con su estado y progreso',
  departamentos: 'Catálogo único de los 33 departamentos, con su código DANE',
  departamentos_alias: 'Cómo viene escrito cada departamento en los Excel, normalizado, y a cuál corresponde',
  centros_formacion: 'Centros del SENA, cada uno en su departamento',
  niveles_formacion: 'Niveles de formación (técnico, tecnólogo…)',
  programas_formacion: 'Programas de formación, cada uno con su nivel',
  programas_sobresalientes: 'Datos de «Programa + Sobresalientes» cargados por Excel',
  periodos: 'Periodos del año en que se corta la tendencia ocupacional',
  niveles_ocupacionales: 'Niveles ocupacionales de la tendencia',
  niveles_cualificacion: 'Códigos de nivel de cualificación de cada nivel ocupacional',
  criterios_ocupacionales: 'Criterios de clasificación de la tendencia ocupacional',
  ocupaciones: 'Catálogo de ocupaciones que aparecen en las cargas de tendencia',
  cortes_ocupacionales: 'Cada corte año × periodo de la tendencia, publicado o en borrador',
  cargas_datos_ocupacionales: 'Qué celdas año × periodo tocó cada carga de tendencia',
  indicadores_ocupacionales: 'Los percentiles de cada ocupación en cada corte',
  ciiu_secciones: 'Las 21 secciones CIIU Rev.4 A.C. (letra A–U) y sus divisiones',
  ciiu_clases: 'Clases CIIU de cuatro cifras, cada una en su sección',
  empresas: 'Empresas que anuncian proyectos de inversión',
  municipios: 'Municipios donde se ubica un proyecto, cada uno en su departamento',
  proyectos_inversion: 'Cada proyecto de inversión anunciado en una noticia, con su fuente y su estado',
  proyectos_inversion_ubicaciones: 'Dónde se ubica cada proyecto: departamento y, si se sabe, municipio',
  migraciones_aplicadas: 'Control del runner: qué migración se aplicó y cuándo',
};
