# Mapa del proyecto

> **Generado, no se edita a mano.** Lo escribe `scripts/mapa/generar-mapa.mjs` a partir del
> código: dice cómo **está** el proyecto, no cómo debe estar. Si algo de aquí está mal,
> lo que se corrige es el código, o la descripción de la carpeta en
> [`scripts/mapa/descripciones.md`](../scripts/mapa/descripciones.md).
>
> Se regenera solo antes de cada commit y después de cada `git pull`. Los hooks que lo
> hacen se activan la primera vez que corres `npm run dev` en cualquier app (o a mano:
> `git config core.hooksPath .githooks`). Para regenerarlo sin commit:
> `node scripts/mapa/generar-mapa.mjs`.

## Resumen

| | Carpetas | Features | Rutas de Next | Endpoints | Librerías |
|---|--:|--:|--:|--:|--:|
| `3000-sitio-web` | 46 | 3 | 54 | — | 33 |
| `3001-intranet` | 33 | 2 | 13 | — | 27 |
| `4000-api-backend` | 32 | — | — | 70 | 42 |

Paquetes compartidos: 7 · migraciones: 38 · modelos: 17.

## Carpetas sin descripción (2)

Cada carpeta de estos niveles tiene que decir para qué es. Se describe en `scripts/mapa/descripciones.md` con una línea: `` - `ruta/` — para qué es ``.

- `3000-sitio-web/data_temporal/`
- `3000-sitio-web/src/features/sitio-web/fuentes-futuras-empleo/`

## Carpetas

```text
.githooks/                                     hooks de git del equipo: regeneran el mapa en cada commit y cada pull

.vscode/                                       ajustes compartidos del editor

3000-sitio-web/                                sitio público (ISR) y panel administrativo (Next.js)
├── data_temporal/                             ⚠ sin descripción
├── public/                                    estáticos: imágenes, logos, PWA y `storage/` con lo subido
│   └── assets/
└── src/                                       código del sitio
    ├── app/                                   solo enrutamiento: `(public)`, `(auth)`, `admin`, `editor`, `preview`, `api`
    │   ├── (auth)/
    │   ├── (public)/
    │   ├── admin/
    │   ├── api/
    │   ├── editor/
    │   ├── preview/
    │   └── storage/
    ├── config/                                catálogo de bloques del editor (`puck.config.tsx`)
    ├── features/                              un dominio por carpeta
    │   ├── administracion/                    el panel: usuarios, roles, auditoría, respaldos, cargas
    │   │   ├── actualizaciones/               cargas de Excel del Observatorio y su historial
    │   │   ├── auditoria/                     historial de cambios (RF-07)
    │   │   ├── auth/                          login, primer ingreso, recuperación, usuarios y roles
    │   │   ├── buscador/                      buscador del propio panel
    │   │   ├── mi-perfil/                     la cuenta de quien inició sesión
    │   │   └── respaldos/                     restaurar versiones archivadas de una página
    │   ├── paginas/                           páginas editables con Puck, organizadas por etapa del ciclo
    │   │   ├── edicion/                       etapa 1: borrador, editor, subidas y candado
    │   │   ├── menu-y-pie/                    cabecera y pie de todo el sitio
    │   │   ├── model/                         lo que comparten las etapas del dominio
    │   │   ├── publicacion/                   etapa 6: lo que ve el público (ISR, sin credenciales)
    │   │   ├── revision/                      etapas 3 a 5: cola de revisión, aprobar, rechazar
    │   │   └── secciones/                     crear y eliminar páginas
    │   └── sitio-web/                         agrupador de lo público
    │       ├── buscador-ocupaciones/          buscador CNO/CUOC (RF-09)
    │       ├── fuentes-futuras-empleo/        ⚠ sin descripción
    │       ├── inicio/                        composición de la portada
    │       ├── programas-sobresalientes/      mapa, filtros y tabla del Observatorio
    │       └── tendencia-ocupacional/         tendencia ocupacional (bloque Puck)
    ├── shared/                                lo transversal del sitio: sistema de diseño y utilidades
    │   ├── lib/                               utilidades transversales: cliente HTTP, sesión, bloques
    │   │   ├── blocks/                        los bloques Puck de esta app
    │   │   ├── inactividad/                   aviso y cierre de sesión por inactividad
    │   │   ├── mobile/                        navegación mobile del panel: barra de abajo con el logo al centro
    │   │   ├── pwa/                           manifiesto, íconos y registro del service worker
    │   │   └── tema/                          tema oscuro del panel, sin parpadeo al cargar
    │   └── ui/                                sistema de diseño institucional y catálogo del editor
    │       ├── atoms/                         piezas mínimas: botón, avatar, interruptor…
    │       ├── molecules/                     piezas compuestas: alertas, paginación, selectores…
    │       └── organisms/                     navbar y barra lateral del panel
    └── style/                                 `globals.css` y los tokens de Tailwind

3001-intranet/                                 intranet de directores y subdirectores, 100 % protegida (Next.js)
├── public/                                    estáticos: imágenes, íconos de la PWA y `storage/` con lo subido
│   └── assets/
└── src/                                       código de la intranet
    ├── app/                                   solo enrutamiento: `(secciones)` (comodín Puck), `(auth)`, `editor`, `preview`
    │   ├── (auth)/
    │   ├── (secciones)/
    │   ├── api/
    │   ├── editor/
    │   ├── preview/
    │   └── storage/
    ├── config/                                catálogo de bloques del editor de la intranet
    ├── features/                              un dominio por carpeta
    │   ├── login/                             pantallas del flujo de acceso
    │   │   ├── components/                    UI del dominio
    │   │   ├── hooks/                         estado y efectos del dominio
    │   │   └── services/                      única capa que llama a la API
    │   └── paginas/                           secciones editables con Puck, gemela de la del sitio
    │       ├── edicion/                       etapa 1: borrador, editor, subidas y candado
    │       ├── menu-y-pie/                    cabecera y pie de la intranet
    │       ├── model/                         lo que comparten las etapas del dominio
    │       ├── publicacion/                   lo que ven directores y subdirectores
    │       └── secciones/                     crear y eliminar secciones
    ├── shared/                                lo transversal de la intranet
    │   ├── lib/                               utilidades transversales: cliente HTTP, sesión, bloques
    │   │   ├── blocks/                        los bloques Puck de la intranet
    │   │   ├── inactividad/                   aviso y cierre de sesión por inactividad
    │   │   ├── mobile/                        navegación mobile de la intranet, con el menú de la plantilla
    │   │   └── pwa/                           manifiesto, íconos y registro del service worker
    │   └── ui/                                sistema de diseño propio de la intranet
    │       ├── atoms/                         piezas mínimas
    │       ├── molecules/                     campos de contraseña y enlace de vuelta al sitio
    │       └── organisms/                     carrusel
    └── style/                                 `globals.css` de la intranet

4000-api-backend/                              la API: única puerta a los datos (Express, Sequelize, capas)
├── scripts/                                   lo que se corre a mano desde la terminal, casi siempre con `npm run`; por carpetas
│   ├── archivos/                              mantenimiento de los archivos subidos: uploads y backups
│   ├── db/                                    migraciones, esquema de la base (SQL, HTML y PDF) y respaldos
│   ├── puntuales/                             arreglos de datos de una sola vez; se leen antes de volver a correrlos
│   ├── semillas/                              datos iniciales: páginas, plantillas, permisos y el superadmin
│   └── verificaciones/                        los `npm run *:verificar` y pruebas de punta a punta desde la terminal
├── seed/                                      semilla SQL versionada: contenido inicial, roles y permisos
└── src/                                       código de la API
    ├── config/                                variables de entorno y conexión a la base
    ├── controllers/                           traducen HTTP a una llamada de use-case; no saben de SQL
    ├── docs/                                  Swagger/OpenAPI a partir de los comentarios `@openapi`
    ├── domain-events/                         efectos secundarios desacoplados de los use-cases
    │   └── paginas/                           eventos del ciclo editorial y sus oyentes
    ├── infrastructure/                        lo que habla con afuera: base, Redis, archivos
    │   ├── db/                                modelos Sequelize y migraciones
    │   │   ├── migrations/
    │   │   └── models/
    │   ├── redis/                             conexión, colas BullMQ e invalidación de caché
    │   └── storage/                           respaldo y restauración de los archivos de una página
    ├── middlewares/                           sesión, permisos, Zod, límites de tasa, caché y errores
    ├── policies/                              quién puede hacer qué, por acción
    ├── repositories/                          única capa que consulta los modelos Sequelize
    ├── routes/                                solo declaran endpoints y sus protecciones; cero lógica
    ├── shared/                                utilidades transversales: sanitización, permisos, auditoría
    ├── types/                                 tipos globales (extensión del `Request` de Express)
    ├── use-cases/                             la lógica de negocio: una acción, una función
    │   ├── auditoria/                         consulta de la bitácora de cambios (RF-07)
    │   ├── auth/                              login, primer ingreso y preguntas de seguridad
    │   ├── observatorio/                      cargas de Excel del Observatorio y tendencia ocupacional
    │   ├── paginas/                           gobernanza de páginas: borrador, revisión, publicación, bloqueo
    │   └── usuarios/                          usuarios, roles, permisos y caducidad
    └── validators/                            esquemas Zod `.strict()` de entrada

docker/                                        despliegue en el servidor: compose, nginx, SQL de importación y manual
├── nginx/                                     nginx del servidor: una puerta para el sitio y otra para la intranet
└── sql/                                       pasos SQL de `deploy.sh importar`

docs/                                          la documentación del proyecto: guía, convenciones, seguridad, reglas, bitácora y este mapa
└── diagramas/

packages/                                      lo que las dos apps comparten con el mismo comportamiento
├── accessibility-policy/                      qué bloque exige texto alternativo o título de iframe (RF-14)
│   └── src/
├── blocks-renderer/                           pinta los bloques guardados igual en las dos apps
│   └── src/
├── email-policy/                              dominio de correo institucional
│   └── src/
├── inactividad/                               aviso y cierre de sesión por inactividad
│   └── src/
├── password-policy/                           política de contraseñas
│   └── src/
├── slug-policy/                               formato válido de un slug
│   └── src/
└── upload-policy/                             controles de subida: bytes mágicos, lista blanca, UUID, límites
    └── src/

scripts/                                       herramientas del repo que no son de una app
└── mapa/

test/                                          pruebas de carga con k6
└── pruebas-carga/
```

## Features

### 3000-sitio-web

| Feature | Para qué | Subcarpetas | `index.ts` | Archivos |
|---|---|---|:-:|--:|
| `administracion/` | el panel: usuarios, roles, auditoría, respaldos, cargas | `actualizaciones/` `auditoria/` `auth/` `buscador/` `mi-perfil/` `respaldos/` | **no** | 61 |
| `paginas/` | páginas editables con Puck, organizadas por etapa del ciclo | `edicion/` `menu-y-pie/` `model/` `publicacion/` `revision/` `secciones/` | sí | 37 |
| `sitio-web/` | agrupador de lo público | `buscador-ocupaciones/` `fuentes-futuras-empleo/` `inicio/` `programas-sobresalientes/` `tendencia-ocupacional/` | **no** | 42 |

### 3001-intranet

| Feature | Para qué | Subcarpetas | `index.ts` | Archivos |
|---|---|---|:-:|--:|
| `login/` | pantallas del flujo de acceso | `components/` `hooks/` `services/` | sí | 11 |
| `paginas/` | secciones editables con Puck, gemela de la del sitio | `edicion/` `menu-y-pie/` `model/` `publicacion/` `secciones/` | sí | 24 |

## Rutas de Next

La URL que ve el navegador y el archivo que la pinta. Los grupos entre paréntesis ordenan carpetas y no aparecen en la URL.

### 3000-sitio-web

| URL | Tipo | Grupo | Archivo |
|---|---|---|---|
| `/[slug]` | página | `(public)` | `(public)/[slug]/page.tsx` |
| `/admin/actualizaciones` | página |  | `admin/actualizaciones/page.tsx` |
| `/admin/auditoria` | página |  | `admin/auditoria/page.tsx` |
| `/admin/dashboard` | página |  | `admin/dashboard/page.tsx` |
| `/admin/dashboard/buscar` | página |  | `admin/dashboard/buscar/page.tsx` |
| `/admin/dashboard/configuracion` | página |  | `admin/dashboard/configuracion/page.tsx` |
| `/admin/dashboard/soporte` | página |  | `admin/dashboard/soporte/page.tsx` |
| `/admin/mi-perfil` | página |  | `admin/mi-perfil/page.tsx` |
| `/admin/respaldos` | página |  | `admin/respaldos/page.tsx` |
| `/admin/revision` | página |  | `admin/revision/page.tsx` |
| `/admin/roles` | página |  | `admin/roles/page.tsx` |
| `/admin/users` | página |  | `admin/users/page.tsx` |
| `/api/alerts` | manejador |  | `api/alerts/route.ts` |
| `/api/audit-logs` | manejador |  | `api/audit-logs/route.ts` |
| `/api/audit-logs/depurar` | manejador |  | `api/audit-logs/depurar/route.ts` |
| `/api/audit-logs/depurar/analizar` | manejador |  | `api/audit-logs/depurar/analizar/route.ts` |
| `/api/auth/first-login` | manejador |  | `api/auth/first-login/route.ts` |
| `/api/auth/first-login/status` | manejador |  | `api/auth/first-login/status/route.ts` |
| `/api/auth/login` | manejador |  | `api/auth/login/route.ts` |
| `/api/auth/logout` | manejador |  | `api/auth/logout/route.ts` |
| `/api/docs/pdf` | manejador |  | `api/docs/pdf/route.ts` |
| `/api/ocupaciones` | manejador |  | `api/ocupaciones/route.ts` |
| `/api/ocupaciones/[codigo]` | manejador |  | `api/ocupaciones/[codigo]/route.ts` |
| `/api/paginas/indice-busqueda` | manejador |  | `api/paginas/indice-busqueda/route.ts` |
| `/api/paginas/publicadas` | manejador |  | `api/paginas/publicadas/route.ts` |
| `/api/permissions` | manejador |  | `api/permissions/route.ts` |
| `/api/revalidar` | manejador |  | `api/revalidar/route.ts` |
| `/api/role-permissions` | manejador |  | `api/role-permissions/route.ts` |
| `/api/role-permissions/role/[roleId]` | manejador |  | `api/role-permissions/role/[roleId]/route.ts` |
| `/api/roles` | manejador |  | `api/roles/route.ts` |
| `/api/roles/[id]` | manejador |  | `api/roles/[id]/route.ts` |
| `/api/security-questions/catalog` | manejador |  | `api/security-questions/catalog/route.ts` |
| `/api/security-questions/recover-password` | manejador |  | `api/security-questions/recover-password/route.ts` |
| `/api/security-questions/user-questions` | manejador |  | `api/security-questions/user-questions/route.ts` |
| `/api/security-questions/verify` | manejador |  | `api/security-questions/verify/route.ts` |
| `/api/upload` | manejador |  | `api/upload/route.ts` |
| `/api/users` | manejador |  | `api/users/route.ts` |
| `/api/users/[id]` | manejador |  | `api/users/[id]/route.ts` |
| `/clasificacion` | página | `(public)` | `(public)/clasificacion/page.tsx` |
| `/clasificacion/cno` | página | `(public)` | `(public)/clasificacion/cno/page.tsx` |
| `/clasificacion/cuoc` | página | `(public)` | `(public)/clasificacion/cuoc/page.tsx` |
| `/editor/[slug]` | página |  | `editor/[slug]/page.tsx` |
| `/first-login` | página | `(auth)` | `(auth)/first-login/page.tsx` |
| `/inicio` | página | `(public)` | `(public)/inicio/page.tsx` |
| `/login` | página | `(auth)` | `(auth)/login/page.tsx` |
| `/manifest.webmanifest` | metadatos |  | `manifest.ts` |
| `/politica-de-privacidad` | página | `(public)` | `(public)/politica-de-privacidad/page.tsx` |
| `/preview/[slug]` | página |  | `preview/[slug]/page.tsx` |
| `/programas-sobresalientes` | página | `(public)` | `(public)/programas-sobresalientes/page.tsx` |
| `/recovery` | página | `(auth)` | `(auth)/recovery/page.tsx` |
| `/reset-password` | página | `(auth)` | `(auth)/reset-password/page.tsx` |
| `/reset-success` | página | `(auth)` | `(auth)/reset-success/page.tsx` |
| `/security-questions` | página | `(auth)` | `(auth)/security-questions/page.tsx` |
| `/storage/[...ruta]` | manejador |  | `storage/[...ruta]/route.ts` |

### 3001-intranet

| URL | Tipo | Grupo | Archivo |
|---|---|---|---|
| `/` | página |  | `page.tsx` |
| `/[...puckPath]` | página | `(secciones)` | `(secciones)/[...puckPath]/page.tsx` |
| `/api/upload` | manejador |  | `api/upload/route.ts` |
| `/editor/[slug]` | página |  | `editor/[slug]/page.tsx` |
| `/first-login` | página | `(auth)` | `(auth)/first-login/page.tsx` |
| `/login` | página | `(auth)` | `(auth)/login/page.tsx` |
| `/manifest.webmanifest` | metadatos |  | `manifest.ts` |
| `/preview/[slug]` | página |  | `preview/[slug]/page.tsx` |
| `/recovery` | página | `(auth)` | `(auth)/recovery/page.tsx` |
| `/reset-password` | página | `(auth)` | `(auth)/reset-password/page.tsx` |
| `/reset-success` | página | `(auth)` | `(auth)/reset-success/page.tsx` |
| `/security-questions` | página | `(auth)` | `(auth)/security-questions/page.tsx` |
| `/storage/[...ruta]` | manejador |  | `storage/[...ruta]/route.ts` |

## Endpoints de la API

🔓 = ninguna protección de sesión o permiso a la vista (puede ser público a propósito, como el login).

### `app.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/health` | 🔓 — | función en línea |
| GET | `/api/alerts` | requireAuth, requierePermisoUsuario('puedeAdministrarUsuarios') | UserController.getExpirationAlerts |

### `routes/audit.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/audit-logs` | requireAuth, requierePermisoAuditoria('puedeVer'), requirePermission('auditoria.ver') | AuditController.getAll |
| GET | `/api/audit-logs/depurar/analizar` | requireAuth, requierePermisoAuditoria('puedeVer'), requirePermission('auditoria.ver') | AuditController.analizarDepuracion |
| POST | `/api/audit-logs/depurar` | requireAuth, requierePermisoAuditoria('puedeVer'), requirePermission('auditoria.ver') | AuditController.ejecutarDepuracion |

### `routes/auth.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| POST | `/api/login` | 🔓 limitadorDeLogin | AuthController.login |
| GET | `/api/first-login/status` | requireAuth | AuthController.firstLoginStatus |
| POST | `/api/first-login` | requireAuth | AuthController.firstLogin |
| POST | `/api/logout` | 🔓 limitadorDeLogout | AuthController.logout |
| GET | `/api/me` | requireAuth | AuthController.me |
| POST | `/api/change-password` | requireAuth | AuthController.changePassword |

### `routes/observatorio.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/observatorio/programas-sobresalientes` | 🔓 — | ObservatorioController.obtenerActual |
| GET | `/api/observatorio/tendencia-ocupacional` | 🔓 — | TendenciaOcupacionalController.buscar |
| GET | `/api/observatorio/tendencia-ocupacional/opciones` | 🔓 — | TendenciaOcupacionalController.opciones |
| GET | `/api/observatorio/fuentes-futuras-empleo` | 🔓 — | ObservatorioController.obtenerFuentesFuturasEmpleo |
| GET | `/api/observatorio/cargas` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | ObservatorioController.listarCargas |
| POST | `/api/observatorio/cargas` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos'), subidaEnMemoria.single('file') | ObservatorioController.subir |
| GET | `/api/observatorio/cargas/:id` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | ObservatorioController.obtenerCarga |
| DELETE | `/api/observatorio/cargas/:id` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | ObservatorioController.eliminarCarga |
| GET | `/api/observatorio/formatos/:formato` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | ObservatorioController.descargarFormato |
| GET | `/api/observatorio/tendencia-ocupacional/cargas` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | TendenciaOcupacionalController.listarCargas |
| POST | `/api/observatorio/tendencia-ocupacional/cargas` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos'), subidaEnMemoria.single('file'), validarCuerpo(cargaTendenciaSchema) | TendenciaOcupacionalController.subir |
| GET | `/api/observatorio/tendencia-ocupacional/cargas/:id` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | TendenciaOcupacionalController.obtenerCarga |
| DELETE | `/api/observatorio/tendencia-ocupacional/cargas/:id` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos'), requierePermisoObservatorio('puedePublicarDatos') | TendenciaOcupacionalController.eliminarCarga |
| GET | `/api/observatorio/tendencia-ocupacional/estado` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | TendenciaOcupacionalController.estado |
| POST | `/api/observatorio/tendencia-ocupacional/cortes/publicar` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos'), requierePermisoObservatorio('puedePublicarDatos'), validarCuerpo(publicarCortesSchema) | TendenciaOcupacionalController.publicar |
| PATCH | `/api/observatorio/tendencia-ocupacional/cortes/:id/despublicar` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos'), requierePermisoObservatorio('puedePublicarDatos') | TendenciaOcupacionalController.despublicar |

### `routes/pagina.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/paginas/publica/:slug` | 🔓 cacheInterceptor(300, { varyBy: [AMBITO_HEADER] }) | PaginaController.obtenerPublica |
| GET | `/api/paginas/indice-busqueda` | 🔓 cacheInterceptor(300, { varyBy: [AMBITO_HEADER] }) | PaginaController.obtenerIndiceBusqueda |
| POST | `/api/paginas/visitas/registrar` | 🔓 — | PaginaController.registrarVisita |
| POST | `/api/paginas` | requireAuth, limitadorDeEscritura, requierePermisoPagina('puedeEditar'), requirePermission('secciones.crear'), validarCuerpo(crearSeccionSchema) | PaginaController.crearSeccion |
| GET | `/api/paginas/:slug/eliminable` | requireAuth, requierePermisoPagina('puedeEditar'), requirePermission('secciones.eliminar') | PaginaController.analizarEliminacion |
| DELETE | `/api/paginas/:slug` | requireAuth, limitadorDeEscritura, requierePermisoPagina('puedeEditar'), requirePermission('secciones.eliminar'), validarCuerpo(eliminarSeccionSchema) | PaginaController.eliminarSeccion |
| GET | `/api/paginas/:slug/editable` | requireAuth, requierePermisoPagina('puedeEditar'), requierePermisoDeSeccion() | PaginaController.obtenerEditable |
| POST | `/api/paginas/:slug/borrador` | requireAuth, limitadorDeEscritura, requierePermisoPagina('puedeEditar'), requierePermisoDeSeccion(), validarCuerpo(guardarBorradorSchema) | PaginaController.guardarBorrador |
| POST | `/api/paginas/:slug/subidas` | requireAuth, requierePermisoPagina('puedeEditar'), requierePermisoDeSeccion(), validarCuerpo(registrarSubidaSchema) | PaginaController.registrarSubida |
| POST | `/api/paginas/:slug/bloqueo` | requireAuth, requierePermisoPagina('puedeEditar'), requierePermisoDeSeccion(), validarCuerpo(adquirirBloqueoSchema) | PaginaController.adquirirBloqueo |
| DELETE | `/api/paginas/:slug/bloqueo` | requireAuth, requierePermisoPagina('puedeEditar'), requierePermisoDeSeccion() | PaginaController.liberarBloqueo |
| POST | `/api/paginas/:slug/descartar-edicion` | requireAuth, requierePermisoPagina('puedeEditar'), requierePermisoDeSeccion() | PaginaController.descartarEdicion |
| GET | `/api/paginas/:slug/bloqueo` | requireAuth, requierePermisoPagina('puedeEditar') | PaginaController.consultarBloqueo |
| PATCH | `/api/paginas/:slug/enviar-revision` | requireAuth, limitadorDeEscritura, requierePermisoPagina('puedeEditar'), requierePermisoDeSeccion(), validarCuerpo(enviarARevisionSchema) | PaginaController.enviarARevision |
| DELETE | `/api/paginas/:slug/versiones/:versionId` | requireAuth, requierePermisoPagina('puedePublicar') | PaginaController.eliminarVersion |
| PATCH | `/api/paginas/:slug/aprobar` | requireAuth, requierePermisoPagina('puedePublicar') | PaginaController.aprobar |
| PATCH | `/api/paginas/:slug/rechazar` | requireAuth, requierePermisoPagina('puedeRechazar') | PaginaController.rechazar |
| GET | `/api/paginas/en-revision` | requireAuth, requierePermisoPagina('puedePublicar') | PaginaController.listarEnRevision |
| GET | `/api/paginas/respaldos` | requireAuth, requireAuth | PaginaController.listarRespaldos |
| GET | `/api/paginas/respaldos/analizar-depuracion` | requireAuth, requireAuth | PaginaController.analizarDepuracion |
| POST | `/api/paginas/respaldos/depurar` | requireAuth, requireAuth, requierePermisoPagina('puedePublicar') | PaginaController.depurarVersiones |
| GET | `/api/paginas/publicadas` | requireAuth, requireAuth | PaginaController.listarPublicadas |
| POST | `/api/paginas/:slug/restaurar` | requireAuth, requierePermisoPagina('puedePublicar') | PaginaController.restaurar |

### `routes/permission.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/permissions` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | PermissionController.getAll |

### `routes/role-permission.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/role-permissions` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RolePermissionController.getAll |
| GET | `/api/role-permissions/role/:roleId` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RolePermissionController.getByRole |
| POST | `/api/role-permissions` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RolePermissionController.assign |
| DELETE | `/api/role-permissions` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RolePermissionController.revoke |

### `routes/role.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/roles/:id` | requireAuth, administraOEsSuRol | RoleController.getById |
| GET | `/api/roles` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RoleController.getAll |
| POST | `/api/roles` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RoleController.create |
| PATCH | `/api/roles/:id` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RoleController.update |
| DELETE | `/api/roles/:id` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RoleController.delete |

### `routes/security-question.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/security-questions/catalog` | 🔓 — | SecurityQuestionController.getCatalog |
| POST | `/api/security-questions/user-questions` | 🔓 limitadorDePreguntas | SecurityQuestionController.getQuestionKeysForUser |
| POST | `/api/security-questions/setup` | requireAuth | SecurityQuestionController.setupQuestions |
| POST | `/api/security-questions/verify` | 🔓 limitadorDeVerificacion | SecurityQuestionController.verifyAnswersCtrl |
| POST | `/api/security-questions/recover-password` | 🔓 limitadorDeRecuperacion | SecurityQuestionController.recoverPasswordCtrl |

### `routes/user.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/users` | requireAuth, requierePermisoUsuario('puedeAdministrarUsuarios') | UserController.getAll |
| POST | `/api/users` | requireAuth, requierePermisoUsuario('puedeAdministrarUsuarios'), requirePermission('usuarios.crear'), validarCuerpo(crearUsuarioSchema) | UserController.create |
| GET | `/api/users/:id` | requireAuth, administraOEsSuCuenta | UserController.getById |
| PATCH | `/api/users/:id` | requireAuth, administraOEsSuCuenta, exigePermisoSalvoCuentaPropia('usuarios.editar'), validarCuerpo(actualizarUsuarioSchema) | UserController.update |
| DELETE | `/api/users/:id` | requireAuth, requierePermisoUsuario('puedeAdministrarUsuarios'), requirePermission('usuarios.eliminar') | UserController.delete |

## Librerías

### Paquetes compartidos (`packages/`)

| Paquete | Carpeta | Lo usan |
|---|---|---|
| `@olo/accessibility-policy` | `packages/accessibility-policy/` | `3000-sitio-web`, `3001-intranet`, `4000-api-backend` |
| `@olo/blocks-renderer` | `packages/blocks-renderer/` | `3000-sitio-web`, `3001-intranet` |
| `@olo/email-policy` | `packages/email-policy/` | `3000-sitio-web`, `3001-intranet` |
| `@olo/inactividad` | `packages/inactividad/` | `3000-sitio-web`, `3001-intranet` |
| `@olo/password-policy` | `packages/password-policy/` | `3000-sitio-web`, `3001-intranet` |
| `@olo/slug-policy` | `packages/slug-policy/` | `3000-sitio-web`, `3001-intranet`, `4000-api-backend` |
| `@olo/upload-policy` | `packages/upload-policy/` | `3000-sitio-web`, `3001-intranet`, `4000-api-backend` |

### 3000-sitio-web

| Librería | Versión | Para |
|---|---|---|
| `@editorjs/editorjs` | `^2.31.6` | producción |
| `@editorjs/header` | `^2.8.9` | producción |
| `@editorjs/list` | `^2.0.9` | producción |
| `@editorjs/paragraph` | `^2.11.7` | producción |
| `@editorjs/quote` | `^2.7.6` | producción |
| `@heroicons/react` | `^2.2.0` | producción |
| `@olo/accessibility-policy` | `file:../packages/accessibility-policy` | producción |
| `@olo/blocks-renderer` | `file:../packages/blocks-renderer` | producción |
| `@olo/email-policy` | `file:../packages/email-policy` | producción |
| `@olo/inactividad` | `file:../packages/inactividad` | producción |
| `@olo/password-policy` | `file:../packages/password-policy` | producción |
| `@olo/slug-policy` | `file:../packages/slug-policy` | producción |
| `@olo/upload-policy` | `file:../packages/upload-policy` | producción |
| `@puckeditor/core` | `^0.22.0` | producción |
| `@tailwindcss/postcss` | `^4` | desarrollo |
| `@types/node` | `^20` | desarrollo |
| `@types/react` | `^19` | desarrollo |
| `@types/react-dom` | `^19` | desarrollo |
| `axios` | `^1.18.1` | producción |
| `docx-preview` | `^0.4.0` | producción |
| `echarts` | `^6.1.0` | producción |
| `eslint` | `^9` | desarrollo |
| `eslint-config-next` | `16.2.10` | desarrollo |
| `file-type` | `^22.0.2` | producción |
| `framer-motion` | `^12.42.2` | producción |
| `handsontable` | `^18.0.0` | producción |
| `jose` | `^6.2.3` | producción |
| `lucide-react` | `^1.39.0` | producción |
| `next` | `^16.3.0` | producción |
| `react` | `19.2.4` | producción |
| `react-dom` | `19.2.4` | producción |
| `tailwindcss` | `^4` | desarrollo |
| `typescript` | `^5` | desarrollo |

### 3001-intranet

| Librería | Versión | Para |
|---|---|---|
| `@aiden0z/pptx-renderer` | `^1.2.4` | producción |
| `@headlessui/react` | `^2.2.10` | producción |
| `@heroicons/react` | `^2.2.0` | producción |
| `@material-tailwind/react` | `^2.1.10` | producción |
| `@olo/accessibility-policy` | `file:../packages/accessibility-policy` | producción |
| `@olo/blocks-renderer` | `file:../packages/blocks-renderer` | producción |
| `@olo/email-policy` | `file:../packages/email-policy` | producción |
| `@olo/inactividad` | `file:../packages/inactividad` | producción |
| `@olo/password-policy` | `file:../packages/password-policy` | producción |
| `@olo/slug-policy` | `file:../packages/slug-policy` | producción |
| `@olo/upload-policy` | `file:../packages/upload-policy` | producción |
| `@puckeditor/core` | `^0.22.2` | producción |
| `@tailwindcss/postcss` | `^4` | desarrollo |
| `@types/node` | `^20` | desarrollo |
| `@types/react` | `^19` | desarrollo |
| `@types/react-dom` | `^19` | desarrollo |
| `clsx` | `^2.1.1` | producción |
| `eslint` | `^9` | desarrollo |
| `eslint-config-next` | `16.2.10` | desarrollo |
| `file-type` | `^22.0.1` | producción |
| `jose` | `^6.2.3` | producción |
| `next` | `^16.3.0` | producción |
| `react` | `19.2.4` | producción |
| `react-dom` | `19.2.4` | producción |
| `tailwind-merge` | `^3.6.0` | producción |
| `tailwindcss` | `^4` | desarrollo |
| `typescript` | `^5` | desarrollo |

### 4000-api-backend

| Librería | Versión | Para |
|---|---|---|
| `@neondatabase/serverless` | `^1.1.0` | producción |
| `@olo/accessibility-policy` | `file:../packages/accessibility-policy` | producción |
| `@olo/slug-policy` | `file:../packages/slug-policy` | producción |
| `@olo/upload-policy` | `file:../packages/upload-policy` | producción |
| `@types/bcryptjs` | `^2.4.6` | desarrollo |
| `@types/cookie-parser` | `^1.4.10` | desarrollo |
| `@types/cors` | `^2.8.17` | desarrollo |
| `@types/express` | `^5.0.0` | desarrollo |
| `@types/jsdom` | `^30.0.0` | desarrollo |
| `@types/jsonwebtoken` | `^9.0.7` | desarrollo |
| `@types/morgan` | `^1.9.9` | desarrollo |
| `@types/multer` | `^1.4.12` | desarrollo |
| `@types/node` | `^22.10.2` | desarrollo |
| `@types/swagger-jsdoc` | `^6.0.4` | desarrollo |
| `@types/swagger-ui-express` | `^4.1.8` | desarrollo |
| `@types/ws` | `^8.18.1` | desarrollo |
| `bcryptjs` | `^3.0.3` | producción |
| `bullmq` | `^5.80.5` | producción |
| `cookie-parser` | `^1.4.7` | producción |
| `cors` | `^2.8.5` | producción |
| `dompurify` | `^3.4.13` | producción |
| `dotenv` | `^16.4.7` | producción |
| `exceljs` | `^4.4.0` | producción |
| `express` | `^5.1.0` | producción |
| `express-rate-limit` | `^8.5.2` | producción |
| `file-type` | `^16.5.4` | producción |
| `helmet` | `^8.0.0` | producción |
| `ioredis` | `^5.4.2` | producción |
| `jsdom` | `^29.1.1` | producción |
| `jsonwebtoken` | `^9.0.2` | producción |
| `morgan` | `^1.10.0` | producción |
| `multer` | `^2.0.1` | producción |
| `pg` | `^8.13.1` | producción |
| `pg-hstore` | `^2.3.4` | producción |
| `rate-limit-redis` | `^6.0.1` | producción |
| `sequelize` | `^6.37.5` | producción |
| `swagger-jsdoc` | `^6.3.0` | producción |
| `swagger-ui-express` | `^5.0.1` | producción |
| `ts-node` | `^10.9.2` | desarrollo |
| `typescript` | `^5.7.2` | desarrollo |
| `ws` | `^8.21.2` | producción |
| `zod` | `^3.24.1` | producción |

## Base de datos

### Migraciones

En el orden del manifiesto (`migrations/index.ts`), que es el orden en que corren.

- `001-esquema-base`
- `002-tablas-nuevas`
- `003-restricciones-e-indices`
- `004-contenidos-secciones-archivos`
- `005-identidad`
- `006-auditoria-unificada`
- `007-paginas-ambito`
- `008-paginas-slug-unico-por-ambito`
- `009-limpiar-restricciones-duplicadas`
- `010-agregar-apellidos-usuarios`
- `011-politica-passwords`
- `012-catalogo-permisos`
- `013-eliminar-usuarios-sitio`
- `014-renombrar-slug-menu-y-pie`
- `015-inicio-texto-enriquecido`
- `016-permiso-crear-secciones`
- `017-titulo-menu-y-pie`
- `018-revertir-titulos-intranet`
- `019-permiso-eliminar-secciones`
- `020-depuracion-y-optimizacion-esquema`
- `021-bloqueos-edicion`
- `022-auditoria-guardar-borrador`
- `023-permiso-politica-privacidad-sitio`
- `024-subidas-pendientes`
- `025-visitas-paginas`
- `026-observatorio-programas-sobresalientes`
- `027-cargas-datos`
- `028-cargas-datos-progreso`
- `029-comentario-cambios-versiones`
- `030-acciones-seguridad-auditoria`
- `031-bloqueo-y-preguntas-auditoria`
- `032-departamentos-catalogo-unico`
- `033-tendencia-ocupacional`
- `034-cortes-ocupacionales-huella-repetible`
- `035-tendencia-anio-libre`
- `036-eliminar-cms-tradicional`
- `037-tendencia-ocupacional-claves-uuid`
- `038-auditoria-autoguardado`

### Modelos

| Modelo | Tabla |
|---|---|
| `archivo` | `archivos` |
| `bloqueo-edicion` | `bloqueos_edicion` |
| `carga-datos` | `cargas_datos` |
| `centro-formacion` | `centros_formacion` |
| `content-audit-log` | `auditoria_cambios` |
| `departamento` | `departamentos` |
| `nivel-formacion` | `niveles_formacion` |
| `pagina-version` | `paginas_versiones` |
| `pagina` | `paginas` |
| `permission` | `permisos` |
| `programa-formacion` | `programas_formacion` |
| `programa-sobresaliente` | `programas_sobresalientes` |
| `role-permission` | `roles_permisos` |
| `role` | `roles` |
| `security-question` | `preguntas_seguridad` |
| `subida-pendiente` | `subidas_pendientes` |
| `user` | `usuarios` |
