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
| `LOCAL_AUTH_EMAIL` | Email del superadmin | `admin@tusitio.com` |
| `LOCAL_AUTH_PASSWORD` | Password del superadmin | `AdminSeguro789!` |

**Generar secrets seguros:**
```bash
# Ejecutar dos veces para generar ambos secrets
openssl rand -hex 32
```

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
docker compose -f docker-compose.prod.yml build

# Ejecutar en segundo plano
docker compose -f docker-compose.prod.yml up -d
```

---

## Paso 5: Configurar SSL con Let's Encrypt

```bash
# Dar permisos al script
chmod +x init-ssl.sh

# Ejecutar para cada dominio
./init-ssl.sh tusitio.com tu@email.com
./init-ssl.sh admin.tusitio.com tu@email.com
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
docker compose -f docker-compose.prod.yml exec db pg_dump -U olo_user olo_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose -f docker-compose.prod.yml exec -T db psql -U olo_user olo_db < backup.sql
```

---

## Estructura de Archivos

```
OLO-proyect/
├── docker-compose.yml          # Desarrollo
├── docker-compose.prod.yml     # Producción
├── .env.example                # Plantilla de variables
├── .env                        # Variables reales (NO commitear)
├── nginx/
│   ├── nginx.conf              # Configuración Nginx
│   └── ssl/                    # Certificados SSL
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
```bash
# Verificar certificados
ls -la nginx/ssl/

# Regenerar certificados
./init-ssl.sh tusitio.com tu@email.com
```

### Base de datos no conecta
```bash
# Verificar estado
docker compose -f docker-compose.prod.yml exec db pg_isready -U olo_user -d olo_db
```

### Puerto 80/443 ocupado
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :80
sudo lsof -i :443
```
