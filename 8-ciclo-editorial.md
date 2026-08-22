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
| 1 | **Edición** | Editor | Entra a `/editor/<slug>`, modifica bloques. Al guardar, la API crea o actualiza un registro en `PaginaVersion` con estado `borrador`. | **Ninguno.** Sigue mostrando la versión publicada. |
| 2 | **Envío a revisión** | Editor | La versión pasa a `en_revision`. Queda bloqueada para edición. | Ninguno. |
| 3 | **Revisión** | Administrador | Entra a `/revision`, previsualiza y decide. | Ninguno. |
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
las demás seguirían sirviendo lo viejo. Hoy no aplica —`docker-compose.prod.yml` levanta
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

---

## 2. La regla de oro

> **Un dominio con ciclo de vida se organiza por etapas del ciclo, no por tipo técnico de archivo.**
>
> Un dominio sin ciclo de vida se organiza por tipo técnico.

### 2.1 Por qué

Organizar por tipo técnico (`components/`, `hooks/`, `services/`) funciona mientras el dominio es plano. En cuanto el dominio tiene etapas con **públicos, permisos y políticas de caché distintos**, agrupar por tipo mezcla cosas que no deben tocarse entre sí.

El síntoma real, hoy, en `sitio-web/src/features/paginas/services/paginas.service.ts`: un solo archivo contiene tres públicos incompatibles.

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

Ejemplos actuales que ya siguen esta forma: `administracion/`, `contenidos/`, `buscador-ocupaciones/`.

### 3.2 Dominio con ciclo de vida (`paginas/`)

```
features/paginas/
├── index.ts                        # ÚNICA puerta pública del módulo (§0.3)
│
├── model/                          # vocabulario compartido por las tres etapas
│   ├── pagina.types.ts             # Pagina, PaginaVersion, Bloque, PuckData
│   └── estado.ts                   # EstadoPagina + transiciones válidas
│
├── publicacion/                    # ETAPA 6 — consumo público
│   ├── publicacion.service.ts      # fetch + ISR, SIN credenciales
│   ├── client-puck-render.tsx
│   └── home-fallback-data.ts
│
├── edicion/                        # ETAPA 1 — borrador
│   ├── edicion.service.ts          # obtenerPaginaEditable, guardarBorrador, enviarARevision
│   ├── use-pagina.ts
│   ├── puck-editor-wrapper.tsx
│   ├── editorjs-wrapper.tsx
│   ├── image-uploader-field.tsx
│   ├── page-seeds.ts
│   └── edit-button.tsx
│
└── revision/                       # ETAPAS 3 a 5 — gobernanza
    ├── revision.service.ts         # listarEnRevision, aprobarPagina, rechazarPagina
    ├── use-revision-queue.ts
    └── revision-queue-view.tsx
```

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

**Duplicación medida hoy** entre `sitio-web/src/features/paginas/` e `intranet/src/features/paginas/`: `client-puck-render`, `edit-button`, `editorjs-wrapper`, `image-uploader-field`, `puck-editor-wrapper`, `use-pagina`, `page-seeds`.

**Consecuencia ya observable de esa duplicación:** la etapa de revisión (`revision-queue-view`, `use-revision-queue`) **solo existe en `sitio-web`**. La intranet no tiene gobernanza. Es exactamente la divergencia que la regla de `packages/` busca evitar.

| Qué se comparte | Qué NO se comparte |
|---|---|
| `model/` (tipos y transiciones de estado) | `config/puck.config.tsx` — el catálogo de bloques es distinto por app |
| Los tres servicios (parametrizados por cliente HTTP) | El sistema de diseño (`shared/ui`) — cada frontend tiene identidad visual propia |
| El *shell* del editor (wrappers de Puck y Editor.js, uploader) | Las rutas (`app/`) |
| Los hooks del ciclo (`use-pagina`, `use-revision-queue`) | Los bloques concretos — cada app tiene los suyos en su propio `shared/lib/blocks/`; `@olo/blocks-renderer` solo aporta primitivos de maquetación y tipos de plantilla |

El editor recibe su `config` **por prop**; así el shell es común y el catálogo sigue siendo de cada app.

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
| 1 | Partir `paginas.service.ts` en tres | ❌ Sin empezar. El archivo sigue siendo uno solo, con los tres públicos dentro |
| 2 | Repartir componentes y hooks por etapa | ❌ Sin empezar. `paginas/` sigue con `components/ hooks/ services/ lib/ types.ts` |
| 3 | Extraer `model/` | ❌ Sin empezar |
| 4 | Alinear la intranet | 🟡 Ocurrió otra cosa: pasó de 7 features a 2. Ver abajo |
| 5 | Todo a kebab-case | 🟡 Parcial. Quedan las ocho vistas de `login/components` de la intranet y casi todos los bloques Puck de las dos apps |
| 6 | Extraer `packages/editor-core` | ❌ Sin empezar — aunque `packages/` creció a siete paquetes por otros motivos |

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

### Fase 4 — Alinear la intranet — 🟡 la mitad ocurrió, por otro camino

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
| `gestor-secciones/` | `api/ components/ hooks/ lib/ types/ index.ts` | El antiguo `paginas/`, renombrado. Todo el editor: Puck, uploaders, botones de crear/eliminar sección, y `MarcoSecciones` |
| `login/` | `api/ components/ hooks/ index.ts` | Absorbió a `auth/`: el hook `use-auth` y `auth.api.ts` viven aquí junto a las ocho vistas del flujo |

Traducido a los pasos originales:

| Paso | Qué pedía | Estado |
|---|---|---|
| 1 | Crear los `index.ts` que faltaban | ✅ Hecho, y sigue en pie: ningún archivo de `app/` importa rutas internas |
| 2 | `ui/` → `components/` | ✅ Hecho — las dos features usan `components/` |
| 4 | Fusionar `login/` y `auth/` | ✅ Hecho, **en la dirección contraria**: sobrevivió `login/`, no `auth/`. Da igual cuál gane; lo que importaba era que dejaran de ser dos |
| 3 | `api/` → `services/` | ❌ Pendiente. Las dos features siguen con `api/` |
| 5 | Aplicar §3.2 a `paginas/` | ❌ Pendiente, ahora sobre `gestor-secciones/` |

**El renombre `paginas/` → `gestor-secciones/` no estaba en el plan y conviene decir qué
implica.** El nombre describe mejor lo que hace hoy —gestionar secciones, no solo
editarlas— pero rompe la simetría con `sitio-web/src/features/paginas/`, que es su
gemela y sigue llamándose así. La convención 8 de la guía dice que una feature se
organiza igual en las dos apps; llamarse igual es parte de eso. Hay que elegir un
nombre y usarlo en las dos, sobre todo si algún día se extrae `editor-core`.

#### Los pasos que quedan

Solo dos de los cinco originales, y los dos son internos a cada feature —su `index.ts`
absorbe el movimiento—, así que el riesgo de esta fase bajó de medio a bajo:

1. **`api/` → `services/`** en las dos features, con los archivos: `auth.api.ts` →
   `auth.service.ts`, `paginas.api.ts` → `paginas.service.ts` (§4.2). Recordar el motivo,
   que no es cosmético: `api/` colisiona con `app/api/`, que son los *route handlers* de
   Next. El proxy y el cliente que lo consume no deben compartir nombre.
2. **Aplicar §3.2 a `gestor-secciones/`**: `types/editor.types.ts` →
   `model/pagina.types.ts` + `model/estado.ts`; `lib/page-seeds.ts` →
   `edicion/page-seeds.ts`; el resto de `components/` y `hooks/` se reparte entre
   `publicacion/` y `edicion/`. La etapa `revision/` no se crea vacía: llega en la fase
   6, junto con la lógica que la llena.

**Qué se exporta y qué no.** Los `index.ts` exportan solo lo que `app/` enruta.
`QuestionPicker` y `AuthSuccessScreen` siguen deliberadamente sin exportar: son piezas
que componen otras vistas, no puntos de entrada. La puerta pública de un módulo es la
lista de lo que otros pueden usar, no un volcado de todo lo que contiene.

**Verificación:** `npx tsc --noEmit`, `npx eslint .`, `npm run build` dentro de `intranet/`.

### Fase 5 — Unificar nombres de archivo a kebab-case — 🟡 parcial

**Riesgo: medio, y es el paso más delicado en Windows.**

Lo que queda hoy en PascalCase, contado el 2026-08-21 — unos 45 archivos, y **no están
repartidos al azar**, lo que hace la fase más fácil de lo que el número sugiere:

| Dónde | Cuántos | Nota |
|---|---|---|
| `intranet/src/features/login/components/` | 8 | Las vistas del flujo de acceso. Es lo único que queda en PascalCase dentro de una feature; el resto de la intranet ya migró |
| `*/src/shared/lib/blocks/` (las dos apps) | ~28 | Los bloques Puck. Ojo: el **nombre de archivo** se puede cambiar, pero la **clave del componente** en la config de Puck no — el JSON guardado lleva `type: "TasaVideo"` dentro |
| `*/src/shared/ui/` (las dos apps) | ~7 | `GooLoader`, `RouteTransition`, `Carousel`, `PasswordField`… |

**La trampa de los bloques merece un aviso propio.** Renombrar `TasaVideo.tsx` a
`tasa-video.tsx` es inofensivo. Renombrar la clave con la que se registra en
`puck.config.tsx` **no**: el contenido ya guardado en `paginas_versiones` lleva
`type: "TasaVideo"` escrito dentro, y el renderizador devuelve `null` ante un tipo
desconocido en un punto y revienta en otro. Lo que el funcionario lee en el editor es el
`label`, no la clave: se cambian etiquetas, no claves. Si alguna vez hace falta cambiar
una clave, es una migración sobre `paginas_versiones` — y esa migración tiene que
filtrar por `ambito`, porque los dos frontends comparten nombres de bloque sin compartir
el tipo de sus campos (pasó con la 015 y lo reparó la 018).

Git en Windows no detecta por defecto un cambio que solo altera mayúsculas. Cada renombre debe hacerse con `git mv` explícito, en dos pasos si es necesario:

```
git mv InicioView.tsx tmp-inicio-view.tsx
git mv tmp-inicio-view.tsx inicio-view.tsx
```

Alternativa recomendada: activar `git config core.ignorecase false` en el repo antes de empezar la fase.

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
  dos apps siguen ahí (`client-puck-render`, `edit-button`, `puck-editor-wrapper`,
  `image-uploader-field`, `editorjs-wrapper`, `use-pagina`, `page-seeds`) y se les
  sumaron los nuevos: `nueva-seccion-button`, `eliminar-seccion-button`,
  `aviso-seccion-nueva`, `plantilla-edit-button`, `plantilla.ts`, `ruta-de-vuelta.ts`.
  Cada funcionalidad nueva del editor se escribe dos veces.

Y la divergencia que la regla buscaba evitar sigue exactamente donde estaba: **la cola de
revisión existe solo en `sitio-web`** (`app/admin/(shell)/revision/`, que ya distingue
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
- **`sitio-web/src/shared/lib/dashboard.ts`** sigue siendo un re-export de
  `features/administracion/auth/services/dashboard.service.ts` que nadie importa. Su
  propio comentario dice que espera confirmación para borrarse; lleva esperando lo
  suficiente como para que la respuesta sea que sí.
- **`sitio-web/src/features/auditoria/` es código muerto.** Duplica
  `features/administracion/auditoria/`, que es la que se usa, y **ningún archivo la
  importa**. Es la misma clase de residuo que `dashboard.ts` pero de una feature
  entera: `components/` y `services/`. Borrarla es seguro; comprobarlo cuesta un
  `grep`.
- **Prettier y Husky + lint-staged siguen sin instalar**, pese a que el checklist de
  convenciones §9 los da por hechos. Ningún `package.json` los declara y no hay `.husky/`.
- **`gestor-secciones/` (intranet) y `paginas/` (sitio) son la misma feature con dos
  nombres.** Ver la fase 4.
