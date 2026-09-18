## Contexto
Estás trabajando en el proyecto OLO (Observatorio Laboral y Ocupacional) para SENA.
Es una migración/refactor de un codebase parcialmente implementado — NO es un
proyecto desde cero. Antes de mover o crear nada, debes auditar lo que ya existe.

## Reglas antes de tocar carpetas

1. **No borres código funcional sin antes confirmar que su reemplazo funciona.**
   Mueve/copia primero, verifica que compila y corre, y solo después elimina el
   archivo/carpeta original.
2. **Haz el reordenamiento en pasos pequeños y verificables**, no en un solo commit
   masivo. Cada paso debe dejar el proyecto en estado compilable.
3. **Antes de mover un archivo, busca todas sus referencias** (imports, rutas
   dinámicas de Next, alias de tsconfig) y actualízalas en el mismo paso.
4. **Respeta la separación de responsabilidades**:
   - `app/` → SOLO enrutamiento y composición. Si encuentras lógica de negocio,
     fetch directo, o componentes grandes ahí, muévelos a `features/` o `lib/`.
   - `features/<dominio>/` → todo lo que pertenece a un dominio de negocio vive
     junto, con la anatomía fija de `1-guia-del-proyecto.md` §4.0:
     `components/`, `hooks/`, `services/`, `types.ts`, `index.ts`.
     **Nunca `ui/`** (ese nombre es del sistema de diseño) ni **`api/`** (ese es
     de los route handlers de Next). No dupliques lógica de un dominio en dos
     features distintas.
   - `shared/ui/` → SOLO componentes genéricos sin conocimiento de negocio
     (si un componente importa algo de `features/`, no pertenece aquí).
   - `shared/lib/` → utilidades transversales reales (cliente HTTP, validaciones
     compartidas). Si algo solo lo usa un feature, no va aquí.
5. **Un dominio con ciclo de vida se organiza por etapas, no por tipo técnico.**
   Si el dominio tiene estados con actores, permisos o políticas de caché
   distintos, cada etapa es su propia carpeta. Caso de referencia: `paginas/`
   (`model/`, `publicacion/`, `edicion/`, `revision/`). Ver `8-ciclo-editorial.md` §3.2.
   Esto no es estético: impide cachear por accidente una respuesta autenticada.
6. **Nada cruza la frontera de un módulo salvo por su `index.ts`.**
   Si necesitas algo de otra feature y no está exportado ahí, expórtalo — no
   importes su ruta interna.
7. **Todo archivo nuevo se nombra en `kebab-case`**, incluidos los componentes
   (`tabla-usuarios.tsx`, no `TablaUsuarios.tsx`). El identificador exportado
   sigue siendo `PascalCase`. Evita el bug que solo aparece al desplegar en
   Linux, donde el sistema de archivos sí distingue mayúsculas.
8. **No mezcles zonas de acceso.** `sitio-web` tiene dos zonas: `(public)` —
   abierto, ISR, sin credenciales — y la protegida por `middleware.ts`:
   `admin/` (el panel, con su `layout.tsx` como marco común), `(auth)/admin/`
   (login y recuperación, misma URL `/admin/...` pero sin el marco del panel),
   `editor/` y `preview/`. Código de la zona protegida no se importa desde
   `(public)` ni al revés; lo que ambos necesiten
   sube a `features/` o `shared/`. La intranet no usa route groups: es 100%
   protegida, así que no hay dos zonas que separar.
9. **Verifica el nombre y la ubicación de los archivos especiales de Next.js.**
   Un nombre mal escrito hace que Next ignore el archivo silenciosamente, sin
   error visible — y estar en la carpeta equivocada tiene el mismo efecto.
   `layout.tsx`, `page.tsx` y `route.ts` van dentro de `app/`; **`middleware.ts`
   va en `src/`, nunca en `src/app/`** (así está hoy en las dos apps).
10. **No cambies el contrato de datos sin migración**: cualquier cambio a los
   campos `layout` o `contenido` (JSONB) de la tabla `contenido` debe ir con
   su migración Sequelize correspondiente, nunca editando el modelo en caliente.
11. **JWT**: recuerda que en los frontends (`jose`) solo se decodifica el token,
   nunca se valida su firma ahí. No implementes lógica de autorización basada
   solo en el decode del cliente — la validación real siempre pasa por el API.
12. **Después de cada movimiento de carpetas**, corre: build, typecheck, y si
    existen, los tests. Reporta cualquier import roto antes de continuar.

> **Sobre Tailwind v4 y los route groups:** una versión anterior de este archivo
> exigía declarar un `@source` explícito en `globals.css` por cada carpeta con
> paréntesis. **Es falso y se eliminó.** Ninguno de los dos `globals.css` tiene
> un solo `@source` y las clases se generan igual: `flex-grow` se usa una única
> vez en todo `sitio-web/src`, dentro de `app/(public)/layout.tsx`, y aparece en
> el CSS compilado. Tailwind 4.3.2 detecta las fuentes por sí solo. No añadas
> esas directivas.

## Al terminar cada fase
Entrega un resumen y guardalo en `6-auditoria.md` con su fecha de sesion:
- Qué se movió/creó/eliminó
- Qué imports se actualizaron
- Qué quedó pendiente o con TODO
- Resultado de build/typecheck


# Directivas de Contraseñas — OLO (Observatorio Laboral y Ocupacional)
 
Basadas en el modelo de directivas de contraseñas de Microsoft, ajustadas a los requisitos de autenticación y roles del proyecto OLO.
 
## 1. Composición de la contraseña
 
| Propiedad | Requisito |
|---|---|
| **Caracteres permitidos** | Mayúsculas (A-Z), minúsculas (a-z), números (0-9), símbolos `@ # $ % ^ & * - _ ! + = [ ] { } \| \ : ' , . ? / ` ~ " ( ) ; < >`, espacio en blanco **y letras acentuadas del español (`ñ`, `á`, `é`…)** |
| **Caracteres no permitidos** | Emojis y pictogramas; caracteres de control, formato e invisibles (categoría Unicode `\p{C}`, incluye el de ancho cero); cualquier espacio que no sea el normal (U+0020) |
| **Longitud mínima** | 12 caracteres |
| **Longitud máxima** | **72 bytes en UTF-8** (las letras acentuadas ocupan 2) |
| **Complejidad** | Mínimo 3 de las 4 categorías: mayúsculas, minúsculas, números, símbolos |

> **Por qué 72 bytes y no 256 caracteres.** bcrypt —el algoritmo que §3 exige y que
> el sistema usa— **ignora todo lo que pase de 72 bytes**. Anunciar 256 sería mentir
> sobre lo que se comprueba: dos contraseñas que compartieran los primeros 72 bytes
> abrirían la misma cuenta. Se valida el límite real y se rechaza antes de hashear,
> en vez de truncar en silencio. Si algún día se migra a argon2, este tope desaparece.
>
> **Por qué se admiten `ñ` y tildes.** La redacción anterior prohibía «caracteres
> Unicode», lo que dejaba fuera `Contraseña2026!` en un producto del SENA. Lo que de
> verdad hay que bloquear no son los acentos, sino lo que nadie puede volver a
> teclear igual: emojis, invisibles, y espacios que se ven como un espacio normal sin
> serlo (un NBSP copiado desde Word deja a alguien fuera de su cuenta sin explicación
> posible). Las contraseñas se normalizan a NFC antes de hashear y comparar, para que
> la misma `ñ` escrita desde dos teclados distintos siga siendo la misma contraseña.
 
## 2. Ciclo de vida de la contraseña
 
| Propiedad | Requisito |
|---|---|
| **Historial de contraseñas** | No se permite repetir las últimas 5 contraseñas usadas |
| **Expiración** | 90 días para roles Editor y Director/Subdirector |
| **Expiración — Admin** | Sin expiración forzada; rotación recomendada cada 180 días |
| **Notificación previa** | Aviso automático antes de la expiración (evento tipo `ContrasenaPorExpirar`) |
 
## 3. Protección contra ataques
 
| Propiedad | Requisito |
|---|---|
| **Intentos fallidos permitidos** | 5 intentos, **contados por cuenta** (columna `intentos_fallidos_login`) |
| **Bloqueo por intentos fallidos** | Bloqueo temporal de 15 minutos tras exceder el límite |
| **Almacenamiento** | Hash con bcrypt o argon2 (nunca texto plano, ni MD5/SHA1 solos). Hoy: bcrypt, coste 12 |

> **El límite por IP no cuenta como este control.** `auth.routes.ts` tiene un
> `rateLimit` de 10 intentos / 15 min **por dirección IP**, que es otra cosa: un
> atacante que rote direcciones lo esquiva, y no protege una cuenta concreta. Los dos
> conviven y ninguno sustituye al otro.
>
> **Este contador es distinto del de las preguntas de seguridad.** `intentos_fallidos`
> (sin sufijo) es de la recuperación por preguntas: 3 intentos y 30 minutos. Son dos
> flujos con umbrales distintos, y mezclarlos en una sola columna bloquearía a
> destiempo en ambos. `bloqueado_hasta` sí es compartido: la cuenta está bloqueada o
> no lo está, venga de donde venga.
>
> **Dónde se aplica la política y dónde no.** Se exige allí donde se *elige* una
> contraseña. Un formulario de **inicio de sesión** solo comprueba que no esté vacía:
> medir contra §1 una contraseña que ya existe dejaría fuera a todo el que la fijó
> bajo las reglas anteriores —sin poder ni enviar el formulario, ni llegar a
> recuperación, que está detrás—. Por lo mismo, la contraseña **temporal** del primer
> ingreso no se mide contra §1: se comprueba, no se elige.

## 3 bis. Dominio institucional

| Propiedad | Requisito |
|---|---|
| **Dominio admitido** | Únicamente `@sena.edu.co` |
| **Dónde se aplica** | Inicio de sesión, alta de usuario y **cambio de correo** |
| **Comparación** | Sobre el correo normalizado (`trim` + minúsculas), con `endsWith('@sena.edu.co')` |

> **Por qué también en el cambio de correo.** Restringir solo el alta dejaría abierta
> la vía de crear la cuenta con un correo válido y cambiarlo después a uno de fuera.
>
> **Por qué `endsWith` con la arroba y no `includes`.** `atacante@sena.edu.co.dominio-falso.com`
> *contiene* el dominio sin pertenecer a él, y `alguien@nosena.edu.co` *termina* en
> `sena.edu.co`. Incluir la arroba en la comparación es lo que descarta los dos casos.
> Un subdominio (`x@sub.sena.edu.co`) tampoco se admite.
>
> **En el login el motivo no se devuelve.** Un dominio ajeno recibe el mismo
> `401 Credenciales inválidas` que un usuario inexistente, y se rechaza **antes** de
> consultar la base. Devolver «dominio no permitido» convertiría el login en un
> detector de dominios. Quien se equivoca lo ve avisado en el formulario, que valida
> antes de enviar. En el alta de usuarios sí se da el motivo real: quien la usa es un
> administrador autenticado.

Verificación: `npm run email:verificar` (15 comprobaciones, incluidas las tres formas
de evasión).

## 4. Consideraciones específicas del proyecto OLO

1. **Validación en backend, no solo frontend.** La auditoría del código original mostró
   reglas (RBAC) definidas en base de datos pero no aplicadas en el código; la política
   de contraseñas debe validarse siempre en el servidor, no confiar solo en el
   formulario. La autoridad es `api-backend/src/shared/password-policy.ts`, y **los
   cinco caminos que escriben un hash pasan por ella** (primer ingreso, cambio
   voluntario, recuperación, alta de usuario y edición por administrador). El paquete
   `packages/password-policy/` que consumen las dos apps solo explica los requisitos
   mientras se escribe: no decide.
2. **Trazabilidad (Ley 1581/2012).** Los cambios de contraseña quedan registrados en
   `auditoria_cambios` con la acción `cambiar_password` y un campo `via`
   (`primer-inicio` / `cambio-voluntario` / `recuperacion`), registrando usuario, fecha,
   IP y agente — **nunca la contraseña**, ni siquiera redactada.
3. **Cuentas caducadas.** ~~Debe integrarse con el cron diario que ya dispara el evento
   `UsuarioCaducado`.~~ **Ese cron no existe.** `revisar-caducidad.job.ts` y
   `usuario-caducado.event.ts` son stubs con TODOs, y `deactivateExpiredUsers()` está
   escrita pero no la llama nadie. No hay dónde engancharse: **hay que construirlo**, y
   esa función sin llamar es el punto de partida.
4. **Flujo de recuperación.** El flujo de recovery / first-login / security-questions /
   reset-password aplica exactamente las mismas reglas de complejidad al establecer una
   nueva contraseña. **Hecho**, en las dos apps.
5. **Roles alcanzados.** La política de §1 y §3 aplica a **todas** las cuentas. Ojo: los
   roles reales son **cuatro**, no tres — `superadmin`, `administrador`, `editor` y
   `director/subdirector` (dirección y subdirección comparten un único rol, de solo
   lectura sobre la intranet). Falta decidir qué hace `superadmin` cuando se
   implemente la expiración de §2.

## 5. Estado de implementación

| Sección | Estado |
|---|---|
| §1 Composición | **Implementada** — validador único en backend, requisitos en vivo en los formularios |
| §2 Ciclo de vida | **Sin empezar** — ver abajo |
| §3 Protección contra ataques | **Implementada** — bloqueo por cuenta, bcrypt coste 12 |
| §4.1, §4.2, §4.4 | **Implementadas** |
| §4.3, §4.5 | **Pendientes**, dependen de §2 |

Lo que falta de **§2**, con su bloqueo real:

- **Historial de las últimas 5**: no existe tabla ni columna. Hay que crearla.
- **Expiración a 90 días**: falta una columna `password_changed_at`. **`expiration_date`
  no sirve para esto**: es la caducidad de la *cuenta* (RF-16), no de la contraseña, y
  mezclarlas rompería RF-16.
- **Evento `ContrasenaPorExpirar`**: depende del cron de §4.3, que hay que construir.

Verificación: `npm run password:verificar` en `api-backend` comprueba §1 y el hasheo
contra el validador real (18 comprobaciones, sin tocar la base de datos).
 