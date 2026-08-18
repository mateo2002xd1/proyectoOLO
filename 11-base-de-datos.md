# Base de Datos — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md` (arquitectura) y `2-convenciones-del-proyecto.md` (código).
> Define **el modelo de datos**: qué tabla existe, por qué existe, y qué regla de negocio sostiene cada una.
> Cubre los 17 requerimientos en su dimensión de persistencia.

**El DDL exacto no está aquí.** Vive en `api-backend/src/infrastructure/db/migrations/`. Este documento explica *la razón*; las migraciones son *la verdad*. Duplicar el `CREATE TABLE` en los dos sitios garantiza que uno de los dos quede desactualizado — es la misma regla que el README aplica al diagrama de capas.

---

## 0. Las tres preguntas que responde el diseño

1. **¿Qué se guarda?** 20 tablas, agrupadas en ocho dominios (§4).
2. **¿Qué NO se guarda en Postgres?** Seis necesidades que parecen tabla y no lo son (§6).
3. **¿Qué impide que los datos queden inconsistentes?** Nueve invariantes declaradas en el esquema, no en el código (§5).

---

## 1. Decisiones de convención

| # | Decisión | Por qué |
|---|---|---|
| D1 | Tablas y columnas en **`snake_case`, plural, en español** | Ya es la convención §1 del documento de código. El dominio del proyecto es español (`Contenido`, `guardarBorrador`); la BD lo sigue |
| D2 | **`created_at` / `updated_at` en inglés** | Convención §1: "términos técnicos universales en inglés, no traducir lo que ya es estándar". Además son las que genera `underscored: true` de Sequelize, sin override por modelo |
| D3 | **`UUID` en toda clave primaria**, `DEFAULT gen_random_uuid()` | Los ids legacy (`Post`, `Section`, `Attachment`) ya son UUID guardados como `TEXT`: la conversión es un `USING id::uuid` |
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
| `acceso.sitio` | superadmin, administrador, editor, visitante_interno |
| `acceso.intranet` | superadmin, administrador, director, subdirector |

El middleware de cada frontend exige el suyo. Un director no entra al panel del sitio; un superadmin entra a los dos.

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
   │       autor  │  │ subido_por
   ▼              ▼  ▼
┌──────────┐  ┌────────────┐         ┌───────────┐
│secciones │─▶│ contenidos │────────▶│ archivos  │   (contenidos_archivos, M:N)
│ (árbol,  │  └────────────┘         └───────────┘
│  máx 3)  │                                ▲
└──────────┘                                │ referenciados por id
                                            │ desde los bloques Puck (D5)
┌──────────┐  1:N   ┌────────────────────┐  │
│ paginas  │───────▶│ paginas_versiones  │──┘
└────┬─────┘        └────────────────────┘
     └── version_publicada_id ──▲  (FK circular, DEFERRABLE)

  auditoria_cambios ── entidad_tipo + entidad_id ──▶ (contenidos | paginas | usuarios | ...)
  auditoria_accesos ── recurso_tipo + recurso_id ──▶ (archivos | paginas | tableros_bi)

  politicas_privacidad ──1:N──▶ consentimientos       marca_versiones
  configuraciones (clave/valor)   tableros_bi          respaldos    notificaciones
```

Las dos tablas de auditoría usan un par `tipo + id` en lugar de una FK, porque apuntan a entidades de tablas distintas. Es la única relación no declarada en el esquema, y es deliberada: una FK real exigiría una columna por tabla auditada, casi todas en `NULL`.

---

## 4. Inventario de tablas

Las veinte tablas de este inventario existen en el esquema y **las veinte tienen modelo Sequelize**, así que `npm run db:verificar` las cubre todas.

Tener modelo no es tener la funcionalidad. Ocho de ellas —`auditoria_accesos`, `configuraciones`, `marca_versiones`, `tableros_bi`, `politicas_privacidad`, `consentimientos`, `respaldos`, `notificaciones`— todavía no tienen repositorio, caso de uso ni ruta: son la base sobre la que se construyen RF-03, RF-08, RF-13, RF-17 y la auditoría de acceso de RF-15. El modelo es el contrato con la tabla; lo que falta es la capa de aplicación encima.

### 4.1 Identidad y acceso — RF-04, RF-05, RF-16

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`usuarios`** | Toda persona con credenciales, del sitio o de la intranet (§2.1) | `UNIQUE(lower(email))` — la normalización a minúsculas ya la hace el repositorio, aquí se garantiza. `rol_id` `RESTRICT`: no se borra un rol con usuarios. `creado_por` auto-referencia `SET NULL` |
| **`roles`** | superadmin, administrador, editor, director, subdirector, visitante_interno | `nombre` UNIQUE. `es_sistema` impide borrar los roles base desde el panel |
| **`permisos`** | La acción autorizable: `paginas.aprobar`, `contenidos.publicar`, `acceso.intranet` | `clave` UNIQUE. Se llama `clave` y no `nombre` porque es un identificador estable que el código compara, no una etiqueta que se traduce |
| **`roles_permisos`** | Qué puede cada rol | PK compuesta `(rol_id, permiso_id)`, ambas `CASCADE`. Sin `id` propio: la pareja es la identidad |
| **`preguntas_seguridad`** | Recuperación de cuenta | `UNIQUE(usuario_id, pregunta_clave)`. `CASCADE`: borrar el usuario borra sus preguntas |

`usuarios.fecha_caducidad` en `NULL` significa *sin caducidad*, y es lo que RF-16 reserva al administrador. La verificación ocurre en el login del backend (T-16.13), nunca en el frontend.

### 4.2 Contenido — RF-01, RF-10, RF-11

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`secciones`** | El árbol de navegación del sitio | `padre_id` auto-referencia `RESTRICT`. `nivel` con `CHECK BETWEEN 1 AND 3` — **RF-11 (todo a tres clics) queda garantizado por el esquema**, no por la disciplina del editor. `UNIQUE(slug)` |
| **`contenidos`** | Cada estudio, informe, estadística o banner como registro independiente y buscable | `estado` con el ciclo completo (T-01.14). `busqueda` es una columna `tsvector GENERATED ALWAYS AS ... STORED` sobre título y resumen con configuración `spanish`, con índice **GIN** — así RF-10 no necesita tabla de índice aparte (T-10.2). `CHECK`: `estado='publicado'` ⇒ `publicado_en NOT NULL` |

`contenidos.cuerpo` es **`JSONB`**, no `TEXT`: Editor.js produce JSON, y guardarlo como texto obliga a parsear en cada lectura y hace imposible consultar por bloque.

**Sin versionado de contenidos.** A diferencia de las páginas, un contenido tiene `estado` + historial en `auditoria_cambios`, no filas de versión. RF-07 pide *historial de cambios* (quién, qué campos, cuándo) y eso es exactamente lo que da la auditoría. Duplicar la maquinaria de `paginas_versiones` para estudios y banners costaría una tabla, un repositorio y un ciclo de aprobación paralelo sin requerimiento que lo pida.

### 4.3 Archivos — RF-02, RF-12, RF-15

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`archivos`** | Un archivo almacenado, con su metadato de seguridad | `hash_sha256` **UNIQUE**: el mismo PDF subido dos veces no crea dos filas ni dos copias en disco. `nombre_almacenado` UNIQUE (UUID generado — S1, evita path traversal). `nombre_original` se conserva solo para que la descarga tenga nombre legible (T-12.7). `ambito` `CHECK(publico\|interno)` separa RF-12 de RF-15 |
| **`contenidos_archivos`** | Qué archivo aparece en qué contenido | PK `(contenido_id, archivo_id)`. `CASCADE` en contenido, `RESTRICT` en archivo: borrar un contenido no borra un archivo que otro esté usando |

**Por qué el archivo se separó del contenido.** El modelo anterior tenía `Attachment.postId NOT NULL`, así que **una imagen subida desde el editor Puck no tenía dónde guardarse**: no pertenece a ningún contenido, pertenece a un bloque. Con la tabla suelta, el bloque la referencia por `id` (D5), y el mismo archivo puede estar en un contenido, en un bloque y en la marca institucional sin triplicarse.

### 4.4 Maqueta y gobernanza — RF-01, RF-06

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`paginas`** | El lienzo editable: slug, título y cuál es su versión viva | `ambito` `CHECK(sitio\|intranet)` y **`UNIQUE(ambito, slug)`** — las dos apps comparten tabla y sin el ámbito sus slugs colisionan. `version_publicada_id` es una FK circular, `DEFERRABLE INITIALLY DEFERRED` y `ON DELETE SET NULL` |
| **`paginas_versiones`** | Cada versión del árbol Puck, con su estado en el ciclo | Ver §5: tres invariantes del ciclo editorial viven aquí |

`paginas_versiones.creado_por` es nuevo. Antes solo se registraba quién revisó y quién publicó, así que **no se podía saber quién editó** — un hueco directo en RF-07.

### 4.5 Auditoría — RF-07, RF-12, RF-15

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`auditoria_cambios`** | Quién modificó qué entidad, qué campos y cuándo | `campos_modificados` `JSONB` con forma `[{campo, antes, despues}]` (T-07.6). Índices por `(entidad_tipo, entidad_id, created_at DESC)`, `usuario_id` y `created_at DESC` — **T-07.12**. `usuario_nombre` es la desnormalización de D6 |
| **`auditoria_accesos`** | Quién vio o descargó qué recurso | `usuario_id` en `NULL` significa descarga pública anónima (RF-12). Cubre T-15.6 |

**Están separadas a propósito.** Un cambio y un acceso tienen volumen, retención y columnas distintos: los accesos crecen mucho más rápido y no tienen "campos modificados". Fusionarlas dejaría media tabla en `NULL` en cada fila y obligaría a una retención común que a una de las dos le queda mal.

### 4.6 Configuración — RF-02, RF-03, RF-08, RF-17

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`configuraciones`** | Ajustes escalares del sistema | La PK es **`clave TEXT`**, no un UUID: la clave *es* la identidad, un id sintético sería una columna que nadie usa. Cubre `archivos.tamano_maximo` (T-02.8), `powerbi.dominios_permitidos` (T-08.3) y `respaldos.frecuencia` (T-17.4) |
| **`marca_versiones`** | Cada juego de colores, tipografías y logotipos (T-03.4) | `tokens` `JSONB`; los logotipos son `archivo_id`, no rutas copiadas. `UNIQUE(activa) WHERE activa = true` — **una sola marca activa, garantizado**. `contraste_validado` registra el resultado de T-03.8 |
| **`tableros_bi`** | Los informes Power BI embebibles (RF-08) | `UNIQUE(nombre)`. La URL se valida en el servidor contra la lista blanca antes de guardarse (S6) |

`tableros_bi` cierra el §3.3 de `5-tableros-bi.md`: hoy el token del informe está escrito a mano en tres componentes. Al pasarlo a dato, **los bloques Puck guardan `tablero_id`** (D5), así que cambiar el informe se hace una vez y no en tres archivos.

### 4.7 Habeas Data — RF-13, Ley 1581/2012

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`politicas_privacidad`** | Cada versión del aviso de privacidad (T-13.6) | `version` UNIQUE. Una sola vigente a la vez, por índice parcial sobre `vigente_hasta IS NULL` |
| **`consentimientos`** | Cada aceptación explícita (T-13.4, T-13.5) | `politica_id` con **`RESTRICT`**: una política con consentimientos registrados no se puede borrar — tiene valor probatorio. `CHECK (aceptado = true)`: solo se persiste la aceptación, nunca una casilla premarcada (S7) |

No se copia el texto de la política en cada consentimiento: se referencia la versión (D5). Es lo que permite demostrar *qué* aceptó exactamente el titular sin guardar el documento miles de veces.

### 4.8 Operación — RF-17, RF-06

| Tabla | Qué guarda | Claves e invariantes |
|---|---|---|
| **`respaldos`** | El historial de ejecuciones (T-17.5) | `estado CHECK(en_curso\|exitoso\|fallido)`, `checksum_sha256`, `cifrado` por defecto `true` (S9), `retencion_hasta` para la rotación de T-17.8. Es también la fuente de la alerta de T-17.12 |
| **`notificaciones`** | Los avisos que se ven en el panel | `destinatario_id` `CASCADE`. `leida_en` es un `TIMESTAMPTZ` nullable en vez de un booleano: da el *cuándo* gratis. Índice `(destinatario_id, leida_en, created_at DESC)` para el contador de no leídas |

`notificaciones` **no copia el motivo del rechazo**: guarda `tipo`, `entidad_tipo`, `entidad_id` y un `datos JSONB` con los parámetros del mensaje. El texto se compone en el frontend a partir del tipo. Así el motivo vive en un solo lugar (`paginas_versiones.motivo_rechazo`) y editarlo no deja una notificación mintiendo.

### 4.9 Lo que hay en la base y no está en el inventario

Tras aplicar las migraciones, `\dt` muestra veintidós objetos. Los dos que no pertenecen al inventario están aquí para que nadie los tome por olvido:

| Tabla | Qué es | Hasta cuándo |
|---|---|---|
| `_obsoleto_attachment` | La antigua `"Attachment"`, apartada con sus datos ya copiados a `archivos` + `contenidos_archivos`. No se borra en el mismo paso que se crea su reemplazo (regla 5 de `4-reglas.md`) | Hasta que `archivos` esté verificada en uso |
| `migraciones_aplicadas` | La tabla de control del runner: qué migración se aplicó y cuándo. No es del dominio, es de la herramienta | Permanente |

---

## 5. Invariantes garantizadas por el esquema

Cada una es una regla de negocio que **el código no puede violar por accidente**, porque la base de datos la rechaza.

| # | Invariante | Cómo se declara | Qué protege |
|---|---|---|---|
| I1 | Una página tiene **como máximo una versión publicada** | `UNIQUE(pagina_id) WHERE estado='publicado'` | La invariante del §1.2 del ciclo editorial: lo que ve el ciudadano solo cambia al aprobar |
| I2 | Una página tiene **como máximo una versión en revisión** | `UNIQUE(pagina_id) WHERE estado='en_revision'` | T-05.11: bloquear la edición mientras está en revisión |
| I3 | No hay dos versiones con el mismo número | `UNIQUE(pagina_id, numero_version)` | Historial coherente |
| I4 | Una versión rechazada **siempre tiene motivo** | `CHECK estado='rechazado' ⇒ motivo_rechazo NOT NULL` | RF-06: el editor sabe por qué |
| I5 | Un contenido publicado **siempre tiene fecha** | `CHECK estado='publicado' ⇒ publicado_en NOT NULL` | RF-10 y "Últimas publicaciones" no pueden ordenar por `NULL` |
| I6 | La navegación **nunca pasa de 3 niveles** | `CHECK nivel BETWEEN 1 AND 3` | RF-11 |
| I7 | **Una sola marca activa** | `UNIQUE(activa) WHERE activa = true` | RF-03: el sitio no puede tener dos identidades |
| I8 | **Una sola política de privacidad vigente** | Índice parcial sobre `vigente_hasta IS NULL` | RF-13: se sabe sin ambigüedad qué se está aceptando |
| I9 | **Solo se registran aceptaciones** | `CHECK (aceptado = true)` | Ley 1581: el consentimiento es explícito o no existe |

Y dos que protegen el borrado: `RESTRICT` en `roles`, `secciones`, `archivos` y `politicas_privacidad` (no se borra algo en uso), `SET NULL` en las autorías (borrar un usuario no borra su trabajo), `CASCADE` solo donde el hijo no tiene sentido sin el padre (preguntas de seguridad, versiones de página).

---

## 6. Lo que deliberadamente NO es tabla

| Necesidad | Dónde vive | Por qué no en Postgres |
|---|---|---|
| Sesiones / JWT | Cookie `httpOnly` + Redis | El token es corto y firmado; una tabla de sesiones no aporta nada que la firma no dé, y añade una escritura por request |
| Intentos de login / rate limiting | Redis (`express-rate-limit`) | Escritura por request fallido; en Postgres envenena el WAL sin dar nada a cambio |
| Bloqueo de edición concurrente | Redis con TTL | Es efímero por definición: Redis lo expira solo, una tabla habría que barrerla con un job |
| Caché de páginas públicas | Redis | Ya decidido en la guía §3.3 |
| **Ocupaciones CNO / CUOC (RF-09)** | **Servicio externo consumido con API key + caché Redis (T-09.9)** | RF-09 dice "consultando **en línea** la BD del OLO". Replicarla localmente crearía una copia que envejece y una segunda fuente de verdad. La API key vive solo en el `.env` del backend (S5) |
| Cola de respaldos | BullMQ sobre Redis | Solo el **historial** se persiste, en `respaldos` |

---

## 7. Mapa requerimiento → tabla

| RF | Tablas |
|---|---|
| RF-01 contenidos | `contenidos`, `secciones`, `paginas`, `paginas_versiones` |
| RF-02 documentos | `archivos`, `contenidos_archivos`, `configuraciones` (tamaño y tipos) |
| RF-03 identidad visual | `marca_versiones`, `archivos` (logotipos) |
| RF-04 roles | `usuarios`, `roles`, `permisos`, `roles_permisos` |
| RF-05 restricción al editor | `roles_permisos` + policies |
| RF-06 aprobación | `paginas_versiones` (I1–I4), `notificaciones` |
| RF-07 historial | `auditoria_cambios` |
| RF-08 Power BI | `tableros_bi`, `configuraciones` (dominios permitidos) |
| RF-09 CNO/CUOC | **ninguna** — servicio externo (§6) |
| RF-10 buscador interno | `contenidos.busqueda` (tsvector + GIN) |
| RF-11 navegación 3 clics | `secciones.nivel` (I6) |
| RF-12 descarga pública | `archivos` (`ambito='publico'`, `estado='disponible'`), `auditoria_accesos` |
| RF-13 Habeas Data | `politicas_privacidad`, `consentimientos` |
| RF-14 accesibilidad | `archivos.texto_alternativo`, `marca_versiones.contraste_validado` |
| RF-15 directores | `archivos` (`ambito='interno'`), `auditoria_accesos`, permiso `acceso.intranet` |
| RF-16 auth y caducidad | `usuarios.fecha_caducidad`, `preguntas_seguridad` |
| RF-17 respaldos | `respaldos`, `configuraciones` (frecuencia) |

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

### 8.1 La decisión que hace segura toda la fase 4

> **Se renombra la columna, no el atributo del modelo.**

`Contenido.title` sigue llamándose `title` en el modelo y en el JSON de la API; la columna es `titulo`, y `field: 'titulo'` une las dos. Lo mismo con `sectionId`→`seccion_id`, `User.name`→`nombre` y el resto.

Sin esto, renombrar una columna obligaría a cambiar el modelo, el repositorio, el caso de uso, el controlador **y los dos frontends** en el mismo despliegue. Con esto, la base adopta la convención del proyecto y **ningún frontend se entera**: `sitio-web/src/features/contenidos/types.ts` y el panel de usuarios siguen recibiendo exactamente los mismos campos.

Por el mismo motivo **tampoco se traducen los valores**: `usuarios.estado` sigue guardando `'active'`/`'inactive'` porque el panel de usuarios los compara y los escribe tal cual. La única excepción es `auditoria_cambios`, donde sí se tradujeron nombres y valores — ningún frontend consume todavía esos campos, así que no había contrato que romper.

Alinear también los nombres de atributo al español es un refactor de la API, con su propio plan y sus propios consumidores que avisar. No es trabajo de base de datos.

### 8.2 Lo que la fase 4 encontró y tuvo que resolver

- **Autorías que no eran UUID.** El modo de autenticación local escribe identificadores que no son UUID en `authorId`, que nunca tuvo clave foránea. Se vacían y se cuenta cuántos: una autoría desconocida es mejor que abortar la migración por datos de desarrollo.
- **Archivos heredados sin hash.** `archivos.hash_sha256` era `NOT NULL UNIQUE` para deduplicar, pero los adjuntos ya cargados nunca se leyeron del disco. En vez de inventar el hash, la unicidad pasa a ser **parcial**: aplica solo a los que lo traen, que son todos los que suba el `shared/storage` de RF-02.
- **Slugs de página que podían chocar.** El sitio y la intranet comparten la tabla `paginas` y el slug era único a secas: `/inicio` no podía existir en las dos. Ahora es `UNIQUE(ambito, slug)`.
- **`"Attachment"` no se borra**, se renombra a `_obsoleto_attachment` (regla 5 de `4-reglas.md`). Se elimina cuando `archivos` esté verificada en uso.

### 8.3 Lo que sigue pendiente, y por qué

- **`usuarios_sitio` se eliminó** (`013-eliminar-usuarios-sitio`). Ya no es un renombrado pendiente: con la tabla se retiró su login propio (`/api/sitio-users`) y el segundo secreto JWT (`JWT_SITE_SECRET`) que solo firmaba esos tokens. Estaba vacía y ningún frontend la consumía — el panel del sitio siempre entró por `/api/auth/login`, que valida contra `usuarios`. `usuarios` es hoy la única identidad del sistema.
- **`contenidos.cuerpo` sigue siendo `TEXT`.** El diseño lo quiere `JSONB` porque Editor.js produce JSON, pero convertir sin saber qué hay dentro de las filas existentes rompería la tabla. Necesita una revisión previa del contenido real.
- **Verificación obligatoria.** El puente modelo↔columna son cadenas que ningún compilador valida. Por eso existe `npm run db:verificar`: contrasta cada atributo de cada modelo contra `information_schema` y falla nombrando el que no cuadre. **Ejecutarlo después de migrar no es opcional.**

### 8.4 Resultado de la ejecución

Las siete migraciones **están aplicadas** sobre la base de desarrollo (Neon). `npm run db:verificar` confirma que los 21 modelos coinciden con las columnas reales, y una lectura de prueba a través de los modelos devuelve los 5 usuarios con su rol, la página `inicio` con sus 6 versiones y las 5 configuraciones por defecto.

Cuatro cosas que solo se supieron al ejecutar, y que estaban mal supuestas en el diseño:

| Lo que se asumía | Lo que había |
|---|---|
| `"Post".id`, `"Section".id`, `"Attachment".id` eran `TEXT`, como declaraban los modelos | Ya eran **`uuid`**. Sobraban todas las conversiones de tipo, y los pre-chequeos con `!~*` habrían fallado: no es un operador válido sobre `uuid` |
| `permissions.created_at` tendría `DEFAULT now()` | `NOT NULL` **sin default**: el valor lo ponía Sequelize desde JavaScript, así que un `INSERT` en SQL plano no tenía quien lo rellenara |
| Las filas del driver llegan como objeto | Llegan como **array posicional**. Leerlas de una sola forma hacía que el verificador diera un informe falso y que el runner creyera que ninguna migración se había aplicado |
| El esquema solo contenía tablas conocidas | Existe una tabla huérfana **`FileStatuses`** (0 filas) que no aparece en ningún modelo, migración ni documento. Se dejó intacta |

La lección para las siguientes: **el esquema real manda sobre lo que declara el modelo.** Antes de escribir una migración que convierta tipos, hay que mirar `information_schema`, no el `DataTypes` del modelo.

### 8.5 Pendiente conocido: las migraciones no son atómicas

El runner abre una transacción por migración, pero las sentencias se ejecutan con `sequelize.query()` sin pasarle esa transacción, así que corren fuera de ella. Si una migración falla a mitad, lo ya ejecutado **no se revierte** — es lo que pasó en el primer intento, que dejó `archivos` creada pese al fallo.

No es grave mientras las migraciones sean idempotentes (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`), que es como están escritas, pero conviene cerrarlo: pasar la transacción a cada sentencia. Hasta entonces, **respaldo antes de migrar** — `npm run respaldo <ruta.json>` vuelca las tablas con datos.

Un respaldo que no se ha probado a restaurar no es un respaldo (S9).

### 8.1 Lo que la fase 3 tuvo que corregir en los datos

Dos invariantes no se podían declarar sobre los datos existentes, así que la migración los normaliza antes y deja constancia:

- **I1 estaba rota.** `aprobarPagina` marcaba la nueva versión como publicada pero **nunca degradaba la anterior**, así que una página con dos aprobaciones acumulaba dos versiones en estado `publicado`. La migración archiva las reemplazadas —conservando la que apunta `version_publicada_id`— y el caso de uso ahora archiva la vigente antes de publicar la siguiente.
- **Estado `archivado`.** Una versión reemplazada no es borrador ni rechazada. El estado entra al dominio en esta fase.

---

## 9. Decisiones abiertas

- **Retención de auditoría.** `auditoria_accesos` crece sin techo. Cuando el volumen lo justifique, particionar por mes o archivar a almacenamiento frío. Hoy no hace falta y particionar de entrada sería complejidad sin dato que la respalde.
- **`etiquetas` + `contenidos_etiquetas`.** El backlog menciona filtrar por "categoría" (T-10.3). Hoy se resuelve con `secciones` jerárquicas. Si aparece la necesidad de una clasificación transversal a las secciones, entran esas dos tablas — no antes.
- **`archivos.ambito`** distingue público de interno, pero no permite compartir un archivo interno con un subconjunto de directores. Si RF-15 llega a exigir eso, se resuelve con permisos, no con una columna más.
