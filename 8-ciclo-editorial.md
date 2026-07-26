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

### 1.2 La invariante que sostiene todo

> **Lo que ve el ciudadano solo cambia en el paso 4.**

Toda decisión de diseño de este documento existe para hacer esa invariante difícil de romper por accidente.

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

**Duplicación medida hoy** entre `sitio-web/src/features/paginas/` e `intranet/src/features/paginas/`: `client-puck-render`, `edit-button`, `editorjs-wrapper`, `image-uploader-field`, `page-renderer`, `puck-editor-wrapper`, `use-pagina`, `page-seeds`.

**Consecuencia ya observable de esa duplicación:** la etapa de revisión (`revision-queue-view`, `use-revision-queue`) **solo existe en `sitio-web`**. La intranet no tiene gobernanza. Es exactamente la divergencia que la regla de `packages/` busca evitar.

| Qué se comparte | Qué NO se comparte |
|---|---|
| `model/` (tipos y transiciones de estado) | `config/puck.config.tsx` — el catálogo de bloques es distinto por app |
| Los tres servicios (parametrizados por cliente HTTP) | El sistema de diseño (`shared/ui`) — cada frontend tiene identidad visual propia |
| El *shell* del editor (wrappers de Puck y Editor.js, uploader) | Las rutas (`app/`) |
| Los hooks del ciclo (`use-pagina`, `use-revision-queue`) | Los bloques concretos (ya viven en `@olo/blocks-renderer`) |

El editor recibe su `config` **por prop**; así el shell es común y el catálogo sigue siendo de cada app.

---

## 5. Plan de migración por fases

Cada fase deja el proyecto compilable y verificable, según la regla 2 de `4-reglas.md`.

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

### Fase 4 — Alinear la intranet

**Riesgo: medio.** Muchos renombres. Es donde más deuda se acumuló: de las tres decisiones del §4, la intranet se desvió en las tres.

Estado real — 7 features:

| Feature | Carpetas actuales | Desvíos pendientes |
|---|---|---|
| `auth/` | `api/ hooks/ index.ts` | `api/` → `services/` |
| `paginas/` | `api/ components/ hooks/ lib/ types/ index.ts` | `api/` → `services/`; falta §3.2 |
| `login/` | `ui/ index.ts` | `ui/`; es el mismo dominio que `auth/` |
| `inicio/` | `ui/ index.ts` | `ui/` |
| `encuestas/` | `ui/ index.ts` | `ui/` |
| `matriz/` | `ui/ index.ts` | `ui/` |
| `tasa/` | `ui/ index.ts` | `ui/` |

Pasos:

1. **~~Crear el `index.ts` que falta~~ — HECHO.** Se crearon los cinco (`login`, `inicio`, `encuestas`, `matriz`, `tasa`) y se reescribieron los 15 imports de `app/` que alcanzaban rutas internas. Este paso va primero a propósito: es el único que **no renombra nada**, así que no arrastra el costo de la fase 5, y una vez hecho los pasos siguientes dejan de tocar `app/` — cada `index.ts` absorbe el movimiento interno. Eso baja el riesgo del resto de la fase de medio a bajo.
2. **`ui/` → `components/`** en `login`, `inicio`, `encuestas`, `matriz`, `tasa` (§4.1). Ahora es un cambio interno de cada feature: solo se actualiza su propio `index.ts`.
3. **`api/` → `services/`** en `auth` y `paginas`, con los archivos: `auth.api.ts` → `auth.service.ts`, `paginas.api.ts` → `paginas.service.ts` (§4.2).
4. **Fusionar `login/` dentro de `auth/`.** Son un mismo dominio partido por tipo técnico: `auth/` tiene el hook y el cliente HTTP, `login/` tiene las ocho vistas del flujo. La guía §4.3 ya describe `auth/` como *"flujo completo: login, recovery, first-login, security-questions"* — es el disco el que se desvió, no el documento. Las vistas pasan a `auth/components/` y `features/login/index.ts` desaparece.
5. **Aplicar §3.2 a `paginas/`**: `types/editor.types.ts` → `model/pagina.types.ts` + `model/estado.ts`; `lib/page-seeds.ts` → `edicion/page-seeds.ts`; el resto de `components/` y `hooks/` se reparte entre `publicacion/` y `edicion/`. La etapa `revision/` no se crea vacía: llega en la fase 6, junto con la lógica que la llena.

**Qué se exporta y qué no.** Los `index.ts` nuevos exportan solo lo que `app/` enruta. `RecursosVisuales`, `QuestionPicker` y `AuthSuccessScreen` quedan deliberadamente sin exportar: son piezas que componen otras vistas, no puntos de entrada. La puerta pública de un módulo es la lista de lo que otros pueden usar, no un volcado de todo lo que contiene.

**Verificación:** `npx tsc --noEmit`, `npx eslint .`, `npm run build` dentro de `intranet/`.

### Fase 5 — Unificar nombres de archivo a kebab-case

**Riesgo: medio, y es el paso más delicado en Windows.**

Git en Windows no detecta por defecto un cambio que solo altera mayúsculas. Cada renombre debe hacerse con `git mv` explícito, en dos pasos si es necesario:

```
git mv InicioView.tsx tmp-inicio-view.tsx
git mv tmp-inicio-view.tsx inicio-view.tsx
```

Alternativa recomendada: activar `git config core.ignorecase false` en el repo antes de empezar la fase.

### Fase 6 — Extraer `packages/editor-core/`

**Riesgo: alto. Es una decisión de arquitectura, no un refactor mecánico. No abordar hasta que las fases 1 a 5 estén cerradas y verificadas.**

Al terminar, la intranet hereda la etapa `revision/` que hoy no tiene, cerrando RF-05/RF-06 en las dos apps.

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

- **`domain-events/` sigue siendo un stub.** La revalidación del paso 4 (ISR + Redis) y la auditoría de RF-07 dependen de cablearlo a los use-cases de páginas.
- **La intranet no tiene etapa de revisión.** Se resuelve en la fase 6.
- **`page-renderer.tsx` está deprecado** en las dos apps y aún presente.
- **`sitio-web/src/shared/lib/dashboard.ts`** es una copia de `features/administracion/services/dashboard.service.ts` que nadie importa; hoy es un re-export a la espera de confirmación para borrarse.
- **Prettier y Husky + lint-staged no están instalados**, pese a que el checklist de convenciones §9 los da por hechos.
