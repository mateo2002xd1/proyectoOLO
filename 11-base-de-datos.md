# Base de Datos — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md` (arquitectura) y `2-convenciones-del-proyecto.md` (código).
> Define **el modelo de datos**: qué tabla existe, por qué existe, y qué regla de negocio sostiene cada una.
> Cubre los 17 requerimientos en su dimensión de persistencia.

**El DDL exacto no está aquí.** Vive en `api-backend/src/infrastructure/db/migrations/`. Este documento explica *la razón*; las migraciones son *la verdad*. La ficha técnica exhaustiva campo a campo, tipos de datos, restricciones y relaciones está disponible en el [Diccionario de Datos](12-diccionario-de-datos.md).

---

## 0. Las tres preguntas que responde el diseño

1. **¿Qué se guarda?** 19 tablas de dominio (20 incluyendo la tabla de control del runner de migraciones), agrupadas en 6 dominios esenciales (§4).
2. **¿Qué NO se guarda en Postgres?** Seis necesidades que parecen tabla y no lo son (§6).
3. **¿Qué impide que los datos queden inconsistentes?** Catorce invariantes declaradas en el esquema, no en el código (§5).

---

## 1. Decisiones de convención

| # | Decisión | Por qué |
|---|---|---|
| D1 | Tablas y columnas en **`snake_case`, plural, en español** | Ya es la convención §1 del documento de código. El dominio del proyecto es español (`Contenido`, `guardarBorrador`); la BD lo sigue |
| D2 | **`created_at` / `updated_at` en inglés** | Convención §1: "términos técnicos universales en inglés, no traducir lo que ya es estándar". Además son las que genera `underscored: true` de Sequelize, sin override por modelo |
| D3 | **`UUID` en toda clave primaria**, `DEFAULT gen_random_uuid()` | Los ids legacy (`Post`, `Section`, `Attachment`) ya son UUID guardados como `TEXT`: la conversión es un `USING id::uuid`. Un id secuencial se adivina y dice cuántas filas hay; por eso la tendencia ocupacional, que nació con `SMALLINT`/`INTEGER` (033), se convirtió en la 037. **Única excepción a D5 que esto obliga:** una columna generada no puede calcular un UUID, así que `indicadores_ocupacionales.criterio_codigo` y `ocupaciones.codigo_nc` apuntan a la clave natural `UNIQUE` del catálogo |
| D4 | Estados con **`CHECK`, nunca `ENUM` de Postgres** | Alterar un `ENUM` es una migración con bloqueo; un `CHECK` se reemplaza en una línea. El tipo TS es la fuente de verdad y el `CHECK` es la red de seguridad |
| D5 | **Se referencia por `id`, nunca se copia** | Ya es la decisión de la guía §2 para contenidos ("vínculo por referencia"). Aquí se extiende a archivos, tableros BI y políticas de privacidad |
| D6 | **Una sola desnormalización en todo el esquema**: `auditoria_cambios.usuario_nombre` | RF-07 exige saber *quién* cambió qué. Si el usuario se borra, la fila de auditoría debe seguir siendo legible. Es la única copia deliberada |
| D7 | **El acceso a cada app es un permiso, no una columna** | `acceso.sitio` y `acceso.intranet` son filas en `permisos`. Ver §2.1 |
| D8 | **Borrado lógico por `estado`, no por `deleted_at`** | RF-01 pide *despublicar*, no borrar. El ciclo ya tiene estados; añadir una segunda forma de "no visible" duplicaría la regla |

---

## 2. Punto de partida: lo que estaba duplicado

El esquema anterior se generaba con `sequelize.sync()` al arrancar, con las migraciones en stub. Eso produjo diez divergencias, todas resueltas en el diseño de §4:

| # | Qué pasaba | Resolución |
|---|---|---|
| 1 | El modelo `Contenido` escribía en una tabla llamada `"Post"` | Tabla `contenidos` |
| 2 | **Dos tablas de usuarios** (`users`, `usuarios_sitio`) con la misma forma | Una sola `usuarios` (§2.1). `usuarios_sitio` se eliminó en `013-eliminar-usuarios-sitio` |
| 3 | **Dos tablas de auditoría** divergentes: `content_audit_logs` (modelo) y `content_audit_log` (SQL), con columnas distintas | Una sola `auditoria_cambios` |
| 4 | `Attachment` no coincidía consigo mismo: el modelo declaraba `fileName/filePath/sizeBytes`, el SQL `title/url/size` | `archivos` + `contenidos_archivos` (§4.3) |
| 5 | **Índices duplicados** sobre columnas ya `UNIQUE` (`users.email`, `Post.slug`, `paginas.slug`, `usuarios_sitio.email`) — un `UNIQUE` ya crea su índice | Índice único, sin el suelto |
| 6 | `paginas.creado_por` era `NOT NULL` en el SQL y `allowNull: true` en el modelo | `NULL` permitido, `ON DELETE SET NULL`: borrar a un usuario no puede borrar páginas |
| 7 | Nada impedía **dos versiones publicadas** de la misma página | Índice único parcial (§5) |
| 8 | Nada impedía dos `numero_version` iguales en la misma página | `UNIQUE(pagina_id, numero_version)` |
| 9 | Ids mixtos: `TEXT` en tres tablas, `UUID` en el resto | D3 |
| 10 | Tres convenciones de nombres conviviendo: `users`, `paginas`, `"Post"` con `"sectionId"` | D1 |

### 2.1 Por qué hay una sola tabla de usuarios

Hay usuarios del sitio y usuarios de la intranet, pero **eso no los hace dos entidades**: son personas con credenciales, con la misma estructura, la misma política de contraseña, la misma caducidad (RF-16) y la misma auditoría. Dos tablas obligarían a dos caminos de login, dos implementaciones de caducidad y dos historiales.

Lo que sí difiere es **a qué aplicación puede entrar cada quien**, y eso es autorización — el problema que RBAC ya resuelve. Se modela como dos permisos:

| Permiso | Quién lo tiene |
|---|---|
| `acceso.sitio` | superadmin, administrador, editor |
| `acceso.intranet` | superadmin, administrador, director/subdirector |

El middleware de cada frontend exige el suyo. Un director/subdirector no entra al panel del sitio; un superadmin entra a los dos.

**Alternativas descartadas:** una columna `ambito` en `usuarios` la repetiría en cada fila y quedaría desincronizada del rol; una columna `ambito` en `roles` obligaría a clonar el rol "editor" el día que uno necesite entrar también a la intranet. Con permisos, el administrador lo compone desde el panel sin tocar código — que es literalmente lo que pide RF-04.

---

## 3. Mapa de relaciones

```
                    ┌──────────┐        ┌───────────┐
                    │  roles   │───┬───▶│ permisos  │   (roles_permisos, M:N)
                    └────┬─────┘   │    └───────────┘
                         │ 1:N     └── acceso.sitio / acceso.intranet (§2.1)
                         ▼
   ┌────────────────┬─────────────┬──────────────────────┐
   │           ┌────────────┐     │                      │
   │           │  usuarios  │◀────┴── creado_por (auto-referencia)
   │           └──┬──┬──┬───┘
   │              │  │  └──────────────▶ preguntas_seguridad  (1:N, CASCADE)
   │ subido_por   │  │ usuario_id
   ▼              ▼  ▼
┌──────────┐  ┌───────────────────┐  ┌───────────┐
│ paginas  │  │ auditoria_cambios │  │ archivos  │   
└────┬─────┘  └───────────────────┘  └───────────┘
     │ 1:N                                 ▲
     ▼                                     │ referenciados por id
┌──────────────────────┐                   │ desde los bloques Puck (D5)
│  paginas_versiones   │                   │
└──────────────────────┘                   │
version_publicada_id ──▲  (FK circular)    │
                                           │
┌──────────────────────┐   ┌──────────────────────┐
│  subidas_pendientes  │   │   bloqueos_edicion   │ (concurrencia pesimista en Puck,
│ (recolección basura) │   │ (lease con TTL)      │  PK: ambito + slug)
└──────────────────────┘   └──────────────────────┘

  auditoria_cambios ── entidad_tipo + entidad_id ──▶ (paginas | usuarios | ...)

  ─── Módulo: Observatorio Laboral y Ocupacional (Datos Dinámicos / Snowflake) ───
  ┌─────────────────┐ 1:N  ┌───────────────────┐
  │  departamentos  │─────▶│ centros_formacion │
  └────────┬────────┘      └─────────┬─────────┘
           │ 1:N                     │ 1:N
           │   ┌─────────────────────┘
           ▼   ▼
  ┌──────────────────────────────────────────────────┐
  │             programas_sobresalientes             │ (Hechos / Métricas)
  │ (PK UUID, UNIQUE: centro_id + programa_id + sexo)│
  └──────────────────────────────────────────────────┘
           ▲   ▲
           │   └─────────────────────┐
           │ 1:N                     │ 1:N
  ┌────────┴────────┐ 1:N  ┌─────────┴─────────┐
  │niveles_formacion│─────▶│programas_formacion│
  └─────────────────┘      └───────────────────┘
```

La tabla de auditoría usa un par `tipo + id` en lugar de una FK, porque apunta a entidades de tablas distintas. Es la única relación polimórfica no declarada con FK rígida en el motor, y es deliberada: una FK real exigiría una columna por tabla auditada, casi todas en `NULL`.

---

## 4. Inventario de tablas

Las 19 tablas de este inventario existen en el esquema y **las 19 tienen modelo Sequelize**, así que `npm run db:verificar` las cubre todas (más `migraciones_aplicadas` como tabla técnica del runner de migraciones).

> **Nota sobre depuración (Migración 020) y expansión (021 a 025)**: Se eliminaron 8 tablas inactivas (`auditoria_accesos`, `configuraciones`, `marca_versiones`, `tableros_bi`, `politicas_privacidad`, `consentimientos`, `respaldos`, `notificaciones`) que habían sido diseñadas para fases futuras pero nunca tuvieron repositorios ni uso en el código. Posteriormente, el esquema incorporó `bloqueos_edicion` (021) para control de concurrencia pesimista en edición visual, `subidas_pendientes` (024) para la recolección de basura de archivos no confirmados en Puck, y el módulo de **Observatorio Laboral y Ocupacional** (025) compuesto por 5 tablas (`departamentos`, `centros_formacion`, `niveles_formacion`, `programas_formacion`, `programas_sobresalientes`).

### 4.1 Identidad y acceso — RF-04, RF-05, RF-16

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`usuarios`** | Toda persona con credenciales, del sitio o de la intranet (§2.1) | `UNIQUE(lower(email))` — la normalización a minúsculas ya la hace el repositorio, aquí se garantiza. `rol_id` `RESTRICT`: no se borra un rol con usuarios. `creado_por` auto-referencia `SET NULL` |
| **`roles`** | superadmin, administrador, editor, director/subdirector, y los `Editor <algo>` que se creen desde `/admin/roles` | `nombre` UNIQUE. `es_sistema` impide borrar los roles base desde el panel |
| **`permisos`** | La acción autorizable: `paginas.aprobar`, `contenidos.publicar`, `acceso.intranet` | `clave` UNIQUE. Se llama `clave` y no `nombre` porque es un identificador estable que el código compara, no una etiqueta que se traduce |
| **`roles_permisos`** | Qué puede cada rol | PK compuesta `(rol_id, permiso_id)`, ambas `CASCADE`. Sin `id` propio: la pareja es la identidad |
| **`preguntas_seguridad`** | Recuperación de cuenta | `UNIQUE(usuario_id, pregunta_clave)`. `CASCADE`: borrar el usuario borra sus preguntas |

`usuarios.fecha_caducidad` en `NULL` significa *sin caducidad*, y es lo que RF-16 reserva al administrador. La verificación ocurre en el login del backend, nunca en el frontend.

**Las cuatro columnas que `usuarios` ganó después del diseño**, porque cada una sostiene una regla que antes vivía solo en el código:

| Columna | Migración | Qué sostiene |
|---|---|---|
| `apellidos` | 010 | Antes todo iba en `nombre`. El relleno de las filas existentes fue heurístico (la última palabra), así que los datos viejos pueden estar mal partidos |
| `intentos_fallidos_login` | 011 | Los 5 intentos / 15 minutos del login. **Aparte** de `intentos_fallidos`, que es de las preguntas de seguridad y cuenta 3 / 30 minutos. Dos umbrales distintos en dos flujos distintos: una sola columna habría bloqueado a destiempo en los dos |
| `bloqueado_hasta` | 011 | Ese sí es compartido: la cuenta está bloqueada o no, venga el bloqueo de donde venga |
| `ultimo_acceso_en` | anterior, pero **antes no medía nada** | El cierre por inactividad de 20 minutos del servidor. La columna existía y solo se escribía al iniciar sesión; ahora se refresca en cada petición, como mucho una vez por minuto para no convertir cada lectura en un `UPDATE`. Ver `3-seguridad-del-proyecto.md` §S3 |

### 4.2 Observatorio Laboral y Ocupacional

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`ocupaciones`** | Catálogo principal de ocupaciones | `UNIQUE(codigo)`. |
| **`niveles_ocupacionales`** | Catálogo base del SENA | `UNIQUE(codigo)`. |
| **`niveles_cualificacion`** | Catálogo base del SENA | PK es `codigo_nc`. |
| **`cortes_ocupacionales`** | Gestión de cortes de datos | `UNIQUE(anio, periodo_id)`. |
| **`periodos`** | Catálogo estático temporal (Trimestres, Semestres) | `UNIQUE(codigo)`. |
| **`indicadores_ocupacionales`** | Datos masivos de las vacantes e inscritos | FK a ocupaciones, cortes, criterios. |
| **`criterios_ocupacionales`** | Reglas estáticas (ej. "Alta demanda") | `UNIQUE(codigo)`. |
| **`cargas_datos_ocupacionales`** | Metadatos de la subida masiva (auditoría sobre el archivo cargado) | PK y FK a la tabla general de cargas. |

### 4.3 Archivos — RF-02, RF-12, RF-15

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`archivos`** | Un archivo almacenado, con su metadato de seguridad | `hash_sha256` **UNIQUE**. `nombre_almacenado` UNIQUE (UUID generado). `ambito` `CHECK(publico\|interno)` |

**Por qué el archivo no tiene una relación M:N con contenidos.** El archivo subido desde el editor Puck no pertenece a un contenido tradicional: pertenece a un bloque. Con la tabla suelta, el bloque la referencia por `id` (D5), y el mismo archivo puede estar en una página, en un bloque y en la marca institucional sin triplicarse.

### 4.4 Maqueta, gobernanza y concurrencia — RF-01, RF-06

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`paginas`** | El lienzo editable: slug, título y cuál es su versión viva | `ambito` `CHECK(sitio\|intranet)` y **`UNIQUE(ambito, slug)`** — las dos apps comparten tabla y sin el ámbito sus slugs colisionan. `version_publicada_id` es una FK circular, `DEFERRABLE INITIALLY DEFERRED` y `ON DELETE SET NULL` |
| **`paginas_versiones`** | Cada versión del árbol Puck, con su estado en el ciclo y su comentario de cambios | Ver §5: cuatro invariantes del ciclo editorial viven aquí (I1–I4 e I14) |
| **`bloqueos_edicion`** | Concurrencia pesimista (lease / lock) para edición visual en Puck | PK compuesta `(ambito, slug)`. `expira_en` gestiona la expiración automática del bloqueo. `usuario_id` y `usuario_nombre` identifican al editor activo. `CHECK (ambito IN ('sitio', 'intranet'))` |
| **`subidas_pendientes`** | Archivos multimedia cargados en borradores que aún no han sido publicados | PK compuesta `(pagina_id, ruta)`. `pagina_id` FK a `paginas.id` con `ON DELETE CASCADE`. Permite recolectar basura y purgar archivos huérfanos al publicar o descartar |

`paginas_versiones.creado_por` es nuevo. Antes solo se registraba quién revisó y quién publicó, así que **no se podía saber quién editó** — un hueco directo en RF-07.

**`paginas` dejó de ser una lista fija (2026-08-20).** Hasta entonces sus filas las
sembraba un script y correspondían una a una con rutas escritas en el código. Hoy
cualquiera con el permiso `secciones.crear` añade una desde el editor, y cualquiera con
`secciones.eliminar` la borra. Tres consecuencias que tocan directamente al esquema:

- **Una sección viva son tres filas en tres tablas**: `paginas`, la clave
  `editar.{ambito}.{slug}` en `permisos`, y su concesión en `roles_permisos`. Se crean
  en una sola transacción — a medias quedaría una sección que existe y nadie puede
  editar, o un permiso que no corresponde a ninguna página.
- **Borrar cuesta dos `DELETE`, no cuatro**: `paginas_versiones` cae en cascada desde
  `paginas` y `roles_permisos` desde `permisos`. Las cascadas del §5 no son decoración;
  son lo que hace que esta operación no deje restos.
- **`auditoria_cambios` sobrevive al borrado**, porque apunta por `entidad_tipo +
  entidad_id` y **no tiene clave foránea** contra `paginas`. Lo que en el §3 se explica
  como una decisión de modelado —una FK real exigiría una columna por tabla auditada—
  resultó ser además lo que permite borrar una página sin perder el rastro de lo que
  pasó en ella. RF-07 y la Ley 1581 siguen cubiertos aunque la página ya no exista.

Y una regla que se aprendió por las malas en la 014: **renombrar un slug obliga a
`UPDATE permisos SET clave`, nunca a borrar e insertar.** `roles_permisos` apunta por
UUID, así que borrar la fila del permiso revoca los accesos en silencio, sin un solo
error.

### 4.5 Auditoría — RF-07, RF-12, RF-15

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`auditoria_cambios`** | Quién modificó qué entidad, qué campos y cuándo | `campos_modificados` `JSONB` con forma `[{campo, antes, despues}]`. Índices por `(entidad_tipo, entidad_id, created_at DESC)`, `usuario_id` y `created_at DESC`, para que consultar por entidad o por fecha no recorra la tabla entera. `usuario_nombre` es la desnormalización de D6 |

### 4.6 Observatorio Laboral y Ocupacional — RF-08, RF-09, Tableros Dinámicos

Estructura en copo de nieve (Snowflake) que almacena los catálogos y las estadísticas del mercado laboral extraídas de reportes Excel cargados mediante el bloque `ImportadorExcelBloque` y el endpoint `/api/observatorio/importar`.

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`departamentos`** | Catálogo **único y cerrado** de los 33 departamentos oficiales, compartido por programas sobresalientes y tendencia ocupacional (migración 032) | `nombre` VARCHAR(100) UNIQUE (`uq_departamentos_nombre`), con el nombre oficial. `codigo_dane` CHAR(2) **obligatorio y único** (`uq_departamentos_codigo_dane`, `ck_departamentos_codigo_dane`). Ningún importador crea filas: resuelven por alias o rechazan |
| **`departamentos_alias`** | Nombres "tal como vienen" en los Excel («Distrito Capital», «Guajira, La», «Valle») → departamento | `alias_normalizado` PK (minúsculas, sin tildes, signos como espacio: `shared/normalizar-texto.ts`). FK a `departamentos.id` `ON DELETE CASCADE`. Un nombre nuevo se agrega aquí, nunca como departamento |
| **`centros_formacion`** | Sedes o centros del SENA pertenecientes a cada regional | `departamento_id` FK a `departamentos.id` (`ON DELETE RESTRICT, ON UPDATE CASCADE`). Restricción única compuesta `UNIQUE(departamento_id, nombre)` (`uq_centros_formacion_depto_nombre`) |
| **`niveles_formacion`** | Niveles académicos ofrecidos (Técnico, Tecnólogo, Especialización, etc.) | `nombre` VARCHAR(50) UNIQUE (`uq_niveles_formacion_nombre`) |
| **`programas_formacion`** | Oferta educativa del SENA ligada a su nivel | `nivel_formacion_id` FK a `niveles_formacion.id` (`ON DELETE RESTRICT, ON UPDATE CASCADE`). Restricción única compuesta `UNIQUE(nivel_formacion_id, nombre)` (`uq_programas_formacion_nivel_nombre`) |
| **`programas_sobresalientes`** | Tabla transaccional de hechos que consolida los indicadores de vinculación laboral y egresados | FKs a `departamentos.id`, `centros_formacion.id`, `programas_formacion.id`, `niveles_formacion.id` (`RESTRICT`/`CASCADE`). Restricciones numéricas: `certificados >= 0`, `0 <= vinculados <= certificados`, `0 <= tasa_vinculacion <= 1`, `salario_promedio >= 0`. `CHECK (sexo IN ('M', 'F'))`. **Clave única de idempotencia: `UNIQUE(centro_id, programa_id, sexo)`** |

**Ingesta y procesamiento atómico de Excel:**
El backend procesa los archivos `.xlsx` en memoria mediante streaming (`exceljs`), validando encabezados y tipos. Para garantizar idempotencia y evitar duplicación de métricas, la carga se ejecuta en una única transacción de base de datos (`transaction.commit()` / `rollback()`). Resuelve el departamento por `departamentos_alias` (un nombre desconocido rechaza la carga), asegura la existencia de las otras dimensiones de catálogo (`centros_formacion`, `niveles_formacion`, `programas_formacion`) y finalmente realiza un `upsert` sobre `programas_sobresalientes` utilizando la tupla única `(centro_id, programa_id, sexo)`.

#### 4.6.1 Tendencia ocupacional (percentiles inscritos vs. vacantes) — migración 033

Lo que alimenta el bloque "Tendencia Ocupacional" del sitio. Especificación completa, con
el análisis del Excel y los conteos esperados, en `criterios/analisis-normalizacion-percentiles-ocupacionales.md`.
Un **corte** es un (año, periodo): el Excel no trae ninguno de los dos y los elige quien carga.

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`niveles_ocupacionales`** | 0, A, B, C, D con la `etiqueta` exacta del filtro ("Nivel 3,4 (C)") y su descripción | Semilla. Es también la partición con la que se calcularon los percentiles |
| **`niveles_cualificacion`** | Dígito N.C. del Excel (0, 1, 2, 3, 4, 6) → nivel. 3 y 4 son C | Semilla. `codigo_nc` `UNIQUE` (`uq_niveles_cualificacion_codigo_nc`). Un N.C. no catalogado (p. ej. 5) lo rechaza la FK de `ocupaciones` |
| **`criterios_ocupacionales`** | Los cuatro criterios (las cuatro columnas "X" del Excel) | Semilla. `codigo` es lo que referencian los hechos y lo que filtra la API; `orden` 1–4 es el número de la especificación |
| **`periodos`** | T1–T4, S1, S2, ANUAL, en ese orden | Semilla, catálogo cerrado |
| **`ocupaciones`** | Catálogo CNO de las ocupaciones que traen los archivos: código y nombre | `codigo` CHAR(4) UNIQUE `^[0-9]{4}$`. `codigo_nc` **generada** del código. `nombre_vigencia` = año×10 + orden del periodo que fijó el nombre: solo lo cambia un corte igual o más reciente |
| **`cortes_ocupacionales`** | Un (año, periodo) cargado, en `borrador` o `publicado` | `UNIQUE(anio, periodo_id)`, `anio` de cuatro cifras (1000–9999, migración 035: sin rango de negocio). `huella_datos` (md5 del contenido numérico), sin `UNIQUE` desde la 034: el mismo contenido puede estar en varios periodos |
| **`cargas_datos_ocupacionales`** | Lo propio de una carga de percentiles: celda, corte resultante, filas y `reporte` JSONB de validaciones V1–V9 | PK = FK a `cargas_datos.id` `ON DELETE CASCADE`. Lo común (archivo, quién, estado, progreso) sigue en `cargas_datos` con `modulo = 'tendencia_ocupacional'` |
| **`indicadores_ocupacionales`** | Hechos: corte × ámbito × ocupación. `departamento_id NULL` = hoja nacional | `criterio_codigo` **columna generada** con la fórmula del 80 % sobre los percentiles (`DOUBLE PRECISION`, como Excel), FK a `criterios_ocupacionales.codigo`. Unicidad del grano con dos índices parciales (nacional / departamental). Índice `(corte_id, departamento_id, criterio_codigo)` para el buscador |

Dos vistas: `v_buscador_ocupacional` (lo único que lee el buscador; el sitio solo ve
`corte_estado = 'publicado'`) y `v_estado_cargas_ocupacional` (matriz año × periodo para el
panel de Actualizaciones, con `estado_celda`: del menor al mayor año con corte o carga, y
siempre de 2012 al año actual; migración 035).

**El año es libre.** Cualquier año de cuatro cifras: anteriores a la serie y proyecciones hacia
adelante (validador `anio`, CHECK de `cortes_ocupacionales` y `cargas_datos_ocupacionales`). El
panel lo elige con un calendario de años donde también se escribe. En el sitio, sin año pedido,
`/opciones` propone el más reciente que no sea futuro, para que las proyecciones publicadas no
tapen los datos de hoy.

La carga reutiliza el sistema de "Programa + Sobresalientes" —archivo en `archivos`,
fila en `cargas_datos`, trabajo en la cola `heavy-jobs`— y ejecuta en **una** transacción
los pasos de `criterios/002_carga_y_validaciones.sql`: candado por celda, celda libre, tabla
temporal, V1–V5 (abortan), V6–V9 (advertencias), huella (sin V10 desde la 034), catálogo,
corte e indicadores. Detalle en `use-cases/observatorio/tendencia-ocupacional/`.

**Solo se carga en una celda libre**: sin corte (ni en borrador ni publicado) y sin otra carga
en curso. La subida responde 409 si no lo está, antes de guardar el Excel, y el cargador lo
vuelve a mirar con el candado tomado, porque dos subidas simultáneas a la misma celda vacía
pasan las dos el primer control (la segunda termina en error con el mismo mensaje). Para
cambiar el archivo de una celda se elimina antes su carga (abajo). Así el corte nace siempre
en `borrador` y se crea con `INSERT` sin `ON CONFLICT`; la opción «reemplazar» se retiró
(la columna `cargas_datos_ocupacionales.reemplazar` queda en `false` y solo describe cargas viejas).

**Eliminar una carga de tendencia** (`DELETE /api/observatorio/tendencia-ocupacional/cargas/:id`,
papelera del historial): `cargas_datos` + `cargas_datos_ocupacionales` son la trazabilidad de
cada año y periodo, así que borrar es explícito y confirmado. Se van la fila, su reporte y el Excel
de `uploads/cargas-datos/` —salvo que otra carga lo use: los archivos se deduplican por contenido—.
Si la carga es la **vigente** de su celda, se borra también el corte con sus indicadores (CASCADE);
sin eso quedarían datos sin la carga que los trajo. Una reemplazada o fallida no toca los datos.
Corre con el candado de la celda sin esperarlo (409 si una carga está guardando en ella), y el
cargador comprueba con el candado tomado que su carga sigue existiendo, porque el Excel se lee antes.
La ruta de "Programa + Sobresalientes" (`DELETE /api/observatorio/cargas/:id`) las sigue rechazando
con 409: no sabe borrar el corte.

### 4.7 Lo que hay en la base y no está en el inventario

Tras aplicar las migraciones, la base contiene los 19 modelos activos más la tabla técnica de control:

| Tabla | Qué es | Hasta cuándo |
|---|---|---|
| `migraciones_aplicadas` | La tabla de control del runner: qué migración se aplicó y cuándo. No es del dominio, es de la herramienta | Permanente |

*(Nota: Las tablas obsoletas legacy `_obsoleto_attachment` y `FileStatuses` fueron purgadas formalmente en la migración 020).*

---

## 5. Invariantes garantizadas por el esquema

Cada una es una regla de negocio que **el código no puede violar por accidente**, porque la base de datos la rechaza.

| # | Invariante | Cómo se declara | Qué protege |
|---|---|---|---|
| I1 | Una página tiene **como máximo una versión publicada** | `UNIQUE(pagina_id) WHERE estado='publicado'` | La invariante del §1.2 del ciclo editorial: lo que ve el ciudadano solo cambia al aprobar |
| I2 | Una página tiene **como máximo una versión en revisión** | `UNIQUE(pagina_id) WHERE estado='en_revision'` | Bloquear la edición mientras está en revisión |
| I3 | No hay dos versiones con el mismo número | `UNIQUE(pagina_id, numero_version)` | Historial coherente |
| I4 | Una versión rechazada **siempre tiene motivo** | `CHECK estado='rechazado' ⇒ motivo_rechazo NOT NULL` | RF-06: el editor sabe por qué |
| I5 | Un contenido publicado **siempre tiene fecha** | `CHECK estado='publicado' ⇒ publicado_en NOT NULL` | RF-10 y "Últimas publicaciones" no pueden ordenar por `NULL` |
| I6 | La navegación **nunca pasa de 3 niveles** | `CHECK nivel BETWEEN 1 AND 3` | RF-11 |
| I7 | **Una sola marca activa** | `UNIQUE(activa) WHERE activa = true` | RF-03: el sitio no puede tener dos identidades |
| I8 | **Una sola política de privacidad vigente** | Índice parcial sobre `vigente_hasta IS NULL` | RF-13: se sabe sin ambigüedad qué se está aceptando |
| I9 | **Solo se registran aceptaciones** | `CHECK (aceptado = true)` | Ley 1581: el consentimiento es explícito o no existe |
| I10 | **Idempotencia en programas sobresalientes** | `UNIQUE(centro_id, programa_id, sexo)` | Permite re-subir archivos Excel actualizados sin duplicar filas de estadísticas ni corromper agregaciones |
| I11 | **Consistencia de egresados y vinculados** | `CHECK (vinculados >= 0 AND vinculados <= certificados)` | No pueden existir más aprendices vinculados que certificados en una cohorte |
| I12 | **Tasa de vinculación acotada** | `CHECK (tasa_vinculacion >= 0 AND tasa_vinculacion <= 1)` | Consistencia matemática del ratio porcentual (0.0000 a 1.0000) |
| I13 | **Validación estricta de género** | `CHECK (sexo IN ('M', 'F'))` | Evita registros no tipificados en las estadísticas oficiales del Observatorio |
| I14 | Una versión en revisión **siempre dice qué cambió** | `CHECK estado='en_revision' ⇒ btrim(comentario_cambios) <> ''` (`ck_paginas_versiones_comentario`, migración 029) | RF-06/RF-07: quien aprueba y quien audita leen el «commit» del envío. Gemela de la I4 |
| I14 | **Ámbito de bloqueos de edición** | `CHECK (ambito IN ('sitio', 'intranet'))` | Garantiza que los bloqueos de concurrencia pesimista solo apliquen a los ámbitos válidos del sistema |
| I15 | **Limpieza e integridad de subidas pendientes** | `PRIMARY KEY (pagina_id, ruta)` + `ON DELETE CASCADE` hacia `paginas.id` | Al eliminar una página o publicar una versión, los archivos temporales no confirmados se purgan sin dejar registros huérfanos |
| I16 | **Un departamento, un código** | `departamentos.codigo_dane` `NOT NULL` + `UNIQUE` + `CHECK ~ '^[0-9]{2}$'` (migración 032) | El catálogo no vuelve a tener dos Vaupés: los filtros y los mapas de los dos módulos trabajan por código |
| I17 | **El criterio no contradice a los percentiles** | `indicadores_ocupacionales.criterio_codigo` `GENERATED ALWAYS … STORED` con la fórmula del 80 % (era `criterio_id` hasta la 037) | Una "X" editada a mano en el Excel no llega a la base: el criterio se calcula |
| I18 | **Una fila por corte, ámbito y ocupación** | `UNIQUE (corte_id, ocupacion_id) WHERE departamento_id IS NULL` + `UNIQUE (corte_id, departamento_id, ocupacion_id) WHERE departamento_id IS NOT NULL` | Recargar un corte reemplaza sin duplicar |
| I19 | ~~**Un archivo, una celda**~~ — retirada en la 034 | (era `cortes_ocupacionales.huella_datos UNIQUE`) | Los datos se repiten entre periodos y el mismo archivo se carga en varios a propósito; V10 lo bloqueaba con «Este mismo contenido ya está cargado en…». La huella se sigue guardando, sin `UNIQUE` |

Y las reglas que protegen el borrado: `RESTRICT` en `roles`, `secciones`, `archivos`, `departamentos`, `centros_formacion`, `niveles_formacion` y `programas_formacion` (no se borra un catálogo ni un archivo en uso), `SET NULL` en las autorías (borrar un usuario no borra su trabajo), `CASCADE` solo donde el hijo no tiene sentido sin el padre (preguntas de seguridad, versiones de página, subidas pendientes).

---

## 6. Lo que deliberadamente NO es tabla

| Necesidad | Dónde vive | Por qué no en Postgres |
|---|---|---|
| Sesiones / JWT | Cookie `httpOnly` + Redis | El token es corto y firmado; una tabla de sesiones no aporta nada que la firma no dé, y añade una escritura por request |
| Intentos de login / rate limiting | Redis (`express-rate-limit`) | Escritura por request fallido; en Postgres envenena el WAL sin dar nada a cambio |
| Bloqueo de edición concurrente | Tabla `bloqueos_edicion` con lease / `expira_en` | Formalizado en Postgres en migración 021 para persistir el estado entre reinicios y auditar bloqueos activos sin depender de infraestructura externa |
| Caché de páginas públicas | Redis | Ya decidido en la guía §3.3 |
| **Ocupaciones CNO / CUOC (RF-09)** | **Servicio externo consumido con API key + caché Redis** | RF-09 dice "consultando **en línea** la BD del OLO". Replicarla localmente crearía una copia que envejece y una segunda fuente de verdad. La API key vive solo en el `.env` del backend (S5). La tabla `ocupaciones` (033) **no** es esa réplica: solo guarda código y nombre de las ocupaciones que traen los archivos de percentiles, para que sus hechos tengan contra qué apuntar |
| Cola de respaldos | BullMQ sobre Redis | Solo el **historial** se persiste, en `respaldos` |
| Contadores de límite de tasa | Redis, con **conexión propia** | Se comparten entre réplicas y sobreviven a un reinicio. La conexión es distinta de la de BullMQ a propósito: aquella se abre con `maxRetriesPerRequest: null` porque BullMQ lo exige, y con Redis caído encola comandos para siempre en vez de fallar — un limitador montado encima colgaría la API entera al primer parpadeo |
| Permisos de cada rol, mientras se atiende | Memoria del proceso, con TTL y invalidación explícita | `roles_permisos` es la verdad; esto es una caché de un `JOIN` que se consultaría en **cada** petición autorizada. Se invalida al escribir (`invalidarPermisosDeRol`) y el TTL solo cubre el caso de varias réplicas, donde la escritura ocurre en un proceso y la caché está en otro |

---

## 7. Mapa requerimiento → tabla

| RF | Tablas |
|---|---|
| RF-01 contenidos | `contenidos`, `secciones`, `paginas`, `paginas_versiones`, `bloqueos_edicion`, `subidas_pendientes` |
| RF-02 documentos | `archivos`, `contenidos_archivos` |
| RF-03 identidad visual | `archivos` (logotipos institucionales) |
| RF-04 roles | `usuarios`, `roles`, `permisos`, `roles_permisos` |
| RF-05 restricción al editor | `roles_permisos` + policies |
| RF-06 aprobación | `paginas_versiones` (I1–I4) |
| RF-07 historial | `auditoria_cambios` |
| RF-08 Power BI y datos dinámicos | `departamentos`, `departamentos_alias`, `centros_formacion`, `niveles_formacion`, `programas_formacion`, `programas_sobresalientes` (importación Excel); tendencia ocupacional: `ocupaciones`, `cortes_ocupacionales`, `indicadores_ocupacionales` y sus catálogos (§4.6.1) |
| RF-09 CNO/CUOC | Catálogos del Observatorio + servicio externo en línea (§6) |
| RF-10 buscador interno | `contenidos.busqueda` (tsvector + GIN) |
| RF-11 navegación 3 clics | `secciones.nivel` (I6) |
| RF-12 descarga pública | `archivos` (`ambito='publico'`, `estado='disponible'`), `auditoria_cambios` |
| RF-13 Habeas Data | `auditoria_cambios` |
| RF-14 accesibilidad | `archivos.texto_alternativo` |
| RF-15 directores | `archivos` (`ambito='interno'`), permiso `acceso.intranet` |
| RF-16 auth y caducidad | `usuarios.fecha_caducidad`, `preguntas_seguridad` |
| RF-17 respaldos | Procesamiento vía scripts y almacenamiento externo |

---

## 8. Plan de migración por fases

Cada fase deja la base consultable y la API funcionando, según la regla 2 de `4-reglas.md`. **Ninguna borra datos.**

Las migraciones viven en `api-backend/src/infrastructure/db/migrations/` y se aplican con `npm run migrate` (`migrate:status` para ver pendientes, `migrate:down` para revertir la última). El runner las ejecuta **en el orden explícito de su manifiesto, no leyendo el directorio**: un archivo suelto en la carpeta no se aplica solo. Cada migración corre en su propia transacción.

| Fase | Migración | Qué hace | Riesgo | Estado |
|---|---|---|---|---|
| 0 | `index.ts` + `scripts/migrate.ts` | Runner real y tabla de control `migraciones_aplicadas`. Se quita `sequelize.sync()` del arranque — era lo que de verdad definía el esquema, contra la convención #4 de la guía. Ahora el servidor **se niega a arrancar** si hay migraciones pendientes | Bajo | **Hecho** |
| 1 | `001-esquema-base` | Línea base idempotente del esquema actual, para que una instalación nueva y una existente converjan. Absorbe además el `ALTER TABLE` que el arranque ejecutaba en cada boot | Bajo | **Hecho** |
| 2 | `002-tablas-nuevas` | Las diez tablas del §4 que no existían, más los permisos `acceso.sitio` / `acceso.intranet` y las configuraciones por defecto. Puramente aditiva | Bajo | **Hecho** |
| 3 | `003-restricciones-e-indices` | Las invariantes del §5, el `tsvector` + GIN de RF-10 y los índices de auditoría de RF-07. Elimina los índices redundantes | Medio | **Hecho** |
| 4 | `004-contenidos-secciones-archivos` | `"Post"`→`contenidos`, `"Section"`→`secciones`, ids `TEXT`→`UUID`, columnas a `snake_case`. Los adjuntos de `"Attachment"` pasan a `archivos` + `contenidos_archivos`; el árbol de `secciones` y el `estado` de `contenidos` entran aquí | Alto | **Hecho** |
| 5 | `005-identidad` | `users`→`usuarios`, `permissions`→`permisos`, `role_permissions`→`roles_permisos`, `security_questions`→`preguntas_seguridad`. Añade `es_sistema`, `creado_por`, el único por `lower(email)` y reparte los permisos de acceso por rol | Alto | **Hecho** |
| 6 | `006-auditoria-unificada` | `content_audit_logs`→`auditoria_cambios`, que deja de hablar solo de contenidos. Traduce también los valores y añade `ip`/`user_agent` | Medio | **Hecho** |
| 7 | `007-paginas-ambito` | `ambito` en `paginas` con `UNIQUE(ambito, slug)`, y `creado_por` en `paginas_versiones` | Medio | **Hecho** |

### 8.0 Lo que vino después del plan

Las siete fases de arriba eran el plan; de la 008 en adelante son las migraciones que
pidió el trabajo real. Ya no son «fases»: cada una responde a un cambio concreto, y por
eso la tabla lleva el porqué en vez de un número de riesgo.

| # | Migración | Por qué existe |
|---|---|---|
| 008 | `paginas-slug-unico-por-ambito` | **La 007 no funcionó.** Quiso quitar la unicidad vieja con `DROP CONSTRAINT IF EXISTS paginas_slug_key`, pero esa restricción no se llamaba así: había decenas de copias numeradas (`paginas_slug_key1`, `…key2`) que dejó `sequelize.sync({ alter: true })` de correr una y otra vez. El `IF EXISTS` no encontró ninguna y pasó de largo **sin error**, así que `ambito` no servía de nada. Aquí se borran por definición, no por nombre |
| 009 | `limpiar-restricciones-duplicadas` | Lo mismo en el resto del esquema: más de sesenta copias de la misma `UNIQUE` por columna en `secciones`, `permisos`, `roles`, `contenidos`, `usuarios` y `FileStatuses`. No rompían nada, solo que cada copia es un índice más que mantener en cada escritura. De cada grupo se conserva la más antigua, que es la que referencian las foráneas |
| 010 | `agregar-apellidos-usuarios` | Parte `usuarios.nombre` en `nombre` + `apellidos`. El relleno de los existentes es heurístico —la última palabra— y está anotado como tal |
| 011 | `politica-passwords` | `intentos_fallidos_login` **aparte** de `intentos_fallidos`: el contador de las preguntas de seguridad bloquea a los 3 intentos por 30 min y el del login a los 5 por 15 min. Reutilizar la misma columna habría mezclado las dos cuentas. `bloqueado_hasta` sí se comparte: la cuenta está bloqueada o no lo está, venga de donde venga. Añade además el verbo `cambiar_password` al `CHECK` de la bitácora |
| 012 | `catalogo-permisos` | Rehace el catálogo entero. Ver abajo |
| 013 | `eliminar-usuarios-sitio` | `DROP TABLE usuarios_sitio`, con guarda: cuenta las filas y **aborta si hay alguna** — son datos personales bajo Ley 1581 y una migración no decide borrarlos |
| 014 | `renombrar-slug-menu-y-pie` | `plantilla` → `menu-y-pie`. El slug se escribe en la bitácora como campo modificado, y quien auditaba leía `slug → plantilla` sin poder saber si eso fue tocar una página o cambiar la cabecera y el pie de **todas** |
| 015 | `inicio-texto-enriquecido` | Los títulos de la portada del sitio pasan de «texto con `**`» a HTML (`type: 'richtext'`, que Puck 0.22 trae de serie) |
| 016 | `permiso-crear-secciones` | Da de alta `secciones.crear` |
| 017 | `titulo-menu-y-pie` | La 014 renombró el slug y dejó el `titulo` en `plantilla`, que es lo que pinta la cola de aprobación. Acotada por el título viejo: si alguien ya le puso nombre a mano, no se lo pisa |
| 018 | `revertir-titulos-intranet` | Repara lo que la 015 rompió. Ver abajo |
| 019 | `permiso-eliminar-secciones` | Da de alta `secciones.eliminar`, separado del de crear a propósito: crear añade, eliminar destruye y no se deshace |
| 020 | `depuracion-y-optimizacion-esquema` | Purgado formal de 8 tablas inactivas sin uso (`auditoria_accesos`, `configuraciones`, `marca_versiones`, `tableros_bi`, `politicas_privacidad`, `consentimientos`, `respaldos`, `notificaciones`) y tablas huérfanas legacy (`_obsoleto_attachment`, `FileStatuses`) |
| 021 | `bloqueos-edicion` | Crea la tabla `bloqueos_edicion` con clave compuesta `(ambito, slug)` y marca temporal `expira_en` para control de concurrencia pesimista con lease/TTL al editar páginas en Puck |
| 022 | `auditoria-guardar-borrador` | Añade `'guardar_borrador'` a la restricción `ck_auditoria_accion` de `auditoria_cambios` |
| 023 | `permiso-politica-privacidad-sitio` | Da de alta el permiso `politica-privacidad.editar` en el catálogo de permisos |
| 024 | `subidas-pendientes` | Crea la tabla `subidas_pendientes` con clave `(pagina_id, ruta)` y `ON DELETE CASCADE` para recolectar y purgar archivos subidos en borradores no publicados |
| 025 | `visitas-paginas` | Añade la columna `visitas` (entero, default 0) a `paginas` y siembra conteos iniciales para las páginas publicadas existentes |
| 026 | `observatorio-programas-sobresalientes` | Crea las 5 tablas del esquema snowflake del Observatorio: catálogos (`departamentos`, `centros_formacion`, `niveles_formacion`, `programas_formacion`) y tabla transaccional de hechos `programas_sobresalientes` con clave de idempotencia `(centro_id, programa_id, sexo)` e índices de cobertura |
| 029 | `comentario-cambios-versiones` | `paginas_versiones.comentario_cambios VARCHAR(100)`: el «commit» obligatorio al enviar a revisión. Va en la versión y no solo en la bitácora porque aprobar, rechazar y descartar también lo registran, y las hace otra persona después. Añade la invariante I14; las versiones que ya estuvieran en revisión se rellenan con «Enviada antes de que el comentario fuera obligatorio» en vez de dejar el `CHECK` en `NOT VALID` |
| 030 | `acciones-seguridad-auditoria` | Suma `autenticar`, `expirar` e `inactivar` al `CHECK` de `auditoria_cambios`. Hasta entonces el login no dejaba rastro y una cuenta caducada o inactivada a mano se confundía con cualquier `actualizar`. Se recrea el `CHECK` entero, como en la 011 y la 022; al revertir, las filas nuevas vuelven a `actualizar` para no romper el `CHECK` anterior |
| 032 | `departamentos-catalogo-unico` | Depura `departamentos` **en su sitio** (conserva los UUID que ya usan los programas): fusiona variantes con el mismo código («Vaupes»/«Vaupés»), borra las que no resuelven y no tienen datos («Vupes»), pone los nombres oficiales, agrega los que faltaban (Caquetá, Chocó, Vichada), deja `codigo_dane` obligatorio y único, y crea `departamentos_alias`. Si una variante sin código tuviera datos, o dos variantes el mismo centro, **se detiene** en vez de adivinar. El `down` no deshace la fusión |
| 033 | `tendencia-ocupacional` | Las 8 tablas y 2 vistas de §4.6.1, con sus semillas. DDL de `criterios/001_percentiles_ocupacionales.sql` con las tablas en plural, el catálogo de departamentos de la 032 y la bitácora en `cargas_datos` |
| 034 | `cortes-ocupacionales-huella-repetible` | Quita el `UNIQUE` de `cortes_ocupacionales.huella_datos` (I19) y el cargador deja de aplicar V10: el mismo contenido puede cargarse en varios periodos. La huella se sigue guardando. Al revertir, las huellas repetidas quedan en NULL salvo la del corte más antiguo, para poder recrear el `UNIQUE` |
| 035 | `tendencia-anio-libre` | Quita el rango 2012–2100 del año: los CHECK de `anio` de `cortes_ocupacionales` y `cargas_datos_ocupacionales` (por definición, no por nombre, como la 008) pasan a «cuatro cifras». La matriz `v_estado_cargas_ocupacional` va del menor al mayor año con corte o carga (antes 2012..máx. corte: no veía un 2005 ni un año futuro con la carga en curso o fallida). En su propia transacción, como la 032. Revertir falla sin tocar nada si ya hay años fuera de 2012–2100 |
| 037 | `tendencia-ocupacional-claves-uuid` | Las ocho tablas de la 033 pasan a UUID en toda clave primaria y foránea (D3), en su sitio y sin perder datos: los catálogos eran 1, 2, 3… y los cortes, ocupaciones e indicadores, identidades secuenciales. `/cortes/{id}/despublicar` recibía un entero que se adivina. El criterio generado pasa de `criterio_id` (1–4) a `criterio_codigo`, y la API lo pide por código. El `down` devuelve los enteros: los catálogos, los de su semilla (`id` = `orden`); el resto, nuevos y en orden. En su propia transacción. Las columnas `id` quedan al final de cada tabla: Postgres no reordena columnas |

Tres lecciones de este tramo que vale más recordar que releer:

**La 012 — un catálogo de permisos que no comprobaba nadie.** Había 21 claves y
**ninguna ruta verificaba ninguna**: toda la autorización iba por rol. El panel dejaba
mover interruptores que no hacían nada — se «revocaba» Eliminar Usuarios y esa persona
seguía borrando. Había además claves indistinguibles (`view_audit` / `access_audit`) y
otras que decían «editar contenido» sin decir *qué* contenido, que era justo la pregunta
que había que responder. El catálogo nuevo deriva las claves de edición del slug de cada
sección (`editar.{ambito}.{slug}`), que es lo que permite atar a un editor a un ámbito y
a secciones concretas.

**La 016 y la 019 — por qué un permiso entra por migración.** Las dos claves están en
`CATALOGO_PERMISOS`, así que `npm run sembrar:permisos` las crearía. Pero el sembrador
se corre a mano y nada obliga a hacerlo: `server.ts` exige que no haya migraciones
pendientes para arrancar y no tiene un control equivalente para las siembras. Sin la
migración, un despliegue normal deja a la API pidiendo un permiso que no existe en la
tabla, y el botón no le aparece a nadie —salvo al superadmin, que pasa por bypass— sin
que nada explique por qué.

**La 018 — filtrar por tipo de bloque no es filtrar por aplicación.** La 015 elegía qué
convertir según el `type` del bloque, y `RecursosVisualesBloque` y `Publicaciones`
existen en las dos apps: en el sitio migraron a `richtext`, en la intranet siguen siendo
`text` pintado con `resaltar()`. Resultado: `<p><strong>Recursos</strong> visuales</p>`
se veía **literal, en pantalla**, en la portada de la intranet. Toda migración sobre
`paginas_versiones` tiene que unir con `paginas` y filtrar por `ambito`.

Y una regla de método que la 018 deja fijada: **una migración aplicada no se reescribe.**
La 015 ya estaba anotada en `migraciones_aplicadas`; corregirla en su sitio habría dejado
esta base con los datos mal y el registro diciendo que todo fue bien. Con las dos, los
dos caminos convergen — sobre una base ya migrada la 018 repara, sobre una base nueva la
015 (ya con filtro) no toca nada y la 018 no encuentra qué reparar.

### 8.1 La decisión que hace segura toda la fase 4

> **Se renombra la columna, no el atributo del modelo.**

`Contenido.title` sigue llamándose `title` en el modelo y en el JSON de la API; la columna es `titulo`, y `field: 'titulo'` une las dos. Lo mismo con `sectionId`→`seccion_id`, `User.name`→`nombre` y el resto.

Sin esto, renombrar una columna obligaría a cambiar el modelo, el repositorio, el caso de uso, el controlador **y los dos frontends** en el mismo despliegue. Con esto, la base adopta la convención del proyecto y **ningún frontend se entera**: quien consuma `/api/contenidos` y el panel de usuarios siguen recibiendo exactamente los mismos campos.

Por el mismo motivo **tampoco se traducen los valores**: `usuarios.estado` sigue guardando `'active'`/`'inactive'` porque el panel de usuarios los compara y los escribe tal cual. La única excepción es `auditoria_cambios`, donde sí se tradujeron nombres y valores — ningún frontend consume todavía esos campos, así que no había contrato que romper.

Alinear también los nombres de atributo al español es un refactor de la API, con su propio plan y sus propios consumidores que avisar. No es trabajo de base de datos.

### 8.2 Lo que la fase 4 encontró y tuvo que resolver

- **Autorías que no eran UUID.** El modo de autenticación local escribe identificadores que no son UUID en `authorId`, que nunca tuvo clave foránea. Se vacían y se cuenta cuántos: una autoría desconocida es mejor que abortar la migración por datos de desarrollo.
- **Archivos heredados sin hash.** `archivos.hash_sha256` era `NOT NULL UNIQUE` para deduplicar, pero los adjuntos ya cargados nunca se leyeron del disco. En vez de inventar el hash, la unicidad pasa a ser **parcial**: aplica solo a los que lo traen, que son todos los que suba el `shared/storage` de RF-02.
- **Slugs de página que podían chocar.** El sitio y la intranet comparten la tabla `paginas` y el slug era único a secas: `/inicio` no podía existir en las dos. Ahora es `UNIQUE(ambito, slug)`.
- **`"Attachment"` no se borra**, se renombra a `_obsoleto_attachment` (regla 5 de `4-reglas.md`). Se elimina cuando `archivos` esté verificada en uso.

### 8.3 Lo que sigue pendiente, y por qué

- **`usuarios_sitio` se eliminó** (`013-eliminar-usuarios-sitio`). Ya no es un renombrado pendiente: con la tabla se retiró su login propio (`/api/sitio-users`) y el segundo secreto JWT (`JWT_SITE_SECRET`) que solo firmaba esos tokens. Estaba vacía y ningún frontend la consumía — el panel del sitio siempre entró por `/api/auth/login`, que valida contra `usuarios`. `usuarios` es hoy la única identidad del sistema.
- **`contenidos.cuerpo` sigue siendo `TEXT`.** El diseño lo quiere `JSONB` porque Editor.js produce JSON, pero convertir sin saber qué hay dentro de las filas existentes rompería la tabla. Necesita una revisión previa del contenido real. Confirmado el 2026-08-21 en el modelo: `content: { type: DataTypes.TEXT, field: 'cuerpo' }`. Es de las pocas cosas del §4.2 que el esquema todavía no cumple, así que la frase de esa sección —«es `JSONB`, no `TEXT`»— describe el destino, no lo que hay.
- **`script.sql` salió a `migrations/_obsoletas/`**, y los dos `docker-compose` lo siguen montando como script de inicialización de Postgres. No es un problema de la base sino del despliegue —está anotado en `docker/7-despliegue.md`— pero conviene saberlo aquí también: **una base levantada con Docker no obtiene su esquema de ahí**. Lo obtiene de `npm run migrate`, como todas.
- **Verificación obligatoria.** El puente modelo↔columna son cadenas que ningún compilador valida. Por eso existe `npm run db:verificar`: contrasta cada atributo de cada modelo contra `information_schema` y falla nombrando el que no cuadre. **Ejecutarlo después de migrar no es opcional.**

### 8.4 Resultado de la ejecución

Las siete migraciones del plan y las diecinueve sucesivas **están aplicadas**: hoy el manifiesto lleva **veintiséis migraciones (`001` a `026`)**. `npm run db:verificar` confirma que los **19 modelos Sequelize activos** coinciden exactamente con las columnas reales de PostgreSQL (más la tabla de control `migraciones_aplicadas`).

Cuatro cosas que solo se supieron al ejecutar, y que estaban mal supuestas en el diseño:

| Lo que se asumía | Lo que había |
|---|---|
| `"Post".id`, `"Section".id`, `"Attachment".id` eran `TEXT`, como declaraban los modelos | Ya eran **`uuid`**. Sobraban todas las conversiones de tipo, y los pre-chequeos con `!~*` habrían fallado: no es un operador válido sobre `uuid` |
| `permissions.created_at` tendría `DEFAULT now()` | `NOT NULL` **sin default**: el valor lo ponía Sequelize desde JavaScript, así que un `INSERT` en SQL plano no tenía quien lo rellenara |
| Las filas del driver llegan como objeto | Llegan como **array posicional**. Leerlas de una sola forma hacía que el verificador diera un informe falso y que el runner creyera que ninguna migración se había aplicado |
| El esquema contenía tablas obsoletas y stubs | Existían tablas como `FileStatuses` y `_obsoleto_attachment`, que fueron depuradas en la migración 020 junto con los stubs sin uso de desarrollo |

La lección para las siguientes: **el esquema real manda sobre lo que declara el modelo.** Antes de escribir una migración que convierta tipos, hay que mirar `information_schema`, no el `DataTypes` del modelo.

### 8.5 Pendiente conocido: las migraciones no son atómicas

El runner abre una transacción por migración, pero las sentencias se ejecutan con `sequelize.query()` sin pasarle esa transacción, así que corren fuera de ella. Si una migración falla a mitad, lo ya ejecutado **no se revierte** — es lo que pasó en el primer intento, que dejó `archivos` creada pese al fallo.

No es grave mientras las migraciones sean idempotentes (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`), que es como están escritas, pero conviene cerrarlo: pasar la transacción a cada sentencia. Hasta entonces, **respaldo antes de migrar** — `npm run respaldo <ruta.json>` vuelca las tablas con datos.

Un respaldo que no se ha probado a restaurar no es un respaldo (S9).

### 8.6 Lo que la fase 3 tuvo que corregir en los datos

Dos invariantes no se podían declarar sobre los datos existentes, así que la migración los normaliza antes y deja constancia:

- **I1 estaba rota.** `aprobarPagina` marcaba la nueva versión como publicada pero **nunca degradaba la anterior**, así que una página con dos aprobaciones acumulaba dos versiones en estado `publicado`. La migración archiva las reemplazadas —conservando la que apunta `version_publicada_id`— y el caso de uso ahora archiva la vigente antes de publicar la siguiente.
- **Estado `archivado`.** Una versión reemplazada no es borrador ni rechazada. El estado entra al dominio en esta fase.

---

## 9. Decisiones abiertas

- **Retención de auditoría.** `auditoria_accesos` crece sin techo. Cuando el volumen lo justifique, particionar por mes o archivar a almacenamiento frío. Hoy no hace falta y particionar de entrada sería complejidad sin dato que la respalde.
- **`etiquetas` + `contenidos_etiquetas`.** Filtrar por "categoría" hoy se resuelve con `secciones` jerárquicas. Si aparece la necesidad de una clasificación transversal a las secciones, entran esas dos tablas — no antes.
- **`archivos.ambito`** distingue público de interno, pero no permite compartir un archivo interno con un subconjunto de directores. Si RF-15 llega a exigir eso, se resuelve con permisos, no con una columna más.
