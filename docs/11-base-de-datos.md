# Base de Datos — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md` (arquitectura) y `2-convenciones-del-proyecto.md` (código).
> Define **el modelo de datos**: qué tabla existe, qué información guarda, por qué existe y qué regla de negocio sostiene cada una.
> Cubre los 17 requerimientos en su dimensión de persistencia, y los módulos del Observatorio que llegaron después.

**El DDL exacto no está aquí.** Vive en `4000-api-backend/src/infrastructure/db/migrations/`. Este documento explica *la razón*; las migraciones son *la verdad*. La ficha campo a campo está en el [Diccionario de Datos](12-diccionario-de-datos.md).

**Medido, no supuesto.** El inventario (§4) y la revisión (§9) se contrastaron el 08-10-2026 contra la base real (Neon, PostgreSQL 18.6), leyendo el catálogo de Postgres y no las migraciones ni los modelos. Las tres fuentes no siempre dicen lo mismo, y cuando discrepan manda la base (§8.4): la revisión encontró tres `UNIQUE` que el documento daba por hechos y que nunca existieron (§9.1).

---

## 0. Las tres preguntas que responde el diseño

1. **¿Qué se guarda?** 32 tablas de dominio y 2 vistas, en siete grupos (§4), más `migraciones_aplicadas`, que es del runner y no del dominio. 23 de las 32 tienen modelo Sequelize; las ocho de la tendencia ocupacional y `departamentos_alias` se consultan con SQL directo.
2. **¿Qué NO se guarda en Postgres?** Lo que parece tabla y no lo es (§6).
3. **¿Qué impide que los datos queden inconsistentes?** Veintiuna invariantes declaradas en el esquema, no en el código (§5).

---

## 1. Decisiones de convención

| # | Decisión | Por qué |
|---|---|---|
| D1 | Tablas y columnas en **`snake_case`, plural, en español** | Ya es la convención §1 del documento de código. El dominio del proyecto es español (`Contenido`, `guardarBorrador`); la BD lo sigue |
| D2 | **`created_at` / `updated_at` en inglés** | Convención §1: "términos técnicos universales en inglés, no traducir lo que ya es estándar". Además son las que genera `underscored: true` de Sequelize, sin override por modelo |
| D3 | **`UUID` en toda clave primaria**, `DEFAULT gen_random_uuid()` | Los ids legacy (`Post`, `Section`, `Attachment`) ya son UUID guardados como `TEXT`: la conversión es un `USING id::uuid`. Un id secuencial se adivina y dice cuántas filas hay; por eso la tendencia ocupacional, que nació con `SMALLINT`/`INTEGER` (033), se convirtió en la 037. **Única excepción a D5 que esto obliga:** una columna generada no puede calcular un UUID, así que `indicadores_ocupacionales.criterio_codigo` y `ocupaciones.codigo_nc` apuntan a la clave natural `UNIQUE` del catálogo |
| D4 | Estados con **`CHECK`, nunca `ENUM` de Postgres** | Alterar un `ENUM` es una migración con bloqueo; un `CHECK` se reemplaza en una línea. El tipo TS es la fuente de verdad y el `CHECK` es la red de seguridad |
| D5 | **Se referencia por `id`, nunca se copia** | Ya es la decisión de la guía §2 para contenidos ("vínculo por referencia"). Aquí se extiende a archivos, departamentos, catálogos CIIU y ocupaciones |
| D6 | **Las copias son pocas, están en una lista y no pueden contradecirse** | Normalizar del todo costaría un JOIN en cada filtro o perdería historia. Las copias que hay están todas en §9.2, y cada una lleva o la regla que le impide desviarse (una FK compuesta, migración 041) o la razón por la que puede divergir a propósito (la bitácora conserva el nombre de quien se borró). Una copia que no esté en esa lista es un error |
| D7 | **El acceso a cada app es un permiso, no una columna** | `acceso.sitio` y `acceso.intranet` son filas en `permisos`. Ver §2.1 |
| D8 | **Borrado lógico por `estado`, no por `deleted_at`** | RF-01 pide *despublicar*, no borrar. El ciclo ya tiene estados; añadir una segunda forma de "no visible" duplicaría la regla |
| D9 | **Un índice existe porque una consulta lo lee o una FK lo necesita** | Cada índice se reescribe en cada `INSERT`, `UPDATE` y `DELETE` de su tabla. Antes de crear o quitar uno se mira `pg_stat_user_indexes` (§9.3). Y **`usuarios.ultimo_acceso_en` no se indexa nunca**: se escribe en cada petición, y hoy el 99 % de las escrituras en `usuarios` son *HOT* (Postgres no toca ningún índice) precisamente porque ninguna columna indexada cambia |
| D10 | **Un catálogo se identifica por la clave de su fuente, no por cómo se escribió** | Si la fuente trae código, el código es la identidad: DANE para departamentos, SENA para niveles, centros y programas, CIIU para clases, CNO para ocupaciones. Un nombre escrito distinto no es otra fila (se actualiza), y un código distinto sí lo es aunque el nombre coincida. Solo donde no hay código (municipios, empresas) la identidad es el nombre normalizado con `normalizar_nombre()`. Ver §9.5 |

---

## 2. Punto de partida: lo que estaba duplicado

El esquema anterior se generaba con `sequelize.sync()` al arrancar, con las migraciones en stub. Eso produjo diez divergencias, todas resueltas en el diseño de §4:

| # | Qué pasaba | Resolución |
|---|---|---|
| 1 | El modelo `Contenido` escribía en una tabla llamada `"Post"` | Tabla `contenidos` (borrada después con el CMS, migración 036) |
| 2 | **Dos tablas de usuarios** (`users`, `usuarios_sitio`) con la misma forma | Una sola `usuarios` (§2.1). `usuarios_sitio` se eliminó en `013-eliminar-usuarios-sitio` |
| 3 | **Dos tablas de auditoría** divergentes: `content_audit_logs` (modelo) y `content_audit_log` (SQL), con columnas distintas | Una sola `auditoria_cambios` |
| 4 | `Attachment` no coincidía consigo mismo: el modelo declaraba `fileName/filePath/sizeBytes`, el SQL `title/url/size` | `archivos` (§4.3) |
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

`A ──▶ B` quiere decir que A tiene la clave foránea hacia B. Entre paréntesis, lo que pasa con A al borrar B cuando no es el `RESTRICT` por defecto.

**Identidad y acceso**

```
usuarios ──▶ roles                       roles_permisos ──▶ roles     (CASCADE)
   │  └──▶ usuarios  (creado_por, SET NULL)  roles_permisos ──▶ permisos  (CASCADE)
   ▲
preguntas_seguridad ──▶ usuarios  (CASCADE)
```

**Páginas y ciclo editorial**

```
paginas_versiones ──▶ paginas              (CASCADE)
subidas_pendientes ──▶ paginas             (CASCADE)
paginas ──(version_publicada_id, id)──▶ paginas_versiones (id, pagina_id)
        FK circular, diferida y compuesta: solo una versión de la misma página (041)
paginas, paginas_versiones ──▶ usuarios    (creado_por, revisor_id, publicado_por: SET NULL)
bloqueos_edicion ··· (ambito, slug) ··· paginas    sin FK: candado efímero (§9.4)
```

**Auditoría, archivos y cargas**

```
auditoria_cambios ──▶ usuarios (SET NULL)      + entidad_tipo/entidad_id sin FK (abajo)
archivos ──▶ usuarios (SET NULL)
cargas_datos ──▶ archivos, usuarios (SET NULL)
cargas_datos_ocupacionales ──▶ cargas_datos (CASCADE)      1:1, comparte la clave
```

**Observatorio: Programa + Sobresalientes**

```
departamentos_alias ──▶ departamentos (CASCADE)
centros_formacion   ──▶ departamentos
programas_formacion ──▶ niveles_formacion
programas_sobresalientes ──▶ departamentos, centros_formacion, programas_formacion, niveles_formacion
   ├──(centro_id, departamento_id)────▶ centros_formacion (id, departamento_id)       compuesta (041)
   └──(programa_id, nivel_formacion_id)──▶ programas_formacion (id, nivel_formacion_id) compuesta (041)
```

**Observatorio: tendencia ocupacional**

```
indicadores_ocupacionales ──▶ cortes_ocupacionales (CASCADE) ──▶ periodos
   ├──▶ ocupaciones ──(codigo_nc)──▶ niveles_cualificacion ──▶ niveles_ocupacionales
   ├──▶ departamentos              (NULL = hoja nacional)
   └──(criterio_codigo, generada)──▶ criterios_ocupacionales (codigo)
cargas_datos_ocupacionales ──▶ periodos, cortes_ocupacionales (SET NULL)
```

**Alertas de inversión**

```
proyectos_inversion ──▶ empresas, ciiu_secciones, ciiu_clases, usuarios (SET NULL)
   └──(clase_id, seccion_id)──▶ ciiu_clases (id, seccion_id)              compuesta (041)
ciiu_clases ──▶ ciiu_secciones
municipios  ──▶ departamentos
proyectos_inversion_ubicaciones ──▶ proyectos_inversion (CASCADE), departamentos, municipios
   └──(municipio_id, departamento_id)──▶ municipios (id, departamento_id)   compuesta (041)
```

La tabla de auditoría usa un par `tipo + id` en lugar de una FK, porque apunta a entidades de tablas distintas. Es la única relación polimórfica del esquema, y es deliberada: una FK real exigiría una columna por tabla auditada, casi todas en `NULL`. Y es lo que permite borrar una página sin perder su rastro (§4.2).

---

## 4. Inventario de tablas

Qué información guarda cada tabla, agrupada por dominio. Las columnas una a una, con su tipo, están en el diccionario (`12-diccionario-de-datos.md`). Volumen de cada tabla: §9.3.

### 4.1 Identidad y acceso — RF-04, RF-05, RF-16

| Tabla | Qué información guarda | Claves e invariantes |
|---|---|---|
| **`usuarios`** | Una fila por persona con credenciales, del sitio o de la intranet (§2.1): nombre y apellidos, correo institucional, hash de la contraseña, rol, estado (`active`, `inactive`, `locked`, `expired`), fecha de caducidad (RF-16; `NULL` es *no caduca*), último acceso, los dos contadores de intentos fallidos con su bloqueo, los avisos de primer ingreso (`debe_cambiar_password`, `debe_configurar_preguntas`), hasta cuándo vale la contraseña temporal (`password_temporal_vence_en`, 72 h, 043) y quién creó la cuenta | `uq_usuarios_email` + `CHECK (email = lower(email))` (I25). `rol_id` sin acción al borrar: no se borra un rol con cuentas. `creado_por` auto-referencia `SET NULL` |
| **`roles`** | Nombre y descripción de cada rol —Superadmin, Administrador, Editor, Director/Subdirector y los `Editor <algo>` que se crean desde `/admin/roles`— y si es de sistema | `nombre` UNIQUE. `es_sistema` impide borrar los roles base desde el panel |
| **`permisos`** | Una clave por acción autorizable: las fijas del catálogo (`acceso.intranet`, `secciones.crear`, `politica-privacidad.editar`…) y una `editar.{ambito}.{slug}` por cada página | `clave` UNIQUE. Se llama `clave` y no `nombre` porque es un identificador que el código compara, no una etiqueta que se traduce |
| **`roles_permisos`** | Qué permisos tiene cada rol: solo la pareja | PK `(rol_id, permiso_id)`, las dos `CASCADE`. Índice por `permiso_id` para «qué roles tienen este permiso» |
| **`preguntas_seguridad`** | Las preguntas de recuperación de cada cuenta: la clave de la pregunta, el hash de la respuesta y su orden | `UNIQUE(usuario_id, pregunta_clave)`. `CASCADE`: se van con la cuenta |

`usuarios.fecha_caducidad` en `NULL` significa *sin caducidad*, y es lo que RF-16 reserva al administrador. La verificación ocurre en el login del backend, nunca en el frontend.

**Las cuatro columnas que `usuarios` ganó después del diseño**, porque cada una sostiene una regla que antes vivía solo en el código:

| Columna | Migración | Qué sostiene |
|---|---|---|
| `apellidos` | 010 | Antes todo iba en `nombre`. El relleno de las filas existentes fue heurístico (la última palabra), así que los datos viejos pueden estar mal partidos |
| `intentos_fallidos_login` | 011 | Los 5 intentos / 15 minutos del login. **Aparte** de `intentos_fallidos`, que es de las preguntas de seguridad y cuenta 3 / 30 minutos. Dos umbrales distintos en dos flujos distintos: una sola columna habría bloqueado a destiempo en los dos |
| `bloqueado_hasta` | 011 | Ese sí es compartido: la cuenta está bloqueada o no, venga el bloqueo de donde venga |
| `ultimo_acceso_en` | anterior, pero **antes no medía nada** | El cierre por inactividad de 20 minutos del servidor. La columna existía y solo se escribía al iniciar sesión; ahora se refresca en cada petición, como mucho una vez por minuto para no convertir cada lectura en un `UPDATE`. Ver `3-seguridad-del-proyecto.md` §S3 y D9 |

### 4.2 Páginas, ciclo editorial y concurrencia — RF-01, RF-06

| Tabla | Qué información guarda | Claves e invariantes |
|---|---|---|
| **`paginas`** | El lienzo editable de cada sección: ámbito (`sitio` o `intranet`), slug, título, cuál es su versión publicada, quién la creó y cuántas visitas lleva | `UNIQUE(ambito, slug)`: las dos apps comparten tabla y sin el ámbito sus slugs chocarían. `version_publicada_id` es la FK circular de I23 |
| **`paginas_versiones`** | Cada versión del contenido de una página: el árbol de bloques de Puck (`contenido`, JSONB), su número, su estado (`borrador → en_revision → publicado / rechazado`, y `archivado` cuando otra la reemplaza), el comentario de cambios del envío, el motivo de rechazo, y quién y cuándo la creó, la revisó y la publicó | I1–I4, I14 e I21 (§5). `estado` es obligatorio desde la 041. `layout` existe pero está vacío en todas las filas (§9.4) |
| **`bloqueos_edicion`** | Quién tiene abierta cada página en el editor y hasta cuándo: un candado que caduca a los 2 minutos y el editor renueva cada 45 segundos | PK `(ambito, slug)` (I20). `usuario_id` es `TEXT` sin FK y `usuario_nombre` se copia: la cuenta maestra local no vive en `usuarios` (migración 021) |
| **`subidas_pendientes`** | Los archivos que se subieron desde el editor a un borrador que aún no se ha publicado: página y ruta. Al publicar o descartar se borran del disco los que ninguna versión usa | PK `(pagina_id, ruta)`, `CASCADE` desde `paginas` (I15) |

`paginas_versiones.creado_por` es nuevo. Antes solo se registraba quién revisó y quién publicó, así que **no se podía saber quién editó** — un hueco directo en RF-07.

**`paginas` dejó de ser una lista fija (2026-08-20).** Hasta entonces sus filas las
sembraba un script y correspondían una a una con rutas escritas en el código. Hoy
cualquiera con el permiso `secciones.crear` añade una desde el editor, y cualquiera con
`secciones.eliminar` la borra. Tres consecuencias que tocan directamente al esquema:

- **Una sección viva son tres filas en tres tablas**: `paginas`, la clave
  `editar.{ambito}.{slug}` en `permisos`, y su concesión en `roles_permisos`. Se crean
  en una sola transacción — a medias quedaría una sección que existe y nadie puede
  editar, o un permiso que no corresponde a ninguna página. Medido el 08-10-2026: las 18
  páginas tienen su permiso y no hay ningún permiso `editar.*` sin página.
- **Borrar cuesta dos `DELETE`, no cuatro**: `paginas_versiones` y `subidas_pendientes`
  caen en cascada desde `paginas`, y `roles_permisos` desde `permisos`. Las cascadas del
  §5 no son decoración; son lo que hace que esta operación no deje restos. (El candado de
  `bloqueos_edicion` sí se queda: §9.4.)
- **`auditoria_cambios` sobrevive al borrado**, porque apunta por `entidad_tipo +
  entidad_id` y **no tiene clave foránea** contra `paginas`. Lo que en el §3 se explica
  como una decisión de modelado —una FK real exigiría una columna por tabla auditada—
  resultó ser además lo que permite borrar una página sin perder el rastro de lo que
  pasó en ella. RF-07 y la Ley 1581 siguen cubiertos aunque la página ya no exista.

Y una regla que se aprendió por las malas en la 014: **renombrar un slug obliga a
`UPDATE permisos SET clave`, nunca a borrar e insertar.** `roles_permisos` apunta por
UUID, así que borrar la fila del permiso revoca los accesos en silencio, sin un solo
error.

### 4.3 Archivos — RF-02

| Tabla | Qué información guarda | Claves e invariantes |
|---|---|---|
| **`archivos`** | Los archivos que la API registra con su metadato. Hoy son **solo los Excel de las cargas** de «Actualizaciones»: nombre original y almacenado, ruta, tipo MIME, extensión, tamaño, SHA-256, ámbito (`publico`/`interno`), estado y quién lo subió | `uq_archivos_hash` (único parcial, `hash_sha256 IS NOT NULL`): el mismo Excel subido dos veces es una sola fila, y lo pueden compartir varias cargas. `nombre_almacenado` UNIQUE. `ambito` y `estado` con `CHECK` |

**Lo que se sube desde el editor no pasa por esta tabla.** Imágenes y PDF van al filesystem de la API y el bloque los referencia por ruta dentro de `paginas_versiones.contenido`; lo que los protege del borrado es `subidas_pendientes` y la comprobación «¿otra versión lo usa?» de `limpiar-subidas-pendientes`. Por eso `archivos` no tiene relación con las páginas, y por eso `texto_alternativo` (RF-14) está sin uso: el texto alternativo vive en las propiedades del bloque.

### 4.4 Cargas de datos — «Actualizaciones» del panel

| Tabla | Qué información guarda | Claves e invariantes |
|---|---|---|
| **`cargas_datos`** | Una fila por cada Excel cargado desde «Actualizaciones», común a los cuatro módulos: módulo, archivo, quién lo subió, estado (`procesando`, `completado`, `error`), progreso de 0 a 100, filas procesadas y totales, mensaje final y cuándo terminó. Es la trazabilidad de las cargas: no hay paso de aprobación (decisión de sesión) | `CHECK (modulo IN ('programa_sobresalientes', 'tendencia_ocupacional', 'fuentes_futuras_empleo', 'alertas_inversion'))` (I26). Índice `(modulo, estado, creado_en)` para el historial de cada tarjeta. `archivo_id` `SET NULL` |

Cada módulo añade lo suyo: la tendencia ocupacional una fila en `cargas_datos_ocupacionales` (§4.6.1); los demás, nada más.

### 4.5 Auditoría — RF-07, RF-13

| Tabla | Qué información guarda | Claves e invariantes |
|---|---|---|
| **`auditoria_cambios`** | La bitácora: sobre qué entidad (`entidad_tipo` + `entidad_id`), qué acción (16 verbos, de `crear` a `autoguardar_borrador`), quién (`usuario_id` y su nombre copiado), qué campos cambiaron (`campos_modificados`, JSONB `[{campo, antes, despues}]`), desde qué IP y navegador, y cuándo | Índices por `(entidad_tipo, entidad_id, created_at)`, `created_at`, `usuario_id` y `accion`. `entidad_tipo` obligatorio desde la 041 (tenía `DEFAULT 'post'`, que su propio `CHECK` rechazaba). `usuario_nombre` es una copia deliberada (D6): si el usuario se borra, la fila sigue diciendo quién fue |

Es la tabla que más crece (§9.3). Lo de más de un año se puede borrar desde el panel (`ejecutar-depuracion-auditoria`), con un análisis previo de cuánto se libera.

### 4.6 Observatorio: Programa + Sobresalientes — RF-08

Catálogos y hechos de las estadísticas de vinculación laboral, extraídos del Excel que se carga en «Actualizaciones».

| Tabla | Qué información guarda | Claves e invariantes |
|---|---|---|
| **`departamentos`** | Los 32 departamentos y Bogotá D.C. (33 filas) con su nombre oficial y su código DANE de dos cifras. Catálogo **cerrado**, compartido por los tres módulos que trabajan por territorio (migración 032) | Solo los 33 códigos DANE (I27) y un código por fila (I16). `uq_departamentos_nombre` sobre el nombre **normalizado**: «Vaupés» y «Vaupes» no pueden convivir (I24). Ningún importador crea filas: resuelven por alias o rechazan la carga |
| **`departamentos_alias`** | Cómo viene escrito un departamento en los Excel («Distrito Capital», «Guajira, La», «Valle»), normalizado, y a cuál corresponde | PK `alias_normalizado` (minúsculas, sin tildes, signos como espacio: `shared/normalizar-texto.ts`). `CASCADE` desde `departamentos`. Un nombre nuevo se agrega aquí, nunca como departamento |
| **`centros_formacion`** | Los centros del SENA: código SENA (`Cod. Centro`), nombre y departamento. Catálogo abierto: lo crea y actualiza el importador | `uq_centros_formacion_codigo` (I24, 042). El nombre no identifica: hay cinco centros distintos llamados «Centro de Comercio y Servicios» |
| **`niveles_formacion`** | Los niveles de formación: código SENA (`Cod. Nivel de formación`) y nombre (Técnico, Tecnólogo, Auxiliar, Operario, Profundización Técnica) | `uq_niveles_formacion_codigo` (I24, 042) |
| **`programas_formacion`** | Los programas de formación: código SENA (`Cod. Programa`), nombre y nivel | `uq_programas_formacion_codigo` (I24, 042). Dos programas del mismo nivel pueden llamarse igual: «Apoyo administrativo en salud» es el 134507 y el 134508 |
| **`programas_sobresalientes`** | Los hechos: por centro, programa y sexo, cuántos aprendices se certificaron, cuántos se vincularon, la tasa de vinculación y el salario promedio | `UNIQUE(centro_id, programa_id, sexo)` (I10), I11–I13. `departamento_id` y `nivel_formacion_id` repiten lo que ya dicen el centro y el programa; dos FK compuestas impiden que se contradigan (I22) |

**Ingesta.** El backend lee el `.xlsx` (`exceljs`), valida encabezados y tipos, y en una sola transacción —o entra el archivo completo o no entra nada—:

1. Resuelve el departamento por `departamentos_alias` (un nombre desconocido rechaza la carga) y exige que el `Cod. Regional` sea su código DANE.
2. Comprueba que el archivo no se contradiga: el mismo código de nivel, centro o programa con dos nombres distintos (más allá de tildes o mayúsculas), o un centro en dos regionales, o un programa en dos niveles, rechaza la carga señalando la fila. Mismo criterio que la V3 de la tendencia.
3. Crea o actualiza niveles, centros y programas **por código** (`ON CONFLICT (codigo)`): el nombre que manda es el del último archivo.
4. **Vacía y recarga** `programas_sobresalientes`. Las filas con el mismo centro, programa y sexo **por código** son cohortes del mismo programa y se fusionan (se suman certificados y vinculados, la tasa se recalcula y el salario se pondera).
5. Borra de los tres catálogos lo que ya no usa ningún hecho, así no se acumulan variantes de cargas viejas.

Hasta la 042 todo esto iba por nombre exacto: sumaba dos programas distintos que se llamaban igual («Mantenimiento Electromecánico Industrial», 223201 + 223213) y habría separado uno mismo escrito con otra mayúscula. §9.5.

#### 4.6.1 Tendencia ocupacional (percentiles inscritos vs. vacantes) — migración 033

Lo que alimenta el bloque "Tendencia Ocupacional" del sitio.
Un **corte** es un (año, periodo): el Excel no trae ninguno de los dos y los elige quien carga.

| Tabla | Qué información guarda | Claves e invariantes |
|---|---|---|
| **`periodos`** | T1–T4, S1, S2 y ANUAL, con su nombre y su orden | Semilla, catálogo cerrado. `codigo` UNIQUE |
| **`niveles_ocupacionales`** | Los niveles 0, A, B, C, D, con la `etiqueta` exacta del filtro («Nivel 3,4 (C)»), su nombre y su descripción | Semilla. `codigo` y `etiqueta` UNIQUE. Es también la partición con la que se calcularon los percentiles |
| **`niveles_cualificacion`** | Qué dígito N.C. del Excel (0, 1, 2, 3, 4, 6) corresponde a qué nivel ocupacional: el 3 y el 4 son C | Semilla. `codigo_nc` UNIQUE: es lo que referencia la columna generada de `ocupaciones`. Un N.C. no catalogado (p. ej. 5) lo rechaza esa FK |
| **`criterios_ocupacionales`** | Los cuatro criterios de clasificación (las cuatro columnas "X" del Excel): código, nombre, regla y orden | Semilla. `codigo` UNIQUE: es lo que referencian los hechos y lo que filtra la API |
| **`ocupaciones`** | Las ocupaciones CNO que traen los archivos: código de cuatro cifras y nombre | `codigo` CHAR(4) UNIQUE `^[0-9]{4}$`. `codigo_nc` **generada** del código. `nombre_vigencia` = año×10 + orden del periodo que fijó el nombre: solo lo cambia un corte igual o más reciente |
| **`cortes_ocupacionales`** | Cada (año, periodo) cargado, en `borrador` o `publicado`, con su fecha de publicación y la huella md5 de su contenido | `UNIQUE(anio, periodo_id)`, año de cuatro cifras (035). Publicado implica fecha (I21). `huella_datos` sin `UNIQUE` desde la 034 (I19) |
| **`cargas_datos_ocupacionales`** | Lo propio de una carga de percentiles: la celda año × periodo pedida, el corte resultante, filas nacionales y departamentales, y el `reporte` JSONB de las validaciones V1–V9 | PK = FK a `cargas_datos.id` `CASCADE`. Lo común (archivo, quién, estado, progreso) sigue en `cargas_datos`. Año y periodo se guardan aunque también estén en el corte: el corte se puede borrar (`SET NULL`) y la carga tiene que seguir diciendo qué celda pidió (§9.2) |
| **`indicadores_ocupacionales`** | Los hechos: por corte, ámbito y ocupación, inscritos, vacantes y sus dos percentiles. `departamento_id NULL` es la hoja nacional | `criterio_codigo` **columna generada** con la fórmula del 80 % (I17). Unicidad del grano con dos índices parciales (I18). Índice `(corte_id, departamento_id, criterio_codigo)` para el buscador |

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
de `cargas-datos/` del filesystem —salvo que otra carga lo use: los archivos se deduplican por contenido—.
Si la carga es la **vigente** de su celda, se borra también el corte con sus indicadores (CASCADE);
sin eso quedarían datos sin la carga que los trajo. Una reemplazada o fallida no toca los datos.
Corre con el candado de la celda sin esperarlo (409 si una carga está guardando en ella), y el
cargador comprueba con el candado tomado que su carga sigue existiendo, porque el Excel se lee antes.
La ruta de "Programa + Sobresalientes" (`DELETE /api/observatorio/cargas/:id`) las sigue rechazando
con 409: no sabe borrar el corte.

#### 4.6.2 Fuentes futuras de empleo — sin tablas propias

El único módulo de "Actualizaciones" cuyo Excel **no se importa**: el archivo *es* el dato. Solo
usa `cargas_datos` (con `modulo = 'fuentes_futuras_empleo'`) y `archivos`; no hay tabla de hechos
ni cola, porque son dos docenas de filas de cuatro columnas que se validan y publican en la misma
petición (`POST /api/observatorio/fuentes-futuras-empleo/cargas`, 201 y no 202).

`GET /api/observatorio/fuentes-futuras-empleo` —público— lee el Excel de la **carga vigente**: la
última completada del módulo. Cada carga reemplaza entera a la anterior, así que eliminar una
desde el historial devuelve el portal a la que había antes, y eliminarlas todas deja la sección
sin datos. Es el único módulo donde borrar una carga cambia lo que ve el público; en los demás
solo se borra la auditoría. El Excel de disco y su fila en `archivos` se van con la carga salvo
que otra la comparta, con la misma `eliminarArchivoSiQuedaSuelto` del resto.

Hasta el 03-10-2026 no pasaba por aquí: la API leía un `fuentes-futuras-de-empleo.xlsx` de nombre
fijo dejado a mano en `uploads/cargas-datos/` (versionado en git con una excepción del
`.gitignore`), sin registro ni forma de cambiarlo desde el panel. Ese archivo sigue como respaldo
mientras no haya ninguna carga, para que el portal no se quede en blanco donde todavía no se ha
subido.

### 4.7 Alertas de inversión — migraciones 038/039

Reutiliza `departamentos` (§4.6) y `cargas_datos` (§4.4, con `modulo = 'alertas_inversion'`); no
duplica ninguna de las dos.

| Tabla | Qué información guarda | Claves e invariantes |
|---|---|---|
| **`ciiu_secciones`** | Las 21 secciones de la CIIU Rev.4 A.C. del DANE: letra (A–U), nombre, rango de divisiones («01-03») y si está activa | `uq_ciiu_secciones_letra` (I24), `CHECK (letra ~ '^[A-Z]$')`. Semilla; la T (hogares como empleadores) queda `activa = false` |
| **`ciiu_clases`** | Las clases CIIU de cuatro cifras, con su nombre y su sección. Se completan desde el Excel de sectores; no vienen sembradas | `uq_ciiu_clases_codigo` (I24): el código ya identifica la clase, y por sus dos primeras cifras se deduce la sección. `CHECK (codigo ~ '^[0-9]{4}$')` |
| **`empresas`** | Las empresas que anuncian proyectos: solo el nombre | `uq_empresas_nombre` sobre el nombre **normalizado** (042): «Grupo Éxito» y «GRUPO EXITO.» son la misma. El Excel no trae NIT |
| **`municipios`** | El municipio de una sede, con su departamento. A diferencia de `departamentos`, es **catálogo abierto**: el importador y el alta manual lo completan | `uq_municipios_depto_nombre` sobre departamento y nombre **normalizado** (042): «Medellín» y «Medellin» son el mismo. El Excel no trae código DIVIPOLA |
| **`proyectos_inversion`** | Una fila por proyecto de inversión anunciado en una noticia: tipo (`nuevo`/`expansion`), descripción, empresa, sección y clase CIIU, fecha del anuncio, URL y medio de la fuente, inversión en pesos, empleos estimados, estado y quién lo creó | Mismo ciclo `borrador/en_revision/publicado/rechazado` de `paginas_versiones` (D8). `CHECK (fuente_url ~* '^https?://')`. Si hay clase, la sección es la de la clase (I22). `creado_por` `SET NULL` |
| **`proyectos_inversion_ubicaciones`** | Dónde se ubica cada proyecto —una noticia puede anunciar varias sedes—: departamento y, si se sabe, municipio | `UNIQUE NULLS NOT DISTINCT (proyecto_id, departamento_id, municipio_id)`. Si hay municipio, el departamento es el suyo (I22). `CASCADE` desde el proyecto |

Empresas y municipios se resuelven con `normalizar_nombre()` en la consulta (`resolverOCrearEmpresa`, `resolverOCrearMunicipio`): la misma función sobre la que está el índice único, así la búsqueda y la unicidad no pueden discrepar.

**Dos vías de entrada, un mismo destino.** El Excel agrega fila a fila (no vacía-y-recarga, a
diferencia de §4.6: cada fila es una noticia independiente) y omite cualquiera cuya `fuente_url`
ya exista, para que re-subir el mismo archivo no duplique. El formulario manual del panel
("Agregar manualmente") inserta el mismo `proyectos_inversion`, publicado de una vez. Las dos
siguen la decisión de sesión de Observatorio: sin paso de aprobación.

### 4.8 La tabla técnica

| Tabla | Qué información guarda | Hasta cuándo |
|---|---|---|
| `migraciones_aplicadas` | El nombre de cada migración aplicada y cuándo. No es del dominio, es del runner: el servidor no arranca si falta alguna del manifiesto | Permanente |

En Neon tiene dos filas de más: `025-observatorio-programas-sobresalientes` y `038-auditoria-autoguardado`, los nombres que tenían la 026 y la 040 antes de renumerarse. El runner compara contra el manifiesto, así que no estorban; borrarlas es opcional.

*(Las tablas legacy `FileStatuses` y `_obsoleto_attachment` ya no existen. La segunda no estaba en Neon, pero ninguna migración la borraba: en una base nueva seguía viva hasta la 041, que la quita si está vacía.)*

---

## 5. Invariantes garantizadas por el esquema

Cada una es una regla de negocio que **el código no puede violar por accidente**, porque la base de datos la rechaza. **Los números no se reutilizan**: una invariante retirada queda tachada con el motivo, para que una referencia vieja (`I5` en un comentario) siga llevando a algún sitio.

| # | Invariante | Cómo se declara | Qué protege |
|---|---|---|---|
| I1 | Una página tiene **como máximo una versión publicada** | `UNIQUE(pagina_id) WHERE estado='publicado'` | La invariante del §1.2 del ciclo editorial: lo que ve el ciudadano solo cambia al aprobar |
| I2 | Una página tiene **como máximo una versión en revisión** | `UNIQUE(pagina_id) WHERE estado='en_revision'` | Bloquear la edición mientras está en revisión |
| I3 | No hay dos versiones con el mismo número | `UNIQUE(pagina_id, numero_version)` | Historial coherente |
| I4 | Una versión rechazada **siempre tiene motivo** | `CHECK estado='rechazado' ⇒ motivo_rechazo NOT NULL` | RF-06: el editor sabe por qué |
| I5 | ~~Un contenido publicado siempre tiene fecha~~ — retirada con `contenidos` (036) | (era un `CHECK` de `contenidos`) | La regla vuelve, sobre lo que hoy se publica, como I21 |
| I6 | ~~La navegación nunca pasa de 3 niveles~~ — retirada con `secciones` (036) | (era `CHECK nivel BETWEEN 1 AND 3`) | La navegación vive hoy en el contenido de la página `menu-y-pie` |
| I7 | ~~Una sola marca activa~~ — retirada con `marca_versiones` (020) | (era `UNIQUE(activa) WHERE activa`) | La tabla no tuvo nunca uso |
| I8 | ~~Una sola política de privacidad vigente~~ — retirada con `politicas_privacidad` (020) | (era un índice parcial sobre `vigente_hasta IS NULL`) | La política es hoy una página (`politica-de-privacidad`) con su ciclo editorial |
| I9 | ~~Solo se registran aceptaciones~~ — retirada con `consentimientos` (020) | (era `CHECK (aceptado = true)`) | Ídem |
| I10 | **Idempotencia en programas sobresalientes** | `UNIQUE(centro_id, programa_id, sexo)` | Una fila por grano: el importador fusiona las repetidas en vez de duplicar estadísticas |
| I11 | **Consistencia de egresados y vinculados** | `CHECK (vinculados >= 0 AND vinculados <= certificados)` | No puede haber más aprendices vinculados que certificados |
| I12 | **Tasa de vinculación acotada** | `CHECK (tasa_vinculacion >= 0 AND tasa_vinculacion <= 1)` | La tasa es una fracción de 0 a 1 |
| I13 | **Validación estricta de sexo** | `CHECK (sexo IN ('M', 'F'))` | Evita registros no tipificados en las estadísticas oficiales |
| I14 | Una versión en revisión **siempre dice qué cambió** | `CHECK estado='en_revision' ⇒ btrim(comentario_cambios) <> ''` (`ck_paginas_versiones_comentario`, migración 029) | RF-06/RF-07: quien aprueba y quien audita leen el «commit» del envío. Gemela de la I4 |
| I15 | **Limpieza e integridad de subidas pendientes** | `PRIMARY KEY (pagina_id, ruta)` + `ON DELETE CASCADE` hacia `paginas.id` | Al eliminar una página, sus subidas pendientes se van con ella |
| I16 | **Un departamento, un código** | `departamentos.codigo_dane` `NOT NULL` + `UNIQUE` + `CHECK ~ '^[0-9]{2}$'` (migración 032) | El catálogo no vuelve a tener dos Vaupés: los filtros y los mapas trabajan por código |
| I17 | **El criterio no contradice a los percentiles** | `indicadores_ocupacionales.criterio_codigo` `GENERATED ALWAYS … STORED` con la fórmula del 80 % (era `criterio_id` hasta la 037) | Una "X" editada a mano en el Excel no llega a la base: el criterio se calcula |
| I18 | **Una fila por corte, ámbito y ocupación** | `UNIQUE (corte_id, ocupacion_id) WHERE departamento_id IS NULL` + `UNIQUE (corte_id, departamento_id, ocupacion_id) WHERE departamento_id IS NOT NULL` | Recargar un corte reemplaza sin duplicar |
| I19 | ~~**Un archivo, una celda**~~ — retirada en la 034 | (era `cortes_ocupacionales.huella_datos UNIQUE`) | Los datos se repiten entre periodos y el mismo archivo se carga en varios a propósito; V10 lo bloqueaba con «Este mismo contenido ya está cargado en…». La huella se sigue guardando, sin `UNIQUE` |
| I20 | **Ámbito de los bloqueos de edición** | `CHECK (ambito IN ('sitio', 'intranet'))` en `bloqueos_edicion` | El candado solo existe para ámbitos que existen. (Hasta el 08-10-2026 compartía por error el número I14) |
| I21 | **Lo publicado tiene fecha** | `CHECK estado='publicado' ⇒ publicado_en NOT NULL` en `paginas_versiones` y `cortes_ocupacionales` (041) | Los respaldos y el historial ordenan por `publicado_en`; una publicación sin fecha desaparecería de esos listados. Heredera de la I5 |
| I22 | **Una copia no contradice a su origen** | FK compuestas (041): `programas_sobresalientes (centro_id, departamento_id)` y `(programa_id, nivel_formacion_id)`; `proyectos_inversion (clase_id, seccion_id)`; `proyectos_inversion_ubicaciones (municipio_id, departamento_id)` | Un hecho no puede estar en un departamento distinto del de su centro, ni un proyecto en una sección distinta de la de su clase. Con `ON UPDATE CASCADE`, si el origen cambia, la copia lo sigue (§9.2) |
| I23 | **Una página publica una versión suya** | `FOREIGN KEY (version_publicada_id, id) REFERENCES paginas_versiones (id, pagina_id) ON DELETE SET NULL (version_publicada_id) DEFERRABLE INITIALLY DEFERRED` (041) | Antes podía apuntar a la versión de otra página, y el sitio habría pintado el contenido equivocado |
| I24 | **Una fila por cosa en cada catálogo** | Por la clave de la fuente (D10): `UNIQUE (codigo)` en `niveles_formacion`, `centros_formacion` y `programas_formacion` (042), en `ciiu_clases` (041) y en `ocupaciones` (033); `ciiu_secciones.letra` (041); y, donde no hay código, únicos sobre `normalizar_nombre(nombre)` en `departamentos`, `municipios` (por departamento) y `empresas` (042) | Los importadores resuelven por código o por nombre: con dos filas para lo mismo, el resultado dependería de cuál devuelva Postgres primero, y las estadísticas se partirían en dos. En la 041 los de niveles y departamentos eran por nombre exacto, que no ve tildes ni mayúsculas |
| I25 | **Un correo por cuenta, en minúsculas** | `uq_usuarios_email UNIQUE (email)` + `CHECK (email = lower(email))` (041) | El login busca el correo ya normalizado; uno guardado con mayúsculas no podría entrar nunca |
| I26 | **Cada carga es de un módulo conocido** | `CHECK (modulo IN (…))` en `cargas_datos` (041) | El historial de cada tarjeta filtra por módulo: una carga con un módulo mal escrito no aparecería en ninguna |
| I27 | **Los departamentos son 33 y solo 33** | `ck_departamentos_codigo_dane CHECK (codigo_dane IN ('05', '08', '11', …, '99'))` + `UNIQUE (codigo_dane)` (042) | Los 32 departamentos y Bogotá D.C. No cabe una fila 34: un departamento «nuevo» solo puede ser un alias (§9.5) |

Y las reglas que protegen el borrado: **no se borra** un rol con cuentas, ni un catálogo con hechos que lo usen (`departamentos`, `centros_formacion`, `niveles_formacion`, `programas_formacion`, `ocupaciones`, `periodos`, `criterios_ocupacionales`, `empresas`, `ciiu_secciones`, `ciiu_clases`, `municipios`); **`SET NULL`** en las autorías (borrar un usuario no borra su trabajo), en `cargas_datos.archivo_id` y en `cargas_datos_ocupacionales.corte_id`; **`CASCADE`** solo donde el hijo no tiene sentido sin el padre (preguntas de seguridad, versiones y subidas pendientes de una página, concesiones de un rol o permiso, alias de un departamento, indicadores de un corte, el detalle de una carga, las ubicaciones de un proyecto).

---

## 6. Lo que deliberadamente NO es tabla

| Necesidad | Dónde vive | Por qué no en Postgres |
|---|---|---|
| Sesiones / JWT | Cookie `httpOnly` + Redis | El token es corto y firmado; una tabla de sesiones no aporta nada que la firma no dé, y añade una escritura por request |
| Intentos de login / rate limiting | Redis (`express-rate-limit`) | Escritura por request fallido; en Postgres envenena el WAL sin dar nada a cambio |
| Caché de páginas públicas | Redis | Ya decidido en la guía §3.3 |
| **Ocupaciones CNO / CUOC (RF-09)** | **Servicio externo consumido con API key + caché Redis** | RF-09 dice "consultando **en línea** la BD del OLO". Replicarla localmente crearía una copia que envejece y una segunda fuente de verdad. La API key vive solo en el `.env` del backend (S5). La tabla `ocupaciones` (033) **no** es esa réplica: solo guarda código y nombre de las ocupaciones que traen los archivos de percentiles, para que sus hechos tengan contra qué apuntar |
| Cola de trabajos pesados | BullMQ sobre Redis (`heavy-jobs`) | La cola es transitoria; lo que se persiste de cada trabajo es su fila en `cargas_datos` |
| Archivos subidos desde el editor | Filesystem de la API, referenciados por ruta en `paginas_versiones.contenido` | Ver §4.3. Solo los Excel de las cargas tienen fila en `archivos` |
| Contadores de límite de tasa | Redis, con **conexión propia** | Se comparten entre réplicas y sobreviven a un reinicio. La conexión es distinta de la de BullMQ a propósito: aquella se abre con `maxRetriesPerRequest: null` porque BullMQ lo exige, y con Redis caído encola comandos para siempre en vez de fallar — un limitador montado encima colgaría la API entera al primer parpadeo |
| Permisos de cada rol, mientras se atiende | Memoria del proceso, con TTL y invalidación explícita | `roles_permisos` es la verdad; esto es una caché de un `JOIN` que se consultaría en **cada** petición autorizada. Se invalida al escribir (`invalidarPermisosDeRol`) y el TTL solo cubre el caso de varias réplicas, donde la escritura ocurre en un proceso y la caché está en otro |

Y uno que **sí es tabla aunque parezca de Redis**: el candado de edición (`bloqueos_edicion`, migración 021). Redis es opcional en este proyecto —la caché y las colas degradan a modo directo cuando no está—, y un candado que no cierra cuando falta Redis da una garantía que no se cumple justo cuando nadie mira. En la base siempre está, y el TTL se resuelve comparando `expira_en` en la consulta.

---

## 7. Mapa requerimiento → tabla

| RF | Tablas |
|---|---|
| RF-01 contenidos | `paginas`, `paginas_versiones`, `bloqueos_edicion`, `subidas_pendientes` |
| RF-02 documentos | Filesystem de la API (§4.3); `archivos` para los Excel de las cargas |
| RF-03 identidad visual | La página `menu-y-pie` de cada ámbito (`paginas` + `paginas_versiones`) |
| RF-04 roles | `usuarios`, `roles`, `permisos`, `roles_permisos` |
| RF-05 restricción al editor | `roles_permisos` (claves `editar.{ambito}.{slug}`) + policies |
| RF-06 aprobación | `paginas_versiones` (I1–I4, I14, I21) |
| RF-07 historial | `auditoria_cambios` |
| RF-08 Power BI y datos dinámicos | Programa + Sobresalientes (§4.6), tendencia ocupacional (§4.6.1), fuentes futuras de empleo (§4.6.2), alertas de inversión (§4.7); todas con su carga en `cargas_datos` |
| RF-09 CNO/CUOC | Servicio externo en línea (§6); `ocupaciones` solo para la tendencia |
| RF-10 buscador interno | `paginas_versiones` publicadas: `obtener-indice-busqueda` arma el índice en cada petición |
| RF-11 navegación 3 clics | Contenido de la página `menu-y-pie` |
| RF-12 descarga pública | Filesystem de la API, servido por ámbito |
| RF-13 Habeas Data | `auditoria_cambios`; la política es la página `politica-de-privacidad` |
| RF-14 accesibilidad | Las propiedades de cada bloque (`paginas_versiones.contenido`), validadas por `@olo/accessibility-policy` |
| RF-15 directores | Permiso `acceso.intranet` y páginas con `ambito = 'intranet'` |
| RF-16 auth y caducidad | `usuarios.fecha_caducidad`, `preguntas_seguridad` |
| RF-17 respaldos | `npm run respaldo` (vuelca todas las tablas a JSON) y la carpeta `backup/` del filesystem |

---

## 8. Plan de migración por fases

Cada fase deja la base consultable y la API funcionando, según la regla 2 de `4-reglas.md`. **Ninguna borra datos.**

Las migraciones viven en `4000-api-backend/src/infrastructure/db/migrations/` y se aplican con `npm run migrate` (`migrate:status` para ver pendientes, `migrate:down` para revertir la última). El runner las ejecuta **en el orden explícito de su manifiesto, no leyendo el directorio**: un archivo suelto en la carpeta no se aplica solo.

| Fase | Migración | Qué hace | Riesgo | Estado |
|---|---|---|---|---|
| 0 | `index.ts` + `scripts/db/migrate.ts` | Runner real y tabla de control `migraciones_aplicadas`. Se quita `sequelize.sync()` del arranque — era lo que de verdad definía el esquema, contra la convención #4 de la guía. Ahora el servidor **se niega a arrancar** si hay migraciones pendientes | Bajo | **Hecho** |
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
| 020 | `depuracion-y-optimizacion-esquema` | Purgado formal de 8 tablas inactivas sin uso (`auditoria_accesos`, `configuraciones`, `marca_versiones`, `tableros_bi`, `politicas_privacidad`, `consentimientos`, `respaldos`, `notificaciones`) y de `FileStatuses`. **No incluyó `_obsoleto_attachment`**, que en una base nueva siguió viva hasta la 041 |
| 021 | `bloqueos-edicion` | Crea la tabla `bloqueos_edicion` con clave compuesta `(ambito, slug)` y marca temporal `expira_en` para control de concurrencia pesimista con lease/TTL al editar páginas en Puck |
| 022 | `auditoria-guardar-borrador` | Añade `'guardar_borrador'` a la restricción `ck_auditoria_accion` de `auditoria_cambios` |
| 023 | `permiso-politica-privacidad-sitio` | Da de alta el permiso `politica-privacidad.editar` en el catálogo de permisos |
| 024 | `subidas-pendientes` | Crea la tabla `subidas_pendientes` con clave `(pagina_id, ruta)` y `ON DELETE CASCADE` para recolectar y purgar archivos subidos en borradores no publicados |
| 025 | `visitas-paginas` | Añade la columna `visitas` (entero, default 0) a `paginas` y siembra conteos iniciales para las páginas publicadas existentes |
| 026 | `observatorio-programas-sobresalientes` | Crea las 5 tablas de §4.6: catálogos (`departamentos`, `centros_formacion`, `niveles_formacion`, `programas_formacion`) y la tabla de hechos `programas_sobresalientes` con clave `(centro_id, programa_id, sexo)`. **Los `UNIQUE` de `departamentos.nombre` y `niveles_formacion.nombre` no se crearon** (§9.1) |
| 027 | `cargas-datos` | `cargas_datos`: una fila por carga de «Actualizaciones», con estado y quién la subió. Sin FK hacia los hechos: la carga de sobresalientes vacía y recarga, no hay versión que enlazar por fila |
| 028 | `cargas-datos-progreso` | `progreso` (0–100) y `filas_totales`, para el indicador en vivo de una carga en curso |
| 029 | `comentario-cambios-versiones` | `paginas_versiones.comentario_cambios VARCHAR(100)`: el «commit» obligatorio al enviar a revisión. Va en la versión y no solo en la bitácora porque aprobar, rechazar y descartar también lo registran, y las hace otra persona después. Añade la invariante I14; las versiones que ya estuvieran en revisión se rellenan con «Enviada antes de que el comentario fuera obligatorio» en vez de dejar el `CHECK` en `NOT VALID` |
| 030 | `acciones-seguridad-auditoria` | Suma `autenticar`, `expirar` e `inactivar` al `CHECK` de `auditoria_cambios`. Hasta entonces el login no dejaba rastro y una cuenta caducada o inactivada a mano se confundía con cualquier `actualizar`. Se recrea el `CHECK` entero, como en la 011 y la 022; al revertir, las filas nuevas vuelven a `actualizar` para no romper el `CHECK` anterior |
| 031 | `bloqueo-y-preguntas-auditoria` | Suma `bloquear` (cuenta bloqueada por intentos fallidos) y `verificar_preguntas` (intento de recuperación, con su resultado). Los dos ocurrían en silencio |
| 032 | `departamentos-catalogo-unico` | Depura `departamentos` **en su sitio** (conserva los UUID que ya usan los programas): fusiona variantes con el mismo código («Vaupes»/«Vaupés»), borra las que no resuelven y no tienen datos («Vupes»), pone los nombres oficiales, agrega los que faltaban (Caquetá, Chocó, Vichada), deja `codigo_dane` obligatorio y único, y crea `departamentos_alias`. Si una variante sin código tuviera datos, o dos variantes el mismo centro, **se detiene** en vez de adivinar. El `down` no deshace la fusión |
| 033 | `tendencia-ocupacional` | Las 8 tablas y 2 vistas de §4.6.1, con sus semillas. DDL de `criterios/001_percentiles_ocupacionales.sql` con las tablas en plural, el catálogo de departamentos de la 032 y la bitácora en `cargas_datos` |
| 034 | `cortes-ocupacionales-huella-repetible` | Quita el `UNIQUE` de `cortes_ocupacionales.huella_datos` (I19) y el cargador deja de aplicar V10: el mismo contenido puede cargarse en varios periodos. La huella se sigue guardando. Al revertir, las huellas repetidas quedan en NULL salvo la del corte más antiguo, para poder recrear el `UNIQUE` |
| 035 | `tendencia-anio-libre` | Quita el rango 2012–2100 del año: los CHECK de `anio` de `cortes_ocupacionales` y `cargas_datos_ocupacionales` (por definición, no por nombre, como la 008) pasan a «cuatro cifras». La matriz `v_estado_cargas_ocupacional` va del menor al mayor año con corte o carga (antes 2012..máx. corte: no veía un 2005 ni un año futuro con la carga en curso o fallida). En su propia transacción, como la 032. Revertir falla sin tocar nada si ya hay años fuera de 2012–2100 |
| 036 | `eliminar-cms-tradicional` | Borra `contenidos`, `contenidos_archivos` y `secciones`: el CMS por formularios quedó sustituido por las páginas de Puck. Irreversible por diseño. Con ellas se fueron las invariantes I5 e I6 |
| 037 | `tendencia-ocupacional-claves-uuid` | Las ocho tablas de la 033 pasan a UUID en toda clave primaria y foránea (D3), en su sitio y sin perder datos: los catálogos eran 1, 2, 3… y los cortes, ocupaciones e indicadores, identidades secuenciales. `/cortes/{id}/despublicar` recibía un entero que se adivina. El criterio generado pasa de `criterio_id` (1–4) a `criterio_codigo`, y la API lo pide por código. El `down` devuelve los enteros: los catálogos, los de su semilla (`id` = `orden`); el resto, nuevos y en orden. En su propia transacción. Las columnas `id` quedan al final de cada tabla: Postgres no reordena columnas |
| 038 | `alertas-inversion-catalogos` | `ciiu_secciones` (semilla de las 21), `ciiu_clases`, `empresas`, `municipios` (§4.7). Puramente aditiva. **El `UNIQUE` de `ciiu_secciones.letra` no se creó** (§9.1) |
| 039 | `alertas-inversion-proyectos` | `proyectos_inversion` y `proyectos_inversion_ubicaciones` (§4.7), con FKs a `empresas`, `ciiu_secciones`, `ciiu_clases`, `departamentos`, `municipios` y `usuarios`. Puramente aditiva |
| 040 | `auditoria-autoguardado` | Suma `autoguardar_borrador` al `CHECK` de `auditoria_cambios`: el guardado que hace el editor solo cada 30 s. Aparte de `guardar_borrador` porque ese se lee «el usuario guardó» y este no lo pulsó nadie. Al revertir, las filas pasan a `guardar_borrador` (no a `actualizar`): son guardados de borrador de verdad |
| 041 | `integridad-e-indices` | Lo que encontró la revisión del §9: los `UNIQUE` que faltaban, FK compuestas para las copias (I22, I23), `NOT NULL` y `DEFAULT` donde `sync` los había dejado sin poner, las reglas I21–I26, seis índices que nadie leía fuera y cuatro que solo existían en Neon unificados. En su propia transacción. El `down` quita las reglas y devuelve los índices; no devuelve los `NULL`, el `DEFAULT 'post'` ni `_obsoleto_attachment` |
| 042 | `catalogos-sin-duplicados` | Que las cargas no dupliquen filas en las tablas maestras (§9.5). Función `normalizar_nombre()`, gemela en SQL de `normalizarParaComparar()`; únicos sobre el nombre normalizado en `departamentos`, `municipios` y `empresas`; `CHECK` de los 33 códigos DANE; columna `codigo` (SENA) con su único en niveles, centros y programas, sin los únicos por nombre; funde «Medellin» en «Medellín» y borra cinco filas de catálogo sin hechos. `codigo` entra nulo: lo rellena la siguiente carga del Excel. Revertir falla sin tocar nada si ya hay dos programas o centros con el mismo nombre en su nivel o departamento |
| 043 | `password-temporal-vence` | La contraseña temporal vale 72 horas (decisión del usuario, 09-10-2026): `usuarios.password_temporal_vence_en`. Se fija al emitirla y se vacía al reemplazarla; la regla está en `shared/password-policy.ts`. Las cuentas que ya tenían una temporal pendiente reciben 72 h desde que se aplica la migración, porque no se sabe cuándo se emitió la suya. El `down` quita la columna |

Cuatro lecciones de este tramo que vale más recordar que releer:

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

**La 041 — en `queryInterface.createTable`, `unique: 'uq_…'` no crea nada.** Solo
`unique: true` escribe `UNIQUE`. El nombre en cadena es una opción de `Model.init`, que
`createTable` ignora sin avisar. Así se perdieron tres restricciones en la 026 y la 038
que este documento daba por existentes. Para nombrar un único al crear una tabla:
`queryInterface.addConstraint(tabla, { type: 'unique', fields, name })` (como hace la 038
con `uq_ciiu_clases_seccion_codigo`) o SQL. Y después de migrar, mirar `pg_constraint`,
no el código de la migración.

Y una regla de método que la 018 deja fijada: **una migración aplicada no se reescribe.**
La 015 ya estaba anotada en `migraciones_aplicadas`; corregirla en su sitio habría dejado
esta base con los datos mal y el registro diciendo que todo fue bien. Con las dos, los
dos caminos convergen — sobre una base ya migrada la 018 repara, sobre una base nueva la
015 (ya con filtro) no toca nada y la 018 no encuentra qué reparar. Por eso la 041
corrige la 026 y la 038 en vez de editarlas.

### 8.1 La decisión que hace segura toda la fase 4

> **Se renombra la columna, no el atributo del modelo.**

`Contenido.title` sigue llamándose `title` en el modelo y en el JSON de la API; la columna es `titulo`, y `field: 'titulo'` une las dos. Lo mismo con `sectionId`→`seccion_id`, `User.name`→`nombre` y el resto.

Sin esto, renombrar una columna obligaría a cambiar el modelo, el repositorio, el caso de uso, el controlador **y los dos frontends** en el mismo despliegue. Con esto, la base adopta la convención del proyecto y **ningún frontend se entera**: quien consuma `/api/contenidos` y el panel de usuarios siguen recibiendo exactamente los mismos campos.

Por el mismo motivo **tampoco se traducen los valores**: `usuarios.estado` sigue guardando `'active'`/`'inactive'` porque el panel de usuarios los compara y los escribe tal cual. La única excepción es `auditoria_cambios`, donde sí se tradujeron nombres y valores — ningún frontend consume todavía esos campos, así que no había contrato que romper.

Alinear también los nombres de atributo al español es un refactor de la API, con su propio plan y sus propios consumidores que avisar. No es trabajo de base de datos.

### 8.2 Lo que la fase 4 encontró y tuvo que resolver

- **Autorías que no eran UUID.** El modo de autenticación local escribe identificadores que no son UUID en `authorId`, que nunca tuvo clave foránea. Se vacían y se cuenta cuántos: una autoría desconocida es mejor que abortar la migración por datos de desarrollo.
- **Archivos heredados sin hash.** `archivos.hash_sha256` era `NOT NULL UNIQUE` para deduplicar, pero los adjuntos ya cargados nunca se leyeron del disco. En vez de inventar el hash, la unicidad pasa a ser **parcial**: aplica solo a los que lo traen. (Hoy los tres archivos tienen hash; el único parcial se deja porque no cuesta nada.)
- **Slugs de página que podían chocar.** El sitio y la intranet comparten la tabla `paginas` y el slug era único a secas: `/inicio` no podía existir en las dos. Ahora es `UNIQUE(ambito, slug)`.
- **`"Attachment"` no se borró**, se renombró a `_obsoleto_attachment` (regla 5 de `4-reglas.md`), a la espera de que `archivos` estuviera en uso. Se borró al fin en la 041.

### 8.3 Lo que sigue pendiente, y por qué

- **`usuarios_sitio` se eliminó** (`013-eliminar-usuarios-sitio`). Ya no es un renombrado pendiente: con la tabla se retiró su login propio (`/api/sitio-users`) y el segundo secreto JWT (`JWT_SITE_SECRET`) que solo firmaba esos tokens. Estaba vacía y ningún frontend la consumía — el panel del sitio siempre entró por `/api/auth/login`, que valida contra `usuarios`. `usuarios` es hoy la única identidad del sistema.
- **`contenidos.cuerpo` ya no aplica:** la migración `036-eliminar-cms-tradicional` borró `contenidos`.
- **`script.sql` salió del repositorio** el 2026-09-26 (vivía en `migrations/_obsoletas/`; queda en el historial de git). Ningún `docker-compose` lo monta ya: **una base levantada con Docker obtiene su esquema de `npm run migrate`**, como todas.
- **Verificación obligatoria.** El puente modelo↔columna son cadenas que ningún compilador valida. Por eso existe `npm run db:verificar`: contrasta cada atributo de cada modelo contra `information_schema` y falla nombrando el que no cuadre. **Ejecutarlo después de migrar no es opcional.** Ojo con lo que no mira: compara columnas, no restricciones ni índices (§8.4).

### 8.4 Resultado de la ejecución

Hoy el manifiesto lleva **cuarenta y dos migraciones (`001` a `042`)**. `npm run db:verificar` confirma que los **23 modelos Sequelize** coinciden con las columnas reales de PostgreSQL, tanto en una copia de Neon como en una base nueva migrada desde cero (comprobado el 08-10-2026 y otra vez el 09-10-2026 con la 042).

Cosas que solo se supieron al ejecutar, y que estaban mal supuestas en el diseño:

| Lo que se asumía | Lo que había |
|---|---|
| `"Post".id`, `"Section".id`, `"Attachment".id` eran `TEXT`, como declaraban los modelos | Ya eran **`uuid`**. Sobraban todas las conversiones de tipo, y los pre-chequeos con `!~*` habrían fallado: no es un operador válido sobre `uuid` |
| `permissions.created_at` tendría `DEFAULT now()` | `NOT NULL` **sin default**: el valor lo ponía Sequelize desde JavaScript, así que un `INSERT` en SQL plano no tenía quien lo rellenara. Igual en otras once columnas de fecha, hasta la 041 |
| Las filas del driver llegan como objeto | Llegan como **array posicional**. Leerlas de una sola forma hacía que el verificador diera un informe falso y que el runner creyera que ninguna migración se había aplicado |
| El esquema contenía tablas obsoletas y stubs | Existían tablas como `FileStatuses` y `_obsoleto_attachment`, que fueron depuradas en la 020 y la 041 |
| `unique: 'uq_…'` en `createTable` crea la restricción | No crea nada (026, 038). Tres `UNIQUE` documentados no existían (§9.1) |
| Neon y una base nueva tienen el mismo esquema | Neon nació de `sync` y una base nueva de la 001: diferían en nulabilidad, `DEFAULT`, cuatro índices y una tabla. La 041 los iguala; lo que queda distinto no cambia nada (§9.4) |

La lección para las siguientes: **el esquema real manda sobre lo que declara el modelo.** Antes de escribir una migración que convierta tipos o añada reglas, hay que mirar el catálogo de Postgres, no el `DataTypes` del modelo ni el código de la migración que lo creó.

### 8.5 Pendiente conocido: el runner no hace atómicas las migraciones

El runner abre una transacción por migración, pero llama a `up()` sin pasársela, así que las sentencias corren fuera de ella. Si una migración falla a mitad, lo ya ejecutado **no se revierte** — es lo que pasó en el primer intento, que dejó `archivos` creada pese al fallo.

Las migraciones que lo necesitan se protegen solas: la 032, la 035, la 037 y la 041 abren su propia transacción (`enUnaTransaccion`) y la pasan a cada sentencia. Las demás son idempotentes (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`). Conviene cerrarlo en el runner, pero hasta entonces, **respaldo antes de migrar**: `npm run respaldo -- <ruta.json>` vuelca todas las tablas a JSON. (Hasta el 09-10-2026 el script tenía una lista de tablas con los nombres de antes de la 005 y fallaba en la primera: no respaldaba nada.) En Neon, además, una rama (*branch*) antes de migrar es el respaldo más rápido de restaurar.

Un respaldo que no se ha probado a restaurar no es un respaldo (S9).

### 8.6 Lo que la fase 3 tuvo que corregir en los datos

Dos invariantes no se podían declarar sobre los datos existentes, así que la migración los normaliza antes y deja constancia:

- **I1 estaba rota.** `aprobarPagina` marcaba la nueva versión como publicada pero **nunca degradaba la anterior**, así que una página con dos aprobaciones acumulaba dos versiones en estado `publicado`. La migración archiva las reemplazadas —conservando la que apunta `version_publicada_id`— y el caso de uso ahora archiva la vigente antes de publicar la siguiente.
- **Estado `archivado`.** Una versión reemplazada no es borrador ni rechazada. El estado entra al dominio en esta fase.

---

## 9. Revisión del esquema (08-10-2026): normalización y rendimiento

Una pasada completa por las 33 tablas buscando tres cosas: reglas que el documento daba por hechas y la base no tiene, datos que se repiten (normalización) y trabajo que la base hace sin que nadie lo aproveche (rendimiento). Lo que se corrigió está en la migración 041; lo que no, en §9.4 con su motivo.

**Cómo se midió.** Todo de solo lectura sobre Neon: el catálogo (`pg_constraint`, `pg_index`, `information_schema`), los contadores de uso (`pg_stat_user_tables`, `pg_stat_user_indexes`; acumulados, sin reinicio registrado), consultas de coherencia sobre los datos y `EXPLAIN ANALYZE` de las consultas que más se repiten. La 041 se probó sobre una copia de Neon en un Postgres 18 local (subida, bajada y vuelta a subir), sobre una base vacía migrada de la 001 a la 041, con quince intentos de romper las reglas nuevas (todos rechazados), y con el ciclo editorial completo ejecutado por los casos de uso reales (crear sección, borrador, revisión, aprobar dos veces, rechazar, restaurar y eliminar).

### 9.1 Integridad que faltaba

| Qué faltaba | Consecuencia | Corrección (041) |
|---|---|---|
| `UNIQUE` en `departamentos.nombre`, `niveles_formacion.nombre` y `ciiu_secciones.letra`. Documentados aquí y en el diccionario; nunca existieron (lección de §8.0) | El importador de sobresalientes podía crear dos veces el mismo nivel y el de alertas la misma sección, y las búsquedas por nombre devolverían una cualquiera | Creados (I24). Antes se comprobó que no hay duplicados |
| `ciiu_clases` solo era única por `(seccion_id, codigo)` | `buscarClasePorCodigo` busca por `codigo` solo: con el mismo código en dos secciones devolvería cualquiera | `UNIQUE (codigo)`, que implica el anterior; el anterior se quita |
| `paginas_versiones.estado` admitía `NULL` | Un `CHECK` deja pasar `NULL`: una versión sin estado esquivaba I1–I4 | `NOT NULL` |
| `auditoria_cambios.entidad_tipo` admitía `NULL` y tenía `DEFAULT 'post'` | El valor por defecto lo rechaza su propio `CHECK` | `NOT NULL`, sin `DEFAULT` |
| `usuarios.debe_cambiar_password`, `debe_configurar_preguntas`, `intentos_fallidos` y `preguntas_seguridad.orden` admitían `NULL` | Tres valores (`true`/`false`/`NULL`) donde el código solo entiende dos | `NOT NULL`, rellenando con lo que el código ya entendía (`NULL` es falso en JavaScript), no con el `DEFAULT` |
| Doce fechas y dos `id` sin `DEFAULT` en Neon (sí lo tienen en una base nueva) | Un `INSERT` en SQL plano tenía que acordarse de ellas | `DEFAULT now()` / `gen_random_uuid()` |
| Nada exigía fecha a lo publicado | I5 se fue con `contenidos` y nadie la heredó | I21 |
| `cargas_datos.modulo` era texto libre | Contra D4 | I26 |
| Dos índices únicos de correo: `lower(email)` (005) y `email` (una copia de `sync` que la 005 quiso borrar con otro nombre) | El login busca `email = …` ya normalizado: solo le servía el segundo, y el primero era una escritura más | Uno solo, `UNIQUE (email)` + `CHECK (email = lower(email))` (I25). Con el `CHECK`, los dos significaban lo mismo |

### 9.2 Normalización: las copias que hay y qué las sostiene

Las tablas están en tercera forma normal salvo por estas columnas, que repiten algo que ya se deduce de otra fila. Es la lista cerrada de D6.

| Copia | Se deduce de | Decisión |
|---|---|---|
| `programas_sobresalientes.departamento_id` | `centro_id` → `centros_formacion.departamento_id` | **Se queda, amarrada** (I22). Ahorra un JOIN en cada filtro por departamento de la tabla de hechos |
| `programas_sobresalientes.nivel_formacion_id` | `programa_id` → `programas_formacion.nivel_formacion_id` | **Se queda, amarrada** (I22). Ídem para el filtro por nivel |
| `proyectos_inversion.seccion_id` | `clase_id` → `ciiu_clases.seccion_id`, **cuando hay clase** | **Se queda, amarrada** (I22). La clase es opcional; sin ella, la sección es el único dato |
| `proyectos_inversion_ubicaciones.departamento_id` | `municipio_id` → `municipios.departamento_id`, **cuando hay municipio** | **Se queda, amarrada** (I22). Una sede puede conocerse solo por departamento |
| `paginas.version_publicada_id` (que la versión sea de la página) | `paginas_versiones.pagina_id` | **Amarrada** (I23) |
| `auditoria_cambios.usuario_nombre` | `usuarios.nombre` | **Se queda, libre a propósito**: la bitácora tiene que seguir diciendo quién fue aunque la cuenta se borre o cambie de nombre |
| `bloqueos_edicion.usuario_nombre` | `usuarios.nombre` | **Se queda, libre a propósito**: la cuenta maestra local no está en `usuarios` (021) |
| `cargas_datos_ocupacionales.anio`, `periodo_id` | `corte_id` → `cortes_ocupacionales` | **Se queda, libre a propósito**: es la celda que la carga *pidió*; el corte puede borrarse (`SET NULL`) y la carga sigue siendo su trazabilidad. Hoy coinciden en todas las filas |
| `programas_sobresalientes.tasa_vinculacion` | `vinculados / certificados` | **Pendiente** (§9.4). Coincide en las 671 filas |

**Por qué FK compuestas y no quitar las columnas.** Quitar la copia obliga a cambiar el importador y cada consulta que filtra por ella; la FK compuesta no toca el código y hace imposible la contradicción: `FOREIGN KEY (centro_id, departamento_id) REFERENCES centros_formacion (id, departamento_id)` exige que la pareja exista tal cual. Con `MATCH SIMPLE` (el de siempre) la regla no se aplica si una de las dos es `NULL`, que es justo el caso «sin clase» o «sin municipio». Con `ON UPDATE CASCADE`, si un centro cambia de departamento (lo que hizo la 032 al fusionar), sus hechos lo siguen solos. El precio es un único `(id, columna)` en cada tabla de destino, y medido sale gratis (§9.3).

### 9.3 Rendimiento

**Volumen.** La base es pequeña: 7,7 MB la mayor tabla. Nada de lo medido tarda más de 5 ms, así que la base no es hoy el cuello de botella de ninguna pantalla.

| Tabla | Filas | Tamaño con índices | Cómo crece |
|---|---:|---:|---|
| `indicadores_ocupacionales` | 20.774 | 7,7 MB | ~20.700 filas por corte (611 ocupaciones × 34 ámbitos). Con los siete periodos de un año, ~145.000 por año cargado |
| `auditoria_cambios` | 2.177 | 2,0 MB | Con cada acción del panel; desde julio de 2025. El autoguardado (cada 30 s con cambios) es lo que más la puede acelerar |
| `paginas_versiones` | 147 | 1,0 MB | Con cada guardado de borrador que abre versión; 366 kB de JSON de Puck |
| `programas_sobresalientes` | 671 | 0,7 MB | No crece: se vacía y recarga en cada importación |
| El resto (29 tablas) | < 650 cada una | < 220 kB cada una | Catálogos y configuración |

**Índices quitados.** Se miraron las lecturas de cada índice desde que existe la base:

| Índice | Lecturas | Por qué sobraba |
|---|---:|---|
| `users_status` (`usuarios.estado`) | 0 | Cuatro valores posibles en 13 filas |
| `idx_security_questions_user_id` | 45 | Repite la primera columna del único `(usuario_id, pregunta_clave)`, que atiende las mismas búsquedas |
| `idx_archivos_ambito` | 0 | Ninguna consulta filtra `archivos` por ámbito ni estado |
| `idx_sobresalientes_nivel`, `idx_sobresalientes_sexo`, `idx_sobresalientes_tasa` | 0, 0, 0 | La única lectura trae la tabla entera; `sexo` tiene dos valores. Y es la tabla que se reescribe entera en cada importación |
| `uq_usuarios_email` (`lower(email)`) | 0 | Ver §9.1 |

**Índices unificados.** Cuatro que existían solo en Neon, con nombres de `sync`, y que están entre los más leídos: `idx_usuarios_rol` (286.060 lecturas), `idx_roles_permisos_permiso` (34.256), `idx_auditoria_accion` (6.397, el listado de la bitácora) e `idx_paginas_creado_por` (1.874). En una base nueva, como la del servidor, no existían.

**Medido después.** Sobre la copia local, antes y después de la 041:

| Operación | Antes | Después |
|---|---:|---:|
| Recargar `programas_sobresalientes` (671 filas, mediana de 15) | 30,5 ms | 31,9 ms |
| Índices de `programas_sobresalientes` | 496 kB | 352 kB |
| Login por correo | índice | índice (`uq_usuarios_email`) |

La recarga queda igual dentro del ruido: las dos FK compuestas cuestan lo que ahorran los tres índices quitados. La integridad nueva no cuesta tiempo.

**Lo que ya estaba bien.** El buscador ocupacional (`v_buscador_ocupacional`, 611 filas de un corte) resuelve en 4,9 ms por `idx_indicadores_ocupacionales_busqueda`. El listado de la bitácora, con la exclusión de autoguardados, en 3,8 ms. Las actualizaciones de `usuarios` son HOT en el 99 % (D9) y las de `paginas`, donde va el contador de visitas, en el 98 %.

### 9.4 Lo que queda, y por qué no se corrigió

| Qué | Por qué no en la 041 | Qué haría falta |
|---|---|---|
| `programas_sobresalientes.tasa_vinculacion` se deduce de `vinculados / certificados` (coincide en las 671 filas) | El importador la lee del Excel y la escribe; convertirla en columna generada rompe ese `INSERT` | Columna `GENERATED ALWAYS AS (round(vinculados::numeric / NULLIF(certificados, 0), 4)) STORED` y quitar la tasa del `bulkCreate` de `importar-programas-excel` |
| `paginas_versiones.layout` está vacía en las 147 versiones | `obtener-pagina-publica` la devuelve en la API pública | Quitarla del contrato y luego de la tabla |
| `archivos.texto_alternativo` no la escribe ningún código | El texto alternativo vive en el bloque (§4.3) | Quitarla con el modelo |
| `cargas_datos_ocupacionales.reemplazar` siempre `false` | El código todavía la lee al listar cargas viejas | Quitarla del listado y de la tabla |
| `bloqueos_edicion` no tiene FK a `paginas`: el candado de una sección borrada se queda (hay uno, caducado, de una sección de prueba) | Inofensivo: un candado caducado se sobrescribe al pedirlo. Una FK haría fallar con error de base el latido de 45 s si alguien pide candado sobre un slug inexistente | Que `eliminar-seccion` borre el candado en su transacción, o FK `(ambito, slug) → paginas ON DELETE CASCADE ON UPDATE CASCADE` traduciendo el error a 404 |
| El `CHECK` de `auditoria_cambios.entidad_tipo` admite `contenido`, `seccion`, `marca` y `archivo`, de tablas que ya no existen; y `AuditRepository.create` usa `'contenido'` por defecto | Quitar valores del `CHECK` puede romper filas viejas; hay dos de `configuracion` | Alinear el tipo `EntidadAuditable`, el valor por defecto y el `CHECK` en un mismo cambio |
| El listado de la bitácora excluye los autoguardados con `NOT IN (subconsulta)` que recorre todos los `guardar_borrador` y `enviar_revision` | 3,8 ms con 2.177 filas; crece lineal | Revisar cuando pase de ~100.000 filas: índice `(accion, entidad_tipo, entidad_id, created_at)` o marcar los automáticos en una columna |
| El filtro por año de alertas usa `EXTRACT(YEAR FROM fecha_anuncio) = :anio`, que no puede usar `idx_proyectos_inversion_fecha` | 17 filas | Comparar por rango (`fecha_anuncio >= make_date(:anio, 1, 1) AND fecha_anuncio < make_date(:anio + 1, 1, 1)`) cuando crezca |
| Extensiones `pgcrypto` y `uuid-ossp` instaladas sin uso (`gen_random_uuid()` es nativa desde Postgres 13) | No cuestan nada | Opcional |
| Diferencias entre Neon y una base nueva que no cambian nada: las FK que hizo `sync` llevan `ON UPDATE CASCADE` sobre UUID que nunca cambian, algunos únicos se llaman `…_key61` y algunos `CHECK` se escriben distinto con el mismo significado | Renombrar es ruido en el historial sin efecto | Nada |

### 9.5 Las tablas maestras: que una carga no duplique (09-10-2026)

La pregunta: ¿pueden las cargas de «Programa + Sobresalientes», «Alertas de inversión» y «Criterios» (tendencia ocupacional) meter dos veces lo mismo en un catálogo, como un «Vaupes» junto a «Vaupés»? Se revisó el código de cada importador, los datos de Neon (nombres normalizados, distancia de edición, palabras vacías y sufijos societarios) y los Excel reales que se cargaron.

**Treinta y tres, no treinta y dos.** Colombia tiene 32 departamentos y Bogotá D.C., que es distrito capital y no departamento, pero tiene código DANE propio (11) y regional propia en el SENA («Distrito Capital»: 15 centros y 150 hechos hoy). Por eso el catálogo tiene 33 filas, y la 042 cierra la puerta a una 34.ª (I27).

| Catálogo | Quién lo llena | Cómo se identificaba | Lo que se encontró | Cómo queda (042) |
|---|---|---|---|---|
| `departamentos` | Nadie: semilla de la 032 | Alias normalizado, en los tres importadores y el alta manual | **Sin duplicados.** Los 33 tienen el alias de su nombre oficial; «Vaupes», «Vaupés», «VAÚPES» y «Vaúpes» caen en el mismo (`vaupes`) | Además, la base rechaza dos nombres que solo difieran en tildes o mayúsculas, y cualquier código fuera de los 33 |
| `niveles_formacion` | Sobresalientes | Nombre exacto | «Tecnico» (un programa, ningún hecho) junto a «Técnico» | Por código SENA. La fila vieja se borró |
| `centros_formacion` | Sobresalientes | Departamento + nombre exacto | Un centro de Vaupés repetido con una errata («Agropecuarios»), y dos centros asignados a departamentos donde no tenían datos; los tres sin hechos | Por código SENA. Las tres filas se borraron |
| `programas_formacion` | Sobresalientes | Nivel + nombre exacto | Por nombre no se puede: el Excel trae **programas distintos con el mismo nombre** (134507 y 134508, «Apoyo administrativo en salud»; 223201 y 223213; 662121 y 635503). Por nombre exacto, el importador **sumaba** dos de ellos en una sola fila | Por código SENA (decisión del usuario). La próxima carga los separa |
| `municipios` | Alertas (Excel y alta manual) | Departamento + nombre exacto | «Medellín» (2 sedes) y «Medellin» (ninguna) | Departamento + nombre normalizado. Fundidos |
| `empresas` | Alertas (Excel y alta manual) | `lower(nombre)` | Sin duplicados hoy; pero «Grupo Éxito» y «GRUPO EXITO» habrían sido dos | Nombre normalizado |
| `ocupaciones` | Tendencia | Código CNO (`ON CONFLICT (codigo)`); V3 y V4 rechazan un código con dos nombres o repetido | **Sin duplicados.** Siete nombres se repiten con códigos distintos («Psicólogos» 3161 y 4151): viene así de la fuente y son ocupaciones distintas | Sin cambios |
| `ciiu_secciones`, `ciiu_clases` | Semilla; Excel de sectores | Letra; código CIIU (041) | Sin duplicados | Sin cambios |
| `periodos`, `niveles_ocupacionales`, `niveles_cualificacion`, `criterios_ocupacionales` | Semilla de la 033 | Código | Sin duplicados | Sin cambios |

**Por qué el código y no el nombre normalizado en sobresalientes.** Era la primera idea, y los datos la descartaron: normalizar el nombre habría fundido programas que la fuente da como distintos. El Excel oficial trae `Cod. Regional`, `Cod. Centro`, `Cod. Nivel de formación` y `Cod. Programa` (el formato de `uploads/formatos-carga/` también). Comprobado sobre el archivo real: cada código tiene un solo nombre y un solo padre, y `Cod. Regional` es el código DANE del departamento. El nombre normalizado se usa solo donde la fuente no trae código.

**Lo que hace la base, no solo el código.** La unicidad está en índices sobre `normalizar_nombre()` o sobre `codigo`, así que un duplicado se rechaza venga del importador, del alta manual o de un `INSERT` a mano. La función SQL y la de TypeScript dan el mismo resultado en los 1.201 nombres que hay en la base y en 17 casos difíciles; solo difieren con letras de otros alfabetos latinos («ā», «š»), que no aparecen en estos datos.

**Lo que se vio y no es un duplicado, pero conviene saberlo:**

- Un «municipio» llamado **«Varios municipios»** en Santander: no es un municipio. Si una noticia anuncia varias sedes, lo correcto son varias ubicaciones, o una sin municipio. Decidir cómo tratarlo en el Excel es de negocio.
- Cuatro empresas sin ningún proyecto (Croydon, Frisby, Grupo Éxito y **«Prueba 1»**, que parece de pruebas): quedaron de proyectos borrados. Son inofensivas.
- El sitio público no muestra el código del programa, así que los dos «Apoyo administrativo en salud» de un mismo centro se ven como dos filas con el mismo nombre. Mostrar el código es un cambio del frontend.
- Hasta que se vuelva a subir el Excel de sobresalientes, sus catálogos siguen con `codigo` vacío y los dos «Mantenimiento Electromecánico Industrial» siguen sumados. La primera carga después de la 042 lo corrige (probado con el archivo real: 672 hechos en vez de 671, los mismos totales de certificados y vinculados).

---

## 10. Decisiones abiertas

- **Retención de auditoría.** `auditoria_cambios` es la tabla que más crece. Ya se puede depurar lo de más de un año desde el panel; cuando el volumen lo justifique, particionar por mes o archivar a almacenamiento frío. Hoy no hace falta: 2 MB en quince meses.
- **`archivos.ambito`** distingue público de interno, pero no permite compartir un archivo interno con un subconjunto de directores. Si RF-15 llega a exigir eso, se resuelve con permisos, no con una columna más.
- **Hechos de la tendencia por año.** Si se cargan todos los periodos de muchos años, `indicadores_ocupacionales` pasará del millón de filas. El índice del buscador ya lleva `corte_id` delante, que es lo que permitiría particionar por corte si hiciera falta.
