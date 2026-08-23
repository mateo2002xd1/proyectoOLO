# Guía de Despliegue - OLO Proyect

## Requisitos previos

- Docker y Docker Compose instalados
- Un dominio configurado (ej: `tusitio.com`)
- Acceso SSH al servidor
- Puertos 80 y 443 abiertos

> Ruta Docker verificada de punta a punta el 2026-08-23: build limpio de las 4 imágenes
> y `./deploy.sh start` completo (migraciones, verificación de esquema, permisos,
> servicios arriba).

---

## Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd OLO-proyect
```

---

## Paso 2: Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Completar a mano:

| Variable | Ejemplo |
|---|---|
| `POSTGRES_DB` | `olo_db` |
| `POSTGRES_USER` | `olo_user` |
| `SITIO_WEB_DOMAIN` | `tusitio.com` |
| `INTRANET_DOMAIN` | `admin.tusitio.com` |
| `LOCAL_AUTH_EMAIL` / `LOCAL_AUTH_PASSWORD` | solo para el modo desarrollo (ver Nota) |

> **Nota — no completar a mano:** `POSTGRES_PASSWORD`, `JWT_SECRET`, `REVALIDAR_SECRET`
> y `REDIS_PASSWORD` se dejan vacíos; `./deploy.sh setup` (paso 4) los genera solo la
> primera vez. `REVALIDAR_SECRET` debe ser distinto de `JWT_SECRET` a propósito: si se
> filtra, solo sirve para vaciar caché, no para firmar sesiones.

> **Nota — API docs:** la API expone Swagger en `/api/docs` (apagado por defecto en
> producción). Se enciende con `SWAGGER_HABILITADO=true` si hace falta, por ejemplo
> detrás de una VPN.

---

## Paso 3: Configurar DNS

```
A  tusitio.com        -> IP_DEL_SERVIDOR
A  admin.tusitio.com  -> IP_DEL_SERVIDOR
```

---

## Paso 4: Construir y ejecutar

```bash
./deploy.sh setup   # genera secretos faltantes y construye las imágenes
./deploy.sh start   # migra, verifica el esquema, sincroniza permisos y levanta todo
```

> **Nota:** `start` ya encadena migraciones + verificación de esquema + sincronización
> de permisos automáticamente. No hace falta ningún paso manual aparte; `./deploy.sh
> migrar` queda disponible solo para cuando se quiere migrar sin reiniciar la pila.

---

## Paso 5: Configurar SSL con Let's Encrypt

```bash
./deploy.sh ssl tusitio.com       tu@email.com www.tusitio.com
./deploy.sh ssl admin.tusitio.com tu@email.com
```

> **Nota:** los dominios extra (SAN) son opcionales — si `www` no está en el DNS, no lo
> pases, o certbot falla entero.

Renovación (los certificados caducan a los 90 días):

```bash
./deploy.sh renovar
```

```bash
# Cron sugerido: lunes 3am
0 3 * * 1 cd /ruta/al/proyecto && ./deploy.sh renovar >> /var/log/olo-ssl.log 2>&1
```

---

## Paso 6: Sembrar contenido y crear el administrador

```bash
./deploy.sh sembrar        # roles, permisos y contenido inicial
./deploy.sh crear-admin    # primera cuenta de Superadmin
```

> **Nota:** `sembrar` no crea usuarios — una instalación nueva nace con la tabla de
> usuarios vacía a propósito. `crear-admin` exige justamente eso, y es la única forma de
> dar de alta la primera cuenta.

---

## Paso 7: Verificar

```bash
./deploy.sh status
```

Contenedores esperados: `db`, `api`, `sitio-web`, `intranet` (proyecto Compose
`olo-app`). Con nombre fijo, no hace falta averiguar el nombre completo:

```bash
docker logs -f api
docker exec -it db psql -U "$(grep '^POSTGRES_USER=' .env | cut -d= -f2)"
```

Acceder:
- Sitio web: `https://tusitio.com`
- Intranet: `https://admin.tusitio.com`

---

## Comandos útiles

```bash
docker compose -f docker-compose.prod.yml logs -f [servicio]     # logs en vivo
docker compose -f docker-compose.prod.yml restart [servicio]     # reiniciar uno
docker compose -f docker-compose.prod.yml down                   # detener todo

# Actualizar (después de git pull)
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

./deploy.sh backup                                  # backup de la base
./deploy.sh restore backup_olo_db_20260821_143000.sql
```

> **Nota:** `backup`/`restore` leen usuario y base del `.env` — no los escribas a mano,
> falla o vuelca la base equivocada si `POSTGRES_USER`/`POSTGRES_DB` cambiaron.

### Pila de desarrollo (sin nginx ni SSL)

```bash
COMPOSE_FILE=docker-compose.yml ./deploy.sh start
```

Publica los puertos directo en `localhost` (3000, 3001, 4000, 5432, 6379) y admite las
variables `LOCAL_AUTH_*` de la cuenta maestra (la API las desactiva sola en producción).

---

## Estructura de archivos

```
OLO-proyect/
├── docker-compose.yml          # Desarrollo: puertos publicados, sin nginx ni SSL
├── docker-compose.prod.yml     # Producción: nginx + certbot, nada publicado salvo 80/443
├── .env.example / .env         # Plantilla / variables reales (NO commitear)
├── deploy.sh                   # Envoltorio de docker compose con las comprobaciones
├── init-ssl.sh                 # Certificado provisional para que nginx pueda arrancar
├── nginx/nginx.conf.template   # Plantilla Nginx (envsubst al arrancar)
├── packages/                   # Siete paquetes @olo/* compartidos por las tres apps
├── api-backend/                # API (:4000) — la única puerta a los datos
├── sitio-web/                  # Sitio público (:3000) + panel de administración
└── intranet/                   # Intranet de directores y subdirectores (:3001)
```

> **Nota:** `packages/` tiene que estar dentro del contexto de build (los tres
> proyectos lo declaran como `file:../packages/…`) — ya está resuelto en los Dockerfiles,
> no requiere acción.

---

## Solución de problemas

### Los contenedores no inician
```bash
docker compose -f docker-compose.prod.yml logs [servicio]
```

### `api` se reinicia una y otra vez
- `Hay N migración(es) sin aplicar` → correr `./deploy.sh migrar`.
- Falta `JWT_SECRET` → la API aborta a propósito en vez de arrancar con un secreto por
  defecto.
- Conecta y muere sin mensaje → Postgres aún inicializando; el compose ya espera por
  `service_healthy`.
- nginx da 502 → revisar que `api` escuche en `0.0.0.0`, no en `127.0.0.1`.

### Aprobar una página no cambia lo que se ve
1. **`REVALIDAR_SECRET`** con el mismo valor en la API y en el sitio. Si al sitio le
   falta, `POST /api/revalidar` responde 503; si no coincide, 401.
2. **`SITIO_WEB_URL`** apuntando al servicio (`http://sitio-web:3000`), no al dominio
   público ni a `localhost` — la fija el propio compose, no requiere acción.
3. **Redis en pie.** Si está caído, la invalidación no falla pero tampoco hace nada.

### Error de SSL
Los certificados viven en el volumen `certbot_conf`, no en `nginx/ssl/`:
```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint sh certbot -c "ls -la /etc/letsencrypt/live/"
./deploy.sh ssl tusitio.com tu@email.com   # regenerar
```
Si nginx reinicia en bucle al levantar la pila, casi siempre falta certificado —
`./deploy.sh ssl` lo resuelve.

### Base de datos no conecta
```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_isready -U "$(grep '^POSTGRES_USER=' .env | cut -d= -f2)" \
             -d "$(grep '^POSTGRES_DB=' .env | cut -d= -f2)"
```

### Puerto 80/443 ocupado
```bash
sudo lsof -i :80
sudo lsof -i :443
```
