# Seguridad — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md`. Modelo de amenazas por superficie y controles concretos. Como es un portal gubernamental que maneja datos personales (Ley 1581) y ofrece edición con roles, la seguridad no es opcional.

---

## 0. Principios rectores

1. **La API es la única frontera de confianza.** Todo lo que llega del navegador es hostil hasta validarse. Ningún control de seguridad vive solo en el frontend.
2. **Defensa en profundidad.** Cada operación sensible se protege en varias capas (ruta + policy + validación), para que un fallo en una no exponga el sistema.
3. **Mínimo privilegio.** Cada rol accede solo a lo estrictamente necesario. Por defecto se niega; se permite explícitamente.
4. **Nunca confiar en el cliente para autorizar.** El JWT en el frontend solo se decodifica para UX; la firma se valida siempre en la API.

---

## 1. Superficies de ataque y su riesgo

| # | Superficie | Riesgo principal | Severidad |
|---|---|---|---|
| S1 | Subida de archivos (RF-02) | Ejecución de código, malware, path traversal | **Crítica** |
| S2 | Editor.js / contenido HTML (RF-01) | XSS almacenado | **Crítica** |
| S3 | Autenticación y sesiones (RF-16) | Robo de sesión, fuerza bruta | Alta |
| S4 | RBAC / autorización (RF-04, RF-05) | Escalada de privilegios | Alta |
| S5 | API key externa CNO/CUOC (RF-09) | Filtración de credencial | Alta |
| S6 | Contenedores Power BI / iframes (RF-08) | Clickjacking, contenido malicioso | Media |
| S7 | Formularios con datos personales (RF-13) | Incumplimiento Ley 1581, inyección | Alta |
| S8 | Descarga pública (RF-12) | Acceso a documentos no publicados | Media |
| S9 | Respaldos (RF-17) | Exposición de la copia completa de datos | Alta |
| S10 | Autorización a nivel de objeto (BOLA) | Actuar sobre objetos ajenos con una sesión válida | **Crítica** — cerrada 2026-08-17 |
| S11 | Ruta interna de revalidación de caché | Vaciado de caché a voluntad; amplificación contra la base | Media — cerrada 2026-08-21 |

---

## 2. Controles por superficie

### S1 — Subida de archivos CRÍTICO (controles de entrada puestos; filesystem fuera del webroot desde 2026-10-06)

Este es el vector más peligroso del proyecto. **Los cinco controles de entrada ya están**
vía `packages/upload-policy` (ver §4.4), y desde el 2026-10-06 **solo la API guarda y sirve
lo subido**: `POST /api/archivos/{ambito}` valida y escribe, y
`GET /api/archivos/{ambito}/{uploads|backup}/...` sirve, desde un filesystem fuera del
código y de cualquier `public/` (`infrastructure/storage/filesystem.ts`; en el servidor,
el volumen `olo-app_filesystem`, montado solo en la API). Los frontends ya no tocan el
disco: reenvían `/api/upload`, `/uploads/...` y `/backup/...` a la API (nginx en el
servidor, `next.config` en desarrollo). Lo de la intranet exige sesión en la propia API, no
solo en el middleware de Next. Pendiente: el antivirus de abajo. Los controles:

- **Validar el tipo real, no la extensión ni el `Content-Type`** declarado (ambos se falsifican). Inspeccionar los *magic bytes* del archivo.
- **Lista blanca estricta** de tipos permitidos (PDF, xlsx, JPG, PNG, SVG) — nunca lista negra.
- **SVG es peligroso**: puede contener `<script>` y ejecutar XSS al renderizarse. Sanitizar SVG (quitar scripts/handlers) o servirlo siempre con `Content-Disposition: attachment` y `Content-Security-Policy` restrictiva, nunca inline en el DOM.
- **Tamaño máximo configurable** verificado en el servidor (no solo en el cliente).
- **Renombrar el archivo** a un identificador generado (UUID); nunca usar el nombre original en el path (evita path traversal como `../../etc/passwd`).
- **Almacenar fuera del webroot** o en almacenamiento de objetos; servir mediante un endpoint controlado, no exponiendo el directorio.
- **Escanear con antivirus** si el volumen lo justifica (ClamAV).
- ~~**Nota sobre el upload actual**: el `/api/upload` de los frontends hoy escribe directo a `public/uploads` sin validación~~ — cerrado: desde el 2026-10-06 `/api/upload` es solo un reenvío a la API, que exige sesión con permiso de edición (antes bastaba cualquier sesión) y aplica los controles de arriba. El `DELETE` que tenían esos handlers no lo usaba nadie y dejaba a cualquier sesión borrar archivos publicados: no se trasladó. Borrar sigue siendo cosa de `borrarArchivosHuerfanos`.

### S2 — XSS del contenido (Editor.js) CRÍTICO

El contenido rico que crean los editores es HTML almacenado que luego se renderiza a otros usuarios. Sin sanitización, un editor malicioso (o una cuenta comprometida) inyecta scripts que se ejecutan en el navegador de todos.

- **Sanitizar en el servidor** al guardar (no confiar en sanitización solo de cliente): lista blanca de etiquetas y atributos permitidos (DOMPurify en el backend, o equivalente).
- **Nunca `dangerouslySetInnerHTML`** con contenido sin sanitizar.
- **Content-Security-Policy** que bloquee scripts inline y orígenes no confiables — mitiga el XSS aunque algo se escape.
- Aplica igual al contenido de bloques Puck que acepten texto libre.

**Reglas que salieron de la auditoría del 2026-10-22** (`auditorias/2026-10-22-xss-almacenado-y-defensas.md`; las mismas, en forma de lista de código, en `2-convenciones-del-proyecto.md` §11):

| Regla | Qué exige | Por qué |
|---|---|---|
| **XSS-01** | Un texto que vaya a un `href`, `src`, `action`, `poster` o `url()` se valida **por su valor** (esquema permitido), no por el nombre del campo. El servidor lo hace con cualquier clave y a cualquier profundidad (`sanitizarTexto` en `sanitizar-contenido.ts`); el render vuelve a comprobarlo con `enlaceSeguro` / `imagenSegura` de `@olo/url-policy` | **Corregido 2026-10-22.** Antes `sanitizarContenidoPuck` solo validaba las claves `src`, `href`, `url`, `link`, `backgroundImage` e `imageUrl`: 15 de los 21 nombres de campo probados (`urlBoton`, `urlEnlace`, `urlDestino`, `urlPowerBi`…) guardaban `javascript:` tal cual |
| **XSS-02** | La CSP **bloquea** en el sitio y en la intranet: `frame-src` con la lista única de hosts, `object-src 'none'`, `base-uri`, `form-action`, `frame-ancestors` y un `script-src` sin orígenes ajenos. Un comentario que diga «la segunda capa es la CSP» tiene que ser verdad | **Corregido en parte 2026-10-22.** Antes el sitio no mandaba CSP y la intranet solo `Report-Only`. Sigue pendiente un `script-src` estricto con nonce: las páginas públicas son estáticas/ISR y no pueden llevar un nonce por petición, y con `'unsafe-inline'` la CSP no frena un `javascript:` (lo frenan XSS-01 y XSS-04). La intranet mide la política estricta en `Report-Only` |
| **XSS-03** | `dangerouslySetInnerHTML` solo con (a) texto fijo escrito en el código o (b) HTML del contenido guardado que ya pasó por `sanitizarContenidoPuck`. Nunca con una URL, una cookie, un parámetro de la barra o una respuesta de la API sin sanear. Cada uso nuevo se anota aquí | Hoy hay 11 usos y los 11 cumplen (a) o (b); sin la lista, el siguiente se revisa a ojo |
| **XSS-04** | Un `iframe` solo apunta a una lista de hosts (Power BI, YouTube, `*.sena.edu.co`) comprobada al guardar y al pintar (`iframeSeguro`), con `sandbox` y `referrerPolicy` (`ATRIBUTOS_DE_IFRAME_SEGURO`). La lista es **una sola** (`HOSTS_DE_IFRAME`) y de ella sale `frame-src` | **Corregido 2026-10-22.** `urlPowerBi` y `videoUrl` aceptaban cualquier `https://` (marco de phishing dentro de la intranet) y, por XSS-01, hasta `javascript:`, que en un `iframe` se ejecuta sin clic |
| **XSS-05** | Todo `target="_blank"` lleva `rel="noopener noreferrer"` | Hoy se cumple (18 de 18 enlaces con `target` en el sitio, la intranet y `blocks-renderer`, comprobado leyendo cada etiqueta completa); queda escrita para que se siga cumpliendo |
| **XSS-06** | Una redirección a un valor que viene de fuera (`?redirect=`) usa `rutaInternaSegura` de `@olo/url-policy`, que rechaza `//`, `/\` y `/<tab>/` | **Corregido 2026-10-22** en los dos `login-view.tsx`; antes solo descartaban `//` (anotado el 2026-10-19) |
| **XSS-07** | En `<style>` y `style` solo entran `#rrggbb` o valores de una lista cerrada; nunca texto libre interpolado | Se cumple en `EstilosDeIdentidad` y `LetraDelPanel`; queda escrita para que se siga cumpliendo |
| **XSS-08** | **Todo** camino que escriba `paginas_versiones.contenido` pasa por `sanitizarContenidoPuck`, incluidos `cambiar-direccion` y la importación de volcados SQL; tras importar, `contenido:revisar -- --aplicar` | **Corregido 2026-10-22:** `cambiar-direccion` sanea, y `deploy.sh importar` / `importar-paginas` corren el saneo al terminar. Las siembras (`scripts/semillas/`) siguen escribiendo directo: su contenido es del repositorio, no de usuarios |
| **XSS-09** | El HTML editorial no guarda `class` ni `id`, y cada atributo de la lista blanca del sanitizador lleva en un comentario qué abre. Una clase de utilidad (`fixed inset-0 z-50`) tapa la página igual que el `style` que ya se bloqueó, y un `id` como `location` o `cookie` pisa propiedades de `document` (DOM clobbering) | **Corregido 2026-10-22.** `class` e `id` estaban en `ATRIBUTOS_PERMITIDOS` y ningún editor del OLO está configurado para escribirlos (ni la barra de Puck ni las herramientas de EditorJS que se cargan). Si un bloque llegara a necesitar una clase, se añade con una lista cerrada de valores |
| **XSS-10** | Un control nuevo contra XSS añade su caso a `npm run xss:verificar` | Un control que no se puede comprobar vuelve a romperse |

### S3 — Autenticación y sesiones (RF-16)

- **Contraseñas con bcrypt** (ya está) — coste de hashing adecuado (≥ 10 rounds).
- **Política de complejidad concreta**: definir longitud mínima, mezcla de caracteres. Hoy el requerimiento la menciona pero no está especificada — hay que escribirla.
- **JWT**: firma verificada solo en la API. Guardar en cookie `httpOnly`, `Secure`, `SameSite` — nunca en `localStorage` (accesible por XSS). La firma dura 7 días; lo que acota la sesión de verdad es la inactividad, abajo.
- **Cierre por inactividad — IMPLEMENTADO 2026-08-18.** Dos umbrales que hacen cosas distintas y por eso no coinciden:
  - **15 minutos en el navegador** (`packages/inactividad/`): a los 14 aparece un aviso con cuenta atrás de 60 s; al agotarse se llama a `/logout` y se va al login con `?motivo=inactividad`. En la mesa de edición se guarda el borrador antes de cerrar, como autoguardado (desde el 2026-09-28 el editor guarda solo cada 30 s, así que lo pendiente al cerrar es como mucho medio minuto de trabajo). Esto es **experiencia de usuario**: quien robe la cookie no ejecuta nuestro JavaScript.
  - **20 minutos en la API** (`requireAuth`, contra `usuarios.ultimo_acceso_en`): este es el control real. La columna existía y solo se escribía al iniciar sesión, así que no medía nada; ahora se refresca en cada petición, como mucho una vez por minuto para no convertir cada lectura en un `UPDATE`.
  - **La ventana del servidor es más ancha a propósito.** El cliente tiene que cerrar siempre primero, para que la gente vea el aviso en vez de un 401 a mitad de un clic; los cinco minutos de holgura absorben relojes desfasados y pestañas de fondo, donde el navegador ralentiza los temporizadores.
  - Entre pestañas la actividad se comparte por `localStorage`: sin eso, trabajar en una cerraba la sesión desde la otra — y la cookie es una sola, así que se llevaba las dos por delante.
- **Rate limiting en login** (ya hay `express-rate-limit`): limitar intentos por IP/usuario para frenar fuerza bruta. Endpoints de recuperación y preguntas de seguridad también.
- **Caducidad de cuentas (RF-16)**: hoy en STUB. Al implementar, la verificación de caducidad debe ocurrir en el login del backend, no en el frontend.
- **First-login y preguntas de seguridad**: ya implementados; verificar que el flujo no permita saltarse el cambio de contraseña obligatorio.

### S4 — RBAC / autorización (RF-04, RF-05, RF-06)

- **Doble capa**: middleware de ruta (`require-permission`) + policy en el use-case. Un endpoint administrativo nunca depende de un solo control.
- **Verificar en cada operación sensible**, no solo al entrar a una sección. Que un Editor no pueda llamar directamente al endpoint de aprobar aunque no vea el botón.
- **Hallazgo de auditoría a cerrar**: el código original tenía "RBAC definido en BD pero nunca aplicado en código". Confirmar que hoy TODA ruta administrativa aplica `require-permission`, no solo `requireAuth`.
- **El frontend oculta, el backend prohíbe**: esconder un botón es UX; la seguridad real es que la API rechace la operación.

### S5 — API key externa CNO/CUOC (RF-09)

- **La API key nunca sale al frontend.** El navegador llama a la API del OLO, y la API del OLO llama a la CNO con la key. La key vive solo en variables de entorno del backend.
- **Nunca commitear la key**; en `.env`, fuera del control de versiones.
- **Validar y limitar** las consultas que se reenvían a la CNO (evitar que el buscador se use para abusar de la API externa).

### S6 — Contenedores Power BI / iframes (RF-08)

- **Lista blanca de dominios** permitidos para incrustar (Power BI oficial, dominios SENA autorizados) — no permitir cualquier URL.
- **Validar la URL en el servidor** antes de guardarla (esquema `https`, dominio permitido).
- **`sandbox` en los iframes** y CSP `frame-src` restrictiva.
- Mitiga clickjacking y evita que un editor incruste contenido arbitrario.

### S7 — Formularios con datos personales (RF-13, Ley 1581)

- **Aceptación explícita registrada** (fecha, hora, identificador) — no marcada por defecto.
- **Validación y sanitización** de toda entrada de formulario en el servidor (Zod).
- **No registrar datos personales en logs** ni en mensajes de error.
- **Aviso de privacidad** con enlace a la política del SENA, versión vigente de la Ley 1581/2012.

### S8 — Descarga pública (RF-12)

- **Solo documentos con estado `publicado`** son descargables públicamente. Un documento en borrador o revisión nunca debe ser accesible por URL directa.
- **No confiar en URLs adivinables**: verificar el estado del contenido en el endpoint de descarga, no solo servir el archivo por path.

### S9 — Respaldos (RF-17)

- **Cifrar los respaldos** en reposo; contienen la base completa.
- **Almacenar en ubicación separada y con acceso restringido** (no en el mismo servidor sin protección).
- **Registrar y verificar** cada respaldo; probar la restauración periódicamente (un respaldo que no se puede restaurar no es un respaldo).

### S10 — Autorización a nivel de objeto (BOLA) CERRADO 2026-08-17

El JWT responde **quién eres**; no responde **sobre qué puedes actuar**. Durante toda la
vida del proyecto `requireAuth` fue el único filtro de casi todas las rutas con `:id`: se
verificaba la firma del token y la cuenta, y a partir de ahí cualquier sesión válida leía,
modificaba o borraba objetos ajenos sin que el backend consultara jamás de quién eran.

Lo que estaba abierto y ya no:

| Ruta | Lo que permitía | Dónde se cierra ahora |
|---|---|---|
| `PATCH /api/users/:id` | Cambiar el `role_id` de cualquiera → **escalada a Superadmin**; con `reset_password` la respuesta devolvía la contraseña temporal de la víctima → **toma de cuenta** | `user.routes.ts` (administra o es su cuenta) + lista blanca de autoservicio en `updateUser` |
| `/api/roles`, `/api/permissions`, `/api/role-permissions` | Concederse permisos a uno mismo | `requierePermisoUsuario('puedeAdministrarSeguridad')`. Desde el 2026-09-26 `/api/permissions` es además de solo lectura: el alta, la edición y el borrado a mano se retiraron (ningún panel los usaba) |
| `/api/sitio-users/:id` | Datos personales de ciudadanos (Ley 1581) | Se cerró con `requierePermisoUsuario('puedeAdministrarUsuarios')`; desde `013-eliminar-usuarios-sitio` la ruta ya no existe |
| `GET /api/jobs/:id` | **Sin autenticación**, con ids secuenciales de BullMQ: enumerar el resultado de exportaciones ajenas | `requireAuth` + dueño en `job.data.usuarioId`, con 404. **Hoy no existe:** `/api/jobs` era la prueba de concepto de la cola y se retiró el 2026-09-27 porque nadie la usaba; las cargas de Excel encolan desde sus propios casos de uso |
| `DELETE /api/attachments/:id` | Borrar del disco el fichero de cualquier contenido: se cargaba por id y se hacía `fs.unlinkSync` sin mirar el padre | Colgada de `/api/contenidos/:contenidoId/attachments/:id` + `exigirPertenencia`. **Hoy no existe:** la migración 036 retiró el CMS de contenidos, y `exigirPertenencia`/`exigirPropiedad` se quitaron el 2026-09-26 al quedarse sin uso |
| `GET /api/contenidos/:id` | Leer borradores y material rechazado con solo tener sesión | 404 salvo autor o `puedeVerNoPublicado` (cierra también **S8**). **Hoy no existe:** se retiró con el CMS de contenidos (migración 036) |
| `/api/alerts` | Correo y caducidad de toda la plantilla | `puedeAdministrarUsuarios` |
| Rol tomado del JWT | Degradar a alguien no surtía efecto durante 7 días | `auth.middleware.ts` lo lee de la fila, sin consulta extra |
| Cualquier ruta con sesión de primer ingreso a medias (2026-10-09) | Entrar con la contraseña temporal, salir de `/first-login` sin cambiarla y seguir usando la API con todo el rol: solo los proxies de las apps redirigían pantallas | `requireAuth` responde 403 `CONFIGURACION_PENDIENTE` mientras la fila tenga `debe_cambiar_password` o `debe_configurar_preguntas`; solo `requireAuthConConfiguracionPendiente` (estado, primer ingreso, `/me`, cambio de contraseña, guardar preguntas) la deja pasar. El login enciende `debe_configurar_preguntas` si la cuenta no tiene sus 3 preguntas. Desde la 043 la temporal vence a las 72 horas: el login la rechaza (403, después de comprobarla) y `requireAuth` corta la sesión abierta con ella (401) |

Reglas que deja fijadas:

- **La comprobación de propiedad vive en el caso de uso, no en el middleware.** Es donde el
  objeto ya está cargado y por donde pasan todos los caminos que llegan a él. El middleware
  de ruta resuelve el rol; la fila resuelve el dueño. Las dos capas, como pide §0.2.
- **404 en vez de 403 cuando el objeto no debería ser visible.** Un 403 confirma que ese id
  existe y convierte el endpoint en un enumerador. Se usa 403 solo cuando la existencia del
  objeto ya es conocida para esa sesión y lo que falta es el derecho a actuar.
- **El dueño se toma de la sesión, nunca del cuerpo.** `subidoPor`, `usuarioId` de un job y
  `creadoPor` de una versión salen de `req.user`.
- **La edición es colaborativa por decisión de producto**: cualquier Editor trabaja sobre el
  borrador de otro. La autoría se registra para RF-07, no para negar el paso. Lo que sí mira
  al dueño es **borrar**, la cuenta propia, los adjuntos y los trabajos en cola.
- **El ámbito no es una frontera de permisos** y no debe tratarse como tal mientras todos los
  roles que editan editen en las dos aplicaciones y la cola de revisión sea cruzada. Lo que
  sí se exige es que venga declarado al escribir (`exigirAmbito`), para que una cabecera
  perdida no cree la página en el sitio equivocado.

Verificación: `npm run propiedad:verificar` en `4000-api-backend`. Comprueba las policies contra
los nombres de rol reales de la tabla `roles` **y** recorre los routers de Express afirmando
que ninguna ruta con parámetro de objeto llega al controlador solo con `requireAuth`. Las
rutas cuya comprobación vive en el caso de uso se declaran en el propio script con su
motivo, así que esa lista es además el inventario de dónde está cada comprobación.

### S11 — Ruta interna de revalidación de caché CERRADA 2026-08-21

Al aprobar una página, la API llama a `POST {SITIO_WEB_URL}/api/revalidar` para que el
sitio tire su copia cacheada en vez de seguir sirviendo la versión anterior. Es la
**única ruta del sitio web que no lleva sesión** —quien la llama es un servidor, no un
navegador—, así que hay que decir explícitamente qué la protege y por qué basta.

| Control | Cómo |
|---|---|
| **Secreto compartido propio**, distinto de `JWT_SECRET` | Cabecera `x-revalidar-secreto` contra `REVALIDAR_SECRET`. Separarlo limita el daño: filtrado, sirve para vaciar caché y para nada más |
| **Sin secreto configurado, no se acepta nada** | Responde 503. Dejar la ruta abierta «hasta que se configure» sería dejar que cualquiera vacíe la caché del sitio a voluntad |
| **Comparación en tiempo constante** | `timingSafeEqual` sobre los **hashes SHA-256**, no sobre las cadenas: `timingSafeEqual` exige búferes del mismo tamaño y lanza si no lo son, y esa excepción por sí sola ya revelaría la longitud del secreto |
| **El slug se valida por forma** | `^[a-z0-9]+(?:-[a-z0-9]+)*$` y 255 caracteres de tope, antes de construir con él ninguna etiqueta |
| **No es alcanzable desde internet**: nginx la corta a propósito (desde el 2026-09-27) | La llamada de la API va por la red privada de Docker, de `api-backend:4000` a `sitio-web:3000`, sin pasar por nginx. En `docker/nginx/nginx.servidor.conf`, la puerta 8080 responde 404 a `location ^~ /api/revalidar` antes de mandar el resto al sitio. Entre el 2026-09-26 y el 27 no fue así: el cambio de prefijo a `/api-backend/` la dejó expuesta y dependía solo del secreto |

> **Lo que se anticipaba abajo pasó, y se resolvió.** Al cambiar el prefijo de nginx a
> `/api-backend/`, `/api/revalidar` quedó expuesta sin que nadie lo decidiera (detectado en
> la auditoría del 2026-09-26). El 2026-09-27 se cortó en nginx, en la puerta 8080; la
> intranet no tiene esa ruta. Si la intranet llega a tener la suya
> (`INTRANET_REVALIDAR_URL`), se corta igual en la 8081. Texto original:

**El último control es el más fuerte y el más frágil a la vez.** Hoy la ruta es
inalcanzable por un efecto colateral de la configuración de nginx —el mismo que rompe
los otros route handlers del sitio, ver §4.8—. El día que se arregle ese prefijo,
`/api/revalidar` **queda expuesta a internet** y pasa a depender solo del secreto. No es
una catástrofe: el peor caso es que alguien invalide caché repetidamente y fuerce
consultas a la base, que es exactamente el escenario que el límite de tasa de nginx
(20 r/s por IP) está para contener. Pero conviene decidirlo a propósito y no descubrirlo
después: lo natural al reordenar los prefijos es dejar `/api/revalidar` fuera de lo que
nginx publica.

Y una cosa que **no** es un agujero aunque lo parezca: la ruta la puede llamar cualquiera
que tenga el secreto tantas veces como quiera, y no pasa nada grave. Revalidar no
escribe, no borra contenido y no revela nada — lo único que hace es marcar una entrada de
caché como caducada. El daño posible es de disponibilidad, no de confidencialidad ni de
integridad, y por eso la severidad es media y no alta.

---

## 3. Controles transversales (toda la plataforma)

- **Headers de seguridad**: Helmet ya está; endurecer con CSP explícita, `X-Frame-Options`, `Strict-Transport-Security` (HSTS) en producción.
- **HTTPS obligatorio** en producción (Nginx + Let's Encrypt, ya contemplado); redirigir todo HTTP a HTTPS.
- **CORS restringido** a los orígenes de los frontends (ya configurado: `frontendUrl`, `intranetUrl`) — no `*`.
- **Rate limiting** por endpoint sensible, no solo login.
- **Validación de entrada con Zod** en todo endpoint que reciba datos.
- **Logs sin datos sensibles**: nunca loguear contraseñas, tokens, ni datos personales.
- **Dependencias**: `npm audit` en CI; mantener actualizadas las librerías con parches de seguridad.
- **Secretos en variables de entorno**, nunca en el código ni en el repo. `.env` en `.gitignore` (ya está).

---

## 4. Seguridad implementada a hoy

> **Qué es esta sección.** Las secciones 2 y 3 describen los controles que el proyecto
> *debe* tener. Esta describe los que **ya tiene**, verificados contra el código el
> 2026-08-20 y repasados el 2026-08-21, con el archivo donde vive cada uno. Sirve para
> dos cosas: que nadie reimplemente lo que ya está, y que nadie dé por supuesto lo que
> todavía no está.
>
> La regla de oro de §6 sigue mandando. Aparecer aquí significa "existe en el código y se
> comprobó", no "el riesgo está cerrado". Lo que está escrito pero aún **no** protege se
> recoge aparte en §4.8, a propósito: una lista de seguridad que solo enumera aciertos es
> una forma elegante de mentir.

### 4.1 La convención: qué es público y qué es secreto

Todo el código de frontend se ejecuta en el dispositivo de quien visita el sitio. Está
descargado en su navegador, se lee con el inspector y se puede ejecutar fuera de nuestra
página. Minificar no es cifrar: un bundle ofuscado es tan público como el HTML. De ahí la
única división que importa:

- **Identificador público** — algo que no otorga acceso por sí mismo: una URL, un slug, el
  id de un informe embebido, el nombre de una cookie. Puede ir al frontend.
- **Secreto** — cualquier cosa con la que el backend *decide confiar*: el secreto de firma
  del JWT, credenciales de base de datos, tokens de sesión, contraseñas de servicio, claves
  de APIs externas. Vive en `.env`, solo en el proceso que lo necesita, y no cruza ni al
  navegador ni al repositorio.

En Next.js la frontera es literal y no es negociable: **`NEXT_PUBLIC_*` significa "esto se
inyecta en el bundle del cliente"**. Una variable sin ese prefijo no llega al navegador,
pero sí queda disponible en el servidor de esa aplicación, y eso no la vuelve secreta por
sí solo. La pregunta correcta es la otra: *¿esta aplicación necesita este secreto?* Si no
lo usa, no se le pasa. Un secreto repartido a un servicio que no lo necesita es una copia
más que alguien puede robar, sin ninguna contrapartida.

Inventario a hoy — **todo** lo que el proyecto expone al cliente:

| Variable | Contenido | Por qué puede ser pública |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL de la API | Es la dirección a la que el navegador ya va a llamar de todos modos |
| `NEXT_PUBLIC_SITIO_WEB_URL` | URL del sitio | Enlace entre aplicaciones |
| `NEXT_PUBLIC_INTRANET_URL`, `NEXT_PUBLIC_INTRANET_EDITOR_URL` | URL de la intranet | Enlace entre aplicaciones |
| `NEXT_PUBLIC_SITE_URL` | URL canónica | Metadatos y enlaces absolutos |

Las cuatro son direcciones. Ninguna otorga acceso: conocer la URL de la API no autoriza
nada, porque quien autoriza es el JWT que la API verifica en cada petición (§S3). Ese es el
criterio para admitir una variable nueva al bundle — no "¿es sensible?", sino **"¿le sirve
de algo a quien la copie?"**.

Y lo que nunca sale del backend: `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`, `LOCAL_AUTH_*`,
`REVALIDAR_SECRET` y la futura API key de CNO/CUOC (§S5).

**`REVALIDAR_SECRET` es el primer secreto que viven dos servicios a la vez**, y por eso
merece su propia nota. Lo comparten la API y el sitio web —uno lo manda, el otro lo
comprueba— y **no es una copia de `JWT_SECRET`**. La tentación de reutilizar el que ya
hay es real y hay que resistirla: son dos niveles de confianza distintos. Con
`JWT_SECRET` se firma cualquier sesión del sistema; con este solo se puede pedir que se
vacíe una entrada de caché. Mantenerlos separados es lo que hace que una filtración del
segundo no sea una filtración del primero. `deploy.sh setup` genera los dos por separado,
precisamente para que nadie tenga que acordarse de esto.

La intranet **no lo recibe**, y no es un olvido: no guarda contenido publicado en la
caché de Next, así que no tiene nada que revalidar. Es la regla del párrafo anterior
aplicada — un secreto repartido a un servicio que no lo necesita es una copia más que
alguien puede robar, sin contrapartida.

**Se comprueba, no se supone.** Un secreto filtrado al bundle es invisible en revisión de
código y evidente en un `grep`. Desde la raíz del repositorio, esto no debe imprimir nada:

```bash
SECRETO=$(sed -n 's/^JWT_SECRET=//p' 4000-api-backend/.env | tr -d '"')
grep -rl "$SECRETO" 3000-sitio-web/.next/static 3001-intranet/.next/static
```

### 4.2 Autenticación y sesión (§S3)

| Control | Dónde vive |
|---|---|
| Contraseñas con bcrypt y política única compartida | `packages/password-policy/`, `4000-api-backend/src/shared/password-policy` |
| El JWT se firma y se verifica **solo** en la API | `use-cases/auth/login.usecase.ts`, `middlewares/auth.middleware.ts` |
| Token en cookie `httpOnly`, `Secure` en producción, `SameSite=lax` — nunca en `localStorage` | `controllers/auth.controller.ts`, `3000-sitio-web/src/app/api/auth/login/route.ts` |
| Cookies de sesión separadas por aplicación (`sitio_token` / `token`) | `3000-sitio-web/src/shared/lib/session/auth-cookies.ts`, aceptadas en `auth.middleware.ts` |
| Bloqueo de cuenta a los 5 intentos fallidos, 15 minutos | `login.usecase.ts` → `registrarFalloDeLogin` |
| **El estado de la cuenta (inactiva, bloqueada, caducada) solo se dice a quien acierta la contraseña**; un correo inexistente tarda lo mismo (bcrypt de relleno). Desde el 2026-10-22: antes esos tres mensajes salían sin conocer la clave y delataban qué cuentas existen | `login.usecase.ts`, `shared/anti-enumeracion.ts` |
| Recuperación sin enumerar cuentas: `user-questions` devuelve siempre tres preguntas (inventadas y estables por correo si no hay cuenta) y `verify` responde un único 401 sea cual sea el motivo | `security-questions.usecase.ts`, `shared/anti-enumeracion.ts` |
| Estado, bloqueo y caducidad revalidados en **cada** petición, no solo al entrar | `auth.middleware.ts` |
| Cierre por inactividad verificado en el servidor (20 min) además del aviso del navegador (15 min) | `auth.middleware.ts` + `packages/inactividad/` |
| Recuperación de contraseña limitada **por correo**, no por IP | `routes/security-question.routes.ts` → `limitadorDeRecuperacion` |

Dos decisiones que conviene no deshacer sin entender por qué están:

- **El rol se relee de la fila, nunca del claim del token.** El JWT dura 7 días y lleva
  dentro el rol que había al iniciar sesión; confiar en él significaba que degradar a
  alguien no surtía efecto durante una semana. `auth.middleware.ts` lo sustituye por el
  valor de la base, aprovechando la fila que ya carga para comprobar estado y caducidad —
  así que no cuesta una consulta extra.
- **El login no distingue "dominio no institucional" de "usuario inexistente".** Los dos
  caminos devuelven el mismo 401 genérico, y el del dominio se resuelve *antes* de tocar la
  base. Diferenciarlos convertiría el formulario en un detector de cuentas.

### 4.3 Autorización (§S4, §S10)

- **Doble capa en toda operación sensible**: middleware de ruta (`requierePermiso*`,
  `requirePermission`) más la comprobación en el caso de uso. Un fallo en una no abre la
  otra.
- **Propiedad de objeto comprobada contra la base** en usuarios, roles, permisos,
  secciones, contenidos, adjuntos y trabajos en cola. El detalle completo, con la tabla de
  lo que estaba abierto y dónde se cierra cada cosa, está en §S10.
- **404 en vez de 403** cuando el objeto no debería ser visible, para no confirmar qué ids
  existen.
- **El dueño sale siempre de la sesión, nunca del cuerpo de la petición.**

**Permisos que se crean solos, y por qué eso no rompe el modelo.** Desde el 2026-08-20
una sección del portal se crea desde el editor, y con ella nace su clave
`editar.{ambito}.{slug}` en `permisos` y su concesión en `roles_permisos`. Que el
catálogo deje de ser estático suena a pérdida de control, así que conviene fijar lo que
lo mantiene acotado:

- **La clave se deriva del slug, no la escribe nadie.** `claveDeSeccion()` es la única
  fuente de ese formato, y `requierePermisoDeSeccion` la reconstruye desde
  `req.params.slug`. No hay tabla de traducción que pueda desincronizarse.
- **Se concede al rol de quien crea, no a la persona.** El modelo es por rol y no existe
  la concesión individual. La consecuencia hay que decirla en voz alta —si quien crea es
  Editor, **todos** los Editores editarán esa sección— y el diálogo de creación la dice.
- **Crear, eliminar y cambiar la dirección son permisos distintos** (`secciones.crear`,
  `secciones.eliminar`, `secciones.cambiar-direccion`), ninguno de los tres del Editor por
  defecto. Separarlos permite dar el primero a más gente sin dar los otros: crear añade,
  eliminar destruye y no se deshace, y cambiar la dirección reescribe contenido ajeno (y rompe
  los enlaces de fuera del portal). Los tres se comprueban en el servidor, no solo en el botón;
  el cambio de dirección vuelve a validarlo todo dentro de la transacción y deja la bitácora.
  **El de cambiar la dirección, además, solo opera para quien aprueba** (Superadmin y
  Administrador, `puedePublicar`): reescribe la versión publicada sin pasar por la cola, y
  concederlo a un Editor desde el panel dejaría que ese rol cambiara lo que ve el ciudadano sin
  que nadie lo apruebe. La guarda va en la ruta y otra vez en el caso de uso (§4.3). Tampoco
  fusiona accesos: si la clave de permiso de la dirección nueva ya tiene roles, responde 409.
- **`sembrar-permisos-roles.ts` borra lo que no esté en el catálogo.** Las claves creadas
  en caliente están exentas **mientras su página exista**. Quien toque ese script tiene
  que preservar esa exención, o una siembra rutinaria revoca en silencio el acceso a todo
  lo que se haya creado desde el editor.

Un permiso del catálogo está marcado `esFrontera: false` y merece mencionarse aquí:
`editor.eliminar-bloques` **solo decide qué se pinta**. El servidor recibe el contenido
final y no distingue «borró un bloque» de «guardó una página con menos bloques» sin
comparar versiones. Está marcado en el propio catálogo para que el panel lo diga y nadie
lo tome por un control de seguridad — es exactamente la distinción de §S4: *el frontend
oculta, el backend prohíbe*, y aquí el backend no prohíbe.

### 4.4 Contenido y archivos (§S1, §S2)

- **Sanitización server-side del contenido Puck** con DOMPurify sobre jsdom, aplicada al
  guardar, al aprobar y al restaurar, no al renderizar: `shared/sanitizar-contenido.ts`,
  invocada desde `guardar-borrador`, `aprobar-pagina` y `restaurar-version-anterior`. Que el
  editor sanee también es una segunda capa, no la primera.
- **Se sanea todo texto que tenga `<`, en cualquier parte del JSON** (`content`, `root`,
  `zones` y a cualquier profundidad), no una lista de campos. Hasta el 2026-09-25 era una
  lista, y se quedó atrás: el objeto de EditorJS del bloque «Texto enriquecido», los
  `richtext` llamados `intro` y los bloques de una `DropZone` se guardaban sin limpiar. Lo
  guardado antes se revisa con `npm run contenido:revisar` (en `4000-api-backend/`), que
  solo informa salvo con `-- --aplicar`.
- **Las dos subidas** (`3001-intranet/` y `3000-sitio-web/src/app/api/upload/route.ts`) aplican los
  cinco controles de §S1: autenticación con verificación **de firma** (`jwtVerify`, no
  `decodeJwt`), detección de tipo por *magic bytes* ignorando extensión y `Content-Type`,
  lista blanca con SVG excluido, límite de tamaño en el servidor y renombrado a UUID.
- **Una sola copia de esa política**, en `packages/upload-policy`. Hasta el 2026-08-20
  estaba escrita dentro del handler de la intranet y el del sitio no tenía **ninguno** de
  los cinco: el endurecimiento se aplicó a una app y la otra quedó fuera de vista. Con la
  política compartida, arreglar una y olvidar la otra deja de ser posible.
- **La identidad visual del panel** (Configuración, migración 044) es una tercera subida y
  usa esa misma política, más dos límites propios: solo PNG (un PDF pasa la lista blanca
  pero no es un logo; JPG se quitó el 10-10-2026) y 1 MB el logo, 512 KB el icono. Cambiarla pide
  `configuracion.identidad`; los archivos se sirven sin sesión por
  `/api/configuracion/identidad-panel/archivos/{uuid}.{png|jpg}`, que solo acepta ese
  formato de nombre. Los **colores** acaban dentro de una etiqueta `<style>` del panel, así
  que se aceptan solo como `#rrggbb` en la API (`configuracion.validators.ts`) y se vuelven
  a filtrar al escribirlos (`EstilosDeAcciones`): un `}` o un `</style>` guardado sería CSS
  o HTML inyectado en la página de todas las personas del panel.
- **Tope de cuerpo de petición**: 1 MB en Express, 10 MB en nginx.
- **Las direcciones se validan por su valor, en un solo paquete** (`packages/url-policy`,
  `@olo/url-policy`, desde el 2026-10-22): `esEsquemaEjecutable` (en cualquier campo), `enlaceSeguro` e
  `imagenSegura` (al pintar), `iframeSeguro` con `HOSTS_DE_IFRAME` (al guardar y al pintar, y de ahí sale
  `frame-src`) y `rutaInternaSegura` (redirecciones). Lo usan la API, el sitio, la intranet y las dos
  `next.config`. Lee el esquema como lo lee un navegador: sin espacios, controles ni ancho cero.
- **CSP que bloquea** en el sitio y en la intranet (`next.config`): `frame-src` (lista única), `object-src
  'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'` y `script-src` solo con el propio
  origen. Probado en Chrome: bloquea un `iframe` a un sitio ajeno, deja pasar YouTube (que reproduce dentro
  del `sandbox`) y pdf.js propio dibuja un PDF real; el inicio de sesión de las dos apps carga sin violaciones.

### 4.5 Límites de tasa y abuso automatizado

Implementado el 2026-08-20. Antes de esa fecha había tres limitadores escritos y
ninguno funcionaba, por un motivo que no se ve leyendo el código de las rutas: los tres
contaban **por IP**, y la API no veía la IP de nadie.

Dos saltos la borraban. Detrás de nginx el socket que ve Express es el de nginx, y
faltaba `app.set('trust proxy')` para leer `X-Forwarded-For`. Además, las llamadas del
sitio web pasan por sus propios route handlers, que abren una petición **nueva** desde
el servidor: llegaban todas con la IP del contenedor de Next. El efecto no era «un
límite flojo», era el contrario del que se buscaba — un cubo único compartido por toda
la institución, donde diez intentos de login fallidos desde un portátil dejaban a todo
el mundo sin poder entrar durante quince minutos, y a quien abusaba no lo frenaba nada.

**Lo que hay ahora, y por qué cada clave es la que es:**

| Ámbito | Ventana | Clave | Por qué esa clave |
|---|---|---|---|
| Techo general de la API | 300 / min | IP real | Suelo para que ninguna ruta quede abierta a un bucle |
| Login | 10 / 15 min | **correo** | Atacar una cuenta solo penaliza a esa cuenta, y rotar IPs no lo esquiva |
| Preguntas de seguridad | 10 / 15 min | correo | Mismo flujo, mismo sujeto a proteger |
| Verificar respuestas | 5 / 15 min | correo | El umbral más bajo: se adivina cuenta por cuenta |
| Recuperar contraseña | 3 / hora | correo | Ya era así, y era el único que funcionaba |
| Escrituras del editor | 30 / min | **usuario** | Por IP, una sede entera tras el mismo NAT compartía cupo |
| Encolar trabajos pesados | 10 / hora | usuario | Encolar cuesta una petición; ejecutar cuesta un worker |

La regla que ordena la tabla: **donde hay sujeto conocido se cuenta por sujeto**, no
por IP. Una IP no es una persona —se comparte tras un NAT y se rota con un proxy— así
que como unidad de castigo es a la vez injusta y evitable. El correo y el id de sesión
sí identifican a quien hay que frenar.

Las tres piezas que hacen que esto funcione están separadas y **ninguna sirve sola**:

1. `app.set('trust proxy', 1)` en `4000-api-backend/src/app.ts`. El 1 significa «confía en
   un salto»: se toma la dirección de más a la derecha de `X-Forwarded-For`, que es la
   que escribe nginx con `$proxy_add_x_forwarded_for`. Lo que un visitante inyecte por
   su cuenta queda a la izquierda y se ignora, así que activarlo no permite falsificar
   la IP.
2. Los route handlers del sitio reenvían esa cabecera **sin tocarla**
   (`3000-sitio-web/src/shared/lib/api/reenviar-cliente.ts`). Añadir una entrada propia correría
   la posición y volvería a romper la cuenta.
3. `4000-api-backend/src/middlewares/rate-limit.middleware.ts` construye todos los
   limitadores desde una sola fábrica. Estaban repetidos en tres routers, que es como
   los tres acabaron compartiendo el mismo defecto.

**Almacén en Redis, con conexión propia.** Los contadores se comparten entre réplicas y
sobreviven a un reinicio; con el almacén en memoria, reiniciar el proceso limpiaba el
castigo de quien estuviera abusando. La conexión es distinta de la que usan BullMQ y la
caché a propósito: aquella se abre con `maxRetriesPerRequest: null` porque BullMQ lo
exige, y con Redis caído encola los comandos para siempre en vez de fallar — un
limitador montado encima colgaría la API entera al primer parpadeo de Redis. Esta falla
rápido, y `passOnStoreError` deja pasar la petición: perder el límite es malo, convertir
una caída de Redis en una caída de la API es peor.

**Barrera en nginx, delante de Node** (`limit_req_zone` a 20 r/s con ráfaga de 40, más
`limit_conn`). No sustituye a lo anterior: cuenta por IP, que es lo que aquí sí es
fiable —nginx es el primer salto, no hay cabecera que falsificar— y su trabajo es que
una inundación no llegue siquiera a despertar al proceso.

**Amplificación por caché, cerrada.** `cacheInterceptor` construía la clave con
`req.originalUrl` entera, querystring incluida, así que `?x=1`, `?x=2`… generaban claves
distintas hasta el infinito: cada una era un fallo de caché —consulta a la base— y
además una entrada nueva en Redis con su TTL. Un visitante anónimo convertía la caché en
un amplificador contra la base de datos y en un agotamiento de memoria a la vez. Ahora
la clave se construye desde la ruta más una **lista blanca** de parámetros declarada en
cada uso, y lo desconocido se ignora: `?cachebust=N` resuelve a la misma entrada que la
petición sin parámetros. A cambio, toda variable que lea un handler cacheado tiene que
estar declarada, o dos respuestas distintas compartirían entrada.

### 4.6 Transporte y cabeceras (§3)

Helmet en la API; CORS restringido a los dos orígenes de los frontends con `credentials`,
nunca `*`; y en nginx TLS 1.2/1.3 con suites modernas, redirección completa de 80 a 443,
HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff` y
`Referrer-Policy: strict-origin-when-cross-origin`.

### 4.7 Datos, errores y secretos en reposo

- **Sin SQL crudo en las rutas.** Todo pasa por Sequelize con parámetros; las únicas
  consultas literales están en las migraciones, sobre nombres de tabla constantes.
- **Solo un error de dominio muestra su mensaje** (`middlewares/error.middleware.ts`,
  `shared/errores.ts`): `status` entero 4xx puesto a propósito por el código. Cualquier otro
  error —Sequelize, disco, Redis, un 502 de librería— sale como un 500 genérico en producción
  y **sin su `code`** (`ENOSPC` o `ECONNREFUSED` ya dicen demasiado). Antes solo se saneaba
  el `status === 500` exacto y el `code` salía siempre (auditoría 2026-10-22). El fallo se
  registra siempre en una línea (`describirErrorParaLog`), sin traza ni `sql`/`parameters` de
  Sequelize, que llevan los valores del formulario. **No** se hace `console.error('…', error)`.
- **Lo que se guarda para enseñar en el panel pasa por `mensajeSeguroDeCarga`**:
  `cargas_datos.mensaje` conserva los mensajes escritos por el código (`Fila 12: …`) y sustituye
  los de la base o el sistema.
- **Las rutas desconocidas responden 404 en JSON** y nginx va con `server_tokens off`.
- **La paginación de auditoría tiene tope**, para que `?limit=1000000` no sea una petición
  válida contra la tabla que más crece.
- **La PWA solo guarda en el dispositivo lo que es público** (desde el 2026-09-25). Lo que
  el service worker (`public/sw.js`) guarda sigue ahí después de cerrar sesión, así que la
  regla es por app: el **sitio-web** guarda copias de las páginas públicas visitadas, pero
  nunca `/admin`, `/editor`, `/preview`, `/api` ni las pantallas de acceso, y tampoco
  ninguna respuesta con `no-store` o `private` (la red de seguridad para una ruta privada
  nueva que nadie añada a la lista). La **intranet** no guarda ninguna página ni dato: solo
  `/_next/static/` (código servido sin sesión) y su página «sin conexión». El middleware de
  la intranet deja pasar `sw.js` y `manifest.webmanifest` sin sesión; ninguno lleva nada
  privado.
- **`.env` en `.gitignore` y nunca commiteado** — verificado sobre el historial completo,
  no solo sobre el árbol de trabajo.
- **Ningún secreto en los archivos versionados.** Hasta el 2026-08-20 `docker-compose.yml`
  llevaba en claro el `JWT_SECRET` real —el mismo del `.env`, con el que se firma cualquier
  sesión— y la contraseña de la cuenta maestra. Los valores se rotaron y ahora se
  interpolan desde el `.env` de la raíz (plantilla en `.env.example`). Los antiguos siguen
  en el historial de git y están quemados: ver §4.8.
- **Ningún secreto en argumentos de build.** `3000-sitio-web/Dockerfile` recibía `JWT_SECRET`
  como `ARG`, que queda grabado en la caché de capas. El build de Next no lo lee; solo lo
  usa el handler de subida en ejecución, así que ahora se inyecta en ejecución y nada más.
- **Validación de entrada con Zod** en el alta y edición de usuarios y en el guardado de
  borradores (`middlewares/validar.middleware.ts`). Los esquemas son `.strict()`: `createUser`
  pasaba a Sequelize todo lo que no desestructuraba, así que el cuerpo de la petición podía
  escribir columnas que nadie pretendió exponer. Cobertura parcial, ver §4.8.

### 4.8 Lo que sigue abierto

Los seis puntos que ocupaban esta sección antes del 2026-08-20 están cerrados y
repartidos por §4.1 a §4.7. Lo que queda, y por qué queda:

- **La firma del secreto viejo sigue en el historial de git.** `JWT_SECRET`,
  `LOCAL_AUTH_PASSWORD` y la contraseña de Postgres se rotaron y salieron de
  `docker-compose.yml`, pero borrar un archivo no borra los commits anteriores.
  Mientras el historial no se reescriba, cualquiera con acceso al repositorio puede
  leer los valores antiguos: **están quemados y no deben reutilizarse en ningún
  entorno**. Reescribir el historial es una decisión con coste —invalida los clones de
  todo el equipo— y por eso no se hizo sin acordarlo.
- **`/api/` de nginx tapa los route handlers de Next.** `location /api/` manda todo ese
  prefijo a Express, que no conoce `/api/auth/login`, `/api/upload` ni `/api/users` — en
  producción responderían 404. Hay que decidir el prefijo antes de desplegar (lo natural
  es exponer la API como `/api-backend/`, que es lo que ya hace la intranet). Anotado en
  `nginx/nginx.conf.template` — el archivo pasó a ser una plantilla que `envsubst`
  procesa al arrancar el contenedor, así que ya no existe un `nginx.conf` que editar a
  mano. **Al resolverlo, decidir a la vez qué pasa con `/api/revalidar`** (§S11): hoy
  está protegida por este mismo efecto colateral. *(2026-09-27: el prefijo ya es
  `/api-backend/` en `docker/nginx/nginx.servidor.conf`, y `/api/revalidar` se corta ahí
  con un 404; ver §S11.)*
- **La API escucha en `127.0.0.1`.** Correcto si nginx corre en la misma máquina;
  incompatible con la topología de `docker-compose`, donde los servicios se hablan por
  nombre de red. Depende de cómo se despliegue de verdad, así que no se cambia a ciegas:
  abrirlo a `0.0.0.0` amplía la exposición y esa decisión no es del código.
- ~~**XSS almacenado por URLs sin validar**~~ y ~~**sin CSP que bloquee**~~. *Cerrados el
  2026-10-22 (`auditorias/2026-10-22-xss-almacenado-y-defensas.md`): la API vacía por valor
  cualquier esquema ejecutable, los bloques repiten `enlaceSeguro` / `iframeSeguro` al pintar,
  los dos `iframe` de texto libre van a una lista única de hosts, y las dos apps mandan una CSP
  que bloquea (`frame-src`, `object-src`, `base-uri`, `form-action`, `frame-ancestors`).*
- **`script-src` estricto (con nonce).** La CSP actual lleva `script-src 'self' 'unsafe-inline'`: no carga
  scripts de otros orígenes, pero no frena un script en línea ni un `javascript:`. Un nonce por petición exige páginas dinámicas, y las públicas son estáticas/ISR. La
  intranet mide la política estricta en `Report-Only` (hoy reporta los scripts en línea de Next).
  A evaluar: nonce solo en la intranet (todo es dinámico tras el login); en el sitio, otra vía (hashes por página).
- ~~**pdf.js desde `cdnjs.cloudflare.com` sin comprobación de integridad**~~ y ~~**`class`/`id` en el HTML
  editorial**~~. *Cerrados el 2026-10-22: pdf.js 3.11.174 se sirve desde `public/assets/pdfjs/` de cada app
  (`LEEME.txt` con el origen y la integridad del paquete), `HOSTS_DE_SCRIPT` quedó vacío y la CSP no abre
  `script-src` a ningún tercero; el sanitizador ya no guarda `class` ni `id` (XSS-09).*
- **Power BI dentro del `sandbox`, sin comprobar con un tablero real.** Se comprobó que carga su pantalla
  de inicio y que YouTube reproduce; un informe publicado de verdad solo se ve en el servidor. Si fallara,
  se ajusta `ATRIBUTOS_DE_IFRAME_SEGURO` en `packages/url-policy/src/index.ts`.
- **Un texto que empiece por «JavaScript:» desaparece al guardar** (p. ej. un título «JavaScript: lo
  básico»): es el precio de validar por valor y no por nombre de campo. Se arregla con otra redacción.
- **nginx confía en cualquier `X-Forwarded-For`** (`set_real_ip_from 0.0.0.0/0` con
  `real_ip_recursive on`). Si el túnel no reescribe la cabecera, un cliente puede fijar la IP
  que quiera: esquiva el límite de nginx y ensucia la IP de la bitácora de auditoría. Hay que
  probarlo en el servidor real (`curl -H "X-Forwarded-For: 1.2.3.4" …/api-backend/health` y
  mirar `access.log`) y, si se falsifica, limitar `set_real_ip_from` a la red de Docker.
  Detalle en `auditorias/2026-10-22-fuga-de-informacion-en-errores.md`.
- **El login devuelve el `token` también en el cuerpo JSON**, además de la cookie
  `httpOnly`: el BFF del sitio lo consume. Latente, no explotable hoy.
- **`client_max_body_size` está en 10M y la política de subida admite 50 MB** para
  documentos. Hoy nginx cortaría antes. Hay que igualar los dos números en la dirección
  que se decida.
- ~~**Las subidas siguen dentro del webroot** (`public/uploads`)~~. *Cerrado el
  2026-10-06: viven en el filesystem de la API y se sirven por `/api/archivos` — ver
  §S1.*
- **Zod cubre usuarios y borradores de página, no toda la API.** Es donde estaban el
  *mass assignment* y la entrada más grande, pero §3 dice «todo endpoint que reciba
  datos». Los que faltan siguen leyendo `req.body` directo.
- **`middleware.ts` de Next usa `decodeJwt`, que no verifica la firma**, y el rol del
  sitio sale de la cookie `sitio_role`, que no es `httpOnly`. Esto **es intencionado** y
  no un pendiente: son decisiones de qué pantalla pintar, y §0.4 dice que quien autoriza
  es la API. Está aquí para que nadie lo confunda con un control de acceso y le cuelgue
  reglas nuevas — los route handlers que sí tienen efecto (`/api/upload` en las dos
  apps) usan `jwtVerify` con firma comprobada, no esto.

### 4.9 Cómo se verifica

El proyecto comprueba sus propias reglas con scripts, no con memoria. Desde `4000-api-backend/`:

| Comando | Qué afirma |
|---|---|
| `npm run propiedad:verificar` | Que ninguna ruta con parámetro de objeto llegue al controlador solo con `requireAuth` |
| `npm run permisos:verificar` | Que las policies coincidan con los nombres de rol reales de la tabla `roles` |
| `npm run ambito:verificar` | Que toda escritura declare su ámbito |
| `npm run auditoria:verificar` | Que las operaciones auditables dejen registro |
| `npm run password:verificar` | Que la política de contraseñas se aplique en todos los caminos |
| `npm run email:verificar` | Que el dominio institucional se exija donde debe |
| `npm run xss:verificar` | Que el sanitizador del contenido de las páginas no deje pasar HTML ejecutable (34 cargas × 5 ubicaciones) ni un esquema ejecutable en una URL, sea cual sea el nombre del campo (21 campos, 14 evasiones, lo legítimo intacto), que `class` e `id` no se guarden, y que los helpers de `@olo/url-policy` (enlaces, `iframe`, redirecciones) hagan lo que dicen: 99 comprobaciones |
| `npm run errores:verificar` | Que ningún error filtre `code`, SQL ni mensajes internos, y que login y recuperación respondan igual (texto y tiempo) exista o no la cuenta |
| `npm run db:verificar` | Que cada atributo de cada modelo exista de verdad como columna. No es de seguridad, pero un modelo que apunta a una columna inexistente hace que una comprobación falle abriendo, no cerrando |
| `npm run ambito:auditar` | El inventario de escrituras y su ámbito declarado — el informe que `ambito:verificar` convierte en aprobado o suspenso |

Un control que no tiene forma de comprobarse vuelve a romperse en el siguiente cambio. Al
añadir uno nuevo a esta sección, añadir también cómo se verifica.

**Estos seis scripts son la mejor costumbre que tiene el proyecto y conviene decir por
qué funcionan:** ninguno comprueba que el código *haga* algo, comprueban que *no falte*.
`propiedad:verificar` recorre los routers de Express afirmando que ninguna ruta con
parámetro de objeto llega al controlador solo con `requireAuth`; las excepciones legítimas
se declaran **en el propio script, con su motivo**, así que esa lista es a la vez el
control y el inventario de dónde vive cada comprobación. Añadir una ruta insegura no
requiere que alguien se acuerde de revisarla: rompe la suite.

Donde esa costumbre todavía no llegó es a la accesibilidad, que no tiene ni un script
equivalente — y se nota: un cambio de tres valores hex revirtió media fase de
`9-accesibilidad.md` sin que nada avisara.

---

## 5. Checklist de seguridad por requerimiento

| RF | Control obligatorio antes de producción | Estado |
|---|---|---|
| RF-01 | Sanitizar HTML de Editor.js en el servidor | ✅ `sanitizarContenidoPuck()` al guardar — 2026-08-11. El objeto de EditorJS, `intro` y `zones` quedaban fuera hasta el 2026-09-25: desde entonces se sanea todo texto con `<`, también al aprobar y restaurar (§4.4) |
| RF-02 | Validar magic bytes, sanitizar SVG, renombrar a UUID, tamaño en servidor, fuera del webroot | ✅ Los cinco controles vía `packages/upload-policy` (intranet 2026-08-11, sitio-web 2026-08-20; SVG fuera de la lista blanca). Fuera del webroot desde 2026-10-06: la API es la única que escribe y sirve, desde su filesystem (§S1). Sin antivirus |
| RF-04/05/06 | Doble capa RBAC (ruta + policy) aplicada en TODA operación sensible | ✅ Extendido a usuarios, roles, permisos, secciones, contenidos, adjuntos y trabajos; propiedad de objeto comprobada contra la BD — `npm run propiedad:verificar` — 2026-08-17 |
| RF-08 | Lista blanca de dominios de iframe + validación de URL en servidor + sandbox | ⏳ Pendiente implementación completa |
| RF-09 | API key solo en backend, nunca expuesta al frontend | ⏳ Pendiente al construir buscador CNO |
| RF-12 | Verificar estado `publicado` en el endpoint de descarga | 🟡 Parcial: `GET /api/contenidos/:id` y sus adjuntos ya devuelven 404 si no está publicado y no eres el autor — 2026-08-17. Falta el endpoint de descarga de fichero cuando exista |
| RF-13 | Aceptación registrada + sanitización + aviso Ley 1581 vigente | ⏳ Pendiente al implementar formularios |
| RF-16 | Caducidad verificada en backend, cookies httpOnly/Secure, política de contraseña definida, rate limiting | ✅ Caducidad, cookies y política. Cierre por inactividad 15 min cliente / 20 min API — 2026-08-18. Rate limiting operativo desde 2026-08-20: `trust proxy`, claves por correo y por usuario, almacén en Redis y barrera en nginx — ver §4.5 |
| RF-17 | Respaldos cifrados, ubicación restringida, restauración probada | ⏳ Pendiente implementación |

---

## 6. Prioridad de implementación (por severidad)

La lista original de este documento está casi entera cerrada. Lo que queda, en orden:

| # | Qué | Por qué sigue arriba |
|---|---|---|
| 1 | **Sacar las subidas del webroot** (§S1) | Los cinco controles de entrada están puestos en las dos apps vía `packages/upload-policy`, así que el riesgo inmediato —cualquiera subiendo cualquier cosa— está cerrado. El estructural no: siguen escribiéndose en `public/uploads` y sirviéndose por path, en vez de fuera del webroot y por un endpoint controlado. `4000-api-backend/src/infrastructure/storage/backup-uploads.service.ts` (hasta el 2026-09-25 en `shared/storage/`, junto a un stub vacío que se borró) resuelve las carpetas y trabaja sobre `public/storage/uploads` — es decir, el código real existe, pero sigue apuntando dentro del webroot. Es ahí donde debe vivir el cambio. *2026-10-06: hecho. Lo subido vive en el filesystem de la API (`infrastructure/storage/filesystem.ts`, volumen `olo-app_filesystem` en el servidor), que lo escribe y lo sirve por `/api/archivos`; los frontends solo reenvían. Queda el antivirus de §S1* |
| 2 | **Decidir el prefijo de nginx** (§4.8) | Bloquea el despliegue, y de paso decide si `/api/revalidar` (§S11) queda expuesta. *2026-09-27: el prefijo ya es `/api-backend/` en `nginx.servidor.conf` y `/api/revalidar` se corta ahí* |
| 3 | **Extender Zod al resto de la API** (§4.8) | Cubre usuarios y borradores de página, que es donde estaban el *mass assignment* y la entrada más grande. El resto sigue leyendo `req.body` directo |
| 4 | **S6 Power BI** — lista blanca de dominios, validación de URL en servidor, `sandbox` | La tabla `tableros_bi` existe; falta toda la capa de aplicación encima. Hoy los tokens de informe están escritos a mano en tres componentes |
| 5 | **S5 API key CNO/CUOC** | Al construir el buscador |
| 6 | **S7 Habeas Data** y **S9 respaldos** | `politicas_privacidad`, `consentimientos` y `respaldos` tienen tabla y ni una línea de aplicación. Ver `11-base-de-datos.md` §4 |

Cerrados y **no hay que rehacerlos**: S2 (sanitización server-side del contenido Puck),
S3 (bloqueo por intentos, cookies, inactividad en las dos capas, caducidad revalidada en
cada petición), S4 y S10 (doble capa y propiedad de objeto, con su verificador), S8 en su
parte de contenidos, S11, y los límites de tasa completos.

> Regla de oro: ningún requerimiento se considera "terminado" hasta que pasa su fila del checklist de la sección 5. "Funciona" no es lo mismo que "es seguro".
