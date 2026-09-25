# Diccionario de Datos — Proyecto OLO (SENA)

> **Documento Técnico de Referencia de Base de Datos**  
> **Sistema Gestor:** PostgreSQL 16+ (Esquema `public`)  
> **Proyecto:** Observatorio Laboral y Ocupacional (OLO) — SENA  
> **Fecha de Generación:** 4 de septiembre de 2026  
> **Base de Integración:** Migraciones activas (`4000-api-backend/src/infrastructure/db/migrations/`) y especificación técnica de persistencia ([11-base-de-datos.md](11-base-de-datos.md)).

---

## 1. Resumen Ejecutivo del Esquema

El modelo de datos del Observatorio Laboral y Ocupacional (OLO) está implementado en **PostgreSQL** bajo el esquema `public`. Fue diseñado siguiendo principios de normalización relacional (3FN), segregación estricta de responsabilidades (RBAC), gobernanza de contenido mediante versionamiento inmutable, concurrencia pesimista en maquetación visual y trazabilidad integral requerida por la **Ley 1581 de 2012 (Habeas Data)**.

### Métricas Generales del Esquema:
- **Total de Tablas Base:** 20 tablas documentadas (19 tablas del dominio con modelos Sequelize + 1 tabla técnica de control `migraciones_aplicadas`).
- **Total de Columnas:** 152 atributos documentados y tipificados.
- **Total de Llaves Foráneas (FK):** 26 relaciones de integridad referencial activas con políticas declarativas `RESTRICT`, `CASCADE` y `SET NULL`.
- **Total de Restricciones CHECK:** 20 restricciones de dominio y reglas de negocio validadas en el motor de base de datos.
- **Estrategia de Identificadores (PK):** UUID versión 4 (`DEFAULT gen_random_uuid()`) en todas las entidades del dominio, garantizando unicidad global y previniendo enumeración secuencial maliciosa.
- **Control de Estados:** Implementado mediante restricciones `CHECK` con tipos de texto nativos en lugar de `ENUM` de PostgreSQL, permitiendo modificaciones y mantenimientos no bloqueantes.

---

## 2. Inventario y Verificación de Objetos de Base de Datos

En respuesta a la verificación de componentes adicionales del motor PostgreSQL:

| Tipo de Objeto | Cantidad | Estado / Detalle |
|---|---|---|
| **Tablas Base (`BASE TABLE`)** | **20** | Activas en producción y desarrollo (19 de dominio + 1 de control). Cubren los 17 Requerimientos Funcionales (RF). |
| **Vistas (`VIEW`)** | **0** | No se utilizan vistas estándar. Las proyecciones se realizan mediante Sequelize / QueryBuilder. |
| **Vistas Materializadas (`MATERIALIZED VIEW`)** | **0** | Las agregaciones analíticas se delegan a Power BI (RF-08), datos dinámicos del Observatorio y caché en memoria Redis. |
| **Procedimientos Almacenados (`PROCEDURE`)** | **0** | La lógica transaccional reside en la capa de servicios y casos de uso de la API (Node.js/TypeScript). |
| **Funciones de Negocio (`FUNCTION`)** | **0** | No hay funciones PL/pgSQL propietarias. El motor ejecuta exclusivamente las funciones criptográficas provistas por la extensión `pgcrypto`. |
| **Disparadores (`TRIGGER`)** | **0** | La auditoría y reglas de negocio se aplican por software y restricciones declarativas (`CHECK`, `UNIQUE`, `FK`), evitando efectos colaterales ocultos en BD. |
| **Paquetes (`PACKAGE`)** | **No aplica** | PostgreSQL no soporta paquetes estilo Oracle. La modularización se logra a nivel de esquemas y módulos de software. |
| **Extensiones (`EXTENSION`)** | **2** | `plpgsql` (v1.0) y `pgcrypto` (v1.4 - soporte para `gen_random_uuid()` y hashing). |
| **Tipos Personalizados / `ENUM`** | **0** | Decisión de diseño D4: se utilizan tipos primitivos (`text`, `varchar`) con restricciones `CHECK`. |
| **Secuencias (`SEQUENCE`)** | **0** | No se utilizan secuencias auto-incrementales; todas las llaves primarias son UUID. |
| **Índices Secundarios** | **56** | Índices B-Tree en llaves foráneas, restricciones de unicidad, índices compuestos y un índice **GIN** especializado en `contenidos.busqueda` para búsqueda de texto completo (`tsvector`). |

---

## 3. Diccionario Detallado por Entidad

A continuación se detalla la ficha técnica y matriz de atributos para cada una de las 14 tablas del sistema.


### 3.1. Tabla: `archivos`

- **Módulo / Dominio:** Gestión Documental y Multimedia
- **Requerimientos Asociados:** RF-02, RF-12, RF-14, RF-15
- **Propósito General:** Depósito centralizado de documentos (PDF, informes), imágenes y recursos descargables. Implementa deduplicación de almacenamiento mediante hash criptográfico SHA-256 único, control de accesibilidad mediante texto alternativo y segregación de ámbitos público e interno.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | `gen_random_uuid()` | Identificador único universal del archivo físico (UUID). |
| 2 | `nombre_original` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Nombre del archivo original tal como lo cargó el usuario. |
| 3 | `nombre_almacenado` | `TEXT` | — | NO (NOT NULL) | **UK** | — | — | Nombre interno único asignado en disco para prevenir path traversal. |
| 4 | `ruta_relativa` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Ruta relativa de almacenamiento en el sistema de ficheros. |
| 5 | `mime_type` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Tipo MIME estándar (ej. application/pdf, image/webp). |
| 6 | `extension` | `TEXT` | — | SÍ | Ninguna | — | — | Extensión del fichero (ej. pdf, png). |
| 7 | `tamano_bytes` | `BIGINT` | — | NO (NOT NULL) | Ninguna | — | — | Tamaño en bytes del archivo. Restricción CHECK > 0. |
| 8 | `hash_sha256` | `BPCHAR` | 64 | SÍ | Ninguna | — | — | Suma de comprobación SHA-256 única para garantizar integridad y deduplicación. |
| 9 | `ambito` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | `'publico'::text` | Entorno de visibilidad ('publico' o 'interno'). Restringido por CHECK. |
| 10 | `estado` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | `'pendiente'::text` | Estado de disponibilidad ('pendiente', 'disponible', 'rechazado', 'eliminado'). Restringido por CHECK. |
| 11 | `texto_alternativo` | `TEXT` | — | SÍ | Ninguna | — | — | Descripción textual accesible (WCAG / RF-14) para lectores de pantalla. |
| 12 | `subido_por` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Usuario que cargó el archivo al sistema. |
| 13 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | `now()` | Fecha y hora de carga inicial. |
| 14 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | `now()` | Fecha y hora de última modificación. |

**Restricciones de Integridad (CHECK) de `archivos`:**
- **`archivos_tamano_bytes_check`**: `(tamano_bytes > 0)`
- **`archivos_ambito_check`**: `(ambito = ANY (ARRAY['publico'::text, 'interno'::text]))`
- **`archivos_estado_check`**: `(estado = ANY (ARRAY['pendiente'::text, 'disponible'::text, 'rechazado'::text, 'eliminado'::text]))`

---

### 3.2. Tabla: `auditoria_cambios`

- **Módulo / Dominio:** Auditoría, Trazabilidad y Seguridad
- **Requerimientos Asociados:** RF-07
- **Propósito General:** Bitácora inmutable de trazabilidad de cambios en todas las entidades del dominio. Registra el usuario actor, la acción ejecutada, la dirección IP, el agente de usuario y el delta estructurado de modificaciones en formato JSONB.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | `gen_random_uuid()` | Identificador único del evento de auditoría (UUID). |
| 2 | `entidad_id` | `UUID` | — | NO (NOT NULL) | Ninguna | — | — | Identificador UUID de la entidad modificada (referencia polimórfica sin FK dura). |
| 3 | `entidad_tipo` | `TEXT` | — | SÍ | Ninguna | — | `'post'::text` | Nombre de la entidad auditada ('contenido', 'pagina', 'seccion', 'usuario', etc.). Restringido por CHECK. |
| 4 | `usuario_id` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Clave foránea hacia el usuario que ejecutó la operación (NULL si es cuenta maestra local o usuario eliminado). |
| 5 | `usuario_nombre` | `TEXT` | — | SÍ | Ninguna | — | — | Nombre desnormalizado del usuario para preservar trazabilidad histórica (D6). Almacena el nombre del usuario (`name` o email de fallback), tanto en peticiones web como en procesos de respaldo (`despublicar` y `publicar`). |
| 6 | `accion` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Operación ejecutada ('crear', 'actualizar', 'eliminar', 'publicar', 'despublicar', 'aprobar', 'rechazar', 'enviar_revision', 'cambiar_password', 'guardar_borrador', 'autenticar', 'expirar', 'inactivar'). Restringido por CHECK. Los tres últimos (migración 030) son de seguridad y administración: inicio de sesión, cuenta caducada por su fecha y cuenta inactivada a mano. |
| 7 | `campos_modificados` | `JSONB` | — | SÍ | Ninguna | — | `'[]'::jsonb` | Detalle JSONB con los deltas de campos alterados: [{campo, antes, despues}]. |
| 8 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Marca temporal exacta del evento auditado. |
| 9 | `ip` | `INET` | — | SÍ | Ninguna | — | — | Dirección de red INET (IPv4/IPv6) desde la que se originó la petición web, proceso editorial o restauración de respaldos. |
| 10 | `user_agent` | `TEXT` | — | SÍ | Ninguna | — | — | Encabezado User-Agent del navegador o cliente HTTP que originó la operación (incluye peticiones web y restauración de respaldos). |

**Restricciones de Integridad (CHECK) de `auditoria_cambios`:**
- **`ck_auditoria_accion`**: `(accion = ANY (ARRAY['crear'::text, 'actualizar'::text, 'eliminar'::text, 'publicar'::text, 'despublicar'::text, 'aprobar'::text, 'rechazar'::text, 'enviar_revision'::text, 'cambiar_password'::text, 'guardar_borrador'::text, 'autenticar'::text, 'expirar'::text, 'inactivar'::text]))`
- **`ck_auditoria_entidad`**: `(entidad_tipo = ANY (ARRAY['contenido'::text, 'pagina'::text, 'seccion'::text, 'usuario'::text, 'rol'::text, 'marca'::text, 'configuracion'::text, 'archivo'::text]))`

---

### 3.3. Tabla: `bloqueos_edicion`

- **Módulo / Dominio:** Concurrencia y Control Editorial
- **Requerimientos Asociados:** RF-01, RF-06
- **Propósito General:** Mecanismo de concurrencia pesimista con tiempo de expiración (lease / lock) que impide que dos editores modifiquen simultáneamente la misma página, evitando colisiones y pérdida de información.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `ambito` | `TEXT` | — | NO (NOT NULL) | **PK** | — | — | Ámbito de la página en edición ('sitio' o 'intranet'). Parte de la PK compuesta. |
| 2 | `slug` | `TEXT` | — | NO (NOT NULL) | **PK** | — | — | Slug de la página bloqueada. Parte de la PK compuesta. |
| 3 | `usuario_id` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Identificador del usuario que actualmente tiene el bloqueo de edición. |
| 4 | `usuario_nombre` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Nombre legible del usuario para mostrar avisos en pantalla a otros editores. |
| 5 | `adquirido_en` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | `now()` | Campo de la entidad. |
| 6 | `expira_en` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Marca de tiempo en que caduca automáticamente el bloqueo si no se renueva. |

**Restricciones de Integridad (CHECK) de `bloqueos_edicion`:**
- **`bloqueos_edicion_ambito_check`**: `(ambito = ANY (ARRAY['sitio'::text, 'intranet'::text]))`

---

### 3.4. Tablas del Observatorio Laboral (Módulo OLO)

- **Módulo / Dominio:** Análisis y Estadísticas del Mercado Laboral
- **Propósito General:** Almacena la estructura normalizada de ocupaciones, indicadores y matrices. Sustituye al antiguo esquema estático de `contenidos` por un modelo de datos robusto y consultable dinámicamente.

*Nota técnica: Tras la eliminación del CMS tradicional (migraciones 035 y 036), las tablas principales para la gestión del observatorio son:*

1. **`ocupaciones`**: Catálogo base del CNO.
2. **`niveles_ocupacionales`** y **`niveles_cualificacion`**: Estructuras jerárquicas del SENA.
3. **`cortes_ocupacionales`** y **`periodos`**: Dimensiones de tiempo.
4. **`indicadores_ocupacionales`**: Tabla de hechos con métricas de vacantes e inscritos.
5. **`criterios_ocupacionales`**: Dimensiones analíticas estáticas.
6. **`cargas_datos_ocupacionales`**: Control de auditoría de ingesta (Excel/CSV).

Todas con clave primaria `UUID` (`DEFAULT gen_random_uuid()`) desde la migración 037; la 033 las creó con `SMALLINT`/`INTEGER` secuenciales. `niveles_cualificacion.codigo_nc` y `criterios_ocupacionales.codigo` quedan `UNIQUE`: son lo que referencian las dos columnas generadas (`ocupaciones.codigo_nc` e `indicadores_ocupacionales.criterio_codigo`).

La especificación exhaustiva columna por columna de estas tablas se encuentra directamente en las definiciones de los modelos Sequelize (`4000-api-backend/src/infrastructure/db/models/olo/`).

---

### 3.6. Tabla: `migraciones_aplicadas`

- **Módulo / Dominio:** Infraestructura y Control de Versiones de BD
- **Requerimientos Asociados:** Mantenimiento / Infraestructura
- **Propósito General:** Tabla de control del runner de migraciones automatizadas. Registra el nombre de cada archivo de migración ejecutado con éxito y su marca de tiempo exacta.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `nombre` | `TEXT` | — | NO (NOT NULL) | **PK** | — | — | Nombre del archivo de migración ejecutado (PK). |
| 2 | `aplicada_en` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | `now()` | Marca de tiempo exacta de ejecución de la migración. |

---

### 3.7. Tabla: `paginas`

- **Módulo / Dominio:** Maquetación Web y Páginas Dinámicas
- **Requerimientos Asociados:** RF-01, RF-06
- **Propósito General:** Lienzo y contenedor de rutas de navegación para páginas editables con Puck tanto en el sitio web como en la intranet. Posee unicidad compuesta por `(ambito, slug)` y mantiene una referencia foránea circular a su versión actualmente aprobada y publicada.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | — | Identificador único universal de la página (UUID). |
| 2 | `slug` | `VARCHAR(255)` | 255 | NO (NOT NULL) | Ninguna | — | — | Ruta relativa amigable de la página. |
| 3 | `titulo` | `VARCHAR(255)` | 255 | NO (NOT NULL) | Ninguna | — | — | Título legible asignado a la página. |
| 4 | `version_publicada_id` | `UUID` | — | SÍ | **FK** | `paginas_versiones.id` (ON DELETE SET NULL) | — | Clave foránea circular hacia paginas_versiones (versión viva). |
| 5 | `creado_por` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Usuario que creó la página originalmente. |
| 6 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de creación de la página. |
| 7 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de actualización. |
| 8 | `ambito` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | `'sitio'::text` | Entorno de destino ('sitio' para portal público, 'intranet' para uso interno). Restringido por CHECK. |

**Restricciones de Integridad (CHECK) de `paginas`:**
- **`ck_paginas_ambito`**: `(ambito = ANY (ARRAY['sitio'::text, 'intranet'::text]))`

---

### 3.8. Tabla: `paginas_versiones`

- **Módulo / Dominio:** Ciclo Editorial y Versionamiento
- **Requerimientos Asociados:** RF-01, RF-06
- **Propósito General:** Historial inmutable de revisiones de cada página. Almacena la estructura del árbol de componentes Puck en formato JSONB, el número correlativo de versión y el estado del ciclo editorial (borrador, en_revision, publicado, rechazado, archivado).

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | — | Identificador único de la versión (UUID). |
| 2 | `pagina_id` | `UUID` | — | NO (NOT NULL) | **FK** | `paginas.id` (ON DELETE CASCADE) | — | Clave foránea hacia la página a la que pertenece esta versión. |
| 3 | `contenido` | `JSONB` | — | NO (NOT NULL) | Ninguna | — | — | Estructura serializada de componentes Puck en formato JSONB. |
| 4 | `layout` | `JSONB` | — | SÍ | Ninguna | — | — | Metadatos de disposición y plantilla en formato JSONB. |
| 5 | `numero_version` | `INTEGER` | — | NO (NOT NULL) | **UK** | — | — | Entero secuencial correlativo único por página (1, 2, 3...). |
| 6 | `estado` | `VARCHAR(20)` | 20 | SÍ | Ninguna | — | `'borrador'::character varying` | Estado del ciclo editorial ('borrador', 'en_revision', 'publicado', 'rechazado', 'archivado'). |
| 7 | `motivo_rechazo` | `TEXT` | — | SÍ | Ninguna | — | — | Justificación documentada en caso de rechazo por parte del revisor. |
| 8 | `revisor_id` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Usuario con rol revisor/administrador que evaluó la versión. |
| 9 | `publicado_por` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Usuario que autorizó la publicación de la versión. |
| 10 | `publicado_en` | `TIMESTAMPTZ` | — | SÍ | Ninguna | — | — | Fecha y hora efectiva de publicación. |
| 11 | `creado_en` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de creación de la versión. |
| 12 | `creado_por` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Usuario autor que redactó o modificó esta versión. |
| 13 | `revisado_en` | `TIMESTAMPTZ` | — | SÍ | Ninguna | — | — | Fecha y hora de la evaluación editorial. |
| 14 | `comentario_cambios` | `VARCHAR(100)` | 100 | SÍ | Ninguna | `CHECK ck_paginas_versiones_comentario` | — | «Commit» de la versión: qué cambió, escrito por el editor al enviarla a revisión (10 a 100 caracteres, en una línea). Obligatorio para estar en `en_revision`; la bitácora lo registra al enviar, aprobar, rechazar, descartar y restaurar. Nulo en borradores nunca enviados y en versiones anteriores a la migración 029. |

**Restricciones de Integridad (CHECK) de `paginas_versiones`:**
- **`ck_paginas_versiones_estado`**: `((estado)::text = ANY ((ARRAY['borrador'::character varying, 'en_revision'::character varying, 'publicado'::character varying, 'rechazado'::character varying, 'archivado'::character varying])::text[]))`
- **`ck_paginas_versiones_comentario`**: `((estado)::text <> 'en_revision'::text OR btrim(COALESCE(comentario_cambios, ''::character varying)::text) <> ''::text)`

---

### 3.9. Tabla: `permisos`

- **Módulo / Dominio:** Identidad y Autorización (RBAC)
- **Requerimientos Asociados:** RF-04, RF-05
- **Propósito General:** Catálogo de capacidades y privilegios atómicos del sistema. Utiliza una clave técnica invariable (ej. `acceso.sitio`, `acceso.intranet`, `secciones.crear`, `contenidos.publicar`) consumida directamente por los middlewares y políticas del backend.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | `gen_random_uuid()` | Identificador único universal del permiso (UUID). |
| 2 | `clave` | `TEXT` | — | NO (NOT NULL) | **UK** | — | — | Identificador técnico único en formato recurso.accion (ej. paginas.aprobar). |
| 3 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de registro del permiso. |
| 4 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de actualización. |

---

### 3.10. Tabla: `preguntas_seguridad`

- **Módulo / Dominio:** Seguridad y Recuperación de Cuentas
- **Requerimientos Asociados:** RF-16
- **Propósito General:** Almacena las preguntas y respuestas secretas hashed para el mecanismo de recuperación y desbloqueo de cuentas. Cada usuario configura un set ordenado, y sus respuestas se comparan mediante hash seguro.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | `gen_random_uuid()` | Identificador único de la pregunta configurada (UUID). |
| 2 | `usuario_id` | `UUID` | — | NO (NOT NULL) | **FK** | `usuarios.id` (ON DELETE CASCADE) | — | Clave foránea hacia usuarios. En cascada al eliminar el usuario. |
| 3 | `pregunta_clave` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Código o texto identificador de la pregunta de seguridad. |
| 4 | `respuesta_hash` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Hash criptográfico unidireccional de la respuesta suministrada. |
| 5 | `orden` | `INTEGER` | — | SÍ | Ninguna | — | `0` | Posición ordinal de la pregunta en la secuencia de verificación. |
| 6 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de creación. |
| 7 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de actualización. |

---

### 3.11. Tabla: `roles`

- **Módulo / Dominio:** Identidad y Autorización (RBAC)
- **Requerimientos Asociados:** RF-04, RF-05
- **Propósito General:** Catálogo de roles predefinidos y personalizados en el sistema (superadmin, administrador, editor, director/subdirector). La bandera `es_sistema` impide la eliminación accidental de roles basales desde el panel de control.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | `gen_random_uuid()` | Identificador único del rol (UUID). |
| 2 | `nombre` | `TEXT` | — | NO (NOT NULL) | **UK** | — | — | Nombre único descriptivo del rol (ej. superadmin, editor). |
| 3 | `descripcion` | `TEXT` | — | SÍ | Ninguna | — | — | Descripción detallada de las funciones y alcance del rol. |
| 4 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de creación del registro. |
| 5 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de última modificación. |
| 6 | `es_sistema` | `BOOLEAN` | — | NO (NOT NULL) | Ninguna | — | `false` | Bandera booleana. Si es true, el rol es basal y no puede ser eliminado desde el panel. |

---

### 3.12. Tabla: `roles_permisos`

- **Módulo / Dominio:** Identidad y Autorización (RBAC)
- **Requerimientos Asociados:** RF-04, RF-05
- **Propósito General:** Tabla asociativa muchos a muchos que materializa la matriz RBAC. Vincula cada rol con sus permisos autorizados. No posee identificador artificial propio, su clave primaria es compuesta por la dupla foránea con cascada total.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `rol_id` | `UUID` | — | NO (NOT NULL) | **PK / FK** | `roles.id` (ON DELETE CASCADE) | — | Clave foránea hacia roles. Parte de la PK compuesta. |
| 2 | `permiso_id` | `UUID` | — | NO (NOT NULL) | **PK / FK** | `permisos.id` (ON DELETE CASCADE) | — | Clave foránea hacia permisos. Parte de la PK compuesta. |

---

### 3.13. Tabla: `secciones`

- **Módulo / Dominio:** Arquitectura de Información y Navegación
- **Requerimientos Asociados:** RF-01, RF-11
- **Propósito General:** Estructura jerárquica en árbol que organiza las categorías temáticas y de navegación. Garantiza a nivel de base de datos el principio de accesibilidad de navegación a máximo tres clics (`CHECK nivel BETWEEN 1 AND 3`).

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | `gen_random_uuid()` | Identificador único universal de la sección (UUID). |
| 2 | `nombre` | `TEXT` | — | NO (NOT NULL) | **UK** | — | — | Nombre visible de la sección en la estructura del sitio. |
| 3 | `slug` | `TEXT` | — | NO (NOT NULL) | **UK** | — | — | Slug amigable para URLs, único en el sistema. |
| 4 | `descripcion` | `TEXT` | — | SÍ | Ninguna | — | — | Resumen o descripción del contenido de la sección. |
| 5 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de creación. |
| 6 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de actualización. |
| 7 | `padre_id` | `UUID` | — | SÍ | **FK** | `secciones.id` (ON DELETE RESTRICT) | — | Auto-referencia a la sección contenedora (árbol jerárquico). |
| 8 | `orden` | `SMALLINT` | — | NO (NOT NULL) | Ninguna | — | `0` | Número de orden secuencial para renderizado en menú. |
| 9 | `nivel` | `SMALLINT` | — | NO (NOT NULL) | Ninguna | — | `1` | Nivel de profundidad jerárquica (1, 2 o 3). Restringido por CHECK. |
| 10 | `visible_en_menu` | `BOOLEAN` | — | NO (NOT NULL) | Ninguna | — | `true` | Indica si se despliega visualmente en el menú público. |

**Restricciones de Integridad (CHECK) de `secciones`:**
- **`ck_secciones_nivel`**: `((nivel >= 1) AND (nivel <= 3))`
- **`ck_secciones_padre`**: `((padre_id IS NULL) OR (padre_id <> id))`

---

### 3.14. Tabla: `usuarios`

- **Módulo / Dominio:** Identidad, Autenticación y Control de Acceso
- **Requerimientos Asociados:** RF-04, RF-05, RF-16
- **Propósito General:** Almacena la totalidad de usuarios con credenciales activas o históricas del sistema, compartida entre el portal público y la intranet institucional. Sostiene las políticas de expiración temporal de cuentas, control de intentos fallidos independientes para login y preguntas de seguridad, y cierre de sesión por inactividad.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | `gen_random_uuid()` | Identificador único universal (UUID v4) del usuario. |
| 2 | `nombre` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Nombres de pila del usuario. |
| 3 | `email` | `TEXT` | — | NO (NOT NULL) | **UK** | — | — | Correo electrónico único institucional. Normalizado a minúsculas. |
| 4 | `rol_id` | `UUID` | — | NO (NOT NULL) | **FK** | `roles.id` (ON DELETE NO ACTION) | — | Clave foránea hacia la tabla roles. Define los privilegios base. |
| 5 | `estado` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | `'active'::text` | Estado de la cuenta ('active', 'inactive', 'locked', 'expired'). Restringido por CHECK. |
| 6 | `fecha_caducidad` | `TIMESTAMPTZ` | — | SÍ | Ninguna | — | — | Fecha de expiración de la cuenta (RF-16). NULL indica que la cuenta no caduca. |
| 7 | `ultimo_acceso_en` | `TIMESTAMPTZ` | — | SÍ | Ninguna | — | — | Marca temporal del último request autenticado. Soporta cierre por inactividad. |
| 8 | `password_hash` | `TEXT` | — | SÍ | Ninguna | — | — | Hash criptográfico de la contraseña del usuario (Bcrypt / Argon2id). |
| 9 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de creación del registro. |
| 10 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de la última modificación del registro. |
| 11 | `debe_cambiar_password` | `BOOLEAN` | — | SÍ | Ninguna | — | `false` | Booleano que obliga al usuario a renovar su contraseña en el siguiente inicio de sesión. |
| 12 | `debe_configurar_preguntas` | `BOOLEAN` | — | SÍ | Ninguna | — | `true` | Booleano que exige la configuración de preguntas de seguridad. |
| 13 | `intentos_fallidos` | `INTEGER` | — | SÍ | Ninguna | — | `0` | Contador de intentos fallidos en preguntas de seguridad (3 intentos / 30 min). |
| 14 | `bloqueado_hasta` | `TIMESTAMPTZ` | — | SÍ | Ninguna | — | — | Marca de tiempo hasta la cual la cuenta permanece bloqueada. |
| 15 | `creado_por` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Usuario que registró esta cuenta en el sistema (auto-referencia). |
| 16 | `apellidos` | `TEXT` | — | SÍ | Ninguna | — | — | Apellidos del usuario. |
| 17 | `intentos_fallidos_login` | `INTEGER` | — | NO (NOT NULL) | Ninguna | — | `0` | Contador de intentos fallidos de login con contraseña (5 intentos / 15 min). |

**Restricciones de Integridad (CHECK) de `usuarios`:**
- **`ck_usuarios_estado`**: `(estado = ANY (ARRAY['active'::text, 'inactive'::text, 'locked'::text, 'expired'::text]))`

---

### 3.15. Tabla: `subidas_pendientes`

- **Módulo / Dominio:** Gobernanza Editorial y Gestión de Archivos Temporales
- **Requerimientos Asociados:** RF-01, RF-02, RF-06
- **Propósito General:** Registra los archivos multimedia subidos durante una sesión de edición visual en Puck que aún no han sido confirmados en una versión publicada. Permite la recolección automática de basura para eliminar del almacenamiento físico aquellos archivos que fueron reemplazados o descartados antes de publicar la página.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `pagina_id` | `UUID` | — | NO (NOT NULL) | **PK / FK** | `paginas.id` (ON DELETE CASCADE) | — | Identificador de la página para la cual se cargó el archivo temporal. |
| 2 | `ruta` | `TEXT` | — | NO (NOT NULL) | **PK** | — | — | Ruta relativa del archivo cargado en el sistema de almacenamiento. |
| 3 | `creado_en` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | `now()` | Marca temporal de la carga del archivo para tareas de depuración. |

---

### 3.16. Módulo: Observatorio Laboral y Ocupacional (Datos Dinámicos)

- **Módulo / Dominio:** Análisis Estadístico y Empleabilidad
- **Requerimientos Asociados:** RF-02, RF-08, RF-09
- **Propósito General:** Estructura en copo de nieve (Snowflake) que consolida los datos importados de Excel a través del bloque Puck `ImportadorExcelBloque` y el endpoint `/api/observatorio/importar`. Se compone de tablas maestras autogeneradas (catálogos o dimensiones) y una tabla central de hechos transaccional (`programas_sobresalientes`) que agrupa estadísticas laborales con garantía de idempotencia.

#### Catálogos Dinámicos (Dimensiones)

1. **`departamentos`:** catálogo cerrado de los 33 oficiales, compartido con la tendencia ocupacional (§3.17). Ya no se autogenera: los importadores lo resuelven por alias (migración 032).
   - Campos: `id` (UUID PK, `DEFAULT gen_random_uuid()`), `nombre` (VARCHAR 100, NOT NULL, Único `uq_departamentos_nombre`, nombre oficial), `codigo_dane` (CHAR 2, NOT NULL, Único `uq_departamentos_codigo_dane`, `CHECK ~ '^[0-9]{2}$'`), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
   - **`departamentos_alias`:** `alias_normalizado` (VARCHAR 120 PK: minúsculas, sin tildes, signos como espacio), `departamento_id` (UUID FK -> `departamentos.id`, ON DELETE CASCADE).
2. **`centros_formacion`:** 
   - Campos: `id` (UUID PK, `DEFAULT gen_random_uuid()`), `departamento_id` (UUID FK -> `departamentos.id`, ON DELETE RESTRICT, ON UPDATE CASCADE), `nombre` (VARCHAR 255, NOT NULL), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ). Llave única compuesta: `(departamento_id, nombre)` (`uq_centros_formacion_depto_nombre`).
3. **`niveles_formacion`:** 
   - Campos: `id` (UUID PK, `DEFAULT gen_random_uuid()`), `nombre` (VARCHAR 50, NOT NULL, Único `uq_niveles_formacion_nombre`), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
4. **`programas_formacion`:** 
   - Campos: `id` (UUID PK, `DEFAULT gen_random_uuid()`), `nivel_formacion_id` (UUID FK -> `niveles_formacion.id`, ON DELETE RESTRICT, ON UPDATE CASCADE), `nombre` (VARCHAR 255, NOT NULL), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ). Llave única compuesta: `(nivel_formacion_id, nombre)` (`uq_programas_formacion_nivel_nombre`).

#### Tabla Central: `programas_sobresalientes` (Hechos)

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO | **PK** | — | `gen_random_uuid()` | Identificador único universal del registro estadístico. |
| 2 | `departamento_id` | `UUID` | — | NO | **FK** | `departamentos.id` (ON DELETE RESTRICT, ON UPDATE CASCADE) | — | Dimensión de departamento / regional SENA. |
| 3 | `centro_id` | `UUID` | — | NO | **FK** | `centros_formacion.id` (ON DELETE RESTRICT, ON UPDATE CASCADE) | — | Dimensión de centro de formación. |
| 4 | `programa_id` | `UUID` | — | NO | **FK** | `programas_formacion.id` (ON DELETE RESTRICT, ON UPDATE CASCADE) | — | Dimensión de programa de formación SENA. |
| 5 | `nivel_formacion_id` | `UUID` | — | NO | **FK** | `niveles_formacion.id` (ON DELETE RESTRICT, ON UPDATE CASCADE) | — | Dimensión de nivel de formación (Técnico, Tecnólogo, etc). |
| 6 | `sexo` | `CHAR` | 1 | NO | Ninguna | `CHECK (sexo IN ('M','F'))` | — | Género ('M' o 'F'). Restricción estricta de dominio en base de datos. |
| 7 | `certificados` | `INTEGER` | — | NO | Ninguna | `CHECK (certificados >= 0)` | — | Cantidad total de aprendices certificados en el periodo. |
| 8 | `vinculados` | `INTEGER` | — | NO | Ninguna | `CHECK (vinculados >= 0 AND vinculados <= certificados)` | — | Cantidad total de egresados vinculados al mercado laboral formal. |
| 9 | `tasa_vinculacion` | `DECIMAL(6,4)` | — | NO | Ninguna | `CHECK (tasa_vinculacion >= 0 AND tasa_vinculacion <= 1)` | — | Ratio estadístico acotado entre 0.0000 y 1.0000. |
| 10 | `salario_promedio` | `DECIMAL(12,2)`| — | NO | Ninguna | `CHECK (salario_promedio >= 0)` | — | Salario promedio devengado por los egresados en COP. |
| 11 | `created_at` | `TIMESTAMPTZ` | — | NO | Ninguna | — | `now()` | Fecha y hora de ingestión de la fila. |
| 12 | `updated_at` | `TIMESTAMPTZ` | — | NO | Ninguna | — | `now()` | Fecha y hora de última actualización del registro. |

**Índices y Restricciones del Observatorio:**
- **Restricción de Idempotencia:** `uq_sobresalientes_registro UNIQUE (centro_id, programa_id, sexo)`. Garantiza que ejecuciones sucesivas del importador de Excel actualicen las métricas existentes sin duplicar filas.
- **Índices de Cobertura:** `idx_sobresalientes_departamento`, `idx_sobresalientes_nivel`, `idx_sobresalientes_sexo` e `idx_sobresalientes_tasa`.

---

#### Tabla Central: `indicadores_ocupacionales` (Hechos)

| No. | Campo | Tipo de Dato | Permite Nulos | Tipo Llave | Referencia / Restricción | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---|:---|
| 1 | `id` | `UUID` | NO | **PK** | `DEFAULT gen_random_uuid()` | Identificador del hecho (migración 037; antes `BIGINT` de identidad). |
| 2 | `corte_id` | `UUID` | NO | **FK** | `cortes_ocupacionales.id` (ON DELETE CASCADE) | Año × periodo al que pertenece. |
| 3 | `departamento_id` | `UUID` | SÍ | **FK** | `departamentos.id` (ON DELETE RESTRICT) | `NULL` = hoja nacional. |
| 4 | `ocupacion_id` | `UUID` | NO | **FK** | `ocupaciones.id` | Ocupación CNO. |
| 5 | `inscritos` | `INTEGER` | NO | Ninguna | `CHECK (inscritos >= 0)`, default 0 | Personas que buscan empleo registradas. Celda vacía del Excel = 0. |
| 6 | `vacantes` | `INTEGER` | NO | Ninguna | `CHECK (vacantes >= 0)`, default 0 | Vacantes de los empresarios. Celda vacía = 0. |
| 7 | `percentil_inscritos` | `DOUBLE PRECISION` | SÍ | Ninguna | `CHECK (> 0 AND <= 1)` | Tal como lo publica el Excel. `NULL` = menos de 10 registros. |
| 8 | `percentil_vacantes` | `DOUBLE PRECISION` | SÍ | Ninguna | `CHECK (> 0 AND <= 1)` | Ídem. |
| 9 | `criterio_codigo` | `VARCHAR(40)` **generada** | NO | **FK** | `criterios_ocupacionales.codigo` | Fórmula del 80 %: `ALTA_OFERTA_ALTA_DEMANDA` los dos > 0,8; `ALTA_OFERTA_BAJA_DEMANDA` solo inscritos; `BAJA_OFERTA_ALTA_DEMANDA` solo vacantes; `BAJA_OFERTA_BAJA_DEMANDA` ninguno. Apunta al código y no al id porque una columna generada no puede calcular un UUID. `NULL` cuenta como 0, igual que Excel. |

**Índices:** `uq_indicadores_ocupacionales_nacional (corte_id, ocupacion_id) WHERE departamento_id IS NULL`, `uq_indicadores_ocupacionales_departamental (corte_id, departamento_id, ocupacion_id) WHERE departamento_id IS NOT NULL`, `idx_indicadores_ocupacionales_busqueda (corte_id, departamento_id, criterio_codigo)`, `idx_indicadores_ocupacionales_ocupacion (ocupacion_id, corte_id)`.

---

## 4. Matriz de Relaciones e Integridad Referencial (Foreign Keys)

| Tabla Origen | Columna Local | Tabla Destino | Columna Referenciada | Regla ON DELETE | Regla ON UPDATE |
|:---|:---|:---|:---|:---:|:---:|
| `roles_permisos` | `rol_id` | `roles` | `id` | `CASCADE` | `CASCADE` |
| `roles_permisos` | `permiso_id` | `permisos` | `id` | `CASCADE` | `CASCADE` |
| `paginas` | `version_publicada_id` | `paginas_versiones` | `id` | `SET NULL` | `NO ACTION` |
| `archivos` | `subido_por` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `usuarios` | `creado_por` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `paginas_versiones` | `creado_por` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `usuarios` | `rol_id` | `roles` | `id` | `NO ACTION` | `CASCADE` |
| `preguntas_seguridad` | `usuario_id` | `usuarios` | `id` | `CASCADE` | `CASCADE` |
| `auditoria_cambios` | `usuario_id` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `paginas_versiones` | `pagina_id` | `paginas` | `id` | `CASCADE` | `CASCADE` |
| `paginas_versiones` | `revisor_id` | `usuarios` | `id` | `SET NULL` | `CASCADE` |
| `paginas_versiones` | `publicado_por` | `usuarios` | `id` | `SET NULL` | `CASCADE` |
| `paginas` | `creado_por` | `usuarios` | `id` | `SET NULL` | `CASCADE` |
| `subidas_pendientes` | `pagina_id` | `paginas` | `id` | `CASCADE` | `CASCADE` |
| `centros_formacion` | `departamento_id` | `departamentos` | `id` | `RESTRICT` | `CASCADE` |
| `programas_formacion` | `nivel_formacion_id` | `niveles_formacion` | `id` | `RESTRICT` | `CASCADE` |
| `programas_sobresalientes` | `departamento_id` | `departamentos` | `id` | `RESTRICT` | `CASCADE` |
| `programas_sobresalientes` | `centro_id` | `centros_formacion` | `id` | `RESTRICT` | `CASCADE` |
| `programas_sobresalientes` | `programa_id` | `programas_formacion` | `id` | `RESTRICT` | `CASCADE` |
| `programas_sobresalientes` | `nivel_formacion_id` | `niveles_formacion` | `id` | `RESTRICT` | `CASCADE` |
| `departamentos_alias` | `departamento_id` | `departamentos` | `id` | `CASCADE` | `NO ACTION` |
| `niveles_cualificacion` | `nivel_ocupacional_id` | `niveles_ocupacionales` | `id` | `NO ACTION` | `NO ACTION` |
| `ocupaciones` | `codigo_nc` | `niveles_cualificacion` | `codigo_nc` | `NO ACTION` | `NO ACTION` |
| `cortes_ocupacionales` | `periodo_id` | `periodos` | `id` | `NO ACTION` | `NO ACTION` |
| `cargas_datos_ocupacionales` | `carga_id` | `cargas_datos` | `id` | `CASCADE` | `NO ACTION` |
| `cargas_datos_ocupacionales` | `periodo_id` | `periodos` | `id` | `NO ACTION` | `NO ACTION` |
| `cargas_datos_ocupacionales` | `corte_id` | `cortes_ocupacionales` | `id` | `SET NULL` | `NO ACTION` |
| `indicadores_ocupacionales` | `corte_id` | `cortes_ocupacionales` | `id` | `CASCADE` | `NO ACTION` |
| `indicadores_ocupacionales` | `departamento_id` | `departamentos` | `id` | `RESTRICT` | `NO ACTION` |
| `indicadores_ocupacionales` | `ocupacion_id` | `ocupaciones` | `id` | `NO ACTION` | `NO ACTION` |
| `indicadores_ocupacionales` | `criterio_codigo` | `criterios_ocupacionales` | `codigo` | `NO ACTION` | `NO ACTION` |

---

## 5. Glosario de Convenciones Técnicas

- **UUID (Universally Unique Identifier):** Claves de 128 bits generadas sin colisiones para evitar predecibilidad de URLs.
- **TIMESTAMPTZ:** Marcas de tiempo con zona horaria estandarizadas en UTC para auditoría precisa.
- **JSONB:** Formato binario indexable de JSON de PostgreSQL para estructuras dinámicas (bloques Puck y Editor.js).
- **TSVECTOR & GIN:** Vector léxico de búsqueda y su índice invertido generalizado para consultas de lenguaje natural sin motores externos.
- **ON DELETE RESTRICT:** Bloquea la eliminación del registro padre si tiene dependientes activos (protección de datos).
- **ON DELETE CASCADE:** Elimina automáticamente registros subordinados que no tienen razón de existir sin el padre (ej. versiones de páginas, subidas temporales pendientes).
- **ON DELETE SET NULL:** Preserva el registro subordinado desvinculando al autor si el usuario es eliminado del sistema.
