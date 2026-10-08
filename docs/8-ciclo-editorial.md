# Ciclo Editorial y Anatomía de un Dominio — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md` (arquitectura) y `2-convenciones-del-proyecto.md` (código).
> Define **cómo se organiza por dentro un dominio de negocio** y, en particular, el dominio `paginas/`, que es el corazón del CMS.
> Cubre RF-01 (contenidos), RF-05 y RF-06 (gobernanza) y RF-07 (historial).

---

## 0. Por qué existe este documento

`1-guia-del-proyecto.md` define la arquitectura **entre** capas (`app/ → features/ → shared/`). Lo que no estaba definido es la arquitectura **dentro** de una feature. El resultado es que cada dominio se organizó como le pareció a quien lo escribió, y hoy hay tres formas distintas de nombrar lo mismo en el mismo monorepo.

Este documento cierra ese hueco con una regla única y la aplica al caso más complejo: el ciclo editorial de una página.

---

## 1. El ciclo editorial (el modelo mental)

Una página nunca se edita en vivo. Recorre estados, y cada transición tiene un actor y un permiso distinto.

```
   ┌──────────────┐  enviar a      ┌──────────────┐   aprobar    ┌──────────────┐
   │  borrador    │───revisión────>│ en_revision  │─────────────>│  publicado   │
   └──────────────┘                └──────────────┘              └──────────────┘
          ▲                               │                             │
          │                               │ rechazar                    │ revalidación
          │                               ▼                             │ ISR + Redis
          │                        ┌──────────────┐                     ▼
          └────nuevo borrador──────│  rechazado   │            ┌──────────────────┐
                                   └──────────────┘            │  sitio público   │
                                                               └──────────────────┘
```

### 1.1 Paso a paso

| # | Etapa | Actor | Qué ocurre | Efecto en el sitio público |
|---|---|---|---|---|
| 1 | **Edición** | Editor | Entra a `/editor/<slug>`, modifica bloques. Al guardar —con el botón, o solo cada 30 s si hay cambios (autoguardado, `use-autoguardado.ts`)—, la API crea o actualiza un registro en `PaginaVersion` con estado `borrador`. El autoguardado no toca una versión `en_revision`. | **Ninguno.** Sigue mostrando la versión publicada. |
| 2 | **Envío a revisión** | Editor | Escribe el **comentario de cambios** (obligatorio, 10–100 caracteres; ver §1.6). La versión pasa a `en_revision` con ese comentario. Queda bloqueada para edición. | Ninguno. |
| 3 | **Revisión** | Administrador | Entra a `/revision`, lee el comentario, previsualiza y decide. | Ninguno. |
| 4 | **Aprobación** | Administrador | La `PaginaVersion` se marca como la versión `publicado` activa. Se dispara revalidación de caché (ISR + Redis). | **Ahora sí cambia.** |
| 5 | **Rechazo** | Administrador | Pasa a `rechazado` con motivo. Vuelve a ser editable. | Ninguno. |
| 6 | **Consumo** | Ciudadano anónimo | `/` llama a `obtenerPaginaInicio()` → `/api/paginas/publica/inicio`. La API devuelve el JSON de la versión publicada activa. `<ClientPuckRender data={data} />` dibuja los bloques. | — |
| 7 | **Nuevo ciclo** | Editor | Un nuevo borrador no afecta lo publicado hasta que se apruebe. | Ninguno hasta el paso 4. |

**Quinto estado: `archivado`.** Al aprobar (paso 4), la versión que estaba publicada pasa a `archivado` — no desaparece, queda como historial. No es un estado al que el editor pueda llegar: es la consecuencia automática de que otra versión ocupe su lugar. La base de datos lo impone con un índice único parcial que solo admite una versión `publicado` por página; el detalle está en `11-base-de-datos.md` §5 (invariante I1).

### 1.2 La invariante que sostiene todo

> **Lo que ve el ciudadano solo cambia en el paso 4.**

Toda decisión de diseño de este documento existe para hacer esa invariante difícil de romper por accidente.

### 1.3 El paso 4 dejó de ser teoría (2026-08-21)

Durante mucho tiempo la columna «Ahora sí cambia» del paso 4 era una promesa a medias.
La base de datos quedaba correcta —versión en `publicado`, la anterior archivada,
`version_publicada_id` apuntando bien— y **la pantalla seguía mostrando lo de antes**.
Quien aprobaba recargaba, veía el contenido viejo y concluía que la aprobación no había
funcionado.

Eran dos cachés, ninguna de las cuales se enteraba de nada:

- La de la API (`cacheInterceptor` sobre Redis), que servía su copia hasta agotar el TTL.
- La de Next en el sitio (`fetch` con `next: { revalidate: 60 }`), que además —por su
  `stale-while-revalidate`— entregaba la copia vieja **una vez más** después de caducar.

Los oyentes de `domain-events/paginas/` existían desde el primer día, pero eran
`console.log` que nadie importaba. Ahora `aprobarPagina` emite el evento de verdad y
cuelgan de él dos oyentes:

| Oyente | Qué hace | Cómo |
|---|---|---|
| `invalidar-cache.listener` | Borra de Redis la respuesta cacheada de esa página | `SCAN` + `DEL` por patrón, nunca `KEYS` — recorrer el keyspace entero bloquearía Redis dentro de una petición que alguien está esperando |
| `revalidar-isr.listener` | Le pide al sitio que tire su copia | `POST {SITIO_WEB_URL}/api/revalidar`, que traduce el slug a etiqueta y llama a `revalidateTag(tag, { expire: 0 })` |

Cuatro decisiones que conviene no deshacer sin entender por qué están:

1. **Se espera a los oyentes antes de responder.** Lo natural sería dispararlos y
   seguir, pero el caso de uso que motivó todo esto es que quien aprueba recarga en el
   acto: si la respuesta llega antes que la invalidación, se encuentra el contenido
   antiguo. Lo que se añade son un `DEL` y una llamada HTTP con 3 s de tope.
2. **Un fallo de caché nunca tumba la publicación.** Cuando los oyentes corren, lo de la
   base ya está escrito y confirmado. `Promise.allSettled` registra lo que falle y no lo
   propaga: fallar aquí significa «la caché tardará lo que diga su TTL», no «no se
   publicó». Devolver un error mentiría sobre lo que pasó.
3. **La etiqueta se construye en el front, no viaja por la red.** La API manda el
   `slug`, que es el dato; el formato `pagina:{ambito}:{slug}` es una convención, y una
   convención que viaje entre dos repositorios se desincroniza en cuanto uno de los dos
   la toca.
4. **El `revalidate: 60` se queda como red de seguridad.** La etiqueta cubre lo que pasa
   por el ciclo editorial; el TTL cubre lo que no — una edición directa en la base, un
   backend desplegado sin el secreto, un front que no respondió a tiempo.

**Límite conocido: una sola réplica.** La llamada resuelve `sitio-web` por DNS de Docker
a **una** instancia. Con varias réplicas, solo se enteraría la que atienda esa llamada y
las demás seguirían sirviendo lo viejo. Hoy no aplica —`docker-compose.servidor.yml` levanta
una de cada servicio en un único host—. El día que se escale horizontalmente la solución
no es llamarlas a todas (no se sabe cuántas hay) sino darle a Next un `cacheHandler`
sobre Redis, para que la caché sea común.

### 1.4 Dos operaciones que no son estados: crear y eliminar una sección

Desde el 2026-08-20 el ciclo ya no opera sobre una lista fija de páginas. Hay un botón
«Nueva sección» (intranet) / «Nueva página» (sitio) y otro de eliminar, cada uno con su
permiso propio (`secciones.crear`, `secciones.eliminar`, ambos de Superadmin y
Administrador por defecto; el Editor no).

No son estados del ciclo: son el antes y el después de todo el ciclo. Y encajan sin
romper la invariante del §1.2 gracias a dos decisiones:

- **Crear no publica.** La sección nace **sin ninguna versión**, así que su ruta todavía
  no muestra nada. Hay que llenarla, mandarla a revisión y que alguien la apruebe, igual
  que cualquier otro cambio. Crear una página en blanco y publicarla de una vez habría
  saltado la cola de aprobación para dejar una página vacía en el portal — lo peor de
  las dos opciones.
- **Crear no genera código.** No hay archivo de ruta nuevo: los comodines (`[...puckPath]`
  en la intranet, `[slug]` en el sitio) ya pintaban cualquier slug que estuviera en
  `paginas`. Esta es toda la razón de que la funcionalidad quepa en un caso de uso.

Lo que sí crea, en una sola transacción, son tres filas: la página, su clave de permiso
`editar.{ambito}.{slug}` y la concesión de esa clave **al rol de quien crea** — no a la
persona, porque el modelo de permisos es por rol y no existe la concesión individual. La
consecuencia hay que decirla en voz alta, y el diálogo la dice: si quien crea es Editor,
todos los Editores podrán editar esa sección. La alternativa —no conceder nada— dejaba a
su creador con un 403 en la página que acababa de crear.

Eliminar lleva tres guardas, cada una por un motivo distinto:

1. **Nunca una sección de fábrica.** `inicio`, `tasa`, `matriz`, las encuestas y
   `menu-y-pie` las pinta código que da por hecho que existen; borrar `inicio` tumba el
   portal. Solo se borra lo que alguien creó, que es justo lo que nadie da por supuesto.
2. **Nada puede estar enlazando a la ruta.** Se recorre el JSON **publicado** buscando
   `href`/`url`, y si el menú u otra página apunta ahí, el borrado se rechaza diciendo
   dónde están los enlaces. Es lo que convierte «borrar» en una operación que no deja el
   portal peor de lo que estaba.
3. **Hay que teclear el título.** No se deshace. Escribirlo es la diferencia entre
   decidirlo y que se te vaya el clic.

Bastan dos `DELETE`: `paginas_versiones` cae en cascada desde `paginas`, y
`roles_permisos` desde `permisos`. **La bitácora sobrevive** porque
`auditoria_cambios` no tiene clave foránea contra `paginas` — a propósito, y es lo que
permite borrar sin perder el rastro de lo que pasó (RF-07).

### 1.5 Restauración de versiones y salvaguarda de uploads (2026-09-02)

Hasta ahora el ciclo editorial era unidireccional: una versión solo avanzaba (`borrador → en_revision → publicado → archivado`). Si una publicación introducía un error, una errata o un recurso defectuoso, la única forma de resolverlo era editar un nuevo borrador desde cero, someterlo a revisión y volver a aprobarlo.

Ahora el ciclo soporta **restaurar a la versión inmediatamente anterior**:

1. **Intercambio atómico de estados en PostgreSQL (`restaurarVersionAnterior`):**
   - La versión que estaba como `publicado` pasa a `archivado`.
   - La última versión con `estado = 'archivado'` y `publicado_en IS NOT NULL` pasa a `publicado`.
   - `paginas.version_publicada_id` se actualiza al ID de la versión restaurada.
   - Todo se ejecuta dentro de una transacción Sequelize atómica; si algo falla, no queda ninguna página en estado inconsistente ni dos versiones publicadas simultáneamente.

2. **Revalidación inmediata (Zero Downtime):**
   - La restauración concluye disparando `emitirContenidoPublicado`.
   - Al igual que en la aprobación ordinaria, se purga Redis y se revalida la etiqueta ISR en Next.js, por lo que el front refleja la versión recuperada en el acto.

3. **Salvaguarda de recursos multimedia (`/uploads/` ↔ `/backup/{pagina_id}/`):**
   - **El problema que resuelve:** En versiones anteriores, si un editor reemplazaba una imagen o archivo en Puck, el archivo viejo en `/uploads/` corría el riesgo de ser eliminado o quedar huérfano. Al restaurar la versión anterior, esa página se quedaba con enlaces rotos (error 404).
   - **Ubicación de backup:** Implementado en `src/infrastructure/storage/backup-uploads.service.ts` (antes `shared/storage`, movido el 2026-09-25). Desde el 2026-10-06 los respaldos viven en el filesystem de la API, uno por ámbito, y no en el `public/` de cada aplicación (`infrastructure/storage/filesystem.ts`):
     - Intranet: `{filesystem}/intranet/backup/{pagina_id}/`
     - Sitio Web: `{filesystem}/sitio/backup/{pagina_id}/`
   - **Regla de integridad al archivar / publicar (`respaldarArchivosAlPublicar`):**
     - Si el archivo de la versión que se archiva **sigue en uso** por la nueva versión: se **copia** a backup (permanece en uploads).
     - Si el archivo **ya no se usa** en la nueva versión: se **mueve** a backup (se retira de uploads).
   - **Regla de integridad al restaurar (`restaurarArchivosDesdeBackup`):**
     - Los archivos necesarios por la versión que vuelve a publicarse se **mueven de regreso a `/uploads/`**.
     - Los archivos de la versión que deja de ser publicada se resguardan en backup.
   - **Archivos que comparten varias páginas (2026-09-25):** al publicar y al restaurar, antes de sacar un archivo de `/uploads/` se pregunta a `PaginaRepository.rutasEnUso` si otra página lo nombra; si es así, se **copia** a backup en vez de moverse. Antes se movía, y la otra página se quedaba con la imagen rota.
   - **Borrado de archivos (`borrarArchivosHuerfanos`):** es la única puerta para borrar archivos de páginas. Borra solo los candidatos que ninguna versión de ninguna página del ámbito nombra. La usan las subidas pendientes (al guardar, enviar, publicar o descartar) y eliminar sección; esta última la llama en el `afterCommit` de la baja y comprueba antes que la página ya no existe, porque Sequelize 6 corre ese gancho también cuando el COMMIT falla.
   - **Purga automática de archivos huérfanos (`limpiarArchivosHuerfanosEnBackup`):**
     - La carpeta `backup/{pagina_id}/` solo conserva **los archivos que la versión archivada actual realmente utiliza**.
     - Cada vez que se restaura o publica, cualquier archivo físico residual que no pertenezca a la versión archivada se elimina del disco, garantizando que no se acumule basura de versiones antiguas.

4. **Herramienta de consola (CLI):**
   - El script `4000-api-backend/scripts/verificaciones/probar-versionamiento.ts` permite operar el ciclo de versionamiento directamente desde la terminal de forma multi-ámbito (`--ambito=intranet` o `--ambito=sitio`):
     - `npx ts-node scripts/verificaciones/probar-versionamiento.ts listar [--ambito=intranet|sitio]`
     - `npx ts-node scripts/verificaciones/probar-versionamiento.ts estado <slug|uuid> [--ambito=intranet|sitio]`
     - `npx ts-node scripts/verificaciones/probar-versionamiento.ts restaurar <slug|uuid> [--ambito=intranet|sitio]`

### 1.6 El comentario de cambios: el «commit» de cada envío (2026-09-18)

Enviar a revisión exige describir qué cambió, como el mensaje de un commit. Antes la
bitácora solo decía `slug · version · estado`, y ni quien aprobaba ni quien auditaba
podía saber **qué** traía una versión sin abrirla y compararla a ojo.

| Regla | Dónde vive |
|---|---|
| Obligatorio, de **10 a 100 caracteres**, en una línea (los saltos y espacios dobles se juntan) | `4000-api-backend/src/shared/comentario-cambios.ts` — lo aplican el esquema Zod de la ruta y el caso de uso |
| Se guarda **en la versión**, no solo en la bitácora | `paginas_versiones.comentario_cambios` (migración 029) |
| Una versión no puede estar `en_revision` sin comentario | `CHECK ck_paginas_versiones_comentario` — invariante I14 de `11-base-de-datos.md` §5 |
| El botón «Enviar a revisión» del modal no se activa sin él | `ModalConfirmarAccion` en los dos `puck-editor-wrapper.tsx` (los topes están repetidos ahí) |
| Quien aprueba lo lee en la cola, bajo el título de la página | `revision-queue-view.tsx` |

**Por qué en la versión y no solo en la bitácora.** Aprobar, rechazar y descartar
ocurren después, las hace otra persona, y cada una deja su propia fila en
`auditoria_cambios`. Con el comentario en la versión, cada una lo registra de primera
mano; sin él, tendría que buscar en la bitácora el último envío de la página y confiar
en que fuera el de esa versión.

**Qué registra la bitácora.** Toda acción que decide sobre una versión (enviar,
aprobar, rechazar, descartar, restaurar, y el archivado automático de la anterior)
lleva el campo `comentario` con un sentido fijo:

- `antes`: el comentario de la versión que estaba **publicada** en ese momento.
- `despues`: el de la versión **sobre la que se actuó**. En el archivado automático es
  la que sustituye a la archivada, para que esa fila y la de `aprobar` cuenten la
  misma transición.

La pantalla de auditoría enseña ese comentario en la columna «Cambios» y, en el
detalle, «Comentario anterior» / «Comentario después» en lugar de la lista de campos
internos (`lib/cambios.ts` de `features/administracion/auditoria/`).

### 1.7 Gestión de archivos huérfanos y subidas pendientes (2026-09-22)

Para evitar la acumulación de archivos inútiles en el servidor (`/uploads/`), el ciclo editorial incorpora un mecanismo de limpieza asíncrona automatizada (`limpiarSubidasPendientes`).

1. **La tabla de memoria (`subidas_pendientes`)**: Toda subida que se realiza desde el editor de Puck (imágenes, documentos, videos) se registra inmediatamente en esta tabla antes de formar parte del borrador. La clave para que esto funcione es que los desarrolladores front-end usen siempre el hook `useRegistrarSubida(url)` apenas reciban la respuesta de subida.
2. **Cuándo se ejecuta la limpieza**:
   - Al **Descartar la edición** (salir sin guardar).
   - Al **Eliminar una versión** (botón de papelera en la gestión de páginas).
   - Al **Guardar un borrador** —a mano o por el autoguardado— o **Enviar a revisión** (el archivo puede haber sido subido pero reemplazado o eliminado del lienzo antes del guardado). Corre **después del COMMIT** (`afterCommit`): lanzada antes, no veía la imagen que ese mismo guardado acababa de meter en el borrador y la borraba del disco.
3. **Lógica de conservación (Evitar borrados accidentales)**:
   - El proceso recorre los registros de `subidas_pendientes` correspondientes a la sesión/página.
   - Si el archivo **sí está en uso** (su ruta aparece en la columna `contenido` o `layout` de *cualquier* versión de la página), **no se borra del disco ni de la tabla de pendientes**. Se mantiene en observación.
   - Si el archivo **ya no se usa** (ej. fue subido pero reemplazado antes del segundo guardado), se borra físicamente del disco y se elimina de la tabla.
4. **Cierre del ciclo al publicar**:
   - Una vez una página es **aprobada** y pasa al estado `publicado`, todos los archivos de esa página que sobrevivieron dejan de ser "pendientes" y se asumen como fijos.
   - La tabla `subidas_pendientes` se limpia por completo para esa página, evitando que crezca indefinidamente. Si esos archivos luego son reemplazados en futuros borradores, su limpieza quedará a cargo del proceso normal de respaldo y restauración detallado en el §1.5.

---

## 2. La regla de oro

> **Un dominio con ciclo de vida se organiza por etapas del ciclo, no por tipo técnico de archivo.**
>
> Un dominio sin ciclo de vida se organiza por tipo técnico.

### 2.1 Por qué

Organizar por tipo técnico (`components/`, `hooks/`, `services/`) funciona mientras el dominio es plano. En cuanto el dominio tiene etapas con **públicos, permisos y políticas de caché distintos**, agrupar por tipo mezcla cosas que no deben tocarse entre sí.

El síntoma real, hoy, en `3000-sitio-web/src/features/paginas/services/paginas.service.ts`: un solo archivo contiene tres públicos incompatibles.

| Función | Quién llama | Autenticación | Caché | Transporte |
|---|---|---|---|---|
| `obtenerPaginaInicio`, `obtenerPagina` | ciudadano anónimo | ninguna | ISR 60 s | `fetch` + `BACKEND_URL` (servidor) |
| `obtenerPaginaEditable`, `guardarBorrador`, `enviarARevision` | editor | cookie | nunca | `axios` + `withCredentials` (cliente) |
| `listarEnRevision`, `aprobarPagina`, `rechazarPagina` | administrador | cookie + permiso | nunca | `axios` + `withCredentials` (cliente) |

Que **dos transportes distintos** convivan en un archivo no es un detalle de estilo: es la prueba de que ahí viven responsabilidades separadas. Los riesgos concretos son cachear una respuesta autenticada y enviar credenciales en una llamada pública.

### 2.2 Cómo se aplica

Cuando las etapas existen, se vuelven carpetas. Cada carpeta queda con **un público, un permiso y una política de caché**, y eso deja de depender de la disciplina de quien escribe.

---

## 3. Anatomía canónica de una feature

### 3.1 Dominio sin ciclo de vida (el caso común)

```
features/<dominio>/
├── index.ts              # ÚNICA puerta pública del módulo
├── components/           # UI del dominio
├── hooks/                # estado y efectos del dominio
├── services/             # única capa que llama a la API
└── types.ts              # contratos del dominio
```

Ejemplos actuales que ya siguen esta forma: `administracion/`, `buscador-ocupaciones/`.

### 3.2 Dominio con ciclo de vida (`paginas/`)

```
features/paginas/
├── index.ts                        # ÚNICA puerta pública del módulo (§0.3)
│
├── client.ts                       # segunda puerta, sin axios (CABECERA_POR_DEFECTO)
│
├── model/                          # lo que comparten las etapas
│   ├── pagina.types.ts             # Pagina, PaginaVersion, Bloque, PuckData, EstadoPagina
│   ├── rutas.ts                    # RUTAS_PROPIAS, slug ↔ URL, ruta de vuelta del editor
│   ├── ambito.ts                   # cabecera X-Ambito: sitio
│   ├── api-con-sesion.ts           # axios withCredentials — nunca desde publicacion/
│   ├── eventos.ts                  # notificarRevisionActualizada
│   └── home-fallback-data.ts       # portada de respaldo (publicación) y semilla (edición)
│
├── publicacion/                    # ETAPA 6 — consumo público
│   ├── publicacion.service.ts      # fetch + ISR y axios SIN credenciales
│   ├── client-puck-render.tsx
│   ├── pagina-puck-fija.tsx
│   ├── rastreador-visitas.tsx
│   ├── etiquetas-cache.ts
│   └── sitio-busqueda-fallback.ts
│
├── edicion/                        # ETAPA 1 — borrador
│   ├── edicion.service.ts          # editable, borrador, subidas, enviar a revisión, candado
│   ├── use-pagina.ts
│   ├── use-bloqueo-de-edicion.ts
│   ├── puck-editor-wrapper.tsx
│   ├── editorjs-wrapper.tsx
│   ├── image-uploader-field.tsx
│   ├── archivo-uploader-field.tsx
│   ├── aviso-rechazo.tsx
│   ├── aviso-editor-ocupado.tsx
│   ├── pagina-en-edicion.tsx
│   └── page-seeds.ts
│
├── revision/                       # ETAPAS 3 a 5 — gobernanza
│   ├── revision.service.ts         # listarEnRevision, aprobarPagina, rechazarPagina, eliminarVersion
│   ├── use-revision-queue.ts
│   └── revision-queue-view.tsx
│
├── secciones/                      # crear y eliminar páginas (no es etapa)
│   ├── secciones.service.ts        # crear, analizar y hacer el borrado, permisos, resumen del panel
│   ├── paginas-fab-speed-dial.tsx  # el botón flotante de acciones
│   ├── modal-nueva-seccion.tsx
│   ├── modal-eliminar-seccion.tsx
│   ├── aviso-seccion-nueva.tsx
│   └── use-permiso-de-seccion.ts
│
└── menu-y-pie/                     # la cabecera y el pie de todo el sitio (no es etapa)
    ├── menu-y-pie.ts               # obtenerPlantilla, SLUG_PLANTILLA
    ├── cabecera-por-defecto.ts     # ex features/identidad-visual
    └── menu-y-pie-fallback-data.ts # semilla del editor
```

Así está el módulo desde el 2026-09-18, por etapa. **Dentro de cada etapa los archivos
van, además, en subcarpetas por tipo**, con la misma anatomía de §3.1: `components/`,
`hooks/`, `services/` y `lib/` (por ejemplo `edicion/services/edicion.service.ts`,
`edicion/components/puck-editor-wrapper.tsx`, `edicion/lib/page-seeds.ts`). El árbol de
arriba lista qué va en cada etapa, no la subcarpeta. `model/` y `menu-y-pie/` son planas,
porque solo tienen un tipo de archivo. El árbol original de este documento proponía
además `model/estado.ts` (transiciones válidas de `EstadoPagina`) y `edicion/edit-button.tsx`;
el primero no se creó porque todavía no hay transiciones que modelar en el cliente, y el
segundo ya no existía (lo reemplazó el botón flotante de `secciones/`).

> **Actualización 2026-09-18.** A este árbol se sumaron `secciones/` (crear y eliminar
> sección, que no existía cuando se escribió) y `menu-y-pie/` (la página que guarda la
> cabecera y el pie). Se aplica por fases, cada una con su commit: 1) `menu-y-pie/`,
> **hecha**; 2) `model/` y `publicacion/`, **hecha**; 3) `edicion/`, **hecha**; 4)
> `revision/` y `secciones/`, **hecha** (con el borrado de los cuatro componentes sin uso). En la fase 2 `model/` quedó con `pagina.types.ts`, `rutas.ts` (ex
> `lib/ruta-de-vuelta.ts`) y `ambito.ts`; no se creó `estado.ts` porque todavía no hay
> transiciones que modelar en el cliente (`EstadoPagina` sigue en `pagina.types.ts`).
> `publicacion/` sumó `pagina-puck-fija.tsx`, `rastreador-visitas.tsx`,
> `etiquetas-cache.ts` y `sitio-busqueda-fallback.ts`.
> `menu-y-pie/` y `secciones/` no son etapas del ciclo sino partes del dominio, y las
> reglas de abajo (pensadas para etapas) no se les aplican tal cual. `menu-y-pie/` usa
> `publicacion/`, y la semilla del editor (`edicion/page-seeds.ts`) usa `menu-y-pie/`.
>
> **Un choque del árbol de arriba, resuelto en la fase 3:** ponía `home-fallback-data`
> en `publicacion/` y `page-seeds` en `edicion/`, pero la semilla usa la portada de
> respaldo, y eso haría a una etapa importar de otra (regla 2). Como la usan las dos
> etapas, subió a `model/home-fallback-data.ts`, aplicando la propia regla 2. Por el
> mismo motivo subieron a `model/` el cliente con sesión (`api-con-sesion.ts`, que usan
> `edicion/` y `services/`) y el aviso de cola de revisión (`eventos.ts`).

**Reglas internas:**

1. `model/` no importa de ninguna etapa. Las etapas importan de `model/`. Así no hay ciclos.
2. Las etapas **no se importan entre sí**. Si dos etapas necesitan lo mismo, sube a `model/`.
3. `publicacion/` **nunca** usa el cliente autenticado. Es servidor, anónimo y cacheable.
4. `edicion/` y `revision/` **nunca** se cachean.
5. Solo `index.ts` es importable desde fuera del módulo.

### 3.3 Qué gana el proyecto

- **El límite de seguridad se vuelve visible.** Hoy `aprobarPagina` está pegado a `obtenerPaginaInicio` y nada indica que una exige permiso de administrador y la otra es anónima.
- **Crecer es añadir carpeta, no engordar `components/`.** Cuando llegue "programada" o "archivada", tiene sitio propio.
- **La estructura enseña el dominio.** Un desarrollador nuevo lee el árbol y entiende el ciclo editorial sin abrir un archivo.

---

## 4. Decisiones de convención (resueltas)

Estas tres divergencias existían entre las dos apps. Quedan cerradas aquí y se reflejan en `2-convenciones-del-proyecto.md`.

### 4.1 Carpeta de componentes: `components/`

| App | Uso actual |
|---|---|
| `sitio-web` | `components/` |
| `intranet` | `ui/` |

**Decisión: `components/`.**

Motivo determinante: `ui/` ya significa otra cosa en este proyecto. `shared/ui/{atoms,molecules,organisms}` es **el sistema de diseño institucional**, y según §4.2 de la guía es además **el catálogo de piezas que el editor registra en Puck**. Usar `ui/` también para "componentes de una feature" hace que la misma palabra signifique dos cosas distintas según la carpeta padre. Eso es precisamente lo que una convención debe evitar.

### 4.2 Carpeta de acceso a la API: `services/`

| App | Uso actual |
|---|---|
| `sitio-web` | `services/` |
| `intranet` | `api/` |

**Decisión: `services/`.** Ya está documentado en §2.3 de convenciones ("Services (`*.service.ts`) — la única capa del frontend que llama a la API"); la intranet es la que se desvió.

Motivo adicional: `api/` colisiona con `app/api/`, que en este proyecto son los *route handlers* de Next que hacen de proxy hacia la API :4000. Son dos cosas distintas —el proxy y el cliente que lo consume— y no deben compartir nombre.

### 4.3 Nombre de archivo de componente: `kebab-case.tsx`

Conteo del día en que se tomó la decisión, ya histórico — desde el 2026-09-16 la columna
`PascalCase` es 0 en todas partes (ver fase 5 de §5):

| Ubicación | PascalCase | kebab-case |
|---|---|---|
| `sitio-web` | 1 | 26 |
| `intranet` | 25 | 10 |
| `packages` | 7 | 1 |

**Decisión: `kebab-case.tsx` para todos los archivos, sin excepción.**

Esto **cambia** la regla anterior de `2-convenciones-del-proyecto.md` §1, que pedía `PascalCase.tsx` para componentes. El cambio es deliberado y las razones son:

1. **Elimina una clase completa de bug de producción.** El desarrollo es en Windows (sistema de archivos *case-insensitive*) y el despliegue es Docker sobre Linux (*case-sensitive*). Un `import { X } from './userProfile'` cuando el archivo es `UserProfile.tsx` funciona en la máquina del desarrollador y **falla solo en producción**. Con kebab-case hay una única grafía válida y siempre en minúsculas, así que el error no se puede introducir.
2. **La regla queda sin excepciones.** Antes había que recordar "componentes en Pascal, lógica en kebab". Ahora: *todo archivo es kebab-case*. Menos que recordar, menos que discutir en revisión.
3. Es la convención mayoritaria en `sitio-web`, la app pública y la de más features.

El **identificador** sigue siendo `PascalCase`: archivo `tabla-usuarios.tsx` → componente `TablaUsuarios`. Es lo mismo que ya se hace con los hooks (`use-pagina.ts` → `usePagina()`).

### 4.4 Código compartido: `packages/editor-core/`

Ya estaba decidido en §4.4 de la guía ("`editor-core/` — PLANEADO"), con la regla: *algo va a `packages/` solo si ambos frontends lo necesitan con el mismo comportamiento*. Aquí se detalla el alcance.

**Duplicación medida hoy** entre `3000-sitio-web/src/features/paginas/` e `3001-intranet/src/features/paginas/`: `client-puck-render`, `edit-button`, `editorjs-wrapper`, `image-uploader-field`, `puck-editor-wrapper`, `use-pagina`, `page-seeds`.

**Consecuencia ya observable de esa duplicación:** la etapa de revisión (`revision-queue-view`, `use-revision-queue`) **solo existe en `sitio-web`**. La intranet no tiene gobernanza. Es exactamente la divergencia que la regla de `packages/` busca evitar.

| Qué se comparte | Qué NO se comparte |
|---|---|
| `model/` (tipos y transiciones de estado) | `config/puck.config.tsx` — el catálogo de bloques es distinto por app |
| Los tres servicios (parametrizados por cliente HTTP) | El sistema de diseño (`shared/ui`) — cada frontend tiene identidad visual propia |
| El *shell* del editor (wrappers de Puck y Editor.js, uploader) | Las rutas (`app/`) |
| Los hooks del ciclo (`use-pagina`, `use-revision-queue`) | Los bloques concretos — cada app tiene los suyos en su propio `shared/lib/blocks/`; `@olo/blocks-renderer` solo aporta primitivos de maquetación y tipos de plantilla |

El editor recibe su `config` **por prop**; así el shell es común y el catálogo sigue siendo de cada app.

### 4.5 Bloques de Acción en Puck: Separación Canvas vs. Barra Lateral (Sidebar)

Con la integración de herramientas de ingesta de datos en el editor visual (caso de referencia: `ImportadorExcelBloque` para el Observatorio Laboral), se establece una regla arquitectónica estricta para bloques con interactividad o carga de archivos:

#### Regla 1: La interacción pesada y subida de archivos vive en el Sidebar, nunca en el Canvas
- **El Canvas es exclusivamente para representación visual:** Los componentes renderizados en el lienzo de Puck representan lo que el usuario final verá, o una tarjeta indicativa de estado en modo borrador. No deben contener formularios de subida complejos ni botones de acción transaccional directa, ya que los eventos del DOM (`click`, `dragover`) interfieren con la selección, arrastre y reordenamiento de bloques de Puck.
- **Los controles de mutación residen en Custom Fields:** Cualquier lógica de selección de archivos (`<input type="file">`), drag & drop de subida y llamadas HTTP a endpoints de ingesta (como `/api/observatorio/importar`) se implementa como un campo de formulario en la barra lateral del bloque (`puck.config.tsx` -> `fields.<campo>.type = 'custom'` -> `render: ({ value, onChange }) => <ImportadorExcelUploaderField ... />`).

#### Regla 2: Separación estricta de contextos visuales y estilos
- **No importar componentes ni estilos de la Intranet en el Sitio Web:** Cada aplicación posee su propia paleta y sistema de diseño. Los bloques del `sitio-web` deben emplear las clases y tokens institucionales del portal público, eliminando clases innecesarias (como estilos `dark:` heredados de la intranet si no forman parte del tema público).
- **Enfoque de responsabilidad única:** Si un bloque tiene un propósito único (ej. ingesta de estadísticas del Observatorio), su esquema de props debe ser limpio y no incluir campos redundantes de títulos o descripciones editables que desvíen la atención del flujo de datos.

---

## 5. Plan de migración por fases


Cada fase deja el proyecto compilable y verificable, según la regla 2 de `4-reglas.md`.

### 5.0 Dónde está esto realmente — verificado el 2026-08-21

Hay que ser honestos con el estado: **este plan no se ejecutó**. El proyecto siguió
avanzando por otro lado —secciones creables y eliminables, revalidación real,
límites de tasa, política de subida compartida— y la reorganización interna de
`paginas/` se quedó donde estaba. Además la intranet se reestructuró **de verdad**, pero
por un camino distinto al que describe la fase 4, así que esa fase hay que releerla
antes de aplicarla.

| Fase | Qué pedía | Estado |
|---|---|---|
| 1 | Partir `paginas.service.ts` en tres | ✅ Cerrada el 2026-09-18, en cuatro (`publicacion`, `edicion`, `revision`, `secciones`) |
| 2 | Repartir componentes y hooks por etapa | ✅ Cerrada el 2026-09-18, con subcarpetas por tipo dentro de cada etapa (§3.2) |
| 3 | Extraer `model/` | ✅ Cerrada el 2026-09-18, sin `estado.ts` (§3.2 explica por qué) |
| 4 | Alinear la intranet | ✅ Cerrada el 2026-09-18. Ver abajo |
| 5 | Todo a kebab-case | ✅ Cerrada el 2026-09-16. 72 archivos renombrados, 102 referencias reescritas, cero archivos en PascalCase |
| 6 | Extraer `packages/editor-core` | ❌ Sin empezar — aunque `packages/` creció a siete paquetes por otros motivos |

> **Actualización 2026-09-18.** Las fases 1 a 4 se hicieron el mismo día: primero en el
> sitio y después en la intranet, que quedó con el mismo árbol salvo `revision/`. El
> párrafo siguiente es el diagnóstico de agosto, y se deja porque explica por qué había
> que hacerlo. Lo que describe ya no es cierto: `paginas.service.ts` ya no existe.

**Lo que sí sigue siendo cierto es el diagnóstico.** El síntoma del §2.1 —tres públicos
incompatibles en un archivo, dos transportes distintos— no solo persiste: el archivo
creció. Hoy `paginas.service.ts` exporta también `crearSeccion`, `eliminarSeccion`,
`analizarEliminacion` y `permisosDeLaSesion`, y todo eso sale por el mismo `index.ts`
que `obtenerPaginaInicio`. La única razón de que no haya causado un incidente es que
nadie se ha equivocado todavía.

Si hay que elegir por dónde empezar, **la fase 1 sigue siendo el mejor primer paso**:
riesgo bajo, `index.ts` absorbe el movimiento, y es la que convierte la frontera de
seguridad en estructura en vez de en disciplina.

### Fase 1 — Partir el servicio de `paginas` (`sitio-web`)

**Riesgo: bajo.** `index.ts` absorbe el movimiento; ningún consumidor externo se entera.

1. Crear `publicacion/publicacion.service.ts` con `obtenerPagina` y `obtenerPaginaInicio` (transporte `fetch` + ISR).
2. Crear `edicion/edicion.service.ts` con `obtenerPaginaEditable`, `guardarBorrador`, `enviarARevision`.
3. Crear `revision/revision.service.ts` con `listarEnRevision`, `aprobarPagina`, `rechazarPagina`.
4. Mover la instancia de `axios` a `shared/lib/api-client.ts` (hoy se declara dentro del servicio).
5. Actualizar `index.ts`. Borrar `services/paginas.service.ts`.

**Verificación:** `npx tsc --noEmit`, `npx eslint .`, `npm run build`.

### Fase 2 — Mover componentes y hooks a su etapa (`sitio-web`)

**Riesgo: bajo-medio.** Solo cambian rutas de import internas.

Repartir según §3.2. Eliminar `page-renderer.tsx`, que ya está marcado `@deprecated` y reemplazado por `<Render>` de Puck — previa confirmación de que no queda ningún consumidor.

### Fase 3 — Extraer `model/` (`sitio-web`)

Separar `types.ts` en `model/pagina.types.ts` y `model/estado.ts`. En `estado.ts`, además de `EstadoPagina`, declarar explícitamente las transiciones válidas del §1, para que el diagrama viva en el código y no solo en este documento.

### Fase 4 — Alinear la intranet — ✅ cerrada el 2026-09-18

**Riesgo: medio.** Muchos renombres. Es donde más deuda se acumuló: de las tres decisiones del §4, la intranet se desvió en las tres.

#### Lo que pasó de verdad

La intranet **pasó de siete features a dos**, y no por este plan sino por un cambio de
producto: cuando todas las secciones pasaron a leerse de la base de datos y a editarse
con Puck, las features que existían para pintarlas a mano (`inicio/`, `encuestas/`,
`matriz/`, `tasa/`) se quedaron sin nada que hacer y se borraron. Con ellas se fueron
`InicioView`, `MatrizView`, `TasaView` y compañía, que llevaban meses anotadas como
«pendientes de borrar» por la regla 5 de `4-reglas.md`.

Estado hoy — 2 features:

| Feature | Carpetas | Qué es |
|---|---|---|
| `paginas/` | `model/ publicacion/ edicion/ secciones/ menu-y-pie/ index.ts client.ts` | La gemela de `3000-sitio-web/src/features/paginas/`, con el mismo árbol (§3.2) salvo `revision/`. Se llamó `gestor-secciones/` hasta el 2026-09-18 |
| `login/` | `services/ components/ hooks/ index.ts` | Absorbió a `auth/`: el hook `use-auth` y `auth.service.ts` viven aquí junto a las ocho vistas del flujo |

Traducido a los pasos originales:

| Paso | Qué pedía | Estado |
|---|---|---|
| 1 | Crear los `index.ts` que faltaban | ✅ Hecho, y sigue en pie: ningún archivo de `app/` importa rutas internas |
| 2 | `ui/` → `components/` | ✅ Hecho — las dos features usan `components/` |
| 4 | Fusionar `login/` y `auth/` | ✅ Hecho, **en la dirección contraria**: sobrevivió `login/`, no `auth/`. Da igual cuál gane; lo que importaba era que dejaran de ser dos |
| 3 | `api/` → `services/` | ✅ Hecho el 2026-09-18. `paginas.api.ts` no pasó a un `paginas.service.ts` único sino que se partió por etapa, como en el sitio |
| 5 | Aplicar §3.2 a `paginas/` | ✅ Hecho el 2026-09-18 |

#### Cómo se cerró

**El nombre: `paginas/`, en las dos.** La feature se había renombrado a
`gestor-secciones/` fuera del plan. El nombre describía bien lo que hace, pero rompía la
simetría con su gemela del sitio. Se eligió `paginas/` porque es el nombre que ya usan
el sitio, `use-cases/paginas/` en la API y la tabla `paginas`, así que renombrar la
intranet tocaba una sola carpeta y renombrar el resto tocaba tres capas.

**El árbol, con las mismas decisiones que en el sitio:**

- `types/editor.types.ts` → `model/pagina.types.ts`. Sin `model/estado.ts`, por lo mismo
  que en el sitio. Las props de `PuckEditorWrapper` y `EditorJsWrapper` pasaron a su
  propio componente: estaban en `model/` e importaban `Rechazo` de un componente del
  editor, que es justo lo que prohíbe la regla 1.
- `paginas.api.ts` se partió en `publicacion/services/`, `edicion/services/` y
  `secciones/services/`. `publicacion/` usa el mismo `apiClient` con sesión que el resto,
  porque la intranet no tiene zona pública (la regla 3 no aplica aquí).
- `lib/ruta-de-vuelta.ts` → `model/rutas.ts`, que ahora concentra la regla URL ↔ slug.
  El rastreador y el botón flotante tenían cada uno su copia. Además, `slugDeOrigen` no
  unía los segmentos con `-`: al abrir «Menú y pie» desde
  `/encuestas/calidad-de-formacion` pedía el slug `encuestas/calidad-de-formacion`, que
  no existe.
- `lib/plantilla.ts` y `components/marco-secciones.tsx` → `menu-y-pie/`.
- `client.ts`, segunda puerta, para la barra de navegación, que es un bloque de
  `puck.config` y leía el índice de búsqueda directo de `api/paginas.api.ts`.
- Se borraron los mismos cuatro botones sin uso que en el sitio, con sus estilos
  `.edit-button*`.

La etapa `revision/` no se crea vacía: llega en la fase 6, junto con la lógica que la
llena.

**Qué se exporta y qué no.** En `login/`, el `index.ts` exporta solo lo que `app/` enruta.
`QuestionPicker` y `AuthSuccessScreen` siguen deliberadamente sin exportar: son piezas
que componen otras vistas, no puntos de entrada. La puerta pública de un módulo es la
lista de lo que otros pueden usar, no un volcado de todo lo que contiene.

**Verificación:** `npx tsc --noEmit`, `npx eslint .`, `npm run build` dentro de `3001-intranet/`.

### Fase 5 — Unificar nombres de archivo a kebab-case — ✅ cerrada el 2026-09-16

**Riesgo: medio, y era el paso más delicado en Windows.**

Se renombraron **72 archivos** y se reescribieron **102 referencias** en 31 archivos. El
alcance real fue mayor que los ~45 previstos el 2026-08-21, porque el recuento original
solo miraba los frontends:

| Dónde | Cuántos | Nota |
|---|---|---|
| `3001-intranet/src/features/login/components/` | 8 | Las vistas del flujo de acceso |
| `*/src/shared/lib/blocks/` (las dos apps) | 28 | Los bloques Puck. El **nombre de archivo** cambió; la **clave del componente** en la config de Puck **no** — el JSON guardado lleva `type: "TasaVideo"` dentro |
| `*/src/shared/ui/` (las dos apps) | 7 | `GooLoader`, `RouteTransition`, `Carousel`, `PasswordField`… |
| `4000-api-backend/src/infrastructure/db/models/` | 20 | No estaban en el recuento original, pero §1 de convenciones dice «todo archivo» sin excepción |
| `packages/blocks-renderer/` | 1 | `ResaltadorDeBusqueda` |

**Cómo se verificó**, en este orden: `tsc --noEmit` en los cuatro proyectos, `eslint` en
las dos apps (0 errores), `npm run build` de producción en ambas —que es donde aparecería
el fallo de mayúsculas— y los cinco scripts de verificación del backend
(`db:`, `propiedad:`, `permisos:`, `auditoria:`, `ambito:verificar`), que importan los
modelos renombrados. Además se comprobó que el diff de los dos `puck.config.tsx`
**solo** contiene líneas de `import`: ninguna clave de bloque cambió.

**La trampa de los bloques merece un aviso propio, y sigue vigente aunque la fase esté
cerrada** — vale para cualquier retoque futuro sobre un bloque. Renombrar `TasaVideo.tsx`
a `tasa-video.tsx` es inofensivo, y es lo que se hizo. Renombrar la clave con la que se registra en
`puck.config.tsx` **no**: el contenido ya guardado en `paginas_versiones` lleva
`type: "TasaVideo"` escrito dentro, y el renderizador devuelve `null` ante un tipo
desconocido en un punto y revienta en otro. Lo que el funcionario lee en el editor es el
`label`, no la clave: se cambian etiquetas, no claves. Si alguna vez hace falta cambiar
una clave, es una migración sobre `paginas_versiones` — y esa migración tiene que
filtrar por `ambito`, porque los dos frontends comparten nombres de bloque sin compartir
el tipo de sus campos (pasó con la 015 y lo reparó la 018).

Git en Windows no detecta por defecto un cambio que solo altera mayúsculas. Cada renombre
se hizo con `git mv` explícito en dos pasos, que es lo que hay que repetir para cualquier
renombre futuro:

```
git mv InicioView.tsx tmp-inicio-view.tsx
git mv tmp-inicio-view.tsx inicio-view.tsx
```

Se hizo así, y **no** tocando `git config core.ignorecase`: el repo sigue en `true`. Los
dos pasos bastan, son locales al renombre y no cambian cómo se comporta Git en la máquina
de nadie más.

### Fase 6 — Extraer `packages/editor-core/`

**Riesgo: alto. Es una decisión de arquitectura, no un refactor mecánico. No abordar hasta que las fases 1 a 5 estén cerradas y verificadas.**

Al terminar, la intranet hereda la etapa `revision/` que hoy no tiene, cerrando RF-05/RF-06 en las dos apps.

**Sigue sin empezar, pero el terreno cambió a favor.** `packages/` pasó de un paquete a
siete (`blocks-renderer`, `accessibility-policy`, `password-policy`, `email-policy`,
`slug-policy`, `upload-policy`, `inactividad`), y ninguno de ellos es `editor-core`. Eso
importa por dos motivos:

- **El patrón ya está probado.** Se sabe cómo se declara un paquete, cómo lo consumen
  las tres apps y qué gana el proyecto: cada uno de esos siete existe porque una regla
  escrita dos veces se desincronizó una vez. `upload-policy` es el caso más claro — el
  endurecimiento de la subida se aplicó a la intranet y el sitio se quedó sin **ninguno**
  de los cinco controles durante meses, hasta que la política pasó a ser una sola copia.
- **La duplicación de `paginas/` no bajó, se movió.** Los archivos duplicados entre las
  dos apps siguen ahí (`client-puck-render`, `puck-editor-wrapper`,
  `image-uploader-field`, `editorjs-wrapper`, `use-pagina`, `page-seeds`) y se les
  sumaron los nuevos: crear y eliminar sección, menú y pie, ruta de vuelta, candado.
  Cada funcionalidad nueva del editor se escribe dos veces. Desde el 2026-09-18, con las
  dos features alineadas (fase 4), la lista exacta sale de comparar los dos árboles:
  **22 archivos están en la misma ruta en las dos apps**. Es el inventario de partida
  de esta fase.

Y la divergencia que la regla buscaba evitar sigue exactamente donde estaba: **la cola de
revisión existe solo en `sitio-web`** (`app/admin/revision/`, que ya distingue
ámbito y abre la vista previa contra la intranet). La intranet no tiene gobernanza
propia; sus cambios se aprueban desde el panel del sitio.

---

## 6. Regla de oro para todo lo nuevo

> Cualquier dominio nuevo (`tendencias/`, `alertas/`, `programas/`, `directores/`, `identidad-visual/`…) se crea siguiendo §3.1.
> Si el dominio tiene estados con actores o permisos distintos, sigue §3.2.
> El nombre de archivo es siempre `kebab-case`; el identificador que exporta, `PascalCase`.
> Todo lo que otros módulos necesiten sale por `index.ts`, nunca por una ruta interna.

**Antes de crear un dominio nuevo, responde tres preguntas:**

1. ¿Tiene estados con actores distintos? → Si sí, carpetas por etapa (§3.2).
2. ¿Alguna de sus lecturas es pública y cacheable? → Si sí, esa lectura va en su propia carpeta, con transporte de servidor y sin credenciales.
3. ¿La intranet necesita lo mismo con el mismo comportamiento? → Si sí, va a `packages/`, no duplicado.

---

## 7. Pendientes conocidos

Registrados aquí para que no se pierdan; ninguno bloquea las fases anteriores.
Revisados uno a uno el 2026-08-21.

- ~~**`domain-events/` sigue siendo un stub.**~~ **Cerrado.** `contenido-publicado`
  tiene sus dos oyentes cableados y `aprobarPagina` lo emite de verdad — ver §1.3.
  Quedan sin cablear `enviado-a-revision`, `contenido-rechazado` y
  `usuario-caducado`, más el oyente `notificar-editor`. La auditoría de RF-07 **no**
  pasa por aquí: se resolvió por otro camino (`shared/auditoria-*`), así que ese
  argumento del pendiente original ya no aplica.
- **La intranet no tiene etapa de revisión.** Sigue igual. Se resuelve en la fase 6.
- ~~**`page-renderer.tsx` está deprecado** en las dos apps y aún presente.~~
  **Cerrado:** no queda en ninguna de las dos.
- **`3000-sitio-web/src/shared/lib/dashboard.ts`** sigue siendo un re-export de
  `features/administracion/auth/services/dashboard.service.ts` que nadie importa. Su
  propio comentario dice que espera confirmación para borrarse; lleva esperando lo
  suficiente como para que la respuesta sea que sí.
- **`3000-sitio-web/src/features/auditoria/` es código muerto.** Duplica
  `features/administracion/auditoria/`, que es la que se usa, y **ningún archivo la
  importa**. Es la misma clase de residuo que `dashboard.ts` pero de una feature
  entera: `components/` y `services/`. Borrarla es seguro; comprobarlo cuesta un
  `grep`.
- **Prettier y Husky + lint-staged siguen sin instalar**, pese a que el checklist de
  convenciones §9 los da por hechos. Ningún `package.json` los declara y no hay `.husky/`.
- ~~**`gestor-secciones/` (intranet) y `paginas/` (sitio) son la misma feature con dos
  nombres.**~~ Resuelto el 2026-09-18: las dos se llaman `paginas/` (fase 4).
