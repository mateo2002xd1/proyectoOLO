#!/bin/bash
# Script de despliegue rápido para pruebas en servidor local
# Uso: ./deploy.sh [comando]

set -e

COMPOSE_FILE="docker-compose.prod.yml"

show_help() {
    echo "============================================"
    echo "  OLO Proyect - Script de Despliegue"
    echo "============================================"
    echo ""
    echo "Uso: ./deploy.sh [comando]"
    echo ""
    echo "Comandos:"
    echo "  setup     - Primera configuración (copiar .env, construir)"
    echo "  start     - Iniciar todos los servicios"
    echo "  stop      - Detener todos los servicios"
    echo "  restart   - Reiniciar todos los servicios"
    echo "  logs      - Ver logs en tiempo real"
    echo "  status    - Ver estado de los servicios"
    echo "  build     - Reconstruir imágenes"
    echo "  backup    - Backup de la base de datos"
    echo "  restore   - Restaurar backup (uso: ./deploy.sh restore backup.sql)"
    echo "  ssl       - Configurar SSL (uso: ./deploy.sh ssl dominio.com email@dominio.com)"
    echo "  help      - Mostrar esta ayuda"
    echo ""
}

setup() {
    echo "=== Configuración inicial ==="
    
    if [ ! -f .env ]; then
        echo "Copiando .env.example a .env..."
        cp .env.example .env
        echo "Archivo .env creado"
        echo ""
        echo "IMPORTANTE: Edita el archivo .env con tus valores antes de continuar"
        echo "nano .env"
        exit 0
    else
        echo "Archivo .env ya existe"
    fi
    
    echo ""
    echo "=== Construyendo imágenes ==="
    docker compose -f $COMPOSE_FILE build
    
    echo ""
    echo "=== Setup completado ==="
    echo "Ejecuta: ./deploy.sh start"
}

start() {
    echo "=== Iniciando servicios ==="
    docker compose -f $COMPOSE_FILE up -d
    echo ""
    echo "Servicios iniciados. Verifica con: ./deploy.sh status"
}

stop() {
    echo "=== Deteniendo servicios ==="
    docker compose -f $COMPOSE_FILE down
}

restart() {
    echo "=== Reiniciando servicios ==="
    docker compose -f $COMPOSE_FILE restart
}

logs() {
    docker compose -f $COMPOSE_FILE logs -f
}

status() {
    docker compose -f $COMPOSE_FILE ps
}

build() {
    echo "=== Reconstruyendo imágenes ==="
    docker compose -f $COMPOSE_FILE build --no-cache
    echo ""
    echo "Imágenes reconstruidas. Ejecuta: ./deploy.sh restart"
}

backup() {
    DATE=$(date +%Y%m%d_%H%M%S)
    FILE="backup_olo_${DATE}.sql"
    echo "=== Creando backup: $FILE ==="
    docker compose -f $COMPOSE_FILE exec -T db pg_dump -U olo_user olo_db > $FILE
    echo "✓ Backup guardado en: $FILE"
}

restore() {
    if [ -z "$1" ]; then
        echo "Error: Especifica el archivo de backup"
        echo "Uso: ./deploy.sh restore backup.sql"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        echo "Error: No se encontró el archivo $1"
        exit 1
    fi
    
    echo "=== Restaurando backup: $1 ==="
    echo "Esto sobrescribirá la base de datos actual"
    read -p "¿Continuar? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        docker compose -f $COMPOSE_FILE exec -T db psql -U olo_user olo_db < $1
        echo "✓ Backup restaurado"
    else
        echo "Cancelado"
    fi
}

ssl() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "Uso: ./deploy.sh ssl <dominio> <email>"
        echo "Ejemplo: ./deploy.sh ssl tusitio.com admin@tusitio.com"
        exit 1
    fi
    
    ./init-ssl.sh "$1" "$2"
}

# Main
case "$1" in
    setup)   setup ;;
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    logs)    logs ;;
    status)  status ;;
    build)   build ;;
    backup)  backup ;;
    restore) restore "$2" ;;
    ssl)     ssl "$2" "$3" ;;
    help|*)  show_help ;;
esac
