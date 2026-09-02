#!/usr/bin/env bash
# Emite el certificado SSL de un dominio con Let's Encrypt.
# Uso: ./docker/init-ssl.sh <dominio> <email> [dominio-extra ...]
#
# Ejecutar una vez por dominio despues del primer despliegue. El sitio y la intranet
# tienen dominios distintos, asi que son dos ejecuciones:
#
#   ./docker/init-ssl.sh tusitio.com    admin@tusitio.com www.tusitio.com
#   ./docker/init-ssl.sh admin.tusitio.com admin@tusitio.com
#
# Para renovar despues: ./docker/deploy.sh renovar
#
# Normalmente lo invoca `./docker/deploy.sh ssl ...`, no directamente -- pero funciona
# igual a mano, desde la raiz o desde dentro de `docker/`: ver el `cd` de abajo.

set -Eeuo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-docker/docker-compose.prod.yml}"

DOMINIO="${1:-}"
EMAIL="${2:-}"

if [ -z "$DOMINIO" ] || [ -z "$EMAIL" ]; then
    echo "Uso: ./docker/init-ssl.sh <dominio> <email> [dominio-extra ...]"
    echo "Ejemplo: ./docker/init-ssl.sh tusitio.com admin@tusitio.com www.tusitio.com"
    exit 1
fi

shift 2
# Los dominios extra van como SAN del mismo certificado. Van sueltos y no fijos a
# `www.$DOMINIO` como antes: si `www` no resuelve en el DNS, certbot falla entero y no
# emite nada, ni siquiera para el dominio principal que si estaba bien configurado.
ARGUMENTOS_DOMINIOS=(-d "$DOMINIO")
for extra in "$@"; do
    ARGUMENTOS_DOMINIOS+=(-d "$extra")
done

verde() { printf '\033[0;32m%s\033[0m\n' "$*"; }
aviso() { printf '\033[0;33m%s\033[0m\n' "$*"; }

# MSYS_NO_PATHCONV: en Git Bash, rutas como /etc/letsencrypt/... llegarian a Docker
# convertidas a C:/Program Files/Git/etc/letsencrypt/... Son rutas del contenedor, y
# aqui hay muchas. `-T` evita que Docker pida un TTY que MinTTY no concede.
# `--project-directory .` y `--env-file .env`: el compose vive en `docker/`, pero sus
# rutas relativas y sus `${VAR}` (los dominios de nginx, entre otros) estan pensados
# para resolverse contra la raiz -- ver el mismo punto en `deploy.sh`.
componer() { MSYS_NO_PATHCONV=1 docker compose --project-directory . --env-file .env -f "$COMPOSE_FILE" "$@"; }

RUTA_CERT="/etc/letsencrypt/live/$DOMINIO"

echo "=== Certificado SSL para $DOMINIO ==="

# --- 1. Certificado provisional --------------------------------------------
#
# El pez que se muerde la cola: nginx aborta el arranque si `ssl_certificate` apunta a
# un archivo que no existe, pero certbot necesita que nginx este sirviendo para
# responder al reto de `/.well-known/acme-challenge/`. Se rompe poniendo un
# autofirmado de un dia: no vale para nadie, pero deja a nginx levantar.
echo ""
echo "[1/4] Certificado provisional (para que nginx pueda arrancar)..."
componer run --rm -T --entrypoint sh certbot -c "
  if [ ! -f $RUTA_CERT/fullchain.pem ]; then
    mkdir -p $RUTA_CERT
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout $RUTA_CERT/privkey.pem \
      -out $RUTA_CERT/fullchain.pem \
      -subj '/CN=$DOMINIO'
    echo 'Provisional creado.'
  else
    echo 'Ya existe un certificado, se conserva.'
  fi
"

# --- 2. nginx arriba --------------------------------------------------------
echo ""
echo "[2/4] Levantando nginx..."
componer up -d nginx

# --- 3. Certificado real ----------------------------------------------------
#
# Se borra antes el provisional: certbot se niega a escribir sobre un directorio de
# `live/` que no reconoce como linaje suyo, y el autofirmado del paso 1 no lo es.
# nginx no se entera del borrado porque solo lee los certificados al arrancar o al
# recargar: sigue sirviendo el provisional en memoria hasta el paso 4.
echo ""
echo "[3/4] Solicitando certificado real a Let's Encrypt..."
componer run --rm -T --entrypoint sh certbot -c "
  rm -rf $RUTA_CERT /etc/letsencrypt/archive/$DOMINIO /etc/letsencrypt/renewal/$DOMINIO.conf
"

componer run --rm -T certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    "${ARGUMENTOS_DOMINIOS[@]}"

# --- 4. Recargar ------------------------------------------------------------
echo ""
echo "[4/4] Recargando nginx con el certificado definitivo..."
componer exec -T nginx nginx -s reload

echo ""
verde "Listo. SSL configurado para $DOMINIO"
aviso "Recuerda: el certificado caduca a los 90 dias. Renueva con ./docker/deploy.sh renovar"
aviso "(o programalo en cron: 0 3 * * 1 cd $(pwd) && ./docker/deploy.sh renovar)"
