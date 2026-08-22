# Guía de Despliegue - OLO Proyect

## Requisitos Previos

- Docker y Docker Compose instalados
- Un dominio configurado (ej: `tusitio.com`)
- Acceso SSH al servidor
- Puertos 80 y 443 abiertos

---

## Antes de empezar: esta pila todavía no se ha desplegado

Conviene decirlo antes que nada, porque los pasos de abajo se leen como si funcionaran
y hoy no funcionan de principio a fin. El desarrollo se hace con las tres aplicaciones
corriendo a mano (`npm run dev`) contra una base en Neon, así que **la ruta de Docker
lleva meses sin ejercerse** y el código se movió por debajo. Lo que sigue está
verificado leyendo los archivos, no ejecutando `deploy.sh` contra un servidor.

Cinco cosas hay que arreglar antes de la primera puesta en producción. Ninguna es
difícil; lo peligroso sería descubrirlas de noche, con el dominio ya apuntando.

| # | Qué está desalineado | Evidencia |
|---|---|---|
| 1 | **Las tres imágenes copian rutas que ya no existen o no copian las que sí.** `intranet/Dockerfile` copia `intranet/app`, `components`, `lib`, `features` y `middleware.ts`: todo eso vive hoy bajo `intranet/src/`. `api-backend/Dockerfile` no copia `packages/` en absoluto, aunque su `package.json` declara `@olo/accessibility-policy` y `@olo/slug-policy` como `file:../packages/…`. `sitio-web/Dockerfile` copia **uno** de los siete paquetes que declara | `ls intranet/`, y la lista de `@olo/*` de cada `package.json` |
| 2 | **Nadie aplica las migraciones**, y la API se niega a arrancar si hay alguna pendiente (`server.ts`). En una base recién creada están las 19 pendientes, así que el contenedor entra en bucle de reinicio | Paso 6, abajo |
| 3 | **La imagen de la API no puede aplicarlas aunque se lo pidas.** `npm run migrate` es `ts-node scripts/migrate.ts`, y la imagen final hace `npm ci --omit=dev` (sin `ts-node`) y solo copia `dist/` (sin `scripts/`) | `api-backend/Dockerfile` |
| 4 | **Los dos compose montan `migrations/script.sql`** como script de inicialización de Postgres. Ese archivo se movió a `migrations/_obsoletas/`. Docker no falla por un origen que no existe: crea un directorio vacío en su lugar | `ls api-backend/src/infrastructure/db/migrations/` |
| 5 | **La API escucha en `127.0.0.1`**, que dentro de un contenedor significa "solo yo". Nginx es otro contenedor y la alcanza por nombre de red, así que no la vería | `app.listen(config.port, '127.0.0.1', …)` en `server.ts` |

Y una sexta que no impide arrancar pero sí sirve mal: **nginx manda todo `/api/` a
Express**, y el sitio web tiene rutas propias bajo ese mismo prefijo
(`/api/auth/login`, `/api/upload`, `/api/users`) que Express no conoce — responderían
404 en producción. Lo natural es exponer la API como `/api-backend/`, que es lo que ya
hace la intranet. Está anotado en `nginx/nginx.conf.template` y en
`3-seguridad-del-proyecto.md` §4.8.

> Relacionado con eso: `client_max_body_size` está en 10M y la política de subida
> admite documentos de hasta 50 MB. Hoy nginx cortaría antes. Hay que igualar los dos
> números en la dirección que se decida.

---

## Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd OLO-proyect
```

---

## Paso 2: Configurar Variables de Entorno

```bash
# Copiar la plantilla
cp .env.example .env

# Editar con tus valores
nano .env
```

**Variables obligatorias a cambiar:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SITIO_WEB_DOMAIN` | Dominio del sitio público | `tusitio.com` |
| `INTRANET_DOMAIN` | Dominio de la intranet | `admin.tusitio.com` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `MiContraseña123!` |
| `REDIS_PASSWORD` | Contraseña de Redis | `RedisSecret456!` |
| `JWT_SECRET` | Secreto JWT (generar nuevo) | `openssl rand -hex 32` |
| `REVALIDAR_SECRET` | Secreto de revalidación de caché (generar nuevo) | `openssl rand -hex 32` |
| `LOCAL_AUTH_EMAIL` | Email del superadmin | `admin@tusitio.com` |
| `LOCAL_AUTH_PASSWORD` | Password del superadmin | `AdminSeguro789!` |

**Generar secrets seguros:**
```bash
# Ejecutar una vez por cada secreto: JWT_SECRET y REVALIDAR_SECRET
openssl rand -hex 32
```

`REVALIDAR_SECRET` debe ser **propio, no una copia de `JWT_SECRET`**. Es lo que autentica
la llamada con la que la API le pide al sitio que tire su caché al aprobar una página
(guía §3.4). Separarlos limita el daño: si se filtra, sirve para vaciar caché y nada más.

`docker-compose` lo inyecta a los contenedores `api-backend` y `sitio-web`, que es donde
lo leen. En desarrollo, sin Docker, cada aplicación lo toma de su propia carpeta:
`api-backend/.env` y `sitio-web/.env.local` — con el mismo valor en las dos.

### Las dos variables de revalidación que no van en el `.env` de la raíz

El compose las escribe él mismo porque su valor depende de la topología, no de una
decisión de quien despliega:

| Variable | Quién la pone | Qué es |
|---|---|---|
| `SITIO_WEB_URL` | `docker-compose*.yml`, fija a `http://sitio-web:3000` | La dirección por la que **la API** alcanza al sitio desde dentro de la red de Docker. **No es `FRONTEND_URL`**: esa es la URL pública, la que el navegador usa y que sirve de origen CORS. Confundirlas hace que la API se llame a sí misma o salga a internet para hablar con el contenedor de al lado |
| `INTRANET_REVALIDAR_URL` | nadie, vacía a propósito | La intranet no guarda contenido publicado en la caché de Next, así que allí no hay nada que revalidar y con vaciar Redis basta. El oyente ve el hueco y no llama. El día que alguna de sus páginas pase a ISR, se define esta variable y empieza a funcionar sin tocar código |

### Documentación de la API (Swagger)

La API publica su propia documentación en dos formas:

| Dirección | Qué es |
|---|---|
| `/api/docs` | Swagger UI. Se lee y además se **prueban** los endpoints desde el navegador |
| `/api/docs.json` | El documento OpenAPI 3.0 crudo, para Postman, Insomnia o generadores de cliente |

| Variable | Por defecto | Qué hace |
|---|---|---|
| `SWAGGER_HABILITADO` | encendida fuera de producción, **apagada en producción** | `true` la enciende en producción; `false` la apaga en cualquier entorno |
| `SWAGGER_RUTA` | `/api/docs` | Cambia el punto de montaje si esa ruta choca con algo |

**Por qué está apagada en producción por defecto.** El documento describe la superficie
entera: cada ruta, cada parámetro, qué permiso exige y qué cuerpo acepta. Publicarla no
abre ningún endpoint que no estuviera ya abierto —la autorización sigue viviendo en los
middlewares y Swagger UI es un cliente HTTP más—, pero le ahorra a quien busque huecos el
trabajo de enumerarlos. Detrás de una VPN o de una autenticación de nginx, encenderla es
una decisión razonable; por eso se deja la puerta en vez de apagarla de raíz.

**Un aviso para el día que alguien toque `tsconfig.json`.** Las descripciones salen de
comentarios `@openapi` en `src/routes/*.ts`, y sobreviven a la compilación porque
`removeComments` está desactivado. Si se activa, `/api/docs` seguirá respondiendo pero
saldrá **vacío en producción y lleno en desarrollo**, que es el peor síntoma posible. El
arranque avisa por consola cuando el documento se queda sin rutas.

**Nginx no necesita nada.** La documentación cuelga del mismo prefijo `/api` que ya se
enruta a la API, así que no hay que añadir un `location`. Para cerrarla solo en el borde
—dejándola disponible desde dentro— basta con denegar `/api/docs` en la configuración del
proxy.

---

## Paso 3: Configurar DNS

Agregar registros DNS en tu proveedor:

```
A  tusitio.com        -> IP_DEL_SERVIDOR
A  admin.tusitio.com  -> IP_DEL_SERVIDOR
```

---

## Paso 4: Construir y Ejecutar

```bash
# Construir imágenes
./deploy.sh setup

# Ejecutar en segundo plano
./deploy.sh start
```

`setup` comprueba que Docker esté instalado y arrancado, crea el `.env` desde la
plantilla si no existe, **genera solo** los secretos que no dependen de nada externo
(`JWT_SECRET`, `REVALIDAR_SECRET`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`) y avisa de
lo que falte por rellenar a mano. Solo rellena lo que esté vacío: si ya hay valor, lo
respeta — regenerar la contraseña de Postgres cuando la base ya está inicializada
dejaría a la pila sin poder conectarse a sus propios datos.

Los comandos equivalentes con `docker compose` directamente siguen funcionando, pero
se saltan esas comprobaciones.

---

## Paso 5: Configurar SSL con Let's Encrypt

```bash
# Una ejecución por dominio
./deploy.sh ssl tusitio.com       tu@email.com www.tusitio.com
./deploy.sh ssl admin.tusitio.com tu@email.com
```

El tercer argumento en adelante son dominios extra que van como SAN del mismo
certificado. Es opcional: si `www` no está en el DNS, no lo pases — certbot falla
entero si no puede validar alguno de los que le nombres.

**Renovación.** Los certificados de Let's Encrypt caducan a los 90 días:

```bash
./deploy.sh renovar
```

Conviene dejarlo en cron, por ejemplo los lunes a las 3 de la mañana:

```
0 3 * * 1 cd /ruta/al/proyecto && ./deploy.sh renovar >> /var/log/olo-ssl.log 2>&1
```

---

## Paso 6: Aplicar las migraciones

**El esquema lo definen las migraciones, nunca el arranque.** `server.ts` comprueba que
no haya ninguna pendiente y **aborta si las hay**, con el nombre de las que faltan. Es
deliberado: un servidor que arranca contra un esquema viejo falla más tarde y de formas
mucho más difíciles de leer que un mensaje al inicio.

La consecuencia práctica es que sobre una base nueva la API entra en bucle de reinicio
hasta que alguien migre. Y hoy **no se puede migrar desde el contenedor**: `npm run
migrate` es `ts-node scripts/migrate.ts`, y la imagen final se construye con `npm ci
--omit=dev` (sin `ts-node`) y solo copia `dist/` (sin `scripts/`).

Hasta que eso se resuelva, la migración se ejecuta desde fuera, con la base publicada o
por un túnel:

```bash
cd api-backend
DATABASE_URL='postgresql://usuario:clave@host:5432/olo_db' npm run migrate
DATABASE_URL='…' npm run migrate:status   # qué se aplicó y qué falta
DATABASE_URL='…' npm run db:verificar     # los 20 modelos contra las columnas reales
```

`db:verificar` **no es opcional después de migrar**: el puente entre el atributo del
modelo y el nombre de la columna son cadenas de texto que ningún compilador valida, y
este script contrasta cada una contra `information_schema` y falla nombrando la que no
cuadre.

Tres formas razonables de cerrar el hueco, por si se decide arreglarlo de raíz:
compilar también `scripts/` y llamarlo con `node`; añadir una etapa de la imagen que
conserve las dependencias de desarrollo solo para migrar; o un contenedor de un solo
uso que corra antes que la API, como ya se hace con certbot.

Después de migrar, `docker compose -f docker-compose.prod.yml restart api-backend`.

### La siembra de permisos es aparte, y nada obliga a correrla

`npm run sembrar:permisos` reconcilia la tabla `permisos` con el catálogo del código.
A diferencia de las migraciones, **el arranque no la exige**, así que se puede olvidar
sin que nada avise. Por eso los permisos que estrenan una funcionalidad
(`secciones.crear`, `secciones.eliminar`) entran por migración además de por el
sembrador: sin eso, la API pediría un permiso que no existe en la tabla y el botón no
le aparecería a nadie, sin un solo error en ningún log.

Cuidado al tocar ese script: **borra las claves que no estén en el catálogo** y revoca
las que no estén en `PERMISOS_POR_ROL`. Las claves de secciones creadas desde el editor
están exentas mientras su página exista — romper esa exención deja sin permisos a todo
lo que se haya creado en caliente.

---

## Paso 7: Verificar

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Verificar servicios
docker compose -f docker-compose.prod.yml ps
```

Acceder:
- Sitio web: `https://tusitio.com`
- Intranet: `https://admin.tusitio.com`

---

## Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f [servicio]

# Reiniciar un servicio
docker compose -f docker-compose.prod.yml restart [servicio]

# Detener todo
docker compose -f docker-compose.prod.yml down

# Actualizar (después de git pull)
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Backup de base de datos
./deploy.sh backup

# Restaurar backup
./deploy.sh restore backup_olo_db_20260821_143000.sql
```

`backup` y `restore` leen el usuario y la base del `.env`. No los escribas a mano en el
comando: estaban fijos a `olo_user`/`olo_db`, y en cuanto alguien cambia
`POSTGRES_USER` eso falla — o peor, vuelca una base distinta de la que la aplicación
está usando.

---

## Estructura de Archivos

```
OLO-proyect/
├── docker-compose.yml          # Desarrollo: puertos publicados, sin nginx ni SSL
├── docker-compose.prod.yml     # Producción: nginx + certbot, nada publicado salvo 80/443
├── .env.example                # Plantilla de variables
├── .env                        # Variables reales (NO commitear)
├── deploy.sh                   # Envoltorio de docker compose con las comprobaciones
├── init-ssl.sh                 # Certificado provisional para que nginx pueda arrancar
├── nginx/
│   └── nginx.conf.template     # Plantilla Nginx (envsubst al arrancar)
├── packages/                   # Siete paquetes @olo/* que los tres proyectos comparten
├── api-backend/                # API (:4000) — la única puerta a los datos
├── sitio-web/                  # Sitio público (:3000) + panel de administración
└── intranet/                   # Intranet de directores y subdirectores (:3001)
```

**Los `packages/` importan para el despliegue** y es fácil pasarlos por alto: los tres
proyectos los declaran como `file:../packages/…`, así que tienen que estar dentro del
contexto de build antes de `npm ci`. Es el punto 1 de los desalineamientos de arriba.

### La pila de desarrollo

El mismo script sirve para levantar todo sin nginx ni SSL, con los puertos publicados
directamente (`5432`, `6379`, `3000`, `3001`, `4000`):

```bash
COMPOSE_FILE=docker-compose.yml ./deploy.sh start
```

Esa variante no pide dominios ni contraseña de Redis —solo `docker-compose.prod.yml`
monta nginx— y sí admite las variables `LOCAL_AUTH_*` de la cuenta maestra, que la API
desactiva sola cuando `NODE_ENV=production`.

---

## Solución de Problemas

### Los contenedores no inician
```bash
docker compose -f docker-compose.prod.yml logs [servicio]
```

### `api-backend` se reinicia una y otra vez

Mirar el log antes de suponer nada: la API dice en claro por qué se rinde.

- `Hay N migración(es) sin aplicar: …` → es el paso 6. No es un fallo de conexión ni de
  credenciales; la base está bien y el esquema es viejo.
- Falta `JWT_SECRET` → la API aborta a propósito en vez de arrancar con un secreto por
  defecto, que sería mucho peor.
- Conecta y luego muere sin mensaje → suele ser Postgres todavía inicializando. El
  compose ya espera por `service_healthy`, así que si pasa, revisar el healthcheck.

Y si arranca bien pero nginx da 502, acordate del punto 5 de arriba: la API escucha en
`127.0.0.1`, que dentro del contenedor no es alcanzable desde otro servicio.

### Aprobar una página no cambia lo que se ve

Primero, comprobar que de verdad se publicó: en la base, la versión tiene que estar en
`publicado` y `paginas.version_publicada_id` apuntando a ella. Si eso está bien, lo que
falla es la invalidación, y hay tres eslabones:

1. **`REVALIDAR_SECRET` con el mismo valor en la API y en el sitio.** Si al sitio le
   falta, `POST /api/revalidar` responde 503 y lo dice; si no coinciden, 401. En el log
   de la API aparece el aviso del oyente.
2. **`SITIO_WEB_URL` apuntando al servicio**, no al dominio público ni a `localhost`.
3. **Redis en pie.** Con Redis caído la invalidación devuelve 0 sin lanzar — no es un
   fallo de la publicación, pero la respuesta cacheada sobrevive lo que diga su TTL.

Sin ninguno de los tres la publicación sigue siendo correcta: lo único que se pierde es
la inmediatez, y el cambio aparece cuando caduque la caché por tiempo.

### Error de SSL
Los certificados ya no viven en `nginx/ssl/` sino en el volumen `certbot_conf`, que es
donde los escribe certbot y de donde nginx los lee:

```bash
# Verificar qué certificados hay emitidos
docker compose -f docker-compose.prod.yml run --rm --entrypoint sh certbot -c "ls -la /etc/letsencrypt/live/"

# Regenerar los de un dominio
./deploy.sh ssl tusitio.com tu@email.com
```

Si nginx se reinicia en bucle nada más levantar la pila, casi siempre es que aún no hay
certificado: `ssl_certificate` apunta a un archivo inexistente y nginx aborta el
arranque. `./deploy.sh ssl` lo resuelve — emite primero uno provisional autofirmado
justo para que nginx pueda arrancar y responder al reto de Let's Encrypt.

### Base de datos no conecta
```bash
# Verificar estado (usuario y base salen del .env)
docker compose -f docker-compose.prod.yml exec db \
  pg_isready -U "$(grep '^POSTGRES_USER=' .env | cut -d= -f2)" \
             -d "$(grep '^POSTGRES_DB=' .env | cut -d= -f2)"
```

### Puerto 80/443 ocupado
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :80
sudo lsof -i :443
```
