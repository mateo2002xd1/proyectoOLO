# Guía de despliegue - OLO Proyect

Esta guía lleva el proyecto desde un equipo vacío hasta un servidor funcionando, con los
datos reales y publicado en internet. No da nada por sabido: cada paso dice qué escribir,
qué deberías ver y qué hacer si no lo ves.

El proyecto se levanta de **una sola forma**: el servidor real, sin dominio propio,
publicado con un túnel de Microsoft (devtunnel). La define `docker/docker-compose.servidor.yml`
y se maneja siempre con `./docker/deploy.sh`.

> **Qué se retiró y dónde está.** Hasta el 2026-09-23 había otras dos formas: servidor con
> dominio propio y SSL (`docker-compose.prod.yml`, `nginx/nginx.conf.template`,
> `init-ssl.sh`) y desarrollo en Docker (`docker-compose.yml`, `docker-compose.override.yml`,
> `dev-entrypoint.sh`). Se quitaron para no confundirlas con esta. Siguen en el historial de
> git: `git checkout ce29d80 -- docker/<archivo>` las trae de vuelta el día que haya un
> dominio. Para desarrollar, cada app corre en tu equipo con `npm run dev`.

---

## Glosario

Antes de empezar, las piezas con las que vas a trabajar. Si una palabra de la guía no
te suena, está aquí.

| Término | Qué es | Piénsalo como… |
|---|---|---|
| **Imagen** | El programa ya preparado y empaquetado (la API, el sitio, la intranet), listo para arrancar. Se crea con `build`. | Un molde. |
| **Contenedor** | Una imagen funcionando. Si lo borras y lo vuelves a crear, sale igual que el molde: lo que tenía dentro se pierde. | La pieza que sale del molde. |
| **Volumen** | Un disco que Docker guarda aparte del contenedor. La base de datos vive en uno (`pg18_data`), por eso sobrevive aunque el contenedor se borre. | Un disco externo enchufado al contenedor. |
| **Carpeta montada** | Una carpeta de tu Windows que el contenedor ve como suya. Aquí se usan para los archivos subidos: los ves en el Explorador y sobreviven a todo. | Una carpeta compartida en red. |
| **Docker Compose** | La lista de contenedores del proyecto, cómo se conectan y qué necesita cada uno. `deploy.sh` la usa por ti. | El plano del edificio. |
| **nginx** | Recibe todas las visitas y las reparte: las páginas al sitio o a la intranet, y lo que empieza por `/api-backend` a la API. | La recepción del edificio. |
| **Túnel (devtunnel)** | Un programa de Microsoft que crea una dirección pública `https://…devtunnels.ms` y la conecta con tu equipo, sin abrir puertos en el router. | Un puente desde internet hasta la recepción. |
| **Puerto** | El número de puerta por el que se entra a un programa. nginx tiene dos: **8080** (sitio) y **8081** (intranet). Las apps usan 3000, 3001 y 4000, pero solo dentro de Docker. | El número de una puerta. |
| **Migraciones** | Los pasos que crean y actualizan las tablas de la base de datos. Corren solos al arrancar. | Los planos de la base. |
| **`.env`** | El archivo con las contraseñas y direcciones de esta instalación. No se sube a git. | El llavero. |
| **Git Bash** | La terminal que se instala con Git para Windows. Los comandos `./docker/deploy.sh` se escriben ahí, **no en PowerShell**. | — |

Así queda armado el servidor:

```
Internet                          Tu servidor (Windows + Docker Desktop)
────────                          ─────────────────────────────────────────────────
https://olo-8080.….devtunnels.ms ─┐
                                  ├─ devtunnel ─► nginx :8080 ─► sitio-web  (3000) ─┐
https://olo-8081.….devtunnels.ms ─┘              nginx :8081 ─► intranet   (3001) ─┼─► api (4000) ─► db (Postgres 18)
                                                 /api-backend ────────────────────►─┘            └─► redis
```

---

## A. Servidor con túnel, desde cero

### A0. Qué necesitas

- Windows 10 u 11 con permisos de administrador.
- Una cuenta de Microsoft o de GitHub (para el túnel).
- Acceso al repositorio en GitHub.
- La cadena de conexión de la base de origen (Neon), para copiar los datos. Está en
  `api-backend/.env` de quien desarrolla, como `DATABASE_URL`.

### A1. Instalar los programas

Abre **PowerShell como administrador** y ejecuta:

```powershell
winget install Git.Git
winget install Docker.DockerDesktop
winget install Microsoft.devtunnel
```

Reinicia el equipo. Después:

1. Abre **Docker Desktop** y espera a que abajo a la izquierda diga *Engine running*. En
   *Settings → General* marca **Start Docker Desktop when you sign in**: así, si el
   servidor se reinicia, el proyecto vuelve a levantarse solo.
2. Comprueba en PowerShell:

   ```powershell
   docker version     # debe mostrar un bloque "Server"
   devtunnel --version
   git --version
   ```

   Si `docker version` dice *failed to connect to the docker API*, Docker Desktop no está
   abierto o todavía está arrancando.

### A2. Traer el código

Abre **Git Bash** (menú Inicio → *Git Bash*). Todos los comandos desde aquí van en Git Bash.

```bash
cd /c
git clone <url-del-repositorio> OLO
cd /c/OLO
git checkout main
```

> Usa una carpeta corta y sin espacios, como `C:\OLO`. Si ya tienes el proyecto corriendo
> en otra carpeta, no la borres todavía: sigue antes la sección
> [Si ya hay una versión anterior corriendo](#si-ya-hay-una-versión-anterior-corriendo).

### A3. Crear el túnel

El túnel va **antes** de construir porque sus dos direcciones quedan grabadas dentro del
sitio y de la intranet al construirlos.

```bash
devtunnel user login            # abre el navegador para entrar con Microsoft (o: -g para GitHub)
devtunnel create olo --allow-anonymous
devtunnel port create olo -p 8080
devtunnel port create olo -p 8081
devtunnel show olo
```

- `create olo` crea un túnel **persistente**: su dirección no cambia aunque apagues el
  equipo. Si el nombre `olo` ya está tomado, usa otro (por ejemplo `olo-sena`) en todos
  los comandos.
- `--allow-anonymous` permite entrar sin cuenta de Microsoft: es un sitio público.
- `devtunnel show olo` lista los dos puertos. Anota las dos direcciones, que tienen esta
  forma: `https://olo-8080.use.devtunnels.ms` (sitio) y `https://olo-8081.use.devtunnels.ms`
  (intranet). Si `show` no las muestra, aparecen al encender el túnel en A7.

> **No uses el "reenvío de puertos" de VS Code para el servidor.** Crea un túnel que muere
> al cerrar VS Code, y su dirección cambia cada vez.

### A4. Configurar el `.env`

```bash
./docker/deploy.sh setup
```

La primera vez crea el `.env` a partir de `.env.example` y genera solas las contraseñas
(`POSTGRES_PASSWORD`, `JWT_SECRET`, `REVALIDAR_SECRET`, `REDIS_PASSWORD`). Después dice
que faltan valores: es normal. Abre el `.env` (`notepad .env`) y rellena:

| Variable | Valor |
|---|---|
| `POSTGRES_DB` | `olo_db` (viene puesto) |
| `POSTGRES_USER` | `olo_user` (viene puesto) |
| `SITIO_WEB_URL_PUBLICA` | la dirección del puerto 8080 del paso A3, **sin barra al final** |
| `INTRANET_URL_PUBLICA` | la dirección del puerto 8081 del paso A3, **sin barra al final** |
| `ORIGEN_DATABASE_URL` | la cadena de conexión de Neon (la borrarás al terminar, paso A9) |

### A5. Construir y arrancar

```bash
./docker/deploy.sh build     # construye las imágenes: 5 a 15 minutos la primera vez
./docker/deploy.sh start     # crea la base, aplica las migraciones y levanta todo
./docker/deploy.sh status
```

Deberías ver seis servicios: `db`, `redis`, `api`, `sitio-web`, `intranet` y `nginx`, todos
*Up* (`db` y `redis` además *healthy*). En Docker Desktop aparecen agrupados bajo el proyecto
**`olo-web-app`**. Los volúmenes conservan el prefijo `olo-app_` del nombre anterior a
propósito: así no se pierden los datos que ya existían. La base está vacía todavía: el sitio
abre con la portada de respaldo.

> **¿Por qué en Docker Desktop solo `nginx` muestra puertos?** Es a propósito. En la
> columna *Port(s)*, `nginx` aparece como `127.0.0.1:8080-8081->8080-8081`: son las dos
> únicas puertas abiertas hacia tu equipo. `sitio-web` (3000), `intranet` (3001), `api`
> (4000), `db` (5432) y redis (6379) muestran su puerto **sin flecha**, o nada: escuchan
> solo dentro de la red privada de Docker, donde nginx los alcanza por su nombre. Siguiendo
> con la analogía, son oficinas internas del edificio, sin puerta a la calle. Así:
>
> - Nadie puede saltarse a nginx y llegar a la API o a la base desde fuera. Tampoco desde
>   otro equipo de la red local.
> - El `127.0.0.1` hace que ni siquiera las puertas de nginx se vean desde la red: solo el
>   túnel, que corre en este mismo equipo, las usa.
>
> Si necesitas entrar a una pieza interna para revisar algo, hazlo desde dentro:
> `docker exec -it db psql -U olo_user olo_db` para la base, o `docker logs api` para ver
> la API.

### A6. Traer los datos reales y crear el administrador

```bash
./docker/deploy.sh importar
```

Pide confirmación (`s`) y hace, en orden:

1. Pone el esquema al día (migraciones).
2. Copia los datos de la base de origen con `pg_dump` 18, dentro de un contenedor temporal.
3. Borra lo que hubiera en esta base y carga la copia **en una sola transacción**: si algo
   falla, la base queda exactamente como estaba.
4. Muestra una tabla con las filas de cada tabla en el origen y aquí. Todas deben coincidir,
   salvo las marcadas *(no viaja)*.
5. Sincroniza los permisos y vacía la caché.

**Qué viaja y qué no:**

| Viaja | No viaja (la tabla existe, pero llega vacía) |
|---|---|
| Páginas del sitio y de la intranet con **todas** sus versiones (publicadas, borradores, en revisión, archivadas) | `usuarios` y `preguntas_seguridad`: las cuentas y sus datos personales |
| Roles, permisos y sus asignaciones | `auditoria_cambios`: la bitácora guarda nombre, IP y navegador de cada persona |
| Datos del observatorio: programas sobresalientes, programas, centros, departamentos, niveles | `bloqueos_edicion` y `subidas_pendientes`: estado temporal de sesiones del origen |
| Cargas de datos y el registro de archivos | `migraciones_aplicadas`: la genera esta instalación |
| Configuración, identidad visual, políticas de privacidad, secciones y contenidos | |

Lo que en el origen decía *quién* hizo algo (`creado_por`, `publicado_por`, `revisor_id`,
`subido_por`…) queda vacío, porque esas personas no existen aquí. Los **archivos** (imágenes,
PDF, Excel) no van en la base: vienen con el repositorio en `sitio-web/public/storage`,
`intranet/public/storage` y `api-backend/uploads`.

Después, crea la primera cuenta:

```bash
./docker/deploy.sh crear-admin
```

Pide correo y contraseña:
- El correo **tiene que ser `@sena.edu.co`**: el login rechaza cualquier otro dominio, y
  `crear-admin` también, para no crear una cuenta que nunca podría entrar.
- La contraseña, mínimo 12 caracteres, con tres de estos cuatro: mayúscula, minúscula,
  número, símbolo.

Es la única forma de crear la primera cuenta; las demás se crean desde el panel. En el
primer ingreso, el sistema pide configurar las preguntas de seguridad.

> `importar` borra también las cuentas de esta instalación. Si lo repites, repite después
> `crear-admin`.

### A7. Encender el túnel

```bash
devtunnel host olo
```

Deja esa ventana abierta: mientras siga así, el sitio está en internet. Abre la dirección
del sitio en el navegador. La primera vez, Microsoft muestra una página de aviso
(*"You are about to connect to a developer tunnel"*): pulsa **Continue**. Es propia del
servicio gratuito y aparece una vez por navegador y por dirección.

**Para que el túnel se encienda solo** al iniciar sesión en Windows, en PowerShell (sin
administrador, con el usuario del servidor):

```powershell
$devtunnel = (Get-Command devtunnel).Source
$accion    = New-ScheduledTaskAction -Execute $devtunnel -Argument "host olo"
$inicio    = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$ajustes   = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit 0
Register-ScheduledTask -TaskName "OLO - tunel" -Action $accion -Trigger $inicio -Settings $ajustes
```

> Docker Desktop y el túnel arrancan **cuando el usuario inicia sesión**, no con el equipo
> encendido. El servidor tiene que quedar con la sesión iniciada (bloqueado está bien, con
> la sesión cerrada no).

### A8. Comprobar que todo funciona

| Prueba | Qué deberías ver |
|---|---|
| Abrir `http://localhost:8080` en el servidor | La portada del sitio, con contenido real |
| Abrir `http://localhost:8081` en el servidor | El login de la intranet |
| Abrir la dirección del sitio desde **otro** equipo o el celular | La portada (tras el aviso de Microsoft) |
| Botón **Intranet** del encabezado del sitio | Lleva a la dirección del túnel de la intranet, no a `localhost` |
| Entrar al panel del sitio (`/login`) con la cuenta de A6 | El panel carga, con las páginas y sus versiones |
| Cambiar de sección varias veces | En `localhost:8080`, menos de 1 s. Por el túnel se suma la demora del servicio de Microsoft: se midió entre 1,5 y 7 s por petición |
| Subir una imagen desde el editor y verla | Se ve al momento, sin reiniciar nada |
| `./docker/deploy.sh restart` y volver a entrar | Todo sigue ahí: páginas, cuentas e imágenes |

### A9. Limpieza

Borra la línea `ORIGEN_DATABASE_URL=...` del `.env`. Es la contraseña de la base de origen
y ya no hace falta. Si algún día vuelves a importar, la pones otra vez.

---

## Si ya hay una versión anterior corriendo

Antes de A5, en la carpeta donde corre el proyecto viejo:

1. **Respalda la base actual**, por si acaso (PowerShell):

   ```powershell
   docker exec database sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > respaldo-servidor-antes.sql
   ```

   (`database` es el nombre del contenedor de la base en la versión vieja: compruébalo con
   `docker ps`.)
2. **Copia las carpetas de archivos** que se hayan subido en el servidor viejo:
   `sitio-web\public\storage`, `intranet\public\storage` y `api-backend\uploads`. Pégalas
   encima de las de `C:\OLO` (acepta combinar carpetas).
3. **Detén y quita los contenedores viejos** (los datos de sus volúmenes no se borran):

   ```powershell
   docker rm -f api intranet sitio-web database olo-app-redis-1
   ```

Sigue en A5. Cuando compruebes que todo funciona (A8), puedes borrar la carpeta vieja.

> La versión vieja corría `next dev` (modo desarrollo) porque se levantó con
> `docker compose up` dentro de `docker/`. Así, Docker sumaba solo el archivo
> `docker-compose.override.yml`, el de desarrollo, y esa era la causa de la lentitud. Ese
> archivo ya no existe, pero la regla sigue: **en el servidor usa siempre
> `./docker/deploy.sh`**, nunca `docker compose up` a mano.

---

## El día a día

Recuerda: en cada ventana nueva de Git Bash, primero `cd /c/OLO`.

| Quiero… | Comando |
|---|---|
| Ver si todo está arriba | `./docker/deploy.sh status` |
| Ver qué está pasando (Ctrl+C para salir) | `./docker/deploy.sh logs` |
| Ver los mensajes de un solo servicio | `docker logs -f api` (o `sitio-web`, `intranet`, `nginx`, `db`) |
| Reiniciar todo | `./docker/deploy.sh restart` |
| Apagar todo | `./docker/deploy.sh stop` |
| **Actualizar a una versión nueva del código** | `git pull` → `./docker/deploy.sh build` → `./docker/deploy.sh start` |
| Respaldar la base | `./docker/deploy.sh backup` (deja un `.sql` en `C:\OLO`) |
| Restaurar un respaldo | `./docker/deploy.sh restore backup_olo_db_AAAAMMDD_HHMMSS.sql` |

**Respaldo completo = base + archivos.** `backup` solo guarda la base. Copia también, a otro
disco, `sitio-web\public\storage`, `intranet\public\storage` y `api-backend\uploads`.

> **Nunca ejecutes `git clean` ni `git reset --hard` en el servidor.** Los archivos que la
> gente sube viven dentro de las carpetas del repositorio, y esos comandos los borran.

> **Si cambia la dirección del túnel** (lo borraste, caducó o usas otro nombre): actualiza
> `SITIO_WEB_URL_PUBLICA` e `INTRANET_URL_PUBLICA` en el `.env` y ejecuta `build` y `start`.
> Sin reconstruir, los botones y el panel seguirían apuntando a la dirección vieja.

---

## Solución de problemas

### `deploy.sh` dice "command not found" o "bad interpreter"
Lo estás ejecutando en PowerShell o CMD. Abre **Git Bash**.

### `SITIO_WEB_URL_PUBLICA debe ser https://<host> sin barra final`
Revisa el `.env`: la dirección debe empezar por `https://` y terminar en el nombre, sin `/`
al final (`https://olo-8080.use.devtunnels.ms`). Para probar en el propio equipo antes de
tener túnel se admite `http://localhost:8080`, pero después hay que reconstruir con las
direcciones del túnel.

### `importar` falla al leer la base de origen
- Revisa `ORIGEN_DATABASE_URL` en el `.env`: completa y sin comillas.
- El servidor necesita salida a internet.

### `importar` dice que la carga falló
No cambió nada: la carga es una sola transacción y se deshizo entera. El volcado queda en
`importacion_AAAAMMDD_HHMMSS.sql` para revisarlo. Los dos motivos más probables:
- **`column "x" of relation "y" does not exist`:** la base de origen tiene una migración que
  este código todavía no trae. Haz `git pull`, `build` y vuelve a importar.
- **`Referencia rota`** o **`es obligatoria y apunta a un usuario`:** el mensaje dice la
  tabla y la columna. Hay datos que dependen de algo que no viaja. Hay que decidir a mano
  qué hacer con ellos.

### `api` se reinicia una y otra vez
- `Hay N migración(es) sin aplicar` → `./docker/deploy.sh migrar`.
- Falta `JWT_SECRET` → la API se niega a arrancar sin él; revisa el `.env`.

### El sitio abre pero el login o el panel fallan
Casi siempre el sitio se construyó con otras direcciones: revisa `SITIO_WEB_URL_PUBLICA` e
`INTRANET_URL_PUBLICA` y reconstruye (`build` y `start`).

### Una imagen subida no se ve
- Comprueba que existe en `sitio-web\public\storage\uploads\...` (o en la de la intranet).
- `docker logs sitio-web` muestra el error, si lo hay.

### Aprobar una página no cambia lo que se ve
1. `REVALIDAR_SECRET` tiene que estar en el `.env` (lo genera `setup`).
2. Redis tiene que estar arriba (`status`).
3. El sitio guarda su propia copia hasta un minuto: espera y recarga.

### El túnel no conecta
- `devtunnel host olo` tiene que estar corriendo (ventana abierta o la tarea de A7).
- `devtunnel show olo` confirma que existe y que tiene los puertos 8080 y 8081.
- Un túnel sin uso durante mucho tiempo puede caducar. Si hubo que crear otro, la dirección
  cambió: sigue el aviso *Si cambia la dirección del túnel*.

---

## Estructura de archivos

```
OLO/
├── docker/
│   ├── docker-compose.servidor.yml  # La pila: Postgres 18, redis, api, sitio, intranet y nginx
│   ├── nginx/nginx.servidor.conf    # La recepción: puertas 8080 (sitio) y 8081 (intranet)
│   ├── sql/importar-*.sql           # Pasos de `deploy.sh importar` antes y después del volcado
│   ├── deploy.sh                    # El único comando que hace falta usar
│   └── 7-despliegue.md              # Esta guía
├── .env.example / .env              # Plantilla / valores reales (el .env NO se sube a git)
├── api-backend/uploads/             # Excel de las cargas del observatorio (carpeta montada)
├── sitio-web/public/storage/        # Archivos subidos al sitio (carpeta montada)
├── intranet/public/storage/         # Archivos subidos a la intranet (carpeta montada)
└── packages/                        # Los siete paquetes @olo/* compartidos
```

> La documentación interactiva de la API (Swagger, `/api/docs`) está apagada en
> producción. Se enciende con `SWAGGER_HABILITADO=true` en el `.env`, si hace falta.
