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
| **Volumen** | Un disco que Docker guarda aparte del contenedor. La base de datos vive en uno (`pg18_data`) y los archivos que sube la gente en otro (`olo-app_filesystem`): por eso sobreviven aunque el contenedor se borre o se reconstruya. | Un disco externo enchufado al contenedor. |
| **Carpeta montada** | Una carpeta de tu Windows que el contenedor ve como suya. Aquí solo se usan para lo que viene con el repositorio: la configuración de nginx y los formatos de ejemplo de las cargas. | Una carpeta compartida en red. |
| **Docker Compose** | La lista de contenedores del proyecto, cómo se conectan y qué necesita cada uno. `deploy.sh` la usa por ti. | El plano del edificio. |
| **nginx** | Recibe todas las visitas y las reparte: las páginas al sitio o a la intranet, y lo que empieza por `/api-backend` y los archivos subidos (`/uploads/...`) a la API. | La recepción del edificio. |
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
                                                 /api-backend, /uploads ──────────►─┘            ├─► redis
                                                                                                 └─► archivos (volumen olo-app_filesystem)
```

---

## A. Servidor con túnel, desde cero

### A0. Qué necesitas

- Windows 10 u 11 con permisos de administrador.
- Una cuenta de Microsoft o de GitHub (para el túnel).
- Acceso al repositorio en GitHub.
- La cadena de conexión de la base de origen (Neon), para copiar los datos. Está en
  `4000-api-backend/.env` de quien desarrolla, como `DATABASE_URL`.

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
PDF, Excel) no van en la base: viven en el volumen `olo-app_filesystem` (ver «Los
archivos subidos»). Algunos de la intranet vienen con el repositorio; pásalos al volumen:

```bash
./docker/deploy.sh migrar-archivos
```

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

> `importar` es **solo para una instalación nueva**: vacía todas las tablas, cuentas
> incluidas. Por eso se niega a correr si la base ya tiene algún usuario. En un servidor en
> uso, para llevar las páginas, usa `importar-paginas` (A6b).

### A6b. Llevar solo las páginas a un servidor en uso

Para publicar en el servidor lo que se preparó en el origen **sin tocar las cuentas**:

```bash
git pull                              # trae también filesystem/: las imágenes y PDF nuevos
./docker/deploy.sh importar-paginas
```

Es como cambiar el contenido de las vitrinas sin tocar la lista del personal: se
reemplazan las páginas (sitio e intranet, con todas sus versiones) y se queda todo lo demás.

| Se reemplaza | Se queda como está |
|---|---|
| `paginas` y `paginas_versiones` (las de aquí que no existan en el origen desaparecen) | `usuarios`, `preguntas_seguridad`, `roles`, la bitácora y todas las demás tablas |
| El permiso de edición de cada página (`editar.{ámbito}.{slug}`) se crea si falta, y se conceden los del origen **por nombre de rol** | Las **visitas** de cada página: son las reales de este servidor |
| Los archivos de las páginas (`filesystem/sitio`, `filesystem/intranet`) se copian al volumen **sin pisar** ninguno | Los Excel de las cargas (`cargas-datos`) |

- La **autoría** (quién creó, revisó o publicó cada versión) pasa a la cuenta de este
  servidor **con el mismo correo**; si aquí no hay nadie con ese correo, queda vacía.
- Si un rol del origen no existe aquí, sale un `WARNING` con su nombre: sus permisos de
  edición no se copiaron. Créalo en `/admin/roles` y repite el comando.
- Todo va en una sola transacción, como `importar`: si algo falla, las páginas quedan como
  estaban. Repetirlo no hace daño.
- Solo se vacía la caché de respuestas de la API (`cache:*`), no la cola de trabajos.

**Sin acceso a la base de origen: llevar las páginas por GitHub.** Si el servidor no
alcanza Neon (o no quieres dejar su clave en el `.env`), las páginas viajan en un archivo,
como una carta en vez de una llamada. En el equipo de desarrollo:

```bash
./docker/deploy.sh exportar-paginas        # escribe 4000-api-backend/seed/paginas-volcado.sql
git add 4000-api-backend/seed/paginas-volcado.sql && git commit -m "chore: volcado de páginas" && git push
```

(`exportar-paginas` no usa Docker ni el `.env` de la raíz: lee la base a la que apunte
`4000-api-backend/.env`. Es lo mismo que `npm run paginas:volcar` dentro de esa carpeta.)

y en el servidor:

```bash
git pull
./docker/deploy.sh importar-paginas --desde-archivo      # o --desde-archivo=otra/ruta.sql
```

Hace lo mismo que arriba (mismas tablas, misma transacción, mismo saneo), con estas
diferencias:

- No pide `ORIGEN_DATABASE_URL`.
- **Las versiones quedan sin autor.** El archivo no lleva cuentas ni correos, porque lo que
  va a GitHub no puede llevar datos personales. Los permisos de edición sí se conceden, por
  nombre de rol.
- **Por defecto es un inicio limpio**: cada página con versión publicada llega con solo esa
  versión, como la **versión 1**, y con 0 visitas. Sin historial, sin borradores y sin
  respaldos (`filesystem/*/backup/` no se copia). Lo primero que se edite en el servidor
  será la versión 2. Una página que en desarrollo no tiene nada publicado no viaja, ni
  `prueba` de la intranet (la lista de exclusiones está en `volcar-paginas.ts`).
  Con `./docker/deploy.sh exportar-paginas --con-historial` viajan todas las páginas con
  todas sus versiones (borradores y en revisión incluidos) y sus visitas, y los respaldos
  también se copian.
- **Los archivos también quedan como en el repositorio.** En el inicio limpio, antes de copiar,
  se **borran** del volumen `uploads/` y `backup/` de `sitio` e `intranet` y se copian los de
  `filesystem/`. No se tocan `cargas-datos` (los Excel) ni `filesystem/panel` (la identidad
  visual). Si el repositorio no trae ningún archivo de un ámbito (un `git pull` incompleto), ese
  ámbito no se limpia. El comando lo avisa antes de pedir confirmación; haz antes
  `./docker/deploy.sh backup`. Con `--con-historial` o con el origen en vivo solo se agrega lo
  que falta, sin borrar.
- Es una foto de la base de desarrollo: lo que no esté **publicado** allí no llega, y lo que
  se edite después tampoco hasta volver a generar el archivo.
- Si el archivo no cuadra al terminar de cargar (faltan páginas o versiones), la importación
  entera se deshace.
- En un servidor nuevo, el orden es `crear-admin` y luego `importar-paginas --desde-archivo`.
  La bitácora (`auditoria_cambios`) no se toca: arranca vacía.

### A6c. Retirar un rol que el producto ya no tiene (`visitante_interno`)

Piensa en dar de baja un cargo del organigrama: antes de borrar el cargo hay que decidir qué
pasa con las personas que todavía lo tienen. `visitante_interno` se retiró el 2026-09-15 (se
fusionaron los roles de dirección) y un servidor antiguo puede tener a alguien con ese rol.
Un servidor nuevo ya no lo crea (el seed se corrigió el 2026-10-23).

**1. Mira primero. Este paso no cambia nada:**

```bash
./docker/deploy.sh retirar-rol
```

- `El rol «visitante_interno» no existe en esta base. No hay nada que hacer.` → terminaste.
- Si lista cuentas, hay que decidir qué hacer con cada una (paso 2).

**2. Decide y aplica.** Elige **una** salida y agrega `--aplicar` (sin él solo simula):

| Opción | Qué pasa con las cuentas | El rol |
|---|---|---|
| `--reasignar-a=Editor` | Pasan a ese rol (el que elijas; nunca uno protegido). **Es la salida segura**: nadie pierde cuenta ni historial | Se borra |
| `--reasignar-a=Editor --inactivar-usuarios` | Pasan a ese rol **y quedan inactivas**: no entran, el historial se conserva | Se borra |
| `--inactivar-usuarios` (sola) | Quedan inactivas | **Se conserva**: una cuenta no puede quedarse sin rol |
| `--borrar-usuarios` | Se eliminan. Solo si no figuran en la bitácora; si figuran, se niega y propone inactivar | Se borra |

```bash
./docker/deploy.sh retirar-rol --reasignar-a=Editor --aplicar
```

**3. Comprueba:** vuelve a correr `./docker/deploy.sh retirar-rol`; debe decir que el rol no existe.

Todo ocurre en **una transacción** (se hace entero o no se hace nada), cada cuenta que cambia deja
su fila en la bitácora con el autor «Mantenimiento (retirar-rol)», y los roles protegidos
(`Superadmin`, `Administrador`, `Director/Subdirector`) no se pueden retirar ni usar de destino.
El mismo comando sirve para otro rol retirado con `--rol=<nombre>`.

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
| En el celular, abrir la dirección del sitio (o de la intranet) en Chrome | Menú ⋮ → **Instalar app** o **Agregar a la pantalla principal**. En iPhone: Safari → Compartir → **Agregar a inicio**. Queda un ícono con el logo del OLO sobre azul |
| Con el sitio instalado y ya visitado, activar el modo avión y abrirlo | La portada se ve (es la última copia); una página no visitada muestra **«Estás sin conexión»**. La intranet siempre muestra ese aviso: no guarda páginas |

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
2. **Copia las carpetas de archivos** que se hayan subido en el servidor viejo, cada una
   encima de la suya en `C:\OLO` (acepta combinar carpetas). Desde ahí las pasa al volumen
   `./docker/deploy.sh migrar-archivos`, en A6. Si el viejo es de antes del 2026-09-25,
   las carpetas tienen otro nombre:

   | En el servidor viejo | En `C:\OLO` |
   |---|---|
   | `sitio-web\public\storage` | `3000-sitio-web\public\storage` |
   | `intranet\public\storage` | `3001-intranet\public\storage` |
   | `api-backend\uploads` | `4000-api-backend\uploads` |
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

## Una sola vez: la actualización que renombra las carpetas

Desde el 2026-09-25 las apps se llaman `3000-sitio-web`, `3001-intranet` y
`4000-api-backend`. `git pull` muda el código, pero **no lo que la gente subió en el
servidor**: Git no conoce esos archivos y los deja en las carpetas viejas. Si no se
mueven, el sitio arranca sin esas imágenes ni documentos. El `.env` está en `C:\OLO` y no
cambia.

En Git Bash, desde `C:\OLO`:

1. **Apaga todo y respalda la base:**

   ```bash
   ./docker/deploy.sh stop
   ./docker/deploy.sh backup
   ```

2. **Trae el código nuevo:** `git pull`. Si dice que no puede borrar un archivo porque está
   en uso, cierra el Explorador o el editor que tenga abierta esa carpeta y repite.
3. **Pasa lo subido a las carpetas nuevas.** `cp -n` copia sin pisar nada que ya exista:

   ```bash
   mkdir -p 3000-sitio-web/public/storage 3001-intranet/public/storage 4000-api-backend/uploads
   cp -rn sitio-web/public/storage/. 3000-sitio-web/public/storage/
   cp -rn intranet/public/storage/.  3001-intranet/public/storage/
   cp -rn api-backend/uploads/.      4000-api-backend/uploads/
   ```

4. **Reconstruye y arranca:** sigue «Una sola vez: los archivos pasan al volumen» desde su
   paso 3: las carpetas nuevas de arriba son las que ese paso copia al volumen.
5. **Comprueba** con A8, y abre una página que tenga una imagen subida antes de la
   actualización. Si se ve, borra las carpetas viejas `sitio-web`, `intranet` y
   `api-backend`. Git ya las ignora, así que no vuelven a aparecer.

---

## Una sola vez: los archivos pasan al volumen (y Redis guarda su AOF)

Desde el 2026-10-06 lo que sube la gente ya no vive en carpetas del repositorio sino en el
volumen `olo-app_filesystem`, y solo la API lo toca (ver «Los archivos subidos»). La
misma actualización enciende el AOF de Redis (`--appendonly yes`), que anota cada escritura
y así no pierde las cargas en cola ni los contadores de intentos de login si el equipo se
apaga de golpe.

Las dos cosas necesitan un paso antes de `start`. Sin él, la API arrancaría con el volumen
vacío y Redis también vacío: un Redis que arranca con AOF y todavía no tiene el archivo AOF
no lee el que tenía, empieza de cero.

En Git Bash, desde `C:\OLO`:

1. **Trae el código nuevo:** `git pull`.
2. **Respalda la base:** `./docker/deploy.sh backup`. Los archivos todavía están en las
   carpetas del repositorio, y el paso 5 copia sin tocarlas: ellas mismas son el respaldo.
3. **Reconstruye:** `./docker/deploy.sh build`. Lo que está corriendo sigue funcionando
   mientras tanto.
4. **Activa el AOF de Redis en caliente**, para que escriba su archivo con lo que tiene
   ahora:

   ```bash
   CLAVE=$(sed -n 's/^REDIS_PASSWORD=//p' .env | tr -d '\r')
   docker exec redis redis-cli --no-auth-warning -a "$CLAVE" CONFIG SET appendonly yes
   docker exec redis redis-cli --no-auth-warning -a "$CLAVE" INFO persistence | grep -E 'aof_enabled|aof_rewrite_in_progress|aof_last_bgrewrite_status'
   ```

   Repite la última línea hasta ver `aof_rewrite_in_progress:0` y
   `aof_last_bgrewrite_status:ok` (con estos datos tarda menos de un segundo).
5. **Copia los archivos al volumen:** `./docker/deploy.sh migrar-archivos`. Al final dice
   cuántos hay en cada carpeta.
6. **Arranca:** `./docker/deploy.sh start`. Es `start` y no `restart`: `restart` reinicia
   los contenedores que ya existen, sin aplicar el compose nuevo.
7. **Repite `./docker/deploy.sh migrar-archivos`.** Recoge lo que alguien haya subido entre
   el paso 5 y el 6; lo que ya está en el volumen no lo toca.
8. **Comprueba:**
   - A8, y una página del sitio y otra de la intranet con imágenes o PDF de antes.
   - `docker exec redis redis-cli --no-auth-warning -a "$CLAVE" INFO persistence | grep aof_enabled`
     dice `aof_enabled:1`.

Las carpetas de antes (`3000-sitio-web\public\storage`, `3001-intranet\public\storage`,
`4000-api-backend\uploads\cargas-datos`) ya no se usan, y las imágenes de Docker no las
incluyen. Guárdalas hasta haber comprobado todo; después se pueden vaciar desde el
Explorador. Si luego `git status` muestra archivos borrados, eran de los que vienen con el
repositorio: devuélvelos con `git checkout -- <carpeta>`.

---

## El día a día

Recuerda: en cada ventana nueva de Git Bash, primero `cd /c/OLO`.

| Quiero… | Comando |
|---|---|
| Ver si todo está arriba | `./docker/deploy.sh status` |
| Ver qué está pasando (Ctrl+C para salir) | `./docker/deploy.sh logs` |
| Ver los mensajes de un solo servicio | `docker logs -f api` (o `sitio-web`, `intranet`, `nginx`, `db`) |
| Reiniciar contenedores existentes (sin aplicar imagenes nuevas ni cambios del compose) | `./docker/deploy.sh restart` |
| Apagar todo | `./docker/deploy.sh stop` |
| **Actualizar a una versión nueva del código** | `git pull` → `./docker/deploy.sh build` → `./docker/deploy.sh start` |
| Respaldar la base y los archivos | `./docker/deploy.sh backup` (deja un `.sql` y un `.tar.gz` en `C:\OLO`) |
| Restaurar la base | `./docker/deploy.sh restore backup_olo_db_AAAAMMDD_HHMMSS.sql` |
| Restaurar los archivos | `./docker/deploy.sh restore-archivos archivos_AAAAMMDD_HHMMSS.tar.gz` |
| Llevar a Docker lo subido con `npm run dev` (solo en un equipo de desarrollo) | `./docker/deploy.sh migrar-archivos` (copia `filesystem/` al volumen sin pisar nada) |

**Respaldo completo = base + archivos**, y `backup` hace los dos, con la misma fecha en el
nombre: `backup_olo_db_<fecha>.sql` y `archivos_<fecha>.tar.gz`. Se restauran en pareja:
una base sin sus archivos deja las páginas con imágenes y PDF rotos. Copia los dos a otro
disco: un respaldo en el mismo equipo no sirve si falla ese equipo.

> **Nunca ejecutes `git clean` ni `git reset --hard` en el servidor.** Los archivos subidos
> ya no están en el repositorio, pero en `C:\OLO` siguen el `.env` y los respaldos, que git
> no conoce: un `git clean` con las opciones equivocadas se los lleva.

> **Nunca borres el volumen `olo-app_filesystem`** (`docker volume rm`, o «Delete» en
> Docker Desktop → Volumes): son todos los archivos subidos. `docker compose down -v` no lo
> toca, porque está declarado como externo, pero sí borraría el de la base.

> **Si cambia la dirección del túnel** (lo borraste, caducó o usas otro nombre): actualiza
> `SITIO_WEB_URL_PUBLICA` e `INTRANET_URL_PUBLICA` en el `.env` y ejecuta `build` y `start`.
> Sin reconstruir, los botones y el panel seguirían apuntando a la dirección vieja.

### Los archivos subidos

Todo lo que sube la gente vive en el volumen `olo-app_filesystem`, que solo monta la
API. El sitio y la intranet no tocan el disco: piden cada archivo a la API (en el sitio,
nginx se lo manda directo; en la intranet pasa por su middleware, que exige sesión).

```
olo-app_filesystem                  (dentro de la API: /filesystem)
├── sitio/
│   ├── uploads/                    adjuntos de las páginas del sitio, por tipo:
│   │   ├── img/                    JPG y PNG
│   │   ├── pdf/
│   │   ├── excel/
│   │   ├── word/
│   │   ├── presentaciones/         PowerPoint
│   │   └── otros/
│   └── backup/<id de página>/      lo de la última versión archivada de cada página
├── intranet/                       lo mismo para la intranet (solo con sesión)
│   ├── uploads/…
│   └── backup/…
└── cargas-datos/                   Excel de "Actualizaciones": nunca se sirven
```

- **Nombres:** cada archivo se guarda como `<uuid>.<extensión>`. El nombre original queda
  en la página, no en el disco.
- **Qué se puede subir:** PDF, Excel, Word, PowerPoint, JPG y PNG. Se comprueba el tipo
  real del archivo, no la extensión. Nada de SVG ni HTML.
- **URL:** las de siempre, `/uploads/img/<uuid>.png`. Las imágenes del sitio se guardan un
  año en el navegador (el nombre nunca se repite); las de la intranet se comprueban en
  cada visita.
- **Verlos:** Docker Desktop → **Volumes** → `olo-app_filesystem` → **Browse**, o en
  Git Bash `docker exec api sh -c 'ls -R /filesystem' | less`.
- **Los formatos de ejemplo** de "Actualizaciones" no están aquí: vienen con el
  repositorio en `4000-api-backend\uploads\formatos-carga` y se cambian reemplazando el
  archivo, sin reconstruir.

### Cómo se monta el volumen

No hay que montarlo a mano: `deploy.sh` lo crea y Docker Compose lo conecta a la API cada
vez que arranca la pila. Son tres piezas, y tienen que estar las tres:

| Pieza | Dónde está | Qué hace |
|---|---|---|
| **1. El volumen existe** | `deploy.sh`, al empezar cualquier comando | Si no hay un volumen `olo-app_filesystem`, lo crea vacío (`docker volume create olo-app_filesystem`). Si ya existe, no lo toca. |
| **2. Compose lo declara externo** | `docker-compose.servidor.yml`, al final, en `volumes:` | Le dice a Compose que el volumen ya existe y no es suyo: no lo crea, no le cambia el nombre y `down -v` no lo borra. |
| **3. La API lo monta en `/filesystem`** | `docker-compose.servidor.yml`, servicio `api-backend` | Lo conecta dentro del contenedor en la carpeta `/filesystem`, y `FILESYSTEM_DIR` le dice a la API que guarde ahí. |

Estas son las líneas del compose (ya están, no hay que escribirlas):

```yaml
services:
  api-backend:
    environment:
      FILESYSTEM_DIR: /filesystem      # dónde guarda la API (pieza 3)
    volumes:
      - filesystem:/filesystem         # <volumen>:<carpeta dentro del contenedor> (pieza 3)
      - ./4000-api-backend/uploads/formatos-carga:/app/uploads/formatos-carga:ro

volumes:
  filesystem:                          # el nombre que usa el compose, arriba
    name: olo-app_filesystem           # el nombre real del volumen en Docker
    external: true                     # ya existe y no es de Compose (pieza 2)
```

**En un servidor nuevo** el primer comando de `deploy.sh` crea el volumen vacío. Los
archivos llegan con `./docker/deploy.sh restore-archivos archivos_<fecha>.tar.gz`, desde un
respaldo, o con `./docker/deploy.sh migrar-archivos`, desde las carpetas de antes.

**Reglas:**

- **Solo la API lo monta.** No lo agregues a `sitio-web`, `intranet` ni `nginx`: lo que
  está en el disco de un frontend se puede servir sin pasar por los permisos de la API
  (`docs/3-seguridad-del-proyecto.md` §S1).
- **No le cambies el nombre.** Está escrito en dos sitios: `name:` en el compose y
  `VOLUMEN_DE_ARCHIVOS` en `deploy.sh`. Con otro nombre, la API arrancaría con un volumen
  nuevo y vacío, y los archivos se quedarían en el viejo.
- **No lo cambies por una carpeta de Windows** (`C:\...:/filesystem`). Con Docker Desktop,
  cada lectura de una carpeta de Windows cruza de Windows a la máquina virtual de Docker y
  va más lenta. Además, cualquiera puede borrar o bloquear un archivo desde el Explorador.
- **No está en `C:`.** Vive dentro de la máquina virtual de Docker Desktop
  (`/var/lib/docker/volumes/olo-app_filesystem/_data`). No se busca con el Explorador:
  se ve en Docker Desktop → **Volumes**, o con los comandos de abajo.

**Comprobar que está montado.** Con la pila arriba, en Git Bash:

```bash
docker volume inspect olo-app_filesystem --format '{{.Name}} {{.Mountpoint}}'
docker inspect api --format '{{range .Mounts}}{{.Name}} -> {{.Destination}} (escritura: {{.RW}}){{"\n"}}{{end}}'
docker exec api sh -c 'echo $FILESYSTEM_DIR; ls /filesystem; du -sh /filesystem'
```

Deberías ver:

```
olo-app_filesystem /var/lib/docker/volumes/olo-app_filesystem/_data
olo-app_filesystem -> /filesystem (escritura: true)
 -> /app/uploads/formatos-carga (escritura: false)
/filesystem
cargas-datos
intranet
sitio
5.4M	/filesystem
```

La línea que empieza por ` ->`, sin nombre, es la carpeta de los formatos de ejemplo: es
de Windows y la API la monta de solo lectura. Las carpetas `cargas-datos`, `intranet` y
`sitio` aparecen la primera vez que se sube algo, o después de `migrar-archivos`. La
última línea es lo que ocupa todo lo subido, así que el número cambia.

Si falta la línea `olo-app_filesystem -> /filesystem`, la API está corriendo sin el
volumen: guarda dentro del contenedor y todo lo que se suba se pierde al recrearlo. Pasa
cuando la pila se levantó con un compose viejo, o con `restart` después de una
actualización. `./docker/deploy.sh start` vuelve a crear el contenedor con el compose
actual.

**Abrirlo sin la API.** Con la API apagada, para mirar o sacar archivos, se monta en un
contenedor de paso. Es lo que hacen por dentro `backup`, `restore-archivos` y
`migrar-archivos`:

```bash
MSYS_NO_PATHCONV=1 docker run --rm --mount type=volume,source=olo-app_filesystem,target=/filesystem,readonly alpine:3 ls -R /filesystem
```

`readonly` impide borrar algo por error: ese contenedor no puede escribir. Para copiar un
archivo del volumen a la carpeta en la que estás:
`docker cp api:/filesystem/sitio/uploads/img/<uuid>.png .`

> **Git Bash y las rutas que empiezan por `/`.** Antes de pasarle un comando a Docker,
> Git Bash convierte toda palabra que empiece por `/` en una ruta de Windows: `/filesystem`
> llega como `C:/Program Files/Git/filesystem`, y Docker responde `mount path must be
> absolute` o «no existe». Por eso los comandos de esta guía meten la ruta dentro de
> `sh -c '...'`, o empiezan con `MSYS_NO_PATHCONV=1`. En PowerShell no pasa.

**En desarrollo no hay volumen.** Con `npm run dev`, `FILESYSTEM_DIR` está vacía en
`4000-api-backend/.env`, y la API guarda en la carpeta `filesystem/` de la raíz del
repositorio (git la ignora). Para pasar esos archivos al volumen de Docker:
`./docker/deploy.sh migrar-archivos`. No apuntes `FILESYSTEM_DIR` a la ruta interna del
volumen (`\\wsl.localhost\docker-desktop\...`): cambia entre versiones de Docker Desktop y
es lenta.

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
- Comprueba que está en el volumen: `docker exec api sh -c 'ls /filesystem/sitio/uploads/img'`
  (o `intranet/...`, o la carpeta de su tipo).
- Comprueba que la API tiene el volumen montado (ver «Cómo se monta el volumen»).
- Si pasó justo después de la actualización que pasó los archivos al volumen, falta
  `./docker/deploy.sh migrar-archivos` (ver «Una sola vez: los archivos pasan al volumen»).
- En la intranet, los archivos exigen sesión: abierto sin sesión, lleva al login.
- `docker logs api` muestra el error, si lo hay.

### `external volume "olo-app_filesystem" not found`
Se levantó la pila con `docker compose` a mano. `deploy.sh` crea el volumen si falta;
usa siempre `./docker/deploy.sh start`. Si de verdad hace falta crearlo a mano:
`docker volume create olo-app_filesystem` (vacío: después, `restore-archivos`).

### Aprobar una página no cambia lo que se ve
1. `REVALIDAR_SECRET` tiene que estar en el `.env` (lo genera `setup`).
2. Redis tiene que estar arriba (`status`).
3. El sitio guarda su propia copia hasta un minuto: espera y recarga.

### El celular no ofrece «Instalar app»
- Tiene que ser la dirección **https** del túnel: por `http://` (salvo `localhost`) el
  navegador no instala nada.
- Pasa primero el aviso de Microsoft (A7) y recarga.
- Abre `<dirección>/manifest.webmanifest`: tiene que verse un texto que empieza por `{`
  y dice `"name":`. Si ves una página web (el aviso de Microsoft o el login), el
  navegador tampoco puede leerlo. En la intranet, revisa que el `matcher` de
  `3001-intranet/src/middleware.ts` siga dejando pasar `manifest.webmanifest` y `sw.js`.
- En Chrome de escritorio: F12 → **Application** → **Manifest** dice qué le falta.

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
│   ├── sql/importar-*.sql           # Pasos de `deploy.sh importar` e `importar-paginas` antes y después del volcado
│   ├── deploy.sh                    # El único comando que hace falta usar
│   └── guia-bash.md                 # Esta guía
├── .env.example / .env              # Plantilla / valores reales (el .env NO se sube a git)
├── backup_*.sql / archivos_*.tar.gz # Lo que deja `deploy.sh backup` (no se sube a git)
├── 4000-api-backend/uploads/formatos-carga/  # Formatos de ejemplo de las cargas (carpeta montada)
└── packages/                        # Los siete paquetes @olo/* compartidos
```

Los archivos subidos no están aquí: viven en el volumen `olo-app_filesystem` (ver
«Los archivos subidos»).

> La documentación interactiva de la API (Swagger, `/api/docs`) está apagada en
> producción. Se enciende con `SWAGGER_HABILITADO=true` en el `.env`, si hace falta.
