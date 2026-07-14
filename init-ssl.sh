#!/bin/bash
# Script para obtener certificados SSL con Let's Encrypt
# Ejecutar una sola vez después del primer despliegue

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Uso: ./init-ssl.sh <dominio> <email>"
    echo "Ejemplo: ./init-ssl.sh tusitio.com admin@tusitio.com"
    exit 1
fi

echo "Obteniendo certificado SSL para $DOMAIN..."

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

echo "Certificado obtenido. Reiniciando Nginx..."
docker compose -f docker-compose.prod.yml restart nginx

echo "¡Listo! SSL configurado para $DOMAIN"
