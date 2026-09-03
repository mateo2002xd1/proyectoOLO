# Diccionario de Datos — Proyecto OLO (SENA)

> **Documento Técnico de Referencia de Base de Datos**  
> **Sistema Gestor:** PostgreSQL 16+ (Esquema `public`)  
> **Proyecto:** Observatorio Laboral y Ocupacional (OLO) — SENA  
> **Fecha de Generación:** 3 de septiembre de 2026  
> **Base de Integración:** Migraciones activas (`api-backend/src/infrastructure/db/migrations/`) y especificación técnica de persistencia ([11-base-de-datos.md](file:///c:/Users/Aprendiz/Documents/PROYECTOLO/OLO-proyect/11-base-de-datos.md)).

---

## 1. Resumen Ejecutivo del Esquema

El modelo de datos del Observatorio Laboral y Ocupacional (OLO) está implementado en **PostgreSQL** bajo el esquema `public`. Fue diseñado siguiendo principios de normalización relacional (3FN), segregación estricta de responsabilidades (RBAC), gobernanza de contenido mediante versionamiento inmutable y trazabilidad integral requerida por la **Ley 1581 de 2012 (Habeas Data)**.

### Métricas Generales del Esquema:
- **Total de Tablas Base:** 14 tablas activas.
- **Total de Columnas:** 121 atributos documentados.
- **Total de Llaves Foráneas (FK):** 19 relaciones de integridad referencial activas.
- **Total de Restricciones CHECK:** 14 restricciones de dominio y reglas de negocio en motor.
- **Estrategia de Identificadores (PK):** UUID versión 4 (`DEFAULT gen_random_uuid()`) en todas las entidades del dominio, garantizando unicidad global y previniendo enumeración secuencial maliciosa.
- **Control de Estados:** Implementado mediante restricciones `CHECK` con tipos de texto nativos en lugar de `ENUM` de PostgreSQL, permitiendo modificaciones y mantenimientos no bloqueantes.

---

## 2. Inventario y Verificación de Objetos de Base de Datos

En respuesta a la verificación de componentes adicionales del motor PostgreSQL:

| Tipo de Objeto | Cantidad | Estado / Detalle |
|---|---|---|
| **Tablas Base (`BASE TABLE`)** | **14** | Activas en producción y desarrollo. Cubren los 17 Requerimientos Funcionales (RF). |
| **Vistas (`VIEW`)** | **0** | No se utilizan vistas estándar. Las proyecciones se realizan mediante Sequelize / QueryBuilder. |
| **Vistas Materializadas (`MATERIALIZED VIEW`)** | **0** | Las agregaciones analíticas se delegan a Power BI (RF-08) y caché en memoria Redis. |
| **Procedimientos Almacenados (`PROCEDURE`)** | **0** | La lógica transaccional reside en la capa de servicios de la API (Node.js/TypeScript). |
| **Funciones de Negocio (`FUNCTION`)** | **0** | No hay funciones PL/pgSQL propietarias. El motor ejecuta exclusivamente las funciones criptográficas provistas por la extensión `pgcrypto`. |
| **Disparadores (`TRIGGER`)** | **0** | La auditoría y reglas de negocio se aplican por software y restricciones declarativas (`CHECK`, `UNIQUE`, `FK`), evitando efectos colaterales ocultos en BD. |
| **Paquetes (`PACKAGE`)** | **No aplica** | PostgreSQL no soporta paquetes estilo Oracle. La modularización se logra a nivel de esquemas y módulos de software. |
| **Extensiones (`EXTENSION`)** | **2** | `plpgsql` (v1.0) y `pgcrypto` (v1.4 - soporte para `gen_random_uuid()` y hashing). |
| **Tipos Personalizados / `ENUM`** | **0** | Decisión de diseño D4: se utilizan tipos primitivos (`text`, `varchar`) con restricciones `CHECK`. |
| **Secuencias (`SEQUENCE`)** | **0** | No se utilizan secuencias auto-incrementales; todas las llaves primarias son UUID. |
| **Índices Secundarios** | **48** | Índices B-Tree en llaves foráneas, restricciones de unicidad y un índice **GIN** especializado en `contenidos.busqueda` para búsqueda de texto completo (`tsvector`). |

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
| 4 | `usuario_id` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Clave foránea hacia el usuario que ejecutó la operación. |
| 5 | `usuario_nombre` | `TEXT` | — | SÍ | Ninguna | — | — | Nombre desnormalizado del usuario para preservar trazabilidad histórica (D6). |
| 6 | `accion` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Operación ejecutada ('crear', 'actualizar', 'eliminar', 'publicar', 'rechazar', etc.). Restringido por CHECK. |
| 7 | `campos_modificados` | `JSONB` | — | SÍ | Ninguna | — | `'[]'::jsonb` | Detalle JSONB con los deltas de campos alterados: [{campo, antes, despues}]. |
| 8 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Marca temporal exacta del evento auditado. |
| 10 | `ip` | `INET` | — | SÍ | Ninguna | — | — | Dirección de red INET desde la que se originó la petición. |
| 11 | `user_agent` | `TEXT` | — | SÍ | Ninguna | — | — | Encabezado User-Agent del navegador o cliente HTTP. |

**Restricciones de Integridad (CHECK) de `auditoria_cambios`:**
- **`ck_auditoria_accion`**: `(accion = ANY (ARRAY['crear'::text, 'actualizar'::text, 'eliminar'::text, 'publicar'::text, 'despublicar'::text, 'aprobar'::text, 'rechazar'::text, 'enviar_revision'::text, 'cambiar_password'::text]))`
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

### 3.4. Tabla: `contenidos`

- **Módulo / Dominio:** Gestión Editorial y Publicaciones
- **Requerimientos Asociados:** RF-01, RF-10
- **Propósito General:** Entidad principal para artículos, boletines, estadísticas, estudios y banners. Dispone de un vector de búsqueda textual `tsvector` generado automáticamente con configuración en español e indexado con GIN para consultas instantáneas.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `id` | `UUID` | — | NO (NOT NULL) | **PK** | — | `gen_random_uuid()` | Identificador único universal del contenido (UUID). |
| 2 | `titulo` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Título descriptivo de la publicación. |
| 3 | `slug` | `TEXT` | — | NO (NOT NULL) | **UK** | — | — | Identificador amigable único para rutas web. |
| 4 | `resumen` | `TEXT` | — | SÍ | Ninguna | — | — | Extracto o síntesis del artículo / publicación. |
| 5 | `cuerpo` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | — | Contenido enriquecido almacenado en formato estructurado JSONB (Editor.js) o texto. |
| 6 | `seccion_id` | `UUID` | — | NO (NOT NULL) | **FK** | `secciones.id` (ON DELETE NO ACTION) | — | Clave foránea hacia la sección jerárquica a la que pertenece. |
| 7 | `autor_id` | `UUID` | — | NO (NOT NULL) | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Clave foránea hacia el usuario autor que redactó el contenido. |
| 8 | `publicado_en` | `TIMESTAMPTZ` | — | SÍ | Ninguna | — | — | Fecha de publicación oficial para ordenamiento cronológico. |
| 9 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de registro técnico. |
| 10 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de modificación técnica. |
| 11 | `busqueda` | `TSVECTOR` | — | SÍ | Ninguna | — | — | Columna generada STORED tipo tsvector con índice GIN para búsquedas de texto completo en español. |
| 12 | `tipo` | `TEXT` | — | SÍ | Ninguna | — | — | Clasificación ('estudio', 'informe', 'estadistica', 'banner', 'noticia'). Restringido por CHECK. |
| 13 | `estado` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | `'borrador'::text` | Estado editorial ('borrador', 'en_revision', 'publicado', 'rechazado', 'archivado'). Restringido por CHECK. |
| 14 | `motivo_rechazo` | `TEXT` | — | SÍ | Ninguna | — | — | Texto explicativo en caso de que la publicación haya sido rechazada. |
| 15 | `revisado_por` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Usuario editor o aprobador que revisó el contenido. |
| 16 | `revisado_en` | `TIMESTAMPTZ` | — | SÍ | Ninguna | — | — | Marca temporal de la revisión. |
| 17 | `destacado` | `BOOLEAN` | — | NO (NOT NULL) | Ninguna | — | `false` | Bandera booleana para fijar la publicación en la sección principal. |

**Restricciones de Integridad (CHECK) de `contenidos`:**
- **`ck_contenidos_tipo`**: `((tipo IS NULL) OR (tipo = ANY (ARRAY['estudio'::text, 'informe'::text, 'estadistica'::text, 'banner'::text, 'noticia'::text])))`
- **`ck_contenidos_estado`**: `(estado = ANY (ARRAY['borrador'::text, 'en_revision'::text, 'publicado'::text, 'rechazado'::text, 'archivado'::text]))`

---

### 3.5. Tabla: `contenidos_archivos`

- **Módulo / Dominio:** Gestión Editorial y Multimedia
- **Requerimientos Asociados:** RF-01, RF-02
- **Propósito General:** Tabla asociativa muchos a muchos entre publicaciones y recursos multimedia. Define el rol de uso del recurso (`portada`, `adjunto`, `galeria`) y su orden de despliegue visual.

| No. | Campo | Tipo de Dato | Longitud | Permite Nulos | Tipo Llave | Referencia / Restricción | Valor por Defecto | Descripción y Reglas de Negocio |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| 1 | `contenido_id` | `UUID` | — | NO (NOT NULL) | **PK / FK** | `contenidos.id` (ON DELETE CASCADE) | — | Clave foránea hacia el contenido asociado. |
| 2 | `archivo_id` | `UUID` | — | NO (NOT NULL) | **PK / FK** | `archivos.id` (ON DELETE RESTRICT) | — | Clave foránea hacia el archivo multimedia asociado. |
| 3 | `orden` | `SMALLINT` | — | NO (NOT NULL) | Ninguna | — | `0` | Orden de secuencia visual del adjunto dentro de la publicación. |
| 4 | `rol` | `TEXT` | — | NO (NOT NULL) | Ninguna | — | `'adjunto'::text` | Función semántica del recurso ('adjunto', 'portada', 'galeria'). Restringido por CHECK. |
| 5 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | `now()` | Fecha y hora de vinculación. |

**Restricciones de Integridad (CHECK) de `contenidos_archivos`:**
- **`contenidos_archivos_rol_check`**: `(rol = ANY (ARRAY['adjunto'::text, 'portada'::text, 'galeria'::text]))`

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

**Restricciones de Integridad (CHECK) de `paginas_versiones`:**
- **`ck_paginas_versiones_estado`**: `((estado)::text = ANY ((ARRAY['borrador'::character varying, 'en_revision'::character varying, 'publicado'::character varying, 'rechazado'::character varying, 'archivado'::character varying])::text[]))`

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
- **Propósito General:** Catálogo de roles predefinidos y personalizados en el sistema (superadmin, administrador, editor, director, subdirector, visitante_interno). La bandera `es_sistema` impide la eliminación accidental de roles basales desde el panel de control.

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
| 9 | `password_hash` | `TEXT` | — | SÍ | Ninguna | — | — | Hash criptográfico de la contraseña del usuario (Bcrypt / Argon2id). |
| 10 | `created_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de creación del registro. |
| 11 | `updated_at` | `TIMESTAMPTZ` | — | NO (NOT NULL) | Ninguna | — | — | Fecha y hora de la última modificación del registro. |
| 12 | `debe_cambiar_password` | `BOOLEAN` | — | SÍ | Ninguna | — | `false` | Booleano que obliga al usuario a renovar su contraseña en el siguiente inicio de sesión. |
| 13 | `debe_configurar_preguntas` | `BOOLEAN` | — | SÍ | Ninguna | — | `true` | Booleano que exige la configuración de preguntas de seguridad. |
| 14 | `intentos_fallidos` | `INTEGER` | — | SÍ | Ninguna | — | `0` | Contador de intentos fallidos en preguntas de seguridad (3 intentos / 30 min). |
| 15 | `bloqueado_hasta` | `TIMESTAMPTZ` | — | SÍ | Ninguna | — | — | Marca de tiempo hasta la cual la cuenta permanece bloqueada. |
| 16 | `creado_por` | `UUID` | — | SÍ | **FK** | `usuarios.id` (ON DELETE SET NULL) | — | Usuario que registró esta cuenta en el sistema (auto-referencia). |
| 17 | `apellidos` | `TEXT` | — | SÍ | Ninguna | — | — | Apellidos del usuario. |
| 18 | `intentos_fallidos_login` | `INTEGER` | — | NO (NOT NULL) | Ninguna | — | `0` | Contador de intentos fallidos de login con contraseña (5 intentos / 15 min). |

**Restricciones de Integridad (CHECK) de `usuarios`:**
- **`ck_usuarios_estado`**: `(estado = ANY (ARRAY['active'::text, 'inactive'::text, 'locked'::text, 'expired'::text]))`

---

## 4. Matriz de Relaciones e Integridad Referencial (Foreign Keys)

| Tabla Origen | Columna Local | Tabla Destino | Columna Referenciada | Regla ON DELETE | Regla ON UPDATE |
|:---|:---|:---|:---|:---:|:---:|
| `roles_permisos` | `rol_id` | `roles` | `id` | `CASCADE` | `CASCADE` |
| `roles_permisos` | `permiso_id` | `permisos` | `id` | `CASCADE` | `CASCADE` |
| `paginas` | `version_publicada_id` | `paginas_versiones` | `id` | `SET NULL` | `NO ACTION` |
| `archivos` | `subido_por` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `contenidos_archivos` | `contenido_id` | `contenidos` | `id` | `CASCADE` | `NO ACTION` |
| `contenidos_archivos` | `archivo_id` | `archivos` | `id` | `RESTRICT` | `NO ACTION` |
| `secciones` | `padre_id` | `secciones` | `id` | `RESTRICT` | `NO ACTION` |
| `contenidos` | `revisado_por` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `contenidos` | `autor_id` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `usuarios` | `creado_por` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `paginas_versiones` | `creado_por` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `usuarios` | `rol_id` | `roles` | `id` | `NO ACTION` | `CASCADE` |
| `preguntas_seguridad` | `usuario_id` | `usuarios` | `id` | `CASCADE` | `CASCADE` |
| `contenidos` | `seccion_id` | `secciones` | `id` | `NO ACTION` | `CASCADE` |
| `auditoria_cambios` | `usuario_id` | `usuarios` | `id` | `SET NULL` | `NO ACTION` |
| `paginas_versiones` | `pagina_id` | `paginas` | `id` | `CASCADE` | `CASCADE` |
| `paginas_versiones` | `revisor_id` | `usuarios` | `id` | `SET NULL` | `CASCADE` |
| `paginas_versiones` | `publicado_por` | `usuarios` | `id` | `SET NULL` | `CASCADE` |
| `paginas` | `creado_por` | `usuarios` | `id` | `SET NULL` | `CASCADE` |

---

## 5. Glosario de Convenciones Técnicas

- **UUID (Universally Unique Identifier):** Claves de 128 bits generadas sin colisiones para evitar predecibilidad de URLs.
- **TIMESTAMPTZ:** Marcas de tiempo con zona horaria estandarizadas en UTC para auditoría precisa.
- **JSONB:** Formato binario indexable de JSON de PostgreSQL para estructuras dinámicas (bloques Puck y Editor.js).
- **TSVECTOR & GIN:** Vector léxico de búsqueda y su índice invertido generalizado para consultas de lenguaje natural sin motores externos.
- **ON DELETE RESTRICT:** Bloquea la eliminación del registro padre si tiene dependientes activos (protección de datos).
- **ON DELETE CASCADE:** Elimina automáticamente registros subordinados que no tienen razón de existir sin el padre (ej. versiones de páginas).
- **ON DELETE SET NULL:** Preserva el registro subordinado desvinculando al autor si el usuario es eliminado del sistema.
