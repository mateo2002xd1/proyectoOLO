# OLO — Observatorio Laboral y Ocupacional (SENA)

Portal del Observatorio Laboral y Ocupacional: sitio público editable sin desarrolladores, intranet para directores, y una API que es la única puerta a los datos.

---

## Necesidad del cliente

El OLO gestiona **datos del mercado laboral y la empleabilidad**, información que cambia constantemente. Por eso el portal no puede ser un sitio estático mantenido por desarrolladores: necesita que **el propio equipo del OLO edite y reorganice el contenido** sin intervención técnica.

La necesidad central, traducida a requisitos:

- El sitio parte de un **diseño base institucional** (identidad SENA, directrices MinTIC, colores, tipografía, accesibilidad).
- Sobre ese diseño base, los editores deben poder **reorganizar la maqueta, agregar secciones y reutilizar componentes** — siempre **respetando la identidad visual y la accesibilidad** (Resolución 1519 de 2020, nivel AA). No es edición libre: es **composición controlada dentro de un sistema de diseño institucional**.
- Debe existir un **flujo de gobernanza**: los editores proponen, un administrador aprueba, y solo entonces se publica.
- El sitio público es abierto; existe además una **intranet privada** para directores y subdirectores.

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

## La solución en una página

Una plataforma de **tres capas** bajo un modelo **composición visual**:

| Capa | Qué es | Tecnología | Puerto |
|---|---|---|---|
| **Sitio web** | Público (ISR) + panel administrativo | Next.js 16, React 19, TS 5, Tailwind 4, Puck 0.22 | 3000 |
| **Intranet** | 100% protegida, identidad visual propia | Next.js 16, React 19, TS 5, Tailwind 4, Puck 0.22, Headless UI | 3001 |
| **API** | **La única puerta a los datos** | Express 5, Sequelize 6, TS 5, Zod, JWT, BullMQ | 4000 |
| Datos | PostgreSQL 16 | — | 5432 |
| Caché/Colas | Redis 7 (ioredis + BullMQ) | — | 6379 |
| Proxy | Nginx (SSL/TLS en prod) | — | 80/443 |

Ningún frontend toca la base de datos, el filesystem ni Redis directamente: todo pasa por la API, que valida, autoriza y controla qué entra y sale.

**El diagrama de capas, los flujos de datos y el modelo de contenido están en [1-guia-del-proyecto.md](1-guia-del-proyecto.md) §3.** No se repiten aquí a propósito: cuando el mismo contenido vive en dos archivos, uno de los dos queda desactualizado.

### Arquitectura de carpetado

| Proyecto | Arquitectura |
|---|---|
| `api-backend/` | Clean Architecture (capas con dependencia unidireccional) |
| `sitio-web/` | Feature-based + App Router (público + panel admin) |
| `intranet/` | Feature-based + App Router (directores/subdirectores) |
| `packages/` | Código compartido por ambos frontends |

Detalle completo en [1-guia-del-proyecto.md](1-guia-del-proyecto.md) §4.

---

## Documentación

Leer en este orden. Los tres primeros son de lectura obligatoria antes de tocar código.

| Documento | Qué responde |
|---|---|
| [1-guia-del-proyecto.md](1-guia-del-proyecto.md) | Arquitectura del sistema y de carpetas. Mapa requerimiento → dónde vive. Convenciones no negociables. |
| [2-convenciones-del-proyecto.md](2-convenciones-del-proyecto.md) | Cómo se escribe el código: nomenclatura, tipos, errores, comentarios. |
| [8-ciclo-editorial.md](8-ciclo-editorial.md) | **Cómo se organiza por dentro un dominio.** El ciclo borrador → revisión → publicado, y el plan de migración por fases. |
| [11-base-de-datos.md](11-base-de-datos.md) | **El modelo de datos.** Las 20 tablas, por qué existe cada una, las invariantes que declara el esquema y lo que deliberadamente no es tabla. |
| [3-seguridad-del-proyecto.md](3-seguridad-del-proyecto.md) | Superficies de ataque y controles. |
| [4-reglas.md](4-reglas.md) | Reglas operativas para mover o crear carpetas sin romper nada. |
| [9-accesibilidad.md](9-accesibilidad.md) | **Nivel AA y Resolución 1519 de 2020.** Estado auditado, decisiones de paleta y plan por fases (RF-14). |
| [10-backlog.md](10-backlog.md) | **Qué falta por hacer.** 21 épicas, 21 historias y 226 tareas con estado verificado, capa y nivel. Exportado también a `10-backlog.csv`. |
| [5-tableros-bi.md](5-tableros-bi.md) | Tableros Power BI embebidos: URLs, dónde se usan y controles de seguridad (RF-08). |
| [6-auditoria.md](6-auditoria.md) | Bitácora de sesiones de trabajo. |
| [7-despliegue.md](7-despliegue.md) | Docker, Nginx, SSL, variables de entorno. |
