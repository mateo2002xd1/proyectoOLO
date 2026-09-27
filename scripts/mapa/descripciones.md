# Para qué es cada carpeta

Este archivo lo escriben personas. `generar-mapa.mjs` lo lee para ponerle a cada carpeta de
`docs/13-mapa-del-proyecto.md` su descripción, y marca **⚠ sin descripción** las que falten.
Es la parte del plano que el código no puede decir sola: no cómo está la carpeta, sino
**para qué existe**, y por lo tanto qué va dentro y qué no.

**Formato:** una línea por carpeta, `` - `ruta/` — para qué es ``. Corta: cabe al lado del
árbol. Si una carpeta necesita más explicación, la explicación va en el `.md` que
corresponda (`docs/1-guia-del-proyecto.md` §4) y aquí solo la frase.

**Qué carpetas se describen:** las de primer nivel, las de cada app hasta sus features y
etapas, las capas de la API y cada paquete. Dentro de una feature, `components/`,
`hooks/`, `services/`, `lib/` y `model/` ya están definidas por la anatomía de
`docs/2-convenciones-del-proyecto.md` §2.4 y no hace falta repetirlas.

**Cuando creas una carpeta nueva**, el mapa la marca hasta que escribas aquí su línea. Si
no sabes qué poner, esa es la señal de que la carpeta no tiene un lugar claro todavía.

> Sembrado el 2026-09-25 con lo que ya decían `docs/1-guia-del-proyecto.md` y el código. Las que
> quedaron sin línea no están documentadas en ningún lado: son las primeras que hay que
> decidir.

## Raíz

- `.githooks/` — hooks de git del equipo: regeneran el mapa en cada commit y cada pull
- `.vscode/` — ajustes compartidos del editor
- `4000-api-backend/` — la API: única puerta a los datos (Express, Sequelize, capas)
- `docker/` — despliegue en el servidor: compose, nginx, SQL de importación y manual
- `docs/` — la documentación del proyecto: guía, convenciones, seguridad, reglas, bitácora y este mapa
- `3001-intranet/` — intranet de directores y subdirectores, 100 % protegida (Next.js)
- `packages/` — lo que las dos apps comparten con el mismo comportamiento
- `scripts/` — herramientas del repo que no son de una app
- `3000-sitio-web/` — sitio público (ISR) y panel administrativo (Next.js)
- `test/` — pruebas de carga con k6

## 4000-api-backend

- `4000-api-backend/scripts/` — lo que se corre a mano desde la terminal, casi siempre con `npm run`; por carpetas
- `4000-api-backend/scripts/db/` — migraciones, esquema de la base (SQL, HTML y PDF) y respaldos
- `4000-api-backend/scripts/semillas/` — datos iniciales: páginas, plantillas, permisos y el superadmin
- `4000-api-backend/scripts/verificaciones/` — los `npm run *:verificar` y pruebas de punta a punta desde la terminal
- `4000-api-backend/scripts/archivos/` — mantenimiento de los archivos subidos: uploads y backups
- `4000-api-backend/scripts/puntuales/` — arreglos de datos de una sola vez; se leen antes de volver a correrlos
- `4000-api-backend/seed/` — semilla SQL versionada: contenido inicial, roles y permisos
- `4000-api-backend/src/` — código de la API
- `4000-api-backend/src/config/` — variables de entorno y conexión a la base
- `4000-api-backend/src/controllers/` — traducen HTTP a una llamada de use-case; no saben de SQL
- `4000-api-backend/src/docs/` — Swagger/OpenAPI a partir de los comentarios `@openapi`
- `4000-api-backend/src/domain-events/` — efectos secundarios desacoplados de los use-cases
- `4000-api-backend/src/domain-events/paginas/` — eventos del ciclo editorial y sus oyentes
- `4000-api-backend/src/infrastructure/` — lo que habla con afuera: base, Redis, archivos
- `4000-api-backend/src/infrastructure/db/` — modelos Sequelize y migraciones
- `4000-api-backend/src/infrastructure/redis/` — conexión, colas BullMQ e invalidación de caché
- `4000-api-backend/src/infrastructure/storage/` — respaldo y restauración de los archivos de una página
- `4000-api-backend/src/middlewares/` — sesión, permisos, Zod, límites de tasa, caché y errores
- `4000-api-backend/src/policies/` — quién puede hacer qué, por acción
- `4000-api-backend/src/repositories/` — única capa que consulta los modelos Sequelize
- `4000-api-backend/src/routes/` — solo declaran endpoints y sus protecciones; cero lógica
- `4000-api-backend/src/shared/` — utilidades transversales: sanitización, permisos, auditoría
- `4000-api-backend/src/types/` — tipos globales (extensión del `Request` de Express)
- `4000-api-backend/src/use-cases/` — la lógica de negocio: una acción, una función
- `4000-api-backend/src/use-cases/auditoria/` — consulta de la bitácora de cambios (RF-07)
- `4000-api-backend/src/use-cases/auth/` — login, primer ingreso y preguntas de seguridad
- `4000-api-backend/src/use-cases/observatorio/` — cargas de Excel del Observatorio y tendencia ocupacional
- `4000-api-backend/src/use-cases/paginas/` — gobernanza de páginas: borrador, revisión, publicación, bloqueo
- `4000-api-backend/src/use-cases/usuarios/` — usuarios, roles, permisos y caducidad
- `4000-api-backend/src/validators/` — esquemas Zod `.strict()` de entrada

## docker

- `docker/nginx/` — nginx del servidor: una puerta para el sitio y otra para la intranet
- `docker/sql/` — pasos SQL de `deploy.sh importar`

## packages

- `packages/accessibility-policy/` — qué bloque exige texto alternativo o título de iframe (RF-14)
- `packages/blocks-renderer/` — pinta los bloques guardados igual en las dos apps
- `packages/email-policy/` — dominio de correo institucional
- `packages/inactividad/` — aviso y cierre de sesión por inactividad
- `packages/password-policy/` — política de contraseñas
- `packages/slug-policy/` — formato válido de un slug
- `packages/upload-policy/` — controles de subida: bytes mágicos, lista blanca, UUID, límites

## 3000-sitio-web

- `3000-sitio-web/public/` — estáticos: imágenes, logos, PWA y `storage/` con lo subido
- `3000-sitio-web/src/` — código del sitio
- `3000-sitio-web/src/app/` — solo enrutamiento: `(public)`, `(auth)`, `admin`, `editor`, `preview`, `api`
- `3000-sitio-web/src/config/` — catálogo de bloques del editor (`puck.config.tsx`)
- `3000-sitio-web/src/features/` — un dominio por carpeta
- `3000-sitio-web/src/features/administracion/` — el panel: usuarios, roles, auditoría, respaldos, cargas
- `3000-sitio-web/src/features/administracion/actualizaciones/` — cargas de Excel del Observatorio y su historial
- `3000-sitio-web/src/features/administracion/auditoria/` — historial de cambios (RF-07)
- `3000-sitio-web/src/features/administracion/auth/` — login, primer ingreso, recuperación, usuarios y roles
- `3000-sitio-web/src/features/administracion/buscador/` — buscador del propio panel
- `3000-sitio-web/src/features/administracion/mi-perfil/` — la cuenta de quien inició sesión
- `3000-sitio-web/src/features/administracion/respaldos/` — restaurar versiones archivadas de una página
- `3000-sitio-web/src/features/paginas/` — páginas editables con Puck, organizadas por etapa del ciclo
- `3000-sitio-web/src/features/paginas/edicion/` — etapa 1: borrador, editor, subidas y candado
- `3000-sitio-web/src/features/paginas/menu-y-pie/` — cabecera y pie de todo el sitio
- `3000-sitio-web/src/features/paginas/publicacion/` — etapa 6: lo que ve el público (ISR, sin credenciales)
- `3000-sitio-web/src/features/paginas/revision/` — etapas 3 a 5: cola de revisión, aprobar, rechazar
- `3000-sitio-web/src/features/paginas/secciones/` — crear y eliminar páginas
- `3000-sitio-web/src/features/sitio-web/` — agrupador de lo público
- `3000-sitio-web/src/features/sitio-web/buscador-ocupaciones/` — buscador CNO/CUOC (RF-09)
- `3000-sitio-web/src/features/sitio-web/inicio/` — composición de la portada
- `3000-sitio-web/src/features/sitio-web/programas-sobresalientes/` — mapa, filtros y tabla del Observatorio
- `3000-sitio-web/src/features/sitio-web/tendencia-ocupacional/` — tendencia ocupacional (bloque Puck)
- `3000-sitio-web/src/shared/` — lo transversal del sitio: sistema de diseño y utilidades
- `3000-sitio-web/src/shared/lib/` — utilidades transversales: cliente HTTP, sesión, bloques
- `3000-sitio-web/src/shared/lib/blocks/` — los bloques Puck de esta app
- `3000-sitio-web/src/shared/lib/inactividad/` — aviso y cierre de sesión por inactividad
- `3000-sitio-web/src/shared/lib/mobile/` — navegación mobile del panel: barra de abajo con el logo al centro
- `3000-sitio-web/src/shared/lib/pwa/` — manifiesto, íconos y registro del service worker
- `3000-sitio-web/src/shared/lib/tema/` — tema oscuro del panel, sin parpadeo al cargar
- `3000-sitio-web/src/shared/ui/` — sistema de diseño institucional y catálogo del editor
- `3000-sitio-web/src/shared/ui/atoms/` — piezas mínimas: botón, avatar, interruptor…
- `3000-sitio-web/src/shared/ui/molecules/` — piezas compuestas: alertas, paginación, selectores…
- `3000-sitio-web/src/shared/ui/organisms/` — navbar y barra lateral del panel
- `3000-sitio-web/src/style/` — `globals.css` y los tokens de Tailwind

## 3001-intranet

- `3001-intranet/public/` — estáticos: imágenes, íconos de la PWA y `storage/` con lo subido
- `3001-intranet/src/` — código de la intranet
- `3001-intranet/src/app/` — solo enrutamiento: `(secciones)` (comodín Puck), `(auth)`, `editor`, `preview`
- `3001-intranet/src/config/` — catálogo de bloques del editor de la intranet
- `3001-intranet/src/features/` — un dominio por carpeta
- `3001-intranet/src/features/login/` — pantallas del flujo de acceso
- `3001-intranet/src/features/paginas/` — secciones editables con Puck, gemela de la del sitio
- `3001-intranet/src/features/paginas/edicion/` — etapa 1: borrador, editor, subidas y candado
- `3001-intranet/src/features/paginas/menu-y-pie/` — cabecera y pie de la intranet
- `3001-intranet/src/features/paginas/publicacion/` — lo que ven directores y subdirectores
- `3001-intranet/src/features/paginas/secciones/` — crear y eliminar secciones
- `3001-intranet/src/shared/` — lo transversal de la intranet
- `3001-intranet/src/shared/lib/` — utilidades transversales: cliente HTTP, sesión, bloques
- `3001-intranet/src/shared/lib/blocks/` — los bloques Puck de la intranet
- `3001-intranet/src/shared/lib/inactividad/` — aviso y cierre de sesión por inactividad
- `3001-intranet/src/shared/lib/mobile/` — navegación mobile de la intranet, con el menú de la plantilla
- `3001-intranet/src/shared/lib/pwa/` — manifiesto, íconos y registro del service worker
- `3001-intranet/src/shared/ui/` — sistema de diseño propio de la intranet
- `3001-intranet/src/shared/ui/atoms/` — piezas mínimas
- `3001-intranet/src/shared/ui/molecules/` — campos de contraseña y enlace de vuelta al sitio
- `3001-intranet/src/shared/ui/organisms/` — carrusel
- `3001-intranet/src/style/` — `globals.css` de la intranet
