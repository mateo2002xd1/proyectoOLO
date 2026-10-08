# Sistema integrado de control de contenidos para el sitio web del Observatorio Laboral SENA

Portal del Observatorio Laboral y Ocupacional: sitio público editable sin desarrolladores, intranet para directores, y una API que es la única puerta a los datos.

---

## Necesidad del cliente

El OLO gestiona **datos del mercado laboral y la empleabilidad**, información que cambia constantemente. Por eso el portal no puede ser un sitio estático mantenido por desarrolladores: necesita que **el propio equipo del OLO edite y reorganice el contenido** sin intervención técnica.

La necesidad central, traducida a requisitos:

- El sitio parte de un **diseño base institucional** (identidad SENA, directrices MinTIC, colores, tipografía, accesibilidad).
- Sobre ese diseño base, los editores deben poder **reorganizar la maqueta, agregar secciones y reutilizar componentes** — siempre **respetando la identidad visual y la accesibilidad** (Resolución 1519 de 2020, nivel AA). No es edición libre: es **composición controlada dentro de un sistema de diseño institucional**.
- Debe existir un **flujo de gobernanza**: los editores proponen, un administrador aprueba, y solo entonces se publica.
- El sitio público es abierto; existe además una **intranet privada** para directores y subdirectores.

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

**El diagrama de capas, los flujos de datos y el modelo de contenido están en [1-guia-del-proyecto.md](docs/1-guia-del-proyecto.md) §3.** No se repiten aquí a propósito: cuando el mismo contenido vive en dos archivos, uno de los dos queda desactualizado.

### Arquitectura de carpetado

| Proyecto | Arquitectura |
|---|---|
| `4000-api-backend/` | Clean Architecture (capas con dependencia unidireccional) |
| `3000-sitio-web/` | Feature-based + App Router (público + panel admin) |
| `3001-intranet/` | Feature-based + App Router (directores/subdirectores) |
| `packages/` | Código compartido por ambos frontends |

Detalle completo en [1-guia-del-proyecto.md](docs/1-guia-del-proyecto.md) §4.

---

## Documentación

Leer en este orden. Los tres primeros son de lectura obligatoria antes de tocar código.

| Documento | Qué responde |
|---|---|
| [1-guia-del-proyecto.md](docs/1-guia-del-proyecto.md) | Arquitectura del sistema y de carpetas. Mapa requerimiento → dónde vive. Convenciones no negociables. |
| [2-convenciones-del-proyecto.md](docs/2-convenciones-del-proyecto.md) | Cómo se escribe el código: nomenclatura, tipos, errores, comentarios. |
| [8-ciclo-editorial.md](docs/8-ciclo-editorial.md) | **Cómo se organiza por dentro un dominio.** El ciclo borrador → revisión → publicado, y el plan de migración por fases. |
| [11-base-de-datos.md](docs/11-base-de-datos.md) | **El modelo de datos.** Las 20 tablas, por qué existe cada una, las invariantes que declara el esquema y lo que deliberadamente no es tabla. |
| [3-seguridad-del-proyecto.md](docs/3-seguridad-del-proyecto.md) | Superficies de ataque y controles. |
| [4-reglas.md](docs/4-reglas.md) | Reglas operativas para mover o crear carpetas sin romper nada. |
| [9-accesibilidad.md](docs/9-accesibilidad.md) | **Nivel AA y Resolución 1519 de 2020.** Estado auditado, decisiones de paleta y plan por fases (RF-14). |
| [5-tableros-bi.md](docs/5-tableros-bi.md) | Tableros Power BI embebidos: URLs, dónde se usan y controles de seguridad (RF-08). |
| [6-auditoria.md](docs/6-auditoria.md) | Bitácora de sesiones de trabajo. |
| [13-mapa-del-proyecto.md](docs/13-mapa-del-proyecto.md) | **Cómo está el proyecto hoy, generado del código:** carpetas con su propósito, features, rutas, endpoints con sus protecciones, librerías y base de datos. No se edita a mano: se regenera solo en cada commit y cada `pull`. Los hooks que lo hacen se activan la primera vez que corres `npm run dev` en cualquier app. Para qué es cada carpeta se escribe en `scripts/mapa/descripciones.md`. |
| [docker/guia-pws.md](docker/guia-pws.md) | **Empieza aquí si nunca usaste Docker.** Paso a paso explicado: instalar Docker, construir imágenes, levantar contenedores y correr las migraciones. |
| [docker/guia-bash.md](docker/guia-bash.md) | Docker, Nginx, SSL, variables de entorno (despliegue en servidor real). |

**La API se documenta sola.** Con el backend levantado, `http://localhost:4000/api/docs`
abre Swagger UI —los endpoints con sus parámetros, sus respuestas y el permiso que exige
cada uno, y un botón para probarlos— y `/api/docs.json` devuelve el documento OpenAPI
crudo para Postman o para generar clientes. Las descripciones salen de comentarios
`@openapi` escritos junto a cada ruta, no de una lista aparte, para que no se
desincronicen. En producción está apagada salvo que se encienda a mano: ver
[guia-bash.md](docker/guia-bash.md).
