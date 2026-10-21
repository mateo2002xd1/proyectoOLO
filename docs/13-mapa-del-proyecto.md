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
| `3000-sitio-web` | 50 | 2 | 47 | — | 33 |
| `3001-intranet` | 36 | 2 | 14 | — | 27 |
| `4000-api-backend` | 35 | — | — | 96 | 43 |

Paquetes compartidos: 7 · migraciones: 46 · modelos: 23.

## Carpetas sin descripción (3)

Cada carpeta de estos niveles tiene que decir para qué es. Se describe en `scripts/mapa/descripciones.md` con una línea: `` - `ruta/` — para qué es ``.

- `4000-api-backend/src/use-cases/alertas-inversion/`
- `4000-api-backend/src/use-cases/configuracion/`
- `auditorias/`

## Carpetas

```text
.githooks/                                     hooks de git del equipo: regeneran el mapa en cada commit y cada pull

.vscode/                                       ajustes compartidos del editor

3000-sitio-web/                                sitio público (ISR) y panel administrativo (Next.js)
├── public/                                    estáticos: imágenes, logos y PWA
│   └── assets/
└── src/                                       código del sitio
    ├── app/                                   solo enrutamiento: `(public)`, `(auth)`, `admin`, `editor`, `preview`, `api`
    │   ├── (auth)/
    │   ├── (pages)/
    │   ├── admin-panel/
    │   ├── api/
    │   ├── edit/
    │   └── preview/
    ├── config/                                catálogo de bloques del editor (`puck.config.tsx`)
    ├── features/                              un dominio por carpeta
    │   ├── admin-panel/                       el panel: usuarios, roles, auditoría, respaldos, cargas
    │   │   ├── auth/                          login, primer ingreso, recuperación, usuarios y roles
    │   │   ├── backup-section/                restaurar versiones archivadas de una página
    │   │   ├── changelog-view/                historial de cambios (RF-07)
    │   │   ├── configuration/                 preferencias del panel en este navegador, como el sonido de los avisos
    │   │   ├── search/                        buscador del propio panel
    │   │   └── update-section/                cargas de Excel del Observatorio y su historial
    │   └── editor/                            páginas editables con Puck, organizadas por etapa del ciclo
    │       ├── edition/                       etapa 1: borrador, editor, subidas y candado
    │       ├── model/                         lo que comparten las etapas del dominio
    │       ├── navegation/                    cabecera y pie de todo el sitio
    │       ├── publishing/                    etapa 6: lo que ve el público (ISR, sin credenciales)
    │       ├── review/                        etapas 3 a 5: cola de revisión, aprobar, rechazar
    │       └── sections/                      crear y eliminar páginas
    ├── shared/                                lo transversal del sitio: sistema de diseño y utilidades
    │   ├── lib/                               utilidades transversales: cliente HTTP, sesión, bloques
    │   │   ├── accesibilidad/                 botón y panel de accesibilidad del sitio público, y las preferencias del visitante
    │   │   ├── alertas-inversion/             alertas de inversión: filtros, gráfico por sector y listado de proyectos
    │   │   ├── api/                           cliente HTTP, URL de la API, lectura de sus errores y el proxy con cookie a la API
    │   │   ├── blocks/                        los bloques Puck de esta app
    │   │   ├── buscador-ocupaciones/          buscador CNO/CUOC (RF-09)
    │   │   ├── geography/                     geometría de los departamentos de Colombia para los mapas
    │   │   ├── identidad-panel/               logo, icono y colores de etiquetas y botones del panel
    │   │   ├── inactividad/                   aviso y cierre de sesión por inactividad
    │   │   ├── mobile/                        navegación mobile del panel: barra de abajo con el logo al centro
    │   │   ├── modals/                        la salida animada de los modales (`useCierreAnimado`)
    │   │   ├── programas-sobresalientes/      mapa, filtros y tabla del Observatorio
    │   │   ├── pwa/                           manifiesto, íconos y registro del service worker
    │   │   ├── session/                       cookies de sesión, lectura y verificación de la sesión, y a qué paso del primer ingreso va una cuenta
    │   │   ├── sonido-avisos/                 el tono de los avisos flotantes y la preferencia de silenciarlo
    │   │   ├── tema/                          tema oscuro del panel, sin parpadeo al cargar
    │   │   ├── tendencia-ocupacional/         tendencia ocupacional (bloque Puck)
    │   │   └── typography/                    las letras que carga la app (`next/font`)
    │   └── ui/                                sistema de diseño institucional y catálogo del editor
    │       ├── atoms/                         piezas mínimas: botón, avatar, interruptor…
    │       ├── molecules/                     piezas compuestas: alertas, paginación, selectores…
    │       └── organisms/                     navbar y barra lateral del panel
    └── style/                                 `globals.css` y los tokens de Tailwind

3001-intranet/                                 intranet de directores y subdirectores, 100 % protegida (Next.js)
├── public/                                    estáticos: imágenes e íconos de la PWA
│   └── assets/
└── src/                                       código de la intranet
    ├── app/                                   solo enrutamiento: `(secciones)` (comodín Puck), `(auth)`, `editor`, `preview`
    │   ├── (auth)/
    │   ├── (pages)/
    │   ├── edit/
    │   └── preview/
    ├── config/                                catálogo de bloques del editor de la intranet
    ├── features/                              un dominio por carpeta
    │   ├── editor/                            secciones editables con Puck, gemela de la del sitio
    │   │   ├── edition/                       etapa 1: borrador, editor, subidas y candado
    │   │   ├── model/                         lo que comparten las etapas del dominio
    │   │   ├── navegation/                    cabecera y pie de la intranet
    │   │   ├── publishing/                    lo que ven directores y subdirectores
    │   │   └── sections/                      crear y eliminar secciones
    │   └── login/                             pantallas del flujo de acceso
    │       ├── components/                    UI del dominio
    │       ├── hooks/                         estado y efectos del dominio
    │       └── services/                      única capa que llama a la API
    ├── shared/                                lo transversal de la intranet
    │   ├── lib/                               utilidades transversales: cliente HTTP, sesión, bloques
    │   │   ├── api/                           cliente HTTP, lectura de errores y la URL del sitio web
    │   │   ├── blocks/                        los bloques Puck de la intranet
    │   │   ├── inactividad/                   aviso y cierre de sesión por inactividad
    │   │   ├── layout/                        cuántas piezas caben en un ancho (`useCuantosCaben`)
    │   │   ├── mobile/                        navegación mobile de la intranet, con el menú de la plantilla
    │   │   ├── modals/                        la salida animada de los modales (`useCierreAnimado`)
    │   │   ├── pwa/                           manifiesto, íconos y registro del service worker
    │   │   ├── session/                       lectura y verificación de la sesión, y quién edita páginas
    │   │   └── typography/                    las letras que carga la app (`next/font`)
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
    │   └── storage/                           el filesystem de lo subido, fuera del código, y el respaldo de los archivos de cada página
    ├── middlewares/                           sesión, permisos, Zod, límites de tasa, caché y errores
    ├── policies/                              quién puede hacer qué, por acción
    ├── repositories/                          única capa que consulta los modelos Sequelize
    ├── routes/                                solo declaran endpoints y sus protecciones; cero lógica
    ├── shared/                                utilidades transversales: sanitización, permisos, auditoría
    ├── types/                                 tipos globales (extensión del `Request` de Express)
    ├── use-cases/                             la lógica de negocio: una acción, una función
    │   ├── alertas-inversion/                 ⚠ sin descripción
    │   ├── archivos/                          subida de los adjuntos de las páginas (RF-02)
    │   ├── auditoria/                         consulta de la bitácora de cambios (RF-07)
    │   ├── auth/                              login, primer ingreso y preguntas de seguridad
    │   ├── configuracion/                     ⚠ sin descripción
    │   ├── observatorio/                      cargas de Excel del Observatorio y tendencia ocupacional
    │   ├── paginas/                           gobernanza de páginas: borrador, revisión, publicación, bloqueo
    │   └── usuarios/                          usuarios, roles, permisos y caducidad
    └── validators/                            esquemas Zod `.strict()` de entrada

auditorias/                                    ⚠ sin descripción

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
| `admin-panel/` | el panel: usuarios, roles, auditoría, respaldos, cargas | `auth/` `backup-section/` `changelog-view/` `configuration/` `search/` `update-section/` | **no** | 77 |
| `editor/` | páginas editables con Puck, organizadas por etapa del ciclo | `edition/` `model/` `navegation/` `publishing/` `review/` `sections/` | sí | 40 |

### 3001-intranet

| Feature | Para qué | Subcarpetas | `index.ts` | Archivos |
|---|---|---|:-:|--:|
| `editor/` | secciones editables con Puck, gemela de la del sitio | `edition/` `model/` `navegation/` `publishing/` `sections/` | sí | 26 |
| `login/` | pantallas del flujo de acceso | `components/` `hooks/` `services/` | sí | 14 |

## Rutas de Next

La URL que ve el navegador y el archivo que la pinta. Los grupos entre paréntesis ordenan carpetas y no aparecen en la URL.

### 3000-sitio-web

| URL | Tipo | Grupo | Archivo |
|---|---|---|---|
| `/[...puckPath]` | página | `(pages)` | `(pages)/[...puckPath]/page.tsx` |
| `/admin-panel/backup-section` | página |  | `admin-panel/backup-section/page.tsx` |
| `/admin-panel/changelog-view` | página |  | `admin-panel/changelog-view/page.tsx` |
| `/admin-panel/configuration` | página |  | `admin-panel/configuration/page.tsx` |
| `/admin-panel/dashboard` | página |  | `admin-panel/dashboard/page.tsx` |
| `/admin-panel/review-section` | página |  | `admin-panel/review-section/page.tsx` |
| `/admin-panel/roles-and-permissions` | página |  | `admin-panel/roles-and-permissions/page.tsx` |
| `/admin-panel/search-section` | página |  | `admin-panel/search-section/page.tsx` |
| `/admin-panel/update-section` | página |  | `admin-panel/update-section/page.tsx` |
| `/admin-panel/users` | página |  | `admin-panel/users/page.tsx` |
| `/api/alerts` | manejador |  | `api/alerts/route.ts` |
| `/api/audit-logs` | manejador |  | `api/audit-logs/route.ts` |
| `/api/audit-logs/depurar` | manejador |  | `api/audit-logs/depurar/route.ts` |
| `/api/audit-logs/depurar/analizar` | manejador |  | `api/audit-logs/depurar/analizar/route.ts` |
| `/api/auth/first-login` | manejador |  | `api/auth/first-login/route.ts` |
| `/api/auth/first-login/status` | manejador |  | `api/auth/first-login/status/route.ts` |
| `/api/auth/login` | manejador |  | `api/auth/login/route.ts` |
| `/api/auth/logout` | manejador |  | `api/auth/logout/route.ts` |
| `/api/backend/[...path]` | manejador |  | `api/backend/[...path]/route.ts` |
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
| `/api/users` | manejador |  | `api/users/route.ts` |
| `/api/users/[id]` | manejador |  | `api/users/[id]/route.ts` |
| `/edit/[slug]` | página |  | `edit/[slug]/page.tsx` |
| `/login` | página | `(auth)` | `(auth)/login/page.tsx` |
| `/login/first-login` | página | `(auth)` | `(auth)/login/first-login/page.tsx` |
| `/login/first-login/change-password` | página | `(auth)` | `(auth)/login/first-login/change-password/page.tsx` |
| `/login/first-login/security-questions` | página | `(auth)` | `(auth)/login/first-login/security-questions/page.tsx` |
| `/login/recovery` | página | `(auth)` | `(auth)/login/recovery/page.tsx` |
| `/login/recovery/reset-password` | página | `(auth)` | `(auth)/login/recovery/reset-password/page.tsx` |
| `/login/recovery/reset-success` | página | `(auth)` | `(auth)/login/recovery/reset-success/page.tsx` |
| `/login/recovery/security-questions` | página | `(auth)` | `(auth)/login/recovery/security-questions/page.tsx` |
| `/manifest.webmanifest` | metadatos |  | `manifest.ts` |
| `/preview/[slug]` | página |  | `preview/[slug]/page.tsx` |

### 3001-intranet

| URL | Tipo | Grupo | Archivo |
|---|---|---|---|
| `/` | página |  | `page.tsx` |
| `/[...puckPath]` | página | `(pages)` | `(pages)/[...puckPath]/page.tsx` |
| `/edit/[slug]` | página |  | `edit/[slug]/page.tsx` |
| `/login` | página | `(auth)` | `(auth)/login/page.tsx` |
| `/login/first-login` | página | `(auth)` | `(auth)/login/first-login/page.tsx` |
| `/login/first-login/change-password` | página | `(auth)` | `(auth)/login/first-login/change-password/page.tsx` |
| `/login/first-login/change-success` | página | `(auth)` | `(auth)/login/first-login/change-success/page.tsx` |
| `/login/first-login/security-questions` | página | `(auth)` | `(auth)/login/first-login/security-questions/page.tsx` |
| `/login/recovery` | página | `(auth)` | `(auth)/login/recovery/page.tsx` |
| `/login/recovery/reset-password` | página | `(auth)` | `(auth)/login/recovery/reset-password/page.tsx` |
| `/login/recovery/reset-success` | página | `(auth)` | `(auth)/login/recovery/reset-success/page.tsx` |
| `/login/recovery/security-questions` | página | `(auth)` | `(auth)/login/recovery/security-questions/page.tsx` |
| `/manifest.webmanifest` | metadatos |  | `manifest.ts` |
| `/preview/[slug]` | página |  | `preview/[slug]/page.tsx` |

## Endpoints de la API

🔓 = ninguna protección de sesión o permiso a la vista (puede ser público a propósito, como el login).

### `app.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/health` | 🔓 — | función en línea |
| GET | `/api/alerts` | requireAuth, requierePermisoUsuario('puedeAdministrarUsuarios') | UserController.getExpirationAlerts |

### `routes/alertas-inversion.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/alertas-inversion/grafico` | 🔓 — | AlertasInversionController.grafico |
| GET | `/api/alertas-inversion/listado` | 🔓 — | AlertasInversionController.listado |
| GET | `/api/alertas-inversion/opciones` | 🔓 — | AlertasInversionController.opciones |
| GET | `/api/alertas-inversion/cargas` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos') | AlertasInversionController.listarCargas |
| POST | `/api/alertas-inversion/cargas` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos'), subidaEnMemoria.single('file') | AlertasInversionController.subir |
| GET | `/api/alertas-inversion/cargas/:id` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos') | AlertasInversionController.obtenerCarga |
| DELETE | `/api/alertas-inversion/cargas/:id` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos') | AlertasInversionController.eliminarCarga |
| GET | `/api/alertas-inversion/formatos/plantilla` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos') | AlertasInversionController.descargarFormato |
| POST | `/api/alertas-inversion/proyectos` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos'), validarCuerpo(crearProyectoManualSchema) | AlertasInversionController.crearManual |
| GET | `/api/alertas-inversion/formatos/sectores` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos') | AlertasInversionController.descargarFormatoSectores |
| POST | `/api/alertas-inversion/sectores` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos'), subidaEnMemoria.single('file') | AlertasInversionController.actualizarSectores |
| GET | `/api/alertas-inversion/proyectos` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos') | AlertasInversionController.listarProyectos |
| DELETE | `/api/alertas-inversion/proyectos` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos') | AlertasInversionController.eliminarTodosLosProyectos |
| DELETE | `/api/alertas-inversion/proyectos/:id` | requireAuth, requierePermisoAlertasInversion('puedeActualizarDatos') | AlertasInversionController.eliminarProyecto |

### `routes/archivos.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| POST | `/api/archivos/sitio` | 🔓 ...guardiasDeSubida | ArchivosController.subir('sitio') |
| POST | `/api/archivos/intranet` | 🔓 ...guardiasDeSubida | ArchivosController.subir('intranet') |
| GET | `/api/archivos/sitio/*ruta` | 🔓 — | ArchivosController.servir('sitio') |
| GET | `/api/archivos/intranet/*ruta` | requireAuth, requierePermisoPagina('puedeVer') | ArchivosController.servir('intranet') |

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
| GET | `/api/first-login/status` | requireAuthConConfiguracionPendiente | AuthController.firstLoginStatus |
| POST | `/api/first-login` | requireAuthConConfiguracionPendiente | AuthController.firstLogin |
| POST | `/api/logout` | 🔓 limitadorDeLogout | AuthController.logout |
| GET | `/api/me` | requireAuthConConfiguracionPendiente | AuthController.me |
| POST | `/api/change-password` | requireAuthConConfiguracionPendiente | AuthController.changePassword |

### `routes/configuracion.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/configuracion/identidad-panel/archivos/:nombre` | 🔓 — | ConfiguracionController.servirArchivo |
| GET | `/api/configuracion/identidad-panel` | requireAuth | ConfiguracionController.obtenerIdentidad |
| PATCH | `/api/configuracion/identidad-panel` | 🔓 ...puedeCambiarla, validarCuerpo(actualizarIdentidadSchema) | ConfiguracionController.actualizarIdentidad |
| POST | `/api/configuracion/identidad-panel/${pieza}` | 🔓 ...puedeCambiarla, recibirArchivo(LIMITE_DE_SUBIDA) | ConfiguracionController.subirImagen(pieza) |
| DELETE | `/api/configuracion/identidad-panel/${pieza}` | 🔓 ...puedeCambiarla | ConfiguracionController.restablecerImagen(pieza) |

### `routes/observatorio.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/observatorio/programas-sobresalientes` | 🔓 — | ObservatorioController.obtenerActual |
| GET | `/api/observatorio/tendencia-ocupacional` | 🔓 — | TendenciaOcupacionalController.buscar |
| GET | `/api/observatorio/tendencia-ocupacional/opciones` | 🔓 — | TendenciaOcupacionalController.opciones |
| GET | `/api/observatorio/fuentes-futuras-empleo` | 🔓 — | FuentesFuturasEmpleoController.obtenerActual |
| GET | `/api/observatorio/cargas` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | ObservatorioController.listarCargas |
| POST | `/api/observatorio/cargas` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos'), subidaEnMemoria.single('file') | ObservatorioController.subir |
| GET | `/api/observatorio/cargas/:id` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | ObservatorioController.obtenerCarga |
| DELETE | `/api/observatorio/cargas/:id` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | ObservatorioController.eliminarCarga |
| GET | `/api/observatorio/formatos/:formato` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | ObservatorioController.descargarFormato |
| GET | `/api/observatorio/fuentes-futuras-empleo/cargas` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | FuentesFuturasEmpleoController.listarCargas |
| POST | `/api/observatorio/fuentes-futuras-empleo/cargas` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos'), subidaEnMemoria.single('file') | FuentesFuturasEmpleoController.subir |
| DELETE | `/api/observatorio/fuentes-futuras-empleo/cargas/:id` | requireAuth, requierePermisoObservatorio('puedeActualizarDatos') | FuentesFuturasEmpleoController.eliminarCarga |
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
| POST | `/api/paginas/visitas/registrar` | 🔓 limitadorDeVisitas, limitadorDeVisitasPorPagina | PaginaController.registrarVisita |
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
| DELETE | `/api/paginas/:slug/versiones/:versionId` | requireAuth, requierePermisoPagina('puedePublicar'), validarCuerpo(motivoDeDecisionSchema) | PaginaController.eliminarVersion |
| PATCH | `/api/paginas/:slug/aprobar` | requireAuth, requierePermisoPagina('puedePublicar') | PaginaController.aprobar |
| PATCH | `/api/paginas/:slug/rechazar` | requireAuth, requierePermisoPagina('puedeRechazar'), validarCuerpo(motivoDeDecisionSchema) | PaginaController.rechazar |
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
| POST | `/api/roles` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos'), validarCuerpo(crearRolSchema) | RoleController.create |
| PATCH | `/api/roles/:id` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos'), validarCuerpo(actualizarRolSchema) | RoleController.update |
| DELETE | `/api/roles/:id` | requireAuth, requierePermisoUsuario('puedeAdministrarSeguridad'), requirePermission('usuarios.permisos') | RoleController.delete |

### `routes/security-question.routes.ts`

| Método | Ruta | Protección y validación | Manejador |
|---|---|---|---|
| GET | `/api/security-questions/catalog` | 🔓 — | SecurityQuestionController.getCatalog |
| POST | `/api/security-questions/user-questions` | 🔓 limitadorDePreguntas | SecurityQuestionController.getQuestionKeysForUser |
| POST | `/api/security-questions/setup` | requireAuthConConfiguracionPendiente | SecurityQuestionController.setupQuestions |
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
| `@olo/password-policy` | `packages/password-policy/` | `3000-sitio-web`, `3001-intranet`, `4000-api-backend` |
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
| `@puckeditor/core` | `^0.22.4` | producción |
| `@tailwindcss/postcss` | `^4` | desarrollo |
| `@types/node` | `^20` | desarrollo |
| `@types/react` | `^19` | desarrollo |
| `@types/react-dom` | `^19` | desarrollo |
| `axios` | `^1.18.1` | producción |
| `docx-preview` | `^0.4.0` | producción |
| `echarts` | `^6.1.0` | producción |
| `eslint` | `^9` | desarrollo |
| `eslint-config-next` | `16.4.0` | desarrollo |
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
| `@puckeditor/core` | `^0.22.4` | producción |
| `@tailwindcss/postcss` | `^4` | desarrollo |
| `@types/node` | `^20` | desarrollo |
| `@types/react` | `^19` | desarrollo |
| `@types/react-dom` | `^19` | desarrollo |
| `clsx` | `^2.1.1` | producción |
| `eslint` | `^9` | desarrollo |
| `eslint-config-next` | `16.4.0` | desarrollo |
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
| `@olo/password-policy` | `file:../packages/password-policy` | producción |
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
- `038-alertas-inversion-catalogos`
- `039-alertas-inversion-proyectos`
- `040-auditoria-autoguardado`
- `041-integridad-e-indices`
- `042-catalogos-sin-duplicados`
- `043-password-temporal-vence`
- `044-identidad-del-panel`
- `045-password-anterior`
- `046-paginas-del-sitio-en-bd`

### Modelos

| Modelo | Tabla |
|---|---|
| `archivo` | `archivos` |
| `bloqueo-edicion` | `bloqueos_edicion` |
| `carga-datos` | `cargas_datos` |
| `centro-formacion` | `centros_formacion` |
| `ciiu-clase` | `ciiu_clases` |
| `ciiu-seccion` | `ciiu_secciones` |
| `content-audit-log` | `auditoria_cambios` |
| `departamento` | `departamentos` |
| `empresa` | `empresas` |
| `municipio` | `municipios` |
| `nivel-formacion` | `niveles_formacion` |
| `pagina-version` | `paginas_versiones` |
| `pagina` | `paginas` |
| `permission` | `permisos` |
| `programa-formacion` | `programas_formacion` |
| `programa-sobresaliente` | `programas_sobresalientes` |
| `proyecto-inversion-ubicacion` | `proyectos_inversion_ubicaciones` |
| `proyecto-inversion` | `proyectos_inversion` |
| `role-permission` | `roles_permisos` |
| `role` | `roles` |
| `security-question` | `preguntas_seguridad` |
| `subida-pendiente` | `subidas_pendientes` |
| `user` | `usuarios` |
