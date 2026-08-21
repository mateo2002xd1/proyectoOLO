# Guía de Despliegue - OLO Proyect

## Requisitos Previos

- Docker y Docker Compose instalados
- Un dominio configurado (ej: `tusitio.com`)
- Acceso SSH al servidor
- Puertos 80 y 443 abiertos

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

## Paso 6: Verificar

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
├── docker-compose.yml          # Desarrollo
├── docker-compose.prod.yml     # Producción
├── .env.example                # Plantilla de variables
├── .env                        # Variables reales (NO commitear)
├── nginx/
│   └── nginx.conf.template     # Plantilla Nginx (envsubst al arrancar)
├── api-backend/                # Backend API
├── sitio-web/                  # Sitio público
└── intranet/                   # Panel administrativo
```

---

## Solución de Problemas

### Los contenedores no inician
```bash
docker compose -f docker-compose.prod.yml logs [servicio]
```

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
