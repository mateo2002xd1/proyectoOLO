# Guía del Proyecto — OLO (SENA)

> Observatorio Laboral y Ocupacional. Documento de referencia de arquitectura: qué necesita el cliente, cómo se resuelve, cómo está arquitecturado el sistema y cómo se organiza el código.
>
> Reemplaza al antiguo `ARQUITECTURA_MAESTRA_OLO.md`. Si encuentras una referencia a ese nombre en el código o en otro documento, apunta aquí.

---

## 1. Necesidad del cliente

El Observatorio Laboral y Ocupacional es una entidad que gestiona **datos del mercado laboral y la empleabilidad**, información que cambia constantemente. Por eso el portal no puede ser un sitio estático mantenido por desarrolladores: necesita que **el propio equipo del OLO edite y reorganice el contenido** sin intervención técnica.

La necesidad central, en sus propias palabras traducidas a requisitos:

- El sitio parte de un **diseño base institucional** (identidad SENA, directrices MinTIC, colores, tipografía, accesibilidad).
- Sobre ese diseño base, los editores deben poder **reorganizar la maqueta, agregar nuevas secciones y reutilizar componentes** (átomos, moléculas, organismos) — siempre **respetando la identidad visual y las directrices**. No es edición libre sin reglas: es **composición controlada dentro de un sistema de diseño institucional**.
- Debe existir un **flujo de gobernanza**: los editores proponen, un administrador aprueba, y solo entonces el contenido se publica.
- El sitio público es abierto; existe además una **intranet privada** para directores y subdirectores con información estratégica.

### Requerimientos funcionales (17)

| # | Requerimiento | Norma / Nota |
|---|---|---|
| RF-01 | Crear, editar, publicar y despublicar contenidos (estudios, informes, estadísticas, banners) desde el panel, sin desarrolladores | — |
| RF-02 | Cargar y gestionar documentos (PDF, xlsx, JPG, PNG, SVG) con validación de tipo y tamaño configurable, más enlaces de video/Power BI | — |
| RF-03 | Configurar tipografías, colores institucionales y elementos de marca desde el panel | Manual de identidad SENA |
| RF-04 | Crear, configurar y asignar roles (editores, visitantes internos); Administrador con control total | RBAC |
| RF-05 | Restringir al Editor la publicación directa; visitantes solo visualizan | — |
| RF-06 | Flujo de aprobación: contenido de Editor pasa a "En revisión" hasta que el Administrador apruebe | — |
| RF-07 | Historial de cambios por contenido: usuario, campos modificados, fecha y hora | — |
| RF-08 | Insertar tableros Power BI y analítica mediante contenedores configurables desde el CMS, sin código | — |
| RF-09 | Buscador de ocupaciones basado en CNO con correlación CUOC, consultando en línea la BD del OLO | Fuente externa |
| RF-10 | Buscador interno que filtra contenidos | — |
| RF-11 | Navegación jerárquica: cualquier contenido en máximo 3 clics desde el inicio | — |
| RF-12 | Descarga directa de documentos publicados sin registro ni autenticación | — |
| RF-13 | Aviso de privacidad con aceptación explícita en formularios que recopilen datos personales | Ley 1581/2012 |
| RF-14 | Accesibilidad para discapacidad visual: lectores de pantalla y alto contraste | Resolución 1519/2020 |
| RF-15 | Espacio exclusivo para directores: visualizar y descargar información interna del OLO | — |
| RF-16 | Autenticación (usuario/contraseña) para todos los roles; fecha de caducidad para todos excepto el administrador | — |
| RF-17 | Respaldos automáticos periódicos de la BD con frecuencia configurable | — |

---

## 2. Solución implementada

Una plataforma de **tres capas** bajo un modelo **CMS headless con composición visual**:

- **Dos capas frontend** (Next.js) en puertos distintos, cada una con su propia identidad visual y su propio despliegue:
  - **Sitio web público** (`:3000`): páginas dinámicas abiertas + panel administrativo interno.
  - **Intranet** (`:3001`): 100% protegida, identidad visual propia, para directores/subdirectores.
- **Un backend API** (Express, `:4000`) que es la **única puerta de entrada a los datos**. Ningún frontend toca la base de datos, el filesystem ni Redis directamente: todo pasa por la API, que valida, autoriza y controla qué entra y sale.
- **Infraestructura**: PostgreSQL (datos), Redis (caché de páginas públicas + colas de trabajos), Nginx (reverse proxy + SSL en producción).

### Cómo la solución cubre la necesidad

| Necesidad | Cómo se resuelve |
|---|---|
| Editar sin desarrolladores | Editor visual (Puck) que compone páginas con un catálogo de bloques |
| Respetar el diseño institucional | El catálogo de bloques ES el sistema de diseño (átomos/moléculas/organismos); el editor solo puede componer con piezas que nosotros escribimos, así que la identidad SENA y la Res. 1519 se garantizan **en `shared/ui`, no en cada página**. La arquitectura lo hace posible; el estado real de la accesibilidad está auditado en `9-accesibilidad.md` §2 |
| Contenido siempre actualizado | Todo el contenido es dinámico (JSONB en Postgres), servido por la API |
| Gobernanza | Flujo `borrador → en revisión → publicado/rechazado`; solo el admin publica |
| Rendimiento con tráfico alto | Páginas públicas con ISR + revalidación on-demand al publicar; caché Redis en la API |
| Contenido descubrible | Modelo de contenido consultable (buscador + "Últimas publicaciones") separado de la maqueta |

### Modelo de contenido — decisión clave

El contenido editable se modela como **páginas Puck** (`Pagina`/`PaginaVersion`): la maqueta y composición visual. Pero los **estudios/informes/estadísticas/banners** también deben ser **descubribles** (aparecer en el buscador y en "Últimas publicaciones" del inicio), aunque el editor los coloque dentro de una página concreta.

Solución híbrida:

- **`Pagina` / `PaginaVersion`** → el lienzo editable (dónde va cada bloque). Estructura y layout.
- **`Contenido`** (el modelo `Post` reutilizado y renombrado) → cada estudio/informe como **registro independiente** con título, tipo, categoría, fecha, adjuntos. Buscable y listable.
- **Vínculo por referencia**: un bloque Puck que muestra un contenido guarda su **ID**, no una copia. Así el mismo estudio aparece en su página propia y en "Últimas publicaciones", y editarlo una vez lo actualiza en todos lados.

Esto habilita directamente RF-01, RF-07, RF-10 y RF-12 sin duplicar datos.

---

## 3. Arquitectura del sistema

### 3.1 Diagrama de capas

```
                         ┌────────────────────────────────────────┐
                         │              NAVEGADOR                  │
                         └───────────────┬────────────────────────┘
                        (público)        │        (privado, con auth)
                ┌────────────────────────┴───────────────────────┐
                ▼                                                 ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │   SITIO WEB  :3000         │                   │      INTRANET  :3001       │
   │   Next.js (App Router)     │                   │   Next.js (App Router)     │
   │   - Público (ISR)          │                   │   - 100% protegido         │
   │   - Panel admin            │                   │   - Identidad propia       │
   └────────────┬──────────────┘                   └────────────┬──────────────┘
                │                                                 │
                │      Ambos consumen SOLO vía HTTP la API        │
                └───────────────────────┬─────────────────────────┘
                                         ▼
                         ┌───────────────────────────────┐
                         │      API BACKEND  :4000         │
                         │      Express (Clean Arch)       │
                         │  Controla TODO lo que entra:    │
                         │  valida · autoriza · orquesta   │
                         └───┬───────────┬───────────┬─────┘
                             ▼           ▼           ▼
                     ┌────────────┐ ┌─────────┐ ┌──────────────┐
                     │ PostgreSQL │ │  Redis  │ │  Filesystem  │
                     │  (datos)   │ │ (caché+ │ │  (archivos:  │
                     │            │ │  colas) │ │  pdf/img/etc)│
                     └────────────┘ └─────────┘ └──────────────┘
```

### 3.2 Principio rector: el backend es la única puerta

Los frontends **nunca** acceden directo a Postgres, Redis o al filesystem. Todo pasa por la API, que es la que:

- **Valida** la entrada (esquemas Zod) antes de que nada toque la base de datos.
- **Autoriza** cada operación (JWT + RBAC + policies) — la firma del token solo se verifica aquí, nunca en el frontend.
- **Orquesta** los efectos secundarios (invalidar caché, encolar trabajos, registrar auditoría) vía eventos de dominio.
- **Controla el acceso a recursos**: base de datos (repositorios), archivos (storage/filesystem) y caché/colas (Redis).

Esto es lo que hace el sistema seguro y mantenible: hay **un solo lugar** donde se decide qué entra a los datos.

### 3.3 Flujo de datos — lectura pública (con caché)

```
Navegador → GET /pagina           (Sitio web :3000, Server Component)
   → fetch a la API /api/paginas/publica/:slug
      → API consulta Redis (cache lookup)
         · HIT  → devuelve JSON cacheado
         · MISS → consulta Postgres → guarda en Redis (TTL) → devuelve JSON
   → Next renderiza la página con los bloques (ISR)
   → HTML al navegador
```

### 3.4 Flujo de datos — edición y publicación (con gobernanza)

```
Editor edita en la mesa de trabajo (Puck, estado local Zustand)
   → autoguardado con debounce → API guarda BORRADOR (no toca lo público)
Editor envía a revisión
   → API cambia estado a "en_revision"
Administrador aprueba
   → API: borrador reemplaza la versión publicada
   → emite evento ContenidoPublicado
      → listener invalida caché Redis
      → listener dispara revalidación ISR del sitio público
      → listener registra auditoría (quién, qué, cuándo)
```

### 3.5 Stack por capa

| Capa | Tecnología | Puerto |
|---|---|---|
| Sitio web | Next.js 16 (App Router + Turbopack), React 19, TS 5, Tailwind 4, Puck 0.22 | 3000 |
| Intranet | Next.js 16, React 19, TS 5, Tailwind 4, Puck 0.22, Headless UI | 3001 |
| API | Express 5, Sequelize 6, TS 5, Zod, JWT (sign+verify), BullMQ | 4000 |
| Datos | PostgreSQL 16 | 5432 |
| Caché/Colas | Redis 7 (ioredis + BullMQ) | 6379 |
| Proxy | Nginx (SSL/TLS en prod) | 80/443 |
| Compartido | `@olo/blocks-renderer`, `@olo/editor-core` (planeado), `@olo/types` (planeado) | — |

---

## 4. Arquitectura de carpetado

Regla transversal a los tres proyectos: **dependencia en una sola dirección**.

```
app/  →  features/  →  shared/          (frontends)
routes/ → controllers/ → use-cases/ → repositories/ → infra   (backend)
```

`shared/` nunca importa de `features/`. `app/` nunca contiene lógica de negocio. En el backend, un `controller` nunca toca Sequelize directo — pasa por `use-case` → `repository`.

### 4.0 Anatomía interna de una feature

La regla de arriba define la arquitectura **entre** capas. La arquitectura **dentro** de una feature está definida en `8-ciclo-editorial.md` §3, y se resume así:

```
features/<dominio>/
├── index.ts        # ÚNICA puerta pública del módulo
├── components/     # UI del dominio          (nunca "ui/": ese nombre es del sistema de diseño)
├── hooks/          # estado y efectos
├── services/       # única capa que llama a la API  (nunca "api/": ese nombre es de app/api)
└── types.ts        # contratos del dominio
```

**Excepción — dominios con ciclo de vida.** Si el dominio tiene estados con **actores, permisos o políticas de caché distintos**, se organiza por etapa del ciclo en vez de por tipo técnico. El caso de referencia es `paginas/` (borrador → revisión → publicado), detallado en `8-ciclo-editorial.md` §3.2.

El motivo no es estético: agrupar por tipo técnico mete en un mismo archivo lecturas públicas cacheables y escrituras autenticadas, lo que hace fácil cachear por error una respuesta con credenciales. Separar por etapa convierte esa frontera en estructura y no en disciplina.

### 4.1 API Backend (`api-backend/`) Clean Architecture (arquitectura por capas con dependencia unidireccional)

Contenido del proyecto en capa `api-backend/`:

- **routes/** — solo define los endpoints (`router.get`, `router.post`). Cero lógica. Incluso las colas BullMQ (`job.routes.ts`) delegan a un controller — antes tenían el `try/catch` y las llamadas a Redis inline, violando esta regla.
- **controllers/** — traduce HTTP (req/res) a una llamada de use-case. No sabe de SQL. Un controller por dominio o sub-recurso: `pagina.controller.ts` (maqueta Puck), `contenido.controller.ts` (estudios/informes), `secciones.controller.ts`, `adjuntos.controller.ts`, `auditoria.controller.ts`, `usuarios.controller.ts`, `roles.controller.ts`, `permisos.controller.ts`, `role-permissions.controller.ts`, `sitio-users.controller.ts`, `security-questions.controller.ts`, `auth.controller.ts`, `trabajos.controller.ts` (BullMQ).
- **use-cases/** — la lógica de negocio real. Una acción = una función (`aprobarPagina`, `guardarBorrador`). Organizadas por dominio real, no por el modelo que tocan:
  - `paginas/` — gobernanza de la maqueta Puck: `guardar-borrador`, `enviar-a-revision`, `aprobar-pagina`, `rechazar-pagina`, `listar-en-revision`, `obtener-pagina-publica`. Todas pasan por `repositories/pagina.repository.ts` — antes tocaban `Pagina`/`PaginaVersion` (los modelos Sequelize) directo, sin repository, violando la regla de abajo.
  - `contenidos/` — estudios/informes y su soporte: `contenido.usecase.ts` (renombrado de `posts.usecase.ts`), `secciones.usecase.ts`, `adjuntos.usecase.ts`.
  - `usuarios/`, `auth/` — como antes.
- **repositories/** — única capa que toca Sequelize. Si cambias de ORM, solo tocas aquí. Incluye `pagina.repository.ts` (nuevo — cerraba el hueco de arriba) y `contenido.repository.ts` (renombrado de `paginas.repository.ts`, que pese al nombre exportaba `PostRepository`).
- **infrastructure/db/** — modelos (`Pagina`, `PaginaVersion`, `Contenido`, `ContentAuditLog`, `User`, `Role`, `Attachment`) y migraciones.
- **infrastructure/redis/** — conexión y colas BullMQ (respaldos, caducidad).
- **domain-events/** — efectos secundarios desacoplados (al publicar → invalidar caché + revalidar ISR + auditar). Evita que los use-cases se vuelvan gigantes. Hoy siguen siendo stubs sin cablear a los use-cases de páginas (pendiente de una fase posterior).
- **policies/** — reglas de autorización por acción (quién puede aprobar).
- **middlewares/** — auth (verifica firma JWT), cache, errores, require-permission.
- **validators/** — esquemas Zod de entrada.
- **shared/** — utilidades transversales, incluido storage/ (manejo de archivos, hoy stub).

```
api-backend/src/
├── app.ts                    # Express: helmet, CORS, morgan, montaje de rutas
├── server.ts                 # Arranque: listen, conexión DB/Redis/colas
│
├── config/                   # Variables de entorno, conexión DB
│
├── routes/                   # SOLO define endpoints, cero lógica
│   └── *.routes.ts           # pagina, contenido, section, attachment, audit, job, auth, user, role...
├── controllers/               # HTTP → use-case. Traduce req/res, no sabe de SQL
│   └── *.controller.ts
├── use-cases/                # La lógica de negocio real vive aquí
│   ├── paginas/               # guardar-borrador, enviar-a-revision, aprobar-pagina,
│   │                          # rechazar-pagina, listar-en-revision, obtener-pagina-publica
│   ├── contenidos/            # contenido.usecase.ts (era "posts"), secciones, adjuntos
│   ├── usuarios/               # crear, caducidad, roles, permisos, role-permissions, sitio-users
│   └── auth/                  # login, first-login, security-questions
├── repositories/              # ÚNICA capa que consulta los modelos Sequelize
│   ├── pagina.repository.ts    # Pagina/PaginaVersion — antes no existía
│   ├── contenido.repository.ts # (era paginas.repository.ts → PostRepository)
│   └── *.repository.ts
│
├── infrastructure/
│   ├── db/
│   │   ├── models/            # Modelos Sequelize (schema)
│   │   │   ├── Pagina.ts, PaginaVersion.ts        # maqueta Puck
│   │   │   ├── Contenido.ts   # (era Post.ts) — tabla SQL sigue llamándose "Post", sin migrar
│   │   │   ├── ContentAuditLog.ts                 # historial (RF-07)
│   │   │   ├── User, Role, Permission, RolePermission   # RBAC (RF-04)
│   │   │   ├── Attachment.ts                       # archivos (RF-02, RF-12)
│   │   │   └── ...
│   │   └── migrations/       # Cambios versionados del schema — obligatorio para JSONB
│   └── redis/                # Conexión + colas BullMQ (RF-17 respaldos, RF-16 caducidad)
│
├── domain-events/            # Efectos secundarios desacoplados (stubs, sin cablear aún)
│   ├── paginas/
│   │   ├── *.event.ts        # ContenidoPublicado, EnviadoARevision, ContenidoRechazado
│   │   └── listeners/        # invalidar-cache, revalidar-isr, auditoria, notificar-editor
│   └── usuarios/             # UsuarioCaducado
│
├── policies/                 # Reglas de autorización por acción (RF-05, RF-06)
├── middlewares/              # auth (verifica firma JWT), cache, error, require-permission
├── validators/               # Esquemas Zod de entrada
├── shared/                   # Utilidades transversales
│   ├── cache/                # helpers Redis
│   └── storage/              # abstracción del filesystem (RF-02) — hoy STUB, por implementar
└── types/                    # Tipos TS globales
```

**Por qué así:** cada capa tiene una única responsabilidad y la de abajo no conoce a la de arriba. Si mañana cambian Sequelize por otro ORM, solo se tocan los `repositories` — ya no hay use-cases que salten esa capa. Si cambian la regla de quién aprueba, solo se toca `policies` + el `use-case`. Los `domain-events` evitan que `aprobar-pagina` se vuelva un archivo gigante: aprobar solo emite un evento, y los listeners reaccionan (caché, ISR, auditoría) — cuando se implementen.

**Nota sobre el rename `Post` → `Contenido`:** el modelo, repository, controller, use-case y rutas (`/api/contenidos`, antes `/api/posts`) ya usan el nombre de dominio `Contenido`. La tabla real en Postgres sigue llamándose `Post` (`tableName: 'Post'` explícito en el modelo) — cambiarla requeriría una migración aparte, deliberadamente fuera de esta pasada para no arriesgar los datos existentes.

### 4.2 Sitio web (`sitio-web/`) — público + panel admin - Architecture Feature-based + App Router de Next.js

Contenido del proyecto en capa `sitio-web/src/`:

```
sitio-web/src/
├── middleware.ts                     # Auth gating. Va en src/, NUNCA en src/app/
│
├── app/                              # SOLO enrutamiento Next.js
│   ├── layout.tsx                    # Root: fuentes, providers
│   ├── globals.css                   # Estilos base (partir el monolito actual)
│   │
│   ├── (admin)/                      # ZONA PROTEGIDA — gated por middleware
│   │   ├── layout.tsx
│   │   ├── (shell)/                  # las que comparten el chrome del panel
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/            # Dashboard admin (RF-04)
│   │   │   ├── revision/             # Cola de gobernanza (RF-06)
│   │   │   └── users/                # Gestión de usuarios y roles (RF-04)
│   │   ├── editor/[slug]/            # Mesa de trabajo Puck
│   │   ├── auditoria/                # Historial de cambios (RF-07)
│   │   ├── cambiar-contrasena/
│   │   └── login/
│   │
│   ├── (public)/                     # ZONA ABIERTA — ISR, sin credenciales
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Inicio
│   │   ├── [slug]/page.tsx           # Página pública dinámica (render Puck)
│   │   ├── clasificacion/            # CNO / CUOC
│   │   ├── mercado-laboral/
│   │   └── publicaciones/
│   │
│   └── api/                          # Route handlers delgados (delegan a la API :4000)
│       └── auth/ roles/ security-questions/ upload/ users/
│
├── features/                         # Lógica por dominio (anatomía interna: §4.0)
│   ├── paginas/                      # CMS/Puck. Dominio CON ciclo de vida → se organiza
│   │   ├── model/                    #   por etapa, no por tipo. Ver 8-ciclo-editorial.md §3.2
│   │   ├── publicacion/              #   consumo público: servidor, anónimo, ISR
│   │   ├── edicion/                  #   borrador: cliente, autenticado, sin caché
│   │   └── revision/                 #   gobernanza: cliente, permiso de admin, sin caché
│   ├── administracion/               # Usuarios, roles, panel, sesión (RF-04, RF-05)
│   ├── contenidos/                   # Estudios/informes + buscador interno (RF-01, RF-10)
│   ├── auditoria/                    # Historial de cambios (RF-07) — le falta index.ts
│   ├── identidad-visual/             # Tipografías, colores, marca (RF-03)
│   ├── buscador-ocupaciones/         # CNO/CUOC vía API externa (RF-09)
│   ├── mercado-laboral/              # Sección de mercado laboral
│   ├── inicio/                       # Composición de la portada pública
│   ├── tendencias/                   # NUEVO: tendencias de las ocupaciones
│   ├── alertas/                      # NUEVO: alertas de proyectos de inversión
│   └── programas/                    # NUEVO: programas SENA sobresalientes
│
├── shared/
│   ├── ui/                           # EL SISTEMA DE DISEÑO INSTITUCIONAL
│   │   ├── atoms/                    # Button, Input, Icon (identidad SENA)
│   │   ├── molecules/                # SearchBar, Card
│   │   ├── organisms/                # Header, Footer, Nav, DataTable
│   │   └── templates/                # Estructura de página base
│   ├── lib/                          # api-client, backend-proxy, session
│   ├── hooks/                        # Genéricos (useDebounce, useNotification)
│   └── animations/                   # Presets de animación compartidos
│
└── config/
    └── puck.config.tsx               # Catálogo de bloques (mapea shared/ui → editor)
```

Las carpetas marcadas `NUEVO` en `features/` todavía no existen: son los dominios que faltan por construir, y su ruta en `(public)/` se crea junto con ellos. Todo lo demás está en disco hoy.

**El punto crítico de este proyecto:** `shared/ui/{atoms,molecules,organisms}` tiene **doble rol**. Es el sistema de diseño del código Y el catálogo de piezas que el editor registra en Puck (vía `config/puck.config.tsx`). Por eso el editor no puede escribir HTML crudo ni elegir colores arbitrarios: solo compone con piezas que nosotros controlamos.

Esa es la palanca que permite que la conformidad sea **por construcción** — arreglar un átomo arregla todas las páginas, incluidas las que un editor cree mañana. Pero es una posibilidad, no un hecho consumado: hoy los propios átomos incumplen el contraste AA (`9-accesibilidad.md` §2.1 lo mide). La arquitectura habilita el cumplimiento; entregarlo es el plan del §4 de ese documento.

### 4.3 Intranet (`intranet/`) — repo independiente - Architecture Feature-based + App Router de Next.js

Contenido del proyecto en capa `intranet/src/`:

```
intranet/src/
├── middleware.ts                     # Auth gating. Va en src/, NUNCA en src/app/
│
├── style/                            # Hojas de estilo globales (fuera de app/)
│   └── globals.css                   # Estilos base
│
├── app/                              # SOLO enrutamiento Next.js. Sin route groups:
│   ├── layout.tsx                    #   la app entera es zona protegida
│   ├── page.tsx
│   ├── login/                        # login, first-login, recovery, reset-password,
│   │                                 #   reset-success, security-questions
│   ├── inicio/page.tsx
│   ├── [...puckPath]/page.tsx        # Página interna dinámica (render Puck)
│   ├── editor/[slug]/                # Mesa de trabajo Puck
│   ├── encuestas/                    # calidad-de-formacion, seguimiento-laboral
│   ├── matriz/, tasa/
│   └── api/                          # Route handlers delgados (delegan a la API :4000)
│
├── features/                         # Lógica por dominio — misma anatomía que sitio-web (§4.0)
│   ├── auth/                         # Flujo completo: login, recovery, first-login, security-questions
│   │   ├── index.ts
│   │   ├── components/               # las ocho vistas del flujo
│   │   ├── hooks/                    # use-auth
│   │   └── services/                 # auth.service.ts
│   │
│   ├── paginas/                      # CMS/Puck — dominio CON ciclo de vida, ver 8-ciclo-editorial.md §3.2
│   │   ├── index.ts
│   │   ├── model/                    # pagina.types.ts, estado.ts
│   │   ├── publicacion/              # render de páginas ya publicadas
│   │   ├── edicion/                  # mesa de trabajo Puck + Editor.js + uploader
│   │   └── revision/                 # gobernanza — NO EXISTE AÚN, llega con la fase 6
│   │
│   ├── inicio/                       # Portada interna (visor PDF, recursos visuales)
│   ├── encuestas/                    # Calidad de formación, seguimiento laboral
│   ├── matriz/                       # Matriz de formación (Power BI + integración + vistas)
│   ├── tasa/                         # Tasa de ocupación (Power BI + integración + vistas)
│   ├── directores/                   # NUEVO: espacio exclusivo (RF-15)
│   └── edicion-concurrente/          # NUEVO: lock
│
├── shared/
│   ├── ui/                           # Sistema de diseño PROPIO de intranet
│   │   ├── atoms/ molecules/ organisms/ templates/
│   │   │   └── carousel/             # Componentes genéricos extraídos (kebab-case, §4.3 de 8-ciclo)
│   └── lib/
│
└── config/
    └── puck.config.tsx
```

**Este árbol es el destino, no el estado actual.** La intranet se desvió de dos convenciones del proyecto: usa `ui/` donde va `components/` y `api/` donde va `services/`. Además `auth/` y `login/` son hoy dos features para un mismo dominio, partido por tipo técnico. Lo que **ya está alineado** es la puerta pública: las siete features tienen su `index.ts` y ningún archivo de `app/` importa rutas internas. El inventario exacto y los pasos restantes están en la **fase 4** de `8-ciclo-editorial.md` §5.

### 4.4 Paquetes compartidos (`packages/`)

```
packages/
├── blocks-renderer/          # YA EXISTE — bloques Puck compartidos (falta USARLO de verdad)
│   └── src/blocks/, registry.ts, types.ts
├── editor-core/              # PLANEADO — lógica del editor extraída (Puck+Editor.js+lock+autoguardado)
│   └── src/components/, hooks/, lock/
└── types/                    # PLANEADO — contratos compartidos (Pagina, Contenido, Usuario, Rol)
```

**Regla:** algo va a `packages/` solo si **ambos frontends** lo necesitan con el mismo comportamiento. El editor Puck es idéntico en los dos → `editor-core`. El sistema de diseño NO va aquí porque cada frontend tiene identidad visual distinta.

**Costo de no haberlo hecho todavía, medido hoy:** ocho archivos están duplicados entre `sitio-web/src/features/paginas/` e `intranet/src/features/paginas/` (`client-puck-render`, `edit-button`, `editorjs-wrapper`, `image-uploader-field`, `page-renderer`, `puck-editor-wrapper`, `use-pagina`, `page-seeds`). Y ya divergieron: **la etapa de revisión existe solo en `sitio-web`**, así que la intranet no tiene gobernanza — justo lo que esta regla busca evitar. El alcance exacto de `editor-core` (qué se comparte y qué no) está en `8-ciclo-editorial.md` §4.4, y su extracción es la fase 6 del plan de migración.

---

## 5. Mapa requerimiento → dónde vive

| RF | Backend | Frontend |
|---|---|---|
| RF-01 contenidos | `use-cases/contenidos`, `use-cases/paginas` | `features/paginas`, `features/contenidos`, `admin/editor` |
| RF-02 archivos | `shared/storage` (implementar), `Attachment`, `validators` | `features/paginas` (uploader) |
| RF-03 identidad | modelo de config de marca (nuevo) | `features/identidad-visual` |
| RF-04 roles | `Role/Permission/RolePermission`, `use-cases/usuarios` | `features/administracion` |
| RF-05/06 gobernanza | `policies/paginas`, `use-cases/paginas` | flujo en `admin` |
| RF-07 historial | `ContentAuditLog`, `domain-events/.../auditoria.listener` | vista de detalle (falta) |
| RF-08 Power BI | validación de URL | `config/puck.config` (bloque contenedor) |
| RF-09 CNO/CUOC | proxy a API externa (nuevo) | `features/buscador-ocupaciones` |
| RF-10 buscador interno | query sobre `Contenido` | `features/contenidos` |
| RF-11 navegación 3 clics | — | `shared/ui/organisms` (nav + breadcrumbs) |
| RF-12 descarga pública | `Attachment`, ruta pública | enlaces de descarga |
| RF-13 Habeas Data | registro de aceptación (nuevo) | componente de aviso |
| RF-14 accesibilidad | — | `shared/ui` + alto contraste. Estado y plan en `9-accesibilidad.md` |
| RF-15 directores | `use-cases` + auditoría de acceso | `intranet/features/directores` |
| RF-16 auth + caducidad | `auth`, `use-cases/usuarios/caducidad` (hoy STUB) | login |
| RF-17 respaldos | BullMQ (cola + worker), UI de config | panel admin |

---

## 6. Convenciones no negociables

1. **`app/` solo enrutamiento.** Nombres exactos de Next (`page`, `layout`, `route`, `middleware`). Un nombre mal escrito (ej. `proxy.ts`) hace que Next ignore el archivo sin error visible.
2. **El backend es la única puerta a los datos.** Ningún frontend toca Postgres/Redis/filesystem directo.
3. **Autorización siempre server-side.** El JWT en el frontend solo se decodifica; la firma se valida en la API.
4. **Cambios al schema siempre con migración.** Nunca editar un modelo JSONB en caliente.
5. **Mover → verificar (build/typecheck) → recién entonces eliminar.** Nunca borrar lo viejo en el mismo paso que se crea lo nuevo.
6. **El sistema de diseño es el catálogo del editor.** Todo bloque nuevo se construye desde `shared/ui`, garantizando identidad SENA y accesibilidad por construcción.
7. **`packages/` solo para lo que ambos frontends comparten con el mismo comportamiento.**
8. **Una feature se organiza igual en las dos apps.** `components/` (nunca `ui/`, que es el sistema de diseño) y `services/` (nunca `api/`, que son los route handlers de Next). Anatomía completa en §4.0 y `8-ciclo-editorial.md` §3.
9. **Un dominio con ciclo de vida se organiza por etapas, no por tipo técnico.** Cada etapa queda con un público, un permiso y una política de caché únicos. Es lo que impide cachear por accidente una respuesta autenticada. Ver `8-ciclo-editorial.md` §2.
10. **Lo que ve el ciudadano solo cambia al aprobar una versión.** Ningún borrador ni página en revisión puede alcanzar el sitio público. Ver `8-ciclo-editorial.md` §1.2.
11. **Todo archivo se nombra en `kebab-case`; el identificador que exporta, en `PascalCase`.** Sin excepciones por tipo de archivo. Evita la clase de bug que solo aparece en producción, donde el sistema de archivos de Linux sí distingue mayúsculas y el de Windows no.
12. **Solo `index.ts` es importable desde fuera de una feature.** Ninguna ruta interna de un módulo se importa desde otro.
