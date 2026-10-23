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
- `4000-api-backend/src/infrastructure/storage/` — el filesystem de lo subido, fuera del código, y el respaldo de los archivos de cada página
- `4000-api-backend/src/middlewares/` — sesión, permisos, Zod, límites de tasa, caché y errores
- `4000-api-backend/src/policies/` — quién puede hacer qué, por acción
- `4000-api-backend/src/repositories/` — única capa que consulta los modelos Sequelize
- `4000-api-backend/src/routes/` — solo declaran endpoints y sus protecciones; cero lógica
- `4000-api-backend/src/shared/` — utilidades transversales: sanitización, permisos, auditoría
- `4000-api-backend/src/types/` — tipos globales (extensión del `Request` de Express)
- `4000-api-backend/src/use-cases/` — la lógica de negocio: una acción, una función
- `4000-api-backend/src/use-cases/archivos/` — subida de los adjuntos de las páginas (RF-02)
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
- `packages/url-policy/` — qué direcciones puede llevar el contenido: enlaces, imágenes, hosts de iframe, redirecciones

## 3000-sitio-web

- `3000-sitio-web/public/` — estáticos: imágenes, logos y PWA
- `3000-sitio-web/src/` — código del sitio
- `3000-sitio-web/src/app/` — solo enrutamiento: `(public)`, `(auth)`, `admin`, `editor`, `preview`, `api`
- `3000-sitio-web/src/config/` — catálogo de bloques del editor (`puck.config.tsx`)
- `3000-sitio-web/src/features/` — un dominio por carpeta
- `3000-sitio-web/src/features/admin-panel/` — el panel: usuarios, roles, auditoría, respaldos, cargas
- `3000-sitio-web/src/features/admin-panel/update-section/` — cargas de Excel del Observatorio y su historial
- `3000-sitio-web/src/features/admin-panel/changelog-view/` — historial de cambios (RF-07)
- `3000-sitio-web/src/features/admin-panel/auth/` — login, primer ingreso, recuperación, usuarios y roles
- `3000-sitio-web/src/features/admin-panel/search/` — buscador del propio panel
- `3000-sitio-web/src/features/admin-panel/configuration/` — preferencias del panel en este navegador, como el sonido de los avisos
- `3000-sitio-web/src/features/admin-panel/backup-section/` — restaurar versiones archivadas de una página
- `3000-sitio-web/src/features/editor/` — páginas editables con Puck, organizadas por etapa del ciclo
- `3000-sitio-web/src/features/editor/edition/` — etapa 1: borrador, editor, subidas y candado
- `3000-sitio-web/src/features/editor/navegation/` — cabecera y pie de todo el sitio
- `3000-sitio-web/src/features/editor/publishing/` — etapa 6: lo que ve el público (ISR, sin credenciales)
- `3000-sitio-web/src/features/editor/review/` — etapas 3 a 5: cola de revisión, aprobar, rechazar
- `3000-sitio-web/src/features/editor/sections/` — crear y eliminar páginas
- `3000-sitio-web/src/shared/lib/alertas-inversion/` — alertas de inversión: filtros, gráfico por sector y listado de proyectos
- `3000-sitio-web/src/shared/lib/buscador-ocupaciones/` — buscador CNO/CUOC (RF-09)
- `3000-sitio-web/src/shared/lib/programas-sobresalientes/` — mapa, filtros y tabla del Observatorio
- `3000-sitio-web/src/shared/lib/tendencia-ocupacional/` — tendencia ocupacional (bloque Puck)
- `3000-sitio-web/src/shared/` — lo transversal del sitio: sistema de diseño y utilidades
- `3000-sitio-web/src/shared/lib/` — utilidades transversales: cliente HTTP, sesión, bloques
- `3000-sitio-web/src/shared/lib/accesibilidad/` — botón y panel de accesibilidad del sitio público, y las preferencias del visitante
- `3000-sitio-web/src/shared/lib/blocks/` — los bloques Puck de esta app
- `3000-sitio-web/src/shared/lib/identidad-panel/` — logo, icono y colores de etiquetas y botones del panel
- `3000-sitio-web/src/shared/lib/inactividad/` — aviso y cierre de sesión por inactividad
- `3000-sitio-web/src/shared/lib/mobile/` — navegación mobile del panel: barra de abajo con el logo al centro
- `3000-sitio-web/src/shared/lib/pwa/` — manifiesto, íconos y registro del service worker
- `3000-sitio-web/src/shared/lib/sonido-avisos/` — el tono de los avisos flotantes y la preferencia de silenciarlo
- `3000-sitio-web/src/shared/lib/tema/` — tema oscuro del panel, sin parpadeo al cargar
- `3000-sitio-web/src/shared/lib/api/` — cliente HTTP, URL de la API, lectura de sus errores y el proxy con cookie a la API
- `3000-sitio-web/src/shared/lib/geography/` — geometría de los departamentos de Colombia para los mapas
- `3000-sitio-web/src/shared/lib/modals/` — la salida animada de los modales (`useCierreAnimado`)
- `3000-sitio-web/src/shared/lib/session/` — cookies de sesión, lectura y verificación de la sesión, y a qué paso del primer ingreso va una cuenta
- `3000-sitio-web/src/shared/lib/typography/` — las letras que carga la app (`next/font`)
- `3000-sitio-web/src/shared/ui/` — sistema de diseño institucional y catálogo del editor
- `3000-sitio-web/src/shared/ui/atoms/` — piezas mínimas: botón, avatar, interruptor…
- `3000-sitio-web/src/shared/ui/molecules/` — piezas compuestas: alertas, paginación, selectores…
- `3000-sitio-web/src/shared/ui/organisms/` — navbar y barra lateral del panel
- `3000-sitio-web/src/style/` — `globals.css` y los tokens de Tailwind

## 3001-intranet

- `3001-intranet/public/` — estáticos: imágenes e íconos de la PWA
- `3001-intranet/src/` — código de la intranet
- `3001-intranet/src/app/` — solo enrutamiento: `(secciones)` (comodín Puck), `(auth)`, `editor`, `preview`
- `3001-intranet/src/config/` — catálogo de bloques del editor de la intranet
- `3001-intranet/src/features/` — un dominio por carpeta
- `3001-intranet/src/features/login/` — pantallas del flujo de acceso
- `3001-intranet/src/features/editor/` — secciones editables con Puck, gemela de la del sitio
- `3001-intranet/src/features/editor/edition/` — etapa 1: borrador, editor, subidas y candado
- `3001-intranet/src/features/editor/navegation/` — cabecera y pie de la intranet
- `3001-intranet/src/features/editor/publishing/` — lo que ven directores y subdirectores
- `3001-intranet/src/features/editor/sections/` — crear y eliminar secciones
- `3001-intranet/src/shared/` — lo transversal de la intranet
- `3001-intranet/src/shared/lib/` — utilidades transversales: cliente HTTP, sesión, bloques
- `3001-intranet/src/shared/lib/blocks/` — los bloques Puck de la intranet
- `3001-intranet/src/shared/lib/inactividad/` — aviso y cierre de sesión por inactividad
- `3001-intranet/src/shared/lib/mobile/` — navegación mobile de la intranet, con el menú de la plantilla
- `3001-intranet/src/shared/lib/pwa/` — manifiesto, íconos y registro del service worker
- `3001-intranet/src/shared/lib/api/` — cliente HTTP, lectura de errores y la URL del sitio web
- `3001-intranet/src/shared/lib/layout/` — cuántas piezas caben en un ancho (`useCuantosCaben`)
- `3001-intranet/src/shared/lib/modals/` — la salida animada de los modales (`useCierreAnimado`)
- `3001-intranet/src/shared/lib/session/` — lectura y verificación de la sesión, y quién edita páginas
- `3001-intranet/src/shared/lib/typography/` — las letras que carga la app (`next/font`)
- `3001-intranet/src/shared/ui/` — sistema de diseño propio de la intranet
- `3001-intranet/src/shared/ui/atoms/` — piezas mínimas
- `3001-intranet/src/shared/ui/molecules/` — campos de contraseña y enlace de vuelta al sitio
- `3001-intranet/src/shared/ui/organisms/` — carrusel
- `3001-intranet/src/style/` — `globals.css` de la intranet
