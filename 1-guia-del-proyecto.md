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
   → API: archiva la versión publicada, la nueva ocupa su lugar
   → emite evento ContenidoPublicado
      → listener invalida caché Redis (SCAN + DEL por patrón)
      → listener llama a POST /api/revalidar del sitio → revalidateTag
   → el controlador registra la auditoría (quién, qué, cuándo)
```

**Los dos listeners funcionan desde el 2026-08-21; antes eran `console.log` que nadie
importaba.** Mientras lo fueron, aprobar dejaba la base correcta y la pantalla igual: el
sitio servía su copia hasta agotar el TTL, y por el `stale-while-revalidate` de Next
entregaba la copia vieja una vez más incluso después de caducar. Quien aprobaba
concluía, razonablemente, que la aprobación no había hecho nada.

Se **espera** a los dos oyentes antes de responder —quien aprueba recarga en el acto— y
un fallo suyo **nunca** tumba la publicación: cuando corren, lo de la base ya está
escrito, así que devolver un error mentiría sobre lo que pasó. El mecanismo completo,
con sus límites, está en `8-ciclo-editorial.md` §1.3.

La auditoría **no** cuelga del evento: se escribe desde el controlador, que es donde
está el `Request` del que salen la IP y el `user-agent`. Los use-cases no reciben el
`Request` ni deben recibirlo.

### 3.5 Stack por capa

| Capa | Tecnología | Puerto |
|---|---|---|
| Sitio web | Next.js 16 (App Router + Turbopack), React 19, TS 5, Tailwind 4, Puck 0.22 | 3000 |
| Intranet | Next.js 16, React 19, TS 5, Tailwind 4, Puck 0.22, Headless UI | 3001 |
| API | Express 5, Sequelize 6, TS 5, Zod, JWT (sign+verify), BullMQ | 4000 |
| Datos | PostgreSQL 16 | 5432 |
| Caché/Colas | Redis 7 (ioredis + BullMQ) | 6379 |
| Proxy | Nginx (SSL/TLS en prod) | 80/443 |
| Compartido | Siete paquetes `@olo/*` — ver §4.4 | — |

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
- **controllers/** — traduce HTTP (req/res) a una llamada de use-case. No sabe de SQL. Un controller por dominio o sub-recurso: `pagina.controller.ts` (maqueta Puck), `contenido.controller.ts` (estudios/informes), `secciones.controller.ts`, `adjuntos.controller.ts`, `auditoria.controller.ts`, `usuarios.controller.ts`, `roles.controller.ts`, `permisos.controller.ts`, `role-permissions.controller.ts`, `security-questions.controller.ts`, `auth.controller.ts`, `trabajos.controller.ts` (BullMQ).
- **use-cases/** — la lógica de negocio real. Una acción = una función (`aprobarPagina`, `guardarBorrador`). Organizadas por dominio real, no por el modelo que tocan:
  - `paginas/` — gobernanza de la maqueta Puck: `guardar-borrador`, `enviar-a-revision`, `aprobar-pagina`, `rechazar-pagina`, `listar-en-revision`, `obtener-pagina-publica`, `obtener-version-editable`, `eliminar-version`, y desde 2026-08-20 `crear-seccion` y `eliminar-seccion`. Todas pasan por `repositories/pagina.repository.ts` — antes tocaban `Pagina`/`PaginaVersion` (los modelos Sequelize) directo, sin repository, violando la regla de abajo.
  - `contenidos/` — estudios/informes y su soporte: `contenido.usecase.ts` (renombrado de `posts.usecase.ts`), `secciones.usecase.ts`, `adjuntos.usecase.ts`.
  - `usuarios/`, `auth/` — como antes.
- **repositories/** — única capa que toca Sequelize. Si cambias de ORM, solo tocas aquí. Diez hoy, uno por dominio con capa de aplicación. Incluye `pagina.repository.ts` (nuevo — cerraba el hueco de arriba) y `contenido.repository.ts` (renombrado de `paginas.repository.ts`, que pese al nombre exportaba `PostRepository`).
- **infrastructure/db/** — veinte modelos (`Pagina`, `PaginaVersion`, `Contenido`, `Archivo`, `ContentAuditLog`, `User`, `Role`…) y diecinueve migraciones. **Ocho de esos modelos no tienen todavía repositorio, caso de uso ni ruta**: son la base de RF-03, RF-08, RF-13 y RF-17, esperando su capa de aplicación. Inventario completo en `11-base-de-datos.md` §4.
- **infrastructure/redis/** — conexión, colas BullMQ (respaldos, caducidad) y los ayudantes de invalidación (`redisEstaListo`, `borrarClavesPorPatron`).
- **domain-events/** — efectos secundarios desacoplados. Evita que los use-cases se vuelvan gigantes: aprobar solo emite un evento y los oyentes reaccionan. `ContenidoPublicado` **está cableado y funcionando** (invalidar caché + revalidar ISR); `EnviadoARevision`, `ContenidoRechazado`, `UsuarioCaducado` y el oyente `notificar-editor` siguen sin cablear.
- **policies/** — reglas de autorización por acción (quién puede aprobar). Cuatro: páginas, contenidos, usuarios, auditoría. **Comparan el nombre de rol en minúsculas a propósito** — en la tabla `roles` están capitalizados, y comparar literal deja a todo el mundo fuera sin lanzar un solo error. Lo cubre `npm run permisos:verificar`.
- **middlewares/** — auth (verifica firma JWT, relee rol/estado/caducidad de la fila), cache, error, require-permission, rate-limit y validar (Zod).
- **validators/** — esquemas Zod de entrada, todos `.strict()`.
- **shared/** — utilidades transversales: ámbito, catálogo de permisos, sanitización, políticas de correo y contraseña, y `storage/` (manejo de archivos) que **sigue siendo un stub de tres funciones vacías**.

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
│   ├── usuarios/               # crear, caducidad, roles, permisos, role-permissions
│   └── auth/                  # login, first-login, security-questions
├── repositories/              # ÚNICA capa que consulta los modelos Sequelize
│   ├── pagina.repository.ts    # Pagina/PaginaVersion — antes no existía
│   ├── contenido.repository.ts # (era paginas.repository.ts → PostRepository)
│   └── *.repository.ts
│
├── infrastructure/
│   ├── db/
│   │   ├── models/            # 20 modelos Sequelize
│   │   │   ├── Pagina.ts, PaginaVersion.ts        # maqueta Puck
│   │   │   ├── Contenido.ts   # (era Post.ts) — tabla `contenidos` desde la migración 004
│   │   │   ├── ContentAuditLog.ts                 # historial (RF-07), tabla `auditoria_cambios`
│   │   │   ├── User, Role, Permission, RolePermission   # RBAC (RF-04)
│   │   │   ├── Archivo.ts, ContenidoArchivo.ts     # archivos (RF-02, RF-12)
│   │   │   └── ...            # 8 modelos más, todavía sin capa de aplicación encima
│   │   ├── migrations/        # 19, en un manifiesto explícito (index.ts)
│   │   └── migrations/_obsoletas/   # incluida script.sql — el esquema ya no sale de ahí
│   └── redis/                # Conexión + colas BullMQ + invalidación por patrón
│
├── domain-events/            # Efectos secundarios desacoplados
│   ├── paginas/
│   │   ├── contenido-publicado.event.ts   # CABLEADO — lo emite aprobar-pagina
│   │   ├── enviado-a-revision.event.ts    # sin cablear
│   │   ├── contenido-rechazado.event.ts   # sin cablear
│   │   └── listeners/        # invalidar-cache ✔, revalidar-isr ✔, notificar-editor ✗
│   └── usuarios/             # UsuarioCaducado — sin cablear
│
├── policies/                 # Reglas de autorización por acción (RF-05, RF-06)
├── middlewares/              # auth, cache, error, require-permission, rate-limit, validar
├── validators/               # Esquemas Zod de entrada (.strict())
├── shared/                   # Utilidades transversales
│   ├── cache/                # helpers Redis
│   ├── catalogo-permisos.ts  # las claves que la API sabe comprobar
│   ├── ambito.ts             # sitio | intranet, la dimensión que atraviesa todo
│   └── storage/              # abstracción del filesystem (RF-02) — hoy STUB, por implementar
├── scripts/                  # migrate, siembras y los seis verificadores (3-seguridad §4.9)
└── types/                    # Tipos TS globales
```

**Por qué así:** cada capa tiene una única responsabilidad y la de abajo no conoce a la de arriba. Si mañana cambian Sequelize por otro ORM, solo se tocan los `repositories` — ya no hay use-cases que salten esa capa. Si cambian la regla de quién aprueba, solo se toca `policies` + el `use-case`. Los `domain-events` evitan que `aprobar-pagina` se vuelva un archivo gigante: aprobar solo emite un evento, y los listeners reaccionan.

**Nota sobre el rename `Post` → `Contenido` — ya está cerrado.** El modelo, repository, controller, use-case y rutas (`/api/contenidos`, antes `/api/posts`) usan el nombre de dominio `Contenido`, y **la tabla también se llama ya `contenidos`**: lo hizo la migración `004-contenidos-secciones-archivos`, junto con `"Section"` → `secciones` y el paso de los ids de `TEXT` a `UUID`.

Lo que sí conviene entender de esa migración, porque es la decisión que la hizo segura: **se renombró la columna, no el atributo del modelo.** `Contenido.title` sigue llamándose `title` en el modelo y en el JSON de la API; la columna es `titulo`, y `field: 'titulo'` une las dos. Sin eso, renombrar una columna habría obligado a cambiar el modelo, el repositorio, el caso de uso, el controlador **y los dos frontends** en el mismo despliegue. El precio es que hoy conviven dos idiomas —atributos en inglés, columnas en español— y que el puente entre ambos son cadenas de texto que ningún compilador valida. Por eso existe `npm run db:verificar`, y por eso ejecutarlo después de migrar no es opcional. El detalle está en `11-base-de-datos.md` §8.1.

### 4.2 Sitio web (`sitio-web/`) — público + panel admin - Architecture Feature-based + App Router de Next.js

Contenido del proyecto en capa `sitio-web/src/`:

```
sitio-web/src/
├── middleware.ts                     # Auth gating. Va en src/, NUNCA en src/app/
│
├── style/globals.css                 # Estilos base y tokens de marca. Fuera de app/
│
├── app/                              # SOLO enrutamiento Next.js
│   ├── layout.tsx                    # Root: fuentes, providers
│   │
│   ├── admin/                        # ZONA PROTEGIDA — gated por middleware
│   │   ├── (auth)/                   #   pantallas sin sesión: login, recuperar,
│   │   │                             #   cambiar-contrasena
│   │   ├── (shell)/                  #   las que comparten el chrome del panel:
│   │   │                             #   dashboard, users, revision, auditoria, mi-perfil
│   │   ├── editor/[slug]/            # Mesa de trabajo Puck
│   │   └── preview/[slug]/           # Vista previa de una versión en revisión
│   │
│   ├── (public)/                     # ZONA ABIERTA — ISR, sin credenciales
│   │   ├── layout.tsx                # Pinta el menú y el pie alrededor de todo
│   │   ├── [slug]/page.tsx           # Página pública dinámica (render Puck)
│   │   ├── inicio/                   # La portada. `/` redirige aquí, no la sirve
│   │   ├── menu-y-pie/               # NO es una página: es un notFound() a propósito
│   │   ├── clasificacion/            # CNO / CUOC
│   │   ├── publicaciones/
│   │   └── politica-de-privacidad/, privacidad/
│   │
│   └── api/                          # Route handlers delgados (delegan a la API :4000)
│       ├── auth/ users/ roles/ permissions/ role-permissions/
│       ├── security-questions/ audit-logs/ alerts/ upload/ docs/
│       └── revalidar/                # La llama la API al publicar. Ver 3-seguridad §S11
│
├── features/                         # Lógica por dominio (anatomía interna: §4.0)
│   ├── paginas/                      # CMS/Puck: editor, cola de revisión, crear/eliminar
│   │   │                             #   sección. Dominio CON ciclo de vida, pero HOY
│   │   │                             #   organizado por tipo técnico:
│   │   └── components/ hooks/ services/ lib/ types.ts
│   │
│   ├── administracion/               # Agrupador del panel — sus hijas son las features
│   │   ├── auth/                     #   login, first-login, recuperación, usuarios
│   │   ├── auditoria/                #   historial de cambios (RF-07)
│   │   ├── buscador/                 #   buscador del propio panel
│   │   └── mi-perfil/
│   │
│   ├── sitio-web/                    # Agrupador de lo público
│   │   ├── inicio/                   #   composición de la portada
│   │   ├── buscador-ocupaciones/     #   CNO/CUOC vía API externa (RF-09)
│   │   └── politica-privacidad/
│   │
│   ├── contenidos/                   # Estudios/informes + buscador interno (RF-01, RF-10)
│   ├── identidad-visual/             # Tipografías, colores, marca (RF-03)
│   └── auditoria/                    # ⚠ CÓDIGO MUERTO: duplica administracion/auditoria
│                                     #   y nadie la importa. Ver 8-ciclo-editorial §7
├── shared/
│   ├── ui/                           # EL SISTEMA DE DISEÑO INSTITUCIONAL
│   │   ├── atoms/ molecules/ organisms/ templates/
│   ├── lib/
│   │   ├── blocks/                   # Los bloques Puck de ESTA app
│   │   ├── api-client, backend-proxy, session, auth-cookies
│   │   └── reenviar-cliente.ts       # Propaga X-Forwarded-For. Ver 3-seguridad §4.5
│   ├── hooks/                        # Genéricos (useDebounce, useNotification)
│   └── animations/
│
└── config/
    └── puck.config.tsx               # Catálogo de bloques (mapea shared/ui → editor)
```

**Tres cosas de este árbol merecen explicación, porque no se deducen mirándolo.**

**Hay dos rutas que existen para *no* servir nada.** `(public)/menu-y-pie/page.tsx` es un
`notFound()` de una línea: `menu-y-pie` es una fila real de `paginas` —guarda la cabecera
y el pie que el layout pinta alrededor de todo el sitio— así que sin esta ruta el comodín
`[slug]` la encontraría en la base y la renderizaría como una página normal, con una
cabecera y un pie duplicados dentro del `<main>`. Y `/` no sirve la portada: redirige a
`/inicio`, porque cuando las dos rutas servían el mismo slug el sitio tenía contenido
duplicado bajo dos URLs. **Cuando el contenido sale de la base de datos, el enrutador
tiene que decir explícitamente qué filas no son páginas.**

**`features/` tiene dos niveles, y eso es una desviación del §4.0.** `administracion/` y
`sitio-web/` no son features: son carpetas que agrupan features por zona de la
aplicación. El agrupamiento se lee bien —lo del panel junto, lo público junto— pero la
convención dice que una feature es una carpeta de `features/` con su `index.ts`, y aquí
hay que bajar un nivel para encontrarlo. Funciona porque cada hija sí tiene su `index.ts`
y nadie importa rutas internas; conviene decidir si se adopta como norma o se aplana,
antes de que aparezca un tercer nivel.

**`paginas/` sigue organizado por tipo técnico, no por etapa del ciclo.** El §4.0 y
`8-ciclo-editorial.md` §3.2 describen `model/ publicacion/ edicion/ revision/` como la
forma correcta para un dominio con ciclo de vida, y esa sigue siendo la referencia. **No
está aplicada.** El árbol de arriba es lo que hay; la reorganización es la fase 1-3 del
plan de ese documento y sigue sin empezar. Mientras tanto, un solo
`services/paginas.service.ts` contiene lecturas públicas cacheables y escrituras
autenticadas de administrador — con dos transportes distintos (`fetch` con ISR y `axios`
con `withCredentials`) — y todo sale por el mismo `index.ts`.

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
├── app/                              # SOLO enrutamiento Next.js
│   ├── layout.tsx                    #   la app entera es zona protegida
│   ├── page.tsx
│   ├── (secciones)/[...puckPath]/    # TODA sección interna, render Puck desde BD
│   ├── editor/[slug]/                # Mesa de trabajo Puck
│   ├── preview/[slug]/               # Vista previa de una versión en revisión
│   ├── login/                        # login, first-login, recovery, reset-password,
│   │                                 #   reset-success, security-questions
│   └── api/upload/                   # El único route handler propio
│
├── features/                         # Solo dos, y es lo correcto para lo que hace la app
│   ├── gestor-secciones/             # Todo el editor: Puck, uploaders, botones de crear
│   │   │                             #   y eliminar sección, MarcoSecciones
│   │   └── api/ components/ hooks/ lib/ types/ index.ts
│   │
│   └── login/                        # Absorbió a auth/: las ocho vistas del flujo más
│       └── api/ components/ hooks/ index.ts     #   use-auth y auth.api.ts
│
├── shared/
│   ├── ui/                           # Sistema de diseño PROPIO de intranet
│   │   └── atoms/ molecules/ organisms/
│   └── lib/
│       ├── blocks/                   # Los bloques Puck de ESTA app
│       └── inactividad/
│
└── config/
    └── puck.config.tsx
```

**La intranet adelgazó, y por un buen motivo.** Tenía siete features y hoy tiene dos.
Cuatro de las que se fueron (`inicio/`, `encuestas/`, `matriz/`, `tasa/`) existían para
pintar a mano una sección concreta; cuando todas las secciones pasaron a leerse de la
base de datos y a editarse con Puck, se quedaron sin trabajo. La ruta comodín
`[...puckPath]` pinta cualquier slug que exista en `paginas`, así que **añadir una
sección dejó de ser un cambio de código**. Es el mismo movimiento que la §2 promete —
"editar sin desarrolladores" — llegando por fin a la estructura de carpetas.

**Lo que sigue desalineado**, y sigue anotado en la fase 4 de `8-ciclo-editorial.md` §5:

- Las dos features usan `api/` donde la convención 8 dice `services/`. El motivo de la
  convención no es estético: `api/` colisiona con `app/api/`, que son los route handlers
  de Next. El proxy y el cliente que lo consume no deben compartir nombre.
- `gestor-secciones/` es la gemela de `paginas/` en el sitio y **se llaman distinto**.
  Hay que elegir un nombre y usarlo en las dos, sobre todo antes de extraer `editor-core`.
- Sigue sin aplicarse §3.2 (organización por etapa del ciclo), igual que en el sitio.
- **La intranet no tiene cola de revisión.** Sus cambios se aprueban desde
  `sitio-web/src/app/admin/(shell)/revision/`, que distingue ámbito y abre la vista
  previa contra la intranet. Es la divergencia que la regla de `packages/` buscaba evitar
  y que la fase 6 cierra.

Lo que **sí está alineado**: la puerta pública. Las dos features tienen su `index.ts` y
ningún archivo de `app/` importa rutas internas.

### 4.4 Paquetes compartidos (`packages/`)

```
packages/
├── blocks-renderer/          # Primitivos de maquetación (Grid/Flex/Space), controles de caja
├── password-policy/          # La política de contraseñas, una sola vez
├── email-policy/             # El dominio institucional @sena.edu.co
├── slug-policy/              # Cómo se hace un slug y cuáles están reservados
├── upload-policy/            # Los cinco controles de subida (§S1 de 3-seguridad)
├── accessibility-policy/     # Campos obligatorios de accesibilidad por bloque (fase 5 de 9-a11y)
├── inactividad/              # Aviso y cierre de sesión en el navegador
└── editor-core/              # PLANEADO — lógica del editor extraída. Sigue sin existir
```

**Regla:** algo va a `packages/` solo si **ambos frontends** lo necesitan con el mismo comportamiento. El sistema de diseño NO va aquí porque cada frontend tiene identidad visual distinta — por eso `blocks-renderer` ya no comparte los componentes de bloque (`Header`, `Footer`, `Services`...): cada app tiene los suyos en su propio `shared/lib/blocks/`, y el paquete solo aporta lo verdaderamente idéntico entre ambas.

**Los seis paquetes de política tienen todos el mismo origen, y vale la pena verlo:** una regla que estaba escrita dos veces se desincronizó una vez. El caso que mejor lo ilustra es `upload-policy` — el endurecimiento de la subida de archivos se aplicó al handler de la intranet, y el del sitio se quedó sin **ninguno** de los cinco controles durante meses, sin que nadie lo notara porque los dos archivos se veían bien por separado. Lo mismo con `accessibility-policy`, que además se consume desde **tres** sitios: el editor de cada app (aviso inmediato) y la API (rechazo real). Una segunda implementación ahí significaría que el editor cree que un campo es obligatorio y el servidor lo publique igual, o al revés.

De ahí sale el criterio para el siguiente: **`packages/` es para reglas que dos capas tienen que decidir idénticamente, no para código que simplemente se parece.**

**Costo de no haber extraído `editor-core`, medido hoy:** la duplicación entre `sitio-web/src/features/paginas/` e `intranet/src/features/gestor-secciones/` no bajó, creció. A los siete archivos originales (`client-puck-render`, `edit-button`, `editorjs-wrapper`, `image-uploader-field`, `puck-editor-wrapper`, `use-pagina`, `page-seeds`) se sumaron `nueva-seccion-button`, `eliminar-seccion-button`, `aviso-seccion-nueva`, `plantilla-edit-button`, `plantilla.ts` y `ruta-de-vuelta.ts`. Cada funcionalidad nueva del editor se escribe dos veces. Y la divergencia sigue donde estaba: **la etapa de revisión existe solo en `sitio-web`**. El alcance exacto de `editor-core` está en `8-ciclo-editorial.md` §4.4, y su extracción es la fase 6.

---

## 5. Mapa requerimiento → dónde vive

Los ✅ / 🟡 / ⏳ son del **camino**, no del requerimiento: dicen si el código existe y
dónde, no si está terminado y probado. Para saber si un RF es seguro, su fila del
checklist de `3-seguridad-del-proyecto.md` §5; para la persistencia, `11-base-de-datos.md` §7.

| RF | Backend | Frontend | |
|---|---|---|---|
| RF-01 contenidos | `use-cases/contenidos`, `use-cases/paginas` | `features/paginas`, `features/contenidos`, `admin/editor` | ✅ |
| RF-02 archivos | subida en los route handlers de cada front vía `@olo/upload-policy`; `shared/storage` sigue STUB | `features/paginas` (uploaders) | 🟡 funciona, pero escribe dentro del webroot |
| RF-03 identidad | tabla `marca_versiones`, **sin capa de aplicación** | `features/identidad-visual` | 🟡 |
| RF-04 roles | `Role/Permission/RolePermission`, `use-cases/usuarios`, `shared/catalogo-permisos` | `features/administracion/auth` | ✅ |
| RF-05/06 gobernanza | `policies/paginas`, `use-cases/paginas`, `domain-events/paginas` | cola en `admin/(shell)/revision` | ✅ solo en el sitio; la intranet no tiene cola propia |
| RF-07 historial | `ContentAuditLog` + `shared/auditoria-*`, escrito desde los controladores | `features/administracion/auditoria` | ✅ |
| RF-08 Power BI | tabla `tableros_bi`, **sin capa de aplicación**; URLs a mano en los bloques | `config/puck.config` (bloque contenedor) | ⏳ |
| RF-09 CNO/CUOC | proxy a API externa (por construir) | `features/sitio-web/buscador-ocupaciones` | ⏳ |
| RF-10 buscador interno | `contenidos.busqueda` (tsvector + GIN) | `features/contenidos` | 🟡 |
| RF-11 navegación 3 clics | `secciones.nivel` con `CHECK BETWEEN 1 AND 3` | `shared/ui/organisms` (nav + breadcrumbs) | 🟡 el esquema lo garantiza; la navegación falta |
| RF-12 descarga pública | `archivos` + comprobación de estado publicado | enlaces de descarga | 🟡 |
| RF-13 Habeas Data | `politicas_privacidad`, `consentimientos`, **sin capa de aplicación** | `features/sitio-web/politica-privacidad` | 🟡 la página existe; el registro de aceptación no |
| RF-14 accesibilidad | `@olo/accessibility-policy` en `enviar-a-revision` | `shared/ui` + alto contraste (falta). Estado real en `9-accesibilidad.md` | 🟡 con una regresión abierta |
| RF-15 directores | permiso `acceso.intranet`; auditoría de acceso sin implementar | la intranet entera | 🟡 |
| RF-16 auth + caducidad | `auth`, caducidad revalidada en **cada** petición, bloqueo por intentos, inactividad en dos capas. El job programado `revisar-caducidad` sigue siendo un stub | `admin/(auth)`, `login/` de la intranet | ✅ la caducidad se aplica; avisar antes de que ocurra, no |
| RF-17 respaldos | `scripts/respaldo.ts` (a mano) + tabla `respaldos` | UI de config (falta) | ⏳ |

> **La cola BullMQ está montada pero vacía.** `setupWorker()` arranca un worker sobre
> `heavy-jobs` cuyo procesador **simula** trabajo: espera cinco segundos y devuelve
> éxito. La infraestructura (cola, worker, reintentos, rutas de consulta de trabajos con
> su comprobación de propiedad) está en pie y probada; lo que falta son los trabajos
> reales — el respaldo periódico de RF-17 y la revisión de caducidad de RF-16. Conviene
> saberlo antes de dar por hecho que "los respaldos ya corren solos": hoy `npm run
> respaldo` se ejecuta a mano.

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

### Cuáles se cumplen hoy y cuáles no

Una convención que el código incumple en silencio deja de ser una convención. Estado
verificado el 2026-08-21:

| # | Estado |
|---|---|
| 1, 2, 3, 4, 5, 12 | ✅ Se cumplen. La 12 es la que mejor aguantó: ningún archivo de `app/` alcanza una ruta interna de una feature, en ninguna de las dos apps |
| 6 | 🟡 Se cumple estructuralmente — todo bloque sale de piezas nuestras — pero la promesa de "accesibilidad por construcción" **no se está cumpliendo**: los tokens interactivos volvieron a un verde que falla AA. Ver `9-accesibilidad.md` fase 1 |
| 7 | ✅ Y creció bien: siete paquetes, cada uno naciendo de una regla que se había desincronizado |
| 8 | ❌ Incumplida en la intranet, que usa `api/` donde va `services/`, y en el nombre: `paginas/` vs `gestor-secciones/` |
| 9 | ❌ Incumplida en las dos apps. Es la fase 1-3 de `8-ciclo-editorial.md` §5 y sigue sin empezar |
| 10 | ✅ Y desde 2026-08-21 se cumple *de verdad*: antes lo publicado tardaba en verse, que es el mismo problema por el otro lado |
| 11 | 🟡 Quedan unos 45 archivos en PascalCase, casi todos bloques Puck. Ojo: se renombra el archivo, **nunca la clave del componente** — el JSON guardado la lleva dentro |

Ninguna de las dos ❌ es urgente ni bloquea nada. Están aquí porque el propósito de esta
lista es que se pueda leer y saber en qué se puede confiar, y una lista donde todo
aparece cumplido no sirve para eso.
