# Auditoría de los 17 RF contra `backlog.csv` — 2026-08-25

> Contrasta el estado que registra `backlog.csv` (raíz del proyecto, 230 tareas) contra el
> estado real del código, verificado directamente (grep, lectura de archivos, `git log`),
> no solo contra lo que dicen los documentos numerados. Donde hay evidencia de código que
> contradice el `ESTADO` del backlog, se anota como **corrección** con su archivo.
>
> **Nota sobre la memoria previa:** una sesión anterior registró que el backlog vivía en
> `10-backlog.md` / `10-backlog.csv` con épicas `E-01..E-21`. Ese archivo ya no existe en el
> repo (ni rastro en `git log`) — el backlog vigente es `backlog.csv` en la raíz, con una
> estructura distinta (`Epica` en texto libre + `ID REQUISITO` = número de RF, sin prefijo
> `E-`). Se actualiza la memoria para no repetir la referencia rota.

## Conteo por RF (Hecho / Parcial / Falta, según el propio backlog)

| RF | Épica | Hecho | Parcial | Falta | Total tareas |
|---|---|---|---|---|---|
| RF-01 | Gestión de Contenidos por el Administrador | 2 | 17 | 29 | 48 |
| RF-02 | Multimedia y Gestión de Documentos | 1 | 10 | 30 | 41 |
| RF-03 | Gestión de Identidad Visual | 1 | 5 | 33 | 39 |
| RF-04 | Roles, Permisos y Control de Acceso (RBAC) | 1 | 7 | 19 | 27 |
| RF-05 | Flujo de Aprobación y Gobernanza (restricción editor) | 1 | 4 | 18 | 23 |
| RF-06 | Flujo de Aprobación y Gobernanza (revisión) | 4 | 3 | 13 | 20 |
| RF-07 | Auditoría, Trazabilidad e Historial | 2 | 3 | 16 | 21 |
| RF-08 | Recursos Multimedia y Reportes Analíticos (Power BI) | 0 | 0 | 8 | 8 |
| RF-09 | Integración CNO/CUOC | 1 | 5 | 10 | 16 |
| RF-10 | Motor de Búsqueda Interno | 0 | 4 | 14 | 18 |
| RF-11 | Navegación Jerárquica | 0 | 2 | 8 | 10 |
| RF-12 | Repositorio Documental y Acceso Público | 0 | 3 | 8 | 11 |
| RF-13 | Habeas Data (Ley 1581) | 0 | 2 | 8 | 10 |
| RF-14 | Accesibilidad (Res. 1519) | 0 | 6 | 19 | 25 |
| RF-15 | Intranet y Rutas Privadas | 7 | 11 | 8 | 26 |
| RF-16 | Autenticación Unificada y Caducidad | 2 | 3 | 12 | 17 |
| RF-17 | Respaldos Automatizados | 0 | 1 | 16 | 17 |
| *(18)* | *Interfaces (secciones del sitio/intranet — no es un RF numerado)* | 4 | 4 | 14 | 22 |

**Ningún RF está al 100% "Hecho" según el propio backlog.** Eso es consistente con el nivel
de detalle: el backlog desglosa hasta QA de casos borde y textos de error, mientras que la
auditoría a nivel de "¿funciona el requerimiento?" (ver `1-guia-del-proyecto.md` §5) marcaba
RF-01, 04, 05, 06, 07 y 16 como ✅ funcionalmente. Las dos vistas no se contradicen: un RF
puede estar operativo en su flujo principal y tener veinte tareas finas sin cerrar.

## Correcciones verificadas — el backlog está desactualizado o equivocado aquí

Estas son diferencias que verifiqué contra el código el 2026-08-25, no contra otro documento.
Importan porque si nadie las corrige, alguien puede planificar trabajo que ya existe (o dar
por hecho algo que no existe).

| # | RF | Tarea del backlog | Backlog dice | Código dice | Evidencia |
|---|---|---|---|---|---|
| 1 | RF-07 | 60.1 "el registro de auditoría existe entero y lleva registrados cero cambios, nadie lo llama" | **Falta** | **Hecho** — `logAudit()` se llama desde 8 controladores | `api-backend/src/use-cases/auditoria/audit.usecase.ts:28` llamado desde `pagina.controller.ts`, `auth.controller.ts`, `usuarios.controller.ts`, `contenido.controller.ts`, `role-permissions.controller.ts`, `roles.controller.ts`, `security-questions.controller.ts`, `auditoria.controller.ts` |
| 2 | RF-02 | 9.2 "comprobar el tipo abriendo el archivo, no la extensión" | **Falta** | **Hecho** — detección por magic bytes con `file-type` | `packages/upload-policy/src/index.ts` |
| 3 | RF-02 | 10.2 "aplicar el límite de tamaño en el servidor" | **Falta** | **Hecho** (como valor fijo, no configurable desde panel) — límite en servidor vía `upload-policy` + `client_max_body_size 50M` en nginx igualado en `d8c0484` | `packages/upload-policy`, `nginx/nginx.conf.template:33` |
| 4 | RF-02 | 11.1 "guardar cada archivo con un identificador generado (UUID)" | **Falta** | **Hecho** | `packages/upload-policy`, confirmado también en `3-seguridad-del-proyecto.md` §4.4 |
| 5 | RF-02 | 12.1 / 12.2 "campo de texto alternativo obligatorio, validado en servidor" | 12.1 Parcial / 12.2 **Falta** | **Hecho** en las dos apps desde 2026-08-18 (Fase 5 de accesibilidad) — aviso en cliente + rechazo real con 400 en `enviar-a-revision.usecase.ts` | `packages/accessibility-policy`, `9-accesibilidad.md` Fase 5 |
| 6 | RF-04 | 34.1 "matriz rol-permiso donde se marca lo que cada rol puede hacer y se guarda" | **Falta** | **Parcial, no Falta** — la matriz existe y está en uso (togglear permisos por rol), lo que falta es específicamente *crear un rol nuevo* desde la UI (el backend sí lo soporta) | `sitio-web/src/features/administracion/auth/components/modal-permisos.tsx`, usado desde `usuarios-view.tsx`; `POST /api/roles` existe en `role.routes.ts:128` pero ningún componente de frontend lo llama |
| 7 | RF-01 | 3.2 "probar que un borrador no sea visible para el público bajo ninguna circunstancia" | **Parcial** | Backend ya lo garantiza (404 salvo autor, cerrado 2026-08-17, `propiedad:verificar`); lo que falta es específicamente la prueba automatizada, no el control | `3-seguridad-del-proyecto.md` §S10, fila `GET /api/contenidos/:id` |

**Lo que estas correcciones no dicen:** que el resto de las ~223 tareas restantes están bien
clasificadas. Solo pude verificar estas siete contra el código en el tiempo disponible; el
resto de las tareas de cada épica se revisó a nivel de RF (con los documentos numerados,
también verificados por muestreo) pero no tarea por tarea. Cada archivo de RF lo aclara.

## Un hallazgo fuera del backlog: la exposición de `/api/revalidar`

No es una tarea del backlog, pero es relevante para RF-01/RF-06 (gobernanza y publicación).
`3-seguridad-del-proyecto.md` §S11 daba por buena la exposición de `/api/revalidar` **porque
el prefijo de nginx aún no separaba `/api/` de `/api-backend/`** — el propio documento avisaba
"el día que se arregle ese prefijo, `/api/revalidar` queda expuesta a internet". El commit
`b866fd7` (23-ago) resolvió exactamente ese prefijo. Verificado en `nginx/nginx.conf.template`:
hoy `location /api-backend/` es lo único que nginx manda a Express: todo lo demás, incluida
`/api/revalidar` del sitio, cae bajo `location /` → `proxy_pass http://sitio_web`, es decir,
**ya es alcanzable desde internet**. No es grave (el endpoint exige `REVALIDAR_SECRET` con
comparación en tiempo constante, y el peor caso es forzar una invalidación de caché — ver
§S11), pero el supuesto que lo tranquilizaba ya no aplica y nadie lo ha vuelto a evaluar desde
que cambió.

## Archivos por RF

Uno por cada RF-01 a RF-17. Cada archivo trae: el texto del requerimiento, el conteo de
tareas del backlog, las correcciones verificadas (si las hay) y qué queda sin revisar línea
por línea. Están pensados para abrir junto a `backlog.csv` y decidir, tarea por tarea, cuáles
corregir de estado.
