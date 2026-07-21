## Necesidad del cliente

El Observatorio Laboral y Ocupacional es una entidad que gestiona **datos del mercado laboral y la empleabilidad**, información que cambia constantemente. Por eso el portal no puede ser un sitio estático mantenido por desarrolladores: necesita que **el propio equipo del OLO edite y reorganice el contenido** sin intervención técnica.

La necesidad central, en sus propias palabras traducidas a requisitos:

- El sitio parte de un **diseño base institucional** (identidad SENA, directrices MinTIC, colores, tipografía, accesibilidad).
- Sobre ese diseño base, los editores deben poder **reorganizar la maqueta, agregar nuevas secciones y reutilizar componentes** (átomos, moléculas, organismos) — siempre **respetando la identidad visual y las directrices**. No es edición libre sin reglas: es **composición controlada dentro de un sistema de diseño institucional**.
- Debe existir un **flujo de gobernanza**: los editores proponen, un administrador aprueba, y solo entonces el contenido se publica.
- El sitio público es abierto; existe además una **intranet privada** para directores y subdirectores con información estratégica.

### Requerimientos funcionales

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
## Solución implementada

Una plataforma de **tres capas lógicas** bajo un modelo **CMS headless con composición visual**:

- **Dos capas frontend** (Next.js) en puertos distintos, cada una con su propia identidad visual y su propio despliegue:
  - **Sitio web público** (`:3000`): páginas dinámicas abiertas + panel administrativo interno.
  - **Intranet** (`:3001`): 100% protegida, identidad visual propia, para directores/subdirectores.
- **Un backend API** (Express, `:4000`) que es la **única puerta de entrada a los datos**. Ningún frontend toca la base de datos, el filesystem ni Redis directamente: todo pasa por la API, que valida, autoriza y controla qué entra y sale.
- **Infraestructura**: PostgreSQL (datos), Redis (caché de páginas públicas + colas de trabajos), Nginx (reverse proxy + SSL en producción).

### Cómo la solución cubre la necesidad

| Necesidad | Cómo se resuelve |
|---|---|
| Editar sin desarrolladores | Editor visual (Puck) que compone páginas con un catálogo de bloques |
| Respetar el diseño institucional | El catálogo de bloques ES el sistema de diseño (átomos/moléculas/organismos); el editor solo puede componer con piezas que ya cumplen la identidad SENA y la Res. 1519 **por construcción** |
| Contenido siempre actualizado | Todo el contenido es dinámico (JSONB en Postgres), servido por la API |
| Gobernanza | Flujo `borrador → en revisión → publicado/rechazado`; solo el admin publica |
| Rendimiento con tráfico alto | Páginas públicas con ISR + revalidación on-demand al publicar; caché Redis en la API |
| Contenido descubrible | Modelo de contenido consultable (buscador + "Últimas publicaciones") separado de la maqueta |

### Modelación del contenido

El contenido editable se modela como **páginas Puck** (`Pagina`/`PaginaVersion`): la maqueta y composición visual. Pero los **estudios/informes/estadísticas/banners** también deben ser **descubribles** (aparecer en el buscador y en "Últimas publicaciones" del inicio), aunque el editor los coloque dentro de una página concreta.

Solución híbrida:

- **`Pagina` / `PaginaVersion`** → el lienzo editable (dónde va cada bloque). Estructura y layout.
- **`Contenido`** (el modelo `Post` reutilizado y renombrado) → cada estudio/informe como **registro independiente** con título, tipo, categoría, fecha, adjuntos. Buscable y listable.
- **Vínculo por referencia**: un bloque Puck que muestra un contenido guarda su **ID**, no una copia. Así el mismo estudio aparece en su página propia y en "Últimas publicaciones", y editarlo una vez lo actualiza en todos lados.
---


### Diagrama de capas

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
   │   - Panel admin (protegido)│                   │       │
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
### Stack por capa

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

## Arquitectura de carpetado
- API Backend (`api-backend/`) Clean Architecture.
- Sitio web (`sitio-web/`) — público + panel admin - Architecture Feature-based + App Router de Next.js.
- Intranet (`intranet/`) — exclusivamente para directores/subdirectores - Feature-based + App Router.
