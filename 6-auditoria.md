# Bitácora de sesiones — Proyecto OLO (SENA)

> Registro cronológico de las sesiones de trabajo: qué se movió, qué se creó, qué quedó pendiente.
> La sesión más reciente va primero.

---

## sesión 03-08-2026: `(admin)` pierde los paréntesis en sitio-web — se corrigen las rutas que quedaron colgando

El usuario quitó los paréntesis a la carpeta `(admin)` de `sitio-web` (ahora `app/admin/`), con lo que ese segmento pasa de ser un route group invisible a un tramo real de la URL: `/dashboard` pasó a vivir en `/admin/dashboard`, `/editor/[slug]` en `/admin/editor/[slug]`, etc. El cambio de carpeta no toca ningún string hardcodeado — así que todo lo que redirigía, enlazaba o protegía por la ruta vieja quedó apuntando a una URL que ya no existe.

### 1. Qué se corrigió

Barrido completo de `sitio-web/src` buscando toda referencia a las rutas viejas (`/dashboard`, `/users`, `/usuarios`, `/editor`, `/preview`, `/revision`, `/auditoria`, `/auth/login`, `/auth/cambiar-contrasena`) fuera de `app/admin/` mismo:

- **`middleware.ts`**: el `matcher` completo y todos los `pathname.startsWith(...)` / `NextResponse.redirect(...)` — sin este archivo, el gate de autenticación entero dejaba de proteger nada.
- **`shared/lib/session.ts`**: `resolveFirstAccessibleRoute` mandaba a los 5 roles a `/dashboard`.
- **`features/paginas/components/edit-button.tsx`** y **`lib/ruta-de-vuelta.ts`**: el botón de editar y el "volver" del editor.
- **`features/paginas/components/revision-queue-view.tsx`**: el enlace de vista previa del sitio (el de intranet, con `URL_INTRANET`, no cambia — esa app no tocó sus rutas).
- **`features/administracion/components/first-login-flow.tsx`** y **`panel-general.tsx`**: el logout, y los 15 enlaces del sidebar/navbar del panel (dashboard, usuarios, revisión, auditoría, y los de perfil/configuración/privacidad que hoy no tienen página propia — se dejaron como placeholders con el prefijo correcto, igual que ya lo eran antes).
- **`app/admin/auth/login/page.tsx`**: los 4 redirects internos post-login (dashboard, elección de editor, logout).

### 2. Una corrección de más

`panel-general.tsx` enlazaba **Auditoría** a `/dashboard/auditoria`. Eso ya estaba mal antes de este cambio: `auditoria` es hermana de `dashboard` bajo `(shell)`, nunca estuvo anidada. Se corrigió a `/admin/auditoria` en vez de perpetuar el anidamiento falso con `/admin/dashboard/auditoria`.

### 3. Verificación

- `next build`: limpio. La tabla de rutas confirma `/admin/dashboard`, `/admin/users`, `/admin/revision`, `/admin/editor/[slug]`, `/admin/preview/[slug]`, `/admin/auth/login`, `/admin/auth/cambiar-contrasena`.
- Grep final sin coincidencias sin prefijo salvo las correctas: rutas de `/api/users` (backend, ajeno a este route group), la URL del editor de intranet (`localhost:3001/editor/inicio`, otra app) y nombres de rol.

### Pendiente al cierre

- Sigue en pie de sesiones anteriores: la migración de `shared/lib/blocks/` a `shared/ui/organisms` (intranet), el renombrado de los bloques `Tasa*`, la divergencia de `IntranetTopbar`, `features/auth/api/` sin renombrar a `services/` (intranet), los permisos en servidor de `app/editor/[slug]/page.tsx`, y los enlaces placeholder de `panel-general.tsx` (buscar, inbox, mi-perfil, configuración, privacidad, soporte) que no tienen página propia todavía.

---

## sesión 03-08-2026: Las 5 secciones colapsan al comodín `[...puckPath]` (intranet)

`app/(secciones)/{inicio,tasa,matriz}/page.tsx` y las dos de `encuestas/` eran ~30 líneas cada una, casi idénticas entre sí y al comodín `[...puckPath]/page.tsx` que ya existía: mismo `obtenerPaginaPublicada(slug)` + `EditButton` + `ClientPuckRender`. En Next.js un segmento concreto gana al comodín, así que las cinco carpetas eran duplicación pura — el comodín podía hacer su trabajo, solo le faltaban dos cosas.

### 1. Por qué no era un borrado directo

El comodín arma el slug con `puckPath.join('/')`. Para `/matriz` (un segmento) eso ya coincidía con el slug real. Pero para `/encuestas/calidad-de-formacion` (dos segmentos) daba `'encuestas/calidad-de-formacion'` **con barra**, y el slug guardado en BD es `'encuestas-calidad-de-formacion'` **con guion** — a propósito, porque la API expone `/paginas/publica/:slug` y un parámetro de Express no cruza una barra (trampa ya documentada en la sesión del 31-07). Sin arreglar esto, borrar las dos carpetas de encuestas las habría dejado en 404 silencioso.

### 2. Qué se hizo

- **`puckPath.join('/')` → `puckPath.join('-')`** en el comodín. Para un segmento no cambia nada (`'matriz'` sigue siendo `'matriz'`); para dos, `'encuestas-calidad-de-formacion'` ya coincide con el slug real.
- **`generateMetadata` nuevo**, con un mapa `METADATA_POR_SLUG` que migra tal cual los 5 títulos/descripciones que tenía cada archivo. Un slug fuera del mapa (sección nueva, creada sin tocar código) cae al `titulo` real que ya devuelve la API (`PaginaPublicada.titulo`), en vez de quedarse sin metadata.
- **`obtenerPaginaPublicada` envuelto en `cache()`** de React — es la primera vez que se usa en el proyecto. Sin esto, `generateMetadata` y la página habrían pedido la misma página dos veces a la API en cada visita.
- **Mapa `ENVOLTORIO_POR_SLUG`** para la etiqueta (`div`/`main`) y clase de cada sección, migrado tal cual de los 5 archivos — incluido el `overflow-x-hidden` que traía matriz. Un slug fuera del mapa usa el `.pagina-slug` genérico que ya existía.
- **Borradas** las 5 carpetas: `inicio/`, `tasa/`, `matriz/`, `encuestas/calidad-de-formacion/`, `encuestas/seguimiento-laboral/` (y `encuestas/` misma, ya vacía). `app/(secciones)/` queda con `layout.tsx`, `[...puckPath]/` y `preview/[slug]/`.

### 3. Por qué esto sí es la escalabilidad que se buscaba

Antes, aunque el contenido ya fuera 100% editable desde BD, **agregar una sección nueva seguía exigiendo que alguien creara un `page.tsx`**. Con este cambio deja de ser así: una sección nueva se crea publicando una página con un slug nuevo desde el editor, sin tocar `app/` ni desplegar código — que es exactamente lo que pide el RF-01 ("el propio equipo del OLO edite y reorganice el contenido... sin intervención técnica").

### 4. Verificación

- `next build`: limpio, TypeScript incluido. La tabla de rutas ya no lista `/inicio`, `/tasa`, `/matriz` ni `/encuestas/*` como rutas propias — todo cuelga de `ƒ /[...puckPath]`.
- **No se pudo probar en navegador con datos reales.** Docker no está disponible en esta máquina (mismo bloqueo que la sesión anterior), así que no hay forma de levantar API + BD para confirmar visualmente que las 5 secciones siguen viéndose igual — en particular, que `ENVOLTORIO_POR_SLUG` reprodujo bien las clases de cada una. Pendiente de abrir con una sesión real.

### Pendiente al cierre

- **Abrir las 5 secciones en un navegador con sesión real** para confirmar visualmente el envoltorio y la metadata.
- Sigue en pie de sesiones anteriores: la migración de `shared/lib/blocks/` a `shared/ui/organisms`, el renombrado de los bloques `Tasa*`, la divergencia de `IntranetTopbar`, `features/auth/api/` sin renombrar a `services/`, los permisos en servidor de `app/editor/[slug]/page.tsx` y los 4 enlaces sembrados sin URL.

---

## sesión 03-08-2026: La auditoría empieza a registrar, y se cierra su lectura

La decisión de cómo abordar la sección `/auditoria` que pidió el cliente se pasó por el council (`.claude/SKILL.md`, 5 asesores + revisión cruzada + presidente). El veredicto fue unánime en un punto: **construir la pantalla primero era construir sobre una tabla vacía**. Esta sesión hizo el backend; la pantalla queda para la siguiente.

También se completó el renombrado de carpetas `login/` → `auth/` que quedó a medias, y que tenía el login **inalcanzable en las dos apps**.

### 1. El diagnóstico, corregido

El backlog daba E-07 por casi terminado («modelo, repositorio, listener, use-case y rutas están escritos y correctos»). Verificando contra el código, eso era falso por tres motivos distintos:

- **`contenido.controller.ts` mandaba la acción en inglés** (`'create'`, `'update'`, `'delete'`), y la migración 006 dejó un `CHECK` que solo admite los verbos en español. Cada intento de registro violaba la restricción.
- **Nadie esperaba la promesa del INSERT.** El `try/catch` que lo envolvía era código muerto: no puede atrapar lo que no espera. El rechazo se perdía como *unhandled rejection*, sin excepción, sin log y sin rastro. Las dos causas juntas explican por qué nadie se enteró en meses.
- **`auditoria.listener.ts` escribía los nombres de columna anteriores a la 006** (`content_id`, `action_type`). Habría fallado por `entidad_id NOT NULL` si alguien lo hubiera invocado — pero no lo invocaba nadie, porque el `event-bus.ts` no lo importaba ningún módulo.

Y un hallazgo que no estaba en ninguna lista: **`/api/audit-logs` solo exigía `requireAuth`**. Sin control de rol, cualquier usuario autenticado —un `visitante_interno` incluido— podía leer la bitácora completa de todos sus compañeros, con IP y user-agent. Estaba así en producción.

### 2. Qué se hizo

- **Se cerró la lectura.** `auditoria.policies.ts` nuevo (superadmin y administrador, nadie más) + `requierePermisoAuditoria` en `permisos.middleware.ts`, aplicado con `router.use` para que ninguna ruta que se añada después pueda saltárselo.
- **`AuditRepository.create` dejó de recibir `any`.** `DatosAuditoria` ata `accion` a `AccionAuditable` y `entidadTipo` a `EntidadAuditable`. Mandar `'create'` en vez de `'crear'` **ya no compila**. La traducción a snake_case vive solo en el repositorio.
- **`logAudit` es `async`, se espera, y su error se registra** con la acción y la entidad. No se relanza: si la bitácora falla, la publicación no debe caerse — pero deja de fallar en silencio.
- **Las páginas registran por fin.** `guardarBorrador`, `enviarARevision`, `aprobar` y `rechazar` escriben su entrada (T-07.5). El rechazo guarda el motivo, que es la única explicación de por qué una versión volvió a borrador.
- **`ip` y `user_agent` se rellenan.** Las columnas existían desde la 006 y todas las filas las habrían tenido en NULL. `datosDeAuditoria(req)` las extrae en el borde; hacia los use-cases solo viajan datos, nunca el `Request`.
- **Borrados** `auditoria.listener.ts` y `event-bus.ts`, comprobado antes que no los importaba nadie.
- **Rutas `auth/` terminadas**: 30 referencias en 15 archivos. Intranet usa `/auth`, `/auth/recovery`…; sitio-web usa `/auth/login` y `/auth/cambiar-contrasena`, incluido el `matcher` del middleware.

### 3. Decisiones que no son obvias

- **El registro se quitó de `crearContenido`.** Escribía bien (con los valores post-006), mientras el controlador escribía mal. Al arreglar el controlador, mantener ambos habría **duplicado cada alta**. Manda el controlador porque es el único que ve la petición, y sin ella no hay IP ni nombre de usuario.
- **Se resolvió por rol y no con `requirePermission('auditoria.ver')`.** En `permisos` solo están sembrados `acceso.sitio` y `acceso.intranet`: exigir una clave inexistente habría dejado fuera a todo el mundo salvo al superadmin (que tiene bypass) hasta correr una migración.
- **Ni editor, ni director, ni subdirector leen la bitácora.** Guarda IP y user-agent de cada editor: es un registro sobre las personas que trabajan en el sistema. HU-07 la pide para el Administrador.
- **La escritura NO es transaccional todavía**, que es lo que el council señaló como correcto para una entidad pública. `PaginaRepository` no acepta `transaction` en ninguna operación, así que hacerlo bien exige refactorizarlo entero. Queda anotado en el propio `logAudit` como el siguiente paso, no como algo resuelto.

### 4. Verificación

- **`npm run auditoria:verificar` (nuevo): 19 comprobaciones contra Postgres real, todas OK.** Escribe una fila de verdad, la lee, comprueba acción, entidad, usuario, IP, user-agent, campos modificados y fecha, y la borra. Incluye que el `CHECK` sigue rechazando `'create'` — la red que atrapó el bug original. Sigue el patrón de `permisos:verificar` en vez de introducir Jest: el proyecto no tiene framework de tests.
- El tipado nuevo **encontró por sí solo una cuarta escritura** que nadie había señalado, en `contenido.usecase.ts`. Esa era exactamente su razón de ser.
- `tsc --noEmit` y `build` limpios en api-backend, intranet y sitio-web. `permisos:verificar` sigue en verde.

### Pendiente al cierre

- **La pantalla `/auditoria`.** La carpeta `(admin)/(shell)/auditoria/` ya existe vacía y el enlace del sidebar apunta a `/dashboard/auditoria`, que es 404: al crear el `page.tsx` hay que corregir ese `href` (`panel-general.tsx:125`).
- **T-07.6, campos modificados de verdad.** Hoy `antes` va en `null` porque el controlador no tiene el estado anterior; hace falta que el use-case devuelva la versión previa y comparar el JSONB por rama.
- **Escritura transaccional** de la bitácora (requiere que `PaginaRepository` acepte `transaction`).
- **La bitácora no es *append-only*.** Si el rol de la aplicación puede `UPDATE`/`DELETE` sobre `auditoria_cambios`, no tiene valor probatorio. Falta revocar permisos o poner un trigger, y definir plazos de conservación.
- **Visitas y accesos de directores** siguen sin existir. `auditoria_accesos` no admite registrar inicios de sesión: su `CHECK` limita `recurso_tipo` a `archivo|pagina_interna|tablero` y `accion` a `ver|descargar`, con `recurso_id` NOT NULL. Registrar logins ahí exige una migración, no «un INSERT».
- Sigue en pie: migración de `shared/lib/blocks/` a `shared/ui/`, renombrado de los bloques `Tasa*`, divergencia de `IntranetTopbar`, permisos en servidor de `app/editor/[slug]/page.tsx`.

---

## sesión 02-08-2026: `auth/` y `login/` se fusionan (intranet)

Eran dos features del mismo dominio partidas por tipo técnico — lo documentaba ya `1-guia-del-proyecto.md` §4.3 y el propio comentario de cabecera de `features/login/index.ts` ("se fusionan en la fase 4"). `auth/` tenía el cliente HTTP y el hook; `login/` las ocho vistas que enruta `app/login/`.

### 1. Qué se hizo

- **Los 8 archivos de `features/login/ui/`** (`LoginView`, `FirstLoginView`, `RecoveryView`, `ResetPasswordView`, `ResetSuccessView`, `SecurityQuestionsView`, `QuestionPicker`, `AuthSuccessScreen`) se movieron a **`features/auth/components/`**, sin tocar su contenido — todas las referencias cruzadas entre ellas ya eran relativas (`./QuestionPicker`, `./AuthSuccessScreen`), así que siguieron resolviendo igual al moverse juntas.
- **`features/auth/index.ts`** absorbió los exports de `features/login/index.ts`: sigue exportando `authApi`, `useAuth` y el tipo `User`, y ahora también las seis vistas que enruta `app/login/` (`QuestionPicker` y `AuthSuccessScreen` se quedan sin exportar, como ya estaban — son piezas internas, no puntos de entrada).
- **Los 6 imports en `app/login/*/page.tsx`** pasaron de `@/features/login` a `@/features/auth`.
- **`features/login/` se borró completa.** `features/` de intranet queda con solo `auth` y `paginas` — los dos dominios que le quedan a la app fuera del catálogo de bloques.
- Se usó `components/` (no `ui/`) para el nombre de la carpeta nueva, según la convención de `1-guia-del-proyecto.md` §4.0 — `ui/` es el nombre reservado al sistema de diseño. No se tocó `features/auth/api/`; renombrarla a `services/` (la otra desviación que señala el mismo documento) no se pidió en esta pasada.

### 2. Verificación

- `next build`: limpio. Las 6 rutas de login (`/login`, `/login/first-login`, `/login/recovery`, `/login/reset-password`, `/login/reset-success`, `/login/security-questions`) siguen compilando y listadas en el build.
- `grep` confirma cero referencias restantes a `features/login` en todo `intranet/src`.

### Pendiente al cierre

- **`features/auth/api/` sigue llamándose `api/`, no `services/`** — la segunda desviación de convención que señala `1-guia-del-proyecto.md` §4.3 para este mismo módulo, no incluida en el pedido de esta sesión.
- Sigue en pie de sesiones anteriores: la migración de `shared/lib/blocks/` a `shared/ui/organisms`, el renombrado de los bloques `Tasa*` mal nombrados, la divergencia de `IntranetTopbar`, los permisos en servidor de `app/editor/[slug]/page.tsx` y los 4 enlaces sembrados sin URL.

---

## sesión 02-08-2026: Espaciado y disposición configurables en todo el catálogo

Quien edita ya puede ajustar **relleno, separación, ancho y dirección** de los bloques desde el panel del editor, en las dos apps. Antes solo se podía elegir entre las variantes que cada bloque hubiera previsto (`fondo: blanco|gris`, `ancho: estrecho|ancho`); todo lo demás exigía tocar CSS y desplegar.

La pieza vive en `packages/blocks-renderer` (`primitives/controles-de-caja.tsx`), así que **es la misma en intranet y en sitio-web** — que era el punto de partida del encargo.

### 1. Qué se hizo

- **`conCaja(config)`** envuelve un `ComponentConfig` de Puck: le añade el grupo de campos «Espaciado y ancho» y mete su render en un `<div>` con los estilos resueltos. **`conCajaEnTodos(catalogo, { excepto })`** hace lo propio con un catálogo entero.
- **Las dos apps lo aplican sobre su catálogo completo**: `puckConfig` pasó a ser `puckConfigBase` + una pasada de `conCajaEnTodos`. Ningún bloque declara esos campos a mano.
- **Los primitivos se rehicieron sobre la misma escala.** `Grid` pasó a `Columnas` (con alineación vertical), `Flex` a `Fila o columna flexible` (con apilado en móvil), `Space` a `Espacio en blanco`. Las **claves de los componentes no cambiaron** — solo las etiquetas, por la regla de la sesión del 31-07.
- **CSS nuevo** (`.olo-caja`, `.olo-flex`, `.olo-grid` ampliada) en el `globals.css` de cada app.

### 2. Decisiones que no son obvias

- **Todo cuelga de un único campo `object` llamado `caja`.** Con campos sueltos habría choque inmediato: `TextoRico` ya tiene `ancho` y media intranet tiene `fondo`. Agrupado no hay colisión posible, ni con los bloques de hoy ni con los de mañana, y en el JSONB queda todo bajo `props.caja`.
- **Sin valores puestos NO se pinta el `<div>` envolvente.** Es lo que permite aplicar esto a los veintitantos bloques sin revisar página por página: mientras nadie toque los campos nuevos, el HTML publicado es byte a byte el de antes. `estiloDeCaja` decide con `aplica`.
- **`conCaja` es idempotente** (marca `__oloConCaja`). No es paranoia: `primitiveComponents` ya entrega `Grid` y `Flex` envueltos, y encima cada app pasa `conCajaEnTodos`. Sin la marca, el bloque acababa con **dos divs anidados leyendo el mismo valor** y el espaciado salía duplicado, sin que nada lo delatara en el editor.
- **Escala con nombres, no píxeles libres.** «Medio» y no «24px»: mantiene las secciones coherentes entre sí y encaja con el lenguaje sin jerga del resto del editor. `pixelesDeEspacio` acepta igualmente un número, así que un `gap: 24` guardado con la versión anterior de `Grid`/`Flex` sigue midiendo 24.
- **La barra y el pie quedan excluidos** (`BLOQUES_SIN_CAJA`). La barra es `position: sticky`: encerrarla en un div que mide lo mismo que ella la deja sin recorrido donde pegarse al hacer scroll. Además las coloca la plantilla, no las secciones.
- **El espaciado se aplica con variables CSS sobre una clase, no inline.** En móvil se reduce al 60 % y las filas se apilan; un estilo inline no puede llevar media queries. Por eso el paquete dice *cuánto* espacio se pidió y la app decide *cómo* se ve en cada tamaño.
- **Regla 10 (`4-reglas.md`) revisada: no hace falta migración.** El cambio al JSONB de `layout` es aditivo (`props.caja` nuevo) y retrocompatible en los dos sentidos; se comprobó además que **ningún contenido sembrado usa `Grid`, `Flex` ni `Space`**, que son los únicos bloques cuyos valores cambiaron de forma (número → clave de escala).

### 3. Verificación

- **18 comprobaciones de la lógica pura** (escala, resolución de estilos, idempotencia, exclusiones) ejecutadas con ts-node: todas pasan. Incluye el caso «caja por defecto no genera envoltorio».
- **20 comprobaciones sobre el HTML real**, pasando el `Render` de Puck por `renderToStaticMarkup`: verifican el slot (que solo existe dentro de Puck), las variables CSS emitidas, el apilado en móvil, que un bloque sin `caja` no genera envoltorio y que **no hay doble envoltorio**. Este es el HTML que produce una fila flexible con dos bloques dentro:

  ```html
  <div class="olo-caja" style="--olo-caja-interior-y:40px;--olo-caja-ancho:1200px">
    <div class="olo-flex olo-flex--apilar" style="--olo-flex-dir:row;--olo-flex-justify:space-between;--olo-flex-align:center;--olo-flex-gap:40px;--olo-flex-wrap:wrap">
      <p>izquierda</p><p>derecha</p>
    </div>
  </div>
  ```
- `tsc --noEmit`: limpio en las dos apps. En el paquete queda **un error preexistente y ajeno** en `registry.ts` (`Hero` vs. `BlockType`), que ya estaba antes de esta sesión.
- `next build`: correcto en las dos apps. Se comprobó en el CSS compilado que `.olo-caja`, `.olo-caja--derecha` y `.olo-flex--apilar` llegan al bundle con sus variables y su media query.
- ESLint limpio en los dos `puck.config.tsx`.

### Pendiente al cierre

- **No se ha abierto el editor en un navegador.** Falta ver el grupo «Espaciado y ancho» desplegado en el panel y arrastrar un bloque dentro de una fila flexible con una sesión real. No se pudo levantar el entorno: `docker` no está disponible en esta máquina, y sin API ni base de datos el editor no llega a montarse.
- Los campos se ofrecen en **todos** los bloques del catálogo. Si en la práctica resulta ruidoso en los que ya traen su propio espaciado (`TextoRico`, `TextoConImagen`), la lista `BLOQUES_SIN_CAJA` es el sitio para recortarlo.
- Sigue en pie de sesiones anteriores: la migración de `shared/lib/blocks/` a `shared/ui/`, la divergencia de `IntranetTopbar`, los permisos en servidor de `app/editor/[slug]/page.tsx` y los 4 enlaces sembrados sin URL.

---

## sesión 02-08-2026: Se borra el código muerto de la migración a Puck (intranet)

Las cinco secciones (`inicio`, `tasa`, `matriz`, las dos encuestas) llevaban desde la sesión del 31-07 leyendo su contenido de la base de datos. Los componentes React fijos que las generaban antes (`InicioView`, `MatrizView`, `TasaView`, `CalidadFormacionView`, `SeguimientoLaboralView`) quedaron sin ninguna referencia desde `app/`, pendientes de borrar desde esa misma sesión (§ Pendiente).

La decisión de **cómo** organizar el reemplazo (`shared/lib/blocks/` plano vs. carpeta por sección vs. alinear con `shared/ui/organisms` de `sitio-web`) se pasó por el council (`.claude/SKILL.md`, 5 asesores + revisión cruzada + presidente). Veredicto: no organizar por sección consumidora — la mayoría de los 25 bloques son transversales o se reutilizan en 2-4 secciones (`TasaDashboards`/`TasaPresentacion` nacieron en tasa y hoy también viven en matriz y las dos encuestas, sin tocar el archivo), así que "carpeta por sección" genera reorganizar cada vez que el negocio reutiliza algo. La migración completa a `shared/ui/organisms` queda pendiente de ejecutar; esta sesión solo cubrió el borrado seguro.

### 1. Qué se hizo

- **`PptxViewer.tsx` se movió** de `features/tasa/ui/` a `shared/lib/blocks/`, con sus dos imports (`DescargasConPresentacion.tsx`, `TasaPresentacion.tsx`) actualizados a ruta relativa. Era la única dependencia viva que un bloque nuevo tenía sobre una vista vieja — sin este paso, borrar `features/tasa` rompía el build.
- **Borrado**: `features/tasa/`, `features/inicio/`, `features/matriz/`, `features/encuestas/` completas (vistas + `index.ts` + carpeta). `features/` queda con solo `auth`, `login` y `paginas` — los tres dominios que sí siguen vivos.
- **Borrado**: `app/preview/[slug]/` vacía, resto del `git mv` a `app/(secciones)/` de la sesión del 01-08. `app/encuestas/` ya no existía (se limpió sola en un paso anterior).

### 2. Decisiones que no son obvias

- **No se tocó la ubicación de los otros 24 bloques.** El council recomendó migrar `shared/lib/blocks/` completo a `shared/ui/organisms/` (alineado con `sitio-web`) y renombrar `TasaDashboards`/`TasaPresentacion` (ya no son solo de tasa), pero eso es una reorganización aparte con más superficie de cambio (~25 imports en `puck.config.tsx`). Esta sesión resolvió solo lo que bloqueaba el borrado de código muerto.
- **Los revisores del council, verificando contra el repo, encontraron un bug no relacionado que sigue abierto**: `shared/lib/blocks/IntranetTopbar.tsx` (copia local) ya divergió de la versión en `packages/blocks-renderer` que sí consume `sitio-web` — props distintas (`menuItems` con submenús vs. stub simple). No se tocó en esta sesión; queda para cuando se aborde la migración a `shared/ui/organisms`.
- **Búsqueda de referencias antes de borrar**: se confirmó con grep que las únicas coincidencias externas a las 4 carpetas eran comentarios de documentación en `Publicaciones.tsx` y `RecursosVisualesBloque.tsx` ("viene de `features/inicio/ui/...`"), no imports.

### 3. Verificación

- `tsc --noEmit`: limpio, cero errores.
- `next build`: compiló en 7.7s, generó las 15 páginas estáticas/dinámicas, incluidas `/inicio`, `/tasa`, `/matriz`, `/encuestas/calidad-de-formacion`, `/encuestas/seguimiento-laboral` desde `(secciones)/`. Único warning: `middleware.ts` deprecado en Next.js 16 (preexistente, no relacionado).

### Pendiente al cierre

- Migrar `shared/lib/blocks/` → `shared/ui/{atoms,molecules,organisms}`, con subcarpeta por sección solo para los bloques genuinamente exclusivos (`MatrizBanner`, `EncuestaBanner`, `Publicaciones`, `RecursosVisualesBloque`, `PreguntasFrecuentes`).
- Renombrar `TasaDashboards` → `TableroPowerBi`, `TasaPresentacion` → `PresentacionPptx`, `TasaVideo` → `VideoEmbebido` (ya no son exclusivos de tasa).
- Resolver la divergencia entre `shared/lib/blocks/IntranetTopbar.tsx` y `packages/blocks-renderer` antes de que alguien edite una copia asumiendo que son la misma.
- Sigue en pie de sesiones anteriores: permisos en servidor en `app/editor/[slug]/page.tsx`, conectar `Publicaciones` a `contenidos`, los 4 enlaces sembrados sin URL.

---

## sesión 01-08-2026: El menú y el pie pasan a ser una plantilla única

Hasta hoy la barra de navegación y el pie **no eran un layout**: eran dos bloques de Puck guardados **dentro del contenido de cada sección**, uno por página. Cinco copias independientes en la base de datos. Editar el menú desde `/inicio` solo cambiaba `/inicio`, y con el tiempo divergieron.

**La divergencia ya había ocurrido y se puede señalar con el dedo:** `sembrar-pagina-tasa.ts` sembraba `bloque('IntranetTopbar', 'tasa-topbar')` **sin props**, así que caían los `defaultProps` de `puck.config.tsx` —que traen «Encuestas» como desplegable con sus dos hijos—. `sembrar-paginas-intranet.ts`, en cambio, sobrescribía `menuItems` con un `MENU` plano donde «Encuestas» era un enlace suelto a Calidad de Formación. Resultado: el desplegable **solo existía en `/tasa`**, y esa era la versión buena.

### 1. Qué se hizo

Se eligió sacar el marco del contenido en vez de sincronizar las cinco copias, porque el problema no era que estuvieran desincronizadas: era que existían cinco.

- **Página `plantilla` nueva** (`ambito='intranet'`): guarda un `IntranetTopbar` y un `IntranetFooter`, una sola vez. Se edita en `/editor/plantilla` con el mismo ciclo que cualquier página —borrador, revisión, aprobación—, sin tocar API ni permisos.
- **`app/(secciones)/layout.tsx`** (nuevo): lee la plantilla y pinta la barra y el pie alrededor de las cinco secciones. El login y el editor quedan fuera porque viven fuera del grupo de rutas.
- **`features/paginas/lib/plantilla.ts`** (nuevo): `obtenerPlantilla()` extrae las props del bloque guardado. **No lanza nunca** — esto envuelve toda la intranet, y si la API no responde debe quedar la barra por defecto en vez de romper el árbol desde el layout.
- **`migrar-plantilla-intranet.ts`** (nuevo, `npm run migrar:plantilla`): publica la plantilla con el menú de `/tasa` y quita los dos bloques del contenido publicado de las cinco secciones. Pasa por el ciclo editorial, no toca filas a mano.
- **Los dos scripts de siembra dejan de sembrar barra y pie**, o volverían a meter las copias en la siguiente ejecución.
- **`PlantillaEditButton`** (nuevo): segundo botón flotante, apilado sobre el de la sección y en tono más apagado. Es cliente solo para saber desde dónde se abrió y poder volver: `/plantilla` no es una página visitable.

### 2. Decisiones que no son obvias

- **`IntranetTopbar` e `IntranetFooter` siguen registrados en `puckConfig`** pero salieron de `BLOQUES_COMUNES`: ya no se ofrecen al editar una sección, porque ofrecerlos sería volver a permitir una barra distinta por página. Se quedan registrados porque puede haber contenido guardado que los use, y un `type` desconocido desaparece sin avisar (trampa ya documentada en la sesión del 31-07).
- **La plantilla se sembró con las props escritas enteras**, no vacías como en `/tasa`. El layout lee esas props **directamente de la base, sin pasar por Puck**, y es Puck quien rellena los `defaultProps`: dejarlas vacías habría dado una barra sin menú.
- **`min-h-screen` fuera de las cinco páginas.** Con el pie ya fuera del contenido, sumaba una pantalla de más y obligaba a desplazarse siempre. Ahora el alto lo gobierna `.intranet-contenido { flex: 1 }` del layout.
- **`/plantilla` devuelve 404** desde el comodín `[...puckPath]`: sin ese corte mostraría la barra y el pie otra vez, duplicados dentro del marco que ya los pinta.
- **Vista previa:** al quedar dentro de `(secciones)` hay dos barras pegajosas peleando por `top: 0`. Manda el aviso de «sin publicar» y la navegación deja de ser fija ahí (`body:has(.preview-page) .intranet-topbar`).

### 3. Verificación

- `tsc --noEmit` del backend limpio; `next build` de la intranet limpio, TypeScript incluido. *(Un `tsc` suelto en la intranet da 7 errores de `.next/types/validator.ts` apuntando a rutas anteriores al grupo `(secciones)`: es caché obsoleta, el build la regenera.)*
- **Migración ejecutada contra la base local.** Las cinco secciones bajaron de 9/9/7/7/6 bloques a 7/7/5/5/4, y apareció `plantilla` con 2. Segunda ejecución: «ya estaba limpia» en las cinco — idempotente.
- **Render comprobado con el servidor arrancado**: las cinco rutas responden 200 y cada una trae **exactamente un** topbar, **un** footer y **un** desplegable de Encuestas. Antes el desplegable estaba solo en `/tasa`. `/plantilla` responde 404 y `/editor/plantilla` responde 200.

### 4. Rediseño de la cabecera del editor

Segunda petición de la misma sesión: oscurecer el editor y dejar clara la acción que destruye trabajo.

- **Cabecera y barra de complementos en `#001631`.** Se hizo con las **variables de tema de Puck** (`--puck-header-color-bg`, `--puck-header-color-text`, `--puck-pluginbar-color-bg` y sus cuatro compañeras de texto/hover), no tocando `_PuckLayout-nav_mr27u_197`: ese nombre lleva un hash de CSS modules que cambia al actualizar el paquete y dejaría los estilos colgando sin que nada falle. Las dos únicas reglas que sí miran a clases de Puck lo hacen **por subcadena** (`[class*="PuckHeader-inner"]`), que sobrevive al hash.
- **Botones**: «Salir» pasa a rojo `#dc2626`, «Enviar a revisión» al verde pedido `#7DB828`, «Guardar borrador» se queda en el azul que tenía. Los estilos en línea se movieron a clases `.olo-editor-btn--*`.
- **Modal de salida** en vez de `window.confirm`: explica que se pierde lo editado desde el último guardado, que no se recupera y que la página seguirá mostrando la versión publicada. Es un **`<dialog>` nativo** — se pinta en la capa superior del navegador, así que no hay que pelear con el apilamiento del editor, y trae el foco atrapado y el cierre con Escape sin código extra. El botón enfocado por defecto y el clic fuera son «Seguir editando»: ante la duda, la opción que no borra nada.
- **Colores de estado aclarados** (`#fbbf24`, `#7dd3fc`, `#86efac`, `#fca5a5`): los planos anteriores eran ilegibles sobre azul marino.
- **El texto de «Enviar a revisión» va en `#001631`, no en blanco.** Blanco sobre `#7DB828` da 2.4:1; con el azul marino sube a 7.6:1 **sin cambiar el color pedido**. Es el mismo `#7db728` que la sesión del 26-07 midió como el peor de la paleta.

Verificado: `next build` y `eslint` limpios, y las variables confirmadas en el CSS compilado (`.olo-editor{--puck-header-color-bg:#001631;…}`) contra los nombres que consume el paquete instalado.

### Pendiente al cierre

- **La cabecera del editor no se vio en un navegador.** El editor solo se monta en cliente tras cargar datos de la API con sesión, así que la comprobación llegó hasta el CSS compilado. Falta abrirlo con una sesión real para juzgar el resultado.
- **`/preview/[slug]` no se pudo probar en ejecución.** El servidor devuelve 500 porque la API rechaza (401) los tokens de prueba: el middleware busca el usuario en la base y el sintético no existe. El archivo es **idéntico byte a byte** al de antes de esta sesión (solo cambió de carpeta), así que el 500 es del token, no de la migración — pero **conviene abrirla con una sesión real** para confirmar que el marco se ve bien con el aviso amarillo encima.
- Sigue en pie lo de la sesión anterior: borrar las `*View.tsx` sin uso, permisos en servidor en `app/editor/[slug]/page.tsx`, conectar `Publicaciones` a `contenidos` y los 4 enlaces sembrados sin URL.

---

## sesión 31-07-2026: Inicio, Matriz y Encuestas migradas al editor
Update Todos
Crear los bloques Puck nuevos en shared/lib/blocks/
Registrarlos en puck.config.tsx y filtrar el catálogo por página
Script de siembra para las 4 páginas
Cambiar los 4 page.tsx a leer de BD con EditButton
Limpiar la semilla obsoleta de inicio y reetiquetar bloques Tasa
Verificar: typecheck, lint, build y render de las 4 páginas
Actualizar 6-auditoria.md con lo implementado


`/inicio`, `/matriz`, `/encuestas/calidad-de-formacion` y `/encuestas/seguimiento-laboral` **ya tienen botón «Editar» y ciclo de versiones**, igual que `/tasa`. Las cuatro leen su contenido de la base de datos.

La sesión empezó como análisis; la decisión se pasó por el council (`.agent/SKILL.md`) y después se contrastó cada afirmación contra el código —**dos conclusiones del council resultaron falsas al verificarlas**, y una tercera cambió el plan por completo (Puck ya traía campo de texto enriquecido). Lo implementado está en el §6.

### 1. Estado de partida (verificado en el código, no supuesto)

Lo que Tasa dejó montado y que las cuatro páginas restantes **heredan sin trabajo adicional**:

| Pieza | Dónde | Sirve tal cual |
|---|---|---|
| Botón editar por slug | `features/paginas/components/edit-button.tsx` | Sí |
| Lectura de la versión publicada | `paginas.api.ts` → `obtenerPaginaPublicada(slug)` | Sí |
| Pintado de bloques | `client-puck-render.tsx` | Sí |
| Editor + guardar/enviar a revisión | `app/editor/[slug]/`, `use-editor-actions.ts` | Sí |
| Vista previa de lo no publicado | `app/preview/[slug]/page.tsx` | Sí |
| Cola de aprobación | `sitio-web/src/app/(admin)/(shell)/revision/` | Sí |
| Permisos por rol | `permisos.middleware.ts`, `paginas.policies.ts` | Sí |
| Separación por ámbito | cabecera `X-Ambito: intranet` en `api-client.ts` | Sí |

**Consecuencia: la migración es 100 % trabajo de frontend.** No hay que tocar la API, ni la base de datos, ni el ciclo editorial. Todo lo que falta es (a) convertir secciones fijas en bloques de Puck, (b) registrarlos en `config/puck.config.tsx`, (c) un script de siembra por página y (d) cambiar cada `page.tsx` para que lea de la BD.

**Corrección a una nota anterior:** la cola de revisión de la intranet **no existe como pantalla propia**. Es la de `sitio-web`, que ya distingue ámbito, etiqueta cada fila como «Sitio web» / «Intranet» y abre la vista previa de las páginas de intranet contra `NEXT_PUBLIC_INTRANET_URL`. No hay que crear nada.

### 2. Inventario: qué se convierte en bloque y qué ya está hecho

**`/matriz`** (`MatrizView.tsx`, 142 líneas) — la más barata con diferencia. Sus secciones de video, tablero y presentación **ya usan las clases `.tasa-video-*`, `.tasa-dashboards-*` y `.tasa-ppt-*`**, así que los bloques `TasaVideo`, `TasaDashboards` y `TasaPresentacion` que ya existen la cubren sin escribir un componente nuevo. Bloques nuevos que necesita: banner propio, texto con lista, imagen destacada, carrusel, lista de descargas.

**`/encuestas/calidad-de-formacion`** (147 líneas) — reutiliza `IntranetHero`, `.tasa-video-*` y `.tasa-ppt-*`. Nuevos: bloque de texto en dos columnas con imagen, botón de descarga de archivo.

**`/encuestas/seguimiento-laboral`** (137 líneas) — hero propio con degradado, texto, dos imágenes de resultados, sección de dos columnas.

**`/inicio`** (`InicioView.tsx`, 478 líneas) — la más cara y la única con deuda técnica de fondo. Ocho secciones: hero, dos carruseles, imagen #datoOLO, playlist de YouTube (`RecursosVisuales`), «Últimas publicaciones», «Preguntas frecuentes», footer.

**El carrusel es el bloque con mayor retorno:** el mismo componente `shared/ui/organisms/Carousel` aparece **tres veces** (dos en inicio, una en matriz) con distinta configuración. Un solo bloque con un `array` de imágenes y campos `itemsPerPage` / `autoplay` / `showButtons` cubre los tres casos.

### 3. Decisiones tomadas

**(a) Bloques compartidos, catálogo filtrado por página — no bloques por página.**
`puck-editor-wrapper.tsx` importa `puckConfig` directamente (línea 19) y lo fija en `config={puckConfig}` (línea 277). Hoy el catálogo es el mismo para todas las páginas, así que un funcionario editando Inicio ve cinco bloques «Tasa · …» que no le sirven. Resolver esto **no exige duplicar bloques**: basta con resolver la config por slug en ese punto y filtrar las categorías. El dilema «genérico vs. específico» era falso.

**Etiquetas sí, identificadores no.** Lo que el funcionario lee es el `label` (`'Tasa · Video'`), no la clave del componente (`TasaVideo`). Cambiar los `label` a «Video embebido», «Tablero Power BI», «Presentación descargable» cuesta minutos y **riesgo cero**. Cambiar las claves sí rompe: el JSON guardado en `paginas_versiones` lleva `type: "TasaVideo"`, y en el renderizador de Puck (`dist/index.js`) hay un punto que devuelve `null` ante un tipo desconocido y otro que accede a `Component.fields` sin comprobar — o la sección desaparece sin avisar, o la página revienta. Renombrar claves solo con re-siembra (`sembrar-pagina-tasa.ts` es idempotente y está pensado para eso), y aun así las versiones antiguas en borrador o rechazadas quedarían rotas. **Se cambian etiquetas, no claves.**

**(b) Texto rico: campo nativo de Puck, no `EditorJsWrapper` ni troceado en fragmentos.**
Los párrafos de encuestas llevan negritas a mitad de frase, y el truco de Tasa (partir el título en `tituloInicio` + `tituloDestacado`) no escala a eso. **Puck 0.22.2 ya trae `type: "richtext"` de serie** — `RichtextField` con `renderMenu` / `renderInlineMenu`, y el paquete exporta `RichTextMenu`. Está en `node_modules/@puckeditor/core/dist/actions-*.d.ts:219`. No hace falta enchufar `EditorJsWrapper` (proyecto aparte) ni inventar un `array` de `{texto, negrita}` que convertiría cada párrafo en un formulario ilegible. **Antes de comprometerse con encuestas hay que probar el campo `richtext` en un bloque de juguete**, porque toda la estimación depende de que funcione.

**(c) «Últimas publicaciones» sale del alcance de esta migración.**
Son 7 PDFs escritos a mano en `InicioView.tsx`, con miniaturas generadas por pdf.js **cargado por `<script>` desde un CDN de Cloudflare** y cacheadas en `sessionStorage`. Convertir eso en un `array` editable institucionaliza el problema: el funcionario tendría que repegar enlaces a mano cada vez que salga una publicación, para siempre. Y no hace falta: **la base de datos ya está diseñada para servir esto**. La tabla `contenidos` tiene `estado` y `publicado_en`, y la invariante I5 de `11-base-de-datos.md` existe literalmente por este motivo — «RF-10 y "Últimas publicaciones" no pueden ordenar por `NULL`». O sea que hay una copia a mano de algo que el backend ya sabe servir.
→ En esta migración entra como bloque **sin campos editables**, que pinta el componente actual tal cual. Conectarlo a `contenidos` es tarea aparte, y el bloque, una vez exista, se podrá poner en cualquier página.

**(d) Orden: Matriz → Encuestas → Inicio.**
Matriz primero porque es la única que no estrena ningún problema: valida el patrón, y de paso **cierra T-08.8** («Migrar el token del informe a dato configurable», hoy en *Falta*), cuyo criterio de aceptación es exactamente «no queda ninguna URL de Power BI literal en archivos `.tsx`». Encuestas después, las dos juntas porque comparten estructura, una vez probado `richtext`. Inicio al final y recortada.

**Corrección sobre (c) al implementar:** «Últimas publicaciones» sí quedó con la lista editable, en contra de lo decidido arriba. El motivo: dejarla sin campos mantenía el estado de hoy, donde publicar un boletín exige un desarrollador y un despliegue. Con el campo `array` pasa a exigir un funcionario y una aprobación, que es estrictamente mejor y no estorba a la integración con `contenidos` — cuando esa llegue, la lista queda como respaldo. El resto de la decisión (que la fuente real debe ser `contenidos`) sigue en pie.

### 4. Lo que se arregla de paso (y que hoy está roto en producción)

- `InicioView.tsx` tiene **`href="AQUI_VA_LINK_1"` y `href="AQUI_VA_LINK_2"`** en las tarjetas de Preguntas Frecuentes. Están así en producción.
- `MatrizView.tsx` tiene **dos `href="#"`** en la sección «Descargas» (Matriz de pertinencia 2025 y 2024).
- Sembrar esos marcadores tal cual sería heredar un botón roto con una interfaz bonita encima. Se piden los enlaces reales antes de sembrar; si no los hay, el bloque se siembra sin la tarjeta en vez de con un enlace muerto.
- La migración es también el momento natural para **T-08.5** (`sandbox` en los iframes, hoy *Falta*) y **T-08.7** (`title` obligatorio en el iframe, hoy *Parcial* — el backlog ya apunta a `config/puck.config.tsx` y «el bloque nuevo»).

### 5. Riesgos y cabos sueltos detectados

- **`app/editor/[slug]/page.tsx` no verifica permisos en servidor.** Sigue el `TODO` de fase 4-5: cualquier usuario autenticado abre `/editor/<slug>`. La API responde 403 al guardar, así que no se puede escribir nada, pero el editor se abre y carga el contenido. Con cinco páginas editables en vez de una, esto pasa de detalle a agujero.
- **`features/paginas/lib/page-seeds.ts` tiene una semilla de `inicio` obsoleta** (3 bloques: topbar, hero, footer) que no se parece a la página real de 8 secciones. Su propio comentario lo admite. Al migrar inicio hay que sustituirla o borrarla, o el editor arrancará pre-llenado con una página que no es.
- **Verificación de la siembra.** El script copia el contenido a mano; transcribir párrafos con negritas o URLs de Power BI es propenso a error. La siembra pasa por revisión, así que quien apruebe debe comparar contra la página anterior — conviene sembrar y comparar en `/preview/<slug>` **antes** de cambiar el `page.tsx` a leer de BD, que es lo que hace el cambio visible.
- El renderizado del carrusel de publicaciones depende de un **CDN externo** (`cdnjs.cloudflare.com`). Si no responde, no hay miniaturas y el funcionario no tiene forma de saberlo. No lo resuelve Puck; queda anotado.

### 6. Lo implementado

**11 bloques nuevos** en `shared/lib/blocks/`, pensados para compartirse en vez de uno por sección:

| Bloque | Lo usan |
|---|---|
| `SeccionCarrusel` | inicio ×2, matriz |
| `ImagenDestacada` | inicio, matriz, seguimiento laboral ×2 |
| `TextoRico` (richtext) | matriz, seguimiento laboral |
| `TextoConImagen` (richtext) | calidad de formación, seguimiento laboral |
| `DescargasConPresentacion` | matriz, calidad de formación |
| `MatrizBanner`, `EncuestaBanner` | su sección |
| `RecursosVisualesBloque`, `Publicaciones`, `PreguntasFrecuentes` | inicio |
| `resaltar()` | ayudante compartido por todos |

`TasaVideo` ganó una descarga opcional en vez de duplicarse: es lo que necesitaba la encuesta de calidad, que tiene el botón de XLSX dentro de la franja del video. Sus estilos en línea y los `onMouseOver` del JSX pasaron a CSS (`.tasa-video-descarga`).

**Títulos con una sola regla.** Los titulares llevan negrita en sitios distintos («**OLO**tecuenta», «#dato**OLO**», «**Recursos** visuales»). En vez de dos campos por título como en Tasa —que obliga a un campo nuevo por cada negrita—, `resaltar()` interpreta `**` y respeta los saltos de línea. Un campo, una regla que recordar.

**Catálogo filtrado por sección.** `configDeEdicion(slug)` en `puck.config.tsx` recorta el selector a los bloques que tienen sentido en cada página. `ClientPuckRender` sigue usando el catálogo **completo**: si se pinta con una config recortada, un bloque guardado que no esté en ella desaparece sin avisar. Los bloques heredados del sitio público siguen registrados por eso mismo, pero ya no se ofrecen en la intranet.

**Etiquetas cambiadas, claves intactas.** `TasaVideo` → «Video embebido», `TasaDashboards` → «Tableros Power BI», `TasaPresentacion` → «Presentación (PPTX)». Las claves no se tocan, así que el contenido ya publicado de Tasa sigue pintándose.

**Siembra:** `api-backend/scripts/sembrar-paginas-intranet.ts` (`npm run sembrar:intranet`, o con un slug para sembrar solo una). Pasa por el ciclo real borrador → revisión → aprobación y es idempotente. Se añadió también `npm run sembrar:tasa`, que existía como script suelto.

**Los enlaces rotos ya no se heredan.** Las dos tarjetas de FAQ y las dos descargas de matriz se sembraron **sin URL**: se leen, pero no fingen ser pulsables. Rellenarlos es ahora una edición, no un despliegue.

**Semilla obsoleta eliminada.** `page-seeds.ts` tenía una semilla de `inicio` de 3 bloques que no se parecía a la página real de 9; abrir el editor con ella habría hecho creer que ese era el contenido.

**Verificación ejecutada:** `tsc --noEmit` limpio en intranet y api-backend; `next build` correcto (las 4 rutas pasan a dinámicas, como `/tasa`); `eslint` sin ningún problema nuevo —los 3 errores de `PptxViewer` son previos y ese archivo no se tocó—; siembra corrida dos veces para comprobar que es idempotente; y las 5 páginas servidas y comprobadas contra el servidor real:

| Ruta | HTTP | Botón editar | Contenido comprobado |
|---|---|---|---|
| `/inicio` | 200 | `/editor/inicio` | carrusel, publicaciones, playlist, FAQ |
| `/matriz` | 200 | `/editor/matriz` | carrusel, texto rico, iframe Power BI |
| `/encuestas/calidad-de-formacion` | 200 | `/editor/encuestas-calidad-de-formacion` | texto rico, botón de descarga |
| `/encuestas/seguimiento-laboral` | 200 | `/editor/encuestas-seguimiento-laboral` | texto rico |
| `/tasa` | 200 | `/editor/tasa` | sin cambios |

Las cuatro rutas `/editor/<slug>` responden 200.

**Los slugs de encuestas no llevan barra** (`encuestas-calidad-de-formacion`). La API expone `/paginas/publica/:slug` y un parámetro de Express no cruza una barra: con slug jerárquico la petición no encontraría la ruta.

### Pendiente al cierre

- **Los `View` antiguos siguen en el árbol** (`InicioView`, `MatrizView`, `CalidadFormacionView`, `SeguimientoLaboralView`) y ya no los importa nadie. Se dejan igual que se dejó `TasaView`, por la regla 5 de `4-reglas.md`: no se borra lo viejo en el mismo paso en que se crea su reemplazo. Borrarlos es el siguiente paso, y con ellos se van 6 de las 9 advertencias `no-img-element`.
- Conseguir los cuatro enlaces reales (2 de FAQ en inicio, 2 de descargas en matriz) y ponerlos desde el editor.
- `app/editor/[slug]/page.tsx` sigue sin verificar permisos en servidor. Ahora son 5 páginas editables.
- Conectar `Publicaciones` a la tabla `contenidos` (hoy la lista se mantiene a mano, aunque ya sin tocar código).
- T-08.5 (`sandbox` en los iframes) y T-08.7 (`title` obligatorio) siguen sin hacerse; los iframes ahora viven en bloques, que es donde toca aplicarlos.
- Sigue abierto todo lo pendiente de la sesión del 26-07.

---

## sesión 26-07-2026:

### 1. Refactor de autenticación y tokenización de marca (sitio-web)
- Se extrajeron las primitivas duplicadas de las tres pantallas de autenticación a `features/administracion/components/auth-ui.tsx` (`AuthPageShell`, `AuthCardHeader`, `PasswordField`, `AuthGeneralError`, `BackToSiteLink`).
- `login/page.tsx` pasó de 428 a 223 líneas y de 33 `style={{}}` inline a cero.
- El verde de marca `#7DB728` se promovió a token de Tailwind en un bloque `@theme` de `globals.css` (`--color-brand`, `--color-brand-hover`, `--color-brand-focus`, `--color-brand-blue`). Los tokens previos de `:root` quedaron como alias, porque `:root` no genera utilidades en Tailwind v4 y `@theme` sí.
- Se corrigió el `TS2322` de `puck.config.tsx`: la causa era la *weak type detection* de TypeScript sobre un tipo con todas las propiedades opcionales. Se resolvió con `CustomFieldRender<T>` y `BlockRender<T>`.

### 2. ESLint configurado en las dos apps
- Se creó `sitio-web/eslint.config.mjs` (no existía) y se corrigieron sus **74 problemas**; se corrigieron los **69 de la intranet**, que bajaron a 9 advertencias y 0 errores.
- Correcciones de fondo, no cosméticas: estado externo migrado a `useSyncExternalStore` (tema, cookies, `sessionStorage`), lecturas de `ref` durante el render sustituidas por el patrón de ajuste de estado, tipos PDF.js declarados en vez de `window as any`, `listbox.tsx` hecho genérico de verdad.
- Se eliminó UI inalcanzable en `RecoveryView.tsx` que describía un flujo por correo ya obsoleto.
- Se documentó en `2-convenciones` §8 por qué hay **una config por frontend** y no una compartida en la raíz.

### 3. Documentación: gobernanza y anatomía de dominio
- Se creó **`8-ciclo-editorial.md`**: el ciclo `borrador → en_revision → publicado`, la invariante de que lo público solo cambia al aprobar, la anatomía canónica de una feature (plana y por etapas), las tres decisiones de convención que estaban divergentes entre apps, y un plan de migración en 6 fases.
- Se reescribieron `1-guia`, `2-convenciones`, `4-reglas` y `README` para que apunten a ese esquema.

### 4. Frontera de módulos cerrada en la intranet (fase 4, paso 1)
- Se crearon los `index.ts` que faltaban en `login`, `inicio`, `encuestas`, `matriz` y `tasa`; cinco de siete features no tenían puerta pública.
- Se reescribieron **15 imports** de `app/` que alcanzaban rutas internas. Hoy `app/` no importa ninguna ruta interna de ninguna feature.
- Se corrigieron los `@see` de `auth/index.ts` y `paginas/index.ts`, que apuntaban a `ARQUITECTURA_MAESTRA_OLO.md` — eliminado en la sesión del 20-07.

### 5. Revisión de coherencia de la documentación (1 al 8)
Se verificó cada afirmación estructural contra el código. Corregido:
- **`4-reglas` regla 10 eliminada**: exigía un `@source` por route group en Tailwind v4. Es falso — ningún `globals.css` tiene `@source` y las clases se generan igual (verificado con `flex-grow`, usada solo en `(public)/layout.tsx`).
- **`4-reglas` regla 8 reescrita**: mencionaba un route group `(editor)` y `features/editorial/` que no existen.
- **`middleware.ts` estaba mal ubicado en los dos árboles** de la guía: va en `src/`, no en `src/app/`.
- **Árbol de `sitio-web` sincronizado con el disco** y resuelta la contradicción interna entre §4.2 y §5 (el §5 tenía razón: existen `administracion/`, `contenidos/`, `identidad-visual/`, no `dashboard/` ni `auth/`).
- **`[slug]/page.tsx` estaba etiquetado "Mesa de trabajo Puck"**; es la página pública. La mesa de trabajo es `(admin)/editor/[slug]/`.
- **H1 de `1-guia` cambiado** de "Arquitectura Maestra" a "Guía del Proyecto", que es como lo cita todo lo demás.
- **README adelgazado** a puerta de entrada: duplicaba §1–§3 de la guía y ya había divergido (diagrama roto incluido).
- **`5-tablerosBI.md` → `5-tableros-bi.md`**: era una URL suelta; ahora documenta el informe, dónde está embebido, por qué RF-08 sigue sin cumplirse y los cuatro controles S6 que faltan.

### 6. Accesibilidad: documento nuevo y fase 1 ejecutada
- Se creó **`9-accesibilidad.md`**: nivel AA y Resolución 1519 de 2020 (RF-14), con alcance declarado **solo para `sitio-web`** — la intranet no es canal de información pública, aunque queda anotado el matiz laboral de la Ley 1618.
- **Auditoría de contraste medida, no estimada.** Los cuatro tokens de marca fallaban AA contra blanco: `#7db728` a 2.42:1, `#1face3` a 2.60:1, `#39a900` a 3.07:1, `#6da020` a 3.13:1. El botón `primary`/`success` del sitio estaba a 2.42:1 contra un mínimo de 4.5:1.
- El barrido destapó cuatro focos más: las variantes `success`, `warning` e `info` de `notification.tsx` —la amarilla con texto blanco a **1.48:1**, el peor del sistema— y `.admin-btn-primary` en `globals.css`.
- **Fase 1 ejecutada.** La paleta se partió por rol: tokens de identidad (sin texto encima) y tokens interactivos (`#2a7d00` a 5.21:1, `#1f5c00` a 8.11:1, `#0b6d8f` a 5.84:1). Se corrigieron `button.tsx`, `notification.tsx` (color de texto ahora por variante), `globals.css`, `custom-select.tsx`, `switch.tsx`, `auth-ui.tsx` y `first-login-flow.tsx`.
- Se corrigió en `1-guia` y `README` la afirmación de que la identidad y la accesibilidad se cumplían "por construcción": la arquitectura lo habilita, pero los átomos incumplían.
- **Verificación:** `tsc --noEmit` limpio, `eslint` limpio, `npm run build` correcto, utilidades nuevas confirmadas en el CSS compilado, barrido posterior sin combinaciones fallidas.

### Pendiente al cierre
- Fases 2 a 6 de `8-ciclo-editorial.md` §5 sin ejecutar.
- Fases 2 a 6 de `9-accesibilidad.md` §4 sin ejecutar; la 2 (reglas `jsx-a11y`) es la que impide reintroducir lo corregido.
- La decisión de paleta del §3.1 espera visto bueno de quien administra la identidad SENA.
- 9 advertencias `no-img-element` en la intranet, deliberadas.
- Prettier y Husky + lint-staged sin instalar.
- `sitio-web/src/features/auditoria/` no tiene `index.ts`.

---

## sesión 20-07-2026:
1. Limpieza y Reestructuración en sitio-web (App Router y Feature-Sliced)
### Consolidación de Rutas Públicas:
- Se eliminó el page.tsx suelto en la raíz que tenía lógica pesada y colisionaba.
- Se movió la lógica a src/app/(public)/page.tsx para respetar el enrutamiento limpio.
- Se movió la ruta dinámica de Puck src/app/[slug]/page.tsx hacia src/app/(public)/[slug]/page.tsx.
### Saneamiento de Componentes y Estilos:
- Se eliminaron los componentes duplicados sueltos en src/shared/ui que ya estaban correctamente ubicados dentro de atoms/, molecules/ y organisms/.
- Se eliminó la carpeta obsoleta src/styles (y su auth-loader.module.css que no se utilizaba).
### Limpieza General:
- Se eliminaron múltiples layouts y vistas deprecadas (como src/app/panel-general, src/features/paginas, src/components/, etc.) que ya habían sido migradas a features/.
2. Cumplimiento de Clean Architecture en api-backend
### Nuevos Repositorios (Data Access):
- Se creó pagina.repository.ts para aislar las consultas a los modelos Sequelize de las páginas (antes los use-cases tocaban la BD directamente, lo cual violaba la arquitectura).
- Se renombró paginas.repository.ts a contenido.repository.ts (ya que realmente manejaba el modelo de Contenidos/Posts).
### Refactorización de Nomenclatura (Posts → Contenidos):
- Se renombraron los modelos, rutas, controladores y casos de uso de "Posts" a "Contenidos" (Contenido.ts, contenido.controller.ts, contenido.routes.ts, contenido.usecase.ts) para alinear el backend con el lenguaje del dominio (Ubiquitous Language).
### Separación de Casos de Uso (Use Cases):
- Se independizaron los casos de uso en las carpetas correctas: /paginas (para la gobernanza de Puck) y /contenidos (para adjuntos, secciones e informes).
### Delegación de Controladores:
- Se movió la lógica de colas BullMQ desde las rutas hacia el nuevo trabajos.controller.ts, garantizando que las rutas (.routes.ts) sigan siendo archivos con "cero lógica".
### Consolidación de la Documentación (Raíz del Proyecto):
- Se reescribieron e integraron las reglas clave arquitectónicas directamente en 1-guia-del-proyecto.md, 2-convenciones-del-proyecto.md, etc., eliminando los archivos duplicados o desactualizados (guia-del-proyecto.md, SEGURIDAD_OLO.md, CONVENCIONES_CODIGO_OLO.md).
- Se detalló formalmente en la documentación la dependencia unidireccional del backend y el concepto de rutas "delgadas" para Next.js.
- Todo quedó respaldado en GitHub bajo el mensaje: "Refactor: Limpieza de sitio-web y api-backend, consolidación de docs"