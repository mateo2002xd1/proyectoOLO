# Manual para principiantes — Docker y base de datos en OLO

> Este documento es para quien nunca ha usado Docker. Si ya conoces Docker y solo
> necesitas los comandos de despliegue en un servidor real (dominio, SSL), ve
> directo a [7-despliegue.md](7-despliegue.md). Este manual cubre lo mismo pero
> **explicado desde cero**, para levantar el proyecto en tu propia máquina.

---

## 0. Conceptos, antes de tocar nada

No hace falta memorizar esto, pero sí entenderlo una vez para que los comandos
de abajo dejen de ser magia.

| Palabra | Qué es | Analogía |
|---|---|---|
| **Imagen** | Una plantilla de solo lectura con el sistema operativo, Node, tu código y las dependencias ya instaladas | La receta de un plato, escrita y lista |
| **Contenedor** | Una imagen *en ejecución*. Puedes crear varios contenedores desde la misma imagen | El plato ya cocinado a partir de esa receta |
| **Dockerfile** | El archivo que describe *cómo se construye* una imagen, paso a paso | Los pasos de la receta |
| **`docker compose`** | La herramienta que levanta *varios* contenedores a la vez (API, base de datos, sitio web...) y los conecta entre sí | El menú completo: varios platos que se sirven juntos y coordinados |
| **`docker-compose.yml`** | El archivo que le dice a Compose qué contenedores crear, con qué imagen, qué puertos abrir y de qué otros dependen | El menú escrito |
| **Volumen** | Una carpeta que vive fuera del contenedor, para que los datos (la base de datos, por ejemplo) sobrevivan aunque el contenedor se borre | El congelador: si tiras la olla, la comida guardada no desaparece |
| **Migración** | Un script que modifica la estructura de la base de datos (crear una tabla, añadir una columna) de forma ordenada y repetible | Instrucciones de montaje, numeradas, que hay que aplicar en orden |

**¿Por qué usar Docker en vez de instalar Postgres, Redis y Node directo en tu
máquina?** Porque así tu máquina y la de cualquier otra persona del equipo (o el
servidor de producción) corren *exactamente* la misma versión de cada pieza. Sin
Docker, "en mi máquina funciona" es un problema constante.

Este proyecto en concreto levanta **cinco piezas**, cada una en su propio
contenedor:

| Servicio | Qué hace | Puerto en tu máquina |
|---|---|---|
| `db` | PostgreSQL 16 — donde vive todo el dato | `5432` |
| `redis` | Caché y colas de tareas | `6379` |
| `api-backend` | La API (Express) — la única que habla con `db` | `4000` |
| `sitio-web` | El sitio público + panel de administración (Next.js) | `3000` |
| `intranet` | La intranet de directores (Next.js) | `3001` |

---

## 1. Instalar lo necesario (una sola vez)

1. **Docker Desktop** para Windows: <https://www.docker.com/products/docker-desktop/>
   - Durante la instalación, acepta usar **WSL2** (te lo va a proponer solo).
   - Al terminar, abre Docker Desktop y espera a que el ícono de la ballena, en
     la barra de tareas, deje de animarse — significa que el "motor" (Docker
     Engine) ya está arriba. **Sin Docker Desktop abierto, ningún comando de
     este manual funciona.**
2. Verifica que quedó instalado, abriendo una terminal (PowerShell) y
   escribiendo:
   ```powershell
   docker --version
   docker compose version
   ```
   Si ambos comandos responden con un número de versión, está listo. Si dice
   "no se reconoce como un comando", reinicia Windows — el instalador de Docker
   agrega el programa al PATH, y a veces necesita ese reinicio.
3. **Git Bash** (normalmente ya viene con Git para Windows). Lo vas a necesitar
   para el script `deploy.sh`, que está escrito en bash y **no corre en
   PowerShell**. Todo lo demás de este manual sí funciona en PowerShell.

---

## 2. Ubicarte en el proyecto

Abre PowerShell y entra a la carpeta del proyecto (ajusta la ruta si tu copia
está en otro lugar):

```powershell
cd "C:\Users\David Tejada\Desktop\OLO-proyect"
```

Todos los comandos de este manual se ejecutan **desde aquí**, la raíz del
repositorio — no desde dentro de `docker/`, ni de `api-backend/`.

---

## 3. Variables de entorno — el archivo `.env`

Docker Compose no adivina contraseñas ni claves: las lee de un archivo `.env`
en la raíz. Ese archivo **no se sube a git** (contiene secretos), así que cada
persona lo crea a mano una vez, a partir de la plantilla `.env.example`.

```powershell
Copy-Item .env.example .env
```

Abre el `.env` recién creado con cualquier editor (VS Code: `code .env`) y
completa estos campos. Los demás puedes dejarlos como están para desarrollo
local.

| Variable | Para qué sirve | Qué poner |
|---|---|---|
| `POSTGRES_DB` | Nombre de la base de datos | `olo_db` (o el que prefieras) |
| `POSTGRES_USER` | Usuario de Postgres | `olo_user` |
| `POSTGRES_PASSWORD` | Contraseña de ese usuario | **Genera una** (ver abajo) |
| `JWT_SECRET` | Firma las sesiones de login | **Genera uno** (ver abajo) |
| `REVALIDAR_SECRET` | Secreto interno entre la API y el sitio | **Genera uno**, distinto del anterior |
| `LOCAL_AUTH_EMAIL` / `LOCAL_AUTH_PASSWORD` | Una cuenta de superadmin "de fábrica", solo para desarrollo | Por ejemplo `dev@sena.edu.co` / una contraseña cualquiera de prueba |

**Cómo generar un secreto aleatorio, en Git Bash:**
```bash
openssl rand -hex 32
```

**La misma idea, si prefieres quedarte en PowerShell** (no es tan robusto como
`openssl`, pero para desarrollo local alcanza):
```powershell
-join ((48..57)+(97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Copia el resultado y pégalo como valor de `POSTGRES_PASSWORD`. Repite para
`JWT_SECRET` y para `REVALIDAR_SECRET` — **tres valores distintos**, no
reutilices el mismo.

> **Por qué no dejarlos vacíos.** La API se niega a arrancar sin `JWT_SECRET` —
> es intencional, para que nadie despliegue por accidente con un secreto por
> defecto conocido por cualquiera que haya leído el código.

---

## 4. Construir las imágenes

Esto lee cada `Dockerfile` (`api-backend/Dockerfile`, `sitio-web/Dockerfile`,
`intranet/Dockerfile`) y arma la imagen de cada aplicación: instala
dependencias, compila TypeScript, compila Next.js. La primera vez tarda varios
minutos porque descarga las imágenes base (Node, Postgres, Redis); las
siguientes veces es más rápido porque Docker reutiliza lo que no cambió.

```powershell
docker compose -f docker/docker-compose.yml build
```

Si todo termina sin errores en rojo, ya tienes tres imágenes nuevas construidas
localmente. Puedes verlas con:

```powershell
docker images
```

---

## 5. Levantar los contenedores

```powershell
docker compose -f docker/docker-compose.yml up -d
```

- `-d` = "detached": corre en segundo plano y te devuelve la terminal.
- Esto crea y arranca `db`, `redis`, `api-backend`, `sitio-web` e `intranet`.
- Compose respeta el orden de dependencias: `api-backend` espera a que `db` y
  `redis` estén *healthy* antes de arrancar (lo declara `depends_on` con
  `condition: service_healthy` en el compose).

Verifica que los cinco contenedores están corriendo:

```powershell
docker compose -f docker/docker-compose.yml ps
```

Deberías ver `db`, `redis`, `api`, `sitio-web` e `intranet` con estado `Up` (o
`running`). Si alguno dice `Restarting`, sigue leyendo — es casi seguro que
faltan migraciones (siguiente paso).

> **Por qué la API se va a reiniciar sola todavía.** Acabas de crear la base de
> datos, pero está **vacía**: no tiene ni una tabla. `api-backend` comprueba al
> arrancar si hay migraciones pendientes y, si las hay, **se niega a arrancar**
> a propósito (para no correr nunca contra un esquema a medias). Verlo
> reiniciarse en bucle en este punto es normal, no es un error tuyo.

---

## 6. Migraciones — crear las tablas

Una migración es un script versionado (`001`, `002`, `003`...) que modifica el
esquema de la base de datos. Se aplican **en orden**, una sola vez cada una: el
sistema anota en la propia base (tabla `migraciones_aplicadas`) cuáles ya
corrieron, así que ejecutar el comando dos veces no duplica nada.

Este proyecto trae un servicio de Compose dedicado, `migraciones`, pensado
para correrse **una vez** y salir (no queda como contenedor de fondo):

```powershell
docker compose -f docker/docker-compose.yml run --rm migraciones
```

- `run` crea un contenedor nuevo y ejecuta el comando que ese servicio tiene
  configurado (`npm run migrate`).
- `--rm` borra ese contenedor apenas termina — no necesitas dejarlo vivo.

Deberías ver en la consola una lista de migraciones aplicándose (`001-esquema-base`,
`002-tablas-nuevas`, ... hasta la última). Si termina sin errores, la base ya
tiene sus tablas.

**Otros comandos de migración**, útiles para ver qué pasó o deshacer:

```powershell
# Ver qué migraciones están aplicadas y cuáles faltan
docker compose -f docker/docker-compose.yml run --rm migraciones npm run migrate:status

# Deshacer la ÚLTIMA migración aplicada (no borra datos de otras tablas)
docker compose -f docker/docker-compose.yml run --rm migraciones npm run migrate:down
```

Ahora reinicia `api-backend` para que arranque limpio contra la base ya
migrada:

```powershell
docker compose -f docker/docker-compose.yml restart api-backend
docker compose -f docker/docker-compose.yml ps
```

`api` debería quedar `Up` de forma estable.

---

## 7. Verificar el esquema, sembrar datos y crear tu usuario

Estos tres pasos son opcionales pero muy recomendados en una instalación nueva:

```powershell
# 1) Confirma que cada modelo de Sequelize coincide con las columnas reales de Postgres
docker compose -f docker/docker-compose.yml exec api-backend npm run db:verificar

# 2) Carga los permisos y roles base del sistema (sin esto, nadie puede hacer casi nada)
docker compose -f docker/docker-compose.yml exec api-backend npm run sembrar:permisos

# 3) Crea la primera cuenta de Superadmin (la tabla de usuarios nace vacía a propósito)
docker compose -f docker/docker-compose.yml exec api-backend npm run crear:superadmin
```

> **Diferencia entre `run` y `exec`.** `run` crea un contenedor *nuevo* para
> ejecutar algo una vez (lo usamos para migrar, antes de que `api-backend`
> exista sano). `exec` entra a un contenedor que **ya está corriendo** — por
> eso lo usamos aquí, ahora que `api-backend` ya está `Up`.

`crear:superadmin` te va a pedir datos por consola (nombre, correo, contraseña)
de forma interactiva — síguelos.

---

## 8. Comprobar que todo funciona

Con los cinco contenedores arriba:

| Qué | URL |
|---|---|
| Sitio público | <http://localhost:3000> |
| Panel de administración del sitio | <http://localhost:3000/admin> (o donde tu login redirija) |
| Intranet | <http://localhost:3001> |
| API | <http://localhost:4000> |
| Documentación interactiva de la API (Swagger) | <http://localhost:4000/api/docs> |

Entra a `http://localhost:3000/admin` o a `http://localhost:3001` con el
usuario que creaste en el paso 7 (3).

---

## 9. El día a día: comandos que vas a repetir

```powershell
# Ver logs en vivo de un servicio (Ctrl+C para salir, no detiene el contenedor)
docker compose -f docker/docker-compose.yml logs -f api-backend

# Ver logs de todos a la vez
docker compose -f docker/docker-compose.yml logs -f

# Apagar todo (los datos de Postgres NO se pierden: viven en el volumen `pg_data`)
docker compose -f docker/docker-compose.yml down

# Volver a levantar
docker compose -f docker/docker-compose.yml up -d

# Reiniciar solo un servicio (por ejemplo, tras cambiar una variable de entorno)
docker compose -f docker/docker-compose.yml restart api-backend

# Entrar a la base de datos con psql, para mirar o consultar a mano
docker compose -f docker/docker-compose.yml exec db psql -U olo_user -d olo_db

# Después de cambiar código: reconstruir la imagen y volver a levantar
docker compose -f docker/docker-compose.yml build api-backend
docker compose -f docker/docker-compose.yml up -d api-backend
```

> **Ojo con `down -v`.** El flag `-v` sí borra los volúmenes, es decir, borra
> la base de datos completa. No lo uses salvo que quieras empezar de cero a
> propósito.

### ¿Y si quiero ver mis cambios de código sin reconstruir cada vez?

Existe un modo con "hot-reload" (recarga automática) para desarrollo activo,
documentado en [7-despliegue.md](7-despliegue.md#pila-de-desarrollo-con-hot-reload).
Este manual usa el modo simple (reconstruir e iniciar) porque es el que mejor
enseña qué hace cada pieza; una vez cómodo con estos comandos, pasar al modo
hot-reload es natural.

---

## 10. Errores típicos de la primera vez

| Síntoma | Causa probable | Solución |
|---|---|---|
| `docker: command not found` / "no se reconoce" | Docker Desktop no instalado o no reiniciaste Windows tras instalarlo | Reinstala/reinicia; confirma con `docker --version` |
| `error during connect... pipe/dockerDesktopLinuxEngine` | Docker Desktop no está abierto | Abre Docker Desktop y espera a que termine de iniciar |
| `api` en `Restarting` en bucle | Faltan migraciones, o falta `JWT_SECRET` en `.env` | Corre el paso 6; revisa que `.env` tenga `JWT_SECRET` relleno |
| `port is already allocated` (puerto 5432, 3000, etc.) | Ya tienes Postgres, u otra app, usando ese puerto en tu máquina | Cierra esa otra app, o cambia el puerto publicado en `docker/docker-compose.yml` (columna izquierda del `ports:`) |
| Cambié el código y no veo el cambio | Este modo (sin hot-reload) sirve el código ya compilado dentro de la imagen | Reconstruye: `docker compose -f docker/docker-compose.yml build <servicio>` y luego `up -d <servicio>` |
| `relation "usuarios" does not exist` (o cualquier tabla) | Las migraciones no llegaron a correr, o corriste `up` antes de migrar | Repite el paso 6 |
| Olvidé la contraseña de superadmin que creé | — | Vuelve a correr `npm run crear:superadmin` con otro correo, o edítalo por base de datos con `psql` (paso 9) |

Si nada de esto resuelve, revisa los logs del contenedor que falla — casi
siempre el mensaje de error real está ahí:

```powershell
docker compose -f docker/docker-compose.yml logs api-backend
```

---

## 11. ¿Y para desplegar en un servidor real, con dominio y HTTPS?

Ese es otro documento, más avanzado, porque suma Nginx, certificados SSL y
variables adicionales de producción: **[7-despliegue.md](7-despliegue.md)**.
La idea de fondo (imágenes, contenedores, migraciones) es la misma que acabas
de aprender aquí — solo cambia el archivo compose (`docker-compose.prod.yml`
en vez de `docker-compose.yml`) y se agregan los pasos de dominio y SSL.
